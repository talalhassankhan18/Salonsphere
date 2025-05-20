import dbConnect from "@/dbConnect";
import Product from "@/mongoose-models/product";
import Salon from "@/mongoose-models/Salon";
import SalonProduct from "@/mongoose-models/salonProduct";
import Category from "@/mongoose-models/categories";
import Attribute from "@/mongoose-models/Attribute";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

interface PopulatedSalonProduct {
  _id: string;
  salonId: string;
  productId: {
    _id: string;
    name: string;
    category: { name: string } | null;
    price: number;
    discount?: number;
    stock: number;
    imageUrls: string[];
    description?: string;
    howToUse?: string;
    attributes?: {
      attributeId: { name: string; values: string[] };
      value: string;
    }[];
    rating?: number;
  } | null;
  commissionRate: number;
  isActive: boolean;
  desiredStock: number;
  stock: number;
  uniqueProductCode: string;
  sold: number;
}

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const salonId = searchParams.get("salonId");
    const search = searchParams.get("search") || "";

    if (!salonId || !mongoose.Types.ObjectId.isValid(salonId)) {
      return NextResponse.json(
        { success: false, error: "Valid salon ID is required" },
        { status: 400 }
      );
    }

    const salon = await Salon.findById(salonId).select("plan").lean();
    if (!salon) {
      return NextResponse.json(
        { success: false, error: "Salon not found" },
        { status: 404 }
      );
    }

    const plan = salon.plan?.name?.toLowerCase() || "basic";
    const productLimit =
      plan === "premium" ? Infinity : salon.plan?.productLimit || 100;

    const listedSalonProducts = await SalonProduct.find({
      salonId,
      isActive: true,
    })
      .select("productId")
      .lean();
    const listedProductIds = listedSalonProducts.map((sp) =>
      sp.productId.toString()
    );

    const listingCategory = await Category.findOne({
      name: { $regex: "^For Salon Listing$", $options: "i" },
    })
      .select("_id")
      .lean();
    if (!listingCategory) {
      return NextResponse.json(
        { success: false, error: "Category 'For Salon Listing' not found" },
        { status: 404 }
      );
    }

    let query: any = {
      _id: { $nin: listedProductIds },
      category: listingCategory._id,
    };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const availableProducts = await Product.find(query)
      .populate("category", "name")
      .populate("attributes.attributeId", "name values")
      .lean()
      .then((products) =>
        products.map((p) => {
          const originalPrice = p.price || 0;
          const discountPercent = p.discount || 0;
          const discountedPrice =
            discountPercent > 0
              ? originalPrice * (1 - discountPercent / 100)
              : originalPrice;
          return {
            ...p,
            imageUrl: p.imageUrls?.[0] || "",
            originalPrice,
            discountedPrice,
            discountPercent,
          };
        })
      );

    const salonProductsRaw = await SalonProduct.find({
      salonId,
      isActive: true,
    })
      .populate({
        path: "productId",
        model: "Product",
        select:
          "name price discount stock imageUrls description howToUse attributes category rating",
        populate: [
          { path: "category", model: "Category", select: "name" },
          {
            path: "attributes.attributeId",
            model: "Attribute",
            select: "name values",
          },
        ],
        match: { category: listingCategory._id },
      })
      .lean();

    const listedProducts = (
      salonProductsRaw as unknown as PopulatedSalonProduct[]
    )
      .map((sp) => {
        if (!sp.productId) return null;
        const { price, discount, imageUrls } = sp.productId;
        const originalPrice = price || 0;
        const discountPercent = discount || 0;
        const discountedPrice =
          discountPercent > 0
            ? originalPrice * (1 - discountPercent / 100)
            : originalPrice;

        return {
          salonProductId: sp._id.toString(),
          _id: sp.productId._id.toString(),
          name: sp.productId.name,
          category: sp.productId.category || { name: "For Salon Listing" },
          price: discountedPrice,
          originalPrice,
          discountPercent,
          rating: sp.productId.rating || 0,
          stock: sp.stock || 0,
          desiredStock: sp.desiredStock || 0,
          imageUrl: imageUrls?.[0] || "",
          description: sp.productId.description,
          howToUse: sp.productId.howToUse,
          attributes: sp.productId.attributes,
          commissionRate: sp.commissionRate,
          uniqueProductCode: sp.uniqueProductCode,
          sold: sp.sold || 0,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        availableProducts,
        listedProducts,
        plan: {
          name: plan.charAt(0).toUpperCase() + plan.slice(1),
          productLimit,
          currentCount: listedProducts.length,
        },
      },
    });
  } catch (error) {
    console.error("Error in GET /api/salon/products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { salonId, productId, desiredStock } = await request.json();

    if (
      !salonId ||
      !productId ||
      !mongoose.Types.ObjectId.isValid(salonId) ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      typeof desiredStock !== "number" ||
      desiredStock < 0
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const salon = await Salon.findById(salonId).select("plan").lean();
    if (!salon) {
      return NextResponse.json(
        { success: false, error: "Salon not found" },
        { status: 404 }
      );
    }

    const listingCategory = await Category.findOne({
      name: { $regex: "^For Salon Listing$", $options: "i" },
    })
      .select("_id")
      .lean();
    if (!listingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const product = await Product.findOne({
      _id: productId,
      category: listingCategory._id,
    }).lean();
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not allowed" },
        { status: 404 }
      );
    }

    const existing = await SalonProduct.findOne({ salonId, productId }).lean();
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Product already listed" },
        { status: 400 }
      );
    }

    const plan = salon.plan?.name?.toLowerCase() || "basic";
    const productLimit =
      plan === "premium" ? Infinity : salon.plan?.productLimit || 100;
    const currentCount = await SalonProduct.countDocuments({
      salonId,
      isActive: true,
    });

    if (currentCount >= productLimit) {
      return NextResponse.json(
        {
          success: false,
          error: `Limit reached (${productLimit} for ${plan} plan)`,
        },
        { status: 403 }
      );
    }

    const newSalonProduct = new SalonProduct({
      salonId,
      productId,
      commissionRate: 0.05,
      desiredStock,
      stock: desiredStock,
      sold: 0,
      uniqueProductCode: `SP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    });

    await newSalonProduct.save();

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error in POST /api/salon/products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  await dbConnect();
  try {
    const { salonId, salonProductId, stock } = await request.json();

    // Validate inputs
    if (
      !salonId ||
      !salonProductId ||
      !mongoose.Types.ObjectId.isValid(salonId) ||
      !mongoose.Types.ObjectId.isValid(salonProductId) ||
      typeof stock !== "number" ||
      stock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid input: salonId, salonProductId, and stock (non-negative number) are required",
        },
        { status: 400 }
      );
    }

    // Verify the salon exists
    const salon = await Salon.findById(salonId).lean();
    if (!salon) {
      return NextResponse.json(
        { success: false, error: "Salon not found" },
        { status: 404 }
      );
    }

    // Find and update the salon product
    const salonProduct = await SalonProduct.findOne({
      _id: salonProductId,
      salonId,
      isActive: true,
    });
    if (!salonProduct) {
      return NextResponse.json(
        { success: false, error: "Salon product not found or not active" },
        { status: 404 }
      );
    }

    // Update the stock
    salonProduct.stock = stock;
    await salonProduct.save();

    return NextResponse.json({
      success: true,
      message: "Stock updated successfully",
      stock: salonProduct.stock,
    });
  } catch (error) {
    console.error("Error in PUT /api/salon/products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update stock" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  await dbConnect();
  try {
    const { salonProductId } = await request.json();

    if (!salonProductId || !mongoose.Types.ObjectId.isValid(salonProductId)) {
      return NextResponse.json(
        { success: false, error: "Invalid salonProductId" },
        { status: 400 }
      );
    }

    const salonProduct = await SalonProduct.findById(salonProductId);
    if (!salonProduct) {
      return NextResponse.json(
        { success: false, error: "Salon product not found" },
        { status: 404 }
      );
    }

    await salonProduct.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Salon product deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/salon/products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
