import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Notification from "@/mongoose-models/Notification";
import Customer from "@/mongoose-models/Customer";
import Salon from "@/mongoose-models/Salon";

// Map to store SSE clients by userId
const clients = new Map<string, WritableStreamDefaultWriter[]>();

// Function to add a client
export function addClient(userId: string, writer: WritableStreamDefaultWriter) {
  const clientList = clients.get(userId) || [];
  clientList.push(writer);
  clients.set(userId, clientList);
}

// Function to remove a client
export function removeClient(userId: string, writer: WritableStreamDefaultWriter) {
  const clientList = clients.get(userId) || [];
  const updatedList = clientList.filter((client) => client !== writer);
  if (updatedList.length > 0) {
    clients.set(userId, updatedList);
  } else {
    clients.delete(userId);
  }
}

// Function to emit notification to clients
export async function emitNotification(userId: string, notification: any) {
  const clientList = clients.get(userId) || [];
  const encoder = new TextEncoder();
  for (const writer of clientList) {
    try {
      await writer.write(
        encoder.encode(`data: ${JSON.stringify(notification)}\n\n`)
      );
    } catch (error) {
      console.error("Error writing to SSE client:", error);
    }
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let query = {};
    if (userId) {
      query = { recipientIds: userId };
    }

    const notifications = await Notification.find(query).sort({
      createdAt: -1,
    });

    console.log("Fetched notifications for userId:", userId, notifications);
    return NextResponse.json(notifications, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { title, content, type, target, recipientIds, status, scheduledFor, salonId } = body;

    if (!title || !content || !type || !target) {
      return NextResponse.json(
        { error: "Title, content, type, and target are required" },
        { status: 400 }
      );
    }

    let recipients: string[] = [];
    if (target === "all") {
      const customers = await Customer.find().select("_id");
      const salons = await Salon.find().select("userId");
      recipients = [
        ...customers.map((c: any) => c._id.toString()),
        ...salons.map((s: any) => s.userId),
      ];
    } else if (target === "salons") {
      const salons = await Salon.find().select("userId");
      recipients = salons.map((s: any) => s.userId);
    } else if (target === "customers") {
      const customers = await Customer.find().select("_id");
      recipients = customers.map((c: any) => c._id.toString());
    } else if (target === "specific" && recipientIds) {
      recipients = recipientIds;
    } else if (target === "salonAdmin" && salonId) {
      const salon = await Salon.findById(salonId).select("userId").lean();
      if (salon && salon.userId) {
        recipients = [salon.userId];
      } else {
        throw new Error("No admin associated with this salon");
      }
    } else {
      return NextResponse.json(
        { error: "Invalid target or missing recipientIds/salonId" },
        { status: 400 }
      );
    }

    const notification = new Notification({
      title,
      content,
      type,
      target,
      recipientIds: recipients,
      status: status || "draft",
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      createdAt: new Date(),
      sentAt: status === "sent" ? new Date() : null,
      read: false,
    });

    await notification.save();
    console.log("Saved notification with recipients:", recipients);

    // Emit to SSE clients if status is sent
    if (status === "sent") {
      for (const recipientId of recipients) {
        await emitNotification(recipientId, {
          _id: notification._id,
          title: notification.title,
          content: notification.content,
          type: notification.type,
          createdAt: notification.createdAt,
          read: notification.read,
        });
        console.log("Emitted notification to SSE client:", recipientId);
      }
    }

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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