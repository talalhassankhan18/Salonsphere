import { NextResponse } from "next/server";
import Customer from "@/mongoose-models/Customer";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "No verification token provided" },
        { status: 400 }
      );
    }

    // Find the customer by verification token
    const customer = await Customer.findOne({ verificationToken: token });

    if (!customer) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Update the customer's verification status
    customer.isVerified = true;
    customer.verificationToken = ""; // Clear the verification token once used
    await customer.save();

    // Redirect to the signin page after successful verification
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  } catch (error: any) {
    console.error("Verification error:", error.message);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
