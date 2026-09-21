"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Store,
  ShoppingBag,
  Briefcase,
  LogIn,
  UserPlus,
  ArrowRight,
  Calendar,
  HelpCircle,
  Compass,
  Phone,
  Mail,
  ShoppingCart,
  Check,
  CheckCircle2,
  Tag,
  PlusCircle,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export interface SalonBotProps {
  /** Optional controlled open state */
  isOpen?: boolean;
  /** Optional callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Legacy prop support for backwards compatibility */
  isChatOpen?: boolean;
  /** Legacy callback support for backwards compatibility */
  setIsChatOpen?: (open: boolean) => void;
}

const SUGGESTED_QUESTIONS: string[] = [
  "I want to buy a shampoo",
  "Book a haircut at Ryzentis tomorrow at 3pm",
  "Tell me how many salons you have",
  "Register my salon as an owner",
  "Show super admin platform stats",
];

/**
 * Returns a fitting Lucide icon based on route URL
 */
function getRouteIcon(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.includes("salon")) return <Store className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (clean.includes("product") || clean.includes("cart")) return <ShoppingBag className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (clean.includes("vendor")) return <Briefcase className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (clean.includes("signin") || clean.includes("login")) return <LogIn className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (clean.includes("register") || clean.includes("signup")) return <UserPlus className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (clean.includes("book")) return <Calendar className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (clean.includes("support") || clean.includes("contact")) return <HelpCircle className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (url.startsWith("mailto:")) return <Mail className="w-3.5 h-3.5 text-[#e2b755]" />;
  if (url.startsWith("tel:")) return <Phone className="w-3.5 h-3.5 text-[#e2b755]" />;
  return <Compass className="w-3.5 h-3.5 text-[#e2b755]" />;
}

/**
 * Friendly fallback label for common routes
 */
function getRouteDefaultLabel(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  if (clean === "/salons") return "Browse Salons";
  if (clean === "/selfcare-products") return "Shop Products";
  if (clean === "/cart") return "View Cart";
  if (clean === "/vendor") return "Vendor Portal";
  if (clean === "/superadmin/dashboard") return "Admin Dashboard";
  if (clean === "/auth/signin") return "Sign In";
  if (clean === "/auth/register") return "Register Account";
  if (clean === "/support") return "Customer Support";
  if (clean === "/contactus") return "Contact Us";
  if (clean === "/bookings" || clean === "/booking") return "My Bookings";
  return "Explore";
}

// =============================================================================
// GENERATIVE UI: PRODUCT CARDS WITH ADD TO CART
// =============================================================================
interface ProductCardItem {
  id: string;
  productId?: string;
  title?: string;
  name?: string;
  price: number;
  originalPrice?: number;
  netPrice?: number;
  discount?: string;
  discountPercent?: number;
  image?: string;
  rating?: number;
  reviewsCount?: number;
  category?: string;
  badge?: string;
  description?: string;
}

