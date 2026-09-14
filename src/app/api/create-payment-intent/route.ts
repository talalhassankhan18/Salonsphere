import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Lazy: a missing key must fail this request, not `next build` (which
// imports every route while collecting page data).
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
  }
  return (stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  }));
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const { amount, currency } = await request.json();

    if (!amount || !currency) {
      return NextResponse.json(
        { error: "Missing amount or currency" },
        { status: 400 }
      );
    }

    if (currency !== "usd") {
      return NextResponse.json(
        { error: "Only USD is supported" },
        { status: 400 }
      );
    }

    if (amount < 50) {
      return NextResponse.json(
        { error: "Amount must be at least $0.50 (50 cents)" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in USD cents
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Error creating PaymentIntent:", error);
    return NextResponse.json(
      { error: `Failed to create PaymentIntent: ${error.message}` },
      { status: 500 }
    );
  }
}