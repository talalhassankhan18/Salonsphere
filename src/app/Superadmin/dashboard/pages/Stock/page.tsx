"use client";

import { useCallback, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/dashboard/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/dashboard/components/ui/tabs";
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
import {
  Database,
  Search,
  Filter,
  Edit,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  Package,
  Check,
  AlertCircle,
  Boxes,
  PackageCheck,
  Trash2,
} from "lucide-react";
import { toast } from "@/app/Superadmin/dashboard/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/app/Superadmin/dashboard/components/ui/dialog";
import { Label } from "@/app/Superadmin/dashboard/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Superadmin/dashboard/components/ui/select";

interface Product {
  _id: string;
  name: string;
  category: { _id: string; name: string };
}

interface Stock {
  _id: string;
  productId: string;
  productName: string;
  category: { _id: string; name: string };
  sku: string;
  stockQuantity: number;
  reserved: number;
  available: number;
  status: string;
  lowStockThreshold: number;
  reorderPoint: number;
  warehouse: string;
}

const Stock = () => {
  const [stockItems, setStockItems] = useState<Stock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStockId, setDeletingStockId] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [formData, setFormData] = useState({
    productId: "",
    stockQuantity: 0,
    reserved: 0,
    lowStockThreshold: 10,
    reorderPoint: 20,
    warehouse: "",
  });

  const warehouses = ["Main Warehouse", "Equipment Warehouse"];

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?search=`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

  const fetchStock = useCallback(async () => {
    try {
      const response = await fetch(`/api/Stock?search=${searchTerm}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const result = await response.json();
      if (result.success) {
        setStockItems(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
      toast({
        title: "Error",
        description: "Failed to fetch stock",
        variant: "destructive",
      });
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
    fetchStock();
  }, [fetchStock]);

  useEffect(() => {
    if (editingStock) {
      setFormData({
        productId: editingStock.productId,
        stockQuantity: editingStock.stockQuantity,
        reserved: editingStock.reserved,
        lowStockThreshold: editingStock.lowStockThreshold,
        reorderPoint: editingStock.reorderPoint,
        warehouse: editingStock.warehouse,
      });
    }
  }, [editingStock]);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/Stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        setIsAddModalOpen(false);
        setFormData({
          productId: "",
          stockQuantity: 0,
          reserved: 0,
          lowStockThreshold: 10,
          reorderPoint: 20,
          warehouse: "",
        });
        await fetchStock();
        toast({
          title: "Success",
          description: "Stock added successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error adding stock:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add stock",
        variant: "destructive",
      });
    }
  };

  const handleEditStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStock) return;
    try {
      const response = await fetch(`/api/Stock/${editingStock._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        setIsEditModalOpen(false);
        setEditingStock(null);
        setFormData({
          productId: "",
          stockQuantity: 0,
          reserved: 0,
          lowStockThreshold: 10,
          reorderPoint: 20,
          warehouse: "",
        });
        await fetchStock();
        toast({
          title: "Success",
          description: "Stock updated successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error updating stock:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update stock",
        variant: "destructive",
      });
    }
  };

  const handleAdjustStock = async (id: string, adjustment: number) => {
    try {
      const stockItem = stockItems.find((item) => item._id === id);
      if (!stockItem) {
        toast({
          title: "Error",
          description: "Stock item not found",
          variant: "destructive",
        });
        return;
      }

      const newStockQuantity = stockItem.stockQuantity + adjustment;
      if (newStockQuantity < 0) {
        toast({
          title: "Error",
          description: "Stock cannot be negative",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/Stock/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stockQuantity: newStockQuantity,
          reserved: stockItem.reserved,
          lowStockThreshold: stockItem.lowStockThreshold,
          reorderPoint: stockItem.reorderPoint,
          warehouse: stockItem.warehouse,
          productId: stockItem.productId,
        }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchStock();
        toast({
          title: "Success",
          description: `Stock ${adjustment > 0 ? "added" : "removed"} successfully`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error adjusting stock:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to adjust stock",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStock = async () => {
    if (!deletingStockId) return;
    try {
      const response = await fetch(`/api/Stock/${deletingStockId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setIsDeleteModalOpen(false);
        setDeletingStockId(null);
        await fetchStock();
        toast({
          title: "Success",
          description: "Stock deleted successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error deleting stock:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete stock",
        variant: "destructive",
      });
    }
  };

  const filteredStock = stockItems
    .filter(
      (item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) => {
      if (activeTab === "all") return true;
      if (activeTab === "in-stock") return item.status === "In Stock";
      if (activeTab === "low-stock") return item.status === "Low Stock";
      if (activeTab === "out-of-stock") return item.status === "Out of Stock";
      return true;
    });

  // Calculate stock metrics
  const totalProducts = stockItems.length;
  const totalStock = stockItems.reduce(
    (sum, item) => sum + item.stockQuantity,
    0
  );
  const lowStockCount = stockItems.filter(
    (item) => item.status === "Low Stock"
  ).length;
  const outOfStockCount = stockItems.filter(
    (item) => item.status === "Out of Stock"
  ).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">Monitor and manage product inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStock}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Boxes className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">Products in inventory</p>
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
                <p className="text-xs text-muted-foreground">Units in inventory</p>
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
                <p className="text-xs text-muted-foreground">Products below threshold</p>
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
                <p className="text-xs text-muted-foreground">Products unavailable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isAddModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setFormData({
              productId: "",
              stockQuantity: 0,
              reserved: 0,
              lowStockThreshold: 10,
              reorderPoint: 20,
              warehouse: "",
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStock} className="space-y-4">
            <div>
              <Label>Product</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name} ({product.category.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })
                }
                required
                min="0"
              />
            </div>
            <div>
              <Label>Reserved</Label>
              <Input
                type="number"
                value={formData.reserved}
                onChange={(e) =>
                  setFormData({ ...formData, reserved: parseInt(e.target.value) || 0 })
                }
                required
                min="0"
              />
            </div>
            <div>
              <Label>Low Stock Threshold</Label>
              <Input
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })
                }
                required
                min="0"
              />
            </div>
            <div>
              <Label>Reorder Point</Label>
              <Input
                type="number"
                value={formData.reorderPoint}
                onChange={(e) =>
                  setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })
                }
                required
                min="0"
              />
            </div>
            <div>
              <Label>Warehouse</Label>
              <Select
                value={formData.warehouse}
                onValueChange={(value) => setFormData({ ...formData, warehouse: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse} value={warehouse}>
                      {warehouse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Add Stock</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormData({
                    productId: "",
                    stockQuantity: 0,
                    reserved: 0,
                    lowStockThreshold: 10,
                    reorderPoint: 20,
                    warehouse: "",
                  });
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditModalOpen(false);
            setEditingStock(null);
            setFormData({
              productId: "",
              stockQuantity: 0,
              reserved: 0,
              lowStockThreshold: 10,
              reorderPoint: 20,
              warehouse: "",
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditStock} className="space-y-4">
            <div>
              <Label>Product</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
                required
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name} ({product.category.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })
                }
                required
                min="0"
              />
            </div>
            <div>
              <Label>Reserved</Label>
              <Input
                type="number"
                value={formData.reserved}
                onChange={(e) =>
                  setFormData({ ...formData, reserved: parseInt(e.target.value) || 0 })
                }
                required
                min="0"
              />
            </div>
            <div>
              <Label>Low Stock Threshold</Label>
              <Input
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })
                }
                required
                min="0"
              />
            </div>
            <div>
              <Label>Reorder Point</Label>
              <Input
                type="number"
                value={formData.reorderPoint}
                onChange={(e) =>
                  setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })
                }
                required
                min="0"
              />
            </div>
            <div>
              <Label>Warehouse</Label>
              <Select
                value={formData.warehouse}
                onValueChange={(value) => setFormData({ ...formData, warehouse: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse} value={warehouse}>
                      {warehouse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Update Stock</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingStock(null);
                  setFormData({
                    productId: "",
                    stockQuantity: 0,
                    reserved: 0,
                    lowStockThreshold: 10,
                    reorderPoint: 20,
                    warehouse: "",
                  });
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteModalOpen(false);
            setDeletingStockId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this stock entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteStock}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingStockId(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <CardDescription>Track and manage product stock levels</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
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
                        <TableRow key={item._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                              {item.productName}
                            </div>
                          </TableCell>
                          <TableCell>{item.category.name}</TableCell>
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
                                onClick={() => handleAdjustStock(item._id, 10)}
                              >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleAdjustStock(item._id, -10)}
                              >
                                <Minus className="h-3.5 w-3.5 mr-1" />
                                Remove
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingStock(item);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setDeletingStockId(item._id);
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center h-24">
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
    </div>
  );
};

export default Stock;