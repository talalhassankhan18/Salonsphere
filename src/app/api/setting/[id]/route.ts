import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Settings from "@/mongoose-models/setting";
import dbConnect from "@/dbConnect";
import { requireSuperAdmin } from "@/lib/auth/guards";

// Platform settings — super-admin only on every method.

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const params = await context.params;
  try {
    await dbConnect();
    const formData = await req.formData();
    
    const settingsData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      platformName: formData.get("platformName") as string,
      supportEmail: formData.get("supportEmail") as string,
      defaultTimezone: formData.get("defaultTimezone") as string,
      defaultCurrency: formData.get("defaultCurrency") as string,
      platformTagline: formData.get("platformTagline") as string,
      platformDescription: formData.get("platformDescription") as string,
    };

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "platformName",
      "supportEmail",
      "defaultTimezone",
      "defaultCurrency",
      "platformTagline",
      "platformDescription",
    ];
    for (const field of requiredFields) {
      if (!settingsData[field as keyof typeof settingsData]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(settingsData.supportEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid support email format" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid settings ID" },
        { status: 400 }
      );
    }

    // Use findOneAndUpdate instead of findByIdAndUpdate to avoid union type issues
    const updatedSettings = await (Settings as mongoose.Model<any>).findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(params.id) },
      { $set: settingsData },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedSettings) {
      return NextResponse.json(
        { success: false, error: "Settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedSettings },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`PUT /api/Setting/${params.id} error:`, error.message, error.stack);
    return NextResponse.json(
      { success: false, error: error.message || "Error updating settings" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const params = await context.params;
  try {
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid settings ID" },
        { status: 400 }
      );
    }

    // Use findOneAndDelete instead of findByIdAndDelete to avoid union type issues
    const deletedSettings = await (Settings as mongoose.Model<any>).findOneAndDelete(
      { _id: new mongoose.Types.ObjectId(params.id) }
    ).exec();

    if (!deletedSettings) {
      return NextResponse.json(
        { success: false, error: "Settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Settings deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`DELETE /api/Setting/${params.id} error:`, error.message, error.stack);
    return NextResponse.json(
      { success: false, error: error.message || "Error deleting settings" },
      { status: 500 }
    );
  }
}