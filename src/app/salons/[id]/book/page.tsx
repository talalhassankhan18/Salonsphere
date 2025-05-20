"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, addDays, addMinutes, isBefore } from "date-fns";
import { toast } from "@/app/Booking/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/Booking/components/ui/card";
import { Button } from "@/app/Booking/components/ui/button";
import { Calendar } from "@/app/Booking/components/ui/calendar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Booking/components/ui/tabs";
import { Separator } from "@/app/Booking/components/ui/separator";
import { ArrowLeft, ArrowRight, CalendarIcon, Clock } from "lucide-react";
import { validatePakistaniPhone } from "@/lib/PhoneUtils";

import TimeSlotPicker from "@/app/Booking/components/booking/TimeSlotPicker";
import CustomerForm from "@/app/Booking/components/booking/CustomerForm";

import {
  Service as BookingService,
  TimeSlot as BookingTimeSlot,
} from "@/app/Booking/types/booking";

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

interface BackendTimeSlot {
  _id: string;
  salon: string;
  startTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BackendService {
  _id: string;
  salon: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image?: string;
  gender: "Unisex" | "Female" | "Male";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Salon {
  _id: string;
  userId: string;
  salonName: string;
  scheduling?: {
    appointmentBuffer: number;
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

const mapGender = (
  backendGender: "Unisex" | "Female" | "Male"
): "unisex" | "women" | "men" => {
  switch (backendGender) {
    case "Unisex":
      return "unisex";
    case "Female":
      return "women";
    case "Male":
      return "men";
    default:
      throw new Error(`Unexpected gender value: ${backendGender}`);
  }
};

const BookAppointment: React.FC<Props> = ({ params }) => {
  const { id: salonId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");

  const [selectedTab, setSelectedTab] = useState("datetime");
  const [service, setService] = useState<BookingService | null>(null);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [timeSlots, setTimeSlots] = useState<BookingTimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [paymentOption, setPaymentOption] = useState<"full" | "half" | "cash">(
    "cash"
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [slotDuration, setSlotDuration] = useState<number>(45);

  useEffect(() => {
    const fetchData = async (retryCount = 2): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        if (!salonId || !serviceId) {
          throw new Error("Missing salon or service information");
        }

        const serviceUrl = `/api/services/${serviceId}?salonId=${salonId}`;
        const serviceResponse = await fetch(serviceUrl);
        if (!serviceResponse.ok) {
          const errorData = await serviceResponse.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to fetch service: ${serviceResponse.status}`
          );
        }
        const serviceData: BackendService = await serviceResponse.json();
        const mappedService: BookingService = {
          id: serviceData._id,
          salonId: serviceData.salon,
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          duration: serviceData.duration,
          category: serviceData.category,
          image: serviceData.image,
          gender: mapGender(serviceData.gender),
          isActive: serviceData.isActive,
        };
        setService(mappedService);

        const salonUrl = `/api/salon/${salonId}`;
        const salonResponse = await fetch(salonUrl);
        if (!salonResponse.ok) {
          const errorData = await salonResponse.json().catch(() => ({}));
          if (salonResponse.status === 404) {
            throw new Error(
              `Salon with ID ${salonId} not found. Please select a different salon.`
            );
          }
          throw new Error(
            errorData.message ||
              `Failed to fetch salon: ${salonResponse.status}`
          );
        }
        const salonData: Salon = await salonResponse.json();
        setSalon(salonData);
        setSlotDuration(salonData.scheduling?.appointmentBuffer || 45);

        if (selectedDate) {
          const slotsUrl = `/api/timeslots?salonId=${salonId}&date=${format(
            selectedDate,
            "yyyy-MM-dd"
          )}`;
          const slotsResponse = await fetch(slotsUrl);
          if (!slotsResponse.ok) {
            const errorData = await slotsResponse.json().catch(() => ({}));
            throw new Error(
              errorData.message ||
                `Failed to fetch time slots: ${slotsResponse.status}`
            );
          }
          const slotsData = await slotsResponse.json();

          if (!Array.isArray(slotsData)) {
            setTimeSlots([]);
            toast({
              title: "No Availability",
              description:
                "No time slots available for this date. The salon may be closed.",
              variant: "default",
            });
            return;
          }

          const mappedSlots: BookingTimeSlot[] = slotsData.map(
            (slot: BackendTimeSlot) => ({
              id: slot._id,
              time: format(new Date(slot.startTime), "h:mm a"),
              isAvailable: slot.isAvailable,
              capacityReached: false,
            })
          );
          setTimeSlots(mappedSlots);
          if (mappedSlots.length === 0) {
            toast({
              title: "No Availability",
              description:
                "No time slots available for this date. The salon may be closed.",
              variant: "default",
            });
          }
          setSelectedSlots([]);
        }
      } catch (err: any) {
        console.error("Fetch error:", err.message);
        if (retryCount > 0) {
          return fetchData(retryCount - 1);
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [salonId, serviceId, selectedDate]);

  const handleSlotSelection = (slotId: string) => {
    if (!service || !selectedDate) {
      toast({
        title: "Error",
        description: "Service or date not selected",
        variant: "destructive",
      });
      return;
    }

    const slotsUrl = `/api/timeslots?salonId=${salonId}&date=${format(
      selectedDate,
      "yyyy-MM-dd"
    )}`;
    fetch(slotsUrl)
      .then((res) => res.json())
      .then((backendSlots: BackendTimeSlot[]) => {
        const slotIndex = backendSlots.findIndex((s) => s._id === slotId);
        if (slotIndex === -1) {
          toast({
            title: "Error",
            description: "Invalid slot selection",
            variant: "destructive",
          });
          return;
        }

        const slot = backendSlots[slotIndex];
        const slotDateTime = new Date(slot.startTime);
        if (isBefore(slotDateTime, new Date())) {
          toast({
            title: "Error",
            description: "Cannot select past time slots",
            variant: "destructive",
          });
          return;
        }

        const requiredSlots = Math.ceil(service.duration / slotDuration);
        let allAvailable = true;
        const selectedSlots: BackendTimeSlot[] = [];

        for (let i = 0; i < requiredSlots; i++) {
          const currentSlot = backendSlots[slotIndex + i];
          if (!currentSlot || !currentSlot.isAvailable) {
            allAvailable = false;
            break;
          }
          selectedSlots.push(currentSlot);
        }

        if (allAvailable) {
          for (let i = 0; i < selectedSlots.length - 1; i++) {
            const currentTime = new Date(selectedSlots[i].startTime);
            const nextTime = new Date(selectedSlots[i + 1].startTime);
            const expectedNextTime = addMinutes(currentTime, slotDuration);
            if (nextTime.getTime() !== expectedNextTime.getTime()) {
              allAvailable = false;
              break;
            }
          }
        }

        if (allAvailable) {
          const selectedSlotTimes = selectedSlots.map((s) => s.startTime);
          setSelectedSlots(selectedSlotTimes);
          toast({
            title: "Slots Selected",
            description: `Selected ${requiredSlots} slots starting at ${format(
              slotDateTime,
              "h:mm a"
            )}`,
            variant: "default",
          });
        } else {
          toast({
            title: "Error",
            description: `Not enough consecutive slots available. Need ${requiredSlots} slots for ${service.duration} minutes.`,
            variant: "destructive",
          });
          setSelectedSlots([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching slots for selection:", err);
        toast({
          title: "Error",
          description: "Failed to validate slot selection",
          variant: "destructive",
        });
      });
  };

  const handleSubmit = async (formData: CustomerInfo) => {
    if (!service || !selectedSlots.length || !salon) {
      toast({
        title: "Booking Error",
        description: "Please select time slots and provide all details",
        variant: "destructive",
      });
      return;
    }

    if (formData.phone && !validatePakistaniPhone(formData.phone)) {
      toast({
        title: "Invalid Phone Number",
        description:
          "Please enter a valid Pakistani phone number (e.g., 03335759985, +923335759985, or 3335759985)",
        variant: "destructive",
      });
      return;
    }

    try {
      const bookingData = {
        salonId,
        serviceId,
        startTime: selectedSlots[0],
        duration: service.duration,
        paymentOption,
        amountPaid:
          paymentOption === "full"
            ? service.price
            : paymentOption === "half"
            ? service.price / 2
            : 0,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          notes: formData.notes || undefined,
        },
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        toast({
          title: "Booking Submitted",
          description:
            "Your appointment has been forwarded. Please wait for approval.",
          variant: "default",
        });

        const userMessage = `Your booking for ${service.name} at ${
          salon.salonName
        } on ${format(
          new Date(selectedSlots[0]),
          "EEEE, MMMM d, yyyy h:mm a"
        )} has been submitted. Please wait for approval.`;
        await fetch("/api/notifications/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            subject: "Booking Request Submitted",
            message: userMessage,
          }),
        });

        const adminMessage = `New booking for ${service.name} at ${format(
          new Date(selectedSlots[0]),
          "EEEE, MMMM d, yyyy h:mm a"
        )} by ${formData.name} (${formData.email}) awaits approval.`;
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "New Booking",
            content: adminMessage,
            type: "booking",
            target: "salonAdmin",
            salonId,
            status: "sent",
          }),
        });

        router.push(`/bookings?email=${encodeURIComponent(formData.email)}`);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to submit booking";
        if (errorMessage.includes("phone number")) {
          toast({
            title: "Invalid Phone Number",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Booking Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      console.error("Booking error:", err.message);
      toast({
        title: "Booking Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const goToNextStep = () => {
    if (selectedTab === "datetime" && selectedDate && selectedSlots.length) {
      setSelectedTab("details");
    }
  };

  const goToPreviousStep = () => {
    if (selectedTab === "details") {
      setSelectedTab("datetime");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        {error}
        <div className="mt-4">
          <Button onClick={() => router.push("/salons")} variant="outline">
            Go Back to Salons
          </Button>
        </div>
      </div>
    );
  }

  if (!service || !salon) {
    return (
      <div className="container mx-auto py-10 text-center">
        Service or Salon not found
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button
        variant="ghost"
        className="mb-6 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </Button>

      <Card className="border border-muted shadow-lg rounded-xl">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-xl">
          <CardTitle className="text-2xl md:text-3xl font-semibold">
            Book Your Appointment
          </CardTitle>
          <CardDescription className="text-white/90 text-base">
            Schedule your {service.name} at {salon.salonName}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-2 mb-8 rounded-lg bg-muted/30 p-1">
              <TabsTrigger
                value="datetime"
                className="py-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200"
              >
                1. Date & Time
              </TabsTrigger>
              <TabsTrigger
                value="details"
                disabled={!selectedDate || !selectedSlots.length}
                className="py-3 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                2. Your Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="datetime" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <CalendarIcon size={20} className="mr-2 text-primary" />
                    Select Date
                  </h3>
                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return (
                          date < today ||
                          date > addDays(today, 30) ||
                          date.getDay() === 0
                        );
                      }}
                      className="rounded-md"
                      classNames={{
                        day_selected:
                          "bg-primary text-white hover:bg-primary/90",
                        day_today: "border border-primary/50",
                        day_disabled: "text-gray-400 opacity-50",
                        day: "hover:bg-gray-100 rounded-full transition-colors duration-150",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <Clock size={20} className="mr-2 text-primary" />
                    Available Times
                  </h3>
                  {selectedDate ? (
                    <>
                      <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-md">
                        Selected date:{" "}
                        <span className="font-medium">
                          {format(selectedDate, "EEEE, MMMM d, yyyy")}
                        </span>
                      </p>
                      {timeSlots.length === 0 ? (
                        <p className="text-gray-500">
                          No slots available for this date. Try another date.
                        </p>
                      ) : (
                        <TimeSlotPicker
                          slots={timeSlots}
                          selectedSlots={selectedSlots}
                          onSelectSlot={handleSlotSelection}
                          requiredSlots={Math.ceil(
                            service.duration / slotDuration
                          )}
                        />
                      )}
                      <p className="text-sm text-gray-600 mt-4">
                        This service requires {service.duration} minutes (
                        {Math.ceil(service.duration / slotDuration)} slots of{" "}
                        {slotDuration} minutes each)
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">Please select a date first</p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={goToNextStep}
                  disabled={!selectedDate || !selectedSlots.length}
                  className="bg-primary hover:bg-primary/90 transition-colors duration-200 px-6 py-2 rounded-md"
                >
                  Continue to Your Details
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="details" className="animate-fade-in">
              {salon && service && selectedDate && selectedSlots.length && (
                <>
                  <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-800 mb-4">
                      Appointment Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Salon</p>
                        <p className="font-medium text-gray-800">
                          {salon.salonName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="font-medium text-gray-800">
                          {service.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium text-gray-800">
                          {format(selectedDate, "EEEE, MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Time Slots</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedSlots.map((slotTime, index) => (
                          <span
                            key={index}
                            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {format(new Date(slotTime), "h:mm a")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Payment Options
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-6">
                      <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-150">
                        <input
                          type="radio"
                          value="full"
                          checked={paymentOption === "full"}
                          onChange={() => setPaymentOption("full")}
                          className="text-primary focus:ring-primary h-5 w-5"
                        />
                        <span className="text-gray-800">
                          Full Payment (PKR {service.price.toFixed(2)})
                        </span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-150">
                        <input
                          type="radio"
                          value="half"
                          checked={paymentOption === "half"}
                          onChange={() => setPaymentOption("half")}
                          className="text-primary focus:ring-primary h-5 w-5"
                        />
                        <span className="text-gray-800">
                          Half Payment (PKR {(service.price / 2).toFixed(2)})
                        </span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-150">
                        <input
                          type="radio"
                          value="cash"
                          checked={paymentOption === "cash"}
                          onChange={() => setPaymentOption("cash")}
                          className="text-primary focus:ring-primary h-5 w-5"
                        />
                        <span className="text-gray-800">Cash on Service</span>
                      </label>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  <div className="mt-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-4">
                      Enter Your Details
                    </h3>
                    <CustomerForm
                      selectedService={service}
                      selectedDate={selectedDate}
                      selectedTimeSlot={selectedSlots[0]}
                      onSubmit={handleSubmit}
                    />
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={goToPreviousStep}
                      className="border-gray-300 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <ArrowLeft size={16} className="mr-2" />
                      Back to Date & Time
                    </Button>
                   
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookAppointment;
