"use client";

import { useState, useEffect } from "react";
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
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  BarChart,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { toast } from "@/app/Superadmin/dashboard/components/ui/use-toast";
import Image from "next/image";
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
  DialogFooter,
} from "@/app/Superadmin/dashboard/components/ui/dialog";
import { Label } from "@/app/Superadmin/dashboard/components/ui/label";
import ReactSelect, { MultiValue } from "react-select";

interface Category {
  _id: string;
  name: string;
}

interface Attribute {
  _id: string;
  name: string;
  values: string[];
}

interface ProductAttribute {
  attributeId: string;
  value: string;
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
  description: string;
  howToUse: string;
  maxAllowedInCart: number;
  attributes: ProductAttribute[];
}

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onView,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onView: (product: Product) => void;
}) => {
  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;

  return (
    <Card className="h-full w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{product.name}</CardTitle>
        <CardDescription>{product.category.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <div className="relative w-full h-32">
            <Image
              src={product.imageUrls[0] || "/placeholder.svg"}
              alt={`${product.name}-0`}
              fill
              sizes="100vw"
              className="object-cover rounded-md"
              unoptimized
              onError={(e) => {
                console.error(`Failed to load image: ${product.imageUrls[0]}`);
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>
        ) : (
          <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {product.discount ? (
              <>
                <span className="text-sm font-medium text-gray-500 line-through">
                  PKR {product.price.toFixed(2)}
                </span>
                <span className="text-sm font-medium">
                  PKR {discountedPrice.toFixed(2)}
                </span>
                <span className="text-xs text-green-600">
                  {product.discount}% off
                </span>
              </>
            ) : (
              <span className="text-sm font-medium">
                PKR {product.price.toFixed(2)}
              </span>
            )}
          </div>
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
          <div className="flex justify-between">
            <span>Max per Cart</span>
            <span>{product.maxAllowedInCart}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button variant="outline" size="sm" className="flex-1 min-w-[80px]" onClick={() => onView(product)}>
            <Eye className="w-3.5 h-3.5 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[80px]"
            onClick={() => onEdit(product)}
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[80px]"
            onClick={() => onDelete(product._id)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: 0,
    discount: undefined as number | undefined,
    stock: 0,
    images: [] as File[],
    description: "",
    howToUse: "",
    maxAllowedInCart: 10,
    attributes: [] as ProductAttribute[],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<
    { value: string; label: string }[]
  >([]);
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    priceMin: "",
    priceMax: "",
  });

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/Category", { cache: "no-store" });
      const result = await response.json();
      if (Array.isArray(result)) {
        const requiredCategories = [
          "New Arrivals",
          "Best Sellers",
          "Budget Friendly",
        ];
        const existingNames = result.map((cat: Category) => cat.name);
        const categoriesToAdd = requiredCategories.filter(
          (name) => !existingNames.includes(name)
        );

        if (categoriesToAdd.length > 0) {
          for (const name of categoriesToAdd) {
            await fetch("/api/Category", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name }),
            });
          }
          const updatedResponse = await fetch("/api/Category", { cache: "no-store" });
          const updatedResult = await updatedResponse.json();
          setCategories(updatedResult);
        } else {
          setCategories(result);
        }
      } else {
        throw new Error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const fetchAttributes = async () => {
    try {
      const response = await fetch("/api/Attribute", { cache: "no-store" });
      const result = await response.json();
      if (result.success) {
        setAttributes(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch attributes",
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?search=${searchTerm}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const result = await response.json();
      if (result.success) {
        console.log("Fetched products with images:", result.data);
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

  useEffect(() => {
    fetchCategories();
    fetchAttributes();
    fetchProducts();
  }, [searchTerm]);

  useEffect(() => {
    if (editingProduct) {
      setSelectedAttributes(
        editingProduct.attributes.map((attr) => ({
          value: attr.attributeId,
          label: attributes.find((a) => a._id === attr.attributeId)?.name || "",
        }))
      );
      setFormData({
        name: editingProduct.name,
        category: editingProduct.category._id,
        price: editingProduct.price,
        discount: editingProduct.discount,
        stock: editingProduct.stock,
        images: [],
        description: editingProduct.description,
        howToUse: editingProduct.howToUse,
        maxAllowedInCart: editingProduct.maxAllowedInCart,
        attributes: editingProduct.attributes,
      });
      setImagePreviews(editingProduct.imageUrls || []);
    } else {
      setSelectedAttributes([]);
      setImagePreviews([]);
    }
  }, [editingProduct, attributes]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 4) {
      toast({
        title: "Error",
        description: "Maximum 4 images allowed",
        variant: "destructive",
      });
      return;
    }

    const newImages = [...formData.images, ...files];
    setFormData({ ...formData, images: newImages });

    const previews = newImages.map((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
      });
    });

    Promise.all(previews).then((urls) => setImagePreviews(urls));
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const handleAttributeChange = (attributeId: string, value: string) => {
    setFormData((prev) => {
      const existing = prev.attributes.find((attr) => attr.attributeId === attributeId);
      if (existing) {
        return {
          ...prev,
          attributes: prev.attributes.map((attr) =>
            attr.attributeId === attributeId ? { ...attr, value } : attr
          ),
        };
      }
      return {
        ...prev,
        attributes: [...prev.attributes, { attributeId, value }],
      };
    });
  };

  const handleRemoveAttribute = (attributeId: string) => {
    setSelectedAttributes((prev) => prev.filter((attr) => attr.value !== attributeId));
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((attr) => attr.attributeId !== attributeId),
    }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price.toString());
      if (formData.discount !== undefined) {
        formDataToSend.append("discount", formData.discount.toString());
      }
      formDataToSend.append("stock", formData.stock.toString());
      formDataToSend.append("description", formData.description);
      formDataToSend.append("howToUse", formData.howToUse);
      formDataToSend.append("maxAllowedInCart", formData.maxAllowedInCart.toString());
      formDataToSend.append("attributes", JSON.stringify(formData.attributes));
      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const response = await fetch("/api/products", {
        method: "POST",
        body: formDataToSend,
      });
      const result = await response.json();
      if (result.success) {
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          category: "",
          price: 0,
          discount: undefined,
          stock: 0,
          images: [],
          description: "",
          howToUse: "",
          maxAllowedInCart: 10,
          attributes: [],
        });
        setImagePreviews([]);
        setSelectedAttributes([]);
        await fetchProducts();
        toast({
          title: "Success",
          description: "Product added successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price.toString());
      if (formData.discount !== undefined) {
        formDataToSend.append("discount", formData.discount.toString());
      }
      formDataToSend.append("stock", formData.stock.toString());
      formDataToSend.append("description", formData.description);
      formDataToSend.append("howToUse", formData.howToUse);
      formDataToSend.append("maxAllowedInCart", formData.maxAllowedInCart.toString());
      formDataToSend.append("attributes", JSON.stringify(formData.attributes));
      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const response = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PUT",
        body: formDataToSend,
      });
      const result = await response.json();
      if (result.success) {
        setEditingProduct(null);
        setFormData({
          name: "",
          category: "",
          price: 0,
          discount: undefined,
          stock: 0,
          images: [],
          description: "",
          howToUse: "",
          maxAllowedInCart: 10,
          attributes: [],
        });
        setImagePreviews([]);
        setSelectedAttributes([]);
        await fetchProducts();
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        await fetchProducts();
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter((product) => {
    let matches = true;

    // Search Term Filter
    if (searchTerm) {
      matches = matches && (
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category Filter
    if (filters.category !== "all") {
      matches = matches && product.category._id === filters.category;
    }

    // Status Filter
    if (filters.status !== "all") {
      matches = matches && product.status === filters.status;
    }

    // Price Range Filter
    const price = product.discount ? product.price * (1 - product.discount / 100) : product.price;
    if (filters.priceMin) {
      matches = matches && price >= parseFloat(filters.priceMin);
    }
    if (filters.priceMax) {
      matches = matches && price <= parseFloat(filters.priceMax);
    }

    return matches;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalogue</p>
        </div>
        <Button className="sm:self-start" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog
        open={isAddModalOpen || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingProduct(null);
            setFormData({
              name: "",
              category: "",
              price: 0,
              discount: undefined,
              stock: 0,
              images: [],
              description: "",
              howToUse: "",
              maxAllowedInCart: 10,
              attributes: [],
            });
            setImagePreviews([]);
            setSelectedAttributes([]);
          }
        }}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Section 1: Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Pricing & Stock */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Stock</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Price (PKR)</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>Discount (%)</Label>
                    <Input
                      type="number"
                      value={formData.discount ?? ""}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : undefined;
                        setFormData({ ...formData, discount: value });
                      }}
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="Enter discount percentage (optional)"
                    />
                    {formData.discount !== undefined && formData.discount > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Discounted Price: PKR {(formData.price * (1 - formData.discount / 100)).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                      required
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.stock === 0
                        ? "Status: Out of Stock"
                        : formData.stock < 10
                        ? "Status: Low Stock"
                        : "Status: Active"}
                    </p>
                  </div>
                  <div>
                    <Label>Max Allowed in Cart</Label>
                    <Input
                      type="number"
                      value={formData.maxAllowedInCart}
                      onChange={(e) => setFormData({ ...formData, maxAllowedInCart: parseInt(e.target.value) })}
                      min="1"
                      placeholder="Enter max allowed in cart (default 10)"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Section 3: Attributes, Images, Additional Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Attributes & More</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Attributes</Label>
                    <ReactSelect
                      isMulti
                      options={attributes
                        .filter(
                          (attr) => !selectedAttributes.some((sel) => sel.value === attr._id)
                        )
                        .map((attr) => ({
                          value: attr._id,
                          label: attr.name,
                        }))}
                      value={selectedAttributes}
                      onChange={(selected: MultiValue<{ value: string; label: string }>) => {
                        const newSelected = selected ? Array.from(selected) : [];
                        setSelectedAttributes(newSelected);
                        setFormData((prev) => ({
                          ...prev,
                          attributes: newSelected.map((sel) => ({
                            attributeId: sel.value,
                            value:
                              prev.attributes.find((attr) => attr.attributeId === sel.value)?.value ||
                              attributes.find((attr) => attr._id === sel.value)?.values[0] ||
                              "",
                          })),
                        }));
                      }}
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                    {selectedAttributes.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {selectedAttributes.map((attr) => {
                          const attribute = attributes.find((a) => a._id === attr.value);
                          if (!attribute) return null;
                          return (
                            <div
                              key={attr.value}
                              className="flex items-center gap-2 bg-gray-100 p-2 rounded-md"
                            >
                              <span className="flex-1">{attribute.name}</span>
                              <Select
                                value={
                                  formData.attributes.find((a) => a.attributeId === attr.value)?.value ||
                                  ""
                                }
                                onValueChange={(value) => handleAttributeChange(attr.value, value)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Select value" />
                                </SelectTrigger>
                                <SelectContent>
                                  {attribute.values.map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveAttribute(attr.value)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Product Images (Max 4)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                    {(imagePreviews.length > 0 || (editingProduct?.imageUrls && editingProduct.imageUrls.length > 0)) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {editingProduct?.imageUrls && !imagePreviews.length
                          ? editingProduct.imageUrls.map((url, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={url || "/placeholder.svg"}
                                  alt={`Preview-${index}`}
                                  className="object-cover rounded-md w-24 h-24"
                                  onError={(e) => {
                                    console.error("Failed to load preview image:", url);
                                    e.currentTarget.src = "/placeholder.svg";
                                  }}
                                />
                              </div>
                            ))
                          : imagePreviews.map((preview, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={preview}
                                  alt={`Preview-${index}`}
                                  className="object-cover rounded-md w-24 h-24"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-0 right-0"
                                  onClick={() => handleRemoveImage(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter product description"
                    />
                  </div>
                  <div>
                    <Label>How to Use</Label>
                    <Input
                      value={formData.howToUse}
                      onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })}
                      placeholder="Enter how to use instructions"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button type="submit">{editingProduct ? "Update" : "Add"} Product</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                  setFormData({
                    name: "",
                    category: "",
                    price: 0,
                    discount: undefined,
                    stock: 0,
                    images: [],
                    description: "",
                    howToUse: "",
                    maxAllowedInCart: 10,
                    attributes: [],
                  });
                  setImagePreviews([]);
                  setSelectedAttributes([]);
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Product Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name} Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProduct?.imageUrls && selectedProduct.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {selectedProduct.imageUrls.map((url, index) => (
                  <div key={index} className="relative w-full h-32">
                    <Image
                      src={url || "/placeholder.svg"}
                      alt={`${selectedProduct.name}-${index}`}
                      fill
                      sizes="100vw"
                      className="object-cover rounded-md"
                      unoptimized
                      onError={(e) => {
                        console.error(`Failed to load image ${index}: ${url}`);
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            <div>
              <Label>Description</Label>
              <p className="text-sm">{selectedProduct?.description || "No description available"}</p>
            </div>
            <div>
              <Label>How to Use</Label>
              <p className="text-sm">{selectedProduct?.howToUse || "No instructions available"}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="all">
        {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
          </TabsList>
        </div> */}

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
              <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters({ ...filters, category: value })}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    type="number"
                    placeholder="Min Price"
                    className="w-full sm:w-24"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Max Price"
                    className="w-full sm:w-24"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setFilters({ category: "all", status: "all", priceMin: "", priceMax: "" })}
                >
                  Clear Filters
                </Button>
              </div>
              {viewMode === "grid" ? (
                filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onEdit={(product) => {
                          setEditingProduct(product);
                          setFormData({
                            name: product.name,
                            category: product.category._id,
                            price: product.price,
                            discount: product.discount,
                            stock: product.stock,
                            images: [],
                            description: product.description,
                            howToUse: product.howToUse,
                            maxAllowedInCart: product.maxAllowedInCart,
                            attributes: product.attributes,
                          });
                          setImagePreviews(product.imageUrls || []);
                        }}
                        onDelete={handleDeleteProduct}
                        onView={(product) => {
                          setSelectedProduct(product);
                          setIsViewModalOpen(true);
                        }}
                      />
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
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Max in Cart</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => {
                          const discountedPrice = product.discount
                            ? product.price * (1 - product.discount / 100)
                            : product.price;
                          return (
                            <TableRow key={product._id}>
                              <TableCell>
                                {product.imageUrls && product.imageUrls.length > 0 ? (
                                  <Image
                                    src={product.imageUrls[0] || "/placeholder.svg"}
                                    alt={product.name}
                                    width={50}
                                    height={50}
                                    className="object-cover rounded-md"
                                    unoptimized
                                    onError={(e) => {
                                      console.error("Failed to load table image:", product.imageUrls[0]);
                                      e.currentTarget.src = "/placeholder.svg";
                                    }}
                                  />
                                ) : (
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>{product.category.name}</TableCell>
                              <TableCell>
                                {product.discount ? (
                                  <>
                                    <span className="text-gray-500 line-through">
                                      PKR {product.price.toFixed(2)}
                                    </span>
                                    <br />
                                    <span>PKR {discountedPrice.toFixed(2)}</span>
                                  </>
                                ) : (
                                  `PKR ${product.price.toFixed(2)}`
                                )}
                              </TableCell>
                              <TableCell>
                                {product.discount ? `${product.discount}%` : '-'}
                              </TableCell>
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
                              <TableCell>PKR {product.revenue.toFixed(2)}</TableCell>
                              <TableCell>{product.maxAllowedInCart}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => {
                                    setSelectedProduct(product);
                                    setIsViewModalOpen(true);
                                  }}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setFormData({
                                        name: product.name,
                                        category: product.category._id,
                                        price: product.price,
                                        discount: product.discount,
                                        stock: product.stock,
                                        images: [],
                                        description: product.description,
                                        howToUse: product.howToUse,
                                        maxAllowedInCart: product.maxAllowedInCart,
                                        attributes: product.attributes,
                                      });
                                      setImagePreviews(product.imageUrls || []);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteProduct(product._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center h-24">
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