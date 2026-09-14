"use client";
import React, { useState, useEffect } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Link from "next/link";
import { Session } from "next-auth"; // Import Session type

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Lock,
  Building,
  Clock,
  Check,
  Plus,
} from "lucide-react";

// Interface for businessHours
interface BusinessHour {
  day: string;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

// Interface for scheduling
interface Scheduling {
  businessHours: BusinessHour[];
  appointmentBuffer: number;
  allowOnlineBooking: boolean;
  requireConfirmation: boolean;
}

// Interface for salon details
interface SalonDetails {
  _id: string;
  salonName: string;
  address: string;
  salonType: "female" | "male" | "unisex";
  avatar?: string;
  email: string;
  name: string;
  phone: string;
  username: string;
  scheduling: Scheduling;
}

const Settings: React.FC = () => {
  // Explicitly type the session
  const { data: session, status } = useSession() as {
    data: Session | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };
  const salonId = session?.user?.salonId ?? null;

  const [salon, setSalon] = useState<SalonDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingSalon, setIsSavingSalon] = useState<boolean>(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState<boolean>(false);

  // Form state for salon settings
  const [salonForm, setSalonForm] = useState({
    salonName: "",
    phone: "",
    address: "",
    salonType: "unisex" as "female" | "male" | "unisex",
    email: "",
    name: "",
    username: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form state for password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Form state for scheduling
  const [schedulingForm, setSchedulingForm] = useState<Scheduling>({
    businessHours: [
      { day: "Monday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "Tuesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "Wednesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "Thursday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "Friday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "Saturday", isOpen: true, openTime: "10:00", closeTime: "16:00" },
      { day: "Sunday", isOpen: false, openTime: null, closeTime: null },
    ],
    appointmentBuffer: 15,
    allowOnlineBooking: true,
    requireConfirmation: true,
  });

  // Fetch salon details on mount
  useEffect(() => {
    async function fetchSalonDetails() {
      if (status === "loading" || !salonId) {
        console.log("Skipping fetch: status loading or no salonId");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching salon details for ID:", salonId);
        const response = await fetch(`/api/salon/${salonId}`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Fetch error response:", errorData);
          throw new Error(
            errorData.error ||
              `Failed to fetch salon details (Status: ${response.status})`
          );
        }
        const data: SalonDetails = await response.json();
        console.log("Fetched salon data:", data);
        setSalon(data);
        setSalonForm({
          salonName: data.salonName || "",
          phone: data.phone || "",
          address: data.address || "",
          salonType: data.salonType || "unisex",
          email: data.email || "",
          name: data.name || "",
          username: data.username || "",
        });
        setAvatarPreview(data.avatar || "/placeholder.svg");
        // Functional update: reads the previous form without depending on it.
        setSchedulingForm((prev) => ({
          businessHours:
            data.scheduling?.businessHours.map((hour) => ({
              ...hour,
              openTime: hour.isOpen ? convertTo24Hour(hour.openTime) : null,
              closeTime: hour.isOpen ? convertTo24Hour(hour.closeTime) : null,
            })) || prev.businessHours,
          appointmentBuffer: data.scheduling?.appointmentBuffer || 15,
          allowOnlineBooking: data.scheduling?.allowOnlineBooking ?? true,
          requireConfirmation: data.scheduling?.requireConfirmation ?? true,
        }));
      } catch (err: any) {
        console.error("Error fetching salon details:", err);
        setError(err.message || "Failed to load salon details");
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Failed to load salon details",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSalonDetails();
  }, [salonId, status]);

  // Handle avatar file change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Profile image must be JPEG or PNG",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Profile image must be less than 5MB",
        });
        return;
      }
      setAvatarFile(file);
      console.log("Selected avatar:", file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update salon form state
  const handleSalonFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    if (id === "phone" && value && !/^\d{0,10}$/.test(value)) {
      toast({
        variant: "destructive",
        title: "Invalid phone number",
        description: "Phone number must be up to 10 digits",
      });
      return;
    }
    if (id === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address",
      });
      return;
    }
    setSalonForm((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Save salon settings
  const handleSaveSalon = async () => {
    if (!salonId) {
      console.error("No salonId available in session:", session?.user);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Salon ID is missing. Please log in again.",
      });
      return;
    }

    if (status !== "authenticated") {
      console.error("User not authenticated, status:", status);
      toast({
        variant: "destructive",
        title: "Error",
        description: "You are not authenticated. Please log in.",
      });
      return;
    }

    // Validate required fields
    if (!salonForm.salonName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Salon name is required",
      });
      return;
    }
    if (
      !salonForm.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(salonForm.email)
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Valid email is required",
      });
      return;
    }
    if (!salonForm.phone || !/^\d{10}$/.test(salonForm.phone)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Valid 10-digit phone number is required",
      });
      return;
    }

    try {
      setIsSavingSalon(true);
      const formData = new FormData();
      formData.append("salonName", salonForm.salonName);
      formData.append("phone", salonForm.phone);
      formData.append("address", salonForm.address || "");
      formData.append("salonType", salonForm.salonType);
      formData.append("email", salonForm.email);
      formData.append("name", salonForm.name || "");
      formData.append("username", salonForm.username || "");
      if (avatarFile) {
        console.log(
          "Appending avatar to FormData:",
          avatarFile.name,
          avatarFile.type,
          avatarFile.size
        );
        formData.append("avatar", avatarFile);
      } else {
        console.log("No avatar file selected");
      }

      console.log("Sending FormData for salon settings:");
      for (const [key, value] of formData.entries()) {
        console.log(`FormData: ${key} =`, value);
      }

      const response = await fetch(`/api/salon/${salonId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("Server error response:", errorData);
        } catch (jsonError) {
          console.error("Failed to parse server response:", jsonError);
          errorData = { error: `Server error (Status: ${response.status})` };
        }
        throw new Error(
          errorData.error ||
            `Failed to update salon settings (Status: ${response.status})`
        );
      }

      const updatedSalon: SalonDetails = await response.json();
      setSalon(updatedSalon);
      setSalonForm({
        salonName: updatedSalon.salonName || "",
        phone: updatedSalon.phone || "",
        address: updatedSalon.address || "",
        salonType: updatedSalon.salonType || "unisex",
        email: updatedSalon.email || "",
        name: updatedSalon.name || "",
        username: updatedSalon.username || "",
      });
      setAvatarFile(null);
      setAvatarPreview(updatedSalon.avatar || "/placeholder.svg");

      toast({
        title: "Salon settings updated",
        description: "Your salon settings have been updated successfully",
      });
    } catch (err: any) {
      console.error("Error updating salon settings:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update salon settings",
      });
    } finally {
      setIsSavingSalon(false);
    }
  };

  // Update password form state
  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  // Save password
  const handleSavePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New password and confirm password do not match",
      });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New password must be at least 8 characters",
      });
      return;
    }

    if (!salonId) {
      console.error("No salonId available in session:", session?.user);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Salon ID is missing. Please log in again.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("currentPassword", passwordForm.currentPassword);
      formData.append("newPassword", passwordForm.newPassword);

      const response = await fetch(`/api/salon/${salonId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("Server error response:", errorData);
        } catch (jsonError) {
          console.error("Failed to parse server response:", jsonError);
          errorData = { error: `Server error (Status: ${response.status})` };
        }
        throw new Error(
          errorData.error ||
            `Failed to update password (Status: ${response.status})`
        );
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
    } catch (err: any) {
      console.error("Error updating password:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update password",
      });
    }
  };

  // Update scheduling form state
  const handleSchedulingChange = (
    field: keyof Scheduling,
    value: any,
    day?: string
  ) => {
    if (field === "businessHours" && day) {
      setSchedulingForm((prev) => ({
        ...prev,
        businessHours: prev.businessHours.map((hour) =>
          hour.day === day
            ? {
                ...hour,
                ...value,
                openTime:
                  value.isOpen !== undefined
                    ? value.isOpen
                      ? value.openTime || hour.openTime || "09:00"
                      : null
                    : value.openTime !== undefined
                    ? value.openTime || null
                    : hour.openTime,
                closeTime:
                  value.isOpen !== undefined
                    ? value.isOpen
                      ? value.closeTime || hour.closeTime || "18:00"
                      : null
                    : value.closeTime !== undefined
                    ? value.closeTime || null
                    : hour.closeTime,
              }
            : hour
        ),
      }));
    } else {
      setSchedulingForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Save scheduling settings
  const handleSaveSchedule = async () => {
    if (!salonId) {
      console.error("No salonId available in session:", session?.user);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Salon ID is missing. Please log in again.",
      });
      return;
    }

    if (status !== "authenticated") {
      console.error("User not authenticated, status:", status);
      toast({
        variant: "destructive",
        title: "Error",
        description: "You are not authenticated. Please log in.",
      });
      return;
    }

    // Validate business hours
    for (const hour of schedulingForm.businessHours) {
      if (hour.isOpen) {
        if (!hour.openTime || !hour.closeTime) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Open and close times are required for ${hour.day} if open`,
          });
          return;
        }
        if (!/^[0-2][0-9]:[0-5][0-9]$/.test(hour.openTime)) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Invalid open time format for ${hour.day} (e.g., 09:00)`,
          });
          return;
        }
        if (!/^[0-2][0-9]:[0-5][0-9]$/.test(hour.closeTime)) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Invalid close time format for ${hour.day} (e.g., 18:00)`,
          });
          return;
        }
        const open = new Date(`1970-01-01T${hour.openTime}:00`);
        const close = new Date(`1970-01-01T${hour.closeTime}:00`);
        if (open >= close) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Close time must be after open time for ${hour.day}`,
          });
          return;
        }
      } else {
        if (hour.openTime !== null || hour.closeTime !== null) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Open and close times must be null for ${hour.day} if closed`,
          });
          return;
        }
      }
    }
    if (
      schedulingForm.appointmentBuffer < 0 ||
      schedulingForm.appointmentBuffer > 60
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Appointment buffer must be between 0 and 60 minutes",
      });
      return;
    }

    try {
      setIsSavingSchedule(true);
      const formData = new FormData();
      const formattedScheduling = {
        ...schedulingForm,
        businessHours: schedulingForm.businessHours.map((hour) => ({
          ...hour,
          openTime:
            hour.isOpen && hour.openTime ? formatTime(hour.openTime) : null,
          closeTime:
            hour.isOpen && hour.closeTime ? formatTime(hour.closeTime) : null,
        })),
      };
      formData.append("scheduling", JSON.stringify(formattedScheduling));

      console.log(
        "Sending FormData for scheduling settings:",
        formattedScheduling
      );

      const response = await fetch(`/api/salon/${salonId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("Server error response:", errorData);
        } catch (jsonError) {
          console.error("Failed to parse server response:", jsonError);
          errorData = { error: `Server error (Status: ${response.status})` };
        }
        throw new Error(
          errorData.error ||
            `Failed to update scheduling settings (Status: ${response.status})`
        );
      }

      const updatedSalon: SalonDetails = await response.json();
      setSalon(updatedSalon);
      setSchedulingForm({
        businessHours:
          updatedSalon.scheduling?.businessHours.map((hour) => ({
            ...hour,
            openTime: hour.isOpen ? convertTo24Hour(hour.openTime) : null,
            closeTime: hour.isOpen ? convertTo24Hour(hour.closeTime) : null,
          })) || schedulingForm.businessHours,
        appointmentBuffer: updatedSalon.scheduling?.appointmentBuffer || 15,
        allowOnlineBooking: updatedSalon.scheduling?.allowOnlineBooking ?? true,
        requireConfirmation:
          updatedSalon.scheduling?.requireConfirmation ?? true,
      });

      toast({
        title: "Scheduling updated",
        description:
          "Your scheduling preferences have been updated successfully",
      });
    } catch (err: any) {
      console.error("Error updating scheduling settings:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update scheduling settings",
      });
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // Helper to convert HH:MM to HH:MM AM/PM
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Helper to convert HH:MM AM/PM to HH:MM
  const convertTo24Hour = (time: string | null): string | null => {
    if (!time) return null;
    const [timePart, period] = time.split(" ");
    const [rawHours, minutes] = timePart.split(":").map(Number);
    let hours = rawHours;
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
        <Tabs defaultValue="salon" className="space-y-4">
          <TabsList className="grid grid-cols-3 gap-2">
            <TabsTrigger value="password">
              <Lock className="mr-2 h-4 w-4" />
              Password
            </TabsTrigger>
            <TabsTrigger value="salon">
              <Building className="mr-2 h-4 w-4" />
              Salon
            </TabsTrigger>
            <TabsTrigger value="scheduling">
              <Clock className="mr-2 h-4 w-4" />
              Scheduling
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Update Password</CardTitle>
                <CardDescription>
                  Change your password or request a reset link
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordFormChange}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFormChange}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFormChange}
                  />
                </div>
                <div className="text-xs text-gray-400">
                  Password should be at least 8 characters long.
                </div>
                <Separator />
                <div>
                  <div className="flex justify-end">
                    <Link
                      href="/salon/forgot-password"
                      className="text-sm text-[#B4004E] hover:text-[#9a0042] font-medium transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePassword}>
                  <Check className="mr-2 h-4 w-4" />
                  Update Password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="salon" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Salon Settings</CardTitle>
                <CardDescription>
                  Configure your salon information and business details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading salon details...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : !salon ? (
                  <div className="text-center py-4">
                    <p className="text-red-500">Salon not found.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="avatar">Profile Photo</Label>
                      <div className="relative h-32 w-32 rounded-full overflow-hidden group">
                        <img
                          src={avatarPreview || "/placeholder.svg"}
                          alt="Salon avatar"
                          className="w-full h-full object-cover"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Plus className="text-white h-8 w-8" />
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salonName">Salon Name</Label>
                        <Input
                          id="salonName"
                          value={salonForm.salonName}
                          onChange={handleSalonFormChange}
                          placeholder="Beauty & Style Salon"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Business Phone</Label>
                        <Input
                          id="phone"
                          value={salonForm.phone}
                          onChange={handleSalonFormChange}
                          placeholder="1234567890"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Salon Address</Label>
                      <Input
                        id="address"
                        value={salonForm.address}
                        onChange={handleSalonFormChange}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salonType">Salon Type</Label>
                      <select
                        id="salonType"
                        value={salonForm.salonType}
                        onChange={handleSalonFormChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="unisex">Unisex</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={salonForm.email}
                          onChange={handleSalonFormChange}
                          placeholder="salon@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name">Owner Name</Label>
                        <Input
                          id="name"
                          value={salonForm.name}
                          onChange={handleSalonFormChange}
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={salonForm.username}
                        onChange={handleSalonFormChange}
                        placeholder="salon_username"
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveSalon}
                  disabled={
                    loading ||
                    !!error ||
                    !salon ||
                    isSavingSalon ||
                    status !== "authenticated"
                  }
                >
                  {isSavingSalon ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Salon Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Scheduling Preferences</CardTitle>
                <CardDescription>
                  Configure your appointment scheduling preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Label>Business Hours</Label>
                  {schedulingForm.businessHours.map((hour) => (
                    <div key={hour.day} className="flex items-center space-x-4">
                      <Checkbox
                        id={`${hour.day}-isOpen`}
                        checked={hour.isOpen}
                        onCheckedChange={(checked) =>
                          handleSchedulingChange(
                            "businessHours",
                            {
                              isOpen: checked,
                              openTime: checked
                                ? hour.openTime || "09:00"
                                : null,
                              closeTime: checked
                                ? hour.closeTime || "18:00"
                                : null,
                            },
                            hour.day
                          )
                        }
                      />
                      <Label htmlFor={`${hour.day}-isOpen`} className="w-24">
                        {hour.day}
                      </Label>
                      <Input
                        id={`${hour.day}-openTime`}
                        type="time"
                        value={hour.openTime || ""}
                        onChange={(e) =>
                          handleSchedulingChange(
                            "businessHours",
                            { openTime: e.target.value || null },
                            hour.day
                          )
                        }
                        disabled={!hour.isOpen}
                        className="w-32"
                      />
                      <Input
                        id={`${hour.day}-closeTime`}
                        type="time"
                        value={hour.closeTime || ""}
                        onChange={(e) =>
                          handleSchedulingChange(
                            "businessHours",
                            { closeTime: e.target.value || null },
                            hour.day
                          )
                        }
                        disabled={!hour.isOpen}
                        className="w-32"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="appointmentBuffer">Appointment Buffer</Label>
                  <Input
                    id="appointmentBuffer"
                    type="number"
                    min="0"
                    max="60"
                    value={schedulingForm.appointmentBuffer}
                    onChange={(e) =>
                      handleSchedulingChange(
                        "appointmentBuffer",
                        Number(e.target.value)
                      )
                    }
                    className="w-32"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Minutes between appointments
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowOnlineBooking"
                    checked={schedulingForm.allowOnlineBooking}
                    onCheckedChange={(checked) =>
                      handleSchedulingChange("allowOnlineBooking", checked)
                    }
                  />
                  <Label htmlFor="allowOnlineBooking">
                    Allow online appointment booking
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requireConfirmation"
                    checked={schedulingForm.requireConfirmation}
                    onCheckedChange={(checked) =>
                      handleSchedulingChange("requireConfirmation", checked)
                    }
                  />
                  <Label htmlFor="requireConfirmation">
                    Require manual confirmation of appointments
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveSchedule}
                  disabled={isSavingSchedule || status !== "authenticated"}
                >
                  {isSavingSchedule ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Scheduling Preferences
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Wrap the component in SessionProvider if not already wrapped in a parent
const SettingsWithSession: React.FC = () => (
  <SessionProvider>
    <Settings />
  </SessionProvider>
);

export default SettingsWithSession;