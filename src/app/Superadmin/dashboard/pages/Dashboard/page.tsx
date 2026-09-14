"use client";

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

const salesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 2780 },
  { name: "May", sales: 1890 },
  { name: "Jun", sales: 2390 },
  { name: "Jul", sales: 3490 },
];

const topProducts = [
  { name: "Premium Shampoo", value: 400, color: "#1E40AF" },
  { name: "Hair Conditioner", value: 300, color: "#3B82F6" },
  { name: "Styling Gel", value: 200, color: "#93C5FD" },
  { name: "Hair Serum", value: 100, color: "#BFDBFE" },
];

const COLORS = ["#1E40AF", "#3B82F6", "#93C5FD", "#BFDBFE"];

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-muted-foreground">Dashboard</span>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        </div>
        <Button>
          View Reports
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
            <div className="text-2xl font-bold">$45,231.89</div>
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
            <div className="text-2xl font-bold">+124</div>
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
            <div className="text-2xl font-bold">+573</div>
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
            <div className="text-2xl font-bold">+2,378</div>
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
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
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
                  <span className="text-xs font-medium">${product.value}</span>
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
                <span className="text-sm text-muted-foreground">75/100</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Product Sales</span>
                <span className="text-sm text-muted-foreground">
                  $38,500/$50,000
                </span>
              </div>
              <Progress value={77} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Salon Retention Rate
                </span>
                <span className="text-sm text-muted-foreground">95%</span>
              </div>
              <Progress value={95} className="h-2" />
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
              <span className="font-medium">124</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Products Listed</span>
              </div>
              <span className="font-medium">1,205</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total Customers</span>
              </div>
              <span className="font-medium">24,389</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart4 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Avg. Commission</span>
              </div>
              <span className="font-medium">5%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
