import React from "react";
import { reviewsData } from "@/data";
import CardList from "@/common/card-list";


const FakeReviewList = () => {
	return (
		<div className="font-['Poppins'] bg-white py-12">
			<div className="mx-auto h-[2px] w-[80%] bg-secondary rounded-full"></div>
			
			<div className="text-center mb-10">
				<h2 className="mt-6 text-3xl font-extrabold text-primary">
					Our Trusted Clients
				</h2>
				<p className="mt-2 text-lg text-gray-600">
					Discover what our clients have to say about their experience
				</p>
			</div>
			
			<CardList
				dataType="review"
				cards={reviewsData}
				className="xl:justify-center gap-6 px-4"
			/>

			<div className="mx-auto mt-8 h-[2px] w-[80%] bg-secondary"></div>
		</div>
	);
};

export default FakeReviewList;
