import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Order from "@/mongoose-models/order";
import SalonProduct from "@/mongoose-models/salonProduct";
import Stock from "@/mongoose-models/stock";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/dbConnect";
import { connectOr503 } from "@/lib/db-guard";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

if (process.env.NEXT_PHASE !== "phase-production-build") {
  transporter.verify((error) => {
    if (error) console.error("❌ Email transporter error:", error.message);
    else console.log("✅ Email transporter is ready");
  });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const dbError = await connectOr503();
  if (dbError) return dbError;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const userRole = session.user.role;
  if (!userRole) {
    return NextResponse.json({ error: "Role not found" }, { status: 403 });
  }

  const order = await Order.findById(params.id)
    .populate("items.productId", "name price imageUrls")
    .populate("items.salonId", "salonName")
    .populate("customerId", "name email")
    .lean();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (
    userRole === "customer" &&
    order.customerId?.toString() !== session.user.id
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (
    userRole === "salon_admin" &&
    !order.items.some(
      (item) => item.salonId?.toString() === session.user.salonId
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json({ order }, { status: 200 });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const dbError = await connectOr503();
  if (dbError) return dbError;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const userRole = session.user.role;
  if (!userRole || !["admin", "customer"].includes(userRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { status, paymentStatus } = await req.json();
  const orderId = params.id;

  const order = await Order.findById(orderId)
    .populate("items.productId", "name price imageUrls")
    .populate("items.salonId", "salonName")
    .lean();
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Customer-specific cancellation logic
  if (userRole === "customer") {
    if (order.customerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (order.status !== "Pending") {
      return NextResponse.json(
        { error: "Only Pending orders can be canceled" },
        { status: 400 }
      );
    }
    if (status !== "Cancelled") {
      return NextResponse.json(
        { error: "Invalid action for customer" },
        { status: 400 }
      );
    }

    // Start transaction for stock restoration
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      // Restore stock for salon products
      for (const item of order.items) {
        if (item.salonId && item.uniqueProductCode) {
          const salonProduct = await SalonProduct.findOne({
            salonId: item.salonId,
            uniqueProductCode: item.uniqueProductCode,
            isActive: true,
          }).session(mongoSession);
          if (salonProduct) {
            salonProduct.stock += item.quantity;
            salonProduct.sold -= item.quantity;
            await salonProduct.save({ session: mongoSession });

            const stockEntry = await Stock.findOne({
              productId: salonProduct.productId,
            }).session(mongoSession);
            if (stockEntry) {
              stockEntry.stockQuantity += item.quantity;
              stockEntry.reserved -= item.quantity;
              stockEntry.available =
                stockEntry.stockQuantity - stockEntry.reserved;
              await stockEntry.save({ session: mongoSession });

              // Update stats
              await fetch("/api/superadmin/product-stats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  salonId: item.salonId,
                  productId: salonProduct.productId,
                }),
              });
            }
          }
        }
      }

      // Update order status to Cancelled
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: "Cancelled", paymentStatus: "Failed" },
        { new: true }
      )
        .populate("items.productId", "name price imageUrls")
        .populate("items.salonId", "salonName")
        .lean();

      await mongoSession.commitTransaction();

      // Send email notifications
      const customerEmail = order.customerEmail || session.user.email || undefined;
      const customerName =
        order.customerName || session.user.name || "Customer";
      const superadminEmail =
        process.env.SUPER_ADMIN_EMAIL || "admin@example.com";

      const customerMailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: customerEmail,
        subject: `Order Cancellation - Order #${order._id}`,
        html: `
          <h1>Order Cancelled</h1>
          <p>Dear ${customerName},</p>
          <p>Your order #${order._id} has been successfully cancelled.</p>
          <p><strong>Order Details:</strong></p>
          <ul>
            <li><strong>Order ID:</strong> ${order._id}</li>
            <li><strong>Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</li>
            <li><strong>Total:</strong> ₨${order.total.toFixed(2)}</li>
          </ul>
          <p>For queries, contact us at ${process.env.EMAIL_FROM}.</p>
          <p>Best regards,<br/>${process.env.EMAIL_FROM_NAME} Team</p>
        `,
      };

      const adminMailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to: superadminEmail,
        subject: `Order Cancellation Notification - Order #${order._id}`,
        html: `
          <h1>Order Cancellation Notification</h1>
          <p>An order has been cancelled by customer ${customerName}.</p>
          <p><strong>Order Details:</strong></p>
          <ul>
            <li><strong>Order ID:</strong> ${order._id}</li>
            <li><strong>Customer ID:</strong> ${order.customerId}</li>
            <li><strong>Customer Email:</strong> ${customerEmail}</li>
            <li><strong>Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</li>
            <li><strong>Total:</strong> ₨${order.total.toFixed(2)}</li>
          </ul>
          <p>Please review the order in the admin dashboard.</p>
          <p>Best regards,<br/>${process.env.EMAIL_FROM_NAME} Team</p>
        `,
      };

      await Promise.all([
        transporter.sendMail(customerMailOptions),
        transporter.sendMail(adminMailOptions),
      ]);

      console.log(
        `📧 Emails sent to ${customerEmail} and ${superadminEmail} for order ${order._id}`
      );

      return NextResponse.json({ order: updatedOrder }, { status: 200 });
    } catch (error) {
      await mongoSession.abortTransaction();
      console.error("Error canceling order:", error);
      return NextResponse.json(
        { error: "Failed to cancel order" },
        { status: 500 }
      );
    } finally {
      mongoSession.endSession();
    }
  }

  // Admin-specific update logic
  if (userRole !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (
    status &&
    !["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].includes(
      status
    )
  ) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (
    paymentStatus &&
    !["Pending", "Completed", "Failed"].includes(paymentStatus)
  ) {
    return NextResponse.json(
      { error: "Invalid payment status" },
      { status: 400 }
    );
  }

  // Handle cash payment update logic
  let updatedPaymentStatus = order.paymentStatus;
  if (paymentStatus && order.paymentMethod.toLowerCase() === "cash") {
    if (paymentStatus === "Completed" && status === "Delivered") {
      updatedPaymentStatus = "Completed";
    } else if (paymentStatus === "Pending") {
      updatedPaymentStatus = "Pending";
    }
  } else if (paymentStatus && order.paymentMethod.toLowerCase() !== "cash") {
    updatedPaymentStatus = paymentStatus;
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      status: status || order.status,
      paymentStatus: updatedPaymentStatus || order.paymentStatus,
    },
    { new: true }
  )
    .populate("items.productId", "name price imageUrls")
    .populate("items.salonId", "salonName")
    .populate("customerId", "name email")
    .lean();

  return NextResponse.json({ order: updatedOrder }, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const dbError = await connectOr503();
  if (dbError) return dbError;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const userRole = session.user.role;
  if (!userRole || userRole !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const order = await Order.findById(params.id)
      .populate("items.productId", "name price")
      .populate("items.salonId", "salonName")
      .session(mongoSession);
    if (!order) {
      await mongoSession.abortTransaction();
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Restore stock for salon products
    for (const item of order.items) {
      if (item.salonId && item.uniqueProductCode) {
        const salonProduct = await SalonProduct.findOne({
          salonId: item.salonId,
          uniqueProductCode: item.uniqueProductCode,
          isActive: true,
        }).session(mongoSession);
        if (salonProduct) {
          salonProduct.stock += item.quantity;
          salonProduct.sold -= item.quantity;
          await salonProduct.save({ session: mongoSession });

          const stockEntry = await Stock.findOne({
            productId: salonProduct.productId,
          }).session(mongoSession);
          if (stockEntry) {
            stockEntry.stockQuantity += item.quantity;
            stockEntry.reserved -= item.quantity;
            stockEntry.available =
              stockEntry.stockQuantity - stockEntry.reserved;
            await stockEntry.save({ session: mongoSession });

            // Update stats
            await fetch("/api/superadmin/product-stats", {
              method: "POST",
              headers: { "GFontent-Type": "application/json" },
              body: JSON.stringify({
                salonId: item.salonId,
                productId: salonProduct.productId,
              }),
            });
          }
        }
      }
    }

    await order.deleteOne({ session: mongoSession });
    await mongoSession.commitTransaction();
    return NextResponse.json({ message: "Order deleted" }, { status: 200 });
  } catch (error) {
    await mongoSession.abortTransaction();
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  } finally {
    mongoSession.endSession();
  }
}