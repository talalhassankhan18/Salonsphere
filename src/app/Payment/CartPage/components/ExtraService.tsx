'use client';

import React from 'react';

const ExtraService = () => {
  const handleAddService = () => {
    alert('Dark Web Monitoring Added!');
  };

  return (
    <div className="bg-base-100 border border-primary rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 relative">
      <div className="flex-1">
        <span className="bg-primary text-primary-content text-xs px-2 py-1 rounded mb-2 inline-block">Recommended for you</span>
        <h3 className="text-base-content font-semibold text-lg mb-2">Protect your accounts and websites with dark web monitoring</h3>
        <ul className="list-disc list-inside text-sm text-neutral-content mb-4">
          <li>Get alerts if your data appears on the dark web</li>
          <li>Secure your accounts with expert advice</li>
          <li>Enjoy 24/7 peace of mind</li>
        </ul>
        <p className="text-base-content font-medium mb-2">₹499.00/month</p>
        <p className="text-xs text-neutral-content mb-4">Plan renews at ₹499.00/mo. Cancel anytime.</p>
        <button
          onClick={handleAddService}
          className="border border-primary text-primary px-4 py-2 rounded hover:bg-primary hover:text-primary-content transition"
        >
          Get it now
        </button>
      </div>

      <div className="flex-1 hidden md:flex justify-center">
        <div className="w-40 h-40 bg-accent rounded-full flex items-center justify-center text-accent-content text-3xl">
          🔒
        </div>
      </div>
    </div>
  );
};

export default ExtraService;
