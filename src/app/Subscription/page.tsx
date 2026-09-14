"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle, XCircle } from "lucide-react";

interface PlanData {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  productLimit: number;
  features: string[];
  isActive: boolean;
}

const commonFeatures = [
  "Product Listing",
  "Product Order Tracking",
  "Commission",
  "Online Appointment",
  "Analytics",
  "Advertisement Boost",
  "Social Media Integration",
  "Profile Customization",
  "Reminders",
  "Business Listing",
  "Priority Support",
  "Product Limit",
];

const subscriptionPlans: PlanData[] = [
  {
    name: "Starter",
    monthlyPrice: 300,
    yearlyPrice: 300 * 12 * 0.9,
    productLimit: 0,
    features: [
      "Online Appointment",
      "Social Media Integration",
      "Profile Customization",
      "Reminders",
      "Business Listing",
    ],
    isActive: true,
  },
  {
    name: "Basic",
    monthlyPrice: 4199,
    yearlyPrice: 4199 * 12 * 0.9,
    productLimit: 100,
    features: [
      "Product Listing",
      "Product Order Tracking",
      "Commission",
      "Online Appointment",
      "Social Media Integration",
      "Profile Customization",
      "Reminders",
      "Business Listing",
    ],
    isActive: true,
  },
  {
    name: "Premium",
    monthlyPrice: 8399,
    yearlyPrice: 8399 * 12 * 0.9,
    productLimit: 0,
    features: [
      "Product Listing",
      "Product Order Tracking",
      "Commission",
      "Online Appointment",
      "Analytics",
      "Advertisement Boost",
      "Social Media Integration",
      "Profile Customization",
      "Reminders",
      "Business Listing",
      "Priority Support",
    ],
    isActive: true,
  },
];

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col items-center p-4 md:p-10 transition-all duration-300">
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/assets/images/logo.png"
          alt="Salon Sphere Logo"
          width={150}
          height={50}
          className="object-contain"
        />
      </div>

      {/* Header */}
      <div className="w-full max-w-5xl text-center mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#B4004E] mb-3">
          Choose the <span className="underline decoration-gray-400">Perfect Plan</span>
        </h1>
        <p className="text-sm text-gray-600">
          Flexible pricing for businesses at every stage. Try risk-free for 14 days.
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center space-x-4 mt-6 bg-gray-900 text-white p-2 rounded-lg shadow-lg text-xs">
        {["monthly", "yearly"].map((cycle) => (
          <button
            key={cycle}
            className={`px-4 py-1 rounded-lg font-semibold transition-all ${
              billingCycle === cycle ? "bg-white text-black" : "text-gray-300"
            }`}
            onClick={() => setBillingCycle(cycle as "monthly" | "yearly")}
          >
            {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
          </button>
        ))}
        <span className="bg-yellow-500 text-black px-2 py-1 rounded-md font-bold text-xs">
          Save 10%
        </span>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-10">
        {subscriptionPlans.map((plan) => {
          const isPopular = plan.name === "Basic";
          const displayPrice =
            billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
          const duration =
            billingCycle === "yearly" ? "Yearly Plan" : "Monthly Plan";
          const support = plan.features.includes("Priority Support")
            ? "Priority Support"
            : "Email Support";
          const featureMatch: Record<string, boolean | string> = {
            "Product Listing": plan.features.includes("Product Listing"),
            "Product Order Tracking": plan.features.includes(
              "Product Order Tracking"
            ),
            Commission: plan.features.includes("Commission"),
            "Online Appointment": plan.features.includes("Online Appointment"),
            Analytics: plan.features.includes("Analytics"),
            "Advertisement Boost": plan.features.includes(
              "Advertisement Boost"
            ),
            "Social Media Integration": plan.features.includes(
              "Social Media Integration"
            ),
            "Profile Customization": plan.features.includes(
              "Profile Customization"
            ),
            Reminders: plan.features.includes("Reminders"),
            "Business Listing": plan.features.includes("Business Listing"),
            "Priority Support": plan.features.includes("Priority Support"),
            "Product Limit":
              plan.name === "Starter"
                ? "0 products"
                : plan.name === "Basic"
                ? "50-100 products"
                : "Unlimited products",
          };

          return (
            <div
              key={plan.name}
              className="relative border rounded-xl p-6 transition-all duration-300 transform 
                bg-base-300 shadow-md w-full md:w-80 flex flex-col justify-between hover:shadow-lg hover:scale-[1.02]
                border-gray-300"
            >
              {isPopular && (
                <span className="absolute top-3 right-3 bg-[#B4004E] text-white px-2 py-1 rounded-md text-xs font-semibold">
                  Most Popular
                </span>
              )}

              <div className="flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500">{support}</p>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-bold text-gray-900">
                    ₨{displayPrice.toLocaleString()}
                    <span className="text-sm font-normal text-gray-500">
                      {billingCycle === "yearly" ? "/yr" : "/mo"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">{duration}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {commonFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center text-sm text-gray-600"
                    >
                      {featureMatch[feature] === true ? (
                        <CheckCircle
                          className="w-5 h-5 text-green-500 mr-2"
                          aria-label="Feature included"
                        />
                      ) : featureMatch[feature] === false ? (
                        <XCircle
                          className="w-5 h-5 text-red-500 mr-2"
                          aria-label="Feature not included"
                        />
                      ) : (
                        <span className="w-5 h-5 mr-2 inline-block" />
                      )}
                      {typeof featureMatch[feature] === "string"
                        ? featureMatch[feature]
                        : feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
