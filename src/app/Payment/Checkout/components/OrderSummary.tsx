'use client';

import React from 'react';

const OrderSummary = () => {
  // Mock data for example purposes
  const subscriptionPlan = 'Premium Salon Plan';
  const duration = '12 months plan';
  const planPrice = 25000; // Rs
  const extraServices = [
    { label: 'Social Media Promotion', originalPrice: 5000, discountedPrice: 0 },
    { label: 'Extra Profile Visibility', originalPrice: 3000, discountedPrice: 0 },
    { label: 'Featured Listing (3 months)', originalPrice: 7000, discountedPrice: 0 },
  ];
  const discountPercentage = 40;
  const subtotal = 41667;
  const discount = 16667;
  const taxes = 0;
  const total = subtotal - discount + taxes;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 w-full max-w-md text-[#1A1A1A]">
      <h3 className="text-xl font-semibold mb-4 text-[#B4004E]">Order Summary</h3>

      <div className="mb-4">
        <h4 className="font-medium text-base mb-2">{subscriptionPlan}</h4>
        <div className="flex justify-between items-center py-2 border-b">
          <span>{duration}</span>
          <span className="font-semibold">Rs {planPrice.toLocaleString()}</span>
        </div>

        {extraServices.map((service, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b last:border-none">
            <span>{service.label}</span>
            {service.discountedPrice === 0 ? (
              <div className="flex items-center gap-2">
                <span className="line-through text-sm text-gray-400">Rs {service.originalPrice.toLocaleString()}</span>
                <span className="font-semibold text-[#B4004E]">Rs 0</span>
              </div>
            ) : (
              <span className="font-semibold">Rs {service.discountedPrice.toLocaleString()}</span>
            )}
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between mb-2">
          <span className="font-medium">Subtotal</span>
          <span className="line-through text-gray-400">Rs {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-medium text-green-600">Discount -{discountPercentage}%</span>
          <span className="text-green-600">- Rs {discount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="font-medium">Taxes</span>
          <span>Rs {taxes}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-semibold text-[#1A1A1A] border-t pt-4">
          <span>Total</span>
          <span>Rs {total.toLocaleString()}</span>
        </div>
      </div>

      {/* Coupon */}
      <div className="mt-4">
        <button className="text-[#B4004E] font-medium underline hover:text-[#D5AA68] transition">
          Have a coupon code?
        </button>
      </div>

      {/* Guarantee */}
      <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="#4A4A4A" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V17M12 7H12.01M21 12A9 9 0 1 1 3 12A9 9 0 0 1 21 12Z" />
        </svg>
        30-day money-back guarantee
      </div>
    </div>
  );
};

export default OrderSummary;
