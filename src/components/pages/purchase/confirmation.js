import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

const Confirmation = () => {
	const location = useLocation();

	const order = location && location.state && location.state.order;
	const payment = location && location.state && location.state.payment;
	const shipping = location && location.state && location.state.shipping;
	const email =
		(location && location.state && location.state.email) ||
		(shipping && (shipping.email || shipping.contactEmail)) ||
		'';

	// Get confirmation number from order response or generate a fallback
	const confirmationNumber = order?.orderId || order?.id || Math.floor(Math.random() * 1000000);

	// Get purchased items from the order state passed from viewOrder
	const purchasedItems = useMemo(() => {
		// The order response from API might have different structure
		// Check if we have items in the expected format
		if (order?.items && Array.isArray(order.items)) {
			return order.items;
		}
		// Fallback: try to reconstruct from other data if available
		return [];
	}, [order]);

	// Calculate total price from purchased items
	const totalPrice = purchasedItems.reduce((sum, item) => {
		const price = item.unit_price || item.price || 0;
		const quantity = item.quantity || item.qty || 0;
		return sum + price * quantity;
	}, 0);

	return (
		<div className="min-h-screen bg-secondary-bg p-6">
			{/* confirmation*/}
			<div className="card card-centered">
				<h2 className="text-primary-text text-xl font-semibold mb-8">Order Confirmation</h2>
				<div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
					<div className="font-medium text-primary-text" style={{ fontSize: '1.1rem' }}>
						Confirmation Number:
					</div>
					<div
						className="text-primary-text"
						style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}
					>
						{confirmationNumber}
					</div>
					<div className="text-primary-text" style={{ fontSize: '1.1rem' }}>
						Thank you for placing an order!
					</div>
				</div>

				<h3 className="text-lg font-semibold text-primary-text mt-4">Items Purchased</h3>
				<ul className="divide-y">
					{purchasedItems && purchasedItems.length > 0 ? (
						purchasedItems.map((item, idx) => {
							const unitPrice = item.unit_price;
							const qty = item.quantity;
							return (
								<li key={idx} className="py-3 flex justify-between items-center">
									<div>
										<div className="font-medium text-primary-text">{item.name}</div>
										<div className="text-sm text-secondary-text">
											${unitPrice.toFixed(2)} x {qty}
										</div>
									</div>
									<div className="text-sm text-secondary-text font-semibold">
										${(unitPrice * qty).toFixed(2)}
									</div>
								</li>
							);
						})
					) : (
						<li className="text-placeholder-color py-3">No items found.</li>
					)}
				</ul>

				<div className="mt-4 flex justify-between items-center">
					<div className="text-primary-text text-xl font-semibold">Total Price</div>
					<div className="text-primary-text text-xl font-semibold">${totalPrice.toFixed(2)}</div>
				</div>

				<h3 className="text-primary-text text-xl font-semibold mt-6">Shipping Information</h3>
				<p className="text-secondary-text">{shipping.name}</p>
				<p className="text-secondary-text">{shipping.addressLine1}</p>
				{shipping.addressLine2 && <p className="text-secondary-text">{shipping.addressLine2}</p>}
				<p className="text-secondary-text">{`${shipping.city}, ${shipping.state} ${shipping.zip}`}</p>
				{email ? <p className="text-secondary-text">Email: {email}</p> : null}

				<h3 className="text-primary-text text-xl font-semibold mt-6">Payment Information</h3>
				<p className="text-secondary-text">{`Card ending in ${payment.cardNumber.slice(-4)}`}</p>
			</div>
		</div>
	);
};
export default Confirmation;
