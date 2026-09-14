import { NextResponse } from "next/server";
import mongoose from "mongoose";
import SalonProduct from "@/mongoose-models/salonProduct";
import Product from "@/mongoose-models/product";
import Salon from "@/mongoose-models/Salon";
import dbConnect from "@/dbConnect";

interface PopulatedSalonProduct {
  _id: mongoose.Types.ObjectId;
  productId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    price: number;
  };
  salonId?: {
    _id: mongoose.Types.ObjectId;
    salonName: string; // Changed from "name" to "salonName"
  };
  commissionRate: number;
  isActive: boolean;
  uniqueProductCode: string; // Added uniqueProductCode
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    // Ensure models are registered
    if (!mongoose.models.Product) {
      mongoose.model("Product", Product.schema);
    }
    if (!mongoose.models.Salon) {
      mongoose.model("Salon", Salon.schema);
    }

    const { productIds } = await request.json();
    console.log("Received productIds:", productIds);

    // Validate input
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Product IDs array is required" },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    const invalidIds = productIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid product ID(s): ${invalidIds.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch salon products with proper population
    const salonProducts = await SalonProduct.find({
      productId: {
        $in: productIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
      isActive: true,
    })
      .populate<{
        productId: {
          _id: mongoose.Types.ObjectId;
          name: string;
          price: number;
        };
      }>("productId", "name price")
      .populate<{
        salonId: { _id: mongoose.Types.ObjectId; salonName: string };
      }>(
        "salonId",
        "salonName" // Changed from "name" to "salonName"
      )
      .lean()
      .exec();

    if (!salonProducts || salonProducts.length === 0) {
      return NextResponse.json(
        { error: "No active salon products found" },
        { status: 404 }
      );
    }

    // Debug populated salon data
    salonProducts.forEach((sp) => {
      console.log("Populated Salon Product:", {
        productId: sp.productId._id,
        salonId: sp.salonId?._id,
        salonName: sp.salonId?.salonName, // Changed from .name to .salonName
        commissionRate: sp.commissionRate,
        uniqueProductCode: sp.uniqueProductCode, // Added for debugging
      });
    });

    // Format response
    const response = salonProducts.map((sp) => ({
      productId: sp.productId._id.toString(),
      productName: sp.productId.name,
      productPrice: sp.productId.price,
      salonId: sp.salonId?._id?.toString() || null,
      salonName: sp.salonId?.salonName || null, // Changed from .name to .salonName
      commissionRate: sp.commissionRate || 0.05,
      uniqueProductCode: sp.uniqueProductCode, // Added uniqueProductCode
    }));

    return NextResponse.json({ salonProducts: response }, { status: 200 });
  } catch (error) {
    console.error("Error in salon-products endpoint:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
