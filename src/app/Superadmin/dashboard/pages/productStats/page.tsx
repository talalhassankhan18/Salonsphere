"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Package, Search, BarChart, Image as ImageIcon } from "lucide-react";
import { toast } from "@/app/Superadmin/dashboard/components/ui/use-toast";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Superadmin/dashboard/components/ui/select";

interface Salon {
  salonId: string;
  salonName: string;
  stock: number;
  desiredStock: number;
  sold: number;
  uniqueProductCode: string;
  commissionRate: number;
}

interface ProductStat {
  productId: string;
  productName: string;
  totalStock: number;
  totalSold: number;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  imageUrl: string;
  salons: Salon[];
}

const ProductStatCard = ({ stat }: { stat: ProductStat }) => {
  const discountedPrice = stat.discountPercent
    ? stat.originalPrice * (1 - stat.discountPercent / 100)
    : stat.originalPrice;

  return (
    <Card className="h-full w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{stat.productName}</CardTitle>
        <CardDescription>Total Stock: {stat.totalStock} units</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {stat.imageUrl ? (
          <div className="relative w-full h-32">
            <Image
              src={stat.imageUrl || "/placeholder-image.png"}
              alt={`${stat.productName}`}
              fill
              sizes="100vw"
              className="object-cover rounded-md"
              unoptimized
              onError={(e) => {
                console.error(`Failed to load image: ${stat.imageUrl}`);
                e.currentTarget.src = "/placeholder-image.png";
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
            {stat.discountPercent ? (
              <>
                <span className="text-sm font-medium text-gray-500 line-through">
                  PKR {stat.originalPrice.toFixed(2)}
                </span>
                <span className="text-sm font-medium">
                  PKR {discountedPrice.toFixed(2)}
                </span>
                <span className="text-xs text-green-600">
                  {stat.discountPercent}% off
                </span>
              </>
            ) : (
              <span className="text-sm font-medium">
                PKR {stat.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          <div className="flex justify-between mb-1">
            <span>Total Sold</span>
            <span>{stat.totalSold} units</span>
          </div>
          <div className="flex justify-between">
            <span>Salons Listing</span>
            <span>{stat.salons.length}</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium">Listed by Salons:</p>
          <ul className="text-xs text-muted-foreground list-disc list-inside">
            {stat.salons.map((salon) => (
              <li key={salon.salonId}>
                {salon.salonName} (Stock: {salon.stock}, Sold: {salon.sold})
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductStats = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<ProductStat[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filters, setFilters] = useState({
    salonId: "all",
    stockMin: "",
    soldMin: "",
  });
  const [salons, setSalons] = useState<{ _id: string; name: string }[]>([]);

  const fetchSalons = async () => {
    try {
      const response = await fetch("/api/salon/list", { cache: "no-store" });
      const result = await response.json();
      if (result.success) {
        setSalons(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching salons:", error);
      toast({
        title: "Error",
        description: "Failed to fetch salons",
        variant: "destructive",
      });
    }
  };

  const fetchStats = async () => {
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.set("search", searchTerm);
      if (filters.salonId !== "all") query.set("salonId", filters.salonId);
      const response = await fetch(
        `/api/superadmin/product-stats?${query.toString()}`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setStats(result.data.aggregatedStats);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching product stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch product stats",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    fetchSalons();
    fetchStats();
  }, [status, session, router, searchTerm, filters]);

  const filteredStats = stats.filter((stat) => {
    let matches = true;

    // Stock Filter
    if (filters.stockMin) {
      matches = matches && stat.totalStock >= parseInt(filters.stockMin);
    }

    // Sold Filter
    if (filters.soldMin) {
      matches = matches && stat.totalSold >= parseInt(filters.soldMin);
    }

    return matches;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Product Statistics
          </h1>
          <p className="text-muted-foreground">
            View statistics for products listed by salons
          </p>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsContent value="all" className="m-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Product Statistics</CardTitle>
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
                  value={filters.salonId}
                  onValueChange={(value) =>
                    setFilters({ ...filters, salonId: value })
                  }
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by Salon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Salons</SelectItem>
                    {salons.map((salon) => (
                      <SelectItem key={salon._id} value={salon._id}>
                        {salon.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    type="number"
                    placeholder="Min Stock"
                    className="w-full sm:w-24"
                    value={filters.stockMin}
                    onChange={(e) =>
                      setFilters({ ...filters, stockMin: e.target.value })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Min Sold"
                    className="w-full sm:w-24"
                    value={filters.soldMin}
                    onChange={(e) =>
                      setFilters({ ...filters, soldMin: e.target.value })
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({ salonId: "all", stockMin: "", soldMin: "" })
                  }
                >
                  Clear Filters
                </Button>
              </div>
              {viewMode === "grid" ? (
                filteredStats.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredStats.map((stat) => (
                      <ProductStatCard key={stat.productId} stat={stat} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">
                      No product statistics found.
                    </p>
                  </div>
                )
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Total Stock</TableHead>
                        <TableHead>Total Sold</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Salons</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStats.length > 0 ? (
                        filteredStats.map((stat) => {
                          const discountedPrice = stat.discountPercent
                            ? stat.originalPrice *
                              (1 - stat.discountPercent / 100)
                            : stat.originalPrice;
                          return (
                            <TableRow key={stat.productId}>
                              <TableCell>
                                {stat.imageUrl ? (
                                  <Image
                                    src={
                                      stat.imageUrl || "/placeholder-image.png"
                                    }
                                    alt={stat.productName}
                                    width={50}
                                    height={50}
                                    className="object-cover rounded-md"
                                    unoptimized
                                    onError={(e) => {
                                      console.error(
                                        "Failed to load table image:",
                                        stat.imageUrl
                                      );
                                      e.currentTarget.src =
                                        "/placeholder-image.png";
                                    }}
                                  />
                                ) : (
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                {stat.productName}
                              </TableCell>
                              <TableCell>{stat.totalStock}</TableCell>
                              <TableCell>{stat.totalSold}</TableCell>
                              <TableCell>
                                {stat.discountPercent ? (
                                  <>
                                    <span className="text-gray-500 line-through">
                                      PKR {stat.originalPrice.toFixed(2)}
                                    </span>
                                    <br />
                                    <span>
                                      PKR {discountedPrice.toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  `PKR ${stat.originalPrice.toFixed(2)}`
                                )}
                              </TableCell>
                              <TableCell>
                                {stat.discountPercent
                                  ? `${stat.discountPercent}%`
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside text-sm">
                                  {stat.salons.map((salon) => (
                                    <li key={salon.salonId}>
                                      {salon.salonName} (Stock: {salon.stock},
                                      Sold: {salon.sold})
                                    </li>
                                  ))}
                                </ul>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            No product statistics found.
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

export default ProductStats;
