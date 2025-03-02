"use server";

import dbConnect from "@/lib/mongoose";
import Subscription from "@/mongoose-models/subscription";
import { verifySession } from "@/lib/session";

// Subscription Plans with Prices
const subscriptionPlans = [
  { name: "Free Trial", price: "Free", category: "trial" },
  { name: "Basic", price: "₨4,199/month", yearlyPrice: "₨41,990/year", category: "monthly" },
  { name: "Premium", price: "₨10,999/month", yearlyPrice: "₨109,990/year", category: "monthly" },
];

export async function saveSubscription(planName: string, billingCycle: "monthly" | "yearly") {
  try {
    await dbConnect();

    // Verify user session and get user ID
    const session = await verifySession();
    if (!session?.userId) {
      throw new Error("User not authenticated");
    }

    const userId = session.userId;

    // Find the selected plan
    const selectedPlan = subscriptionPlans.find((plan) => plan.name === planName);
    if (!selectedPlan) {
      throw new Error("Invalid plan selected");
    }

    // Determine correct price based on billing cycle
    const price = billingCycle === "yearly" && selectedPlan.yearlyPrice ? selectedPlan.yearlyPrice : selectedPlan.price;

    // Update or insert the subscription
    await Subscription.updateOne(
      { userId },
      { $set: { userId, plan: planName, price, category: billingCycle } },
      { upsert: true }
    );

    return { success: true, message: `Subscription updated to: ${planName} (${billingCycle})` };
  } catch (error) {
    console.error("Failed to save subscription:", error);
    return { success: false, message: "Subscription update failed" };
  }
}
