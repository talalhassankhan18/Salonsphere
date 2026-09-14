import mongoose, { Schema, Document, Model, Query } from "mongoose";
import Product from "./product";
import Salon from "./Salon";
import SalonProduct from "./salonProduct";
import Customer from "./Customer"; // Add Customer import

// Interface for Product when populated (lean output)
interface PopulatedProduct {
  _id: string;
  name: string;
  price: number;
  imageUrls: string[];
}

// Interface for Salon when populated (lean output)
interface PopulatedSalon {
  _id: string;
  salonName: string;
}

// Interface for Order Item (schema definition)
export interface IOrderItemSchema {
  productId: mongoose.Types.ObjectId;
  salonId?: mongoose.Types.ObjectId;
  salonName?: string;
  uniqueProductCode?: string;
  quantity: number;
  unitPrice: number;
  commissionRate?: number;
  subtotal: number;
}

// Interface for Order Item with populated fields (lean output)
export interface IPopulatedOrderItem {
  productId: PopulatedProduct | string;
  salonId?: PopulatedSalon | string;
  salonName?: string;
  uniqueProductCode?: string;
  quantity: number;
  unitPrice: number;
  commissionRate?: number;
  subtotal: number;
}

// Interface for Order document (schema definition)
export interface IOrder extends Document {
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: IOrderItemSchema[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  shippingFee: number;
  total: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "Pending" | "Completed" | "Failed";
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Order with populated fields (lean output)
export interface IPopulatedOrder {
  _id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: IPopulatedOrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  shippingFee: number;
  total: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "Pending" | "Completed" | "Failed";
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the model with static methods
interface OrderModel extends Model<IOrder> {
  getAllOrders: () => Query<IOrder[], IOrder>;
  getSalonOrders: (salonId: mongoose.Types.ObjectId) => Query<IOrder[], IOrder>;
}

// Interface for ISalonProduct based on usage
interface ISalonProduct {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  salonId: mongoose.Types.ObjectId;
  stock: number;
  sold: number;
  commissionRate: number;
  uniqueProductCode: string;
}

// Sub-schema for Order Item
const OrderItemSchema: Schema<IOrderItemSchema> = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    salonId: {
      type: Schema.Types.ObjectId,
      ref: "Salon",
    },
    salonName: {
      type: String,
      trim: true,
    },
    uniqueProductCode: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, "Unit price cannot be negative"],
    },
    commissionRate: {
      type: Number,
      min: [0, "Commission rate cannot be negative"],
      max: [1, "Commission rate cannot exceed 100%"],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
  },
  { _id: false }
);

// Main Order schema
const OrderSchema: Schema<IOrder> = new Schema(
  {
    customerId: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItemSchema[]) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    shippingFee: {
      type: Number,
      required: true,
      min: [0, "Shipping fee cannot be negative"],
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ "items.salonId": 1 });
OrderSchema.index({ status: 1 });

// Pre-save middleware for validation, calculations, and stock management
OrderSchema.pre<IOrder>("save", async function (next) {
  try {
    let calculatedSubtotal = 0;

    for (const item of this.items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return next(new Error(`Invalid product ID: ${item.productId}`));
      }

      const product = await Product.findById(item.productId).lean();
      if (!product) {
        return next(
          new Error(`Product with ID ${item.productId} does not exist`)
        );
      }

      if (item.salonId) {
        if (!mongoose.Types.ObjectId.isValid(item.salonId)) {
          return next(new Error(`Invalid salon ID: ${item.salonId}`));
        }

        const salon = await Salon.findById(item.salonId).lean();
        if (!salon) {
          return next(
            new Error(`Salon with ID ${item.salonId} does not exist`)
          );
        }

        const salonProduct = (await SalonProduct.findOne({
          salonId: item.salonId,
          productId: item.productId,
        }).lean()) as ISalonProduct | null;
        if (!salonProduct) {
          return next(
            new Error(
              `Product ${item.productId} is not listed by salon ${item.salonId}`
            )
          );
        }

        item.salonName = salon.salonName;
        item.uniqueProductCode = salonProduct.uniqueProductCode;
        item.unitPrice = product.price * (1 - (product.discount || 0) / 100);
        item.commissionRate = salonProduct.commissionRate;

        // Update salon product stock
        if (salonProduct.stock < item.quantity) {
          return next(
            new Error(
              `Insufficient stock for product ${product.name} at ${salon.salonName}`
            )
          );
        }
        await SalonProduct.findOneAndUpdate(
          { _id: salonProduct._id },
          { $inc: { stock: -item.quantity, sold: item.quantity } }
        );
      } else {
        item.salonName = undefined;
        item.uniqueProductCode = undefined;
        item.unitPrice = product.price * (1 - (product.discount || 0) / 100);
        item.commissionRate = undefined;

        // Update direct product stock
        if (product.stock < item.quantity) {
          return next(
            new Error(`Insufficient stock for product ${product.name}`)
          );
        }
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity, sold: item.quantity },
        });
      }

      item.subtotal = item.unitPrice * item.quantity;
      calculatedSubtotal += item.subtotal;
    }

    this.subtotal = calculatedSubtotal;
    this.total = this.subtotal + this.shippingFee;

    next();
  } catch (error) {
    console.error("Order pre-save middleware error:", error);
    next(error instanceof Error ? error : new Error("Unknown error occurred"));
  }
});

// Static methods (updated to remove customerId population)
OrderSchema.statics.getAllOrders = function () {
  return this.find()
    .populate("items.productId", "name price imageUrls")
    .populate("items.salonId", "salonName");
};

OrderSchema.statics.getSalonOrders = function (
  salonId: mongoose.Types.ObjectId
) {
  return this.find({ "items.salonId": salonId })
    .populate("items.productId", "name price imageUrls")
    .populate("items.salonId", "salonName");
};

const Order: OrderModel =
  (mongoose.models.Order as OrderModel) ||
  mongoose.model<IOrder, OrderModel>("Order", OrderSchema);

export default Order;
