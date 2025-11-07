// cdk/lib/inventory-stack.ts
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

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
			DB_NAME: 'PitStopProvisionsDB',
			DB_CONN_LIMIT: '10',
			INVENTORY_API: 'https://n1u3hvxmqf.execute-api.us-east-2.amazonaws.com/prod/inventory',
		};

		// Import the existing VPC where RDS lives using explicit attributes (no context lookup)
		const vpc = ec2.Vpc.fromVpcAttributes(this, 'ImportedVpc', {
			vpcId: 'vpc-01c503120d122e63b',
			availabilityZones: ['us-east-2a', 'us-east-2b', 'us-east-2c'],
			privateSubnetIds: [
				'subnet-006697ed8624de4bc',
				'subnet-037fc943f04e4fb85',
				'subnet-0a750ecf55bc10121',
			],
		});

		// Create a security group for Lambdas that will run in the VPC
		const lambdaSg = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
			vpc,
			allowAllOutbound: true,
			description: 'Security group for Lambda functions to access RDS',
		});

		// Import the RDS security group and allow Lambda SG to connect on 3306
		const rdsSg = ec2.SecurityGroup.fromSecurityGroupId(
			this,
			'RdsSecurityGroup',
			'sg-05d667f8402fa9f59'
		);
		rdsSg.addIngressRule(lambdaSg, ec2.Port.tcp(3306), 'Allow Lambda access to MySQL');

		// Subnet selection for Lambdas - prefer private subnets with egress
		const vpcSubnets = { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS };

		// Inventory list (list all / search)
		const inventoryList = new lambda.Function(this, 'InventoryListFn', {
			runtime: lambda.Runtime.NODEJS_18_X,
			handler: 'inventory-list.listItems',
			code: codeAsset,
			memorySize: 128,
			timeout: cdk.Duration.seconds(10),
			environment: commonEnv,
			vpc,
			vpcSubnets,
			securityGroups: [lambdaSg],
		});

		// Inventory get single item
		const inventoryGet = new lambda.Function(this, 'InventoryGetFn', {
			runtime: lambda.Runtime.NODEJS_18_X,
			handler: 'inventory-get-item.getItem',
			code: codeAsset,
			memorySize: 128,
			timeout: cdk.Duration.seconds(10),
			environment: commonEnv,
			vpc,
			vpcSubnets,
			securityGroups: [lambdaSg],
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
			vpc,
			vpcSubnets,
			securityGroups: [lambdaSg],
		});

		const order = api.root.addResource('order');
		order.addMethod('POST', new apigw.LambdaIntegration(orderCreate));

		// Grant the order lambda permission to invoke the inventory lambdas directly
		inventoryList.grantInvoke(orderCreate);
		inventoryGet.grantInvoke(orderCreate);
	}
}
