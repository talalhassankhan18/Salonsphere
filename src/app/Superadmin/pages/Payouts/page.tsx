"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/components/ui/card";
import { Button } from "@/app/Superadmin/components/ui/button";
import { Input } from "@/app/Superadmin/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Superadmin/components/ui/table";
import { Badge } from "@/app/Superadmin/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/components/ui/tabs";
import {
  Search,
  Download,
  Filter,
  CircleDollarSign,
  CreditCard,
  Calendar,
  ChevronRight,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Superadmin/components/ui/select";

// Mock data for payouts
const payoutData = [
  {
    id: "PAY-7829",
    salonName: "Glam & Style",
    salonId: "SL-001",
    amount: 245.8,
    commission: 12.29,
    status: "completed",
    date: "2023-11-15",
    method: "bank_transfer",
  },
  {
    id: "PAY-6523",
    salonName: "Hair Masters",
    salonId: "SL-023",
    amount: 189.5,
    commission: 9.48,
    status: "processing",
    date: "2023-11-14",
    method: "paypal",
  },
  {
    id: "PAY-5291",
    salonName: "Beauty Lounge",
    salonId: "SL-045",
    amount: 356.2,
    commission: 17.81,
    status: "completed",
    date: "2023-11-10",
    method: "bank_transfer",
  },
  {
    id: "PAY-4102",
    salonName: "Scissors & Razors",
    salonId: "SL-062",
    amount: 124.75,
    commission: 6.24,
    status: "failed",
    date: "2023-11-09",
    method: "bank_transfer",
  },
  {
    id: "PAY-3298",
    salonName: "Curls & Cuts",
    salonId: "SL-078",
    amount: 278.3,
    commission: 13.92,
    status: "pending",
    date: "2023-11-08",
    method: "paypal",
  },
  {
    id: "PAY-2145",
    salonName: "Trendy Trims",
    salonId: "SL-103",
    amount: 198.6,
    commission: 9.93,
    status: "completed",
    date: "2023-11-05",
    method: "bank_transfer",
  },
];

// Mock data for commission overview
const commissionOverview = {
  totalCommission: 1589.42,
  pendingPayouts: 427.35,
  completedPayouts: 1162.07,
  failedPayouts: 124.75,
  commissionsThisMonth: 428.2,
  commissionsLastMonth: 562.5,
  percentageChange: -23.9,
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-500">
          Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500">
          Processing
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

const getMethodIcon = (method: string) => {
  switch (method) {
    case "bank_transfer":
      return <CreditCard className="h-4 w-4 text-slate-600" />;
    case "paypal":
      return <CircleDollarSign className="h-4 w-4 text-blue-600" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
};

const Payouts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPayouts = payoutData.filter(
    (payout) =>
      (payout.salonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payout.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || payout.status === statusFilter) &&
      (dateFilter === "all" ||
        (dateFilter === "thisWeek" &&
          new Date(payout.date) >=
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (dateFilter === "thisMonth" &&
          new Date(payout.date).getMonth() === new Date().getMonth()))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Payouts & Commissions
          </h1>
          <p className="text-muted-foreground">
            Manage salon payouts and commission tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Process Payouts
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
                  ${commissionOverview.totalCommission.toFixed(2)}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/30">
                <CircleDollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
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
                  ${commissionOverview.pendingPayouts.toFixed(2)}
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
                  ${commissionOverview.completedPayouts.toFixed(2)}
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
                    ${commissionOverview.commissionsThisMonth.toFixed(2)}
                  </h3>
                  <span
                    className={`text-xs ${
                      commissionOverview.percentageChange >= 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {commissionOverview.percentageChange >= 0 ? "+" : ""}
                    {commissionOverview.percentageChange}%
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

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <TabsList>
            <TabsTrigger value="all">All Payouts</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payouts..."
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

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Salon</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayouts.length > 0 ? (
                      filteredPayouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>{payout.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payout.salonName}</p>
                              <p className="text-xs text-muted-foreground">
                                {payout.salonId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>${payout.amount.toFixed(2)}</TableCell>
                          <TableCell>${payout.commission.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getMethodIcon(payout.method)}
                              <span className="text-sm capitalize">
                                {payout.method.replace("_", " ")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(payout.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(payout.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          No payouts found.
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
                <span className="font-medium">{filteredPayouts.length}</span> of{" "}
                <span className="font-medium">{payoutData.length}</span> payouts
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
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payouts</CardTitle>
              <CardDescription>
                Review and process pending payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Same table structure as "all" but with filtered data */}
              <div className="h-[200px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">
                  Pending payouts will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Completed Payouts</CardTitle>
              <CardDescription>
                History of all completed payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Same table structure as "all" but with filtered data */}
              <div className="h-[200px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">
                  Completed payouts will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Failed Payouts</CardTitle>
              <CardDescription>
                Review payouts that require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Same table structure as "all" but with filtered data */}
              <div className="h-[200px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">
                  Failed payouts will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payouts;
