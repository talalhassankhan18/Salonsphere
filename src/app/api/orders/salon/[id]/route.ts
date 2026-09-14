import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Order from "@/mongoose-models/order";
import dbConnect from "@/dbConnect";
import { requireSuperAdminOrOwnSalon } from "@/lib/auth/guards";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Route segment is [id]; the old code read params.salonId which was always undefined.
  const { id: salonId } = await context.params;

  // Only the owning salon (or super-admin) may read these orders.
  const scope = await requireSuperAdminOrOwnSalon(salonId);
  if (scope instanceof NextResponse) return scope;

  try {
    await dbConnect();
    const orders = await Order.find({ salonId })
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
