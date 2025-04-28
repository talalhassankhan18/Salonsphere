import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, plan, action } = await req.json();
    console.log(`Plan selection for ${email}:`, { plan, action });

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const salon = await Salon.findOne({ email: email.toLowerCase() });
    if (!salon) {
      return NextResponse.json(
        { error: "Salon not found" },
        { status: 404 }
      );
    }

    if (action === "get") {
      if (salon.plan && salon.plan.name) {
        return NextResponse.json({
          success: true,
          plan: salon.plan,
        });
      }
      return NextResponse.json(
        { error: "No plan selected for this salon" },
        { status: 404 }
      );
    }

    if (!plan) {
      return NextResponse.json(
        { error: "Plan is required" },
        { status: 400 }
      );
    }

    if (!salon.isVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 400 }
      );
    }

    // Validate the plan object
    const requiredPlanFields = ["name", "price", "productLimit", "billingCycle"];
    for (const field of requiredPlanFields) {
      if (!plan[field]) {
        return NextResponse.json(
          { error: `Plan field '${field}' is required` },
          { status: 400 }
        );
      }
    }

    // Validate billingCycle
    if (!["monthly", "yearly"].includes(plan.billingCycle)) {
      return NextResponse.json(
        { error: "Invalid billing cycle. Must be 'monthly' or 'yearly'" },
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
            plan: {
              name: plan.name,
              price: plan.price,
              productLimit: plan.productLimit,
              billingCycle: plan.billingCycle,
            },
            lastStep: "/salon/register/payment",
          }
        );
        console.log(`Plan selection update attempt ${attempt} for ${email}:`, updateResult);
        if (updateResult.matchedCount > 0) break;
      } catch (error: any) {
        console.error(`Plan selection update attempt ${attempt} failed for ${email}:`, error);
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

    if (updateResult.modifiedCount === 0) {
      console.warn(`Plan selection for ${email}: No changes made to document`);
    }

    // Verify the update
    const updatedSalon = await Salon.findOne({ email: email.toLowerCase() });
    if (!updatedSalon?.plan?.name) {
      console.error(`Plan not saved for ${email}:`, updatedSalon);
      return NextResponse.json(
        { error: "Failed to save plan: Plan field not updated" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Plan selected successfully",
        nextStep: "/salon/register/payment",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Plan selection error:", error);
    return NextResponse.json(
      { error: `Failed to save plan selection: ${error.message}` },
      { status: 500 }
    );
  }
}