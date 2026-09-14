import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Customer from "@/mongoose-models/Customer";
import { requireSuperAdminOrSelf } from "@/lib/auth/guards";

// GET customer by ID with related orders and notifications
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const denied = await requireSuperAdminOrSelf(id);
  if (denied) return denied;

  try {
    await dbConnect();
    const customer = await Customer.findById(id)
      .select("name email createdAt isVerified authMethod notifications orders")
      .populate("orders", "orderId total status createdAt")
      .lean();

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PUT update customer name & email by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const denied = await requireSuperAdminOrSelf(id);
  if (denied) return denied;

  try {
    await dbConnect();
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true }
    )
      .select("name email createdAt isVerified authMethod notifications orders")
      .populate("orders", "orderId total status createdAt")
      .lean();

    if (!updatedCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCustomer, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update customer" },
      { status: 500 }
    );
  }
}
