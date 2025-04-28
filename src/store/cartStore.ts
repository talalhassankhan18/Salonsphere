"use client";
import { CartItem, ProductType } from "../../types";
import { create } from "zustand";
import { produce } from "immer";

export interface CartState {
	cartItems: CartItem[];
	setCartItems: (items: CartItem[]) => void;
	addItem: (item: CartItem) => void;
	updateQuantity: (id: string, delta: number) => void;
	removeItem: (id: string) => void;
	totalPrice: () => number;
}

// Load cart items from localStorage

export const useCartStore = create<CartState>((set, get) => ({
	cartItems: [],
	setCartItems: (items) => set({ cartItems: items }),
	addItem: (item) =>
		set(
			produce((state: CartState) => {
				if (!state.cartItems.some((i) => i.id === item.id)) {
					state.cartItems.push(item);
					if (typeof window !== "undefined") {
						localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
					}
				}
			}),
		),
	updateQuantity: (id, delta) =>
		set(
			produce((state: CartState) => {
				const item = state.cartItems.find((i) => i.id === id);
				if (item && item.quantity + delta <= item.maxAllowedInCart) {
					item.quantity = Math.max(1, item.quantity + delta);
					if (typeof window !== "undefined") {
						localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
					}
				}
			}),
		),
	removeItem: (id) =>
		set(
			produce((state: CartState) => {
				state.cartItems = state.cartItems.filter((item) => item.id !== id);
				if (typeof window !== "undefined") {
					localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
				}
			}),
		),
	totalPrice: () =>
		get().cartItems.reduce(
			(acc, item) => acc + item.netPrice * item.quantity,
			0,
		),
}));

export const mapProductToCartItem = (product: ProductType): CartItem => ({
	id: product._id as string,
	title: product.title,
	image: product.image,
	netPrice: Math.floor(
		product.price * (100 - (product.discountPercent || 0)) * 0.01,
	),
	selectedVariations: product?.variations
		? product.variations.map((v) => ({
				title: v.title,
				variationListItem: v.variationList[0],
			}))
		: undefined,
	quantity: 1,
	maxAllowedInCart: product.maxAllowedInCart,
});
