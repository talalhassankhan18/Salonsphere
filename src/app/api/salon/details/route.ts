import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Salon from "@/mongoose-models/Salon";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email } = await req.json(); // Parse the JSON body to get the email

    console.log(`Fetching salon details for email ${email}`);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const salon = await Salon.findOne({ email }).select(
      "salonName name email isActive paymentStatus lastStep plan _id avatar"
    );
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      salonId: salon._id.toString(),
      salonName: salon.salonName,
      name: salon.name,
      email: salon.email,
      isActive: salon.isActive,
      paymentStatus: salon.paymentStatus,
      lastStep: salon.lastStep || "/salon/register/basic-info",
      plan: salon.plan
        ? {
            name: salon.plan.name,
            monthlyPrice: salon.plan.monthlyPrice,
            yearlyPrice: salon.plan.yearlyPrice,
            productLimit: salon.plan.productLimit,
            features: salon.plan.features,
            isActive: salon.plan.isActive,
            upgradedAt: salon.plan.upgradedAt,
          }
        : null,
      avatar: salon.avatar || "/default-salon-image.jpg",
    });
  } catch (error: any) {
    console.error("Salon details error:", error);
    return NextResponse.json(
      { error: `Failed to load salon details: ${error.message}` },
      { status: 500 }
    );
  }
}

// Keep the GET handler unchanged
export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    console.log(`Fetching salon details for ID ${id}`);

    if (!id) {
      return NextResponse.json(
        { error: "Salon ID is required" },
        { status: 400 }
      );
    }

    const salon = await Salon.findById(id).select(
      "salonName name email isActive paymentStatus lastStep plan _id avatar"
    );
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      salonId: salon._id.toString(),
      salonName: salon.salonName,
      name: salon.name,
      email: salon.email,
      isActive: salon.isActive,
      paymentStatus: salon.paymentStatus,
      lastStep: salon.lastStep || "/salon/register/basic-info",
      plan: salon.plan
        ? {
            name: salon.plan.name,
            monthlyPrice: salon.plan.monthlyPrice,
            yearlyPrice: salon.plan.yearlyPrice,
            productLimit: salon.plan.productLimit,
            features: salon.plan.features,
            isActive: salon.plan.isActive,
            upgradedAt: salon.plan.upgradedAt,
          }
        : null,
      avatar: salon.avatar || "/default-salon-image.jpg",
    });
  } catch (error: any) {
    console.error("Salon details error:", error);
    return NextResponse.json(
      { error: `Failed to load salon details: ${error.message}` },
      { status: 500 }
    );
  }
}