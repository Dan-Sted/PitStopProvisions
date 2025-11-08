const { getPool } = require('./db');

function makeConfirmation() {
	return `CONF-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Note: inventory checks are performed via a single DB query below (no per-item Lambda invocation)

module.exports.createOrder = async (event) => {
	try {
		const body = JSON.parse(event.body || '{}');

		if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
			return {
				statusCode: 400,
				headers: { 'Access-Control-Allow-Origin': '*' },
				body: JSON.stringify({ error: 'Invalid items' }),
			};
		}

		// inventory function names are not required because we query the DB directly

		const insufficient = [];
		// keep fetched inventory items to use later when inserting line items
		const fetchedInventory = {};
		function extractAvailableQty(inv) {
			if (!inv) return 0;
			return Number(inv.available_quantity ?? inv.AVAILABLE_QUANTITY ?? 0);
		}

		// Fetch all requested items in a single DB query to avoid per-item lambda invocations
		const itemNumbers = body.items.map((it) => Number(it.id)).filter((v) => !Number.isNaN(v));
		if (itemNumbers.length === 0) {
			return {
				statusCode: 400,
				headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
				body: JSON.stringify({ error: 'Invalid item ids' }),
			};
		}

		const poolForCheck = await getPool();
		// Build placeholders for IN clause
		const placeholders = itemNumbers.map(() => '?').join(',');
		const [rows] = await poolForCheck.execute(
			`SELECT ITEM_NUMBER, ITEM_ID, NAME, AVAILABLE_QUANTITY, UNIT_PRICE FROM ITEM WHERE ITEM_NUMBER IN (${placeholders})`,
			itemNumbers
		);

		// Map rows by ITEM_NUMBER for quick lookup
		const rowsByNumber = {};
		for (const r of rows) {
			rowsByNumber[String(r.ITEM_NUMBER)] = {
				id: r.ITEM_ID,
				item_number: r.ITEM_NUMBER,
				name: r.NAME,
				available_quantity: r.AVAILABLE_QUANTITY,
				unit_price: r.UNIT_PRICE,
			};
		}

		// Now validate requested quantities
		for (const it of body.items) {
			const id = it.id;
			const qtyReq = Number(it.quantity || 0);
			const key = String(Number(id));
			const item = rowsByNumber[key];
			if (!item) {
				insufficient.push({ id, requested: qtyReq, available: 0 });
				continue;
			}
			const available = extractAvailableQty(item);
			fetchedInventory[id] = item;
			if (available < qtyReq) {
				insufficient.push({ id, requested: qtyReq, available });
			}
		}

		if (insufficient.length > 0) {
			return {
				statusCode: 409,
				headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
				body: JSON.stringify({ error: 'Insufficient quantity', items: insufficient }),
			};
		}

		// At this point inventory is available for requested quantities.
		// Now persist order, shipping, payment, and line items to the DB in a transaction.
		// Expecting body to include `payment` and `shipping` objects; shipping should include email and name.

		// Basic validation for shipping/payment
		const payment = body.payment || null;
		const shipping = body.shipping || null;
		if (!shipping || !payment) {
			return {
				statusCode: 400,
				headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
				body: JSON.stringify({ error: 'Missing payment or shipping information' }),
			};
		}

		const pool = await getPool();
		const conn = await pool.getConnection();
		try {
			await conn.beginTransaction();

			// Insert PAYMENT_INFO
			const [payRes] = await conn.execute(
				`INSERT INTO PAYMENT_INFO (HOLDER_NAME, CARD_NUM, EXP_DATE, CVV) VALUES (?, ?, ?, ?)`,
				[
					payment.cardholderName || null,
					payment.cardNumber || null,
					payment.expiration || null,
					payment.cvv || null,
				]
			);
			const paymentId = payRes.insertId;

			// Insert SHIPPING_INFO
			const [shipRes] = await conn.execute(
				`INSERT INTO SHIPPING_INFO (ADDRESS1, ADDRESS2, CITY, STATE, COUNTRY, POSTAL_CODE, EMAIL) VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[
					shipping.addressLine1 || null,
					shipping.addressLine2 || null,
					shipping.city || null,
					shipping.state || null,
					shipping.country || null,
					shipping.zip || null,
					shipping.email || null,
				]
			);
			const shippingId = shipRes.insertId;

			// Insert CUSTOMER_ORDER
			const customerName = shipping.name || payment.cardholderName || null;
			const customerEmail = shipping.email || null;
			const [orderRes] = await conn.execute(
				`INSERT INTO CUSTOMER_ORDER (CUSTOMER_NAME, CUSTOMER_EMAIL, SHIPPING_INFO_ID_FK, PAYMENT_INFO_ID_FK, STATUS) VALUES (?, ?, ?, ?, ?)`,
				[customerName, customerEmail, shippingId, paymentId, 'New']
			);
			const customerOrderId = orderRes.insertId;

			// Insert line items
			for (const it of body.items) {
				const id = it.id;
				const qty = Number(it.quantity || 0);
				const inv = fetchedInventory[id] || {};
				const itemName = inv.name || inv.NAME || inv.ItemName || inv.ITEM_NAME || null;
				// ITEM_NUMBER: use the numeric id if available
				const itemNumber = Number(id || 0);
				await conn.execute(
					`INSERT INTO CUSTOMER_ORDER_LINE_ITEM (ITEM_NUMBER, ITEM_NAME, QUANTITY, CUSTOMER_ORDER_ID_FK) VALUES (?, ?, ?, ?)`,
					[itemNumber, itemName, qty, customerOrderId]
				);
			}

			await conn.commit();
			conn.release();

			const confirmation = makeConfirmation();
			return {
				statusCode: 201,
				headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
				body: JSON.stringify({ confirmation, orderId: customerOrderId }),
			};
		} catch (dberr) {
			try {
				await conn.rollback();
			} catch (rerr) {
				console.error('rollback error', rerr);
			}
			conn.release();
			console.error('DB transaction error', dberr);
			return {
				statusCode: 500,
				headers: { 'Access-Control-Allow-Origin': '*' },
				body: JSON.stringify({ error: 'Database error' }),
			};
		}
	} catch (err) {
		console.error('createOrder error', err);
		return {
			statusCode: 500,
			headers: { 'Access-Control-Allow-Origin': '*' },
			body: JSON.stringify({ error: 'Internal error' }),
		};
	}
};
