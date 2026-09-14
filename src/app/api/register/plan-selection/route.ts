import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";

interface IPlanData {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  productLimit: number;
  features: string[];
  isActive: boolean;
  upgradedAt?: Date;
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, plan, action } = await req.json();
    console.log(`Plan selection for ${email}:`, { plan, action });

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const salon = await Salon.findOne({ email: email.toLowerCase() });
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    if (action === "get") {
      if (salon.plan && salon.plan.name) {
        const validatedPlan = validatePlan(salon.plan);
        return NextResponse.json({
          success: true,
          plan: validatedPlan,
        });
      }
      return NextResponse.json(
        { error: "No plan selected for this salon" },
        { status: 404 }
      );
    }

    if (!plan) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    }

    if (!salon.isVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 400 }
      );
    }

    const validatedPlan = validatePlan(plan);
    console.log(`Validated plan for ${email}:`, validatedPlan);

    // Define valid upgrades
    const validUpgrades: Record<string, string[]> = {
      Starter: ["Basic", "Premium"],
      Basic: ["Premium"],
      Premium: [],
    };

    // Handle plan upgrade
    if (action === "upgrade") {
      const currentPlan = salon.plan?.name || "Starter";
      if (!validUpgrades[currentPlan].includes(validatedPlan.name)) {
        return NextResponse.json(
          {
            error: `Invalid upgrade from ${currentPlan} to ${validatedPlan.name}`,
          },
          { status: 400 }
        );
      }

      // For upgrades, save to pendingPlan and set paymentStatus to pending
      const maxRetries = 3;
      let updateResult;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          updateResult = await Salon.updateOne(
            { email: email.toLowerCase() },
            {
              pendingPlan: {
                name: validatedPlan.name,
                monthlyPrice: validatedPlan.monthlyPrice,
                yearlyPrice: validatedPlan.yearlyPrice,
                productLimit: validatedPlan.productLimit,
                features: validatedPlan.features,
                isActive: validatedPlan.isActive,
                upgradedAt: new Date(),
              },
              paymentStatus: "pending", // Set paymentStatus to pending for upgrade
              lastStep: "/salon/register/payment",
            }
          );
          console.log(
            `Plan ${action} update attempt ${attempt} for ${email}:`,
            updateResult
          );
          if (updateResult.matchedCount > 0) break;
        } catch (error: any) {
          console.error(
            `Plan ${action} update attempt ${attempt} failed for ${email}:`,
            error.message,
            error.stack
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

      if (updateResult.modifiedCount === 0) {
        console.warn(
          `Plan ${action} for ${email}: No changes made to document`
        );
      }

      const updatedSalon = await Salon.findOne({ email: email.toLowerCase() });
      if (!updatedSalon?.pendingPlan?.name) {
        console.error(`Pending plan not saved for ${email}:`, updatedSalon);
        return NextResponse.json(
          { error: "Failed to save pending plan: Plan field not updated" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Plan upgrade initiated successfully",
          nextStep: "/salon/register/payment",
        },
        { status: 200 }
      );
    } else if (action !== "set") {
      return NextResponse.json(
        { error: "Invalid action: Must be 'set', 'get', or 'upgrade'" },
        { status: 400 }
      );
    }

    // Handle set action (new registration)
    const maxRetries = 3;
    let updateResult;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        updateResult = await Salon.updateOne(
          { email: email.toLowerCase() },
          {
            plan: {
              name: validatedPlan.name,
              monthlyPrice: validatedPlan.monthlyPrice,
              yearlyPrice: validatedPlan.yearlyPrice,
              productLimit: validatedPlan.productLimit,
              features: validatedPlan.features,
              isActive: validatedPlan.isActive,
            },
            lastStep:
              validatedPlan.name === "Starter" && action !== "upgrade"
                ? "/salon/dashboard"
                : "/salon/register/payment",
          }
        );
        console.log(
          `Plan ${action} update attempt ${attempt} for ${email}:`,
          updateResult
        );
        if (updateResult.matchedCount > 0) break;
      } catch (error: any) {
        console.error(
          `Plan ${action} update attempt ${attempt} failed for ${email}:`,
          error.message,
          error.stack
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

    if (updateResult.modifiedCount === 0) {
      console.warn(`Plan ${action} for ${email}: No changes made to document`);
    }

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
        message: `Plan ${
          action === "upgrade" ? "upgraded" : "selected"
        } successfully`,
        nextStep:
          validatedPlan.name === "Starter" && action !== "upgrade"
            ? "/salon/dashboard"
            : "/salon/register/payment",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Plan selection error:", error.message, error.stack);
    return NextResponse.json(
      { error: `Failed to save plan selection: ${error.message}` },
      { status: 500 }
    );
  }
}

function validatePlan(plan: any): IPlanData {
  if (!plan || typeof plan !== "object") {
    throw new Error("Invalid plan object");
  }

  const requiredFields: (keyof IPlanData)[] = [
    "name",
    "monthlyPrice",
    "yearlyPrice",
    "productLimit",
    "features",
    "isActive",
  ];
  for (const field of requiredFields) {
    if (plan[field] === undefined || plan[field] === null) {
      throw new Error(`Plan field '${field}' is required`);
    }
  }

  const validPlans = ["Starter", "Basic", "Premium"];
  if (!validPlans.includes(plan.name)) {
    throw new Error(
      `Invalid plan name: Must be one of ${validPlans.join(", ")}`
    );
  }

  const planConfigs: Record<
    string,
    {
      productLimit: number;
      features: string[];
      monthlyPrice: number;
      yearlyPrice: number;
    }
  > = {
    Starter: {
      productLimit: 0,
      features: [
        "Online Appointment",
        "Social Media Integration",
        "Profile Customization",
        "Reminders",
        "Business Listing",
      ],
      monthlyPrice: 300,
      yearlyPrice: 300 * 12 * 0.9,
    },
    Basic: {
      productLimit: 100,
      features: [
        "Product Listing",
        "Product Order Tracking",
        "Commission",
        "Online Appointment",
        "Social Media Integration",
        "Profile Customization",
        "Reminders",
        "Business Listing",
      ],
      monthlyPrice: 4199,
      yearlyPrice: 4199 * 12 * 0.9,
    },
    Premium: {
      productLimit: 0, // Unlimited
      features: [
        "Product Listing",
        "Product Order Tracking",
        "Commission",
        "Online Appointment",
        "Analytics",
        "Advertisement Boost",
        "Social Media Integration",
        "Profile Customization",
        "Reminders",
        "Business Listing",
        "Priority Support",
      ],
      monthlyPrice: 8399,
      yearlyPrice: 8399 * 12 * 0.9,
    },
  };

  const config = planConfigs[plan.name];
  if (!config) {
    throw new Error(`No configuration found for plan: ${plan.name}`);
  }

  if (plan.productLimit !== config.productLimit) {
    throw new Error(
      `Invalid productLimit for ${plan.name}: Must be ${config.productLimit}`
    );
  }

  if (
    plan.features.length !== config.features.length ||
    !config.features.every((f) => plan.features.includes(f))
  ) {
    throw new Error(
      `Invalid features for ${
        plan.name
      }: Must include exactly ${config.features.join(", ")}`
    );
  }

  if (plan.monthlyPrice !== config.monthlyPrice) {
    throw new Error(
      `Invalid monthlyPrice for ${plan.name}: Must be ${config.monthlyPrice}`
    );
  }

  if (plan.yearlyPrice !== config.yearlyPrice) {
    throw new Error(
      `Invalid yearlyPrice for ${plan.name}: Must be ${config.yearlyPrice}`
    );
  }

  if (typeof plan.isActive !== "boolean") {
    throw new Error("Invalid isActive: Must be a boolean");
  }

  if (plan.upgradedAt !== undefined && !(plan.upgradedAt instanceof Date)) {
    throw new Error("Invalid upgradedAt: Must be a valid Date or undefined");
  }

  return {
    name: plan.name,
    monthlyPrice: plan.monthlyPrice,
    yearlyPrice: plan.yearlyPrice,
    productLimit: plan.productLimit,
    features: plan.features,
    isActive: plan.isActive,
    upgradedAt: plan.upgradedAt,
  };
}