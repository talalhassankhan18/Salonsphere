"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Booking/components/ui/table";
import { Input } from "@/app/Booking/components/ui/input";
import { Button } from "@/app/Booking/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/Booking/components/ui/card";
import { Badge } from "@/app/Booking/components/ui/badge"; // Assuming Badge is part of the UI library
import { toast } from "@/app/Booking/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

interface Booking {
  _id: string;
  salonName: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  paymentOption: "full" | "half" | "cash";
  amountPaid: number;
  status: "pending" | "confirmed" | "cancelled";
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  createdAt: string;
}

// Utility to format Pakistani phone number
const formatPakistaniPhone = (phone: string): string => {
  if (!phone || phone === "N/A") return "N/A";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 10) return phone;
  const countryCode = cleaned.startsWith("92") ? "+92" : "+92";
  const number = cleaned.startsWith("92") ? cleaned.slice(2) : cleaned;
  return `${countryCode} ${number.slice(0, 3)} ${number.slice(3)}`;
};

const BookingsPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      handleEmailSubmit(emailParam);
    }
  }, [searchParams]);

  const handleEmailSubmit = async (emailInput: string | React.FormEvent) => {
    let emailToFetch: string;
    if (typeof emailInput === "string") {
      emailToFetch = emailInput;
    } else {
      emailInput.preventDefault();
      emailToFetch = email;
    }

    if (!emailToFetch) {
      setError("Please enter an email address");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setBookings([]);

    try {
      const response = await fetch(
        `/api/bookings/guest?email=${encodeURIComponent(emailToFetch)}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch bookings");
      }

      const { bookings } = await response.json();
      if (bookings.length === 0) {
        setError("No bookings found for this email");
      } else {
        setBookings(bookings);
        toast({
          title: "Bookings Loaded",
          description: `Found ${bookings.length} booking(s) for ${emailToFetch}`,
          variant: "default",
        });
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err.message);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel booking");
      }

      await handleEmailSubmit(email);
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled.",
        variant: "default",
      });
    } catch (err: any) {
      console.error("Error cancelling booking:", err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Utility to map status to valid Badge variants
  const getStatusVariant = (
    status: Booking["status"]
  ): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case "pending":
        return "outline"; // Use outline for pending (can be styled with yellow)
      case "confirmed":
        return "default"; // Use default for confirmed (can be styled with green)
      case "cancelled":
        return "destructive"; // Use destructive for cancelled (red)
      default:
        return "default";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <Button
        variant="ghost"
        className="mb-6 flex items-center gap-2 text-primary hover:text-primary/80"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </Button>

      <Card className="border border-muted shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-lg">
          <CardTitle className="text-2xl md:text-3xl">Your Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form
            onSubmit={(e) => handleEmailSubmit(e)}
            className="mb-8 flex flex-col sm:flex-row gap-4 items-center"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-md border border-muted focus:ring-2 focus:ring-primary"
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 transition-colors duration-200 px-6"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "View Bookings"
              )}
            </Button>
          </form>

          {error && (
            <div className="mb-6 text-red-500 text-center font-medium">
              {error}
            </div>
          )}

          {loading && !error && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {bookings.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="py-3">Salon</TableHead>
                    <TableHead className="py-3">Service</TableHead>
                    <TableHead className="py-3">Date</TableHead>
                    <TableHead className="py-3">Time</TableHead>
                    <TableHead className="py-3">Duration</TableHead>
                    <TableHead className="py-3">Payment</TableHead>
                    <TableHead className="py-3">Amount Paid</TableHead>
                    <TableHead className="py-3">Status</TableHead>
                    <TableHead className="py-3">Name</TableHead>
                    <TableHead className="py-3">Email</TableHead>
                    <TableHead className="py-3">Phone</TableHead>
                    <TableHead className="py-3">Notes</TableHead>
                    <TableHead className="py-3">Booked On</TableHead>
                    <TableHead className="py-3">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow
                      key={booking._id}
                      className="hover:bg-muted/20 transition-colors duration-150"
                    >
                      <TableCell className="py-4">
                        {booking.salonName}
                      </TableCell>
                      <TableCell className="py-4">
                        {booking.serviceName}
                      </TableCell>
                      <TableCell className="py-4">{booking.date}</TableCell>
                      <TableCell className="py-4">{booking.time}</TableCell>
                      <TableCell className="py-4">
                        {booking.duration} min
                      </TableCell>
                      <TableCell className="py-4">
                        {booking.paymentOption}
                      </TableCell>
                      <TableCell className="py-4">
                        PKR {booking.amountPaid.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant={getStatusVariant(booking.status)}
                          className="capitalize"
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        {booking.customerInfo.name}
                      </TableCell>
                      <TableCell className="py-4">
                        {booking.customerInfo.email}
                      </TableCell>
                      <TableCell className="py-4">
                        {formatPakistaniPhone(booking.customerInfo.phone)}
                      </TableCell>
                      <TableCell className="py-4 max-w-xs truncate">
                        {booking.customerInfo.notes}
                      </TableCell>
                      <TableCell className="py-4">
                        {booking.createdAt}
                      </TableCell>
                      <TableCell className="py-4">
                        {booking.status !== "cancelled" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={loading}
                            className="hover:bg-red-700 transition-colors duration-200"
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// useSearchParams() must sit under a Suspense boundary for static prerendering.
const BookingsPage = () => (
  <Suspense fallback={null}>
    <BookingsPageContent />
  </Suspense>
);

export default BookingsPage;
