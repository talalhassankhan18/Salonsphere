"use client";
import React, { useState } from "react";

const PremiumSubscription = () => {
  const [period, setPeriod] = useState("48 months");

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value);
  };

  return (
    <div className="bg-base-100 rounded-xl shadow-md border border-base-300 p-6 shadow-md hover:shadow-lg transition">
      <div className="bg-base-100 md:p-4 space-y-6">
        {/* Header */}
        <h2 className="text-2xl md:text-3xl font-bold text-secondary">
          Premium Salon Subscription
        </h2>

        <hr className="border-base-300" />

        {/* Period & Pricing Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Period Selection */}
          <div className="flex-1 w-full">
            <label
              htmlFor="period"
              className="block text-base-content font-medium mb-2"
            >
              Subscription Period
            </label>
            <select
              id="period"
              value={period}
              onChange={handlePeriodChange}
              className="w-full px-4 py-3 rounded-lg border border-base-300 bg-base-100 text-base-content focus:ring-primary focus:border-primary"
            >
              <option value="12 months">12 months</option>
              <option value="24 months">24 months</option>
              <option value="48 months">48 months</option>
            </select>
          </div>

          {/* Pricing */}
          <div className="flex flex-col md:items-end w-full md:w-auto flex-shrink-0">
            <button className="bg-success text-success-content font-semibold text-xs md:text-sm px-4 md:px-6 py-2 md:py-3 rounded-full mb-2 md:mb-3 w-fit">
              SAVE Rs.69,120.00
            </button>

            <div className="flex flex-wrap md:flex-nowrap items-end gap-2">
              <p className="text-primary text-xl md:text-2xl font-bold">
                Rs.559.00
                <span className="text-base-content text-xs md:text-sm font-normal">
                  /month
                </span>
              </p>

              <p className="line-through text-neutral text-xs md:text-sm">
                Rs.1,999.00
              </p>
            </div>
          </div>
        </div>

        {/* Renewal Info */}
        <p className="text-sm text-neutral">
          Renews at Rs.1,099.00/month for {period}. Cancel anytime.
        </p>

        {/* Offer Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center bg-success bg-opacity-10 border border-success p-4 rounded-lg gap-3 sm:gap-4">
          <div className="flex-1 text-success text-sm">
            Great news! Your <strong>FREE</strong> salon domain + 2 months{" "}
            <strong>FREE</strong> are included with this subscription.
          </div>

          <button className="text-info flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 md:h-6 md:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumSubscription;
