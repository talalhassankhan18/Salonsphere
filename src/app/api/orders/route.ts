import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Order from "@/mongoose-models/order";
import SalonProduct from "@/mongoose-models/salonProduct";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/dbConnect";
import nodemailer from "nodemailer";
import {
  IOrder,
  IPopulatedOrder,
  IOrderItemSchema,
  IPopulatedOrderItem,
} from "@/mongoose-models/order";

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP config once at startup, but not while `next build` is
// importing route modules for static analysis.
if (process.env.NEXT_PHASE !== "phase-production-build") {
  transporter.verify((error) => {
    if (error) console.error("❌ Email transporter error:", error.message);
    else console.log("✅ Email transporter is ready");
  });
}

// POST /api/orders - Create Order
export async function POST(request: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role;
  if (!userRole || !["customer", "salon_admin"].includes(userRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    customerId,
    items,
    shippingAddress,
    shippingFee,
    paymentMethod,
    subtotal,
    total,
    customerName,
    customerEmail,
  } = body;

  if (!customerId || !items || !shippingAddress || shippingFee === undefined) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if (subtotal === undefined || total === undefined) {
    return NextResponse.json(
      { error: "Subtotal and total are required" },
      { status: 400 },
    );
  }

  try {
    // Use provided customerName and customerEmail or fallback to session data
    const orderCustomerName =
      customerName || session.user.name || "Unknown Customer";
    const orderCustomerEmail =
      customerEmail || session.user.email || "default@example.com";

    const newOrder = new Order({
      customerId,
      customerName: orderCustomerName,
      customerEmail: orderCustomerEmail,
      items: items as IOrderItemSchema[],
      shippingAddress,
      shippingFee,
      paymentMethod,
      subtotal,
      total,
      status: "Pending",
      paymentStatus:
        paymentMethod.toLowerCase() === "cash" ||
        paymentMethod.toLowerCase() === "cash on delivery"
          ? "Pending"
          : "Completed",
    });

    // Save and populate order
    const savedOrderDoc = await newOrder.save();
    const populatedOrder = (await Order.findById(savedOrderDoc._id)
      .populate("items.productId", "name price imageUrls")
      .populate("items.salonId", "salonName")
      .lean()) as IPopulatedOrder | null;

    if (!populatedOrder) {
      throw new Error("Order not found after saving");
    }

    // Send confirmation email
    const isCOD =
      populatedOrder.paymentMethod.toLowerCase() === "cash on delivery";
    const totalCommission = populatedOrder.items.reduce(
      (acc, item) =>
        item.salonId ? acc + item.subtotal * (item.commissionRate || 0) : acc,
      0,
    );

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: orderCustomerEmail,
      subject: `Order Confirmation - Order #${populatedOrder._id}`,
      html: `
        <h1>Order Confirmation</h1>
        <p>Dear ${orderCustomerName},</p>
        <p>Thank you for your purchase! Below are your order details:</p>
        <ul>
          <li><strong>Order ID:</strong> ${populatedOrder._id}</li>
          <li><strong>Date:</strong> ${new Date(
            populatedOrder.createdAt,
          ).toLocaleDateString()}</li>
          <li><strong>Payment Method:</strong> ${
            populatedOrder.paymentMethod
          }</li>
          ${
            totalCommission > 0
              ? `<li><strong>Salon Commission:</strong> ₨${totalCommission.toFixed(
                  2,
                )}</li>`
              : ""
          }
        </ul>
        <h2>Shipping Address</h2>
        <p>${populatedOrder.shippingAddress.street}</p>
        <p>${populatedOrder.shippingAddress.city}, ${
          populatedOrder.shippingAddress.state
        }, ${populatedOrder.shippingAddress.postalCode}, ${
          populatedOrder.shippingAddress.country
        }</p>
        <h2>Ordered Products</h2>
        <table border="1" cellpadding="5" cellspacing="0">
          <tr>
            <th>Product</th>
            <th>Code</th>
            <th>Quantity</th>
            <th>Unit Price (PKR)</th>
            <th>Subtotal (PKR)</th>
            <th>Commission (PKR)</th>
          </tr>
          ${populatedOrder.items
            .map((item) => {
              const productName =
                typeof item.productId === "object" && "name" in item.productId
                  ? item.productId.name
                  : `Product ID: ${item.productId}`;
              const salonName =
                typeof item.salonId === "object" && "salonName" in item.salonId
                  ? item.salonId.salonName
                  : item.salonName || "N/A";
              const commission = item.salonId
                ? (item.subtotal * (item.commissionRate || 0)).toFixed(2)
                : "0.00";
              return `
                <tr>
                  <td>${
                    salonName !== "N/A"
                      ? `${productName} - ${salonName}`
                      : productName
                  }</td>
                  <td>${item.uniqueProductCode || "N/A"}</td>
                  <td>${item.quantity}</td>
                  <td>₨${item.unitPrice.toFixed(2)}</td>
                  <td>₨${item.subtotal.toFixed(2)}</td>
                  <td>₨${commission}</td>
                </tr>
              `;
            })
            .join("")}
        </table>
        <h2>Summary</h2>
        <p>Subtotal: ₨${populatedOrder.subtotal.toFixed(2)}</p>
        <p>Shipping Fee: ₨${populatedOrder.shippingFee.toFixed(2)}</p>
        <p><strong>${
          isCOD ? "Amount to be Paid on Delivery" : "Total Paid"
        }: ₨${populatedOrder.total.toFixed(2)}</strong></p>
        <p>Your order will be delivered within 5-6 working days. For queries, contact us at ${
          process.env.EMAIL_FROM
        }.</p>
        <p>Best regards,<br/>${process.env.EMAIL_FROM_NAME} Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `📧 Email sent to ${orderCustomerEmail} for order ${populatedOrder._id}`,
    );

    return NextResponse.json({ order: populatedOrder }, { status: 201 });
  } catch (error) {
    console.error("Error processing order:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Failed to create order: ${errorMessage}` },
      { status: 500 },
    );
  }
}

