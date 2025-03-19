'use client';

import React from 'react';

const PlanSelector = () => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold text-base-content mb-4">Single Web Hosting</h2>

      <div className="flex items-center justify-between mb-4">
        <label className="text-sm text-neutral-content">Period</label>
        <select className="border border-base-300 rounded p-2 text-sm focus:outline-primary">
          <option>12 months</option>
          <option selected>48 months</option>
        </select>
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="bg-success text-success-content px-3 py-1 rounded text-xs">SAVE ₹52,800.00</span>
        <div className="text-right">
          <p className="text-lg text-base-content font-semibold">₹299.00/month</p>
          <p className="text-xs text-neutral-content line-through">₹1,399.00/month</p>
        </div>
      </div>

      <p className="text-xs text-neutral-content mt-2">Renews at ₹699.00/month on 09/03/2029. Cancel anytime!</p>
    </div>
  );
};

export default PlanSelector;
