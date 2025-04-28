"use client";

import { Button } from "@/app/Superadmin/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/components/ui/card";
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
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const salons = [
  {
    id: 1,
    name: "Elegant Styles",
    owner: "Sarah Johnson",
    location: "New York, NY",
    plan: "Premium",
    status: "Active",
    joined: "Jan 15, 2023",
  },
  {
    id: 2,
    name: "Glam Studio",
    owner: "Michael Chen",
    location: "Los Angeles, CA",
    plan: "Standard",
    status: "Active",
    joined: "Feb 22, 2023",
  },
  {
    id: 3,
    name: "Luxury Hair",
    owner: "Emma Wilson",
    location: "Chicago, IL",
    plan: "Premium",
    status: "Active",
    joined: "Mar 10, 2023",
  },
  {
    id: 4,
    name: "Perfect Cuts",
    owner: "David Miller",
    location: "Austin, TX",
    plan: "Basic",
    status: "Inactive",
    joined: "Apr 05, 2023",
  },
  {
    id: 5,
    name: "Modern Touch",
    owner: "Olivia Taylor",
    location: "Miami, FL",
    plan: "Standard",
    status: "Active",
    joined: "May 17, 2023",
  },
];

const Salons = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salons</h1>
          <p className="text-muted-foreground">
            Manage and view all registered salons
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Salon
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salon Management</CardTitle>
          <CardDescription>
            View and manage all registered salons on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-auto relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 w-full md:w-80"
                placeholder="Search salons..."
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salons.map((salon) => (
                  <TableRow key={salon.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{salon.name}</TableCell>
                    <TableCell>{salon.owner}</TableCell>
                    <TableCell>{salon.location}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          salon.plan === "Premium"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            : salon.plan === "Standard"
                            ? "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            : "bg-gray-50 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400"
                        }`}
                      >
                        {salon.plan}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          salon.status === "Active"
                            ? "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            : "bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                        }`}
                      >
                        {salon.status}
                      </span>
                    </TableCell>
                    <TableCell>{salon.joined}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Salons;
