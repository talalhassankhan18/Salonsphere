import dbConnect from "@/dbConnect";
import SalonProduct from "@/mongoose-models/salonProduct";
import Salon from "@/mongoose-models/Salon";
import Product from "@/mongoose-models/product";
import SalonProductStats from "@/mongoose-models/salonProductStats";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireSuperAdmin } from "@/lib/auth/guards";

export async function GET(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get("salonId");
    const search = searchParams.get("search") || "";

    let query: any = {};
    if (salonId && mongoose.Types.ObjectId.isValid(salonId)) {
      query.salonId = salonId;
    }
    if (search) {
      query.productName = { $regex: search, $options: "i" };
    }

    const stats = await SalonProductStats.find(query)
      .sort({ lastUpdated: -1 })
      .lean();

    const aggregatedStats = await SalonProductStats.aggregate([
      {
        $group: {
          _id: "$productId",
          productName: { $first: "$productName" },
          totalStock: { $sum: "$stock" },
          totalSold: { $sum: "$sold" },
          salons: {
            $push: {
              salonId: "$salonId",
              salonName: "$salonName",
              stock: "$stock",
              desiredStock: "$desiredStock",
              sold: "$sold",
              uniqueProductCode: "$uniqueProductCode",
              commissionRate: "$commissionRate",
            },
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          productId: "$_id",
          productName: 1,
          totalStock: 1,
          totalSold: 1,
          salons: 1,
          originalPrice: "$product.price",
          discountPercent: "$product.discount",
          discountedPrice: {
            $cond: {
              if: { $gt: ["$product.discount", 0] },
              then: {
                $multiply: [
                  "$product.price",
                  { $subtract: [1, { $divide: ["$product.discount", 100] }] },
                ],
              },
              else: "$product.price",
            },
          },
          imageUrl: { $arrayElemAt: ["$product.imageUrls", 0] },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        detailedStats: stats,
        aggregatedStats,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/superadmin/product-stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product stats" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  await dbConnect();
  try {
    const { salonId, productId } = await request.json();

    if (
      !salonId ||
      !productId ||
      !mongoose.Types.ObjectId.isValid(salonId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid salonId or productId" },
        { status: 400 }
      );
    }

    const [salon, product, salonProduct] = await Promise.all([
      Salon.findById(salonId).select("salonName").lean(),
      Product.findById(productId)
        .select("name price discount imageUrls")
        .lean(),
      SalonProduct.findOne({ salonId, productId, isActive: true }).lean(),
    ]);

    if (!salon) {
      return NextResponse.json(
        { success: false, error: "Salon not found" },
        { status: 404 }
      );
    }
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    if (!salonProduct) {
      return NextResponse.json(
        { success: false, error: "Salon product not found or not active" },
        { status: 404 }
      );
    }

    const statsData = {
      salonId,
      salonName: salon.salonName,
      productId,
      productName: product.name,
      stock: salonProduct.stock,
      desiredStock: salonProduct.desiredStock,
      sold: salonProduct.sold,
      commissionRate: salonProduct.commissionRate,
      uniqueProductCode: salonProduct.uniqueProductCode,
      lastUpdated: new Date(),
    };

    await SalonProductStats.findOneAndUpdate(
      { salonId, productId },
      statsData,
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Product stats saved successfully",
    });
  } catch (error) {
    console.error("Error in POST /api/superadmin/product-stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save product stats" },
      { status: 500 }
    );
  }
}
