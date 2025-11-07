import React, { useEffect, useState } from 'react';
import { getInventory } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Products = () => {
	const [inventory, setInventory] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchInventory = async () => {
			const data = await getInventory();
			setInventory(data);
		};
		fetchInventory();
	}, []);

	return (
		<div className="min-h-screen flex flex-col bg-secondary-bg">
			<main className="flex-grow p-6">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-3xl font-bold text-primary-text mb-6">Our Products</h1>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{inventory.map((product) => (
							<div key={product.id} className="bg-primary-bg rounded-lg shadow p-4">
								<img
									src={product.image}
									alt={product.name}
									className="w-full h-40 object-contain rounded-md mb-4"
								/>
								<h2 className="text-xl font-semibold text-primary-text">{product.name}</h2>
								<p className="text-secondary-text">${product.unit_price.toFixed(2)}</p>
							</div>
						))}
					</div>
					<div className="mt-6 flex justify-end">
						<button
							className="bg-primary-bg text-primary-text py-2 px-4 rounded hover:bg-primary-bg-hover shadow-lg"
							onClick={() => navigate('/purchase')}
							aria-label="Buy now"
						>
							Buy Now!
						</button>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Products;
