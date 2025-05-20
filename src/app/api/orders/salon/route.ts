import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Order from "@/mongoose-models/order";
import Customer from "@/mongoose-models/Customer";
import Product from "@/mongoose-models/product";
import Salon from "@/mongoose-models/Salon";
import dbConnect from "@/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.email) {
      console.log("Unauthorized: No session or email found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const customer = await Customer.findOne({ email: session.user.email });
    if (!customer || customer.role !== "customer") {
      console.log("Customer not found for email:", session.user.email);
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    console.log("Received order payload:", body);

    const {
      customerId,
      items,
      salonId,
      customerDetails,
      totalAmount,
      deliveryFee,
      paymentMethod,
      paymentStatus,
      orderStatus,
      orderType,
    } = body;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      console.log("Invalid customer ID format:", customerId);
      return NextResponse.json(
        { error: "Invalid customer ID format" },
        { status: 400 }
      );
    }
    if (customerId !== customer._id.toString()) {
      console.log("Customer ID mismatch:", customerId, customer._id.toString());
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 403 }
      );
    }

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        console.log("Invalid product ID format:", item.productId);
        return NextResponse.json(
          { error: `Invalid product ID format: ${item.productId}` },
          { status: 400 }
        );
      }
      const product = await Product.findById(item.productId);
      if (!product) {
        console.log("Product not found:", item.productId);
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }
      if (item.salonId) {
        if (!mongoose.Types.ObjectId.isValid(item.salonId)) {
          console.log("Invalid salon ID format:", item.salonId);
          return NextResponse.json(
            { error: `Invalid salon ID format: ${item.salonId}` },
            { status: 400 }
          );
        }
        const salon = await Salon.findById(item.salonId);
        if (!salon) {
          console.log("Salon not found:", item.salonId);
          return NextResponse.json(
            { error: `Salon ${item.salonId} not found` },
            { status: 404 }
          );
        }
      }
    }

    if (salonId) {
      if (!mongoose.Types.ObjectId.isValid(salonId)) {
        console.log("Invalid salon ID format:", salonId);
        return NextResponse.json(
          { error: "Invalid salon ID format" },
          { status: 400 }
        );
      }
      const salon = await Salon.findById(salonId);
      if (!salon) {
        console.log("Salon not found:", salonId);
        return NextResponse.json({ error: "Salon not found" }, { status: 404 });
      }
    }

    const order = new Order({
      customerId,
      customerDetails,
      items,
      totalAmount,
      deliveryFee,
      paymentMethod,
      paymentStatus,
      orderStatus,
      orderType,
      salonId,
    });

    console.log("Saving order to database:", order);
    const savedOrder = await order.save();
    console.log("Order saved successfully with ID:", savedOrder._id);

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate({
        path: "customerId",
        select: "name email",
        strictPopulate: false,
      })
      .populate({
        path: "items.productId",
        select: "name price",
        strictPopulate: false,
      })
      .populate({ path: "salonId", select: "name", strictPopulate: false });

    return NextResponse.json({ order: populatedOrder }, { status: 201 });
  } catch (error) {
    console.error("Error saving order:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      console.log("Unauthorized: Not an admin");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const orders = await Order.find()
      .populate({
        path: "customerId",
        select: "name email",
        strictPopulate: false,
      })
      .populate({
        path: "items.productId",
        select: "name price",
        strictPopulate: false,
      })
      .populate({ path: "salonId", select: "name", strictPopulate: false })
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
