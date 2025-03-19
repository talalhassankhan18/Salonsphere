"use client";

import React from "react";
import { BadgeCheck } from "lucide-react";

const OrderSummary = () => {
  return (
    <div className="bg-base-100 border border-base-300 rounded-xl p-6 shadow-md hover:shadow-lg transition">
      <h3 className="text-secondary font-bold text-lg mb-4">Order Summary</h3>

      <div className="flex justify-between text-sm mb-3">
        <span>Subtotal</span>
        <span className="font-semibold">₨26,832</span>
      </div>

      <div className="flex justify-between text-sm text-success mb-3">
        <span>Discount - 20%</span>
        <span>-₨5,366</span>
      </div>

      <hr className="border-base-300 my-4" />

      <div className="flex justify-between text-lg text-secondary font-bold">
        <span>Total</span>
        <span>₨21,466</span>
      </div>

      <button className="w-full mt-6 bg-primary text-primary-content py-3 rounded-md hover:bg-secondary transition font-semibold text-sm">
        Continue to Payment
      </button>

      <div className="flex items-center justify-center mt-4 text-xs text-neutral">
        <BadgeCheck className="w-4 h-4 mr-1" />
        30-day money-back guarantee
      </div>
    </div>
  );
};

export default OrderSummary;