// GET /api/orders - Fetch orders by role
export async function GET(request: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const salonId = searchParams.get("salonId");
  let populatedOrders: IPopulatedOrder[] = [];

  try {
    const superadminId = "superadmin123"; // Replace with actual superadmin userId
    if (userId === superadminId) {
      populatedOrders = (await Order.getAllOrders()
        .populate("items.productId", "name price imageUrls")
        .populate("items.salonId", "salonName")
        .populate("customerId", "name email")
        .lean()) as unknown as IPopulatedOrder[];
    } else if (session.user.role === "customer") {
      populatedOrders = (await Order.find({ customerId: session.user.id })
        .populate("items.productId", "name price imageUrls")
        .populate("items.salonId", "salonName")
        .populate("customerId", "name email")
        .lean()) as unknown as IPopulatedOrder[];
    } else if (session.user.role === "salon_admin") {
      if (!salonId || salonId !== session.user.salonId) {
        return NextResponse.json(
          { error: "Invalid or missing salonId" },
          { status: 403 },
        );
      }
      populatedOrders = (await Order.getSalonOrders(
        new mongoose.Types.ObjectId(salonId),
      )
        .populate("items.productId", "name price imageUrls")
        .populate("items.salonId", "salonName")
        .populate("customerId", "name email")
        .lean()) as unknown as IPopulatedOrder[];
    } else {
      populatedOrders = (await Order.find({ customerId: session.user.id })
        .populate("items.productId", "name price imageUrls")
        .populate("items.salonId", "salonName")
        .populate("customerId", "name email")
        .lean()) as unknown as IPopulatedOrder[];
    }

    return NextResponse.json({ orders: populatedOrders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Failed to fetch orders: ${errorMessage}` },
      { status: 500 },
    );
  }
}
