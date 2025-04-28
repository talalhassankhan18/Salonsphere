import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/mongoose-models/User";
import VerificationToken from "@/mongoose-models/VerificationToken";
import dbConnect from "@/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";

export async function GET(req: NextRequest) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(
      new URL(`/Login?error=${encodeURIComponent("Please sign in to verify your email")}`, req.url)
    );
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  if (!token || !userId) {
    return NextResponse.redirect(
      new URL(`/Login?error=${encodeURIComponent("Invalid verification link")}`, req.url)
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    if (decoded.userId !== userId) {
      return NextResponse.redirect(
        new URL(`/Login?error=${encodeURIComponent("Invalid token")}`, req.url)
      );
    }

    const verificationToken = await VerificationToken.findOne({ userId, token });
    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.redirect(
        new URL(`/Login?error=${encodeURIComponent("Token expired or invalid")}`, req.url)
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.redirect(
        new URL(`/Login?error=${encodeURIComponent("User not found")}`, req.url)
      );
    }

    user.emailVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ userId, token });

    // Force session update
    await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ update: true }),
    });

    return NextResponse.redirect(
      new URL(`/register?step=2&verified=true`, req.url)
    );
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.redirect(
      new URL(`/Login?error=${encodeURIComponent("Failed to verify email")}`, req.url)
    );
  }
}