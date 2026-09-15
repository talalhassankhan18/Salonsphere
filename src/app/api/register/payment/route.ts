import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/dbConnect";
import { connectOr503 } from "@/lib/db-guard";
import Salon, { ISalon } from "@/mongoose-models/Salon";
import { sendPaymentConfirmationEmail } from "@/lib/email/emailService";
import { Document } from "mongoose";

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

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const dbError = await connectOr503();
  if (dbError) return dbError;

  try {
    const { email, plan, paymentIntentId, action } = await req.json();
    console.log(`Payment processing for ${email}:`, {
      plan,
      paymentIntentId,
      action,
    });

    if (!email || !plan || !paymentIntentId) {
      return NextResponse.json(
        { error: "Email, plan, and paymentIntentId are required" },
        { status: 400 }
      );
    }

    // Handle Cash on Delivery
    if (paymentIntentId === "cash_on_delivery") {
      const salon = await Salon.findOne({ email: email.toLowerCase() });
      if (!salon) {
        return NextResponse.json({ error: "Salon not found" }, { status: 404 });
      }

      if (!salon.isVerified) {
        return NextResponse.json(
          { error: "Please verify your email first" },
          { status: 400 }
        );
      }

      // Update salon for COD (pending payment, to be confirmed on delivery)
      const updateResult = await Salon.updateOne(
        { email: email.toLowerCase() },
        {
          paymentStatus: "pending", // COD is pending until delivery
          isActive: false, // Activate only after COD confirmation
          lastStep: "/salon/register/payment",
        }
      );

      if (!updateResult || updateResult.matchedCount === 0) {
        return NextResponse.json(
          { error: "Failed to update salon: No matching document found" },
          { status: 404 }
        );
      }

      // Send COD confirmation email
      try {
        await sendPaymentConfirmationEmail({
          to: email,
          name: salon.name || "User",
          planName: plan.name,
          planPrice: (plan.monthlyPrice / 280).toFixed(2), // Convert to USD
        });
      } catch (emailError: any) {
        console.error(
          `Failed to send COD confirmation email to ${email}:`,
          emailError
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Cash on Delivery order confirmed",
          nextStep: "/salon/register/payment",
        },
        { status: 200 }
      );
    }

    // Verify PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log("PaymentIntent details:", {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });

    if (paymentIntent.status !== "succeeded") {
      console.log("PaymentIntent not succeeded:", paymentIntent.status);
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Convert PKR to USD (1 USD = 280 PKR)
    const amountInUSD = plan.monthlyPrice / 280;
    const expectedAmount = Math.round(amountInUSD * 100); // USD in cents
    if (paymentIntent.amount !== expectedAmount) {
      console.log(
        "Amount mismatch: expected",
        expectedAmount,
        "received",
        paymentIntent.amount
      );
      return NextResponse.json(
        {
          error: `Amount mismatch: expected ${expectedAmount} received ${paymentIntent.amount}`,
        },
        { status: 400 }
      );
    }

    const salon = await Salon.findOne({ email: email.toLowerCase() });
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    if (!salon.isVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 400 }
      );
    }

    // Validate plan fields
    const requiredPlanFields = [
      "name",
      "monthlyPrice",
      "yearlyPrice",
      "productLimit",
      "features",
      "isActive",
    ];
    for (const field of requiredPlanFields) {
      if (plan[field] === undefined || plan[field] === null) {
        console.log(`Validation failed: Missing plan field '${field}'`);
        return NextResponse.json(
          { error: `Plan field '${field}' is required` },
          { status: 400 }
        );
      }
    }

    // Additional plan validation
    if (typeof plan.monthlyPrice !== "number" || plan.monthlyPrice < 0) {
      console.log("Validation failed: Invalid monthlyPrice");
      return NextResponse.json(
        { error: "Invalid monthlyPrice: Must be a non-negative number" },
        { status: 400 }
      );
    }
    if (typeof plan.yearlyPrice !== "number" || plan.yearlyPrice < 0) {
      console.log("Validation failed: Invalid yearlyPrice");
      return NextResponse.json(
        { error: "Invalid yearlyPrice: Must be a non-negative number" },
        { status: 400 }
      );
    }
    if (typeof plan.productLimit !== "number" || plan.productLimit < 0) {
      console.log("Validation failed: Invalid productLimit");
      return NextResponse.json(
        { error: "Invalid productLimit: Must be a non-negative number" },
        { status: 400 }
      );
    }
    if (!Array.isArray(plan.features) || plan.features.length === 0) {
      console.log("Validation failed: Invalid features");
      return NextResponse.json(
        { error: "Invalid features: Must be a non-empty array" },
        { status: 400 }
      );
    }
    if (typeof plan.isActive !== "boolean") {
      console.log("Validation failed: Invalid isActive");
      return NextResponse.json(
        { error: "Invalid isActive: Must be a boolean" },
        { status: 400 }
      );
    }

    // For upgrades, validate against pendingPlan
    if (action === "upgrade") {
      if (
        !salon.pendingPlan ||
        salon.pendingPlan.name !== plan.name ||
        salon.pendingPlan.monthlyPrice !== plan.monthlyPrice ||
        salon.pendingPlan.yearlyPrice !== plan.yearlyPrice ||
        salon.pendingPlan.productLimit !== plan.productLimit ||
        JSON.stringify(salon.pendingPlan.features) !==
          JSON.stringify(plan.features) ||
        salon.pendingPlan.isActive !== plan.isActive
      ) {
        console.log("Validation failed: Pending plan mismatch", {
          savedPendingPlan: salon.pendingPlan,
          receivedPlan: plan,
        });
        return NextResponse.json(
          { error: "Selected plan does not match pending plan" },
          { status: 400 }
        );
      }
    } else {
      // For new registrations, validate against saved plan
      if (
        !salon.plan ||
        salon.plan.name !== plan.name ||
        salon.plan.monthlyPrice !== plan.monthlyPrice ||
        salon.plan.yearlyPrice !== plan.yearlyPrice ||
        salon.plan.productLimit !== plan.productLimit ||
        JSON.stringify(salon.plan.features) !== JSON.stringify(plan.features) ||
        salon.plan.isActive !== plan.isActive
      ) {
        console.log("Validation failed: Plan mismatch", {
          savedPlan: salon.plan,
          receivedPlan: plan,
        });
        return NextResponse.json(
          { error: "Selected plan does not match saved plan" },
          { status: 400 }
        );
      }
    }

    // Validate Starter plan monthlyPrice
    if (plan.name === "Starter" && plan.monthlyPrice !== 300) {
      console.log(
        "Validation failed: Starter plan must have monthlyPrice of 300"
      );
      return NextResponse.json(
        { error: "Invalid Starter plan: monthlyPrice must be 300" },
        { status: 400 }
      );
    }

    // Retry logic for MongoDB update
    const maxRetries = 3;
    let updateResult;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        updateResult = await Salon.updateOne(
          { email: email.toLowerCase() },
          {
            ...(action === "upgrade"
              ? {
                  plan: {
                    name: plan.name,
                    monthlyPrice: plan.monthlyPrice,
                    yearlyPrice: plan.yearlyPrice,
                    productLimit: plan.productLimit,
                    features: plan.features,
                    isActive: plan.isActive,
                    upgradedAt: new Date(),
                  },
                  pendingPlan: null, // Clear pendingPlan after successful payment
                }
              : {}),
            paymentStatus: "completed",
            isActive: true,
            lastStep: "/salon/dashboard",
          }
        );
        console.log(
          `Payment update attempt ${attempt} for ${email}:`,
          updateResult
        );
        if (updateResult.matchedCount > 0) break;
      } catch (error: any) {
        console.error(
          `Payment update attempt ${attempt} failed for ${email}:`,
          error
        );
        if (attempt === maxRetries) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    if (!updateResult || updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update salon: No matching document found" },
        { status: 404 }
      );
    }

    // Verify the update
    const updatedSalon: (Document & ISalon) | null = await Salon.findOne({
      email: email.toLowerCase(),
    });
    if (
      !updatedSalon ||
      updatedSalon.paymentStatus !== "completed" ||
      !updatedSalon.isActive
    ) {
      console.error(`Payment status not updated for ${email}:`, updatedSalon);
      return NextResponse.json(
        { error: "Failed to update payment status" },
        { status: 500 }
      );
    }

    // Send payment confirmation email
    try {
      await sendPaymentConfirmationEmail({
        to: email,
        name: updatedSalon.name || "User",
        planName: updatedSalon.plan!.name,
        planPrice: (updatedSalon.plan!.monthlyPrice / 280).toFixed(2), // Convert to USD for email
      });
    } catch (emailError: any) {
      console.error(
        `Failed to send payment confirmation email to ${email}:`,
        emailError
      );
      // Log email failure but don't fail the request
    }

    return NextResponse.json(
      {
        success: true,
        message: `Payment completed successfully${
          action === "upgrade" ? " and plan upgraded" : ""
        }`,
        nextStep: "/salon/login",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { error: `Failed to process payment: ${error.message}` },
      { status: 500 }
    );
  }
}