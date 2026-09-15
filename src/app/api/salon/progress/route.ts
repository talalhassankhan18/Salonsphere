import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import { connectOr503 } from "@/lib/db-guard";
import Salon from "@/mongoose-models/Salon";
import { IPlan } from "@/mongoose-models/Plan";

export async function POST(req: Request) {
  const dbError = await connectOr503();
  if (dbError) return dbError;

  try {
    const { email } = await req.json();
    const action = req.headers.get("x-action"); // Get action from header
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const salon = await Salon.findOne({ email: email.toLowerCase() });
    console.log(`Progress check for ${email}:`, {
      exists: !!salon,
      isVerified: salon?.isVerified,
      plan: salon?.plan,
      pendingPlan: salon?.pendingPlan,
      paymentStatus: salon?.paymentStatus,
      isActive: salon?.isActive,
      lastStep: salon?.lastStep,
      action,
    });

    if (!salon) {
      return NextResponse.json(
        {
          error: "Salon not found",
          exists: false,
          nextStep: "/salon/register/basic-info",
        },
        { status: 404 }
      );
    }

    // Determine the next step based on the salon's state
    let nextStep = salon.lastStep || "/salon/register/basic-info";

    // For upgrades
    if (action === "upgrade") {
      if (!salon.isVerified) {
        nextStep = "/salon/register/verification";
      } else if (!salon.plan || !salon.plan.name) {
        nextStep = "/salon/register/plan-selection";
      } else if (salon.pendingPlan && salon.paymentStatus === "pending") {
        nextStep = "/salon/register/payment"; // Proceed to payment for pending upgrade
      } else if (
        salon.paymentStatus === "completed" &&
        salon.isActive &&
        !salon.pendingPlan
      ) {
        nextStep = "/salon/register/plan-selection"; // Allow selecting a new plan for upgrade
      }
    } else {
      // Existing logic for non-upgrade flows (action: "set")
      if (salon.paymentStatus === "completed" && salon.isActive === true) {
        nextStep = "/salon/dashboard";
      } else if (!salon.isVerified) {
        nextStep = "/salon/register/verification";
      } else if (!salon.plan || !salon.plan.name) {
        nextStep = "/salon/register/plan-selection";
      } else if (
        salon.paymentStatus !== "completed" ||
        typeof salon.paymentStatus === "undefined"
      ) {
        nextStep = "/salon/register/payment";
      }
    }

    // Ensure the plan is valid for the payment step
    if (
      nextStep === "/salon/register/payment" &&
      (!salon.plan || !salon.plan.name) &&
      (!salon.pendingPlan || !salon.pendingPlan.name)
    ) {
      console.warn(`Invalid plan for ${email} at payment step`);
      return NextResponse.json(
        {
          error: "Valid plan required for payment",
          exists: true,
          isVerified: salon.isVerified,
          nextStep: "/salon/register/plan-selection",
        },
        { status: 400 }
      );
    }

    // Update lastStep in the database only if not upgrading
    if (action !== "upgrade") {
      await Salon.updateOne(
        { email: email.toLowerCase() },
        { lastStep: nextStep }
      );
    }

    return NextResponse.json({
      success: true,
      nextStep,
      exists: true,
      isVerified: salon.isVerified,
      plan: salon.plan || null,
      pendingPlan: salon.pendingPlan || null,
      paymentStatus: salon.paymentStatus,
      isActive: salon.isActive,
    });
  } catch (error: any) {
    console.error("Progress check error:", error);
    return NextResponse.json(
      { error: `Failed to check progress: ${error.message}` },
      { status: 500 }
    );
  }
}