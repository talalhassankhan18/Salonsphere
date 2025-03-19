import CardList from "@/common/card-list";
import { BestSellersData } from "@/data";
import Link from "next/link";

const BestSellers = () => {
	return (
		<div className="px-2">
			<Link href="/selfcare-products" className="prose lg:prose-xl ">
				<h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
					<span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
					<span className="pl-4">Best Sellers</span>
				</h3>
			</Link>
			<CardList
				cards={BestSellersData}
				dataType="product"
				shouldAnimate={true}
			/>
		</div>
	);
};

export default BestSellers;
