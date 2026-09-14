"use client";
import { mapProductToCartItem } from "@/store/cartStore";
import { useCartStoreContext } from "@/store/cartStoreContext";
import { AddToCartBtnProps } from "../../../../types";
import { RiShoppingCart2Line } from "react-icons/ri";

const AddToCartBtn = ({ product, disabled = false }: AddToCartBtnProps) => {
	const { addItem } = useCartStoreContext();

	return (
		<button
			className="btn btn-secondary btn-block capitalize"
			disabled={disabled}
			onClick={() => {
				addItem(mapProductToCartItem(product));
			}}
		>
			<RiShoppingCart2Line className="mb-0.5 size-4" />
			{disabled ? "out of stock" : "add to cart"}
		</button>
	);
};

export default AddToCartBtn;
