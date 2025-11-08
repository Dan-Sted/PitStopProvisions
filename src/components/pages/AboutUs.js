import React from 'react';

const AboutUs = () => {
	return (
		<div className="min-h-screen flex flex-col bg-secondary-bg">
			<main className="flex-grow p-6">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-3xl font-bold text-primary-text mb-6">About Us</h1>
					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-primary-text mb-4">Our Mission</h2>
						<p className="text-secondary-text">
							At PitStop Provisions, we exist to fuel the passion of racers and automotive
							enthusiasts by delivering premium performance parts with unmatched speed and
							reliability. Since our founding in 2015, we've been driven by a singular mission: to
							be the most trusted partner in motorsports provisioning, ensuring that every
							racer—from weekend warriors to professional teams—has access to championship-caliber
							components exactly when they need them. Our vision extends beyond simply supplying
							parts; we're building a comprehensive ecosystem that empowers the racing community
							through cutting-edge technology, expert guidance, and an unwavering commitment to
							performance. We envision a future where PitStop Provisions is synonymous with racing
							excellence, where our logistics network operates at the speed of the sport itself, and
							where every interaction reinforces our reputation as the pit crew behind the
							champions.
						</p>
					</section>
					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-primary-text mb-4">Our Vision</h2>
						<p className="text-secondary-text">
							Our vision is to redefine what's possible in racing performance by curating and
							delivering the most innovative and premium racing products available anywhere in the
							world. We don't just distribute parts—we obsessively seek out groundbreaking
							technologies, forge exclusive partnerships with visionary manufacturers, and
							rigorously validate every component to ensure it represents the absolute pinnacle of
							engineering excellence.
						</p>
					</section>
					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-primary-text mb-4">Meet Our Executives</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							<div className="bg-primary-bg rounded-lg shadow p-4 text-center">
								<img
									src={require('../images/other-images/ceo.png')}
									alt="Executive"
									className="w-24 h-24 mx-auto rounded-full mb-4"
								/>
								<h3 className="text-xl font-semibold text-primary-text">Marcus "Rev" Richardson</h3>
								<p className="text-placeholder-color">CEO</p>
								<p className="text-sm text-secondary-text">
									MIT + Wharton, ex-NASCAR pit crew chief, 6 patents, 22 years experience
								</p>
							</div>
							<div className="bg-primary-bg rounded-lg shadow p-4 text-center">
								<img
									src={require('../images/other-images/cfo.png')}
									alt="Executive"
									className="w-24 h-24 mx-auto rounded-full mb-4"
								/>
								<h3 className="text-xl font-semibold text-primary-text">Rachel Kowalski </h3>
								<p className="text-placeholder-color">CFO</p>
								<p className="text-sm text-secondary-text">
									Chicago Booth MBA, Princeton Economics degree, ex-Goldman Sachs investment banker,
									led $320M IPO, CPA & CFA credentials
								</p>
							</div>
							<div className="bg-primary-bg rounded-lg shadow p-4 text-center">
								<img
									src={require('../images/other-images/cro.png')}
									alt="Executive"
									className="w-24 h-24 mx-auto rounded-full mb-4"
								/>
								<h3 className="text-xl font-semibold text-primary-text">
									James "JT" Thornton III{' '}
								</h3>
								<p className="text-placeholder-color">CRO</p>
								<p className="text-sm text-secondary-text">
									Harvard MBA, $500M in deals negotiated, 83 premium brands secured
								</p>
							</div>
							{/* Add more executives here */}
						</div>
					</section>
				</div>
			</main>
		</div>
	);
};

export default AboutUs;
