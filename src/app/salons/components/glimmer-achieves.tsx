import React from "react";

const GlimmerAchieves = () => {
	return (
		<div className="mb-6 md:mb-14">
			<div className="px-4 text-center ">
				<h1 className="font-bold text-2xl md:text-3xl lg:text-4xl ">
					The top-rated destination for beauty and wellness
				</h1>
				<p className="text-gray-600 text-sm md:text-base">
					One solution, one software. Trusted by the best in the beauty and
					wellness industry
				</p>
			</div>
			<div className="my-4 text-center md:my-16">
				<p className="bg-gradient-to-r from-secondary to-primary bg-clip-text font-bold text-4xl text-transparent md:text-5xl">
					10000+
				</p>

				<p className="text-gray-600 text-sm md:text-base">
					Appointments booked on SalonSphere
				</p>
			</div>
			<div className="mt-8 flex flex-col items-center justify-center space-y-8 text-center md:flex-row md:space-x-8 md:space-y-0">
				<div>
					<p className="font-bold text-2xl md:text-3xl">1000+</p>
					<p className="text-gray-600 text-sm md:text-base">
						partner businesses
					</p>
				</div>
				<div>
					<p className="font-bold text-2xl md:text-3xl">120+ Areas</p>
					<p className="text-gray-600 text-sm md:text-base">using SalonSphere</p>
				</div>
				<div>
					<p className="font-bold text-2xl md:text-3xl">10000+</p>
					<p className="text-gray-600 text-sm md:text-base">
						stylists and professionals
					</p>
				</div>
			</div>
			<div className="mx-auto my-2 mt-4 h-[2px] w-[80%] bg-neutral md:mt-8"></div>
		</div>
	);
};

export default GlimmerAchieves;
