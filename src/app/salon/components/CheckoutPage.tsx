"use client";

import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import convertToSubcurrency from "@/lib/ConvertToSubcurrency";
import { toast } from "sonner";

interface CheckoutPageProps {
  amount: number; // Amount in USD
  onPaymentSuccess?: (paymentIntent?: any) => Promise<void>;
}

const CheckoutPage = ({ amount, onPaymentSuccess }: CheckoutPageProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: convertToSubcurrency(amount), // USD in cents
        currency: "usd",
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to create PaymentIntent");
        }
        return res.json();
      })
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => {
        toast.error("Failed to initialize payment");
        console.error("Error fetching clientSecret:", err);
      });
  }, [amount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements || !clientSecret) {
      toast.error("Payment system not ready");
      setLoading(false);
      return;
    }

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/salon/register/payment?email=${encodeURIComponent(
            new URLSearchParams(window.location.search).get("email") || ""
          )}`,
        },
        redirect: "if_required",
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === "succeeded") {
        toast.success("Payment successful!");
        if (onPaymentSuccess) {
          await onPaymentSuccess(paymentIntent);
        }
      } else {
        throw new Error("Payment not completed");
      }
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className="flex items-center justify-center">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md">
      {clientSecret && <PaymentElement />}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="text-white w-full p-3 bg-[#B4004E] hover:bg-[#9a0042] mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse"
      >
        {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default CheckoutPage;