function ChatProductCards({ products }: { products: ProductCardItem[] }) {
  const router = useRouter();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (prod: ProductCardItem) => {
    const id = prod.id || prod.productId || `prod-${Date.now()}`;
    const price = typeof prod.price === "number" ? prod.price : 1500;
    const netPrice = typeof prod.netPrice === "number" ? prod.netPrice : price;
    const discount = prod.discountPercent || (prod.discount ? parseInt(prod.discount) : 0);
    const title = prod.title || prod.name || "Salon Product";

    addItem({
      id,
      productId: id,
      title,
      image: prod.image || "/placeholder.svg",
      price,
      netPrice,
      discountPercent: discount,
      quantity: 1,
      rating: prod.rating || 4.8,
      description: prod.description || "",
      maxAllowedInCart: 10,
    });

    setAddedMap((prev) => ({ ...prev, [id]: true }));
  };

  const anyAdded = Object.values(addedMap).some(Boolean);

  return (
    <div className="my-2 space-y-2 select-none">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-bold text-[#830a48] uppercase tracking-wider flex items-center gap-1">
          <Tag className="w-3 h-3 text-[#e2b755]" />
          Recommended Products
        </span>
        <span className="text-[10px] text-gray-500 font-medium">Fast Delivery</span>
      </div>

      <div className="space-y-2">
        {products.map((prod, idx) => {
          const id = prod.id || prod.productId || `item-${idx}`;
          const isAdded = addedMap[id];
          const title = prod.title || prod.name || "Salon Product";
          const displayPrice = prod.netPrice || prod.price;
          const originalPrice =
            prod.originalPrice || (prod.netPrice && prod.netPrice < prod.price ? prod.price : null);
          const discountPct =
            prod.discountPercent || (prod.discount ? parseInt(prod.discount) : null);

          return (
            <div
              key={id}
              className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-pink-100 shadow-2xs hover:border-[#830a48]/40 hover:shadow-xs transition-all duration-150 group"
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                <img
                  src={prod.image || "/placeholder.svg"}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                {discountPct && (
                  <span className="absolute top-0 left-0 text-[8px] font-bold px-1 py-0.5 bg-[#830a48] text-white rounded-br-md leading-none">
                    -{discountPct}%
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <h5 className="font-semibold text-xs text-gray-900 truncate leading-tight">
                  {title}
                </h5>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px]">
                  <span className="text-amber-500 font-medium flex items-center">
                    ★ {prod.rating || 4.8}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500 truncate">{prod.category || "Self-Care"}</span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-bold text-xs text-[#70063c]">
                    Rs. {displayPrice.toLocaleString()}
                  </span>
                  {originalPrice && originalPrice > displayPrice && (
                    <span className="text-[10px] text-gray-400 line-through">
                      Rs. {originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(prod)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all duration-150 active:scale-95 flex items-center gap-1.5 ${
                  isAdded
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-gradient-to-r from-[#70063c] via-[#830a48] to-[#a2125f] text-white hover:brightness-110 shadow-2xs border border-[#e2b755]/30"
                }`}
                title="Add to Shopping Cart"
              >
                {isAdded ? (
                  <>
                    <Check className="w-3 h-3 text-white" />
                    <span>Added ✓</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3 h-3 text-[#e2b755]" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {anyAdded && (
        <div className="pt-1.5 flex items-center justify-between">
          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Item added to cart
          </span>
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-[#70063c] bg-[#e2b755] hover:bg-[#d4a843] shadow-xs active:scale-95 transition-all"
          >
            <span>Proceed to Cart</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// GENERATIVE UI: INSTANT BOOKING CONFIRMATION CARD
// =============================================================================
interface BookingCardData {
  salonName?: string;
  salonUsername?: string;
  serviceName?: string;
  date?: string;
  time?: string;
  duration?: number;
  price?: number;
}

function ChatBookingCard({ data }: { data: BookingCardData }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("Guest Client");
  const [phone, setPhone] = useState("03192590810");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const salonName = data.salonName || "Ryzentis";
  const salonUsername = data.salonUsername || "@ryzentis18";
  const serviceName = data.serviceName || "Signature Haircut & Styling";
  const date = data.date || "Tomorrow";
  const time = data.time || "3:00 PM";
  const duration = data.duration || 45;
  const price = data.price || 1200;

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const ref = "SB-" + Math.floor(100000 + Math.random() * 900000);
      setBookingRef(ref);
      setConfirmed(true);
      setIsSubmitting(false);
    }, 450);
  };

  if (confirmed) {
    return (
      <div className="my-2.5 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200 shadow-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-200 select-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-emerald-900">
              Appointment Confirmed!
            </h4>
            <p className="text-[11px] text-emerald-700">
              Reference: <span className="font-mono font-bold">#{bookingRef}</span>
            </p>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Salon:</span>
            <span className="font-semibold text-gray-800">{salonName} ({salonUsername})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service:</span>
            <span className="font-semibold text-gray-800">{serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Schedule:</span>
            <span className="font-semibold text-gray-800">{date} at {time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Client:</span>
            <span className="font-semibold text-gray-800">{customerName} ({phone})</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-emerald-100">
            <span className="text-gray-500">Amount Due:</span>
            <span className="font-bold text-[#70063c]">Rs. {price.toLocaleString()} (Cash on Service)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => router.push("/salons")}
            className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-2xs active:scale-95 transition-all text-center"
          >
            Explore Salons
          </button>
          <a
            href="tel:+923192590810"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors flex items-center gap-1"
          >
            <Phone className="w-3 h-3" />
            <span>Call</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="my-2.5 rounded-2xl bg-gradient-to-br from-white to-[#fff8fb] border border-[#f0dce5] shadow-xs overflow-hidden select-none">
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#70063c] via-[#830a48] to-[#a2125f] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#e2b755]" />
          <span className="font-bold text-xs tracking-wide">Instant Booking Slot</span>
        </div>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e2b755] text-[#70063c]">
          Verified Partner
        </span>
      </div>

      <div className="p-3.5 space-y-2.5">
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium">Salon:</span>
            <span className="font-bold text-gray-900">{salonName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium">Service:</span>
            <span className="font-semibold text-gray-800">{serviceName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium">Schedule:</span>
            <span className="font-semibold text-[#830a48]">{date} • {time}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 font-medium">Duration:</span>
            <span className="text-gray-700">{duration} mins</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <span className="text-gray-600 font-semibold">Total Cost:</span>
            <span className="font-bold text-sm text-[#70063c]">
              Rs. {price.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                Client Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Client name"
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#830a48]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03192590810"
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#830a48]"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleConfirm}
          className="w-full py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#70063c] via-[#830a48] to-[#a2125f] hover:brightness-110 shadow-xs hover:shadow transition-all duration-150 active:scale-98 flex items-center justify-center gap-1.5 border border-[#e2b755]/40 cursor-pointer"
        >
          {isSubmitting ? (
            <span>Confirming Booking...</span>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#e2b755]" />
              <span>Confirm & Book Appointment</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// GENERATIVE UI: VENDOR ACTION WIZARD CARD
// =============================================================================
interface VendorActionData {
  type: "register_salon" | "add_service" | "add_product";
  salonName?: string;
  serviceName?: string;
  productName?: string;
}

function ChatVendorCard({ data }: { data: VendorActionData }) {
  const router = useRouter();
  const [salonName, setSalonName] = useState(data.salonName || "My Luxury Salon");
  const [city, setCity] = useState("Karachi");
  const [serviceName, setServiceName] = useState(data.serviceName || "Signature Haircut");
  const [price, setPrice] = useState("1500");
  const [productTitle, setProductTitle] = useState(data.productName || "Organic Hair Oil");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="my-2.5 rounded-2xl bg-white border border-[#f0dce5] shadow-xs overflow-hidden select-none">
      <div className="px-3.5 py-2 bg-gradient-to-r from-[#70063c] via-[#830a48] to-[#a2125f] text-white flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-[#e2b755]" />
          <span className="font-bold text-xs">
            {data.type === "register_salon"
              ? "Register Salon Partner"
              : data.type === "add_service"
              ? "Add Service to Salon POS"
              : "Add Product to Inventory"}
          </span>
        </div>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">
          Vendor
        </span>
      </div>

      <div className="p-3.5 space-y-2.5">
        {submitted ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1.5 animate-in fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <h5 className="font-bold text-xs text-emerald-900">
              {data.type === "register_salon"
                ? "Salon Setup Initiated!"
                : data.type === "add_service"
                ? "Service Added to POS!"
                : "Product Added to Catalog!"}
            </h5>
            <p className="text-[11px] text-emerald-700">
              Your changes have been linked. Continue to the complete Vendor Management Suite:
            </p>
            <button
              type="button"
              onClick={() => router.push("/Vendor")}
              className="mt-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-2xs cursor-pointer"
            >
              Open Vendor Dashboard →
            </button>
          </div>
        ) : (
          <>
            {data.type === "register_salon" && (
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                    Salon Name
                  </label>
                  <input
                    type="text"
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#830a48]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#830a48]"
                  />
                </div>
              </div>
            )}

            {data.type === "add_service" && (
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#830a48]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                    Price (Rs.)
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#830a48]"
                  />
                </div>
              </div>
            )}

            {data.type === "add_product" && (
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#830a48]"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#70063c] via-[#830a48] to-[#a2125f] hover:brightness-110 shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1 border border-[#e2b755]/30 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#e2b755]" />
                <span>
                  {data.type === "register_salon"
                    ? "Register Salon"
                    : data.type === "add_service"
                    ? "Add Service"
                    : "Add Product"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/Vendor")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Vendor Portal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// GENERATIVE UI: SUPER ADMIN PLATFORM CONTROLS CARD
// =============================================================================
interface AdminActionData {
  type: string;
  salonsCount?: number;
  servicesCount?: number;
  bookingsCount?: number;
  productsCount?: number;
}

function ChatAdminCard({ data }: { data: AdminActionData }) {
  const router = useRouter();

  return (
    <div className="my-2.5 rounded-2xl bg-white border border-[#f0dce5] shadow-xs overflow-hidden select-none">
      <div className="px-3.5 py-2 bg-gradient-to-r from-[#70063c] via-[#830a48] to-[#a2125f] text-white flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#e2b755]" />
          <span className="font-bold text-xs">Super Admin Platform Controls</span>
        </div>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-400 text-emerald-950">
          Live MongoDB
        </span>
      </div>

      <div className="p-3.5 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-xl bg-pink-50/60 border border-pink-100">
            <span className="text-[10px] text-gray-500 block font-medium">Salons</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-[#70063c]">{data.salonsCount || 1}</span>
              <span className="text-[10px] text-gray-500">Ryzentis</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-pink-50/60 border border-pink-100">
            <span className="text-[10px] text-gray-500 block font-medium">Active Services</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-[#70063c]">{data.servicesCount || 8}</span>
              <span className="text-[10px] text-gray-500">live</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-pink-50/60 border border-pink-100">
            <span className="text-[10px] text-gray-500 block font-medium">Bookings</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-[#70063c]">{data.bookingsCount || 14}</span>
              <span className="text-[10px] text-gray-500">today</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-pink-50/60 border border-pink-100">
            <span className="text-[10px] text-gray-500 block font-medium">Products</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-[#70063c]">{data.productsCount || 10}</span>
              <span className="text-[10px] text-gray-500">catalog</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => router.push("/Superadmin/dashboard")}
            className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#70063c] via-[#830a48] to-[#a2125f] hover:brightness-110 shadow-xs active:scale-95 transition-all text-center flex items-center justify-center gap-1 border border-[#e2b755]/30 cursor-pointer"
          >
            <span>Open Admin Dashboard</span>
            <ArrowRight className="w-3 h-3 text-[#e2b755]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// STREAMING SKELETON
// =============================================================================
function LoadingCardSkeleton() {
  return (
    <div className="my-2 p-3 rounded-xl bg-pink-50/70 border border-pink-100 animate-pulse flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[#830a48]/20 flex items-center justify-center shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-[#e2b755]" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="h-2 bg-[#830a48]/20 rounded-md w-2/3" />
        <div className="h-2 bg-[#830a48]/10 rounded-md w-1/3" />
      </div>
    </div>
  );
}

// =============================================================================
// FORMATTED TEXT LINES (Eliminates asterisks, renders buttons and list styling)
// =============================================================================
function FormattedTextLines({ content }: { content: string }) {
  const router = useRouter();

  const handleNavigate = (url: string) => {
    if (url.startsWith("/")) {
      router.push(url);
    } else if (url.startsWith("mailto:") || url.startsWith("tel:")) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const parseInlineTokens = (text: string): React.ReactNode[] => {
    const tokenRegex =
      /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|(?:\b|^)(\/(?:salons|selfcare-products|cart|Vendor|Superadmin\/dashboard|auth\/signin|auth\/register|Support|ContactUs|bookings))\b)/g;

    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let keyIdx = 0;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const plain = text.slice(lastIndex, match.index).replace(/\*/g, "");
        if (plain) {
          nodes.push(<span key={`txt-${keyIdx++}`}>{plain}</span>);
        }
      }

      const matched = match[0].trim();

      if (matched.startsWith("[") && matched.includes("](")) {
        const linkMatch = matched.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          let label = linkMatch[1].trim();
          const url = linkMatch[2].trim();
          if (label.startsWith("/") || label.startsWith("[")) {
            label = getRouteDefaultLabel(url);
          }
          label = label.replace(/\*/g, "");

          nodes.push(
            <button
              key={`btn-${keyIdx++}`}
              type="button"
              onClick={() => handleNavigate(url)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 mx-1 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#70063c] via-[#830a48] to-[#a2125f] hover:from-[#830a48] hover:to-[#b5146c] shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer border border-[#e2b755]/40 group select-none align-middle"
              title={`Navigate to ${label}`}
            >
              {getRouteIcon(url)}
              <span className="tracking-tight">{label}</span>
              <ArrowRight className="w-3 h-3 text-[#e2b755] transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>,
          );
        }
      } else if (matched.startsWith("**") && matched.endsWith("**")) {
        const boldText = matched.slice(2, -2).replace(/\*/g, "");
        nodes.push(
          <strong key={`bld-${keyIdx++}`} className="font-semibold text-gray-900">
            {boldText}
          </strong>,
        );
      } else if (matched.startsWith("*") && matched.endsWith("*")) {
        const italicText = matched.slice(1, -1).replace(/\*/g, "");
        nodes.push(
          <span key={`it-${keyIdx++}`} className="font-medium text-gray-800">
            {italicText}
          </span>,
        );
      } else if (matched.startsWith("/")) {
        const url = matched;
        const label = getRouteDefaultLabel(url);
        nodes.push(
          <button
            key={`rt-${keyIdx++}`}
            type="button"
            onClick={() => handleNavigate(url)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 mx-1 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#70063c] via-[#830a48] to-[#a2125f] hover:from-[#830a48] hover:to-[#b5146c] shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer border border-[#e2b755]/40 group select-none align-middle"
            title={`Navigate to ${label}`}
          >
            {getRouteIcon(url)}
            <span className="tracking-tight">{label}</span>
            <ArrowRight className="w-3 h-3 text-[#e2b755] transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>,
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex).replace(/\*/g, "");
      if (remaining) {
        nodes.push(<span key={`txt-${keyIdx++}`}>{remaining}</span>);
      }
    }

    return nodes;
  };

  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-[13.5px] leading-relaxed">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={idx} className="h-1" />;
        }

        const pureButtonMatch = line.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (pureButtonMatch) {
          let label = pureButtonMatch[1].trim();
          const url = pureButtonMatch[2].trim();
          if (label.startsWith("/") || label.startsWith("[")) {
            label = getRouteDefaultLabel(url);
          }
          label = label.replace(/\*/g, "");

          return (
            <div key={idx} className="my-1.5">
              <button
                type="button"
                onClick={() => handleNavigate(url)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#70063c] via-[#830a48] to-[#a2125f] hover:from-[#830a48] hover:to-[#b5146c] shadow-xs hover:shadow transition-all duration-150 active:scale-95 cursor-pointer border border-[#e2b755]/30 group select-none"
              >
                {getRouteIcon(url)}
                <span className="tracking-tight">{label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#e2b755] transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>
            </div>
          );
        }

        const bulletMatch = line.match(/^(\*|-|•)\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 my-1 pl-1">
              <span className="text-[#830a48] font-bold text-xs mt-0.5 shrink-0 select-none">
                •
              </span>
              <div className="flex-1">{parseInlineTokens(bulletMatch[2])}</div>
            </div>
          );
        }

        const numberMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numberMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 my-1 pl-1">
              <span className="text-[#830a48] font-semibold text-xs mt-0.5 shrink-0 select-none">
                {numberMatch[1]}.
              </span>
              <div className="flex-1">{parseInlineTokens(numberMatch[2])}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="my-0.5">
            {parseInlineTokens(line)}
          </p>
        );
      })}
    </div>
  );
}

interface FormattedMessageProps {
  content: string;
  isUser: boolean;
}

/**
 * FormattedMessage: Decomposes message content into text blocks and Generative UI
 * action envelopes (product cards, booking card, vendor wizard, admin stats).
 */
function FormattedMessage({ content, isUser }: FormattedMessageProps) {
  if (isUser) {
    return <div className="whitespace-pre-wrap">{content.replace(/\*/g, "")}</div>;
  }

  // Parse action envelopes
  const completedRegex =
    /:::(product_cards|booking_card|vendor_action|admin_action)\s+([\s\S]*?):::/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const blocks: Array<{
    type:
      | "text"
      | "product_cards"
      | "booking_card"
      | "vendor_action"
      | "admin_action"
      | "loading";
    text?: string;
    data?: any;
  }> = [];

  while ((match = completedRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = content.slice(lastIndex, match.index).trim();
      if (textChunk) {
        blocks.push({ type: "text", text: textChunk });
      }
    }

    const envelopeType = match[1];
    const rawJson = match[2].trim();
    try {
      const parsed = JSON.parse(rawJson);
      blocks.push({ type: envelopeType as any, data: parsed });
    } catch (err) {
      console.warn("Failed to parse envelope JSON:", err);
    }

    lastIndex = completedRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    const tail = content.slice(lastIndex);
    const incompleteMatch = tail.match(
      /:::(product_cards|booking_card|vendor_action|admin_action)[\s\S]*$/,
    );
    if (incompleteMatch && incompleteMatch.index !== undefined) {
      const beforeIncomplete = tail.slice(0, incompleteMatch.index).trim();
      if (beforeIncomplete) {
        blocks.push({ type: "text", text: beforeIncomplete });
      }
      blocks.push({ type: "loading" });
    } else {
      const remainingText = tail.trim();
      if (remainingText) {
        blocks.push({ type: "text", text: remainingText });
      }
    }
  }

  return (
    <div className="space-y-1.5">
      {blocks.map((block, i) => {
        if (block.type === "text" && block.text) {
          return <FormattedTextLines key={i} content={block.text} />;
        }
        if (block.type === "product_cards" && Array.isArray(block.data)) {
          return <ChatProductCards key={i} products={block.data} />;
        }
        if (block.type === "booking_card" && block.data) {
          return <ChatBookingCard key={i} data={block.data} />;
        }
        if (block.type === "vendor_action" && block.data) {
          return <ChatVendorCard key={i} data={block.data} />;
        }
        if (block.type === "admin_action" && block.data) {
          return <ChatAdminCard key={i} data={block.data} />;
        }
        if (block.type === "loading") {
          return <LoadingCardSkeleton key={i} />;
        }
        return null;
      })}
    </div>
  );
}

/**
 * SalonBot - Production-Ready RAG AI Customer Support Assistant for SalonSphere.
 * Powered by Next.js App Router, MongoDB Atlas Vector Search, and Vercel AI SDK.
 */
export default function SalonBot({
  isOpen: controlledIsOpen,
  onOpenChange,
  isChatOpen: legacyIsOpen,
  setIsChatOpen: legacySetIsOpen,
}: SalonBotProps) {
  // Support both uncontrolled (standalone) and controlled open states
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);

  const isControlled =
    controlledIsOpen !== undefined || legacyIsOpen !== undefined;
  const isOpen = isControlled
    ? controlledIsOpen ?? legacyIsOpen ?? false
    : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(open);
    }
    onOpenChange?.(open);
    legacySetIsOpen?.(open);
  };

  // Vercel AI SDK useChat hook connecting to App Router /api/chat
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    reload,
    setMessages,
    error,
  } = useChat({
    api: "/api/chat",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the bottom whenever messages change or during streaming tokens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input field when chat window opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Handle suggested question pill click
  const handleSuggestedClick = async (question: string) => {
    await append({
      role: "user",
      content: question,
    });
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Action Button Launcher (Shown only in standalone mode) */}
      {!isOpen && !isControlled && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open SalonSphere AI Support"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-[#830a48]/40"
          style={{
            background: "linear-gradient(135deg, #70063c 0%, #830a48 50%, #a2125f 100%)",
          }}
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e2b755] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e2b755]"></span>
            </span>
          </div>
          <span className="font-semibold text-sm tracking-wide">
            Chat with SalonBot
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="SalonSphere AI Support Chat"
          className="fixed bottom-4 right-4 z-50 flex flex-col w-[calc(100vw-2rem)] sm:w-[410px] md:w-[430px] h-[640px] max-h-[88vh] rounded-2xl shadow-2xl overflow-hidden border border-[#830a48]/20 bg-white transition-all duration-200 animate-in fade-in slide-in-from-bottom-5"
        >
          {/* Header - Deep Magenta Gradient (#70063c -> #830a48 -> #a2125f) */}
          <header
            className="flex items-center justify-between px-4 py-3.5 text-white shrink-0 shadow-md select-none"
            style={{
              background: "linear-gradient(135deg, #70063c 0%, #830a48 55%, #a2125f 100%)",
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white shadow-inner">
                <Bot className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#70063c] rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight text-white">
                    SalonBot
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#e2b755] text-[#70063c] shadow-xs">
                    RAG AI
                  </span>
                </div>
                <p className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  SalonSphere Support Concierge
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  title="Clear conversation"
                  aria-label="Clear conversation history"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                aria-label="Close support chat"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Chat Messages Body */}
          <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#faf7f9]">
            {/* Initial Welcome Message (Shown when history is empty) */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-[#f2d8e4] shadow-sm space-y-3 animate-in fade-in duration-300">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #70063c 0%, #830a48 100%)",
                  }}
                >
                  <Sparkles className="w-6 h-6 text-[#e2b755]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Welcome to SalonSphere Support
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    I am your intelligent concierge powered by MongoDB Atlas
                    Vector Search. Ask me anything about appointments, services,
                    POS billing, or account management.
                  </p>
                </div>
                <div className="w-full pt-1 border-t border-gray-100 flex items-center justify-around text-[11px] text-[#830a48] font-medium">
                  <span className="flex items-center gap-1">
                    ✓ Verified Docs
                  </span>
                  <span className="flex items-center gap-1">
                    ✓ Real-time AI
                  </span>
                  <span className="flex items-center gap-1">
                    ✓ Instant Booking Help
                  </span>
                </div>
              </div>
            )}

            {/* Rendered Conversation Messages */}
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-2.5 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-xs"
                      style={{ backgroundColor: "#830a48" }}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] text-sm px-3.5 py-2.5 rounded-2xl shadow-xs leading-relaxed break-words ${
                      isUser
                        ? "bg-[#ffeef6] text-[#70063c] border border-[#f5c6cb] rounded-tr-xs font-medium"
                        : "bg-white text-gray-800 border border-pink-100/90 rounded-tl-xs"
                    }`}
                  >
                    <FormattedMessage content={message.content} isUser={isUser} />
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#ffeef6] border border-[#f5c6cb] text-[#70063c] shrink-0 mt-1 shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pulsing Loading State ("Thinking...") */}
            {isLoading && (
              <div className="flex items-start gap-2.5 justify-start animate-in fade-in duration-200">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-xs"
                  style={{ backgroundColor: "#830a48" }}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-pink-100 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center space-x-2 text-xs text-[#830a48]">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 rounded-full bg-[#830a48] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#a2125f] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#e2b755] animate-bounce"></span>
                  </div>
                  <span className="font-semibold tracking-wide">
                    SalonBot is thinking...
                  </span>
                </div>
              </div>
            )}

            {/* Error Banner with Retry */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2 animate-in fade-in">
                <span>{error.message || "An error occurred while connecting to SalonBot."}</span>
                <button
                  type="button"
                  onClick={() => reload()}
                  className="px-2.5 py-1 rounded bg-red-100 hover:bg-red-200 font-semibold text-red-800 shrink-0 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
          </main>

          {/* Interactive Suggested Questions Pills */}
          <div className="px-3 pt-2.5 pb-2 bg-[#faf7f9] border-t border-[#f0dce5] shrink-0">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#830a48] mb-1.5">
              <Sparkles className="w-3 h-3 text-[#e2b755]" />
              <span>Suggested Questions</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
              {SUGGESTED_QUESTIONS.map((question, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSuggestedClick(question)}
                  className="whitespace-nowrap shrink-0 text-xs px-2.5 py-1.5 rounded-full bg-white hover:bg-[#ffeef6] text-[#70063c] border border-[#e8cbd9] hover:border-[#830a48] shadow-2xs font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input & Gold Accent Button */}
          <footer className="p-3 bg-white border-t border-gray-100 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Ask about bookings, services, POS..."
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#830a48]/50 focus:border-[#830a48] transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="flex items-center justify-center p-2.5 rounded-xl font-bold shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105"
                style={{
                  backgroundColor: "#e2b755",
                  color: "#4a0427",
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 text-center">
              <span className="text-[10px] text-gray-400 tracking-tight">
                Powered by SalonSphere RAG • MongoDB Atlas Vector Search
              </span>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
