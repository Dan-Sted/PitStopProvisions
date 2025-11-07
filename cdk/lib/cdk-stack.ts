// cdk/lib/inventory-stack.ts
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class InventoryStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// code asset pointing at the serverless folder (contains the handler JS files)
		const codeAsset = lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'serverless'));

		// shared environment variables for all lambdas (keep as plain env vars for now)
		const commonEnv: { [k: string]: string } = {
			DB_HOST: 'pspdb.czy6kc8suww0.us-east-2.rds.amazonaws.com',
			DB_PORT: '3306',
			DB_USER: 'adminuser',
			DB_PASS: 'adminpass',
			DB_NAME: 'pspdb',
			DB_CONN_LIMIT: '10',
			INVENTORY_API: 'https://n1u3hvxmqf.execute-api.us-east-2.amazonaws.com/prod/inventory',
		};

		// Inventory list (list all / search)
		const inventoryList = new lambda.Function(this, 'InventoryListFn', {
			runtime: lambda.Runtime.NODEJS_18_X,
			handler: 'inventory-list.listItems',
			code: codeAsset,
			memorySize: 128,
			timeout: cdk.Duration.seconds(10),
			environment: commonEnv,
		});

		// Inventory get single item
		const inventoryGet = new lambda.Function(this, 'InventoryGetFn', {
			runtime: lambda.Runtime.NODEJS_18_X,
			handler: 'inventory-get-item.getItem',
			code: codeAsset,
			memorySize: 128,
			timeout: cdk.Duration.seconds(10),
			environment: commonEnv,
		});

		// Simple REST API using API Gateway (proxy mapping)
		const api = new apigw.RestApi(this, 'PitStopApi', {
			restApiName: 'PitStop Service',
			defaultCorsPreflightOptions: {
				allowOrigins: apigw.Cors.ALL_ORIGINS,
				allowMethods: apigw.Cors.ALL_METHODS, // GET, POST, OPTIONS, etc.
				allowHeaders: [
					'Content-Type',
					'X-Amz-Date',
					'Authorization',
					'X-Api-Key',
					'X-Amz-Security-Token',
				],
			},
		});

		// Ensure API Gateway returns CORS headers on gateway-generated 4XX/5XX responses
		// (API Gateway does not automatically add CORS headers to integration errors).
		api.addGatewayResponse('Default4xxCors', {
			type: apigw.ResponseType.DEFAULT_4XX,
			responseHeaders: {
				'Access-Control-Allow-Origin': "'*'",
				'Access-Control-Allow-Headers':
					"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
				'Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD'",
			},
		});

		api.addGatewayResponse('Default5xxCors', {
			type: apigw.ResponseType.DEFAULT_5XX,
			responseHeaders: {
				'Access-Control-Allow-Origin': "'*'",
				'Access-Control-Allow-Headers':
					"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
				'Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE,PATCH,HEAD'",
			},
		});
		const inv = api.root.addResource('inventory');
		inv.addMethod('GET', new apigw.LambdaIntegration(inventoryList));
		const items = inv.addResource('items');
		const item = items.addResource('{id}');
		item.addMethod('GET', new apigw.LambdaIntegration(inventoryGet));

		// Order create (will invoke inventory Lambdas directly)
		const orderCreate = new lambda.Function(this, 'OrderCreateFn', {
			runtime: lambda.Runtime.NODEJS_18_X,
			handler: 'order-reserve.createOrder',
			code: codeAsset,
			memorySize: 128,
			timeout: cdk.Duration.seconds(10),
			environment: {
				...commonEnv,
				INVENTORY_LIST_FUNCTION_NAME: inventoryList.functionName,
				INVENTORY_GET_FUNCTION_NAME: inventoryGet.functionName,
			},
		});

		const order = api.root.addResource('order');
		order.addMethod('POST', new apigw.LambdaIntegration(orderCreate));

		// Grant the order lambda permission to invoke the inventory lambdas directly
		inventoryList.grantInvoke(orderCreate);
		inventoryGet.grantInvoke(orderCreate);
	}
}
