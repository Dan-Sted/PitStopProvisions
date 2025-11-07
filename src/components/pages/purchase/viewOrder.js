import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import productlist from '../../common/productlist';
import { createOrder } from '../../../services/api';

const ViewOrder = () => {
	const location = useLocation();
	const navigate = useNavigate();

	// Extract order, payment, and shipping data from location state
	const order = location && location.state && location.state.order;
	const payment = location && location.state && location.state.payment;
	const shipping = location && location.state && location.state.shipping;

	// Calculate purchased items with quantities
	const purchased = useMemo(() => {
		if (!order) return [];
		return productlist
			.map((p, idx) => ({ ...p, qty: order.buyQuantity[idx] || 0 }))
			.filter((item) => item.qty > 0);
	}, [order]);

	const totalItems = purchased.reduce((s, it) => s + it.qty, 0);
	const totalPrice = purchased.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);

	const cardCn = payment.cardNumber;
	const cardExp = payment.expiration;
	const cardCvv = payment.cvv;
	const cardName = payment.cardholderName;

	const shipName = shipping.name;
	const shipAddress = shipping.addressLine1;
	const shipCity = shipping.city;
	const shipState = shipping.state;
	const shipZip = shipping.zip;

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const orderResponse = await createOrder({
				items: purchased.map((item) => ({
					id: item.id,
					quantity: item.qty,
				})),
				payment,
				shipping,
			});
			navigate('/purchase/confirmation', {
				state: {
					order: orderResponse,
					payment,
					shipping,
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
					<div className="flex justify-center">
						<button type="submit" className="btn-secondary hover:bg-primary-bg-hover">
							Continue to confirmation
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
export default ViewOrder;
