"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Smartphone,
  Building,
  DollarSign,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import {
  RadioGroup,
  RadioGroupItem,
} from "../app/productpayment/components/ui/radio-group";
import { Label } from "../app/productpayment/components/ui/label";
import { Input } from "../app/productpayment/components/ui/input";
import { Button } from "../app/productpayment/components/ui/button";
import { toast } from "sonner";

interface PaymentMethodSectionProps {
  onCompleted: () => void;
  totalAmount: number;
}

type PaymentMethod =
  | "credit-card"
  | "jazz-cash"
  | "easy-paisa"
  | "bank-transfer"
  | "cash";

const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  onCompleted,
  totalAmount,
}) => {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("credit-card");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
    phone: "",
    accountNumber: "",
    bankName: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Payment successful!");
      onCompleted();
    }, 1500);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4 text-neutral-content">
        Payment Method
      </h3>

      <form onSubmit={handleSubmit}>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          className="space-y-3 mb-6"
        >
          <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-base-200 cursor-pointer">
            <RadioGroupItem value="credit-card" id="credit-card" />
            <Label
              htmlFor="credit-card"
              className="flex items-center cursor-pointer text-base-content"
            >
              <CreditCard className="h-5 w-5 mr-2 text-accent" />
              Credit/Debit Card
            </Label>
          </div>

          <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-base-200 cursor-pointer">
            <RadioGroupItem value="jazz-cash" id="jazz-cash" />
            <Label
              htmlFor="jazz-cash"
              className="flex items-center cursor-pointer text-base-content"
            >
              <Smartphone className="h-5 w-5 mr-2 text-accent" />
              JazzCash
            </Label>
          </div>

          <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-base-200 cursor-pointer">
            <RadioGroupItem value="easy-paisa" id="easy-paisa" />
            <Label
              htmlFor="easy-paisa"
              className="flex items-center cursor-pointer text-base-content"
            >
              <Smartphone className="h-5 w-5 mr-2 text-accent" />
              EasyPaisa
            </Label>
          </div>

          <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-base-200 cursor-pointer">
            <RadioGroupItem value="bank-transfer" id="bank-transfer" />
            <Label
              htmlFor="bank-transfer"
              className="flex items-center cursor-pointer text-base-content"
            >
              <Building className="h-5 w-5 mr-2 text-accent" />
              Bank Transfer
            </Label>
          </div>

          <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-base-200 cursor-pointer">
            <RadioGroupItem value="cash" id="cash" />
            <Label
              htmlFor="cash"
              className="flex items-center cursor-pointer text-base-content"
            >
              <DollarSign className="h-5 w-5 mr-2 text-accent" />
              Cash on Delivery
            </Label>
          </div>
        </RadioGroup>

        {/* Dynamic payment detail fields based on selected method */}
        {paymentMethod === "credit-card" && (
          <div className="space-y-4 border p-4 rounded-md bg-base-200">
            <div>
              <Label htmlFor="cardNumber" className="text-base-content">
                Card Number
              </Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.cardNumber}
                onChange={handleInputChange}
                required
                className="text-base-content bg-base-100"
              />
            </div>

            <div>
              <Label htmlFor="cardHolder" className="text-base-content">
                Card Holder
              </Label>
              <Input
                id="cardHolder"
                name="cardHolder"
                placeholder="John Doe"
                value={paymentDetails.cardHolder}
                onChange={handleInputChange}
                required
                className="text-base-content bg-base-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry" className="text-base-content">
                  Expiry Date
                </Label>
                <Input
                  id="expiry"
                  name="expiry"
                  placeholder="MM/YY"
                  value={paymentDetails.expiry}
                  onChange={handleInputChange}
                  required
                  className="text-base-content bg-base-100"
                />
              </div>

              <div>
                <Label htmlFor="cvv" className="text-base-content">
                  CVV
                </Label>
                <Input
                  id="cvv"
                  name="cvv"
                  placeholder="123"
                  type="password"
                  maxLength={4}
                  value={paymentDetails.cvv}
                  onChange={handleInputChange}
                  required
                  className="text-base-content bg-base-100"
                />
              </div>
            </div>
          </div>
        )}

        {(paymentMethod === "jazz-cash" || paymentMethod === "easy-paisa") && (
          <div className="space-y-4 border p-4 rounded-md bg-base-200">
            <div>
              <Label htmlFor="phone" className="text-base-content">
                Mobile Number
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="03XX XXXXXXX"
                value={paymentDetails.phone}
                onChange={handleInputChange}
                required
                className="text-base-content bg-base-100"
              />
            </div>

            <div className="text-sm text-base-content/70">
              <p>
                You will receive a payment verification code on this number.
              </p>
            </div>
          </div>
        )}

        {paymentMethod === "bank-transfer" && (
          <div className="space-y-4 border p-4 rounded-md bg-base-200">
            <div>
              <Label htmlFor="bankName" className="text-base-content">
                Bank Name
              </Label>
              <Input
                id="bankName"
                name="bankName"
                placeholder="Bank Name"
                value={paymentDetails.bankName}
                onChange={handleInputChange}
                required
                className="text-base-content bg-base-100"
              />
            </div>

            <div>
              <Label htmlFor="accountNumber" className="text-base-content">
                Account Number
              </Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                placeholder="Account Number"
                value={paymentDetails.accountNumber}
                onChange={handleInputChange}
                required
                className="text-base-content bg-base-100"
              />
            </div>
          </div>
        )}

        {paymentMethod === "cash" && (
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
            type="submit"
            className="w-full mt-3 bg-primary text-primary-content hover:bg-primary/80"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Complete Payment"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethodSection;
