import { Request, Response } from "express";
import Order, { IOrder } from "@/mongoose-models/order";
import Product from "@/mongoose-models/product";
import SalonProduct from "@/mongoose-models/salonProduct";
import mongoose from "mongoose";

// Extend the Express Request type to include user
declare module "express" {
  interface Request {
    user?: {
      _id: mongoose.Types.ObjectId;
      role: string;
      salonId?: mongoose.Types.ObjectId;
    };
  }
}

interface OrderRequestBody {
  customerId: string;
  items: CartItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
}

interface CartItem {
  productId?: string;
  salonProductId?: string;
  quantity: number;
}

export const createOrder = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerId, items, shippingAddress, paymentMethod } =
      req.body as OrderRequestBody;

    if (!req.user || !req.user._id || req.user._id.toString() !== customerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const customerObjectId = new mongoose.Types.ObjectId(customerId);
    const orderItems: IOrder["items"] = [];
    let salonId: mongoose.Types.ObjectId | undefined;

    for (const item of items) {
      if (!item.productId && !item.salonProductId) {
        throw new Error(
          "Each item must have either productId or salonProductId"
        );
      }

      let product: any;
      let price: number;
      let commissionRate = 0;
      let salonProductId: mongoose.Types.ObjectId | undefined;

      if (item.salonProductId) {
        const salonProduct = await SalonProduct.findById(
          item.salonProductId
        ).session(session);
        if (!salonProduct || !salonProduct.isActive) {
          throw new Error(
            `Salon product ${item.salonProductId} not found or inactive`
          );
        }

        product = await Product.findById(salonProduct.productId).session(
          session
        );
        if (!product) {
          throw new Error(`Product ${salonProduct.productId} not found`);
        }

        if (!salonId) {
          salonId = salonProduct.salonId;
        } else if (!salonId.equals(salonProduct.salonId)) {
          throw new Error(
            "All items must be from the same salon or SuperAdmin"
          );
        }

        price = product.price * (1 - (product.discount || 0) / 100);
        commissionRate = salonProduct.commissionRate;
        salonProductId = salonProduct._id as mongoose.Types.ObjectId;
      } else {
        product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        price = product.price * (1 - (product.discount || 0) / 100);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      product.stock -= item.quantity;
      product.sold += item.quantity;
      product.revenue += price * item.quantity;
      await product.save({ session });

      orderItems.push({
        productId: product._id,
        salonProductId,
        quantity: item.quantity,
        priceAtPurchase: price,
        commissionRate: item.salonProductId ? commissionRate : undefined,
        commissionAmount: item.salonProductId
          ? price * item.quantity * commissionRate
          : undefined,
      });
    }

    const order = new Order({
      customerId: customerObjectId,
      items: orderItems,
      salonId,
      shippingAddress,
      paymentMethod,
      paymentStatus: "Paid",
      status: "Pending",
    });

    await order.save({ session });
    await session.commitTransaction();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const getOrdersForCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    if (!req.user || !req.user._id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (
      req.user._id.toString() !== customerId &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const orders = await Order.find({ customerId })
      .populate("items.productId", "name imageUrls")
      .populate("items.salonProductId", "salonId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrdersForSalon = async (req: Request, res: Response) => {
  try {
    const { salonId } = req.params;
    if (!req.user || !req.user._id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (
      req.user.salonId?.toString() !== salonId &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const orders = await Order.find({ salonId })
      .populate("customerId", "name email")
      .populate("items.productId", "name imageUrls")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrdersForSuperAdmin = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const orders = await Order.find()
      .populate("customerId", "name email")
      .populate("salonId", "name")
      .populate("items.productId", "name imageUrls")
      .populate("items.salonProductId", "salonId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!req.user || !req.user._id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (
      req.user.role !== "superadmin" &&
      (!order.salonId ||
        req.user.salonId?.toString() !== order.salonId.toString())
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
