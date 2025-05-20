"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { produce } from "immer";
import { createContext, useContext, ReactNode } from "react";
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
    return localStorage;
  }
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
              existingItem.quantity += item.quantity;
            } else {
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
      name: "cart-storage",
      storage: browserStorage,
    }
  )
);

// Create the CartStoreContext
export const CartStoreContext = createContext<CartState | null>(null);

// Provider component to wrap the app or components that need access to the cart store
interface CartStoreProviderProps {
  children: ReactNode;
}

export const CartStoreProvider: React.FC<CartStoreProviderProps> = ({
  children,
}) => {
  return (
    <CartStoreContext.Provider value={useCartStore()}>
      {children}
    </CartStoreContext.Provider>
  );
};

// Hook to use the cart store context
export const useCartStoreContext = () => {
  const context = useContext(CartStoreContext);
  if (!context) {
    throw new Error(
      "useCartStoreContext must be used within a CartStoreProvider"
    );
  }
  return context;
};

export const mapProductToCartItem = (
  product: ProductType,
  salonId?: string,
  salonName?: string,
  uniqueProductCode?: string
): CartItem => ({
  id: `${product._id}${salonId ? `-${salonId}` : ""}`, // Unique ID with salonId if present
  productId: product._id,
  title: product.title,
  image: product.imageUrls?.[0] || product.image || "/placeholder-image.png", // Use imageUrls[0], fallback to image, then placeholder
  price: product.price,
  netPrice:
    product.discountedPrice !== null
      ? product.discountedPrice
      : Math.floor(
          product.price * (100 - (product.discountPercent || 0)) * 0.01
        ),
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
  salonId: salonId,
  salonName: salonName,
  uniqueProductCode: uniqueProductCode, // Include uniqueProductCode
});