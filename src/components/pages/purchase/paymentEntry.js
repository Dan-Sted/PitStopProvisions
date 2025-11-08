import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getInventory } from '../../../services/api';

const PaymentEntry = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const [payment, setPayment] = useState({
		cardNumber: '',
		expiration: '',
		cvv: '',
		cardholderName: '',
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setPayment({ ...payment, [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		navigate('/purchase/shippingEntry', {
			state: { order: location.state.order, payment },
		});
	};

	const order = location && location.state && location.state.order;

	const [inventory, setInventory] = useState([]);

	useEffect(() => {
		const fetch = async () => {
			try {
				const data = await getInventory();
				setInventory(data);
			} catch (err) {
				console.error('Failed to load inventory in paymentEntry', err);
			}
		};
		fetch();
	}, []);

	const purchased = useMemo(() => {
		if (!order) return [];
		return inventory
			.map((p, idx) => ({ ...p, qty: order.buyQuantity[idx] || 0 }))
			.filter((item) => item.qty > 0);
	}, [order, inventory]);

	if (!order) {
		// redirect back to purchase if no order state
		navigate('/purchase');
		return null;
	}

	const totalItems = purchased.reduce((s, it) => s + it.qty, 0);
	const totalPrice = purchased.reduce((sum, item) => {
		const price = item.unit_price ?? item.price ?? 0;
		return sum + price * item.qty;
	}, 0);

	return (
		<div className="min-h-screen bg-secondary-bg p-6">
			{/* Order Summary */}
			<div className="max-w-3xl mx-auto">
				<h1 className="text-2xl font-semibold text-primary-text mb-4">Order Summary</h1>

				<div className="card">
					{purchased.length === 0 ? (
						<p className="text-placeholder-color">No items selected.</p>
					) : (
						<ul className="divide-y">
							{purchased.map((item) => (
								<li key={item.id} className="py-3 flex justify-between items-center">
									<div>
										<div className="font-medium text-primary-text">{item.name}</div>
										{item.unit_price != null && (
											<div className="text-sm text-secondary-text">
												${item.unit_price.toFixed(2)} x {item.qty}
											</div>
										)}
									</div>
									<div className="text-sm text-secondary-text">{item.qty} x</div>
								</li>
							))}
						</ul>
					)}

					<div className="mt-4 flex justify-between items-center">
						<div className="text-secondary-text">Total items</div>
						<div className="font-semibold">{totalItems}</div>
					</div>
					<div className="mt-2 flex justify-between items-center">
						<div className="text-secondary-text font-bold">Total Price</div>
						<div className="font-bold text-lg">${totalPrice.toFixed(2)}</div>
					</div>

					<div className="mt-6 flex justify-end">
						<button
							className="btn-secondary hover:bg-primary-bg-hover"
							onClick={() => {
								navigate('/purchase', {
									state: { order: location.state.order },
								});
							}}
						>
							Edit Order
						</button>
					</div>
				</div>
			</div>

			{/* Payment form sits in its own max-width container to match Order Summary */}
			<div className="max-w-3xl mx-auto mt-6">
				<form onSubmit={handleSubmit} className="card">
					<h2 className="text-lg font-medium mb-4">Payment Information</h2>
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<label className="w-36 sm:w-40 text-sm font-medium text-secondary-text">
								Card Number:
							</label>
							<input
								type="text"
								name="cardNumber"
								placeholder="1234 1234 1234 1234"
								value={payment.cardNumber}
								onChange={handleChange}
								className="flex-1 bg-secondary-bg text-primary-text border border-border-color rounded-md px-3 py-2 shadow-sm placeholder-placeholder-color focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
							/>
						</div>

						<div className="flex items-center gap-4">
							<label className="w-36 sm:w-40 text-sm font-medium text-secondary-text">
								Expiration:
							</label>
							<input
								type="text"
								name="expiration"
								placeholder="MM/YY"
								value={payment.expiration}
								onChange={handleChange}
								className="flex-1 bg-secondary-bg text-primary-text border border-border-color rounded-md px-3 py-2 shadow-sm placeholder-placeholder-color focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
							/>
						</div>

						<div className="flex items-center gap-4">
							<label className="w-36 sm:w-40 text-sm font-medium text-secondary-text">CVV:</label>
							<input
								type="text"
								name="cvv"
								placeholder="123"
								value={payment.cvv}
								onChange={handleChange}
								className="flex-1 bg-secondary-bg text-primary-text border border-border-color rounded-md px-3 py-2 shadow-sm placeholder-placeholder-color focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
							/>
						</div>

						<div className="flex items-center gap-4">
							<label className="w-36 sm:w-40 text-sm font-medium text-secondary-text">
								Cardholder Name:
							</label>
							<input
								type="text"
								name="cardholderName"
								placeholder="Name on card"
								value={payment.cardholderName}
								onChange={handleChange}
								className="flex-1 bg-secondary-bg text-primary-text border border-border-color rounded-md px-3 py-2 shadow-sm placeholder-placeholder-color focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
							/>
						</div>
					</div>

					<div className="mt-6 flex justify-end">
						<button type="submit" className="btn-secondary hover:bg-primary-bg-hover">
							Continue to Shipping
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default PaymentEntry;
