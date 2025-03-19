import CardList from "@/common/card-list";
import { SelfCareProductsData } from "@/data";
import { ProductType } from "@/types";
import Link from "next/link"; 

type Props = {
	selfcareItems?: ProductType[];
};
const SeftcareCardList = ({ selfcareItems = [] }: Props) => {
	const allSelfcareItems: ProductType[] =
		selfcareItems.length > 0 ? selfcareItems : SelfCareProductsData;
	return (
		<div className="px-2">
			<Link href="/selfcare-products" className="prose lg:prose-xl">
			<h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
					<span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
					<span className="pl-4">Self-Care Items</span>
				</h3>
			</Link>
			<CardList cards={allSelfcareItems} dataType="product" />
		</div>
	);
};

export default SeftcareCardList;
