"use client";
import { useCartStoreContext } from "@/store/cartStoreContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { RiShoppingCart2Line } from "react-icons/ri";

interface CartNavbarProps {
  initialCartCount: number;
}

const CartNavbar = ({ initialCartCount }: CartNavbarProps) => {
  const { cartItems, updateQuantity, removeItem, totalPrice, addItem } =
    useCartStoreContext();
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync cartItems to cookie and mark as loaded
  useEffect(() => {
    setIsLoaded(true);
    document.cookie = `cartCount=${cartItems.length}; path=/; max-age=86400`; // 24-hour cookie
  }, [cartItems]);

  // Render loading state until client-side store is initialized
  if (!cartItems || !isLoaded) {
    return <span className="text-secondary">Loading...</span>;
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle hover:bg-primary/20">
        <div className="indicator">
          <RiShoppingCart2Line className="mb-0.5 size-5 text-primary" />
          <span className="badge badge-sm indicator-item bg-secondary text-secondary-content">
            {initialCartCount || cartItems.length}
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