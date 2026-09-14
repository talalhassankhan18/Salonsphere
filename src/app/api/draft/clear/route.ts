import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Draft from "@/mongoose-models/Drafts";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, type } = await req.json();
    if (!email || !type) {
      return NextResponse.json({ error: "Email and type are required" }, { status: 400 });
    }

    await Draft.deleteOne({ email, type });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Draft clear error:", { error: error.message });
    return NextResponse.json({ error: "Failed to clear draft" }, { status: 500 });
  }
}