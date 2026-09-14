
"use client";
import React, { useCallback, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { format } from "date-fns";
import { Calendar, User, Plus, Search, Bell } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AddAppointment from "../../components/appointments/AddAppointment";
import { toast } from "../../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";

// Utility to format phone number for display
const formatPhoneForDisplay = (phone: string): string => {
  if (!phone || phone === "N/A") return "N/A";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 10) return phone;
  const countryCode = cleaned.startsWith("92") ? "+92" : "+92";
  const number = cleaned.startsWith("92") ? cleaned.slice(2) : cleaned;
  return `${countryCode} ${number.slice(0, 3)} ${number.slice(3)}`;
};

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

interface Appointment {
  _id: string;
  salon: { salonName: string };
  service: { name: string };
  startTime: string;
  duration: number;
  paymentOption: "full" | "half" | "cash";
  amountPaid: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  customerInfo: CustomerInfo;
  createdAt: string;
}

interface Notification {
  _id: string;
  title: string;
  content: string;
  type: "booking" | "status_update" | "system";
  read: boolean;
  createdAt: string;
}

const Appointments: React.FC = () => {
  const { data: session, status } = useSession();
  const [salonId, setSalonId] = useState<string>("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const fetchSalonId = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          console.log("Fetching salonId for email:", session.user.email);
          const response = await fetch("/api/salon/details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });
          const data = await response.json();
          if (response.ok && data.salonId) {
            setSalonId(data.salonId);
            console.log(
              "Fetched salonId:",
              data.salonId,
              "Salon Name:",
              data.salonName
            );
          } else {
            console.error("Failed to fetch salonId:", data.error);
            toast({
              title: "Error",
              description: data.error || "Failed to fetch salon ID",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching salonId:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch salon ID";
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else if (status === "unauthenticated") {
        console.error("User is not authenticated");
        toast({
          title: "Error",
          description: "Please log in to view appointments",
          variant: "destructive",
        });
      }
    };
    fetchSalonId();
  }, [status, session]);

  const fetchAppointments = useCallback(async () => {
    try {
      console.log(`Fetching appointments for salonId: ${salonId}`);
      const response = await fetch(
        `/api/bookings/salon-admin?salonId=${salonId}`
      );
      const data = await response.json();
      console.log("Appointments API response:", data);

      if (response.ok) {
        const mappedAppointments: Appointment[] = data.bookings.map(
          (booking: any) => ({
            _id: booking._id,
            salon: { salonName: booking.salon?.salonName || "Unknown Salon" },
            service: { name: booking.service?.name || "Unknown Service" },
            startTime: booking.startTime,
            duration: booking.duration,
            paymentOption: booking.paymentOption,
            amountPaid: booking.amountPaid,
            status: booking.status,
            customerInfo: {
              name: booking.customerInfo.name || "N/A",
              email: booking.customerInfo.email || "N/A",
              phone: booking.customerInfo.phone || "N/A",
              notes: booking.customerInfo.notes || "N/A",
            },
            createdAt: booking.createdAt,
          })
        );
        console.log("Mapped appointments:", mappedAppointments);
        setAppointments(mappedAppointments);
        toast({
          title: "Appointments Loaded",
          description: `Found ${mappedAppointments.length} appointment(s)`,
        });
      } else {
        console.error("Appointments API error:", data);
        toast({
          title: "Error",
          description:
            data.message || data.error || "Failed to fetch appointments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch appointments";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [salonId]);

  const fetchNotifications = useCallback(async () => {
    if (!salonId) {
      console.error("salonId is not provided, cannot fetch notifications");
      return;
    }
    try {
      const response = await fetch(`/api/notifications?userId=${salonId}`);
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data: Notification[] = await response.json();
      setNotifications(data);
      console.log("Fetched notifications for salonId:", salonId, data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    }
  }, [salonId]);

  // After fetchNotifications: the deps array is evaluated during render.
  useEffect(() => {
    if (salonId) {
      fetchAppointments();
      fetchNotifications();
    }
  }, [salonId, fetchAppointments, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      console.log("Marked notification as read for:", notificationId);
      toast({
        title: "Notification Marked as Read",
        description: "The notification has been marked as read.",
      });
    } catch (error) {
      console.error("Error marking as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: "pending" | "confirmed" | "cancelled" | "completed"
  ) => {
    try {
      console.log(
        `Updating status for appointment ${appointmentId} to ${newStatus}`
      );
      const response = await fetch(`/api/bookings/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: appointmentId, status: newStatus }),
      });

      const data = await response.json();
      if (response.ok) {
        setAppointments(
          appointments.map((appointment) =>
            appointment._id === appointmentId
              ? { ...appointment, status: newStatus }
              : appointment
          )
        );

        let toastTitle = "";
        let toastDescription = "";
        switch (newStatus) {
          case "confirmed":
            toastTitle = "Appointment Approved";
            toastDescription =
              "The appointment has been successfully confirmed.";
            break;
          case "cancelled":
            toastTitle = "Appointment Cancelled";
            toastDescription = "The appointment has been cancelled.";
            break;
          case "completed":
            toastTitle = "Appointment Completed";
            toastDescription = "The appointment has been marked as completed.";
            break;
          default:
            toastTitle = "Status Updated";
            toastDescription = `Appointment status changed to ${newStatus}.`;
        }

        toast({
          title: toastTitle,
          description: toastDescription,
        });

        const appointment = appointments.find((a) => a._id === appointmentId);
        if (appointment) {
          console.log(
            `Sending email notification for appointment ${appointmentId}`
          );
          const emailResponse = await fetch(`/api/notifications/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: appointment.customerInfo.email,
              subject: `Booking Status Updated to ${newStatus}`,
              message: `Your booking for ${
                appointment.service.name
              } on ${format(
                new Date(appointment.startTime),
                "dd MMM yyyy h:mm a"
              )} has been ${newStatus}.`,
              fromName: appointment.salon.salonName,
            }),
          });

          const emailData = await emailResponse.json();
          if (emailResponse.ok) {
            toast({
              title: "Email Notification Sent",
              description: `Customer has been notified about the ${newStatus} status.`,
            });
          } else {
            toast({
              title: "Email Notification Failed",
              description:
                emailData.message ||
                emailData.error ||
                "Failed to send email notification to customer",
              variant: "destructive",
            });
          }
        }
      } else {
        console.error("Status update error:", data);
        toast({
          title: "Error",
          description:
            data.message || data.error || "Failed to update appointment status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update appointment status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleMarkSlotAvailable = async (appointmentId: string) => {
    try {
      const appointment = appointments.find((a) => a._id === appointmentId);
      if (!appointment) {
        toast({
          title: "Error",
          description: "Appointment not found",
          variant: "destructive",
        });
        return;
      }

      console.log(`Marking slot available for appointment ${appointmentId}`);
      const response = await fetch(`/api/timeslots/mark-available`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonId,
          startTime: appointment.startTime,
          duration: appointment.duration,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Slot Available",
          description:
            "The time slot has been successfully marked as available.",
        });
      } else {
        console.error("Error marking slot available:", data);
        toast({
          title: "Error",
          description:
            data.message || data.error || "Failed to mark slot as available",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error marking slot as available:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to mark slot as available";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter !== "all" && appointment.status !== filter) return false;
    if (
      searchTerm &&
      !appointment.customerInfo.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      !appointment.service.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    const today = new Date();
    const appointmentDate = new Date(appointment.startTime);
    if (
      dateFilter === "today" &&
      !(
        appointmentDate.getDate() === today.getDate() &&
        appointmentDate.getMonth() === today.getMonth() &&
        appointmentDate.getFullYear() === today.getFullYear()
      )
    )
      return false;
    if (dateFilter === "thisWeek") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(today);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      if (!(appointmentDate >= startOfWeek && appointmentDate <= endOfWeek))
        return false;
    }
    if (
      dateFilter === "thisMonth" &&
      !(
        appointmentDate.getMonth() === today.getMonth() &&
        appointmentDate.getFullYear() === today.getFullYear()
      )
    )
      return false;
    return true;
  });

  const handleAddAppointment = (newAppointment: Appointment) => {
    console.log("Adding new appointment:", newAppointment);
    setAppointments([newAppointment, ...appointments]);
    toast({
      title: "Appointment Added",
      description: "New appointment has been successfully created.",
    });
  };

  return (
    <DashboardLayout title="Appointments">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className={
                  filter === "all" ? "bg-pink-600 hover:bg-pink-700" : ""
                }
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
                className={
                  filter === "pending" ? "bg-pink-600 hover:bg-pink-700" : ""
                }
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={filter === "confirmed" ? "default" : "outline"}
                onClick={() => setFilter("confirmed")}
                className={
                  filter === "confirmed" ? "bg-pink-600 hover:bg-pink-700" : ""
                }
                size="sm"
              >
                Confirmed
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                onClick={() => setFilter("completed")}
                className={
                  filter === "completed" ? "bg-pink-600 hover:bg-pink-700" : ""
                }
                size="sm"
              >
                Completed
              </Button>
              <Button
                variant={filter === "cancelled" ? "default" : "outline"}
                onClick={() => setFilter("cancelled")}
                className={
                  filter === "cancelled" ? "bg-pink-600 hover:bg-pink-700" : ""
                }
                size="sm"
              >
                Cancelled
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-pink-600 hover:bg-pink-700"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={16} className="mr-2" />
                New Appointment
              </Button>
              <Button
                className="bg-pink-600 hover:bg-pink-700"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell size={16} className="mr-2" />
                Notifications
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                placeholder="Search by customer or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={dateFilter === "all" ? "default" : "outline"}
                onClick={() => setDateFilter("all")}
                className={
                  dateFilter === "all" ? "bg-pink-600 hover:bg-pink-700" : ""
                }
                size="sm"
              >
                <Calendar size={16} className="mr-1" /> All Dates
              </Button>
              <Button
                variant={dateFilter === "today" ? "default" : "outline"}
                onClick={() => setDateFilter("today")}
                className={
                  dateFilter === "today" ? "bg-pink-600 hover:bg-pink-700" : ""
                }
                size="sm"
              >
                Today
              </Button>
              <Button
                variant={dateFilter === "thisWeek" ? "default" : "outline"}
                onClick={() => setDateFilter("thisWeek")}
                className={
                  dateFilter === "thisWeek"
                    ? "bg-pink-600 hover:bg-pink-700"
                    : ""
                }
                size="sm"
              >
                This Week
              </Button>
              <Button
                variant={dateFilter === "thisMonth" ? "default" : "outline"}
                onClick={() => setDateFilter("thisMonth")}
                className={
                  dateFilter === "thisMonth"
                    ? "bg-pink-600 hover:bg-pink-700"
                    : ""
                }
                size="sm"
              >
                This Month
              </Button>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Booked On
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User size={14} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {appointment.customerInfo.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.customerInfo.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{appointment.service.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {appointment.duration} min
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {appointment.paymentOption}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-1 text-xs rounded-full capitalize",
                          getStatusColor(appointment.status)
                        )}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p>
                          {format(
                            new Date(appointment.createdAt),
                            "dd MMM yyyy"
                          )}
                        </p>
                        <p className="text-gray-500">
                          {format(new Date(appointment.createdAt), "h:mm a")}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button
                          className="text-pink-600 hover:text-pink-800 transition-colors text-sm font-medium"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          Details
                        </button>
                        {appointment.status === "pending" && (
                          <>
                            <button
                              className="text-green-600 hover:text-green-800 transition-colors text-sm font-medium"
                              onClick={() =>
                                handleStatusChange(appointment._id, "confirmed")
                              }
                            >
                              Approve
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 transition-colors text-sm font-medium"
                              onClick={() =>
                                handleStatusChange(appointment._id, "cancelled")
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {appointment.status === "confirmed" && (
                          <>
                            <button
                              className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                              onClick={() =>
                                handleStatusChange(appointment._id, "completed")
                              }
                            >
                              Complete
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 transition-colors text-sm font-medium"
                              onClick={() =>
                                handleStatusChange(appointment._id, "cancelled")
                              }
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {(appointment.status === "cancelled" ||
                          appointment.status === "completed") && (
                          <button
                            className="text-purple-600 hover:text-purple-800 transition-colors text-sm font-medium"
                            onClick={() =>
                              handleMarkSlotAvailable(appointment._id)
                            }
                          >
                            Mark Slot Available
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">No appointments found</p>
            </div>
          )}
        </div>
      </div>
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white rounded-2xl shadow-2xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-semibold text-gray-800">
              Appointment Details
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6 py-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg text-gray-700 mb-3">
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-600">
                      Name:
                    </span>
                    <span className="text-sm text-gray-800">
                      {selectedAppointment.customerInfo.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-600">
                      Email:
                    </span>
                    <span className="text-sm text-gray-800">
                      {selectedAppointment.customerInfo.email}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-600">
                      Phone:
                    </span>
                    <span className="text-sm text-gray-800">
                      {formatPhoneForDisplay(
                        selectedAppointment.customerInfo.phone
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-600">
                      Notes:
                    </span>
                    <span className="text-sm text-gray-800">
                      {selectedAppointment.customerInfo.notes || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg text-gray-700 mb-3">
                  Service Details
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-600">
                      Service:
                    </span>
                    <span className="text-sm text-gray-800">
                      {selectedAppointment.service.name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-600">
                      Duration:
                    </span>
                    <span className="text-sm text-gray-800">
                      {selectedAppointment.duration} minutes
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-600">
                      Amount Paid:
                    </span>
                    <span className="text-sm text-gray-800">
                      PKR {selectedAppointment.amountPaid.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-600">
                      Payment:
                    </span>
                    <span className="text-sm text-gray-800 capitalize">
                      {selectedAppointment.paymentOption}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg text-gray-700 mb-3">
                  Appointment Details
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-600">
                      Date:
                    </span>
                    <span className="text-sm text-gray-800">
                      {format(
                        new Date(selectedAppointment.startTime),
                        "dd MMM yyyy"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-600">
                      Time:
                    </span>
                    <span className="text-sm text-gray-800">
                      {format(
                        new Date(selectedAppointment.startTime),
                        "h:mm a"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-600">
                      Status:
                    </span>
                    <span
                      className={cn(
                        "text-sm capitalize px-2 py-1 rounded-full",
                        getStatusColor(selectedAppointment.status)
                      )}
                    >
                      {selectedAppointment.status}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-600">
                      Booked On:
                    </span>
                    <span className="text-sm text-gray-800">
                      {format(
                        new Date(selectedAppointment.createdAt),
                        "dd MMM yyyy h:mm a"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="border-t pt-4">
            <Button
              className="bg-pink-600 hover:bg-pink-700 text-white"
              onClick={() => setIsDetailsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500">No new notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-2 rounded ${
                    notification.read ? "bg-gray-100" : "bg-blue-50"
                  }`}
                >
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-sm text-gray-600">
                    {notification.content}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(
                      new Date(notification.createdAt),
                      "dd MMM yyyy h:mm a"
                    )}
                  </p>
                  {!notification.read && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => markAsRead(notification._id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsNotificationsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AddAppointment
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddAppointment}
        salonId={salonId}
      />
    </DashboardLayout>
  );
};

export default Appointments;
