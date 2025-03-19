import React from "react";
import Img from "@/assets/images/admin-pannel-img.png";

const GlimmerForBusiness = () => {
	return (
		<div className="flex flex-col items-center justify-center space-y-4 p-6 md:flex-row md:space-y-0">
			{/* Text Container */}
			<div className="md:w-[35%]">
				{/* Heading */}
				<div className="mb-4 text-left">
					<h1 className="font-bold text-4xl text-black sm:text-5xl">
						SalonSphere for Business
					</h1>
				</div>

				{/* Subtitle */}
				<div className="mb-4 max-w-md text-left">
					<p className="text-gray-600 text-lg sm:text-xl">
						Join SalonSphere to showcase your services and attract more clients
						effortlessly.
					</p>
				</div>

				{/* Button */}
				<div className="mb-4 text-left">
					<button className="rounded-lg bg-black px-6 py-3 text-lg text-white hover:bg-gray-800 sm:text-base">
						Register your Salon
					</button>
				</div>
			</div>

			{/* Image Container */}
			<div className="flex items-center justify-center md:w-[65%]">
				<img
					src={Img.src}
					alt="Glimmer for Business"
					className="h-auto w-full object-cover"
				/>
			</div>
		</div>
	);
};

export default GlimmerForBusiness;
