"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCartStoreContext } from "@/store/cartStoreContext";
import PaymentMethodSection from "@/common/payment-method-section";
import Navbar from "@/common/navbar";
import Footer from "@/common/footer";

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  netPrice: number;
  salonId?: string;
  salonName?: string;
  uniqueProductCode?: string;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CustomerDetails {
  name: string;
  phone: string;
  shippingAddress: ShippingAddress;
}

const Checkout = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cartItems, totalPrice, removeItem } = useCartStoreContext();

  const [showPayment, setShowPayment] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: session?.user?.name || "",
    phone: "",
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const deliveryFee = 200;
  const totalAmount = totalPrice() + deliveryFee;

  useEffect(() => {
    const checkCustomer = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated" || !session?.user?.email) {
        router.push("/auth/signin");
        return;
      }

      const userRole = session.user.role;
      if (!userRole) {
        router.push("/auth/signin");
        return;
      }

      if (userRole === "salon_admin") {
        setCustomerId(session.user.id);
        setCustomerDetails((prev) => ({
          ...prev,
          name: session.user.name || "Salon Admin",
        }));
        return;
      }

      try {
        const response = await fetch("/api/customers/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
          credentials: "include",
        });

        if (!response.ok) {
          console.error("Customer check failed:", response.statusText);
          router.push("/auth/signin");
          return;
        }

        const { customer } = await response.json();
        if (customer?._id && customer.role === "customer") {
          setCustomerId(customer._id);
          setCustomerDetails((prev) => ({
            ...prev,
            name: customer.name || session.user?.name || "Customer Name",
          }));
        } else {
          console.error("Invalid customer data or role:", customer);
          router.push("/auth/signin");
        }
      } catch (error) {
        console.error("Error checking customer:", error);
        router.push("/auth/signin");
      }
    };

    checkCustomer();
  }, [status, session, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name in customerDetails.shippingAddress) {
      setCustomerDetails((prev) => ({
        ...prev,
        shippingAddress: { ...prev.shippingAddress, [name]: value },
      }));
    } else {
      setCustomerDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = [
      customerDetails.name,
      customerDetails.phone,
      customerDetails.shippingAddress.street,
      customerDetails.shippingAddress.city,
      customerDetails.shippingAddress.state,
      customerDetails.shippingAddress.postalCode,
      customerDetails.shippingAddress.country,
    ];
    if (requiredFields.some((field) => !field)) {
      alert("Please fill in all fields.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentCompleted = async (paymentMethod: string) => {
    setIsLoading(true);
    try {
      if (!session || !session.user) {
        throw new Error("Session expired. Please sign in again.");
      }

      if (!customerId) {
        throw new Error("Customer not authenticated");
      }

      if (!/^[0-9a-fA-F]{24}$/.test(customerId)) {
        throw new Error("Invalid customer ID format");
      }

      let salonProducts: {
        productId: string;
        salonId: string;
        salonName: string;
        commissionRate: number;
        uniqueProductCode: string;
      }[] = [];
      const salonProductsResponse = await fetch("/api/orders/salon-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: cartItems.map((item) => item.productId),
        }),
        credentials: "include",
      });

      if (salonProductsResponse.ok) {
        const data = await salonProductsResponse.json();
        salonProducts = data.salonProducts || [];
      } else {
        console.warn(
          "No salon products found; treating items as direct purchases unless salonId is already set"
        );
      }

      const itemsSubtotal = cartItems.reduce(
        (acc, item) => acc + item.netPrice * item.quantity,
        0
      );

      const items = cartItems.map((item) => {
        let salonId = item.salonId;
        let salonName = item.salonName;
        let commissionRate = 0;
        let uniqueProductCode = item.uniqueProductCode;

        const salonProduct = salonProducts.find(
          (sp) => sp.productId === item.productId
        );
        if (salonProduct) {
          salonId = salonId || salonProduct.salonId;
          salonName = salonName || salonProduct.salonName;
          commissionRate = salonProduct.commissionRate || 0;
          uniqueProductCode =
            uniqueProductCode || salonProduct.uniqueProductCode;
        }

        if (salonId && !/^[0-9a-fA-F]{24}$/.test(salonId)) {
          console.warn(
            `Invalid salonId for product ${item.productId}: ${salonId}`
          );
          salonId = undefined;
          salonName = undefined;
          uniqueProductCode = undefined;
        }

        return {
          productId: item.productId,
          salonId: salonId,
          salonName: salonName,
          uniqueProductCode: uniqueProductCode,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.netPrice * item.quantity,
          commissionRate: commissionRate,
        };
      });

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          items,
          shippingAddress: customerDetails.shippingAddress,
          shippingFee: deliveryFee,
          paymentMethod: paymentMethod || "Cash on Delivery",
          subtotal: itemsSubtotal,
          total: totalAmount,
          customerName: customerDetails.name, // Add customer name
          customerEmail: session.user.email, // Add customer email
        }),
        credentials: "include",
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to create order"
        );
      }

      const { order } = await orderResponse.json();

      cartItems.forEach((item) => removeItem(item.id));

      router.push(`/order-confirmation?orderId=${order._id}`);
    } catch (error) {
      console.error("Order error:", error);
      alert(
        `Order failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      if (error instanceof Error && error.message.includes("Session expired")) {
        router.push("/auth/signin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || !customerId) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar isLoggedIn={true} handleLogout={handleLogout} />
        <div className="hero min-h-[70vh] bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="font-bold text-5xl">Cart Empty</h1>
              <p className="py-6">
                Your cart is empty. Please add items to your cart.
              </p>
              <a href="/selfcare-products">
                <button className="btn btn-secondary">Continue Shopping</button>
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar isLoggedIn={!!session} handleLogout={handleLogout} />
      <div className="m-4 p-6"></div>
      <div className="flex min-h-[70vh] justify-center bg-gray-50 p-2 lg:p-8">
        <div className="flex w-full max-w-2xl flex-col gap-6 rounded-lg bg-white p-6 shadow-lg">
          {!showPayment ? (
            <>
              <h1 className="text-2xl font-semibold text-center">Checkout</h1>
              <form onSubmit={handleContinue} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-base-content"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={customerDetails.name}
                    onChange={handleInputChange}
                    required
                    className="input input-bordered w-full mt-1"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-base-content"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={customerDetails.phone}
                    onChange={handleInputChange}
                    required
                    className="input input-bordered w-full mt-1"
                    placeholder="03XX XXXXXXX"
                  />
                </div>
                <div>
                  <label
                    htmlFor="street"
                    className="block text-sm font-medium text-base-content"
                  >
                    Street
                  </label>
                  <input
                    id="street"
                    name="street"
                    type="text"
                    value={customerDetails.shippingAddress.street}
                    onChange={handleInputChange}
                    required
                    className="input input-bordered w-full mt-1"
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-base-content"
                  >
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={customerDetails.shippingAddress.city}
                    onChange={handleInputChange}
                    required
                    className="input input-bordered w-full mt-1"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-base-content"
                  >
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={customerDetails.shippingAddress.state}
                    onChange={handleInputChange}
                    required
                    className="input input-bordered w-full mt-1"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-base-content"
                  >
                    Postal Code
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={customerDetails.shippingAddress.postalCode}
                    onChange={handleInputChange}
                    required
                    className="input input-bordered w-full mt-1"
                    placeholder="12345"
                  />
                </div>
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-base-content"
                  >
                    Country
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={customerDetails.shippingAddress.country}
                    onChange={handleInputChange}
                    required
                    className="input input-bordered w-full mt-1"
                    placeholder="Country"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full mt-4">
                  Continue to Payment
                </button>
              </form>
            </>
          ) : (
            <PaymentMethodSection
              onCompleted={handlePaymentCompleted}
              totalAmount={totalAmount}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
