// /app/api/public-orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import Order from "@/mongoose-models/order";
import Customer from "@/mongoose-models/Customer";
import dbConnect from "@/dbConnect";
import nodemailer from "nodemailer";
import { IPopulatedOrder, IPopulatedOrderItem } from "@/mongoose-models/order";
import { ICustomer } from "@/mongoose-models/Customer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

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

transporter.verify((error) => {
  if (error) console.error("❌ Email transporter error:", error);
  else console.log("✅ Email transporter is ready");
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, paymentStatus } = await req.json();
    const id = params.id;

    // Validate status transitions
    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status) {
      // Check valid status values
      if (!["Pending", "Shipped", "Delivered", "Cancelled"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      // Check status transitions
      if (order.status === "Shipped" && status === "Pending") {
        return NextResponse.json(
          { error: "Cannot revert to Pending after Shipped" },
          { status: 400 }
        );
      }

      if (order.status === "Delivered") {
        if (status === "Pending" || status === "Shipped") {
          return NextResponse.json(
            {
              error: `Cannot revert to ${status} after Delivered`,
            },
            { status: 400 }
          );
        }
      }
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

    if (!order.customerId) {
      return NextResponse.json(
        { error: "Order is missing customerId" },
        { status: 400 }
      );
    }

    let updatedPaymentStatus = paymentStatus || order.paymentStatus;
    if (
      ["cash", "cash on delivery"].includes(order.paymentMethod.toLowerCase())
    ) {
      if (status === "Delivered" && !paymentStatus) {
        updatedPaymentStatus = "Completed";
      } else if (paymentStatus === "Pending") {
        updatedPaymentStatus = "Pending";
      }
    }

    let customerEmail = order.customerEmail;
    let customerName = order.customerName;
    if (!customerEmail || !customerName) {
      const customer = (await Customer.findById(order.customerId)
        .select("email name")
        .lean()) as Pick<ICustomer, "email" | "name"> | null;
      if (customer) {
        customerEmail = customer.email;
        customerName = customer.name || "Customer";
      } else {
        customerEmail = "no-email@example.com";
        customerName = "Unknown Customer";
      }
    }

    const updatedOrderData = await Order.findByIdAndUpdate(
      id,
      {
        status: status || order.status,
        paymentStatus: updatedPaymentStatus,
        customerEmail,
        customerName,
      },
      { new: true }
    )
      .populate("items.productId", "name price imageUrls")
      .populate("items.salonId", "salonName")
      .lean();

    if (!updatedOrderData) {
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    const updatedOrder: IPopulatedOrder = {
      ...updatedOrderData,
      _id: updatedOrderData._id.toString(),
      items: updatedOrderData.items as unknown as IPopulatedOrderItem[],
    };

    if (
      !updatedOrder.customerEmail ||
      updatedOrder.customerEmail === "no-email@example.com"
    ) {
      console.warn(
        `⚠️ No valid email for order ${updatedOrder._id}. Skipping email.`
      );
      return NextResponse.json({ order: updatedOrder }, { status: 200 });
    }

    const isCOD =
      updatedOrder.paymentMethod.toLowerCase() === "cash on delivery";
    const totalCommission = updatedOrder.items.reduce(
      (acc, item) =>
        item.salonId ? acc + item.subtotal * (item.commissionRate || 0) : acc,
      0
    );

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: updatedOrder.customerEmail,
      subject: `Order Status Update - Order #${updatedOrder._id}`,
      html: `
        <h1>Order Status Update</h1>
        <p>Dear ${updatedOrder.customerName || "Customer"},</p>
        <p>Your order #${updatedOrder._id} has been updated to <strong>${
        updatedOrder.status
      }</strong>.</p>
        <h2>Order Details</h2>
        <ul>
          <li><strong>Order ID:</strong> ${updatedOrder._id}</li>
          <li><strong>Date:</strong> ${new Date(
            updatedOrder.createdAt
          ).toLocaleDateString()}</li>
          <li><strong>Payment Method:</strong> ${
            updatedOrder.paymentMethod
          }</li>
          ${
            totalCommission > 0
              ? `<li><strong>Salon Commission:</strong> ₨${totalCommission.toFixed(
                  2
                )}</li>`
              : ""
          }
          <li><strong>Payment Status:</strong> ${
            updatedOrder.paymentStatus
          }</li>
        </ul>
        <h2>Shipping Address</h2>
        <p>${updatedOrder.shippingAddress.street}</p>
        <p>${updatedOrder.shippingAddress.city}, ${
        updatedOrder.shippingAddress.state
      }, ${updatedOrder.shippingAddress.postalCode}, ${
        updatedOrder.shippingAddress.country
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
          ${updatedOrder.items
            .map((item) => {
              const productName =
                typeof item.productId === "object" && "name" in item.productId
                  ? item.productId.name
                  : `Product ID: ${item.productId}`;
              const salonName = item.salonName || "N/A";
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
        <p>Subtotal: ₨${updatedOrder.subtotal.toFixed(2)}</p>
        <p>Shipping Fee: ₨${updatedOrder.shippingFee.toFixed(2)}</p>
        <p><strong>${
          isCOD ? "Amount to be Paid on Delivery" : "Total Paid"
        }: ₨${updatedOrder.total.toFixed(2)}</strong></p>
        <p>For queries, contact us at ${process.env.EMAIL_FROM}.</p>
        <p>Best regards,<br/>${process.env.EMAIL_FROM_NAME} Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `📧 Email sent to ${updatedOrder.customerEmail} for order ${updatedOrder._id}`
    );

    return NextResponse.json({ order: updatedOrder }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
