import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Order from "@/mongoose-models/order";
import { requireCustomer } from "@/lib/auth/guards";

// GET /api/orders/latest — the logged-in customer's most recent order.
// (Previously "authenticated" with `Authorization: Bearer <customerId>`,
// where the id itself was the secret.)
export async function GET() {
  const me = await requireCustomer();
  if (me instanceof NextResponse) return me;

  try {
    await dbConnect();

    const order = await Order.findOne({ customerId: me.id })
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
