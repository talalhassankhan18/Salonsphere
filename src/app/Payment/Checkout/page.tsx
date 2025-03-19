"use client";

import React from "react";
import OrderSummary from "./components/OrderSummary";
import BillingAddressForm from "./components/BillingAddress";
import PaymentForm from "./components/PaymentForm";

const CartPage = () => {
  return (
    <div className="py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-10">
          {/* Step 1: Billing Address */}
          <section>
              <BillingAddressForm />
          </section>

          {/* Step 2: Payment */}
          <section>
              <PaymentForm />
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1">
          <section className="sticky top-8">
              <OrderSummary />
          </section>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
