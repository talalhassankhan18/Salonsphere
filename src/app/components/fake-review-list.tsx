import React from "react";
import { reviewsData } from "@/data";
import CardList from "@/common/card-list";


const FakeReviewList = () => {
	return (
		<div className="font-['Poppins'] bg-[#FFCEA8]/10 py-8">
			<div className="mx-auto my-2 h-[2px] w-[80%] bg-[#99B898]"></div>
			
			<div className="text-center mb-8">
				<h2 className="my-4 font-bold text-3xl text-[#2A363B]">
					Our Trusted Clients
				</h2>
				<p className="text-[#99B898] text-lg">
					Discover what our clients have to say about their experience
				</p>
			</div>

			<CardList
				dataType="review"
				cards={reviewsData}
				className="xl:justify-center gap-6 px-4"
			/>

			<div className="mx-auto mt-8 h-[2px] w-[80%] bg-[#99B898]"></div>
		</div>
	);
};

export default FakeReviewList;
