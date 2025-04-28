"use client";
import React, { useState } from "react";
import { useCartStoreContext } from "@/store/cartStoreContext";
import { RiDeleteBin5Line } from "react-icons/ri";
import Link from "next/link";
import Navbar from "../common/navbar";
import Footer from "./footer";
import PaymentMethodSection from "./payment-method-section";

const Cart = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const { cartItems, updateQuantity, removeItem, totalPrice } =
    useCartStoreContext();

  const deliveryFee = 200;
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
    }).format(price);

  const handleProceedToCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    setShowPayment(true);
  };

  const handleCancelPayment = () => {
    setShowPayment(false);
  };

  const handlePaymentCompleted = () => {
    setShowPayment(false);
    // Store order details in local storage
    const order = {
      id: Date.now().toString(),
      items: cartItems,
      total: totalPrice() + deliveryFee,
      date: new Date().toISOString(),
    };
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    localStorage.setItem("orders", JSON.stringify([...existingOrders, order]));
    // Clear cart
    cartItems.forEach((item) => removeItem(item.id));
    alert("Order placed successfully!");
    alert("Get Login to view Order Status");
  };

  if (!cartItems) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <div className="hero min-h-[70vh] bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="font-bold text-5xl">Cart Empty</h1>
              <p className="py-6">
                Your cart is empty. Please add items to your cart.
              </p>
              <Link href={"/selfcare-products"}>
                <button className="btn btn-secondary">Continue Shopping</button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <div className="m-4 p-6"></div>
      <div className="flex min-h-[70vh] justify-center bg-gray-50 p-2 lg:p-8">
        <div className="flex w-full flex-col gap-10 rounded-lg bg-white p-2 shadow-lg lg:p-8 xl:gap-32 xl:px-16">
          {/* Cart Section */}
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Cart Items */}
            <div className="flex-1 max-lg:w-full animate-fade-in">
              <div className="mb-4 flex items-center">
                <h2 className="mr-2 font-semibold text-2xl">Shopping Cart</h2>
                <span className="text-gray-500">
                  ({cartItems.length} Items)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table
                  className="table w-full"
                  role="table"
                  aria-label="Shopping Cart Items"
                >
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th className="pl-6">Quantity</th>
                      <th>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td className="flex items-center gap-4 flex-none max-lg:min-w-80">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                          <div>
                            <p className="font-semibold flex-none">
                              {item.title}
                            </p>
                            {item.selectedVariations?.map((v, i) => (
                              <p key={i} className="text-gray-500 text-sm">
                                {v?.title}
                                {v?.title && <span> : </span>}
                                {v?.variationListItem}
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="text-nowrap">
                          {formatPrice(item.netPrice)}
                        </td>
                        <td>
                          <div className="flex items-center">
                            <button
                              className="btn btn-sm btn-base-100"
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="mx-2" aria-label="Quantity">
                              {item.quantity}
                            </span>
                            <button
                              className="btn btn-sm btn-base-100"
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={item.quantity >= 10}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => removeItem(item.id)}
                          >
                            <RiDeleteBin5Line className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Section */}
            <div className="flex flex-col gap-4 w-full lg:w-80">
              <div className="rounded-lg bg-gray-100 p-4">
                <h3 className="mb-2 font-semibold text-lg">Apply Coupon</h3>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="input input-bordered w-full"
                    aria-label="Coupon code"
                  />
                  <button className="btn btn-secondary w-full">
                    Apply Coupon
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-gray-100 p-4">
                <h3 className="mb-4 font-semibold text-lg">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice() + deliveryFee)}</span>
                  </div>
                </div>
                <button
                  className="btn btn-secondary mt-4 w-full"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          {showPayment && (
            <div className="mt-8 border-t pt-8 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-2xl">Payment Details</h3>
                <button
                  className="btn btn-outline"
                  onClick={handleCancelPayment}
                >
                  Cancel
                </button>
              </div>
              <PaymentMethodSection
                onCompleted={handlePaymentCompleted}
                totalAmount={totalPrice() + deliveryFee}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
