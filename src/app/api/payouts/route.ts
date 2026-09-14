import { NextResponse } from "next/server";
import Payout from "@/mongoose-models/payouts";
import dbConnect from "@/dbConnect";
import {
  requireSuperAdmin,
  requireSuperAdminOrOwnSalon,
} from "@/lib/auth/guards";

interface PayoutInput {
  orderId: string;
  salonId?: string | null;
  amount: number;
  paymentMethod: string;
  status: "pending" | "completed" | "failed";
}

// GET: Retrieve payouts (filter by salonId or orderId)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Salon admins may only read their own payouts; super-admin can read any.
  const scope = await requireSuperAdminOrOwnSalon(searchParams.get("salonId"));
  if (scope instanceof NextResponse) return scope;

  try {
    await dbConnect();
    const salonId = scope.salonId;
    const orderId = searchParams.get("orderId");

    const query: any = {};
    if (salonId) query.salonId = salonId;
    if (orderId) query.orderId = orderId;

    const payouts = await Payout.find(query).lean().exec();
    return NextResponse.json({ payouts }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}

// POST: Create one or multiple payouts
export async function POST(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  try {
    await dbConnect();
    const body = await request.json();

    // Handle single or multiple payouts
    const payoutsInput = Array.isArray(body) ? body : [body];

    // Validate inputs
    const validPaymentMethods = [
      "credit_card",
      "debit_card",
      "paypal",
      "jazzcash",
      "easypaisa",
      "bank_transfer",
      "cash",
    ];

    for (const input of payoutsInput) {
      const { orderId, salonId, amount, paymentMethod, status } = input;
      if (!orderId || amount == null || !paymentMethod || !status) {
        return NextResponse.json(
          { error: "Missing required fields for one or more payouts" },
          { status: 400 }
        );
      }
      if (!validPaymentMethods.includes(paymentMethod.toLowerCase())) {
        return NextResponse.json(
          { error: `Invalid payment method: ${paymentMethod}` },
          { status: 400 }
        );
      }
    }

    // Check for existing payouts
    const existingOrderIds = await Payout.find({
      orderId: { $in: payoutsInput.map((p) => p.orderId) },
    }).distinct("orderId");

    if (existingOrderIds.length > 0) {
      return NextResponse.json(
        {
          error: `Payouts already exist for orders: ${existingOrderIds.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Create payouts
    const payouts = payoutsInput.map((input) => ({
      orderId: input.orderId,
      salonId: input.salonId || null,
      amount: input.amount,
      paymentMethod: input.paymentMethod.toLowerCase(),
      status: input.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const savedPayouts = await Payout.insertMany(payouts);
    return NextResponse.json({ payouts: savedPayouts }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create payouts" },
      { status: 500 }
    );
  }
}
