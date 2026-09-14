import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Customer from "@/mongoose-models/Customer";
import Order from "@/mongoose-models/order";
import { requireSuperAdmin } from "@/lib/auth/guards";

export async function GET() {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  try {
    await dbConnect();
    const customers = await Customer.find()
      .select("name email createdAt isVerified authMethod")
      .populate("orders", "orderId total status createdAt")
      .lean();
    console.log("Fetched customers from DB:", customers);
    return NextResponse.json(customers, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
