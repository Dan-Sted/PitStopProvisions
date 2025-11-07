import { useLocation } from 'react-router-dom';

const Confirmation = () => {
	const location = useLocation();

	const order = location && location.state && location.state.order;
	const payment = location && location.state && location.state.payment;
	const shipping = location && location.state && location.state.shipping;

	const confirmationNumber = 1234;

	// Calculate total price
	const totalPrice =
		order && order.items
			? order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
			: 0;

	return (
		<div className="min-h-screen bg-secondary-bg p-6">
			{/* confirmation*/}
			<div className="card card-centered">
				<h2 className="text-xl font-semibold text-primary-text mb-4">Order Confirmation</h2>
				<div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
					<div className="font-medium text-secondary-text" style={{ fontSize: '1.1rem' }}>
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

				<h3 className="text-lg font-semibold text-secondary-text mt-4">Items Purchased</h3>
				<ul style={{ paddingLeft: '1.2em' }}>
					{order && order.items && order.items.length > 0 ? (
						order.items.map((item, idx) => (
							<li key={idx} className="text-secondary-text">
								{item.name} {item.quantity ? `x${item.quantity}` : ''}{' '}
								{item.unit_price ? `- $${item.unit_price.toFixed(2)} each` : ''}
								{item.unit_price && item.quantity
									? ` (Subtotal: $${(item.unit_price * item.quantity).toFixed(2)})`
									: ''}
							</li>
						))
					) : (
						<li className="text-placeholder-color">No items found.</li>
					)}
				</ul>

				<div className="mt-4 flex justify-between items-center">
					<div className="text-secondary-text font-bold">Total Price</div>
					<div className="font-bold text-lg">${totalPrice.toFixed(2)}</div>
				</div>

				<h3 className="text-lg font-semibold text-secondary-text mt-4">Shipping Information</h3>
				<p className="text-secondary-text">{shipping.name}</p>
				<p className="text-secondary-text">{shipping.address}</p>
				<p className="text-secondary-text">{`${shipping.city}, ${shipping.state} ${shipping.zip}`}</p>

				<h3 className="text-lg font-semibold text-secondary-text mt-4">Payment Information</h3>
				<p className="text-secondary-text">{`Card ending in ${payment.cardNumber.slice(-4)}`}</p>
			</div>
		</div>
	);
};
export default Confirmation;
