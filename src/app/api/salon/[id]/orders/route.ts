import { NextRequest, NextResponse } from "next/server";
import Order from "@/mongoose-models/order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/dbConnect";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const userRole = session.user.role;
  if (!userRole || userRole !== "salon_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (params.id !== session.user.salonId) {
    return NextResponse.json(
      { error: "You can only view orders for your salon" },
      { status: 403 }
    );
  }

  try {
    const orders = await Order.find({ "items.salonId": params.id })
      .populate("items.productId", "name price imageUrls")
      .populate("items.salonId", "salonName")
      .lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching salon orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
