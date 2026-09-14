"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/dashboard/components/ui/card";
import { Input } from "@/app/Superadmin/dashboard/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Superadmin/dashboard/components/ui/table";
import {
  Download,
  Eye,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/dashboard/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Superadmin/dashboard/components/ui/select";
import { toast } from "@/app/Superadmin/dashboard/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/Superadmin/dashboard/components/ui/dialog";
import { cn } from "@/app/salon/dashboard/lib/utils";

interface OrderItem {
  productId: { name: string } | string;
  salonId?: { salonName: string } | string | null;
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
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "Pending" | "Completed" | "Failed";
  createdAt: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal?: number;
  shippingFee?: number;
  paymentMethod?: string;
}

const Orders = () => {
  const [currentTab, setCurrentTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("Fetching orders from /api/public-orders");
      const response = await fetch("/api/public-orders");
      if (!response.ok) {
        const text = await response.text();
        console.error("Fetch error response:", text);
        throw new Error(
          `Failed to fetch orders: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log("Fetched orders:", data);
      if (!data.orders || !Array.isArray(data.orders)) {
        throw new Error("Invalid orders data");
      }
      const formattedOrders = data.orders.map((order: any) => ({
        _id: order._id || "N/A",
        customerId: order.customerId || "N/A",
        customerEmail: order.customerEmail || "N/A",
        items: (order.items || []).map((item: any) => ({
          productId: item.productId || { name: "Unknown Product" },
          salonId: item.salonId || null,
          salonName: item.salonName || (item.salonId?.salonName ?? "Direct"),
          uniqueProductCode: item.uniqueProductCode || "N/A",
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || 0,
          commissionRate: item.commissionRate || undefined,
          subtotal: item.subtotal || 0,
        })),
        total: order.total || 0,
        status: order.status || "Pending",
        paymentStatus: order.paymentStatus || "Pending",
        createdAt: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : "N/A",
        shippingAddress: order.shippingAddress || {
          street: "N/A",
          city: "N/A",
          state: "N/A",
          postalCode: "N/A",
          country: "N/A",
        },
        subtotal: order.subtotal || 0,
        shippingFee: order.shippingFee || 0,
        paymentMethod: order.paymentMethod || "N/A",
      }));
      setOrders(formattedOrders);
    } catch (error: any) {
      console.error("Fetch orders error:", error);
      setError(error.message || "Failed to fetch orders");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    newPaymentStatus?: string
  ) => {
    try {
      console.log(
        "Updating order:",
        orderId,
        "Status:",
        newStatus,
        "PaymentStatus:",
        newPaymentStatus
      );
      const response = await fetch(`/api/public-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus,
        }),
      });
      const responseBody = await response.json();
      console.log("Update response:", responseBody);
      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, ...responseBody.order } : order
          )
        );
        toast({
          title: "Success",
          description: "Order status updated",
        });
      } else {
        console.error("Update error response:", responseBody);
        throw new Error(
          responseBody.error ||
            `Failed to update order (Status: ${response.status})`
        );
      }
    } catch (error: any) {
      console.error("Update status error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateCommission = (items: OrderItem[]) => {
    return items
      .reduce((acc, item) => {
        if (item.salonId && item.commissionRate) {
          return acc + item.subtotal * item.commissionRate;
        }
        return acc;
      }, 0)
      .toFixed(2);
  };

  const getProductNames = (items: OrderItem[]) => {
    return items
      .map((item) =>
        typeof item.productId === "object"
          ? item.productId.name
          : "Unknown Product"
      )
      .join(", ");
  };

  const filteredOrders = orders
    .filter((order) => {
      if (orderTypeFilter === "salon")
        return order.items.some((item: OrderItem) => !!item.salonId);
      if (orderTypeFilter === "direct")
        return order.items.every((item: OrderItem) => !item.salonId);
      return true;
    })
    .filter((order) =>
      searchQuery
        ? order.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order._id.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center">
        <p className="text-red-500">{error}</p>
        <Button
          onClick={() => {
            setError(null);
            fetchOrders();
          }}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  const renderTable = (statusFilter?: string) => (
    <div className="glass rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">
              Order ID
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">
              Customer ID
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 hidden md:table-cell">
              Source
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 hidden md:table-cell">
              Products
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">
              Total
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 hidden lg:table-cell">
              Commission
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500">
              Status
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100">
          {filteredOrders
            .filter((order) => !statusFilter || order.status === statusFilter)
            .map((order) => (
              <TableRow key={order._id} className="hover:bg-gray-50">
                <TableCell className="px-6 py-4 text-sm font-medium">
                  {order._id}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="text-sm font-medium">
                    {order.customerId}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 hidden md:table-cell">
                  {order.items.some((item: OrderItem) => item.salonId)
                    ? "Salon"
                    : "Direct"}
                </TableCell>
                <TableCell className="px-6 py-4 hidden md:table-cell">
                  {getProductNames(order.items)}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm font-medium">
                  Rs {order.total.toFixed(2)}
                </TableCell>
                <TableCell className="px-6 py-4 hidden lg:table-cell text-sm font-medium text-green-600">
                  Rs {calculateCommission(order.items)}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Select
                    onValueChange={(value) => {
                      const newPaymentStatus =
                        order.paymentMethod?.toLowerCase() === "cash" &&
                        value === "Delivered"
                          ? "Completed"
                          : undefined;
                      updateOrderStatus(order._id, value, newPaymentStatus);
                    }}
                    defaultValue={order.status}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue>
                        <span
                          className={cn(
                            "px-2 py-1 text-xs rounded-full capitalize",
                            getStatusColor(order.status)
                          )}
                        >
                          {order.status} ({order.paymentStatus})
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsModalOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Package size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No orders found</p>
        </div>
      )}
    </div>
  );

  const renderOrderDetailsModal = () => {
    if (!selectedOrder) return null;

    const formatPrice = (price: number) => `₨${price.toLocaleString()}`;
    const isCOD =
      selectedOrder.paymentMethod?.toLowerCase() === "cash on delivery";

    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder._id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Customer Details
              </h2>
              <p className="text-gray-600">
                Customer ID: {selectedOrder.customerId}
              </p>
              <p className="text-gray-600">
                Email: {selectedOrder.customerEmail || "N/A"}
              </p>
              <p className="text-gray-600">
                Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Shipping Address
              </h2>
              <p className="text-gray-600">
                {selectedOrder.shippingAddress?.street || "N/A"}
              </p>
              <p className="text-gray-600">
                {selectedOrder.shippingAddress?.city || "N/A"},{" "}
                {selectedOrder.shippingAddress?.state || "N/A"},{" "}
                {selectedOrder.shippingAddress?.postalCode || "N/A"},{" "}
                {selectedOrder.shippingAddress?.country || "N/A"}
              </p>
            </div>
            <div>
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
                      <th className="border-b-2 p-3 text-left text-gray-600 font-semibold">
                        Commission (PKR)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map(
                      (item: OrderItem, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border-b p-3 text-gray-700">
                            {typeof item.productId === "object"
                              ? item.productId.name
                              : `Product ID: ${item.productId}`}{" "}
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
                          <td className="border-b p-3 text-gray-700">
                            {item.salonId && item.commissionRate
                              ? formatPrice(item.subtotal * item.commissionRate)
                              : "0.00"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Payment Summary
              </h2>
              <div className="text-right">
                <p className="text-gray-600">
                  Subtotal: {formatPrice(selectedOrder.subtotal || 0)}
                </p>
                <p className="text-gray-600">
                  Shipping Fee: {formatPrice(selectedOrder.shippingFee || 0)}
                </p>
                <p className="text-gray-600">
                  Commission:{" "}
                  {formatPrice(
                    Number(calculateCommission(selectedOrder.items))
                  )}
                </p>
                <p className="text-gray-600">
                  Payment Method: {selectedOrder.paymentMethod || "N/A"}
                </p>
                {isCOD ? (
                  <p className="text-gray-600">
                    Amount to be Paid on Delivery:{" "}
                    {formatPrice(selectedOrder.total)}
                  </p>
                ) : (
                  <p className="text-xl font-bold text-gray-800">
                    Total Paid: {formatPrice(selectedOrder.total)}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            View and manage all orders on the platform.
          </CardDescription>
        </CardHeader>
        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={setCurrentTab}
        >
          <div className="px-6 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <TabsList className="mb-2 sm:mb-0">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="Shipped">Shipped</TabsTrigger>
              <TabsTrigger value="Delivered">Delivered</TabsTrigger>
              <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </div>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="w-full md:w-auto relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8 w-full md:w-80"
                  placeholder="Search by customer ID or order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Select onValueChange={setOrderTypeFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Order Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="salon">Salon Orders</SelectItem>
                    <SelectItem value="direct">Direct Orders</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
            <TabsContent value="all" className="m-0">
              {renderTable()}
            </TabsContent>
            {["Pending", "Shipped", "Delivered", "Cancelled"].map((tab) => (
              <TabsContent key={tab} value={tab} className="m-0">
                {renderTable(tab)}
              </TabsContent>
            ))}
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">{filteredOrders.length}</span> of{" "}
                <span className="font-medium">{filteredOrders.length}</span>{" "}
                results
              </div>
            </div>
          </CardContent>
        </Tabs>
      </Card>
      {renderOrderDetailsModal()}
    </div>
  );
};

export default Orders;
