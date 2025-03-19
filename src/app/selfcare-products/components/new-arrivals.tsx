import CardList from "@/common/card-list";
import { NewArrivalsData } from "@/data";
import Link from "next/link";

const NewArrivals = () => {
	return (
		<div className="px-2">
			<Link href="/selfcare-products" className="prose lg:prose-xl ">
				<h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
					<span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
					<span className="pl-4">New Arrivals</span>
				</h3>
			</Link>
			<CardList cards={NewArrivalsData} dataType="product" />
		</div>
	);
};

export default NewArrivals;
