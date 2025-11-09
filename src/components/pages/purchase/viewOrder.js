import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder, getInventory } from '../../../services/api';

const ViewOrder = () => {
	const location = useLocation();
	const navigate = useNavigate();

	// Extract order, payment, and shipping data from location state
	const order = location && location.state && location.state.order;
	const payment = location && location.state && location.state.payment;
	const shipping = location && location.state && location.state.shipping;

	const [inventory, setInventory] = useState([]);
	// Calculate purchased items with quantities (map inventory by index to order.buyQuantity)
	useEffect(() => {
		const fetch = async () => {
			try {
				const data = await getInventory();
				setInventory(data);
			} catch (err) {
				console.error('Failed to load inventory in ViewOrder', err);
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

	const totalItems = purchased.reduce((s, it) => s + it.qty, 0);
	const totalPrice = purchased.reduce((sum, item) => {
		const price = item.unit_price ?? item.price ?? 0;
		return sum + price * item.qty;
	}, 0);

	const cardCn = payment.cardNumber;
	const cardExp = payment.expiration;
	const cardCvv = payment.cvv;
	const cardName = payment.cardholderName;

	const shipName = shipping.name;
	const shipAddress = shipping.addressLine1;
	const shipCity = shipping.city;
	const shipState = shipping.state;
	const shipZip = shipping.zip;

	const [email, setEmail] = useState((shipping && (shipping.email || '')) || '');
	const [emailTouched, setEmailTouched] = useState(false);
	const isEmailValid = (() => {
		if (!email) return false;
		// simple email regex
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	})();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const orderResponse = await createOrder({
				items: purchased.map((item) => ({
					id: item.item_number,
					name: item.name,
					unit_price: item.unit_price,
					quantity: item.qty,
				})),
				payment,
				// include email on shipping so backend can send confirmation if implemented
				shipping: { ...shipping, email },
			});
			navigate('/purchase/confirmation', {
				state: {
					order: {
						...orderResponse,
						items: purchased.map((item) => ({
							id: item.item_number,
							name: item.name,
							unit_price: item.unit_price,
							quantity: item.qty,
						})),
					},
					payment,
					shipping: { ...shipping, email },
					email,
				},
			});
		} catch (error) {
			console.error('Error creating order:', error);
			alert('An error occurred while creating the order. Please try again.');
		}
	};

	if (!shipping) {
		return <div>No shipping information available</div>;
	}

	return (
		<div className="min-h-screen bg-secondary-bg p-6">
			<div className="flex flex-col items-center gap-8 mt-8">
				{/* Order Summary */}
				<div className="card card-centered">
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
											<div className="text-sm text-secondary-text">
												${item.unit_price.toFixed(2)} x {item.qty}
											</div>
										</div>
										<div className="text-sm text-secondary-text font-semibold">
											${(item.unit_price * item.qty).toFixed(2)}
										</div>
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
								onClick={() => navigate(-3)}
							>
								Edit Order
							</button>
						</div>
					</div>
				</div>

				{/* Payment Information List */}
				<div className="card card-centered">
					<h2 className="text-xl font-semibold text-primary-text mb-4">Payment Information</h2>
					<ul className="space-y-3">
						<li className="flex items-center">
							<span className="font-medium text-secondary-text w-40">Card Number:</span>
							<span className="text-primary-text">{cardCn}</span>
						</li>
						<li className="flex items-center">
							<span className="font-medium text-secondary-text w-40">Expiration:</span>
							<span className="text-primary-text">{cardExp}</span>
						</li>
						<li className="flex items-center">
							<span className="font-medium text-secondary-text w-40">CVV:</span>
							<span className="text-primary-text">{cardCvv}</span>
						</li>
						<li className="flex items-center">
							<span className="font-medium text-secondary-text w-40">Cardholder Name:</span>
							<span className="text-primary-text">{cardName}</span>
						</li>
					</ul>
				</div>

				{/* Shipping Information List */}
				<div className="card card-centered">
					<h2 className="text-xl font-semibold text-primary-text mb-4">Shipping Information</h2>
					<ul className="space-y-3">
						<li className="flex items-center">
							<span className="font-medium text-secondary-text w-40">Name:</span>
							<span className="text-primary-text">{shipName}</span>
						</li>
						<li className="flex items-center">
							<span className="font-medium text-secondary-text w-40">Address:</span>
							<span className="text-primary-text">{shipAddress}</span>
						</li>
						<li className="flex items-center">
							<span className="font-medium text-secondary-text w-40">City:</span>
							<span className="text-primary-text">{shipCity}</span>
						</li>
						<li className="flex items-center">
							<span className="font-medium text-secondary-text w-40">State:</span>
							<span className="text-primary-text">{shipState}</span>
						</li>
						<li className="flex items-center">
							<span className="font-medium text-secondary-text w-40">ZIP Code:</span>
							<span className="text-primary-text">{shipZip}</span>
						</li>
					</ul>
				</div>
				<form onSubmit={handleSubmit} className="card card-centered">
					{/* Email for confirmation */}
					<div className="mb-4 w-full">
						<label className="block text-sm font-medium text-secondary-text mb-2">
							Confirmation Email
						</label>
						<input
							type="email"
							name="confirmationEmail"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onBlur={() => setEmailTouched(true)}
							placeholder="you@example.com"
							className="w-full px-3 py-2 rounded border border-secondary-text bg-secondary-bg text-primary-text"
						/>
						<p className="text-xs text-secondary-text mt-2">
							We'll send an order confirmation to this email.
						</p>
						{emailTouched && !isEmailValid ? (
							<p className="text-xs text-red-500 mt-2">Please enter a valid email address.</p>
						) : null}
					</div>
					<div className="flex justify-center">
						<button
							type="submit"
							disabled={!isEmailValid}
							className={`btn-secondary hover:bg-primary-bg-hover ${!isEmailValid ? 'opacity-50 cursor-not-allowed' : ''}`}
						>
							Continue to confirmation
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
export default ViewOrder;
