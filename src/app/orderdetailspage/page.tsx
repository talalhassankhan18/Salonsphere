"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/common/navbar"; // Adjust path as needed
import Footer from "@/common/footer"; // Adjust path as needed
import { signOut } from "next-auth/react";

const OrderDetailsPage = () => {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = new URLSearchParams(window.location.search).get(
        "orderId"
      );
      if (!orderId) {
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }
        const data = await response.json();
        setOrder(data.order);
        setLoading(false);
      } catch (err) {
        setError("Failed to load order details");
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[70vh] flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <div className="min-h-[70vh] px-6 py-10 bg-gray-50 flex justify-center">
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl w-full">
            <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
              Error
            </h1>
            <p className="text-center text-base-content">
              {error || "Order not found"}
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const subtotal = order.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = 200; // Consistent with Checkout
  const totalAmount = subtotal + deliveryFee;

  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] px-6 py-10 bg-gray-50 flex justify-center">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-3xl w-full">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Order Details
          </h1>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold">Order Information</h2>
            <p>
              <strong>Order ID:</strong> {order.orderId}
            </p>
            <p>
              <strong>Order Type:</strong> {order.orderType}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`capitalize ${
                  order.status === "completed"
                    ? "text-green-600"
                    : order.status === "cancelled"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {order.status}
              </span>
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              <span
                className={`capitalize ${
                  order.paymentStatus === "paid"
                    ? "text-green-600"
                    : order.paymentStatus === "refunded"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {order.paymentStatus}
              </span>
            </p>
          </div>

          <div className="border-t pt-4 mt-4">
            <h2 className="text-lg font-semibold">Customer Information</h2>
            <p>
              <strong>Name:</strong> {order.customerId.name}
            </p>
            <p>
              <strong>Email:</strong> {order.customerId.email}
            </p>
            <p>
              <strong>Phone:</strong> {order.phone}
            </p>
            <p>
              <strong>Shipping Address:</strong> {order.shippingAddress}
            </p>
          </div>

          {order.orderType === "salon" && (
            <div className="border-t pt-4 mt-4">
              <h2 className="text-lg font-semibold">Salon Information</h2>
              <p>
                <strong>Salon Name:</strong> {order.salonId?.name || "N/A"}
              </p>
              <p>
                <strong>Commission Earned:</strong> Rs{" "}
                {order.commissionAmount.toFixed(2)}
              </p>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <h2 className="text-lg font-semibold">Order Items</h2>
            <ul className="divide-y mt-2">
              {order.items.map((item: any) => (
                <li
                  key={item.productId._id}
                  className="py-2 flex justify-between"
                >
                  <div>
                    <span>{item.productId.name}</span>
                    <span className="block text-sm text-gray-500">
                      Quantity: {item.quantity} | Price: Rs {item.price}
                      {item.commissionRate && (
                        <span>
                          {" "}
                          | Commission Rate:{" "}
                          {(item.commissionRate * 100).toFixed(2)}%
                        </span>
                      )}
                    </span>
                  </div>
                  <span>Rs {(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-right">
              <p>Subtotal: Rs {subtotal.toFixed(2)}</p>
              <p>Delivery Fee: Rs {deliveryFee}</p>
              <p className="font-bold text-lg">
                Total: Rs {totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button onClick={() => router.back()} className="btn btn-secondary">
              Back to Orders
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderDetailsPage;
