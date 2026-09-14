"use client";

import CheckoutPage from "./components/CheckoutPage";
import convertToSubcurrency from "@/lib/ConvertToSubcurrency";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import BillingAddressForm from "./Checkout/components/BillingAddress";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover, FaPaypal, FaGooglePay, FaLock } from "react-icons/fa";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Home() {
  const amount = 49.99;

  return (
    <main className="py-12 px-4 md:px-8">
      {/* <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-2">Talal</h1>
        <h2 className="text-2xl">
          has requested
          <span className="font-bold"> ${amount}</span>
        </h2>
      </div> */}
      <div className="ml-10">
      <h3 className="ml-28 mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
        <span className="pl-4">Billing Address</span>
      </h3>
      </div>
      <BillingAddressForm />
      <div className="ml-10">
      <h3 className="ml-28 mt-6 mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
        <span className="pl-4">Payment</span>
      </h3>
      </div>

      <div className="pt-6 mt-6 max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200">
        <Elements
          stripe={stripePromise}
          options={{
            mode: "payment",
            amount: convertToSubcurrency(amount),
            currency: "usd",
          }}
        >
          <CheckoutPage amount={amount} />
        </Elements>
        <div className="flex items-center text-xs text-gray-500 mt-3">
          <FaLock className="mr-2" /> Encrypted and secure payments
        </div>

        <p className="text-xs text-gray-500 mt-3">
          By checking out you agree with our{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline font-medium">
            Terms of Service
          </a>{" "}
          and confirm that you have read our{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline font-medium">
            Privacy Policy
          </a>
          . You can cancel recurring payments at any time.
        </p>
      </div>
    </main>
  );
}