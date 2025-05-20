"use client";
import React, { useState, useEffect } from "react";
import { useIsMobile } from "../../hooks/use-mobile";
import SidebarNavigation from "../../components/layout/SidebarNavigation";
import DashboardHeader from "../../components/layout/DashboardHeader";
import MobileMenu from "../../components/layout/MobileMenu";
import { ShoppingBag, Search, ExternalLink, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  toggleSidebar: () => void;
  isMobile: boolean;
  userId: string;
}

interface Product {
  _id: string;
  name: string;
  category: { name: string };
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  stock: number;
  imageUrl: string;
  description?: string;
  attributes?: {
    attributeId: { name: string; values: string[] };
    value: string;
  }[];
}

interface SalonProduct extends Product {
  commissionRate: number;
  salonProductId: string;
  desiredStock: number;
  sold: number;
  uniqueProductCode: string;
}

interface Plan {
  name: string;
  productLimit: number;
  currentCount: number;
}

const Products: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [listedProducts, setListedProducts] = useState<SalonProduct[]>([]);
  const [search, setSearch] = useState("");
  const [salonId, setSalonId] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockInput, setStockInput] = useState<{ [key: string]: number }>({});
  const [previousStock, setPreviousStock] = useState<{ [key: string]: number }>(
    {}
  );
  const [newStockInputs, setNewStockInputs] = useState<{
    [key: string]: number;
  }>({});
  const [focusedInputs, setFocusedInputs] = useState<{
    [key: string]: boolean;
  }>({});
  const [changedInputs, setChangedInputs] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (status === "unauthenticated") {
      setError("User not authenticated");
      setLoading(false);
      router.push("/login");
      return;
    }

    const fetchSalonDetails = async () => {
      if (!session?.user?.email) {
        setError("User email not found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/salon/details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        const data = await response.json();
        if (data.success) {
          setSalonId(data.salonId);
        } else {
          setError(data.error || "Failed to fetch salon details");
        }
      } catch (err) {
        setError("Failed to fetch salon details");
      } finally {
        setLoading(false);
      }
    };

    fetchSalonDetails();
  }, [session, status, router]);

  const fetchProducts = async () => {
    if (!salonId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/salon/products?salonId=${salonId}&search=${encodeURIComponent(
          search
        )}`
      );
      const data = await response.json();
      if (data.success) {
        const newListedProducts: SalonProduct[] = data.data.listedProducts
          .map((p: any) => ({
            ...p,
            stock: p.stock ?? 0,
            desiredStock: p.desiredStock ?? 0,
            sold: p.sold ?? 0,
            uniqueProductCode: p.uniqueProductCode ?? "",
            category: p.category ?? { name: "" },
            commissionRate: p.commissionRate ?? 0.05,
            salonProductId: p.salonProductId ?? "",
          }))
          .filter((p: SalonProduct) => p.category.name === "For Salon Listing");

        setPreviousStock((prev) => {
          const updated: { [key: string]: number } = { ...prev };
          newListedProducts.forEach((product) => {
            updated[product.salonProductId] = product.stock;
          });
          return updated;
        });

        // Initialize newStockInputs for each listed product
        const initialNewStockInputs: { [key: string]: number } = {};
        newListedProducts.forEach((product) => {
          initialNewStockInputs[product.salonProductId] = product.stock;
        });
        setNewStockInputs(initialNewStockInputs);

        setAvailableProducts(
          data.data.availableProducts.filter(
            (p: Product) => p.category.name === "For Salon Listing"
          )
        );
        setListedProducts(newListedProducts);
        setPlan(data.data.plan);
      } else {
        setError(data.error || "Failed to fetch products");
      }
    } catch (err) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (salonId && status === "authenticated") {
      fetchProducts();
    }
  }, [salonId, search, status]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAddProduct = async (productId: string) => {
    if (!salonId) return;

    const product = availableProducts.find((p) => p._id === productId);
    if (!product || product.category.name !== "For Salon Listing") {
      setError("Product is not in 'For Salon Listing' category");
      return;
    }

    const desiredStock = stockInput[productId] || 0;
    if (desiredStock < 0) {
      setError("Desired stock must be a non-negative number");
      return;
    }

    try {
      const response = await fetch("/api/salon/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salonId, productId, desiredStock }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchProducts();
        setAvailableProducts((prev) => prev.filter((p) => p._id !== productId));
        setStockInput((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
      } else {
        setError(data.error || "Failed to add product");
      }
    } catch (err) {
      setError("Failed to add product");
    }
  };

  const handleRemoveProduct = async (salonProductId: string) => {
    try {
      const response = await fetch("/api/salon/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salonProductId }),
      });
      const data = await response.json();
      if (data.success) {
        const removedProduct = listedProducts.find(
          (p) => p.salonProductId === salonProductId
        );
        if (
          removedProduct &&
          removedProduct.category.name === "For Salon Listing"
        ) {
          setAvailableProducts((prev) => [...prev, removedProduct]);
        }
        setListedProducts((prev) =>
          prev.filter((p) => p.salonProductId !== salonProductId)
        );
        setPlan((prev) =>
          prev ? { ...prev, currentCount: prev.currentCount - 1 } : null
        );
        setNewStockInputs((prev) => {
          const newState = { ...prev };
          delete newState[salonProductId];
          return newState;
        });
        setFocusedInputs((prev) => {
          const newState = { ...prev };
          delete newState[salonProductId];
          return newState;
        });
        setChangedInputs((prev) => {
          const newState = { ...prev };
          delete newState[salonProductId];
          return newState;
        });
        await fetchProducts();
      } else {
        setError(data.error || "Failed to remove product");
      }
    } catch (err) {
      setError("Failed to remove product");
    }
  };

  const handleUpdateStock = async (
    salonProductId: string,
    newStock: number
  ) => {
    if (!salonId || newStock < 0) return;

    try {
      const response = await fetch("/api/salon/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salonId, salonProductId, stock: newStock }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchProducts(); // Refresh the product list to reflect the updated stock
        setChangedInputs((prev) => ({
          ...prev,
          [salonProductId]: false,
        }));
        setFocusedInputs((prev) => ({
          ...prev,
          [salonProductId]: false,
        }));
      } else {
        setError(data.error || "Failed to update stock");
      }
    } catch (err) {
      setError("Failed to update stock");
    }
  };

  const maxProducts = plan?.productLimit ?? 100;
  const currentCount = plan?.currentCount ?? listedProducts.length;
  const canAddMore = currentCount < maxProducts;

  if (status === "loading") {
    return (
      <div className="dashboard-layout">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="hidden md:block">
        <SidebarNavigation isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      <MobileMenu isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-16"
        }`}
      >
        <DashboardHeader
          title="Products"
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          userId={session?.user?.id ?? "unknown-user"}
        />
        <main className="dashboard-content animate-fade-in">
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-100 text-red-800 rounded-lg flex justify-between items-center">
                <span>{error}</span>
                <button onClick={() => setError(null)}>
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="glass p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">
                Available Products for Salon Listing
              </h2>
              <p className="text-gray-500 mb-4">
                You can list these products under your salon and earn 5%
                commission on each sale. Only products in the "For Salon
                Listing" category are available.{" "}
                {plan && (
                  <span>
                    Your {plan.name} plan allows you to list up to{" "}
                    {plan.productLimit === Infinity
                      ? "unlimited"
                      : plan.productLimit}{" "}
                    products. Currently listed: {currentCount}/
                    {plan.productLimit === Infinity ? "∞" : plan.productLimit}.
                  </span>
                )}
              </p>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="py-2 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
                </div>
              ) : availableProducts.length === 0 ? (
                <p className="text-gray-500">
                  No products found in "For Salon Listing" category
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableProducts.map((product) => (
                    <div
                      key={product._id}
                      className="border border-gray-100 rounded-xl overflow-hidden hover-lift bg-white"
                    >
                      <div className="h-48 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="mt-2 text-lg font-semibold">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {product.description || "No description available"}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          {product.discountPercent > 0 ? (
                            <div className="flex items-center">
                              <span className="text-gray-500 line-through mr-2">
                                ₨{product.originalPrice.toFixed(2)}
                              </span>
                              <span className="font-bold">
                                ₨{product.price.toFixed(2)}
                              </span>
                              <span className="ml-2 text-green-600">
                                {product.discountPercent}% off
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold">
                              ₨{product.price.toFixed(2)}
                            </span>
                          )}
                          <p className="text-sm text-gray-500">
                            {product.stock > 0
                              ? `${product.stock} in stock`
                              : "Out of Stock"}
                          </p>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Desired Stock
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={stockInput[product._id] ?? ""}
                            onChange={(e) =>
                              setStockInput({
                                ...stockInput,
                                [product._id]: parseInt(e.target.value) || 0,
                              })
                            }
                            className="mt-1 p-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter desired stock"
                          />
                        </div>
                        <button
                          className={`mt-4 w-full py-2 rounded-lg transition-colors flex items-center justify-center ${
                            canAddMore
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
                          }`}
                          onClick={() => handleAddProduct(product._id)}
                          disabled={!canAddMore}
                        >
                          <ShoppingBag size={16} className="mr-2" />
                          Add to My Listings
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 text-center">
                <button className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center">
                  View all products
                  <ExternalLink size={14} className="ml-1" />
                </button>
              </div>
            </div>
            <div className="glass p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">
                My Product Listings
              </h2>
              {listedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">
                    You haven't added any products to your listings yet
                  </p>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setSearch("")}
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Product Code
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Commission
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Stock
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          New Stock
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Stock Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Sold
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {listedProducts.map((product) => {
                        const wasOutOfStock =
                          previousStock[product.salonProductId] === 0;
                        const stockStatus =
                          product.stock === 0
                            ? "Out of Stock"
                            : wasOutOfStock && product.stock > 0
                            ? "Restocked"
                            : "In Stock";

                        const handleRestock = () => {
                          handleUpdateStock(
                            product.salonProductId,
                            newStockInputs[product.salonProductId] || 0
                          );
                        };

                        const handleStockChange = (value: number) => {
                          setNewStockInputs({
                            ...newStockInputs,
                            [product.salonProductId]: value,
                          });
                          setChangedInputs({
                            ...changedInputs,
                            [product.salonProductId]: value !== product.stock,
                          });
                        };

                        const handleFocus = () => {
                          setFocusedInputs({
                            ...focusedInputs,
                            [product.salonProductId]: true,
                          });
                        };

                        const handleBlur = () => {
                          setFocusedInputs({
                            ...focusedInputs,
                            [product.salonProductId]: false,
                          });
                        };

                        const isButtonVisible =
                          focusedInputs[product.salonProductId] ||
                          changedInputs[product.salonProductId];

                        return (
                          <tr
                            key={product.salonProductId}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-md overflow-hidden">
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="font-medium">
                                  {product.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {product.uniqueProductCode}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {product.discountPercent > 0 ? (
                                <div className="flex items-center">
                                  <span className="text-gray-500 line-through mr-2">
                                    ₨{product.originalPrice.toFixed(2)}
                                  </span>
                                  <span>₨{product.price.toFixed(2)}</span>
                                  <span className="ml-2 text-green-600">
                                    {product.discountPercent}% off
                                  </span>
                                </div>
                              ) : (
                                <span>₨{product.price.toFixed(2)}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              ₨
                              {(product.price * product.commissionRate).toFixed(
                                2
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {product.stock}
                            </td>
                            <td className="px-4 py-3 flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                value={
                                  newStockInputs[product.salonProductId] ??
                                  product.stock
                                }
                                onChange={(e) =>
                                  handleStockChange(
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                className="p-1 w-16 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="New stock"
                              />
                              <button
                                className={cn(
                                  "px-2 py-0.5 bg-blue-600 text-white rounded-md text-xs transition-opacity duration-200",
                                  isButtonVisible ? "opacity-100" : "opacity-0"
                                )}
                                onClick={handleRestock}
                              >
                                Update
                              </button>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={cn(
                                  "px-2 py-1 text-xs rounded-full",
                                  stockStatus === "Out of Stock"
                                    ? "bg-red-100 text-red-800"
                                    : stockStatus === "Restocked"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-green-100 text-green-800"
                                )}
                              >
                                {stockStatus}
                                {stockStatus === "Out of Stock" && (
                                  <span className="ml-1 text-xs">
                                    (Sorry, this product is currently
                                    unavailable)
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {product.sold}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                className="text-red-600 hover:text-red-800 transition-colors"
                                onClick={() =>
                                  handleRemoveProduct(product.salonProductId)
                                }
                              >
                                Remove from Listings
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Products;
