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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Superadmin/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Tag,
  Calendar,
  Percent,
} from "lucide-react";

// Mock data for coupons
const couponData = [
  {
    id: 1,
    code: "WELCOME20",
    discount: "20%",
    type: "Percentage",
    minPurchase: 50,
    limit: 1,
    used: 423,
    status: "Active",
    startDate: "2023-11-01",
    endDate: "2024-12-31",
  },
  {
    id: 2,
    code: "FREESHIP",
    discount: "Free Shipping",
    type: "Shipping",
    minPurchase: 75,
    limit: 0,
    used: 298,
    status: "Active",
    startDate: "2023-10-15",
    endDate: "2024-10-15",
  },
  {
    id: 3,
    code: "HOLIDAY15",
    discount: "15%",
    type: "Percentage",
    minPurchase: 100,
    limit: 2,
    used: 156,
    status: "Active",
    startDate: "2023-12-01",
    endDate: "2024-01-15",
  },
  {
    id: 4,
    code: "SUMMERSALE",
    discount: "$25",
    type: "Fixed Amount",
    minPurchase: 150,
    limit: 1,
    used: 87,
    status: "Active",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
  },
  {
    id: 5,
    code: "FLASH50",
    discount: "50%",
    type: "Percentage",
    minPurchase: 200,
    limit: 1,
    used: 312,
    status: "Expired",
    startDate: "2023-09-15",
    endDate: "2023-09-17",
  },
];

const Coupons = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCoupons = couponData.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // Would add a toast here in a real implementation
    console.log(`Copied ${code} to clipboard`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">Manage discount coupons</p>
        </div>
        <Button className="sm:self-start">
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Coupons</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupons..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all" className="m-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Coupons</CardTitle>
              <CardDescription>
                Manage discount codes and promotions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Min Purchase</TableHead>
                      <TableHead>Usage Limit</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoupons.length > 0 ? (
                      filteredCoupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 mr-2 text-primary" />
                              {coupon.code}
                            </div>
                          </TableCell>
                          <TableCell>{coupon.discount}</TableCell>
                          <TableCell>{coupon.type}</TableCell>
                          <TableCell>${coupon.minPurchase}</TableCell>
                          <TableCell>
                            {coupon.limit === 0 ? "Unlimited" : coupon.limit}
                          </TableCell>
                          <TableCell>{coupon.used}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              <span className="text-xs">
                                {new Date(
                                  coupon.startDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(coupon.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                coupon.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : coupon.status === "Expired"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {coupon.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(coupon.code)}
                              >
                                <Copy className="h-4 w-4" />
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
                        <TableCell colSpan={9} className="text-center h-24">
                          No coupons found.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Percent className="h-5 w-5 mr-2 text-green-600" />
              Active Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
            <p className="text-sm text-muted-foreground">
              Currently active discount codes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="h-5 w-5 mr-2 text-blue-600" />
              Total Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,276</div>
            <p className="text-sm text-muted-foreground">
              Total coupon redemptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-amber-600" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2</div>
            <p className="text-sm text-muted-foreground">
              Coupons expiring in 30 days
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Coupons;
