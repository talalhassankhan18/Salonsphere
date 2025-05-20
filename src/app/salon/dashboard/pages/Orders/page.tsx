"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useIsMobile } from "../../hooks/use-mobile";
import SidebarNavigation from "../../components/layout/SidebarNavigation";
import DashboardHeader from "../../components/layout/DashboardHeader";
import MobileMenu from "../../components/layout/MobileMenu";
import { Package, Filter, Eye, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";

interface OrderItem {
  productId: { name: string };
  salonId?: { _id: string; salonName: string };
  salonName?: string;
  uniqueProductCode?: string;
  quantity: number;
  unitPrice: number;
  commissionRate?: number;
  subtotal: number;
}

interface Order {
  _id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "Pending" | "Completed" | "Failed";
  createdAt: string;
}

const Orders: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [filter, setFilter] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userId = session?.user?.id as string | undefined;
  const salonId = session?.user?.salonId as string | undefined;
  const userRole = session?.user?.role as string | undefined;

  console.log("Session data:", { userId, salonId, userRole });

  const fetchOrders = async () => {
    if (status !== "authenticated" || !salonId || !userId) {
      console.error("Missing session data:", { status, salonId, userId });
      setError("Session data missing. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`Fetching orders for salonId: ${salonId}`);
      const response = await fetch(`/api/orders?salonId=${salonId}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Fetch error response:", errorData);
        throw new Error(errorData.error || "Failed to fetch orders");
      }
      const data = await response.json();
      console.log("Fetched orders:", data);
      const formattedOrders = (data.orders || [])
        .map((order: any) => {
          const filteredItems = order.items
            .filter((item: any) => {
              const itemSalonId = item.salonId?._id?.toString();
              return itemSalonId && itemSalonId === salonId;
            })
            .map((item: any) => ({
              productId: item.productId || { name: "Unknown Product" },
              salonId: item.salonId,
              salonName: item.salonName || item.salonId?.salonName || "Direct",
              uniqueProductCode: item.uniqueProductCode,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              commissionRate: item.commissionRate || 0.05,
              subtotal: item.subtotal,
            }));
          if (filteredItems.length === 0) return null;

          return {
            _id: order._id,
            customerId: order.customerId,
            items: filteredItems,
            total: filteredItems.reduce(
              (sum: number, item: any) => sum + item.subtotal,
              0
            ),
            status: order.status,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
          };
        })
        .filter((order: any) => order !== null)
        .sort(
          (a: Order, b: Order) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      setOrders(formattedOrders);
    } catch (err: any) {
      console.error("Fetch orders error:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30 * 1000);
    return () => clearInterval(interval);
  }, [salonId, userId, status]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, status: newStatus as any }
              : order
          )
        );
        toast({
          title: "Success",
          description: "Order status updated",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateCommission = (item: OrderItem) => {
    return (item.subtotal * (item.commissionRate || 0.05)).toFixed(2);
  };

  const filteredOrders = orders
    .flatMap((order) =>
      order.items.map((item, index) => ({
        ...order,
        item,
        key: `${order._id}-${index}`,
      }))
    )
    .filter((order) => {
      if (filter === "all") return true;
      return order.status.toLowerCase() === filter.toLowerCase();
    });

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return null;
  if (loading) return <div>Loading orders...</div>;
  if (error)
    return (
      <div>
        {error}
        <Button
          onClick={() => {
            setError(null);
            fetchOrders();
          }}
          className="ml-4"
        >
          Retry
        </Button>
      </div>
    );
  if (!userId || !salonId)
    return <div>Error: User ID or Salon ID not found</div>;

  return (
    <div className="dashboard-layout">
      <div className="hidden md:block">
        <SidebarNavigation isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      <MobileMenu isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-16"
        }`}
      >
        <DashboardHeader
          title="Orders"
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          userId={userId}
        />
        <main className="dashboard-content animate-fade-in">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
                <button
                  className={`px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap ${
                    filter === "all"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setFilter("all")}
                >
                  All Orders
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap ${
                    filter === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setFilter("Pending")}
                >
                  Pending
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap ${
                    filter === "Confirmed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setFilter("Confirmed")}
                >
                  Confirmed
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap ${
                    filter === "Shipped"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setFilter("Shipped")}
                >
                  Shipped
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap ${
                    filter === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setFilter("Delivered")}
                >
                  Delivered
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap ${
                    filter === "Cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setFilter("Cancelled")}
                >
                  Cancelled
                </button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="inline-flex items-center px-3 py-2"
                >
                  <Filter size={16} className="mr-2" />
                  Filter
                </Button>
                <Button
                  onClick={fetchOrders}
                  variant="outline"
                  className="inline-flex items-center px-3 py-2"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            <div className="glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Customer ID
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Subtotal
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Commission
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.key} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">
                          {order._id}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {order.customerId}
                        </td>
                        <td className="px-6 py-4">
                          {order.item.productId.name}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {order.item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          Rs {order.item.subtotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                          Rs {calculateCommission(order.item)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(
                              order.status || "Pending"
                            )}`}
                          >
                            {order.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full capitalize ${getPaymentStatusColor(
                              order.paymentStatus || "Pending"
                            )}`}
                          >
                            {order.paymentStatus || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(new Date(order.createdAt), "MMM dd, yyyy")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            {userRole === "admin" && (
                              <Select
                                onValueChange={(value) =>
                                  updateOrderStatus(order._id, value)
                                }
                                defaultValue={order.status}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="Confirmed">
                                    Confirmed
                                  </SelectItem>
                                  <SelectItem value="Shipped">
                                    Shipped
                                  </SelectItem>
                                  <SelectItem value="Delivered">
                                    Delivered
                                  </SelectItem>
                                  <SelectItem value="Cancelled">
                                    Cancelled
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Package size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500">No orders found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Order Details - #{selectedOrder?._id || "N/A"}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Customer ID
                    </label>
                    <p className="mt-1 text-gray-700">
                      {selectedOrder.customerId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Order Date
                    </label>
                    <p className="mt-1 text-gray-700">
                      {format(
                        new Date(selectedOrder.createdAt),
                        "MMM dd, yyyy"
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Order Items</h3>
                <table className="w-full border-collapse mt-2">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left text-sm font-medium text-gray-500">
                        Product
                      </th>
                      <th className="border p-2 text-left text-sm font-medium text-gray-500">
                        Quantity
                      </th>
                      <th className="border p-2 text-left text-sm font-medium text-gray-500">
                        Unit Price
                      </th>
                      <th className="border p-2 text-left text-sm font-medium text-gray-500">
                        Subtotal
                      </th>
                      <th className="border p-2 text-left text-sm font-medium text-gray-500">
                        Commission
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border p-2">
                          {item.productId.name}{" "}
                          {item.salonName && (
                            <span className="text-sm text-gray-500">
                              ({item.salonName})
                            </span>
                          )}
                          {item.uniqueProductCode && (
                            <span className="block text-sm text-gray-500">
                              Code: {item.uniqueProductCode}
                            </span>
                          )}
                        </td>
                        <td className="border p-2">{item.quantity}</td>
                        <td className="border p-2">
                          Rs {item.unitPrice.toFixed(2)}
                        </td>
                        <td className="border p-2">
                          Rs {item.subtotal.toFixed(2)}
                        </td>
                        <td className="border p-2">
                          Rs{" "}
                          {(
                            item.subtotal * (item.commissionRate || 0.05)
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Total
                    </label>
                    <p className="mt-1 text-gray-700 font-bold">
                      Rs {selectedOrder.total.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Commission
                    </label>
                    <p className="mt-1 text-gray-700">
                      Rs{" "}
                      {selectedOrder.items
                        .reduce(
                          (acc, item) =>
                            acc + item.subtotal * (item.commissionRate || 0.05),
                          0
                        )
                        .toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <p
                      className={`mt-1 px-2 py-1 text-xs rounded-full capitalize inline-block ${getStatusColor(
                        selectedOrder.status || "Pending"
                      )}`}
                    >
                      {selectedOrder.status || "Pending"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Payment Status
                    </label>
                    <p
                      className={`mt-1 px-2 py-1 text-xs rounded-full capitalize inline-block ${getPaymentStatusColor(
                        selectedOrder.paymentStatus || "Pending"
                      )}`}
                    >
                      {selectedOrder.paymentStatus || "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
