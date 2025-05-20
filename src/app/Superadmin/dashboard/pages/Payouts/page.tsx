"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/dashboard/components/ui/card";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import { Input } from "@/app/Superadmin/dashboard/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Superadmin/dashboard/components/ui/table";
import { Badge } from "@/app/Superadmin/dashboard/components/ui/badge";
import { Search, Download, CheckCircle, Clock, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Superadmin/dashboard/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/Superadmin/dashboard/components/ui/dialog";
import { toast } from "@/app/Superadmin/dashboard/components/ui/use-toast";
import PaymentMethodSection from "@/common/payment-method-section";

interface PaymentMethodSectionProps {
  onCompleted: (paymentMethod: string) => Promise<void>;
  totalAmount: number;
  isLoading: boolean;
}

interface OrderItem {
  productId: { name: string } | string;
  salonId?: { _id: string; salonName: string } | string | null;
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
}

interface Payout {
  _id: string;
  orderId: string;
  salonId: string | null;
  amount: number;
  paymentMethod: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

interface SalonCommission {
  salonId: string;
  salonName: string;
  totalCommission: number;
  pendingCommission: number;
  completedCommission: number;
  failedCommission: number;
  orderIds: string[];
  latestDate: string;
}

interface CommissionOverview {
  totalCommission: number;
  pendingPayouts: number;
  completedPayouts: number;
  failedPayouts: number;
  commissionsThisMonth: number;
  commissionsLastMonth: number;
  percentageChange: number;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-500">
          Completed
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-500">
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-800/30 dark:text-rose-500">
          Failed
        </Badge>
      );
    default:
      return <Badge>Unknown</Badge>;
  }
};

