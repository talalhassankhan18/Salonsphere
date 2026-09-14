import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Settings from "@/mongoose-models/setting";
import dbConnect from "@/dbConnect";

export async function GET() {
  try {
    await dbConnect();
    // Explicitly type the query to avoid union type issues
    const settings = await (Settings as mongoose.Model<any>).find().exec();
    return NextResponse.json({ success: true, data: settings }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/Setting error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, error: error.message || "Error fetching settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const newSettings = new Settings(settingsData);
    const savedSettings = await newSettings.save();

    return NextResponse.json(
      { success: true, data: savedSettings },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/Setting error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, error: error.message || "Error creating settings" },
      { status: 500 }
    );
  }
}