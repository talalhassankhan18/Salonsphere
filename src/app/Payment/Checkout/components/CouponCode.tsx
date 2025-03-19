import React, { useState } from 'react';

const CouponCode: React.FC = () => {
  const [coupon, setCoupon] = useState('');

  const applyCoupon = () => {
    alert(`Coupon "${coupon}" applied!`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-base-content mb-4">Have a Coupon?</h2>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          className="flex-grow border border-neutral/30 rounded p-2 text-sm"
        />
        <button
          onClick={applyCoupon}
          className="bg-primary text-primary-content px-4 rounded hover:bg-accent hover:text-accent-content transition"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default CouponCode;
