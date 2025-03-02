// app/api/register/route.ts
import { NextResponse } from "next/server";
import { createUser } from "@/app/register/actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await createUser(null, body);

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
