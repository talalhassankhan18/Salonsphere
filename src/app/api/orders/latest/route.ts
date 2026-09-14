import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Order from "@/mongoose-models/order";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = authHeader.split(" ")[1];

    const order = await Order.findOne({ customerId })
      .populate("customerId", "name email")
      .populate("items.productId", "name")
      .populate("salonId", "name")
      .sort({ createdAt: -1 });

    if (!order) {
      return NextResponse.json({ error: "No orders found" }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Error fetching latest order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
