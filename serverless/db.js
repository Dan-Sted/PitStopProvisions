const mysql = require('mysql2/promise');

let pool = null;

async function getPool() {
	if (pool) return pool;

	const cfg = {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
		waitForConnections: true,
		connectionLimit: process.env.DB_CONN_LIMIT ? Number(process.env.DB_CONN_LIMIT) : 10,
		queueLimit: 0,
	};

	pool = mysql.createPool(cfg);
	console.log('Created MySQL pool (masked):', {
		host: cfg.host,
		port: cfg.port,
		user: cfg.user,
		database: cfg.database,
		connectionLimit: cfg.connectionLimit,
	});
	return pool;
}

module.exports = { getPool };
