"use server";

import Subscription from "@/mongoose-models/subscription"; // Adjust path if different
import { verifySession } from "@/lib/session";
import connectDB from "@/lib/mongoose"; // If you have a db connection helper

// Fetch Subscription Plan for Logged-in User
export const getUserSubscription = async () => {
  try {
    // Connect to MongoDB (optional if already connected elsewhere)
    await connectDB();

    // Verify user session and extract userId
    const { userId } = await verifySession();

    // Find the user's subscription in DB
    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      return {
        success: false,
        message: "No subscription found for this user.",
        data: null,
      };
    }

    return {
      success: true,
      message: "Subscription found.",
      data: {
        plan: subscription.plan,
        price: subscription.price,
        category: subscription.category,
      },
    };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return {
      success: false,
      message: "Failed to fetch subscription.",
      data: null,
    };
  }
};
