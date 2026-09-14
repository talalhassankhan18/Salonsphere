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
  Image as ImageIcon,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  ExternalLink,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "@/app/Superadmin/dashboard/components/ui/use-toast";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/Superadmin/dashboard/components/ui/dialog";
import { Label } from "@/app/Superadmin/dashboard/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Superadmin/dashboard/components/ui/select";

interface Banner {
  _id: string;
  title: string;
  type: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: number;
  imageUrl: string;
  clicks: number;
}

const BannerCard = ({
  banner,
  onEdit,
  onDelete,
}: {
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
}) => (
  <Card className="h-full w-full max-w-md">
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{banner.title}</CardTitle>
      <CardDescription>{banner.type}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      {banner.imageUrl ? (
        <div className="relative w-full h-32">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            className="object-cover rounded-md"
            unoptimized
            onError={(e) => {
              console.error("Failed to load image:", banner.imageUrl);
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
        <span className="text-sm font-medium">{banner.location}</span>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            banner.status === "Active"
              ? "bg-green-100 text-green-800"
              : banner.status === "Scheduled"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {banner.status}
        </span>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        <div className="flex justify-between mb-1">
          <span>Duration</span>
          <span>
            {new Date(banner.startDate).toLocaleDateString()} -{" "}
            {new Date(banner.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Clicks</span>
          <span>{banner.clicks.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <Button variant="outline" size="sm" className="flex-1 min-w-[80px]">
          <Eye className="w-3.5 h-3.5 mr-1" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-[80px]"
          onClick={() => onEdit(banner)}
        >
          <Edit className="w-3.5 h-3.5 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-[80px]"
          onClick={() => onDelete(banner._id)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Delete
        </Button>
      </div>
    </CardContent>
  </Card>
);

const Banners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    location: "",
    startDate: "",
    endDate: "",
    priority: 1,
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const bannerTypes = ["Hero Slider", "Category Banner", "Side Banner", "Popup"];
  const bannerLocations = ["Homepage", "Category Page", "Sidebar", "All Pages"];

  const fetchBanners = useCallback(async () => {
    try {
      const response = await fetch(`/api/Banners?search=${searchTerm}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const result = await response.json();
      if (result.success) {
        setBanners(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast({
        title: "Error",
        description: "Failed to fetch banners",
        variant: "destructive",
      });
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (editingBanner) {
      setFormData({
        title: editingBanner.title,
        type: editingBanner.type,
        location: editingBanner.location,
        startDate: editingBanner.startDate.split("T")[0],
        endDate: editingBanner.endDate.split("T")[0],
        priority: editingBanner.priority,
        image: null,
      });
      setImagePreview(null);
    }
  }, [editingBanner]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append("priority", formData.priority.toString());
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetch("/api/Banners", {
        method: "POST",
        body: formDataToSend,
      });
      const result = await response.json();
      if (result.success) {
        setIsAddModalOpen(false);
        setFormData({
          title: "",
          type: "",
          location: "",
          startDate: "",
          endDate: "",
          priority: 1,
          image: null,
        });
        setImagePreview(null);
        await fetchBanners();
        toast({
          title: "Success",
          description: "Banner added successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error adding banner:", error);
      toast({
        title: "Error",
        description: "Failed to addBanner",
        variant: "destructive",
      });
    }
  };

  const handleEditBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("startDate", formData.startDate);
      formDataToSend.append("endDate", formData.endDate);
      formDataToSend.append("priority", formData.priority.toString());
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetch(`/api/Banners/${editingBanner._id}`, {
        method: "PUT",
        body: formDataToSend,
      });
      const result = await response.json();
      if (result.success) {
        setEditingBanner(null);
        setFormData({
          title: "",
          type: "",
          location: "",
          startDate: "",
          endDate: "",
          priority: 1,
          image: null,
        });
        setImagePreview(null);
        await fetchBanners();
        toast({
          title: "Success",
          description: "Banner updated successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error updating banner:", error);
      toast({
        title: "Error",
        description: "Failed to update banner",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const response = await fetch(`/api/Banners/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        await fetchBanners();
        toast({
          title: "Success",
          description: "Banner deleted successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      });
    }
  };

  const filteredBanners = banners.filter(
    (banner) =>
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banners</h1>
          <p className="text-muted-foreground">
            Manage store sliders and promotional banners
          </p>
        </div>
        <Button className="sm:self-start" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>

      <Dialog
        open={isAddModalOpen || !!editingBanner}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingBanner(null);
            setFormData({
              title: "",
              type: "",
              location: "",
              startDate: "",
              endDate: "",
              priority: 1,
              image: null,
            });
            setImagePreview(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBanner ? "Edit Banner" : "Add Banner"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editingBanner ? handleEditBanner : handleAddBanner}
            className="space-y-4"
          >
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {bannerTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {bannerLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: parseInt(e.target.value) })
                }
                required
                min="1"
              />
            </div>
            <div>
              <Label>Banner Image</Label>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              {(imagePreview || editingBanner?.imageUrl) && (
                <div className="mt-2">
                  <img
                    src={imagePreview || editingBanner?.imageUrl}
                    alt="Preview"
                    className="object-cover rounded-md w-24 h-24"
                    onError={(e) => {
                      console.error("Failed to load preview image");
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit">{editingBanner ? "Update" : "Add"} Banner</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingBanner(null);
                  setFormData({
                    title: "",
                    type: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    priority: 1,
                    image: null,
                  });
                  setImagePreview(null);
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Banners</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 w-full sm:w-auto">
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
        </div>

        <TabsContent value="all" className="m-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Banner Management</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="h-8 w-8 p-0"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Create and manage promotional banners for the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewMode === "grid" ? (
                filteredBanners.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredBanners.map((banner) => (
                      <BannerCard
                        key={banner._id}
                        banner={banner}
                        onEdit={(banner) => {
                          setEditingBanner(banner);
                          setFormData({
                            title: banner.title,
                            type: banner.type,
                            location: banner.location,
                            startDate: banner.startDate.split("T")[0],
                            endDate: banner.endDate.split("T")[0],
                            priority: banner.priority,
                            image: null,
                          });
                          setImagePreview(null);
                        }}
                        onDelete={handleDeleteBanner}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No banners found.</p>
                  </div>
                )
              ) : (
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
                          <TableRow key={banner._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {banner.imageUrl ? (
                                  <Image
                                    src={banner.imageUrl}
                                    alt={banner.title}
                                    width={50}
                                    height={50}
                                    className="object-cover rounded-md"
                                    unoptimized
                                    onError={(e) => {
                                      console.error("Failed to load table image:", banner.imageUrl);
                                      e.currentTarget.src = "/placeholder.svg";
                                    }}
                                  />
                                ) : (
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                )}
                                <div>
                                  <div className="font-medium">{banner.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    ID: {banner._id}
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
                                  {new Date(banner.startDate).toLocaleDateString()} -{" "}
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
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        priority: banner.priority - 1,
                                      })
                                    }
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4"
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        priority: banner.priority + 1,
                                      })
                                    }
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
                            <TableCell>{banner.clicks.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingBanner(banner);
                                    setFormData({
                                      title: banner.title,
                                      type: banner.type,
                                      location: banner.location,
                                      startDate: banner.startDate.split("T")[0],
                                      endDate: banner.endDate.split("T")[0],
                                      priority: banner.priority,
                                      image: null,
                                    });
                                    setImagePreview(null);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteBanner(banner._id)}
                                >
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Banners;