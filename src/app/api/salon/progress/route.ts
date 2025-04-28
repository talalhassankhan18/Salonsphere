import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const salon = await Salon.findOne({ email: email.toLowerCase() });
    console.log(`Progress check for ${email}:`, {
      exists: !!salon,
      isVerified: salon?.isVerified,
      plan: salon?.plan,
      paymentStatus: salon?.paymentStatus,
      isActive: salon?.isActive,
      lastStep: salon?.lastStep,
    });

    if (!salon) {
      return NextResponse.json(
        { error: "Salon not found", exists: false, nextStep: "/salon/register/basic-info" },
        { status: 404 }
      );
    }

    let nextStep = "/salon/register/basic-info";
    if (salon.paymentStatus === "completed" && salon.isActive) {
      // Assume user is not authenticated; redirect to login
      // Replace with actual auth check (e.g., NextAuth.js session)
      nextStep = "/salon/login";
      console.log(`Redirecting ${email} to /salon/login: Completed registration, not authenticated`);
    } else if (salon.plan && salon.plan.name) {
      nextStep = "/salon/register/payment";
    } else if (salon.isVerified) {
      nextStep = "/salon/register/plan-selection";
    } else if (salon.email) {
      nextStep = "/salon/register/verification";
    }

    if (nextStep === "/salon/register/payment" && (!salon.plan || !salon.plan.name)) {
      console.warn(`Plan missing for ${email} at payment step`);
      return NextResponse.json(
        {
          error: "Plan not set for payment step",
          exists: true,
          isVerified: salon.isVerified,
          nextStep: "/salon/register/plan-selection",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      nextStep,
      exists: true,
      isVerified: salon.isVerified,
      plan: salon.plan || null,
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