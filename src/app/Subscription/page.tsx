"use client";

import React, { useState, startTransition } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const commonFeatures = [
  "Business Listing",
  "Profile Customization",
  "Online Appointment Booking",
  "Automated Customer Reminders",
  "Social Media Integration",
  "Customer Insights & Analytics",
  "Advertisement Boost",
  "Priority Support",
  "Product Listing Limit",
];

const subscriptionPlans = [
  {
    name: "Free Trial",
    price: "Free",
    yearlyPrice: null,
    duration: "14-day trial",
    support: "Community Support",
    productLimit: 10,
    features: [true, true, false, false, false, false, false, false, "10 products"],
  },
  {
    name: "Basic",
    price: "₨4,199/month",
    yearlyPrice: "₨41,990/year",
    duration: "Monthly Plan",
    support: "Email Support",
    productLimit: 50,
    popular: true,
    features: [true, true, true, true, true, false, false, false, "50 products"],
  },
  {
    name: "Premium",
    price: "₨10,999/month",
    yearlyPrice: "₨109,990/year",
    duration: "Monthly Plan",
    support: "Priority Support",
    productLimit: 100,
    features: [true, true, true, true, true, true, true, true, "100+ products"],
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const handleSelect = async (planName: string) => {
    startTransition(async () => {
      setSelectedPlan(planName);
      try {
        const plan = subscriptionPlans.find(p => p.name === planName);
        localStorage.setItem('selectedPlan', JSON.stringify({
          name: planName,
          price: billingCycle === 'yearly' && plan?.yearlyPrice ? plan.yearlyPrice : plan?.price,
          productLimit: plan?.productLimit,
          billingCycle
        }));
        router.push("/register/basic-info");
      } catch (error) {
        console.error("Error saving subscription:", error);
        alert("Failed to update subscription.");
      }
    });
  };

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
        <span className="bg-yellow-500 text-black px-2 py-1 rounded-md font-bold text-xs">Save 20%</span>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-10">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.name}
            className={`relative border rounded-xl p-6 transition-all duration-300 transform 
              bg-white shadow-md w-full md:w-80 flex flex-col justify-between hover:shadow-lg hover:scale-[1.02]
              ${
                selectedPlan === plan.name
                  ? "border-[#B4004E] ring-2 ring-[#B4004E] shadow-lg shadow-[#B4004E]/20"
                  : "border-gray-300"
              }
            `}
          >
            {/* Popular Tag */}
            {plan.popular && (
              <span className="absolute top-3 right-3 bg-[#B4004E] text-white px-2 py-1 rounded-md text-xs font-semibold">
                Most Popular
              </span>
            )}

            {/* Selected Badge */}
            {selectedPlan === plan.name && (
              <span className="absolute top-0 left-0 bg-[#B4004E] text-white px-3 py-1 rounded-tl-lg rounded-br-md text-xs font-semibold">
                Selected
              </span>
            )}

            {/* Plan Content */}
            <div className="flex flex-col flex-grow">
              <h2 className="text-lg font-bold text-gray-800">{plan.name}</h2>
              <p className="text-md font-bold text-[#B4004E] mt-1">
                {billingCycle === "yearly" && plan.yearlyPrice ? plan.yearlyPrice : plan.price}
              </p>
              <p className="text-xs text-gray-500">{plan.duration}</p>
              <p className="text-xs text-[#B4004E] mt-1">{plan.support}</p>

              {/* Features List */}
              <ul className="mt-4 space-y-2 text-xs flex-grow min-h-[250px]">
                {commonFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    {plan.features[index] ? (
                      typeof plan.features[index] === 'string' ? (
                        <span className="font-semibold text-[#B4004E]">{plan.features[index]}</span>
                      ) : (
                        <>
                          <CheckCircle className="text-green-500 w-3.5 h-3.5 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </>
                      )
                    ) : (
                      <>
                        <XCircle className="text-red-500 w-3.5 h-3.5 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-400">{feature}</span>
                      </>
                    )}
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
                      ? "bg-[#B4004E] text-white ring-2 ring-[#B4004E]"
                      : "bg-[#B4004E] text-white hover:bg-[#9a0042]"
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