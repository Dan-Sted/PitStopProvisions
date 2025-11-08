import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getInventory } from '../../services/api';
import { productImages } from '../common/product-images';

const Home = () => {
	const [featured, setFeatured] = useState([]);
	const [newsletterEmail, setNewsletterEmail] = useState('');
	const [newsletterSent, setNewsletterSent] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		// Fetch a small selection of products to feature on the landing page
		const fetchFeatured = async () => {
			try {
				const data = await getInventory();
				// pick first 3 as featured (safe fallback if fewer)
				setFeatured(data.slice(0, 3));
			} catch (err) {
				// ignore errors on home (non-critical)
				console.error('Failed to load featured products', err);
			}
		};
		fetchFeatured();
	}, []);

	const submitNewsletter = (e) => {
		e.preventDefault();
		if (!newsletterEmail) return;
		// Simulate subscribe (no backend). Show success message.
		setNewsletterSent(true);
		setNewsletterEmail('');
		setTimeout(() => setNewsletterSent(false), 4000);
	};

	return (
		<div className="min-h-screen flex flex-col">
			<main className="flex-grow bg-secondary-bg p-6 text-primary-text">
				{/* Hero */}
				<section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-10">
					<div>
						<h1 className="text-5xl font-bold mb-4">PitStop Provisions</h1>
						<p className="text-lg mb-6 text-secondary-text">
							Professional-grade parts, lightning-fast shipping, and racing expertise you can trust
							— built for drivers, teams, and enthusiasts.
						</p>
						<div className="flex flex-wrap gap-3">
							<Link
								to="/products"
								className="bg-primary-bg text-primary-text py-3 px-6 rounded hover:bg-primary-bg-hover"
							>
								Shop Featured
							</Link>
							<button
								className="py-3 px-6 bg-primary-bg rounded text-primary-text hover:bg-primary-bg-hover"
								onClick={() => navigate('/about-us')}
							>
								Learn More
							</button>
						</div>
						<div className="mt-6 flex gap-4 flex-wrap text-sm text-secondary-text">
							<span className="px-3 py-2 bg-primary-bg rounded">Free 2-day shipping over $99</span>
							<span className="px-3 py-2 bg-primary-bg rounded">30-day returns</span>
							<span className="px-3 py-2 bg-primary-bg rounded">Expert support</span>
						</div>
					</div>
					<div className="flex justify-center lg:justify-end">
						<img
							src={require('../images/other-images/logo.png')}
							alt="PitStopProvisions"
							className="w-72 h-72 object-contain"
						/>
					</div>
				</section>

				{/* Value props */}
				<section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
					<div className="bg-primary-bg rounded-lg p-5 text-center shadow">
						<div className="text-3xl mb-2">⚡</div>
						<h3 className="font-semibold text-lg mb-2">Fast Shipping</h3>
						<p className="text-sm text-secondary-text">
							Get parts delivered fast so you never miss a race.
						</p>
					</div>
					<div className="bg-primary-bg rounded-lg p-5 text-center shadow">
						<div className="text-3xl mb-2">🔧</div>
						<h3 className="font-semibold text-lg mb-2">Curated Selection</h3>
						<p className="text-sm text-secondary-text">
							Only the best brands and components we trust on the track.
						</p>
					</div>
					<div className="bg-primary-bg rounded-lg p-5 text-center shadow">
						<div className="text-3xl mb-2">🏁</div>
						<h3 className="font-semibold text-lg mb-2">Racing Expertise</h3>
						<p className="text-sm text-secondary-text">
							Our team includes former crew chiefs and engineers.
						</p>
					</div>
				</section>

				{/* Featured products */}
				<section className="max-w-6xl mx-auto mb-10">
					<h2 className="text-2xl font-bold mb-4">Featured Products</h2>
					{featured.length === 0 ? (
						<p className="text-secondary-text">Loading featured items...</p>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{featured.map((p) => (
								<div key={p.id} className="bg-primary-bg rounded-lg shadow p-4 flex flex-col">
									<img
										src={productImages.get(p.id)}
										alt={p.name}
										className="w-full h-40 object-contain rounded mb-4"
									/>
									<h3 className="text-lg font-semibold text-primary-text">{p.name}</h3>
									{(() => {
										return <p className="text-secondary-text mb-4">${p.unit_price.toFixed(2)}</p>;
									})()}
									<div className="mt-auto flex gap-2">
										<button
											className="flex-1 bg-primary-bg text-primary-text py-2 rounded hover:opacity-95"
											onClick={() => navigate(`/products`)}
										>
											View
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</section>

				{/* Testimonials and trust badges */}
				<section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
					<div className="lg:col-span-2">
						<h2 className="text-2xl font-bold mb-4">What our customers say</h2>
						<div className="space-y-4">
							<blockquote className="bg-primary-bg p-4 rounded shadow">
								<p className="italic">
									“Parts arrived the next day and fit perfectly — these folks know racing.”
								</p>
								<p className="mt-2 text-sm text-secondary-text">— Jordan K., Club racer</p>
							</blockquote>
							<blockquote className="bg-primary-bg p-4 rounded shadow">
								<p className="italic">
									“Pro-level selection and customer service helped our team prep for the season.”
								</p>
								<p className="mt-2 text-sm text-secondary-text">— Team Redline</p>
							</blockquote>
						</div>
					</div>
					<aside className="bg-primary-bg rounded-lg p-4 shadow">
						<h3 className="font-semibold mb-2">Trusted by teams</h3>
						<div className="flex flex-wrap gap-2">
							<span className="px-3 py-1 bg-secondary-bg text-sm rounded">NASCAR</span>
							<span className="px-3 py-1 bg-secondary-bg text-sm rounded">Formula 1</span>
							<span className="px-3 py-1 bg-secondary-bg text-sm rounded">IndyCar</span>
							<span className="px-3 py-1 bg-secondary-bg text-sm rounded">SCCA</span>
						</div>
						<div className="mt-4">
							<h4 className="font-semibold mb-2">Newsletter</h4>
							<form onSubmit={submitNewsletter} className="flex gap-2">
								<input
									type="email"
									value={newsletterEmail}
									onChange={(e) => setNewsletterEmail(e.target.value)}
									placeholder="you@race.com"
									className="flex-1 p-2 rounded border border-secondary-text bg-transparent text-primary-text"
								/>
								<button className="px-3 py-2 bg-primary-bg text-primary-text rounded">Join</button>
							</form>
							{newsletterSent && (
								<p className="text-sm text-green-500 mt-2">Subscribed — thanks!</p>
							)}
						</div>
					</aside>
				</section>
			</main>
		</div>
	);
};

export default Home;
