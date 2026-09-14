"use client";

import React from "react";
import { useCartStoreContext } from "@/store/cartStoreContext";
import { RiDeleteBin5Line } from "react-icons/ri";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Navbar from "@/common/navbar";
import Footer from "@/common/footer";

const Cart = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cartItems, updateQuantity, removeItem, totalPrice } =
    useCartStoreContext();

  const deliveryFee = 200;
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
    }).format(price);

  const handleProceedToCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    if (status === "authenticated") {
      router.push("/checkout");
    } else {
      router.push("/auth/signin?callbackUrl=/checkout");
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="hero min-h-[70vh] bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="font-bold text-5xl">Cart Empty</h1>
              <p className="py-6">
                Your cart is empty. Please add items to your cart.
              </p>
              <Link href="/selfcare-products">
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
      <Navbar />
      <div className="m-4 p-6"></div>
      <div className="flex min-h-[70vh] justify-center bg-gray-50 p-2 lg:p-8">
        <div className="flex w-full max-w-2xl flex-col gap-6 rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center">
            <h2 className="mr-2 font-semibold text-2xl">Shopping Cart</h2>
            <span className="text-gray-500">({cartItems.length} Items)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
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
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-semibold flex-none">
                          {item.title}{" "}
                          {item.salonName && (
                            <span className="text-sm text-gray-500">
                              - {item.salonName}
                            </span>
                          )}
                        </p>
                        {item.uniqueProductCode && (
                          <p className="text-gray-500 text-sm">
                            Code: {item.uniqueProductCode}
                          </p>
                        )}
                        {item.selectedVariations?.map((v, i) => (
                          <p key={i} className="text-gray-500 text-sm">
                            {v.title}
                            {v.title && v.variationListItem && <span>: </span>}
                            {v.variationListItem}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="text-nowrap">
                      {item.discountPercent && item.discountPercent > 0 ? (
                        <>
                          <span className="line-through text-gray-500 mr-2">
                            {formatPrice(item.price)}
                          </span>
                          <span>{formatPrice(item.netPrice)}</span>
                        </>
                      ) : (
                        <span>{formatPrice(item.netPrice)}</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center">
                        <button
                          className="btn btn-sm btn-base-100"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-base-100"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= (item.maxAllowedInCart || 10)
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-error"
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
          <div className="rounded-lg bg-gray-100 p-4 mt-4">
            <h3 className="mb-4 font-semibold text-lg">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total (before discount)</span>
                <span>
                  {formatPrice(
                    cartItems.reduce(
                      (acc, item) => acc + item.price * item.quantity,
                      0
                    )
                  )}
                </span>
              </div>
              {cartItems.some(
                (item) => item.discountPercent && item.discountPercent > 0
              ) && (
                <div className="flex justify-between">
                  <span>Discount Applied</span>
                  <span>
                    -
                    {formatPrice(
                      cartItems.reduce(
                        (acc, item) =>
                          acc + (item.price - item.netPrice) * item.quantity,
                        0
                      )
                    )}
                  </span>
                </div>
              )}
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
              className="btn btn-primary mt-4 w-full"
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
