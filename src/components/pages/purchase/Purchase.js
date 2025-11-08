import React, { useEffect, useState } from 'react';
import { getInventory } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { productImages } from '../../common/product-images';

const Purchase = () => {
	const [inventory, setInventory] = useState([]);
	const [order, setOrder] = useState({
		buyQuantity: [],
	});
	const navigate = useNavigate();

	useEffect(() => {
		const fetchInventory = async () => {
			try {
				const data = await getInventory();
				setInventory(data);
				setOrder((prevOrder) => ({
					...prevOrder,
					buyQuantity: Array(data.length).fill(0),
				}));
			} catch (error) {
				console.error('Error fetching inventory:', error);
			}
		};
		fetchInventory();
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		navigate('/purchase/paymentEntry', {
			state: { order },
		});
	};

	return (
		<div className="min-h-screen bg-secondary-bg p-6">
			<div className="max-w-2xl mx-auto">
				<h1 className="text-2xl text-center font-semibold text-primary-text mb-4">
					PitStopProvisions Products
				</h1>
				<form onSubmit={handleSubmit} className="grid gap-6">
					<div className="grid grid-cols-1 gap-4">
						{inventory.map((product, idx) => (
							<div
								key={product.id}
								className="bg-primary-bg rounded-lg shadow p-4 flex items-center justify-between gap-x-4"
							>
								<img
									src={
										productImages.get(product.id) ||
										require('../../images/product-images/helmet.jpg')
									}
									alt={product.name}
									className="w-20 h-20 object-cover rounded-md mr-6"
								/>
								<div className="text-left flex-1">
									<div className="font-medium text-primary-text">{product.name}</div>
									<div className="text-sm text-secondary-text">
										${product.unit_price.toFixed(2)}
									</div>
								</div>
								<div className="flex items-center gap-3">
									<button
										type="button"
										aria-label={`remove one ${product.name}`}
										className="h-12 w-12 flex items-center justify-center rounded-full bg-secondary-bg hover:bg-secondary-text text-primary-text shadow"
										onClick={() =>
											setOrder((prevOrder) => {
												const newQuantity = [...prevOrder.buyQuantity];
												newQuantity[idx] = Math.max(0, newQuantity[idx] - 1);
												return { ...prevOrder, buyQuantity: newQuantity };
											})
										}
									>
										-
									</button>
									<input
										type="number"
										min="0"
										className="w-20 text-center rounded border-secondary-text shadow-sm no-spinner"
										value={order.buyQuantity[idx] ?? 0}
										onChange={(e) =>
											setOrder((prevOrder) => {
												const newQuantity = [...prevOrder.buyQuantity];
												newQuantity[idx] = parseInt(e.target.value, 10) || 0;
												return { ...prevOrder, buyQuantity: newQuantity };
											})
										}
									/>
									<button
										type="button"
										aria-label={`add one ${product.name}`}
										className="h-12 w-12 flex items-center justify-center rounded-full bg-secondary-bg hover:bg-primary-bg-hover text-primary-text shadow"
										onClick={() =>
											setOrder((prevOrder) => {
												const newQuantity = [...prevOrder.buyQuantity];
												newQuantity[idx] = newQuantity[idx] + 1;
												return { ...prevOrder, buyQuantity: newQuantity };
											})
										}
									>
										+
									</button>
								</div>
							</div>
						))}
					</div>
					<div className="flex justify-end mt-4">
						<div className="text-lg font-bold text-primary-text">
							Total Price: $
							{inventory
								.reduce(
									(total, product, idx) =>
										total + product.unit_price * (order.buyQuantity[idx] || 0),
									0
								)
								.toFixed(2)}
						</div>
					</div>
					<div className="flex justify-end">
						<button
							type="submit"
							className="btn-primary hover:bg-primary-bg-hover disabled:opacity-50"
							disabled={!order.buyQuantity.some((qty) => qty > 0)}
						>
							Continue to Payment
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Purchase;
