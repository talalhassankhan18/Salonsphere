"use client";
import { useCartStoreContext } from "@/store/cartStoreContext";
import Link from "next/link";
import React from "react";
import { RiShoppingCart2Line } from "react-icons/ri";

const CartNavbar = () => {
	const { cartItems, updateQuantity, removeItem, totalPrice, addItem } =
		useCartStoreContext();
	if (!cartItems) return null;
	return (
		<div className="dropdown dropdown-end">
			<div tabIndex={0} role="button" className="btn btn-ghost btn-circle hover:bg-primary/20">
				<div className="indicator">
					<RiShoppingCart2Line className="mb-0.5 size-5 text-primary" />
					<span className="badge badge-sm indicator-item bg-secondary text-secondary-content">
						{cartItems.length}
					</span>
				</div>
			</div>
			<div
				tabIndex={0}
				className="card card-compact dropdown-content z-[2] mt-3 w-52 bg-base-100 shadow-lg border border-base-300"
			>
				<div className="card-body">
					<span className="font-bold text-lg text-primary">{cartItems.length} Items</span>
					<span className="text-secondary font-medium">Subtotal: {totalPrice()} PKR</span>
					<div className="card-actions">
						<Link href="/cart" className="btn btn-primary btn-block hover:btn-secondary transition-colors">
							View cart
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CartNavbar;
