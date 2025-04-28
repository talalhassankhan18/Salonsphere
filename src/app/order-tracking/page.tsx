"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/common/navbar";
import Footer from "@/common/footer";
import { Button } from "@/app/productpayment/components/ui/button";

interface Order {
  id: string;
  items: Array<{
    id: string;
    title: string;
    image: string;
    netPrice: number;
    quantity: number;
    selectedVariations?: Array<{
      title: string;
      variationListItem: string;
    }>;
  }>;
  total: number;
  date: string;
  status: string;
}

const OrderTracking = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
    }).format(price);

  const getStatusSteps = (status: string) => {
    const steps = [
      { name: "Order Placed", completed: true },
      { name: "Processing", completed: status !== "Order Placed" },
      {
        name: "Shipped",
        completed: status === "Shipped" || status === "Delivered",
      },
      { name: "Delivered", completed: status === "Delivered" },
    ];
    return steps;
  };

  return (
    <>
      <div className="min-h-[70vh] bg-gray-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Order Tracking</h2>
          {orders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No orders found.</p>
              <Button
                className="mt-4 btn btn-secondary"
                onClick={() => router.push("/selfcare-products")}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="border-b py-6 last:border-b-0">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`badge ${
                      order.status === "Delivered"
                        ? "badge-success"
                        : "badge-warning"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 mb-2">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} |{" "}
                          {formatPrice(item.netPrice * item.quantity)}
                        </p>
                        {item.selectedVariations?.map((v, i) => (
                          <p key={i} className="text-gray-500 text-sm">
                            {v.title}: {v.variationListItem}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking Steps */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Tracking Status</h4>
                  <div className="flex justify-between items-center">
                    {getStatusSteps(order.status).map((step, index) => (
                      <div key={step.name} className="flex-1 text-center">
                        <div
                          className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                            step.completed
                              ? "bg-success text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {step.completed ? "✓" : index + 1}
                        </div>
                        <p className="text-sm mt-2">{step.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderTracking;
