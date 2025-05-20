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
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart4,
  CircleDollarSign,
  Package,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { Progress } from "@/app/Superadmin/dashboard/components/ui/progress";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Interfaces based on referenced files
interface Order {
  _id: string;
  customerId: string;
  customerEmail: string;
  items: {
    productId: { name: string } | string;
    salonId?: { salonName: string } | string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    commissionRate?: number;
  }[];
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface Salon {
  _id: string;
  salonName: string;
  name: string;
  plan: string;
  isActive: boolean;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  category: { _id: string; name: string };
  price: number;
  discount?: number;
  stock: number;
  status: string;
  sold: number;
  revenue: number;
  imageUrls: string[];
}

interface Customer {
  _id: string;
  name?: string;
  email: string;
  createdAt: string;
  isVerified?: boolean;
  authMethod?: "email" | "google";
}

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Orders
      const ordersResponse = await fetch("/api/public-orders");
      if (!ordersResponse.ok) throw new Error("Failed to fetch orders");
      const ordersData = await ordersResponse.json();
      setOrders(ordersData.orders || []);

      // Fetch Salons
      const salonsResponse = await fetch("/api/salon");
      if (!salonsResponse.ok) throw new Error("Failed to fetch salons");
      const salonsData = await salonsResponse.json();
      const mappedSalons = salonsData.map((salon: any) => ({
        _id: salon._id,
        salonName: salon.salonName,
        name: salon.name || "Unknown",
        plan: salon.plan || "Unknown",
        isActive: salon.isActive || false,
        createdAt: salon.createdAt || new Date().toISOString(),
      }));
      setSalons(mappedSalons);

      // Fetch Products
      const productsResponse = await fetch("/api/products");
      if (!productsResponse.ok) throw new Error("Failed to fetch products");
      const productsData = await productsResponse.json();
      setProducts(productsData.data || []);

      // Fetch Customers
      const customersResponse = await fetch("/api/customers");
      if (!customersResponse.ok) throw new Error("Failed to fetch customers");
      const customersData = await customersResponse.json();
      setCustomers(customersData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0) +
    salons.reduce((sum, salon) => {
      switch (salon.plan) {
        case "Premium": return sum + 5000;
        case "Standard": return sum + 3000;
        case "Basic": return sum + 1000;
        case "Starter": return sum + 500;
        default: return sum;
      }
    }, 0);

  const totalSalons = salons.length;
  const activeOrders = orders.filter(order => ["Pending", "Shipped"].includes(order.status)).length;
  const newCustomers = customers.filter(customer => {
    const createdDate = new Date(customer.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length;

  // Sales Data for Chart
  const salesData = orders
    .map(order => ({
      name: new Date(order.createdAt).toLocaleString('default', { month: 'short' }),
      sales: order.total,
    }))
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.name);
      if (existing) existing.sales += curr.sales;
      else acc.push(curr);
      return acc;
    }, [] as { name: string; sales: number }[])
    .sort((a, b) => {
      const months: { [key: string]: number } = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
      return months[a.name] - months[b.name];
    });

  // Top Products
  const topProducts = products
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 4)
    .map((product, index) => ({
      name: product.name,
      value: product.sold || 0,
      color: ["#1E40AF", "#3B82F6", "#93C5FD", "#BFDBFE"][index % 4],
    }));

  const COLORS = ["#1E40AF", "#3B82F6", "#93C5FD", "#BFDBFE"];

  // Platform Stats
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const avgCommission = orders.length > 0
    ? orders.reduce((acc, order) => {
        const commission = order.items.reduce((sum, item) => {
          if (item.salonId && item.commissionRate) {
            return sum + item.subtotal * item.commissionRate;
          }
          return sum;
        }, 0);
        return acc + commission;
      }, 0) / orders.length
    : 0;

  // Target Progress
  const targetSalonSubscriptions = 100;
  const currentSalonSubscriptions = totalSalons;
  const salonSubscriptionProgress = (currentSalonSubscriptions / targetSalonSubscriptions) * 100;

  const targetProductSales = 50000;
  const currentProductSales = orders.reduce((sum, order) => sum + order.total, 0);
  const productSalesProgress = (currentProductSales / targetProductSales) * 100;

  const salonRetentionRate = salons.length > 0
    ? (salons.filter(s => s.isActive).length / salons.length) * 100
    : 0;

  // Format currency
  const formatCurrency = (value: number) => `Rs${value.toLocaleString()}`;

  // Export function
  const exportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalRevenue,
      totalSalons,
      activeOrders,
      newCustomers,
      totalProducts,
      totalCustomers,
      avgCommission,
      salonSubscriptionProgress,
      productSalesProgress,
      salonRetentionRate,
      orders,
      salons,
      products,
      customers,
      salesData,
      topProducts,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dashboard_export_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-600">{error}</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-muted-foreground">Dashboard</span>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        </div>
        <Button onClick={exportData}>
          Export
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="animate-slide-in animate-delay-100 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center text-sm text-green-500 mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>+20.1% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-in animate-delay-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salons</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSalons}</div>
            <div className="flex items-center text-sm text-green-500 mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>+14% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-in animate-delay-300 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
            <div className="flex items-center text-sm text-red-500 mt-1">
              <ArrowDown className="h-3 w-3 mr-1" />
              <span>-2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-in animate-delay-400 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newCustomers}</div>
            <div className="flex items-center text-sm text-green-500 mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>+18% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 animate-slide-in animate-delay-100">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Sales"]}
                />
                <Bar dataKey="sales" fill="#1E40AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-slide-in animate-delay-200">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {topProducts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: number) => [`${value}`, "Units Sold"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="px-6">
            <div className="space-y-2 w-full">
              {topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: product.color }}
                    />
                    <span className="text-xs">{product.name}</span>
                  </div>
                  <span className="text-xs font-medium">{product.value}</span>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 animate-slide-in animate-delay-300">
          <CardHeader>
            <CardTitle>Target Progress</CardTitle>
            <CardDescription>
              Progress towards monthly subscription target
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Salon Subscriptions</span>
                <span className="text-sm text-muted-foreground">{currentSalonSubscriptions}/{targetSalonSubscriptions}</span>
              </div>
              <Progress value={salonSubscriptionProgress} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Product Sales</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(currentProductSales)}/{formatCurrency(targetProductSales)}
                </span>
              </div>
              <Progress value={productSalesProgress} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Salon Retention Rate</span>
                <span className="text-sm text-muted-foreground">{salonRetentionRate.toFixed(1)}%</span>
              </div>
              <Progress value={salonRetentionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-in animate-delay-400">
          <CardHeader>
            <CardTitle>Platform Stats</CardTitle>
            <CardDescription>Key performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Active Salons</span>
              </div>
              <span className="font-medium">{salons.filter(s => s.isActive).length}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Products Listed</span>
              </div>
              <span className="font-medium">{totalProducts}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total Customers</span>
              </div>
              <span className="font-medium">{totalCustomers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart4 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Avg. Commission</span>
              </div>
              <span className="font-medium">{avgCommission.toFixed(2)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;