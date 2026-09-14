import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Customer from "@/mongoose-models/Customer";
import dbConnect from "@/dbConnect";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let customer = await Customer.findOne({ email });

    if (!customer) {
      // Create a new customer if not found
      if (!name) {
        return NextResponse.json(
          { error: "Name is required for new customer" },
          { status: 400 }
        );
      }
      customer = new Customer({
        email,
        name,
        role: "customer",
        authMethod: "email", // Adjust based on your auth logic
        isVerified: false,
      });
      await customer.save();
    } else {
      // Update the customer's name if provided and different
      if (name && customer.name !== name) {
        customer.name = name;
        await customer.save();
      }
      // Verify the role
      if (customer.role !== "customer") {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ customer }, { status: 200 });
  } catch (error) {
    console.error("Error checking customer:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
