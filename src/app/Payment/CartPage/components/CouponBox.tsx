"use client";

import React, { useState } from "react";

const CouponBox = () => {
  const [coupon, setCoupon] = useState("");

  const handleApply = () => {
    if (coupon.trim() === "") return;
    alert(`Applied coupon: ${coupon}`);
  };

  return (
    <div className="bg-base-100 border border-base-300 rounded-xl p-4 shadow-sm transition hover:shadow-md">
      <h4 className="text-sm text-secondary font-semibold mb-2">
        Have a coupon code?
      </h4>

      <div className="flex">
        <input
          type="text"
          placeholder="Enter code"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          className="flex-1 border border-base-300 rounded-l px-3 py-2 text-sm focus:ring-accent focus:outline-none"
        />
        <button
          onClick={handleApply}
          className="bg-primary text-primary-content px-4 py-2 rounded-r hover:bg-secondary text-sm transition"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default CouponBox;
