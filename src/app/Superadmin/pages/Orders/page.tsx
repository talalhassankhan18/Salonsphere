"use client";

import { useState } from "react";
import { Badge } from "@/app/Superadmin/components/ui/badge";
import { Button } from "@/app/Superadmin/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/components/ui/card";
import { Input } from "@/app/Superadmin/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Superadmin/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Superadmin/components/ui/select";

// Sample order data
const orders = [
  {
    id: "ORD-2023-5871",
    customer: "Emma Wilson",
    salon: "Luxury Hair",
    date: "May 12, 2023",
    items: 3,
    amount: "$142.99",
    status: "completed",
    payment: "paid",
  },
  {
    id: "ORD-2023-5870",
    customer: "Michael Chen",
    salon: "Glam Studio",
    date: "May 12, 2023",
    items: 1,
    amount: "$39.99",
    status: "processing",
    payment: "paid",
  },
  {
    id: "ORD-2023-5869",
    customer: "Sarah Johnson",
    salon: "Elegant Styles",
    date: "May 11, 2023",
    items: 2,
    amount: "$85.50",
    status: "completed",
    payment: "paid",
  },
  {
    id: "ORD-2023-5868",
    customer: "David Miller",
    salon: "Perfect Cuts",
    date: "May 11, 2023",
    items: 4,
    amount: "$178.25",
    status: "shipped",
    payment: "paid",
  },
  {
    id: "ORD-2023-5867",
    customer: "Olivia Taylor",
    salon: "Modern Touch",
    date: "May 10, 2023",
    items: 1,
    amount: "$42.99",
    status: "cancelled",
    payment: "refunded",
  },
  {
    id: "ORD-2023-5866",
    customer: "James Anderson",
    salon: "Style Masters",
    date: "May 10, 2023",
    items: 2,
    amount: "$87.50",
    status: "pending",
    payment: "unpaid",
  },
  {
    id: "ORD-2023-5865",
    customer: "Lisa Brown",
    salon: "Beauty Lounge",
    date: "May 9, 2023",
    items: 3,
    amount: "$125.75",
    status: "processing",
    payment: "paid",
  },
];

const Orders = () => {
  const [currentTab, setCurrentTab] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400";
      case "processing":
        return "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
      case "shipped":
        return "bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400";
      case "pending":
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
      case "cancelled":
        return "bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  const getPaymentColor = (payment: string) => {
    switch (payment) {
      case "paid":
        return "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400";
      case "unpaid":
        return "bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400";
      case "refunded":
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400";
    }
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
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </div>

          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="w-full md:w-auto relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8 w-full md:w-80"
                  placeholder="Search orders..."
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
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
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Salon
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Date
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Items
                      </TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Payment
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {order.salon}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {order.date}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {order.items}
                        </TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge
                            variant="outline"
                            className={`${getPaymentColor(order.payment)}`}
                          >
                            {order.payment}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {["pending", "processing", "completed", "cancelled"].map((tab) => (
              <TabsContent key={tab} value={tab} className="m-0">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Salon
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Date
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Items
                        </TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Payment
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders
                        .filter((order) => order.status === tab)
                        .map((order) => (
                          <TableRow
                            key={order.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">
                              {order.id}
                            </TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {order.salon}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {order.date}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {order.items}
                            </TableCell>
                            <TableCell>{order.amount}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge
                                variant="outline"
                                className={`${getStatusColor(order.status)}`}
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge
                                variant="outline"
                                className={`${getPaymentColor(order.payment)}`}
                              >
                                {order.payment}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}

            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">7</span> of{" "}
                <span className="font-medium">42</span> results
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Orders;
