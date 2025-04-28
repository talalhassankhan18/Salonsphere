"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { CartState, useCartStore } from "@/store/cartStore";
import { CartItem } from "../../types";

const CartStoreContext = createContext<CartState | null>(null);

export const CartStoreProvider = ({ children }: { children: ReactNode }) => {
	const store = useCartStore();
	useEffect(() => {
		if (typeof window !== "undefined") {
			const savedCart = localStorage.getItem("cartItems");
			const pasredCartItems = JSON.parse(savedCart || "[]") as CartItem[];
			store.setCartItems(pasredCartItems);
		}
	}, []);
	return (
		<CartStoreContext.Provider value={store}>
			{children}
		</CartStoreContext.Provider>
	);
};

export const useCartStoreContext = () => {
	const context = useContext(CartStoreContext);
	if (!context) {
		throw new Error(
			"useCartStoreContext must be used within a CartStoreProvider",
		);
	}
	return context;
};
