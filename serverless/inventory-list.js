const { getPool } = require('./db');

// GET /inventory
module.exports.listItems = async (event) => {
	console.log('inventory.listItems invoked, event:', {
		path: event.path,
		queryStringParameters: event.queryStringParameters,
	});
	const startTs = Date.now();
	try {
		const query = event.queryStringParameters || {};
		const nameFilter = query.name ? String(query.name).toLowerCase() : null;

		const pool = await getPool();
		let sql = 'SELECT ID, ITEM_NUMBER, NAME, DESCRIPTION, AVAILABLE_QUANTITY, UNIT_PRICE FROM ITEM';
		const params = [];
		if (nameFilter) {
			sql += ' WHERE LOWER(NAME) LIKE ?';
			params.push(`%${nameFilter}%`);
		}
		sql += ' ORDER BY NAME LIMIT 100';

		const [rows] = await pool.execute(sql, params);

		const result = rows.map((r) => ({
			id: r.ID,
			item_number: r.ITEM_NUMBER,
			name: r.NAME,
			description: r.DESCRIPTION,
			available_quantity: r.AVAILABLE_QUANTITY,
			unit_price: r.UNIT_PRICE,
		}));

		return {
			statusCode: 200,
			headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
			body: JSON.stringify(result),
		};
	} catch (err) {
		console.error('inventory list error', err);
		return {
			statusCode: 500,
			headers: { 'Access-Control-Allow-Origin': '*' },
			body: JSON.stringify({ error: 'Internal error' }),
		};
	} finally {
		console.log('inventory.listItems duration_ms:', Date.now() - startTs);
	}
};
