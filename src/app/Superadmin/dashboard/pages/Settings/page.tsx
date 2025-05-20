"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/dashboard/components/ui/card";
import { Input } from "@/app/Superadmin/dashboard/components/ui/input";
import { Label } from "@/app/Superadmin/dashboard/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Superadmin/dashboard/components/ui/select";
import { Textarea } from "@/app/Superadmin/dashboard/components/ui/textarea";
import { toast } from "sonner";
import { Globe, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Superadmin/dashboard/components/ui/table";

interface SettingsData {
  _id?: string;
  firstName: string;
  lastName: string;
  platformName: string;
  supportEmail: string;
  defaultTimezone: string;
  defaultCurrency: string;
  platformTagline: string;
  platformDescription: string;
}

const Settings = () => {
  const [settingsList, setSettingsList] = useState<SettingsData[]>([]);
  const [formData, setFormData] = useState<SettingsData>({
    firstName: "",
    lastName: "",
    platformName: "",
    supportEmail: "",
    defaultTimezone: "utc",
    defaultCurrency: "pkr",
    platformTagline: "",
    platformDescription: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showForm, setShowForm] = useState(true);

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/setting");
      if (!response.ok) throw new Error(`Failed to fetch settings: HTTP ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch settings");
      setSettingsList(data.data);
      setShowForm(data.data.length === 0);
    } catch (error: any) {
      console.error("Fetch settings error:", error.message, error.stack);
      toast.error(error.message || "Error fetching settings");
    } finally {
      setIsFetching(false);
    }
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate settings
  const validateSettings = () => {
    const requiredFields = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      platformName: formData.platformName,
      supportEmail: formData.supportEmail,
      defaultTimezone: formData.defaultTimezone,
      defaultCurrency: formData.defaultCurrency,
      platformTagline: formData.platformTagline,
      platformDescription: formData.platformDescription,
    };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || value.trim() === "") {
        toast.error(`${key} is required`);
        return false;
      }
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.supportEmail)) {
      toast.error("Invalid support email format");
      return false;
    }
    return true;
  };

  // Handle save or update
  const handleSave = async () => {
    if (!validateSettings()) {
      console.log("Validation failed. Current form data:", formData);
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("platformName", formData.platformName);
      formDataToSend.append("supportEmail", formData.supportEmail);
      formDataToSend.append("defaultTimezone", formData.defaultTimezone);
      formDataToSend.append("defaultCurrency", formData.defaultCurrency);
      formDataToSend.append("platformTagline", formData.platformTagline);
      formDataToSend.append("platformDescription", formData.platformDescription);

      const method = formData._id ? "PUT" : "POST";
      const url = formData._id ? `/api/setting/${formData._id}` : "/api/setting";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save settings: HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to save settings");
      if (!data.data) throw new Error("No settings data returned");

      // Update the settings list
      if (formData._id) {
        setSettingsList((prev) =>
          prev.map((item) => (item._id === formData._id ? data.data : item))
        );
      } else {
        setSettingsList((prev) => [...prev, data.data]);
      }

      // Hide form and reset
      setShowForm(false);
      resetForm();
      toast.success("Settings saved successfully");
    } catch (error: any) {
      console.error("Save error:", error.message, error.stack);
      toast.error(error.message || "Error saving settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (settings: SettingsData) => {
    setFormData(settings);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/setting/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete settings: HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to delete settings");

      // Remove the deleted item from the list
      setSettingsList((prev) => prev.filter((item) => item._id !== id));
      toast.success("Settings deleted successfully");

      // Show form if no settings remain
      if (settingsList.length === 1) {
        setShowForm(true);
      }
      // Reset form if the deleted item was being edited
      if (formData._id === id) {
        resetForm();
      }
    } catch (error: any) {
      console.error("Delete error:", error.message, error.stack);
      toast.error(error.message || "Error deleting settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      platformName: "",
      supportEmail: "",
      defaultTimezone: "utc",
      defaultCurrency: "pkr",
      platformTagline: "",
      platformDescription: "",
    });
  };

  if (isFetching) return <div className="flex justify-center items-center h-screen bg-[#FFFFFF]">Loading...</div>;

  return (
    <div className="container mx-auto p-3 sm:p-4 space-y-6 bg-[#FFFFFF] min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#231F20] tracking-tight">Settings</h1>
        <p className="text-[#4A4A4A] mt-1 text-xs sm:text-sm">Manage platform settings</p>
      </div>

      {/* Settings Table */}
      {settingsList.length > 0 ? (
        <Card className="shadow-md border-[#EAEAEA] bg-[#FFFFFF] rounded-lg">
          <CardHeader className="py-3">
            <CardTitle className="text-lg sm:text-xl text-[#231F20]">Settings List</CardTitle>
            <CardDescription className="text-[#4A4A4A] text-xs sm:text-sm">
              View and manage platform settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto px-3 py-2">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9FAFB]">
                  <TableHead className="text-xs sm:text-sm py-2">First Name</TableHead>
                  <TableHead className="text-xs sm:text-sm py-2">Last Name</TableHead>
                  <TableHead className="text-xs sm:text-sm py-2">Platform Name</TableHead>
                  <TableHead className="text-xs sm:text-sm py-2">Support Email</TableHead>
                  <TableHead className="text-xs sm:text-sm py-2 hidden sm:table-cell">Timezone</TableHead>
                  <TableHead className="text-xs sm:text-sm py-2 hidden sm:table-cell">Currency</TableHead>
                  <TableHead className="text-xs sm:text-sm py-2 hidden md:table-cell">Tagline</TableHead>
                  <TableHead className="text-xs sm:text-sm py-2 hidden md:table-cell">Description</TableHead>
                  <TableHead className="text-xs sm:text-sm py-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settingsList.map((settings, index) => (
                  <TableRow key={settings._id} className={index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#F9FAFB]"}>
                    <TableCell className="text-xs sm:text-sm py-2">{settings.firstName}</TableCell>
                    <TableCell className="text-xs sm:text-sm py-2">{settings.lastName}</TableCell>
                    <TableCell className="text-xs sm:text-sm py-2">{settings.platformName}</TableCell>
                    <TableCell className="text-xs sm:text-sm py-2">{settings.supportEmail}</TableCell>
                    <TableCell className="text-xs sm:text-sm py-2 hidden sm:table-cell">{settings.defaultTimezone.toUpperCase()}</TableCell>
                    <TableCell className="text-xs sm:text-sm py-2 hidden sm:table-cell">{settings.defaultCurrency.toUpperCase()}</TableCell>
                    <TableCell className="text-xs sm:text-sm py-2 hidden md:table-cell">{settings.platformTagline}</TableCell>
                    <TableCell className="text-xs sm:text-sm py-2 hidden md:table-cell">{settings.platformDescription.slice(0, 20)}...</TableCell>
                    <TableCell className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(settings)}
                        disabled={isLoading}
                        className="border-[#B4004E] text-[#B4004E] hover:bg-[#B4004E] hover:text-[#FFFFFF] text-xs py-1 px-2"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(settings._id!)}
                        disabled={isLoading}
                        className="border-[#BF616A] text-[#BF616A] hover:bg-[#BF616A] hover:text-[#3D0000] text-xs py-1 px-2"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md border-[#EAEAEA] bg-[#FFFFFF] rounded-lg">
          <CardContent className="py-4 text-center">
            <p className="text-[#4A4A4A] text-xs sm:text-sm">No settings found. Add new settings below.</p>
          </CardContent>
        </Card>
      )}

      {/* Settings Form */}
      {showForm && (
        <Card className="shadow-md border-[#EAEAEA] bg-[#FFFFFF] rounded-lg">
          <CardHeader className="py-3">
            <CardTitle className="text-lg sm:text-xl text-[#231F20] flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {formData._id ? "Edit Settings" : "Add New Settings"}
            </CardTitle>
            <CardDescription className="text-[#4A4A4A] text-xs sm:text-sm">
              Configure platform-wide settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-3 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-[#1F1F1F] text-xs sm:text-sm">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className="border-[#EAEAEA] bg-[#F3F3F3] focus:ring-[#B4004E] text-[#1F1F1F] text-xs sm:text-sm h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-[#1F1F1F] text-xs sm:text-sm">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className="border-[#EAEAEA] bg-[#F3F3F3] focus:ring-[#B4004E] text-[#1F1F1F] text-xs sm:text-sm h-8"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="platformName" className="text-[#1F1F1F] text-xs sm:text-sm">Platform Name</Label>
              <Input
                id="platformName"
                name="platformName"
                value={formData.platformName}
                onChange={handleChange}
                placeholder="Enter platform name"
                className="border-[#EAEAEA] bg-[#F3F3F3] focus:ring-[#B4004E] text-[#1F1F1F] text-xs sm:text-sm h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="supportEmail" className="text-[#1F1F1F] text-xs sm:text-sm">Support Email</Label>
              <Input
                id="supportEmail"
                name="supportEmail"
                type="email"
                value={formData.supportEmail}
                onChange={handleChange}
                placeholder="Enter support email"
                className="border-[#EAEAEA] bg-[#F3F3F3] focus:ring-[#B4004E] text-[#1F1F1F] text-xs sm:text-sm h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="defaultTimezone" className="text-[#1F1F1F] text-xs sm:text-sm">Default Timezone</Label>
              <Select
                name="defaultTimezone"
                value={formData.defaultTimezone}
                onValueChange={(value) => handleChange({ name: "defaultTimezone", value })}
              >
                <SelectTrigger id="defaultTimezone" className="border-[#EAEAEA] bg-[#F3F3F3] text-[#1F1F1F] text-xs sm:text-sm h-8">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">EST</SelectItem>
                  <SelectItem value="cst">CST</SelectItem>
                  <SelectItem value="mst">MST</SelectItem>
                  <SelectItem value="pst">PST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="defaultCurrency" className="text-[#1F1F1F] text-xs sm:text-sm">Default Currency</Label>
              <Select
                name="defaultCurrency"
                value={formData.defaultCurrency}
                onValueChange={(value) => handleChange({ name: "defaultCurrency", value })}
              >
                <SelectTrigger id="defaultCurrency" className="border-[#EAEAEA] bg-[#F3F3F3] text-[#1F1F1F] text-xs sm:text-sm h-8">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pkr">PKR (₨)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="platformTagline" className="text-[#1F1F1F] text-xs sm:text-sm">Platform Tagline</Label>
              <Input
                id="platformTagline"
                name="platformTagline"
                value={formData.platformTagline}
                onChange={handleChange}
                placeholder="Enter platform tagline"
                className="border-[#EAEAEA] bg-[#F3F3F3] focus:ring-[#B4004E] text-[#1F1F1F] text-xs sm:text-sm h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="platformDescription" className="text-[#1F1F1F] text-xs sm:text-sm">Platform Description</Label>
              <Textarea
                id="platformDescription"
                name="platformDescription"
                value={formData.platformDescription}
                onChange={handleChange}
                placeholder="Describe the platform"
                className="border-[#EAEAEA] bg-[#F3F3F3] focus:ring-[#B4004E] text-[#1F1F1F] text-xs sm:text-sm min-h-[80px]"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 px-3 py-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              disabled={isLoading}
              className="border-[#4A4A4A] text-[#4A4A4A] hover:bg-[#4A4A4A] hover:text-[#FFFFFF] text-xs sm:text-sm py-1 px-3"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-[#B4004E] hover:bg-[#8B0039] text-[#FFFFFF] text-xs sm:text-sm py-1 px-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-3 w-3 mr-1 border-2 border-b-transparent rounded-full"></div>
                  Saving...
                </>
              ) : formData._id ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Settings;