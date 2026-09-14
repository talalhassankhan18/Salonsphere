"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { produce } from "immer";
import { CartItem, ProductType } from "../../types";

// Define the CartState interface using the CartItem type from types/index.ts
interface CartState {
  cartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  totalPrice: () => number;
  clearCart: () => void;
}

// Custom storage adapter for browser-only localStorage
const browserStorage = createJSONStorage(() => {
  if (typeof window !== "undefined") {
    return localStorage; // Use localStorage in the browser
  }
  // Return a no-op storage for server-side rendering
  return {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  };
});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      setCartItems: (items) => set({ cartItems: items }),
      addItem: (item) =>
        set(
          produce((state: CartState) => {
            const existingItem = state.cartItems.find((i) => i.id === item.id);
            if (existingItem) {
              // Update quantity if item already exists
              existingItem.quantity += item.quantity;
            } else {
              // Ensure netPrice is set
              const netPrice =
                item.netPrice ||
                item.price * (100 - (item.discountPercent || 0)) * 0.01;
              state.cartItems.push({
                ...item,
                netPrice,
                maxAllowedInCart: item.maxAllowedInCart || 10,
              });
            }
          })
        ),
      updateQuantity: (id, quantity) =>
        set(
          produce((state: CartState) => {
            const item = state.cartItems.find((i) => i.id === id);
            if (item) {
              item.quantity = Math.max(
                1,
                Math.min(quantity, item.maxAllowedInCart || 10)
              );
            }
          })
        ),
      removeItem: (id) =>
        set(
          produce((state: CartState) => {
            state.cartItems = state.cartItems.filter((item) => item.id !== id);
          })
        ),
      totalPrice: () =>
        get().cartItems.reduce(
          (acc, item) => acc + item.netPrice * item.quantity,
          0
        ),
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: "cart-storage", // Key in localStorage
      storage: browserStorage, // Use the JSON storage adapter
    }
  )
);

export const mapProductToCartItem = (
  product: ProductType,
  salonId?: string,
  salonName?: string
): CartItem => ({
  id: `${product._id}${salonId ? `-${salonId}` : ""}`, // Unique ID for items from different salons
  productId: product._id,
  title: product.title,
  image: product.imageUrls?.[0] || product.image || "/placeholder.svg", // Use imageUrls[0], fallback to image, then placeholder
  price: product.price, // Original price
  netPrice:
    product.discountedPrice !== null
      ? product.discountedPrice
      : Math.floor(
          product.price * (100 - (product.discountPercent || 0)) * 0.01
        ), // Discounted price
  discountPercent: product.discountPercent || 0,
  quantity: 1,
  maxAllowedInCart: product.maxAllowedInCart,
  selectedVariations: product.variations
    ? product.variations.map((v) => ({
        title: v.title,
        variationListItem: v.variationList[0] || "",
      }))
    : undefined,
  description: product.description,
  howToUse: product.howToUse,
  rating: product.rating,
  salonId, // Include salonId if present
  salonName, // Include salonName if present
});