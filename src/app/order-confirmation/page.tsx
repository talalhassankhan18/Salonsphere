"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/common/navbar";
import Footer from "@/common/footer";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useSession } from "next-auth/react";
import Image from "next/image";

const OrderConfirmationContent = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const router = useRouter();
  const { data: session } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const orderSlipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("Order ID is missing");
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch order details");
        }

        const { order } = await response.json();
        setOrder(order);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleDownloadPDF = () => {
    if (orderSlipRef.current) {
      html2canvas(orderSlipRef.current, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`order-slip-${orderId}.pdf`);
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={true} handleLogout={() => {}} />
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-md text-center">
            <h1 className="text-2xl font-bold text-red-600">
              Order Confirmation Error
            </h1>
            <p className="mt-4 text-gray-600">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={true} handleLogout={() => {}} />
        <div className="flex-grow flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-blue-600"></span>
        </div>
        <Footer />
      </div>
    );
  }

  const customerName = session?.user?.name || order.customerId || "Customer";
  const formatPrice = (price: number) => `₨${price.toLocaleString()}`;
  const paymentMethod = order.paymentMethod || "Cash on Delivery";
  const isCOD = paymentMethod.toLowerCase() === "cash on delivery";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={true} handleLogout={() => {}} />
      <div className="flex-grow container mx-auto p-6 pt-20 pb-10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleDownloadPDF}
            className="mb-4 xs px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Download Order Slip (PDF)
          </button>

          <div
            ref={orderSlipRef}
            className="bg-white shadow-2xl rounded-lg p-6 border border-gray-200"
          >
            {/* Header */}
            <div className="text-center mb-6 border-b pb-4">
              <h1 className="text-3xl font-bold text-gray-800">Order Slip</h1>
              <div className="mt-2 mx-auto">
                <Image
                  src="/assets/images/logo.png"
                  alt="SalonSphere Logo"
                  width={150}
                  height={150}
                  className="mx-auto"
                />
              </div>
            </div>

            {/* Customer Details */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700">
                Customer Details
              </h2>
              <p className="text-gray-600">Name: {customerName}</p>
              <p className="text-gray-600">Order ID: {order._id}</p>
              <p className="text-gray-600">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700">
                Shipping Address
              </h2>
              <p className="text-gray-600">{order.shippingAddress.street}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state},{" "}
                {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
              </p>
            </div>

            {/* Order Summary */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700">
                Order Summary
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border-b-2 p-3 text-left text-gray-600 font-semibold">
                        Product
                      </th>
                      <th className="border-b-2 p-3 text-left text-gray-600 font-semibold">
                        Quantity
                      </th>
                      <th className="border-b-2 p-3 text-left text-gray-600 font-semibold">
                        Unit Price (PKR)
                      </th>
                      <th className="border-b-2 p-3 text-left text-gray-600 font-semibold">
                        Subtotal (PKR)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border-b p-3 text-gray-700">
                          {item.productId?.name ||
                            `Product ID: ${item.productId}`}{" "}
                          {item.salonName && (
                            <span className="text-sm text-gray-500">
                              - {item.salonName}
                            </span>
                          )}
                          {item.uniqueProductCode && (
                            <span className="text-sm text-gray-500 block">
                              Code: {item.uniqueProductCode}
                            </span>
                          )}
                        </td>
                        <td className="border-b p-3 text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="border-b p-3 text-gray-700">
                          {formatPrice(item.unitPrice)}
                        </td>
                        <td className="border-b p-3 text-gray-700">
                          {formatPrice(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700">
                Payment Summary
              </h2>
              <div className="text-right">
                <p className="text-gray-600">
                  Subtotal: {formatPrice(order.subtotal)}
                </p>
                <p className="text-gray-600">
                  Shipping Fee: {formatPrice(order.shippingFee)}
                </p>
                <p className="text-gray-600">Payment Method: {paymentMethod}</p>
                {isCOD ? (
                  <p className="text-gray-600">
                    Amount to be Paid on Delivery: {formatPrice(order.total)}
                  </p>
                ) : (
                  <p className="text-xl font-bold text-gray-800">
                    Total Paid: {formatPrice(order.total)}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-500 border-t pt-4">
              <p>Thank you for your purchase!</p>
              <p>
                A confirmation email has been sent to you. Delivery expected
                within 5-6 working days.
              </p>
              <p>Contact: salonsphere@gmail.com | Phone: 03335759985</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// useSearchParams() must sit under a Suspense boundary for static prerendering.
const OrderConfirmation = () => (
  <Suspense fallback={null}>
    <OrderConfirmationContent />
  </Suspense>
);

export default OrderConfirmation;
