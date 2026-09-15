// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/dbConnect";
import { connectOr503 } from "@/lib/db-guard";
import Salon from "@/mongoose-models/Salon";

export async function POST(req: Request) {
  const dbError = await connectOr503();
  if (dbError) return dbError;

  try {
    const { identifier, password } = await req.json();
    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required" },
        { status: 400 }
      );
    }

    const salon = await Salon.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    });

    if (!salon) {
      return NextResponse.json(
        { error: "Invalid email or username" },
        { status: 401 }
      );
    }

    if (!salon.isActive) {
      return NextResponse.json(
        {
          error: "Payment incomplete",
          lastStep: salon.lastStep || "/salon/register/payment",
        },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      salon.password || ""
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { id: salon._id, email: salon.email, name: salon.name },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
