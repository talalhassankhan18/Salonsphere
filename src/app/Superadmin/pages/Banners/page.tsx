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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Superadmin/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/components/ui/tabs";
import {
  Image,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  Calendar,
  ExternalLink,
} from "lucide-react";

// Mock data for banners
const bannerData = [
  {
    id: 1,
    title: "Summer Sale Collection",
    type: "Hero Slider",
    location: "Homepage",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    status: "Active",
    priority: 1,
    image: "/placeholder.svg",
    clicks: 2456,
  },
  {
    id: 2,
    title: "New Hair Products",
    type: "Category Banner",
    location: "Hair Care Page",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    status: "Active",
    priority: 2,
    image: "/placeholder.svg",
    clicks: 1823,
  },
  {
    id: 3,
    title: "Professional Equipment",
    type: "Side Banner",
    location: "Sidebar",
    startDate: "2024-02-10",
    endDate: "2024-11-30",
    status: "Active",
    priority: 3,
    image: "/placeholder.svg",
    clicks: 987,
  },
  {
    id: 4,
    title: "Special Promotion",
    type: "Popup",
    location: "All Pages",
    startDate: "2024-05-01",
    endDate: "2024-05-15",
    status: "Scheduled",
    priority: 1,
    image: "/placeholder.svg",
    clicks: 0,
  },
  {
    id: 5,
    title: "Holiday Deals",
    type: "Hero Slider",
    location: "Homepage",
    startDate: "2023-12-01",
    endDate: "2024-01-05",
    status: "Expired",
    priority: 1,
    image: "/placeholder.svg",
    clicks: 5214,
  },
];

const Banners = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredBanners = bannerData
    .filter(
      (banner) =>
        banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((banner) => {
      if (activeTab === "all") return true;
      return banner.status.toLowerCase() === activeTab.toLowerCase();
    });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banners</h1>
          <p className="text-muted-foreground">
            Manage store sliders and promotional banners
          </p>
        </div>
        <Button className="sm:self-start">
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Banners</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search banners..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all" className="m-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Banner Management</CardTitle>
              <CardDescription>
                Create and manage promotional banners for the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Banner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBanners.length > 0 ? (
                      filteredBanners.map((banner) => (
                        <TableRow key={banner.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-20 bg-muted rounded overflow-hidden relative">
                                <Image className="h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {banner.title}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ID: {banner.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{banner.type}</TableCell>
                          <TableCell>{banner.location}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              <span className="text-xs">
                                {new Date(
                                  banner.startDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(banner.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span>{banner.priority}</span>
                              <div className="flex flex-col">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                banner.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : banner.status === "Scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {banner.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {banner.clicks.toLocaleString()}
                          </TableCell>
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
                              <Button variant="ghost" size="icon">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          No banners found.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Home Banners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[16/9] bg-muted rounded-md flex items-center justify-center">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm font-medium">Hero Slider</div>
              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Category Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[16/9] bg-muted rounded-md flex items-center justify-center">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm font-medium">Top Banner</div>
              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Special Offer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[16/9] bg-muted rounded-md flex items-center justify-center">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm font-medium">Popup</div>
              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Scheduled
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Salon Promotion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[16/9] bg-muted rounded-md flex items-center justify-center">
              <Image className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm font-medium">Side Banner</div>
              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                Expired
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Banners;
