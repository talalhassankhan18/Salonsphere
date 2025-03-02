"use client";

import React, { useState, startTransition } from "react";
import { saveSubscription } from "./actions";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation"; // Import useRouter

const commonFeatures = [
  "Business Listing",
  "Profile Customization",
  "Online Appointment Booking",
  "Automated Customer Reminders",
  "Social Media Integration",
  "Customer Insights & Analytics",
  "Advertisement Boost",
  "Priority Support",
];

const subscriptionPlans = [
  {
    name: "Free Trial",
    price: "Free",
    yearlyPrice: null,
    duration: "14-day trial",
    support: "Community Support",
    features: [true, true, false, false, false, false, false, false],
  },
  {
    name: "Basic",
    price: "₨4,199/month",
    yearlyPrice: "₨41,990/year",
    duration: "Monthly Plan",
    support: "Email Support",
    popular: true,
    features: [true, true, true, true, true, false, false, false],
  },
  {
    name: "Premium",
    price: "₨10,999/month",
    yearlyPrice: "₨109,990/year",
    duration: "Monthly Plan",
    support: "Priority Support",
    features: [true, true, true, true, true, true, true, true],
  },
];

export default function SubscriptionPage() {
  const router = useRouter(); // Initialize router
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const handleSelect = async (planName: string) => {
    startTransition(async () => {
      setSelectedPlan(planName);
      try {
        await saveSubscription(planName, billingCycle);
        alert(`Subscription updated to: ${planName} (${billingCycle})`);
        router.push("/SelectServices"); // Redirect to services page
      } catch (error) {
        console.error("Error saving subscription:", error);
        alert("Failed to update subscription.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col items-center p-10 transition-all duration-300">
      {/* Header */}
      <div className="w-full max-w-5xl text-center mx-auto">
        <h1 className="text-4xl font-extrabold text-primary mb-3">
          Choose the <span className="underline decoration-accent">Perfect Plan</span>
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
        <span className="bg-yellow-500 text-black px-2 py-1 rounded-md font-bold text-xs">Save 20%</span>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-10">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.name}
            className={`relative border rounded-xl p-6 transition-all duration-300 transform 
              bg-white shadow-md w-80 flex flex-col justify-between hover:shadow-lg hover:scale-105
              ${
                selectedPlan === plan.name
                  ? "border-primary ring-2 ring-primary shadow-lg shadow-yellow-300"
                  : "border-gray-300"
              }
            `}
          >
            {/* Popular Tag (Moved to Right) */}
            {plan.popular && (
              <span className="absolute top-3 right-3 bg-yellow-400 text-black px-2 py-1 rounded-md text-xs font-semibold">
                Most Popular
              </span>
            )}

            {/* Selected Badge */}
            {selectedPlan === plan.name && (
              <span className="absolute top-0 left-0 bg-primary text-white px-3 py-1 rounded-tl-lg rounded-br-md text-xs font-semibold">
                Selected
              </span>
            )}

            {/* Plan Content */}
            <div className="flex flex-col flex-grow">
              <h2 className="text-lg font-bold text-gray-800">{plan.name}</h2>
              <p className="text-md font-bold text-primary mt-1">
                {billingCycle === "yearly" && plan.yearlyPrice ? plan.yearlyPrice : plan.price}
              </p>
              <p className="text-xs text-gray-500">{plan.duration}</p>
              <p className="text-xs text-green-600 mt-1">{plan.support}</p>

              {/* Features List */}
              <ul className="mt-4 space-y-2 text-xs flex-grow min-h-[250px]">
                {commonFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    {plan.features[index] ? (
                      <CheckCircle className="text-green-500 w-3.5 h-3.5 mr-2" />
                    ) : (
                      <XCircle className="text-red-500 w-3.5 h-3.5 mr-2" />
                    )}
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Select Plan Button */}
            <div className="mt-4">
              <button
                onClick={() => handleSelect(plan.name)}
                className={`w-full py-2.5 rounded-md font-semibold text-xs transition-all duration-300 transform 
                  ${
                    selectedPlan === plan.name
                      ? "bg-primary text-white ring-2 ring-yellow-500"
                      : "bg-primary text-white hover:bg-gray-800 hover:ring-2 hover:ring-primary"
                  }`}
              >
                {selectedPlan === plan.name ? "✔ Selected" : "Select Plan"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
