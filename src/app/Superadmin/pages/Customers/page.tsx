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
import { Badge } from "@/app/Superadmin/components/ui/badge";
import {
  Search,
  Filter,
  Plus,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Tag,
  Clock,
  MoreHorizontal,
  Star,
  Users,
  UserCheck,
  UserX,
  CircleDollarSign,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/Superadmin/components/ui/dropdown-menu";

// Mock data for customers
const customerData = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 98765 43210",
    location: "Mumbai, Maharashtra",
    totalSpent: 24500,
    lastVisit: "2 days ago",
    visits: 12,
    joinDate: "Jan 15, 2023",
    status: "active",
    tags: ["VIP", "Regular"],
    preferredSalon: "Elegance Salon - Bandra",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "+91 87654 32109",
    location: "Delhi, NCR",
    totalSpent: 18700,
    lastVisit: "1 week ago",
    visits: 8,
    joinDate: "Mar 22, 2023",
    status: "active",
    tags: ["New Client"],
    preferredSalon: "Style Studio - Connaught Place",
  },
  {
    id: 3,
    name: "Aisha Patel",
    email: "aisha@example.com",
    phone: "+91 76543 21098",
    location: "Bangalore, Karnataka",
    totalSpent: 32800,
    lastVisit: "Yesterday",
    visits: 15,
    joinDate: "Nov 10, 2022",
    status: "active",
    tags: ["VIP", "Premium"],
    preferredSalon: "Glamour Hub - Indiranagar",
  },
  {
    id: 4,
    name: "Vikram Singh",
    email: "vikram@example.com",
    phone: "+91 65432 10987",
    location: "Jaipur, Rajasthan",
    totalSpent: 8900,
    lastVisit: "3 weeks ago",
    visits: 4,
    joinDate: "May 5, 2023",
    status: "inactive",
    tags: ["Occasional"],
    preferredSalon: "Royal Cuts - Pink City",
  },
  {
    id: 5,
    name: "Meena Desai",
    email: "meena@example.com",
    phone: "+91 54321 09876",
    location: "Pune, Maharashtra",
    totalSpent: 15200,
    lastVisit: "1 month ago",
    visits: 6,
    joinDate: "Feb 18, 2023",
    status: "active",
    tags: ["Regular"],
    preferredSalon: "Elegance Salon - Koregaon Park",
  },
  {
    id: 6,
    name: "Arjun Nair",
    email: "arjun@example.com",
    phone: "+91 43210 98765",
    location: "Chennai, Tamil Nadu",
    totalSpent: 27500,
    lastVisit: "4 days ago",
    visits: 10,
    joinDate: "Dec 5, 2022",
    status: "active",
    tags: ["Premium"],
    preferredSalon: "Style Lounge - Anna Nagar",
  },
  {
    id: 7,
    name: "Anjali Verma",
    email: "anjali@example.com",
    phone: "+91 32109 87654",
    location: "Hyderabad, Telangana",
    totalSpent: 0,
    lastVisit: "Never visited",
    visits: 0,
    joinDate: "Jul 12, 2023",
    status: "new",
    tags: ["New Client"],
    preferredSalon: "Not selected",
  },
  {
    id: 8,
    name: "Sandeep Reddy",
    email: "sandeep@example.com",
    phone: "+91 21098 76543",
    location: "Kolkata, West Bengal",
    totalSpent: 12800,
    lastVisit: "2 months ago",
    visits: 5,
    joinDate: "Apr 30, 2023",
    status: "inactive",
    tags: ["Occasional"],
    preferredSalon: "Elegance Salon - Park Street",
  },
];

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredCustomers = customerData
    .filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((customer) => {
      if (activeTab === "all") return true;
      if (activeTab === "active") return customer.status === "active";
      if (activeTab === "new") return customer.status === "new";
      if (activeTab === "inactive") return customer.status === "inactive";
      if (activeTab === "vip") return customer.tags.includes("VIP");
      return true;
    });

  // Calculate customer metrics
  const totalCustomers = customerData.length;
  const activeCustomers = customerData.filter(
    (customer) => customer.status === "active"
  ).length;
  const newCustomers = customerData.filter(
    (customer) => customer.status === "new"
  ).length;
  const vipCustomers = customerData.filter((customer) =>
    customer.tags.includes("VIP")
  ).length;

  // Calculate total revenue
  const totalRevenue = customerData.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );
  const formattedTotalRevenue = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalRevenue);

  // Customer status badge
  const getStatusBadge = (status) => {
    if (status === "active") {
      return <Badge className="bg-green-500">Active</Badge>;
    } else if (status === "inactive") {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Inactive
        </Badge>
      );
    } else if (status === "new") {
      return <Badge className="bg-blue-500">New</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage and view all customers</p>
        </div>
        <Button className="sm:self-start">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
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
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{activeCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  Regular visitors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{vipCustomers}</div>
                <p className="text-xs text-muted-foreground">Premium clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {formattedTotalRevenue}
                </div>
                <p className="text-xs text-muted-foreground">Lifetime value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Customers</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="vip">VIP</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
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
                <div>
                  <CardTitle>Customer Management</CardTitle>
                  <CardDescription>
                    View and manage all customers on the platform
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Visits</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {customer.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Since {customer.joinDate}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                {customer.email}
                              </div>
                              <div className="flex items-center text-sm">
                                <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                {customer.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              {customer.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            }).format(customer.totalSpent)}
                          </TableCell>
                          <TableCell>{customer.visits}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              {customer.lastVisit}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(customer.status)}
                              {customer.tags.map((tag) => (
                                <div
                                  key={tag}
                                  className="flex items-center text-xs bg-muted px-1.5 py-0.5 rounded-full"
                                >
                                  <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {tag}
                                </div>
                              ))}
                            </div>
                          </TableCell>
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
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  View Appointments
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <CircleDollarSign className="h-4 w-4 mr-2" />
                                  View Transactions
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
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
                        <TableCell colSpan={8} className="text-center h-24">
                          No customers found.
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

export default Customers;
