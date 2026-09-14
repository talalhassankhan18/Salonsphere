import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Customer from "@/mongoose-models/Customer";
import { requireSuperAdminOrSelf } from "@/lib/auth/guards";

// PUT /api/customers/[id]/notifications — toggle read on an embedded
// customer notification. Only that customer (or the super-admin) may do so.
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const denied = await requireSuperAdminOrSelf(params.id);
  if (denied) return denied;

  try {
    await dbConnect();
    const body = await request.json();
    const { notificationId, read } = body;

    const customer = await Customer.findById(params.id);
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const notification = customer.notifications.id(notificationId);
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    notification.read = read;
    await customer.save();

    return NextResponse.json(customer, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}
