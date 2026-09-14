import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Notification from "@/mongoose-models/Notification";
import {
  createNotification,
  type NotificationTarget,
  type NotificationType,
} from "@/lib/notifications";
import {
  requireNotificationIdentity,
  requireSuperAdmin,
} from "@/lib/auth/guards";

// GET /api/notifications?userId=...
// A caller may only read notifications addressed to themselves; the super-admin
// may read anyone's (or everything when userId is omitted).
export async function GET(request: Request) {
  const identity = await requireNotificationIdentity();
  if (identity instanceof NextResponse) return identity;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let query: Record<string, unknown>;
    if (identity.isSuperAdmin) {
      query = userId ? { recipientIds: userId } : {};
    } else {
      if (!userId || !identity.recipientIds.includes(userId)) {
        return NextResponse.json(
          { error: "You can only read your own notifications" },
          { status: 403 }
        );
      }
      query = { recipientIds: userId };
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    return NextResponse.json(notifications, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications
// Super-admin: any target. Everyone else (including guests completing a
// booking): only a "booking" notification addressed to one salon's admin.
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { title, content, type, target, recipientIds, status, scheduledFor, salonId } =
      body as {
        title?: string;
        content?: string;
        type?: NotificationType;
        target?: NotificationTarget;
        recipientIds?: string[];
        status?: "draft" | "sent";
        scheduledFor?: string | null;
        salonId?: string;
      };

    if (!title || !content || !type || !target) {
      return NextResponse.json(
        { error: "Title, content, type, and target are required" },
        { status: 400 }
      );
    }

    const denied = await requireSuperAdmin();
    if (denied) {
      const isBookingPing = target === "salonAdmin" && type === "booking" && !!salonId;
      if (!isBookingPing) return denied;
    }

    const notification = await createNotification({
      title,
      content,
      type,
      target,
      recipientIds,
      salonId,
      status,
      scheduledFor,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    console.error("Error creating notification:", error);
    const isClientError = /required|Invalid|No admin/i.test(error?.message ?? "");
    return NextResponse.json(
      { error: error.message || "Failed to create notification" },
      { status: isClientError ? 400 : 500 }
    );
  }
}

// DELETE /api/notifications?id=...  (super-admin only)
export async function DELETE(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Notification deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete notification" },
      { status: 500 }
    );
  }
}
