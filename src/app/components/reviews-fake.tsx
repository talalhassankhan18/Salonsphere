"use client";
import React from "react";
import { FaStar } from "react-icons/fa";
import { ReviewType } from "@/types";
import { cn } from "@/lib/utils";

const FakeReview = ({
	review,
	className,
}: { review: ReviewType; className?: string }) => {
	return (
		<div
			className={cn(
				"flex flex-col justify-between rounded-2xl border border-secondary bg-white p-5 shadow-md hover:shadow-lg transition-all duration-300",
				className,
			)}
		>
			<div className="space-y-2">
				<div className="flex flex-wrap">
					{[...Array(review.stars)].map((_, index) => (
						<FaStar key={index} className="mr-1 text-primary size-5" />
					))}
				</div>
				<h2 className="text-lg font-semibold text-secondary">{review.title}</h2>
				<p className="text-gray-600 text-sm leading-relaxed">{review.description}</p>
			</div>
			<div className="mt-4 flex items-center gap-3">
				<img
					src={review.image}
					alt="Reviewer"
					className="h-12 w-12 rounded-full border border-gray-300 shadow-sm"
				/>

				<div>
					<p className="text-base font-bold text-secondary">{review.name}</p>
					<p className="text-sm text-gray-500">{review.city}</p>
				</div>
			</div>
		</div>
	);
};
export default FakeReview;
