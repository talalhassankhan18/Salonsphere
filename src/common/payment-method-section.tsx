"use client";

import React, { useState } from "react";
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import {
  RadioGroup,
  RadioGroupItem,
} from "../app/productpayment/components/ui/radio-group";
import { Label } from "../app/productpayment/components/ui/label";
import { Button } from "../app/productpayment/components/ui/button";
import { toast } from "sonner";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutPage from "../app/salon/components/CheckoutPage";
import convertToSubcurrency from "@/lib/ConvertToSubcurrency";

// Initialize Stripe
// null when the key is absent: <Elements> then renders nothing instead of the
// whole page (and the build) crashing.
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
  : null;

interface PaymentMethodSectionProps {
  onCompleted: (paymentMethod: string) => Promise<void>;
  totalAmount: number; // Amount in PKR
  isLoading: boolean;
}

type PaymentMethod = "Card Payment" | "Cash";

const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  onCompleted,
  totalAmount,
  isLoading,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Card Payment");
  const [isProcessing, setIsProcessing] = useState(false);

  // Convert PKR to USD (approximate exchange rate: 1 USD = 280 PKR)
  const amountInUSD = totalAmount / 280;

  const handleCashSubmit = async () => {
    setIsProcessing(true);
    try {
      // Simulate Cash on Delivery processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Cash on Delivery order confirmed!");
      await onCompleted("Cash on Delivery");
    } catch (error) {
      toast.error("Failed to process Cash on Delivery order.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    toast.success("Payment processed successfully!");
    await onCompleted("Card Payment");
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4 text-neutral-content">
        Payment Method
      </h3>

      <RadioGroup
        value={paymentMethod}
        onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
        className="space-y-3 mb-6"
      >
        <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-base-200 cursor-pointer">
          <RadioGroupItem value="Card Payment" id="card-payment" />
          <Label
            htmlFor="card-payment"
            className="flex items-center cursor-pointer text-base-content"
          >
            <CreditCard className="h-5 w-5 mr-2 text-accent" />
            Card Payment
          </Label>
        </div>

        <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-base-200 cursor-pointer">
          <RadioGroupItem value="Cash" id="cash" />
          <Label
            htmlFor="cash"
            className="flex items-center cursor-pointer text-base-content"
          >
            <DollarSign className="h-5 w-5 mr-2 text-accent" />
            Cash on Delivery
          </Label>
        </div>
      </RadioGroup>

      {paymentMethod === "Card Payment" && (
        <div className="border p-4 rounded-md bg-base-200">
          <Elements
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: convertToSubcurrency(amountInUSD), // USD in cents
              currency: "usd",
            }}
          >
            <CheckoutPage
              amount={amountInUSD} // Pass USD amount
              onPaymentSuccess={handlePaymentSuccess}
            />
          </Elements>
        </div>
      )}

      {paymentMethod === "Cash" && (
        <div className="border p-4 rounded-md bg-base-200">
          <div className="flex items-start mb-3">
            <CheckCircle className="h-5 w-5 mr-2 text-success shrink-0 mt-0.5" />
            <p className="text-sm text-base-content">
              Pay when your order is delivered. Our delivery person will carry
              a portable card machine if you prefer not to use cash.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="flex justify-between items-center py-3 border-t border-base-300">
          <span className="font-medium text-base-content">Total</span>
          <span className="font-bold text-xl text-base-content">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "PKR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(totalAmount)}
          </span>
        </div>

        <Button
          onClick={paymentMethod === "Cash" ? handleCashSubmit : undefined}
          type={paymentMethod === "Cash" ? "button" : "submit"}
          className="w-full mt-3 bg-primary text-primary-content hover:bg-primary/80"
          disabled={isProcessing || isLoading}
        >
          {isProcessing || isLoading ? "Processing..." : "Complete Payment"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethodSection;