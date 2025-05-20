// /pages/api/public-orders.ts
import { NextRequest, NextResponse } from "next/server";
import Order from "@/mongoose-models/order";
import dbConnect from "@/dbConnect";
import { IPopulatedOrder } from "@/mongoose-models/order";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const populatedOrders = (await Order.getAllOrders()
      .populate("customerId", "name email")
      .lean()) as unknown as IPopulatedOrder[];
    console.log("Returning all orders:", populatedOrders.length);
    return NextResponse.json({ orders: populatedOrders }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
