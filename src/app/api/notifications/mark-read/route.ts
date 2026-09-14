import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/dbConnect";
import Notification from "@/mongoose-models/Notification";
import { requireNotificationIdentity } from "@/lib/auth/guards";

// POST /api/notifications/mark-read  { notificationId }
// Only a recipient of the notification (or the super-admin) may mark it read.
export async function POST(request: Request) {
  const identity = await requireNotificationIdentity();
  if (identity instanceof NextResponse) return identity;

  try {
    await dbConnect();
    const { notificationId } = await request.json();

    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return NextResponse.json(
        { error: "A valid notification ID is required" },
        { status: 400 }
      );
    }

    const filter: Record<string, unknown> = { _id: notificationId };
    if (!identity.isSuperAdmin) {
      filter.recipientIds = { $in: identity.recipientIds };
    }

    const notification = await Notification.findOneAndUpdate(
      filter,
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Notification marked as read", notification },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error marking notification as read:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
