import CardList from "@/common/card-list";
import { SalonsData } from "@/data";
import { SalonType } from "../../../../types";
import Link from "next/link";
import React from "react";

const RecommendedSaloons = () => {
	const allSalons: SalonType[] = SalonsData;
	return (
		<div className="px-2">
			<Link href={"/salons"} className="prose lg:prose-xl">
				<h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
					<span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
					<span className="pl-4">Recommended Salons</span>
				</h3>
			</Link>
			<CardList cards={allSalons} dataType="salon" shouldAnimate={true} />
		</div>
	);
};

export default RecommendedSaloons;
