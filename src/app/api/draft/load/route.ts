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

    const draft = await Draft.findOne({ email, type });
    if (!draft) {
      return NextResponse.json({ draft: null });
    }

    return NextResponse.json({ draft });
  } catch (error: any) {
    console.error("Draft load error:", { error: error.message });
    return NextResponse.json({ error: "Failed to load draft" }, { status: 500 });
  }
}