const Payouts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [salonCommissions, setSalonCommissions] = useState<SalonCommission[]>(
    []
  );
  const [commissionOverview, setCommissionOverview] =
    useState<CommissionOverview>({
      totalCommission: 0,
      pendingPayouts: 0,
      completedPayouts: 0,
      failedPayouts: 0,
      commissionsThisMonth: 0,
      commissionsLastMonth: 0,
      percentageChange: 0,
    });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<SalonCommission | null>(
    null
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);

  const fetchOrdersAndPayouts = async () => {
    try {
      setLoading(true);
      const [ordersResponse, payoutsResponse] = await Promise.all([
        fetch("/api/public-orders"),
        fetch("/api/payouts"),
      ]);

      if (!ordersResponse.ok) {
        throw new Error(`Failed to fetch orders: ${ordersResponse.status}`);
      }
      if (!payoutsResponse.ok) {
        throw new Error(`Failed to fetch payouts: ${payoutsResponse.status}`);
      }

      const ordersData = await ordersResponse.json();
      const payoutsData = await payoutsResponse.json();

      const formattedOrders: Order[] = ordersData.orders.map((order: any) => ({
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
        createdAt: order.createdAt || new Date().toISOString(),
      }));

      const formattedPayouts: Payout[] = payoutsData.payouts;

      setOrders(formattedOrders);
      setPayouts(formattedPayouts);

      // Aggregate commissions by salon
      const salonMap: { [key: string]: SalonCommission } = {};
      formattedOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (item.salonId && item.commissionRate) {
            const salonId =
              typeof item.salonId === "object"
                ? item.salonId._id
                : item.salonId;
            const salonName = item.salonName || "Unknown Salon";
            const commission = item.subtotal * item.commissionRate;
            const payout = formattedPayouts.find(
              (p) => p.orderId === order._id
            );

            if (!salonMap[salonId]) {
              salonMap[salonId] = {
                salonId,
                salonName,
                totalCommission: 0,
                pendingCommission: 0,
                completedCommission: 0,
                failedCommission: 0,
                orderIds: [],
                latestDate: order.createdAt,
              };
            }

            salonMap[salonId].totalCommission += commission;
            if (payout) {
              if (payout.status === "completed") {
                salonMap[salonId].completedCommission += commission;
              } else if (payout.status === "failed") {
                salonMap[salonId].failedCommission += commission;
              } else {
                salonMap[salonId].pendingCommission += commission;
              }
            } else {
              salonMap[salonId].pendingCommission += commission;
            }
            salonMap[salonId].orderIds.push(order._id);
            if (
              new Date(order.createdAt) > new Date(salonMap[salonId].latestDate)
            ) {
              salonMap[salonId].latestDate = order.createdAt;
            }
          }
        });
      });

      const salonArray = Object.values(salonMap);

      // Calculate commission overview
      const now = new Date();
      const thisMonth = now.getMonth();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const thisYear = now.getFullYear();
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

      const overview: CommissionOverview = {
        totalCommission: salonArray.reduce(
          (sum, s) => sum + s.totalCommission,
          0
        ),
        pendingPayouts: salonArray.reduce(
          (sum, s) => sum + s.pendingCommission,
          0
        ),
        completedPayouts: salonArray.reduce(
          (sum, s) => sum + s.completedCommission,
          0
        ),
        failedPayouts: salonArray.reduce(
          (sum, s) => sum + s.failedCommission,
          0
        ),
        commissionsThisMonth: salonArray
          .filter(
            (s) =>
              new Date(s.latestDate).getMonth() === thisMonth &&
              new Date(s.latestDate).getFullYear() === thisYear
          )
          .reduce((sum, s) => sum + s.totalCommission, 0),
        commissionsLastMonth: salonArray
          .filter(
            (s) =>
              new Date(s.latestDate).getMonth() === lastMonth &&
              new Date(s.latestDate).getFullYear() === lastMonthYear
          )
          .reduce((sum, s) => sum + s.totalCommission, 0),
        percentageChange: 0,
      };

      overview.percentageChange =
        overview.commissionsLastMonth === 0
          ? 0
          : ((overview.commissionsThisMonth - overview.commissionsLastMonth) /
              overview.commissionsLastMonth) *
            100;

      setSalonCommissions(salonArray);
      setCommissionOverview(overview);
    } catch (error: any) {
      setError(error.message || "Failed to fetch data");
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndPayouts();
  }, []);

  const handlePayCommission = async (salon: SalonCommission) => {
    try {
      setSelectedSalon(salon);
      setIsPaymentModalOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to initiate payment",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async (paymentMethod: string) => {
    try {
      if (!selectedSalon) return;

      // Create payouts for each order
      const payoutsToCreate = selectedSalon.orderIds
        .map((orderId) => {
          const order = orders.find((o) => o._id === orderId);
          if (!order) return null;
          const commission = order.items
            .filter((item) => {
              const salonId =
                typeof item.salonId === "object"
                  ? item.salonId?._id
                  : item.salonId;
              return salonId === selectedSalon.salonId && item.commissionRate;
            })
            .reduce(
              (sum, item) => sum + item.subtotal * (item.commissionRate || 0),
              0
            );
          return {
            orderId,
            salonId: selectedSalon.salonId,
            amount: commission,
            paymentMethod,
            status: "completed",
          };
        })
        .filter((p) => p !== null);

      const response = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payoutsToCreate),
      });

      if (!response.ok) {
        throw new Error("Failed to create payouts");
      }

      const responseData = await response.json();

      // Update local state
      setSalonCommissions((prev) =>
        prev.map((s) =>
          s.salonId === selectedSalon.salonId
            ? {
                ...s,
                pendingCommission: 0,
                completedCommission:
                  s.completedCommission + s.pendingCommission,
              }
            : s
        )
      );

      setPayouts((prev) => [...prev, ...responseData.payouts]);

      setIsPaymentModalOpen(false);
      toast({
        title: "Success",
        description: "Payout completed successfully",
      });

      // Recalculate overview
      const updatedPending = salonCommissions.reduce(
        (sum, s) => sum + s.pendingCommission,
        0
      );
      const updatedCompleted = salonCommissions.reduce(
        (sum, s) => sum + s.completedCommission,
        0
      );
      setCommissionOverview((prev) => ({
        ...prev,
        pendingPayouts: updatedPending,
        completedPayouts: updatedCompleted,
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update payout status",
        variant: "destructive",
      });
    }
  };

  const filteredSalonCommissions = salonCommissions.filter(
    (salon) =>
      (salon.salonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.salonId.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" ||
        (statusFilter === "pending" && salon.pendingCommission > 0) ||
        (statusFilter === "completed" && salon.completedCommission > 0) ||
        (statusFilter === "failed" && salon.failedCommission > 0)) &&
      (dateFilter === "all" ||
        (dateFilter === "thisWeek" &&
          new Date(salon.latestDate) >=
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (dateFilter === "thisMonth" &&
          new Date(salon.latestDate).getMonth() === new Date().getMonth()))
  );

  const renderPaymentModal = () => {
    if (!selectedSalon) return null;

    return (
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Process Payout - {selectedSalon.salonName}
            </DialogTitle>
          </DialogHeader>
          <PaymentMethodSection
            totalAmount={selectedSalon.pendingCommission}
            onCompleted={handlePaymentSuccess}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return <div>Loading payouts...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center">
        <p className="text-red-500">{error}</p>
        <Button
          onClick={() => {
            setError(null);
            fetchOrdersAndPayouts();
          }}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Payouts & Commissions
          </h1>
          <p className="text-muted-foreground">
            Manage salon commissions and payouts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Commission
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  ₨{commissionOverview.totalCommission.toFixed(2)}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/30">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Payouts
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  ₨{commissionOverview.pendingPayouts.toFixed(2)}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center dark:bg-amber-900/30">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed Payouts
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  ₨{commissionOverview.completedPayouts.toFixed(2)}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Monthly Change
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <h3 className="text-2xl font-bold">
                    ₨{commissionOverview.commissionsThisMonth.toFixed(2)}
                  </h3>
                  <span
                    className={`text-xs ${
                      commissionOverview.percentageChange >= 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {commissionOverview.percentageChange >= 0 ? "+" : ""}
                    {commissionOverview.percentageChange.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900/30">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex items-center gap-2">
          <Button
            className={statusFilter === "all" ? "bg-blue-500 text-white" : ""}
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            className={
              statusFilter === "pending" ? "bg-blue-500 text-white" : ""
            }
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button
            className={
              statusFilter === "completed" ? "bg-blue-500 text-white" : ""
            }
            onClick={() => setStatusFilter("completed")}
          >
            Completed
          </Button>
          <Button
            className={
              statusFilter === "failed" ? "bg-blue-500 text-white" : ""
            }
            onClick={() => setStatusFilter("failed")}
          >
            Failed
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by salon name or ID..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salon Commissions</CardTitle>
          <CardDescription>
            Total commissions earned by each salon
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salon Name</TableHead>
                  <TableHead>Salon ID</TableHead>
                  <TableHead>Total Commission</TableHead>
                  <TableHead>Pending Commission</TableHead>
                  <TableHead>Completed Commission</TableHead>
                  <TableHead>Failed Commission</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalonCommissions.length > 0 ? (
                  filteredSalonCommissions.map((salon) => (
                    <TableRow key={salon.salonId}>
                      <TableCell>{salon.salonName}</TableCell>
                      <TableCell>{salon.salonId}</TableCell>
                      <TableCell>₨{salon.totalCommission.toFixed(2)}</TableCell>
                      <TableCell>
                        ₨{salon.pendingCommission.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        ₨{salon.completedCommission.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        ₨{salon.failedCommission.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {salon.pendingCommission > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePayCommission(salon)}
                          >
                            Pay Commission
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No salons found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between py-4">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium">
              {filteredSalonCommissions.length}
            </span>{" "}
            of <span className="font-medium">{salonCommissions.length}</span>{" "}
            salons
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {renderPaymentModal()}
    </div>
  );
};

export default Payouts;
