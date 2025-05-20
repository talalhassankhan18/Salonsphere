import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Order from "@/mongoose-models/order";
import dbConnect from "@/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  request: Request,
  { params }: { params: { salonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "salon_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const orders = await Order.find({ salonId: params.salonId })
      .populate({
        path: "customerId",
        select: "name email",
        strictPopulate: false,
      })
      .populate({
        path: "items.productId",
        select: "name price",
        strictPopulate: false,
      })
      .populate({ path: "salonId", select: "name", strictPopulate: false })
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching salon orders:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
