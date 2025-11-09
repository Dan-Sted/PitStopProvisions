import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ShippingEntry = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const [shipping, setShipping] = useState({
		name: '',
		addressLine1: '',
		addressLine2: '',
		city: '',
		state: '',
		zip: '',
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setShipping({ ...shipping, [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		navigate('/purchase/viewOrder', {
			state: {
				order: location.state.order,
				payment: location.state.payment,
				shipping,
			},
		});
	};

	return (
		<div className="min-h-screen bg-secondary-bg p-6">
			<div className="max-w-3xl mx-auto mt-6">
				<form onSubmit={handleSubmit} className="card">
					<h2 className="text-2xl font-semibold text-primary-text mb-4">Shipping Information</h2>
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<label className="w-36 sm:w-40 text-sm font-medium text-secondary-text">Name:</label>
							<input
								type="text"
								name="name"
								placeholder="Full Name"
								value={shipping.name}
								onChange={handleChange}
								className="flex-1 bg-secondary-bg text-primary-text border border-border-color rounded-md px-3 py-2 shadow-sm placeholder-placeholder-color focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
							/>
						</div>
						<div className="flex items-center gap-4">
							<label className="w-36 sm:w-40 text-sm font-medium text-secondary-text">
								Address Line 1:
							</label>
							<input
								type="text"
								name="addressLine1"
								placeholder="Address Line 1"
								value={shipping.addressLine1}
								onChange={handleChange}
								className="flex-1 bg-secondary-bg text-primary-text border border-border-color rounded-md px-3 py-2 shadow-sm placeholder-placeholder-color focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
							/>
						</div>
						<div className="flex items-center gap-4">
							<label className="w-36 sm:w-40 text-sm font-medium text-secondary-text">
								Address Line 2:
							</label>
							<input
								type="text"
								name="addressLine2"
								placeholder="Address Line 2"
								value={shipping.addressLine2}
								onChange={handleChange}
								className="flex-1 bg-secondary-bg text-primary-text border border-border-color rounded-md px-3 py-2 shadow-sm placeholder-placeholder-color focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
							/>
						</div>
						<div className="flex items-center gap-4">
							<label className="w-36 sm:w-40 text-sm font-medium text-secondary-text">City:</label>
							<input
								type="text"
								name="city"
								placeholder="City"
								value={shipping.city}
								onChange={handleChange}
								className="flex-1 bg-secondary-bg text-primary-text border border-border-color rounded-md px-3 py-2 shadow-sm placeholder-placeholder-color focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
							/>
						</div>
						<div className="flex items-center gap-4">
							<label className="w-36 sm:w-40 text-sm font-medium text-secondary-text">State:</label>
							<input
								type="text"
								name="state"
								placeholder="State"
								value={shipping.state}
								onChange={handleChange}
								className="flex-1 bg-secondary-bg text-primary-text border border-border-color rounded-md px-3 py-2 shadow-sm placeholder-placeholder-color focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
							/>
						</div>
						<div className="flex items-center gap-4">
							<label className="w-36 sm:w-40 text-sm font-medium text-secondary-text">
								ZIP Code:
							</label>
							<input
								type="text"
								name="zip"
								placeholder="ZIP Code"
								value={shipping.zip}
								onChange={handleChange}
								className="flex-1 bg-secondary-bg text-primary-text border border-border-color rounded-md px-3 py-2 shadow-sm placeholder-placeholder-color focus:outline-none focus:ring-2 focus:ring-focus-ring transition"
							/>
						</div>
					</div>
					<div className="mt-6 flex justify-end">
						<button type="submit" className="btn-secondary hover:bg-primary-bg-hover">
							Continue to Review Order
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ShippingEntry;
