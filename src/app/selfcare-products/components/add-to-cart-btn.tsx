"use client";
import { mapProductToCartItem } from "@/store/cartStore";
import { useCartStoreContext } from "@/store/cartStoreContext";
import { ProductType } from "../../../../types";
import { RiShoppingCart2Line } from "react-icons/ri";

const AddToCartBtn = ({ product }: { product: ProductType }) => {
	const { cartItems, updateQuantity, removeItem, totalPrice, addItem } =
		useCartStoreContext();

	return (
		<button
			className="btn btn-secondary btn-block capitalize"
			onClick={() => {
				addItem(mapProductToCartItem(product));
			}}
		>
			<RiShoppingCart2Line className="mb-0.5 size-4" />
			add to cart
		</button>
	);
};

export default AddToCartBtn;
