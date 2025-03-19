import React from "react";
import TimerBanner from "./components/TimerBanner";
import SubscriptionPlan from "./components/SubscriptionPlan";
import RecommendedAddOns from "./components/RecommendedAddOns";
import OrderSummary from "./components/OrderSummary";
import CouponBox from "./components/CouponBox";
import Footer from "./components/Footer";
import Image from "next/image";
import Logo from "@/assets/images/logo.png";

export default function CartPage() {
  return (
    <div className="flex flex-col min-h-screen bg-base-200 text-base-content">
      {/* Logo at the top - same background as page */}
      <div className="flex items-center gap-2 px-6 md:px-10 pt-8">
        <Image
          src={Logo}
          alt="Salon Logo"
          width={120}
          height={120}
          className="object-contain"
        />
      </div>

      {/* Main content */}
      <main className="flex-grow pt-4 pb-16 px-6 md:px-10 max-w-[1600px] w-full mx-auto space-y-10">
        <TimerBanner />

        <h1 className="text-4xl font-extrabold text-secondary">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Side */}
          <div className="space-y-8 lg:col-span-2">
            <SubscriptionPlan />
            <RecommendedAddOns />
          </div>

          {/* Right Side */}
          <div className="space-y-8">
            <OrderSummary />
            <CouponBox />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
