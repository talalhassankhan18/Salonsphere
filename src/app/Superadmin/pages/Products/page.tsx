"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/components/ui/tabs";
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
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  BarChart,
} from "lucide-react";

// Mock data for product listings
const productData = [
  {
    id: 1,
    name: "Shampoo Premium",
    category: "Hair Care",
    price: 19.99,
    stock: 124,
    status: "Active",
    sold: 567,
    revenue: 11334.33,
  },
  {
    id: 2,
    name: "Styling Gel Extra Hold",
    category: "Styling",
    price: 14.99,
    stock: 85,
    status: "Active",
    sold: 328,
    revenue: 4916.72,
  },
  {
    id: 3,
    name: "Hair Serum Repair",
    category: "Treatment",
    price: 29.99,
    stock: 42,
    status: "Active",
    sold: 211,
    revenue: 6327.89,
  },
  {
    id: 4,
    name: "Curling Iron Professional",
    category: "Equipment",
    price: 79.99,
    stock: 18,
    status: "Low Stock",
    sold: 76,
    revenue: 6079.24,
  },
  {
    id: 5,
    name: "Beard Oil Sandalwood",
    category: "Men's Care",
    price: 24.99,
    stock: 0,
    status: "Out of Stock",
    sold: 195,
    revenue: 4873.05,
  },
];

const ProductCard = ({ product }) => (
  <Card className="h-full">
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{product.name}</CardTitle>
      <CardDescription>{product.category}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">${product.price.toFixed(2)}</span>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            product.status === "Active"
              ? "bg-green-100 text-green-800"
              : product.status === "Low Stock"
              ? "bg-amber-100 text-amber-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {product.status}
        </span>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        <div className="flex justify-between mb-1">
          <span>Stock</span>
          <span>{product.stock} units</span>
        </div>
        <div className="flex justify-between">
          <span>Sales</span>
          <span>{product.sold} units</span>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" className="w-full">
          <Eye className="w-3.5 h-3.5 mr-1" />
          View
        </Button>
        <Button variant="outline" size="sm" className="w-full">
          <Edit className="w-3.5 h-3.5 mr-1" />
          Edit
        </Button>
      </div>
    </CardContent>
  </Card>
);

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const filteredProducts = productData.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalogue</p>
        </div>
        <Button className="sm:self-start">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
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
              <div className="flex justify-between items-center">
                <CardTitle>All Products</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="h-8 w-8 p-0"
                  >
                    <BarChart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "grid" ? (
                filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No products found.</p>
                  </div>
                )
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              {product.name}
                            </TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>${product.price.toFixed(2)}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  product.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : product.status === "Low Stock"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.status}
                              </span>
                            </TableCell>
                            <TableCell>{product.sold}</TableCell>
                            <TableCell>${product.revenue.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center h-24">
                            No products found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Products;
