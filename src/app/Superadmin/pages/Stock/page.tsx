"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/components/ui/tabs";
import {
  Database,
  Search,
  Filter,
  Edit,
  Plus,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Package,
  Check,
  AlertCircle,
  Boxes,
  PackageCheck,
} from "lucide-react";

// Mock data for stock
const stockData = [
  {
    id: 1,
    productName: "Shampoo Premium",
    sku: "SH-P-001",
    stockQuantity: 124,
    reserved: 15,
    available: 109,
    status: "In Stock",
    lowStockThreshold: 30,
    reorderPoint: 50,
    warehouse: "Main Warehouse",
  },
  {
    id: 2,
    productName: "Styling Gel Extra Hold",
    sku: "STY-G-002",
    stockQuantity: 85,
    reserved: 8,
    available: 77,
    status: "In Stock",
    lowStockThreshold: 20,
    reorderPoint: 40,
    warehouse: "Main Warehouse",
  },
  {
    id: 3,
    productName: "Hair Serum Repair",
    sku: "HR-S-003",
    stockQuantity: 42,
    reserved: 5,
    available: 37,
    status: "Low Stock",
    lowStockThreshold: 45,
    reorderPoint: 60,
    warehouse: "Main Warehouse",
  },
  {
    id: 4,
    productName: "Curling Iron Professional",
    sku: "EQ-CI-004",
    stockQuantity: 18,
    reserved: 3,
    available: 15,
    status: "Low Stock",
    lowStockThreshold: 20,
    reorderPoint: 30,
    warehouse: "Equipment Warehouse",
  },
  {
    id: 5,
    productName: "Beard Oil Sandalwood",
    sku: "MN-BO-005",
    stockQuantity: 0,
    reserved: 0,
    available: 0,
    status: "Out of Stock",
    lowStockThreshold: 10,
    reorderPoint: 25,
    warehouse: "Main Warehouse",
  },
  {
    id: 6,
    productName: "Salon Chair Deluxe",
    sku: "EQ-SC-006",
    stockQuantity: 8,
    reserved: 2,
    available: 6,
    status: "Low Stock",
    lowStockThreshold: 5,
    reorderPoint: 10,
    warehouse: "Equipment Warehouse",
  },
  {
    id: 7,
    productName: "Hair Dryer Pro",
    sku: "EQ-HD-007",
    stockQuantity: 27,
    reserved: 4,
    available: 23,
    status: "In Stock",
    lowStockThreshold: 15,
    reorderPoint: 25,
    warehouse: "Equipment Warehouse",
  },
  {
    id: 8,
    productName: "Hair Dye - Blonde",
    sku: "HD-BL-008",
    stockQuantity: 64,
    reserved: 12,
    available: 52,
    status: "In Stock",
    lowStockThreshold: 20,
    reorderPoint: 40,
    warehouse: "Main Warehouse",
  },
];

const Stock = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredStock = stockData
    .filter(
      (item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) => {
      if (activeTab === "all") return true;
      if (activeTab === "in-stock") return item.status === "In Stock";
      if (activeTab === "low-stock") return item.status === "Low Stock";
      if (activeTab === "out-of-stock") return item.status === "Out of Stock";
      return true;
    });

  // Calculate stock metrics
  const totalProducts = stockData.length;
  const totalStock = stockData.reduce(
    (sum, item) => sum + item.stockQuantity,
    0
  );
  const lowStockCount = stockData.filter(
    (item) => item.status === "Low Stock"
  ).length;
  const outOfStockCount = stockData.filter(
    (item) => item.status === "Out of Stock"
  ).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Stock Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage product inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Stock
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Boxes className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  Products in inventory
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PackageCheck className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{totalStock}</div>
                <p className="text-xs text-muted-foreground">
                  Units in inventory
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
              <div>
                <div className="text-2xl font-bold">{lowStockCount}</div>
                <p className="text-xs text-muted-foreground">
                  Products below threshold
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{outOfStockCount}</div>
                <p className="text-xs text-muted-foreground">
                  Products unavailable
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Stock</TabsTrigger>
            <TabsTrigger value="in-stock">In Stock</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="m-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>
                    Track and manage product stock levels
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>In Stock</TableHead>
                      <TableHead>Reserved</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStock.length > 0 ? (
                      filteredStock.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                              {item.productName}
                            </div>
                          </TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.stockQuantity}</TableCell>
                          <TableCell>{item.reserved}</TableCell>
                          <TableCell>{item.available}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {item.status === "In Stock" ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : item.status === "Low Stock" ? (
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  item.status === "In Stock"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "Low Stock"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{item.warehouse}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                              >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                              >
                                <Minus className="h-3.5 w-3.5 mr-1" />
                                Remove
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          No stock items found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Stock Movement</CardTitle>
            <CardDescription>Recent stock changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 border rounded-md">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Stock Added</div>
                  <div className="text-sm text-muted-foreground">
                    Added 50 units of Shampoo Premium
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">+50</div>
                  <div className="text-xs text-muted-foreground">
                    2 hours ago
                  </div>
                </div>
              </div>

              <div className="flex items-center p-3 border rounded-md">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Stock Removed</div>
                  <div className="text-sm text-muted-foreground">
                    Removed 12 units of Hair Serum Repair
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-red-600">-12</div>
                  <div className="text-xs text-muted-foreground">1 day ago</div>
                </div>
              </div>

              <div className="flex items-center p-3 border rounded-md">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Low Stock Alert</div>
                  <div className="text-sm text-muted-foreground">
                    Curling Iron Professional below threshold
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-amber-600">18 units</div>
                  <div className="text-xs text-muted-foreground">
                    2 days ago
                  </div>
                </div>
              </div>

              <div className="flex items-center p-3 border rounded-md">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Stock Added</div>
                  <div className="text-sm text-muted-foreground">
                    Added 25 units of Styling Gel Extra Hold
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">+25</div>
                  <div className="text-xs text-muted-foreground">
                    3 days ago
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warehouses</CardTitle>
            <CardDescription>
              Inventory distribution by location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium">Main Warehouse</div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Primary
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage Capacity</span>
                      <span>75% used</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-muted-foreground">Products</div>
                      <div className="font-medium">315</div>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-muted-foreground">Stock Value</div>
                      <div className="font-medium">$24,580</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium">Equipment Warehouse</div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Secondary
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage Capacity</span>
                      <span>42% used</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "42%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-muted-foreground">Products</div>
                      <div className="font-medium">53</div>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <div className="text-muted-foreground">Stock Value</div>
                      <div className="font-medium">$18,790</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stock;
