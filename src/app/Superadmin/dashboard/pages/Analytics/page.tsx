"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/dashboard/components/ui/card";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  CircleDollarSign,
  Download,
  Package,
  ShoppingCart,
  Store,
} from "lucide-react";

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

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("year");
  const [orders, setOrders] = useState<Order[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
  const totalProducts = products.length;
  const totalOrders = orders.length;

  // Prepare Chart Data
  const salesData = orders
    .map(order => ({
      name: new Date(order.createdAt).toLocaleString('default', { month: 'short' }),
      value: order.total,
    }))
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.name);
      if (existing) existing.value += curr.value;
      else acc.push(curr);
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => {
      const months: { [key: string]: number } = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
      return months[a.name] - months[b.name];
    });

  const salonSubscriptionData = [
    { name: "Starter", value: salons.filter(s => s.plan === "Starter").length, color: "#F59E0B" },
    { name: "Basic", value: salons.filter(s => s.plan === "Basic").length, color: "#3B82F6" },
    { name: "Premium", value: salons.filter(s => s.plan === "Premium").length, color: "#8B5CF6" },
  ].filter(item => item.value > 0);

  const categoryPerformance = products.reduce((acc, product) => {
    const cat = acc.find(c => c.name === product.category.name);
    if (cat) cat.value += product.sold || 0;
    else acc.push({ name: product.category.name, value: product.sold || 0 });
    return acc;
  }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .map((item) => ({ ...item, value: (item.value / totalOrders) * 100 }));

  const productPerformanceData = products.map(product => ({
    name: product.name,
    sales: product.sold || 0,
    profit: product.revenue || 0,
  }));

  const formatCurrency = (value: number) => `${value.toLocaleString()}`;

  const summaryMetrics = {
    totalRevenue,
    monthlySales: salesData.find(d => d.name === "May")?.value || 0,
    monthlyGrowth: 18.5,
    totalSalons,
    newSalons: salons.filter(s => new Date(s.createdAt).getMonth() === 4 && new Date(s.createdAt).getFullYear() === 2025).length,
    salonGrowth: 19.0,
    totalProducts,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
  };

  // Export Data Function
  const exportData = () => {
    // Prepare data for export
    const exportData = {
      summaryMetrics: [
        {
          Metric: "Total Revenue",
          Value: formatCurrency(summaryMetrics.totalRevenue),
          Description: `+${summaryMetrics.monthlyGrowth}% vs last month`,
        },
        {
          Metric: "Total Salons",
          Value: summaryMetrics.totalSalons,
          Description: `+${summaryMetrics.salonGrowth}% (${summaryMetrics.newSalons} new this month)`,
        },
        {
          Metric: "Total Products",
          Value: summaryMetrics.totalProducts,
          Description: "",
        },
        {
          Metric: "Total Orders",
          Value: summaryMetrics.totalOrders,
          Description: `Avg. order: ${formatCurrency(summaryMetrics.averageOrderValue)}`,
        },
      ],
      salesData,
      salonSubscriptionData,
      categoryPerformance,
      productPerformanceData,
    };

    // Convert to CSV
    let csvContent = "data:text/csv;charset=utf-8,";

    // Summary Metrics
    csvContent += "Summary Metrics\n";
    csvContent += "Metric,Value,Description\n";
    exportData.summaryMetrics.forEach(item => {
      csvContent += `"${item.Metric}","${item.Value}","${item.Description}"\n`;
    });

    // Sales Data
    csvContent += "\nMonthly Sales\n";
    csvContent += "Month,Revenue\n";
    exportData.salesData.forEach(item => {
      csvContent += `"${item.name}","${item.value}"\n`;
    });

    // Salon Subscriptions
    csvContent += "\nSalon Subscriptions\n";
    csvContent += "Plan,Count\n";
    exportData.salonSubscriptionData.forEach(item => {
      csvContent += `"${item.name}","${item.value}"\n`;
    });

    // Category Performance
    csvContent += "\nCategory Performance\n";
    csvContent += "Category,Percentage\n";
    exportData.categoryPerformance.forEach(item => {
      csvContent += `"${item.name}","${item.value.toFixed(2)}%"\n`;
    });

    // Product Performance
    csvContent += "\nProduct Performance\n";
    csvContent += "Product,Sales,Profit\n";
    exportData.productPerformanceData.forEach(item => {
      csvContent += `"${item.name}","${item.sales}","${item.profit}"\n`;
    });

    // Encode and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-600">{error}</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Business performance insights and metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">{formatCurrency(summaryMetrics.totalRevenue)}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900/30">
                <CircleDollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-emerald-500 font-medium">+{summaryMetrics.monthlyGrowth}%</span>
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Salons</p>
                <h3 className="text-2xl font-bold mt-1">{summaryMetrics.totalSalons}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-emerald-500 font-medium">+{summaryMetrics.salonGrowth}%</span>
              <span className="text-muted-foreground ml-1">{summaryMetrics.newSalons} new this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold mt-1">{summaryMetrics.totalProducts}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center dark:bg-cyan-900/30">
                <Package className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">{summaryMetrics.totalOrders}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/30">
                <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-muted-foreground">Avg. order: </span>
              <span className="font-medium ml-1">{formatCurrency(summaryMetrics.averageOrderValue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="salons">Salons</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue overview for the year</CardDescription>
              </CardHeader>
              <CardContent className="px-2 flex justify-center items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
                    <Area type="monotone" dataKey="value" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Salon Subscriptions</CardTitle>
                <CardDescription>Distribution of salon subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={salonSubscriptionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {salonSubscriptionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}`, "Salons"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Category Performance</CardTitle>
                <CardDescription>Sales distribution across product categories</CardDescription>
              </CardHeader>
              <CardContent className="px-2 flex justify-center items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, "Percentage"]} />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Salon Growth</CardTitle>
                <CardDescription>Monthly salon onboarding trends</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData.map(d => ({
                    name: d.name,
                    value: salons.filter(s => new Date(s.createdAt).toLocaleString('default', { month: 'short' }) === d.name).length
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>Detailed revenue breakdown and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Salon Analytics</CardTitle>
              <CardDescription>Performance metrics for registered salons</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie data={salonSubscriptionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                    {salonSubscriptionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}`, "Salons"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Top performing products by sales and profit</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={productPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8B5CF6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" fill="#8B5CF6" name="Units Sold" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="profit" fill="#3B82F6" name="Profit (PKR)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;