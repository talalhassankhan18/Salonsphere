"use client";

import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/dashboard/components/ui/card";
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
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  UserCheck,
  Clock,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/Superadmin/dashboard/components/ui/dialog";
import Image from "next/image";
import LoadingSpinner from "@/common/LoadingSpinner";

interface Salon {
  id: string;
  name: string;
  location: string;
  owner: string;
  plan: string;
  status: string;
  joined: string;
}

interface SalonDetails {
  salonId: string;
  salonName: string;
  name: string;
  email: string;
  isActive: boolean;
  paymentStatus: string;
  plan: string | null;
  avatar: string;
}

const Salons = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSalon, setSelectedSalon] = useState<SalonDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    plan: "",
    joinedStart: "",
    joinedEnd: "",
  });

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/salon", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch salons");
        }

        const mappedSalons = data.map((salon: any) => ({
          id: salon._id,
          name: salon.salonName,
          location: salon.address || "No location provided",
          owner: salon.name || "Unknown",
          plan: salon.plan || "Unknown",
          status: salon.isActive ? "Active" : "Inactive",
          joined: salon.createdAt
            ? new Date(salon.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })
            : "Unknown",
        }));
        setSalons(mappedSalons);
        setFilteredSalons(mappedSalons);
      } catch (err: any) {
        console.error("Salons: Failed to fetch salons:", err);
        toast.error(err.message || "Failed to load salon data");
      } finally {
        setLoading(false);
      }
    };

    fetchSalons();
  }, []);

  useEffect(() => {
    let result = [...salons];

    // Apply search filter
    const lowercasedQuery = searchQuery.toLowerCase();
    result = result.filter(
      (salon) =>
        salon.name.toLowerCase().includes(lowercasedQuery) ||
        salon.owner.toLowerCase().includes(lowercasedQuery) ||
        salon.location.toLowerCase().includes(lowercasedQuery)
    );

    // Apply status filter
    if (filters.status) {
      result = result.filter((salon) => salon.status === filters.status);
    }

    // Apply plan filter
    if (filters.plan) {
      result = result.filter((salon) => salon.plan === filters.plan);
    }

    // Apply joined date range filter
    if (filters.joinedStart || filters.joinedEnd) {
      result = result.filter((salon) => {
        const joinedDate = new Date(salon.joined);
        const startDate = filters.joinedStart
          ? new Date(filters.joinedStart)
          : null;
        const endDate = filters.joinedEnd ? new Date(filters.joinedEnd) : null;

        if (startDate && joinedDate < startDate) return false;
        if (endDate && joinedDate > endDate) return false;
        return true;
      });
    }

    setFilteredSalons(result);
  }, [searchQuery, salons, filters]);

  const handleViewDetails = async (id: string) => {
    try {
      setDetailsLoading(true);
      const response = await fetch(`/api/salon/details?id=${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch salon details");
      }

      setSelectedSalon(data);
      setIsModalOpen(true);
    } catch (err: any) {
      console.error("Failed to fetch salon details:", err);
      toast.error(err.message || "Failed to load salon details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSalon(null);
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ["Name,Owner,Location,Plan,Status,Joined\n"];
    const csv = [
      headers,
      ...filteredSalons.map(
        (salon) =>
          `${salon.name},${salon.owner},${salon.location},${salon.plan},${salon.status},${salon.joined}`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "salons_export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Salons exported successfully!");
  };

  // Calculate metrics for cards
  const totalSalons = salons.length;
  const activeSalons = salons.filter(
    (salon) => salon.status === "Active"
  ).length;
  const newSalons = salons.filter((salon) => {
    const joinedDate = new Date(salon.joined);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return joinedDate >= thirtyDaysAgo;
  }).length;
  const premiumSalons = salons.filter(
    (salon) => salon.plan === "Premium"
  ).length;

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salons</h1>
          <p className="text-muted-foreground">
            Manage and view all registered salons
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Salons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalSalons}</div>
                <p className="text-xs text-muted-foreground">
                  Registered salons
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Salons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{activeSalons}</div>
                <p className="text-xs text-muted-foreground">Active salons</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Salons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{newSalons}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Premium Salons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{premiumSalons}</div>
                <p className="text-xs text-muted-foreground">
                  Premium plan salons
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Filter Salons</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        value={filters.status}
                        onChange={(e) =>
                          setFilters({ ...filters, status: e.target.value })
                        }
                      >
                        <option value="">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Plan
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        value={filters.plan}
                        onChange={(e) =>
                          setFilters({ ...filters, plan: e.target.value })
                        }
                      >
                        <option value="">All</option>
                        <option value="Premium">Premium</option>
                        <option value="Standard">Standard</option>
                        <option value="Basic">Basic</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Joined Start
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        value={filters.joinedStart}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            joinedStart: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Joined End
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        value={filters.joinedEnd}
                        onChange={(e) =>
                          setFilters({ ...filters, joinedEnd: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handleExport}>
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
                {filteredSalons.map((salon) => (
                  <TableRow key={salon.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{salon.name}</TableCell>
                    <TableCell>{salon.owner}</TableCell>
                    <TableCell>{salon.location}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          salon.plan === "Premium"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            : salon.plan === "Standard" ||
                              salon.plan === "Basic"
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
                      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(salon.id)}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Salon Details</DialogTitle>
                          </DialogHeader>
                          {detailsLoading ? (
                            <div className="flex justify-center items-center h-40">
                              <LoadingSpinner />
                            </div>
                          ) : selectedSalon ? (
                            <Card className="bg-white rounded-xl shadow-md p-6">
                              <CardContent>
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                  <div className="md:mr-6 mb-4 md:mb-0">
                                    <Image
                                      src={selectedSalon.avatar}
                                      alt={selectedSalon.salonName}
                                      width={128}
                                      height={128}
                                      className="w-32 h-32 rounded-full object-cover shadow-md"
                                      unoptimized
                                    />
                                  </div>
                                  <div className="text-left space-y-2">
                                    <h3 className="text-xl font-semibold text-gray-800">
                                      {selectedSalon.salonName}
                                    </h3>
                                    <p className="text-gray-600">
                                      Owner: {selectedSalon.name}
                                    </p>
                                    <p className="text-gray-600">
                                      Email: {selectedSalon.email}
                                    </p>
                                    <p className="text-gray-600">
                                      Status:{" "}
                                      {selectedSalon.isActive
                                        ? "Active"
                                        : "Inactive"}
                                    </p>
                                    <p className="text-gray-600">
                                      Payment Status:{" "}
                                      {selectedSalon.paymentStatus}
                                    </p>
                                    <p className="text-gray-600">
                                      Plan: {selectedSalon.plan || "No Plan"}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <p className="text-gray-600">
                              Failed to load salon details.
                            </p>
                          )}
                        </DialogContent>
                      </Dialog>
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
