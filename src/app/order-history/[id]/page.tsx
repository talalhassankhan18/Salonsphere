"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { use } from "react";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

interface PopulatedOrder {
  _id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: {
    productId: {
      _id: string;
      name: string;
      price: number;
      imageUrls: string[];
    };
    salonId?: { _id: string; salonName: string };
    salonName?: string;
    uniqueProductCode?: string;
    quantity: number;
    unitPrice: number;
    commissionRate?: number;
    subtotal: number;
  }[];
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
  createdAt: string;
  updatedAt: string;
}

const OrderHistoryPage = ({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) => {
  const params = use(paramsPromise);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<PopulatedOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PopulatedOrder | null>(
    null
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.id !== params.id) {
      router.push("/auth/signin");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/orders", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        } else {
          throw new Error("No orders found in response");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [params.id, session, status, router]);

  const handleClose = () => {
    router.push("/");
  };

  const handleViewOrder = (order: PopulatedOrder) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel order");
      }
      const data = await res.json();
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, status: "Cancelled", paymentStatus: "Failed" }
            : order
        )
      );
      toast.success("Order cancelled successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order");
    }
  };

  if (status === "loading" || !session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      <div className="relative z-10 bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl border border-gray-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <IoClose size={24} />
        </button>

        <div className="flex justify-center mb-6">
          <img src="/assets/images/logo.png" alt="logo" className="h-12" />
        </div>

        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Order History
        </h1>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {loading ? (
          <p className="text-center text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-600">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-sm text-gray-700">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold">
                    Order ID
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">Date</th>
                  <th className="px-4 py-2 text-left font-semibold">Total</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{order._id}</td>
                    <td className="px-4 py-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">₨{order.total.toFixed(2)}</td>
                    <td className="px-4 py-2">{order.status}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                      >
                        View
                      </button>
                      {order.status === "Pending" && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <IoClose size={24} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Order #{selectedOrder._id}
            </h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <strong>Date:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </div>
              <div>
                <strong>Status:</strong> {selectedOrder.status}
              </div>
              <div>
                <strong>Payment Status:</strong> {selectedOrder.paymentStatus}
              </div>
              <div>
                <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
              </div>
              <h3 className="text-lg font-medium mt-4 mb-2">Items</h3>
              <ul className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <li key={index} className="border-b pb-2">
                    <p>
                      <strong>Product:</strong> {item.productId.name}{" "}
                      {item.salonName ? ` - ${item.salonName}` : ""}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {item.quantity}
                    </p>
                    <p>
                      <strong>Unit Price:</strong> ₨{item.unitPrice.toFixed(2)}
                    </p>
                    <p>
                      <strong>Subtotal:</strong> ₨{item.subtotal.toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
              <h3 className="text-lg font-medium mt-4 mb-2">
                Shipping Address
              </h3>
              <p>{selectedOrder.shippingAddress.street}</p>
              <p>
                {selectedOrder.shippingAddress.city},{" "}
                {selectedOrder.shippingAddress.state},{" "}
                {selectedOrder.shippingAddress.postalCode},{" "}
                {selectedOrder.shippingAddress.country}
              </p>
              <h3 className="text-lg font-medium mt-4 mb-2">Summary</h3>
              <p>
                <strong>Subtotal:</strong> ₨{selectedOrder.subtotal.toFixed(2)}
              </p>
              <p>
                <strong>Shipping Fee:</strong> ₨
                {selectedOrder.shippingFee.toFixed(2)}
              </p>
              <p>
                <strong>Total:</strong> ₨{selectedOrder.total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;