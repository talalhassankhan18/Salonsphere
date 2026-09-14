// app/api/verify-customer/route.ts
import { NextResponse } from "next/server";
import Customer from "@/mongoose-models/Customer";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 400 });
    }

    const customer = await Customer.findOne({ verificationToken: token });
    if (!customer) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    customer.isVerified = true;
    customer.verificationToken = "";
    await customer.save();

    return NextResponse.json({ message: "Verified!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
