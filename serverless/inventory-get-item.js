const { getPool } = require('./db');

// GET /inventory/items/{item_number}
module.exports.getItem = async (event) => {
	try {
		const itemNumber =
			(event.pathParameters && event.pathParameters.id) ||
			(event.queryStringParameters && event.queryStringParameters.id);

		if (!itemNumber) {
			return {
				statusCode: 400,
				headers: { 'Access-Control-Allow-Origin': '*' },
				body: JSON.stringify({ error: 'Missing id parameter' }),
			};
		}

		const pool = await getPool();
		const [rows] = await pool.execute(
			'SELECT ITEM_NUMBER, ITEM_ID, NAME, AVAILABLE_QUANTITY, UNIT_PRICE FROM ITEM WHERE ITEM_NUMBER = ? LIMIT 1',
			[itemNumber]
		);

		if (!rows || rows.length === 0) {
			return {
				statusCode: 404,
				headers: { 'Access-Control-Allow-Origin': '*' },
				body: JSON.stringify({ error: 'Not found' }),
			};
		}

		const r = rows[0];
		const item = {
			id: r.ITEM_ID,
			item_number: r.ITEM_NUMBER,
			name: r.NAME,
			available_quantity: r.AVAILABLE_QUANTITY,
			unit_price: r.UNIT_PRICE,
		};

		return {
			statusCode: 200,
			headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
			body: JSON.stringify(item),
		};
	} catch (err) {
		console.error('inventory getByItemNumber error', err);
		return {
			statusCode: 500,
			headers: { 'Access-Control-Allow-Origin': '*' },
			body: JSON.stringify({ error: 'Internal error' }),
		};
	}
};
