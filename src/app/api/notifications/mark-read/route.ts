import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Notification from "@/mongoose-models/Notification";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { notificationId } = await request.json();

    if (!notificationId) {
      console.error("Missing notificationId in request body");
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    console.log(
      "Attempting to mark notification as read, notificationId:",
      notificationId
    );

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      console.error("Notification not found for ID:", notificationId);
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    console.log("Successfully marked notification as read:", notification);

    return NextResponse.json(
      { message: "Notification marked as read", notification },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error marking notification as read:", {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: error.message || "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}