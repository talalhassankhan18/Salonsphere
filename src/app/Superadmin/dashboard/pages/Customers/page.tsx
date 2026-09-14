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
import { Input } from "@/app/Superadmin/dashboard/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Superadmin/dashboard/components/ui/table";
import { Badge } from "@/app/Superadmin/dashboard/components/ui/badge";
import {
  Search,
  User,
  Mail,
  Calendar,
  MoreHorizontal,
  CircleDollarSign,
  Trash2,
  Users,
  UserCheck,
  Clock,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/Superadmin/dashboard/components/ui/dropdown-menu";
import LoadingSpinner from "@/common/LoadingSpinner";

interface Customer {
  _id: string;
  name?: string;
  email: string;
  createdAt: string;
  isVerified?: boolean;
  authMethod?: "email" | "google";
}

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers");
        if (!response.ok) throw new Error("Failed to fetch customers");
        const data = await response.json();
        console.log("Fetched customers in UI:", data); // Debug log
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        const response = await fetch(`/api/customers/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete customer");
        setCustomers(customers.filter((customer) => customer._id !== id));
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert("Failed to delete customer");
      }
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    [customer.name || "", customer.email]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Calculate metrics for cards
  const totalCustomers = customers.length;
  const emailVerifiedCustomers = customers.filter(
    (customer) => customer.isVerified && customer.authMethod === "email"
  ).length;
  const newCustomers = customers.filter((customer) => {
    const createdDate = new Date(customer.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length;
  const googleAuthCustomers = customers.filter(
    (customer) => customer.authMethod === "google"
  ).length;

  // Get verification badge
  const getVerificationBadge = (customer: Customer) => {
    if (
      customer.isVerified === undefined ||
      customer.authMethod === undefined
    ) {
      return (
        <Badge className="bg-gray-500" title="Verification status unavailable">
          Unknown
        </Badge>
      );
    }
    if (!customer.isVerified) {
      return (
        <Badge
          className="bg-red-500"
          title="Customer has not verified their account"
        >
          Not Verified
        </Badge>
      );
    }
    if (customer.authMethod === "email") {
      return (
        <Badge
          className="bg-green-500 text-[10px] px-1.5 py-0.5 leading-none h-auto"
          title="Customer verified via email"
        >
          Email Verified
        </Badge>
      );
    }
    if (customer.authMethod === "google") {
      return (
        <Badge
          className="bg-blue-500 text-[10px] px-1.5 py-0.5 leading-none h-auto"
          title="Customer verified via Google"
        >
          Google Verified
        </Badge>
      );
    }
    return (
      <Badge
        className="bg-gray-500 text-[10px] px-1.5 py-0.5 leading-none h-auto"
        title="Verification method unknown"
      >
        Unknown
      </Badge>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage registered customers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  Registered clients
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Email Verified Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {emailVerifiedCustomers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Email verified users
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{newCustomers}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Google Auth Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Globe className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{googleAuthCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  Signed up via Google
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                View and manage all registered customers
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      <LoadingSpinner />
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {customer.name || "N/A"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          {customer.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getVerificationBadge(customer)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <User className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              View Appointments
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CircleDollarSign className="h-4 w-4 mr-2" />
                              View Transactions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(customer._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
