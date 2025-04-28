import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const user = session.user as {
      _id: string;
      role: "admin" | "salon_admin" | "customer" | "super_admin" | "salonOwner";
    };

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const salon = await Salon.findOne({ userId }).lean();
    
    if (!salon) {
      return NextResponse.json(
        { error: "Salon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(salon);

  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error - Please try again later" },
      { status: 500 }
    );
  }
}