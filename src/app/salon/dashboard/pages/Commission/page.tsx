"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "../../hooks/use-mobile";
import SidebarNavigation from "../../components/layout/SidebarNavigation";
import DashboardHeader from "../../components/layout/DashboardHeader";
import MobileMenu from "../../components/layout/MobileMenu";
import { DollarSign, Download } from "lucide-react";
import { cn } from "../../lib/utils";
import { format, parseISO } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "../../components/ui/button";

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

interface Payout {
  _id: string;
  orderId: string;
  salonId: string | null;
  amount: number;
  paymentMethod: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

interface Commission {
  _id: string;
  orderId: string;
  productName: string;
  amount: number;
  status: "paid" | "unpaid";
  createdAt: string;
  customerId: string;
  paymentMethod?: string; // Added to show payment method
}

interface DailyCommission {
  date: string;
  totalCommission: number;
  paid: number;
  unpaid: number;
}

const Commission: React.FC = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [dailyCommissions, setDailyCommissions] = useState<DailyCommission[]>(
    []
  );
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);

  const salonId = session?.user?.salonId as string | undefined;
  const userId = session?.user?.id as string | undefined;

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchCommissions = useCallback(async () => {
    if (status !== "authenticated" || !salonId || !userId) {
      setError("Session data missing. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [ordersResponse, payoutsResponse] = await Promise.all([
        fetch(`/api/orders?salonId=${salonId}`, {
          headers: { "Content-Type": "application/json" },
        }),
        fetch(`/api/payouts?salonId=${salonId}`),
      ]);

      if (!ordersResponse.ok) {
        throw new Error(`Failed to fetch orders: ${ordersResponse.status}`);
      }
      if (!payoutsResponse.ok) {
        throw new Error(`Failed to fetch payouts: ${payoutsResponse.status}`);
      }

      const ordersData = await ordersResponse.json();
      const payoutsData = await payoutsResponse.json();
      const orders: Order[] = ordersData.orders || [];
      const payouts: Payout[] = payoutsData.payouts || [];

      setPayouts(payouts);

      // Transform orders into commissions with proper status based on payouts
      const commissionData = orders
        .flatMap((order) =>
          order.items
            .filter((item) => item.salonId?._id?.toString() === salonId)
            .map((item, index) => {
              const payout = payouts.find((p) => p.orderId === order._id);
              const status: "paid" | "unpaid" =
                payout && payout.status === "completed" ? "paid" : "unpaid";

              return {
                _id: `${order._id}-${index}`,
                orderId: order._id,
                productName: item.productId.name,
                amount: item.subtotal * (item.commissionRate || 0.05),
                status,
                createdAt: order.createdAt,
                customerId: order.customerId,
                paymentMethod: payout?.paymentMethod || undefined,
              } as Commission;
            })
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setCommissions(commissionData);

      // Aggregate daily commissions
      const dailyMap: {
        [key: string]: { total: number; paid: number; unpaid: number };
      } = {};
      commissionData.forEach((commission) => {
        const date = format(parseISO(commission.createdAt), "yyyy-MM-dd");
        if (!dailyMap[date]) {
          dailyMap[date] = { total: 0, paid: 0, unpaid: 0 };
        }
        dailyMap[date].total += commission.amount;
        if (commission.status === "paid") {
          dailyMap[date].paid += commission.amount;
        } else {
          dailyMap[date].unpaid += commission.amount;
        }
      });

      const dailyCommissionData: DailyCommission[] = Object.entries(dailyMap)
        .map(([date, { total, paid, unpaid }]) => ({
          date,
          totalCommission: total,
          paid,
          unpaid,
        }))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      setDailyCommissions(dailyCommissionData);
    } catch (err: any) {
      setError(err.message || "Failed to load commissions");
    } finally {
      setLoading(false);
    }
  }, [status, salonId, userId]);

  useEffect(() => {
    fetchCommissions();
    const interval = setInterval(fetchCommissions, 30 * 1000);
    return () => clearInterval(interval);
  }, [fetchCommissions]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const totalCommission = commissions.reduce((acc, c) => acc + c.amount, 0);
  const paidCommission = commissions
    .filter((c) => c.status === "paid")
    .reduce((acc, c) => acc + c.amount, 0);
  const pendingCommission = commissions
    .filter((c) => c.status === "unpaid")
    .reduce((acc, c) => acc + c.amount, 0);

  const getStatusColor = (status: "paid" | "unpaid") => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const filteredCommissions = commissions.filter((commission) => {
    if (filter === "all") return true;
    return commission.status === filter;
  });

  const chartData = dailyCommissions
    .slice(0, 7)
    .map((dc) => ({
      month: format(parseISO(dc.date), "MMM"),
      amount: parseFloat(dc.totalCommission.toFixed(2)),
    }))
    .reverse();

  if (status === "loading" || loading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        {error}
        <Button
          onClick={() => {
            setError(null);
            fetchCommissions();
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
          title="Commission & Payouts"
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          userId={userId}
        />
        <main className="dashboard-content animate-fade-in">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <DollarSign size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Commission</p>
                    <p className="text-2xl font-bold">
                      Rs {totalCommission.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="glass p-6 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Paid Commission</p>
                    <p className="text-2xl font-bold">
                      Rs {paidCommission.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="glass p-6 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <DollarSign size={24} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Commission</p>
                    <p className="text-2xl font-bold">
                      Rs {pendingCommission.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Monthly Commission</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "0.5rem",
                        border: "none",
                        boxShadow:
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      }}
                      formatter={(value) => [`Rs ${value}`, "Commission"]}
                    />
                    <Bar
                      dataKey="amount"
                      name="Commission"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-lg font-semibold">Commission History</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      className={cn(
                        "px-3 py-1 text-sm rounded-full transition-colors",
                        filter === "all"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      )}
                      onClick={() => setFilter("all")}
                    >
                      All
                    </button>
                    <button
                      className={cn(
                        "px-3 py-1 text-sm rounded-full transition-colors",
                        filter === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      )}
                      onClick={() => setFilter("paid")}
                    >
                      Paid
                    </button>
                    <button
                      className={cn(
                        "px-3 py-1 text-sm rounded-full transition-colors",
                        filter === "unpaid"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      )}
                      onClick={() => setFilter("unpaid")}
                    >
                      Unpaid
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Download size={14} className="mr-1" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
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
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Created Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCommissions.map((commission) => (
                      <tr key={commission._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">
                          #{commission.orderId.substring(0, 6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {commission.customerId}
                        </td>
                        <td className="px-6 py-4">{commission.productName}</td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                          Rs {commission.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "px-2 py-1 text-xs rounded-full capitalize",
                              getStatusColor(commission.status)
                            )}
                          >
                            {commission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {commission.paymentMethod
                            ? commission.paymentMethod
                                .replace("_", " ")
                                .toUpperCase()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(
                            parseISO(commission.createdAt),
                            "MMM dd, yyyy"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredCommissions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <DollarSign size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500">No commission records found</p>
                </div>
              )}
            </div>
            <div className="glass rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">
                  Daily Commission Summary
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Total Commission
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Paid Amount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                        Pending Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dailyCommissions.map((dc) => (
                      <tr key={dc.date} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(parseISO(dc.date), "MMM dd, yyyy")}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                          Rs {dc.totalCommission.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                          Rs {dc.paid.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-yellow-600">
                          Rs {dc.unpaid.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {dailyCommissions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <DollarSign size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    No daily commission records found
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Commission;
