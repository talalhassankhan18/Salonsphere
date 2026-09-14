"use client";

import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { toast } from "@/app/Booking/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  Clock,
  Store,
} from "lucide-react";

// Import components
import ServiceCard from "@/app/Booking/components/booking/ServiceCard";
import TimeSlotPicker from "@/app/Booking/components/booking/TimeSlotPicker";
import ServiceReviews from "@/app/Booking/components/booking/ServiceReviews";
import CustomerForm from "@/app/Booking/components/booking/CustomerForm";
import SalonCard from "@/app/Booking/components/booking/SalonCard";

// Import data and types
import { Service, TimeSlot, Review, Salon } from "@/app/Booking/types/booking";
import {
  services,
  reviews,
  generateTimeSlots,
  salons,
  getServicesBySalon,
} from "@/app/Booking/data/salonData";

const BookAppointment: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("salons");
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [serviceReviews, setServiceReviews] = useState<Review[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Handle date change - regenerate time slots
  useEffect(() => {
    if (selectedDate) {
      setSelectedTimeSlots([]);
      setTimeSlots(generateTimeSlots(selectedDate));
    }
  }, [selectedDate]);

  // Filter reviews when service is selected
  useEffect(() => {
    if (selectedService) {
      const filteredReviews = reviews.filter(
        (review) => review.serviceId === selectedService.id
      );
      setServiceReviews(filteredReviews);
    } else {
      setServiceReviews([]);
    }
  }, [selectedService]);

  // Filter services when salon is selected
  useEffect(() => {
    if (selectedSalon) {
      const services = getServicesBySalon(selectedSalon.id);
      setFilteredServices(services);
    }
  }, [selectedSalon]);

  // Handle salon selection
  const handleSalonSelect = (salonId: string) => {
    const salon = salons.find((s) => s.id === salonId);
    setSelectedSalon(salon || null);
    setSelectedService(null);
    setSelectedTimeSlots([]);
  };

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    const service = filteredServices.find((s) => s.id === serviceId);
    setSelectedService(service || null);
    setSelectedTimeSlots([]);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlots((prev) => {
      // If slot is already selected, remove it
      if (prev.includes(slotId)) {
        return prev.filter((id) => id !== slotId);
      }

      // If we've already selected enough slots, replace the last one
      if (selectedService && prev.length >= getRequiredSlots()) {
        return [...prev.slice(0, -1), slotId];
      }

      // Otherwise add the new slot
      return [...prev, slotId];
    });
  };

  // Calculate how many time slots are required based on service duration
  const getRequiredSlots = (): number => {
    if (!selectedService) return 1;

    // Each slot is 15 minutes, calculate how many slots we need
    const slotsNeeded = Math.ceil(selectedService.duration / 15);
    return slotsNeeded;
  };

  // Handle form submission
  const handleSubmit = (formData: any) => {
    if (
      !selectedSalon ||
      !selectedService ||
      !selectedDate ||
      selectedTimeSlots.length < getRequiredSlots()
    ) {
      toast({
        title: "Booking Error",
        description: "Please complete all booking details",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would send data to the backend
    console.log("Booking submitted:", {
      salon: selectedSalon,
      service: selectedService,
      date: selectedDate,
      timeSlots: selectedTimeSlots,
      customerInfo: formData,
    });

    toast({
      title: "Booking Confirmed!",
      description: `Your ${selectedService.name} appointment has been scheduled.`,
      variant: "default", // Using "default" as per the allowed variants
    });

    // Reset form
    setSelectedSalon(null);
    setSelectedService(null);
    setSelectedDate(new Date());
    setSelectedTimeSlots([]);
    setSelectedTab("salons");
  };

  // Navigation between steps
  const goToNextStep = () => {
    if (selectedTab === "salons" && selectedSalon) {
      setSelectedTab("services");
    } else if (selectedTab === "services" && selectedService) {
      setSelectedTab("datetime");
    } else if (
      selectedTab === "datetime" &&
      selectedDate &&
      selectedTimeSlots.length >= getRequiredSlots()
    ) {
      setSelectedTab("details");
    }
  };

  const goToPreviousStep = () => {
    if (selectedTab === "details") {
      setSelectedTab("datetime");
    } else if (selectedTab === "datetime") {
      setSelectedTab("services");
    } else if (selectedTab === "services") {
      setSelectedTab("salons");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-8xl">
      <Card className="border border-muted">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <CardTitle className="text-2xl md:text-3xl">
            Book Your Appointment
          </CardTitle>
          <CardDescription className="text-white/80">
            Schedule your next salon experience with us
          </CardDescription>
        </CardHeader>
        <CardContent className="p-12 mx-12">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="salons">1. Select Salon</TabsTrigger>
              <TabsTrigger value="services" disabled={!selectedSalon}>
                2. Select Service
              </TabsTrigger>
              <TabsTrigger value="datetime" disabled={!selectedService}>
                3. Date & Time
              </TabsTrigger>
              <TabsTrigger
                value="details"
                disabled={
                  !selectedService ||
                  !selectedDate ||
                  selectedTimeSlots.length < getRequiredSlots()
                }
              >
                4. Your Details
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="salons"
              className="mt-4 space-y-6 animate-fade-in"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {salons.map((salon) => (
                  <SalonCard
                    key={salon.id}
                    salon={salon}
                    isSelected={selectedSalon?.id === salon.id}
                    onClick={handleSalonSelect}
                  />
                ))}
              </div>

              {selectedSalon && (
                <div className="mt-6">
                  <Button
                    onClick={goToNextStep}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Continue to Select Service
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="services"
              className="mt-4 space-y-6 animate-fade-in"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected={selectedService?.id === service.id}
                    onClick={handleServiceSelect}
                  />
                ))}
              </div>

              {selectedService && (
                <div className="mt-6">
                  <Button
                    onClick={goToNextStep}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Continue to Select Date & Time
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              )}

              {selectedService && (
                <ServiceReviews
                  reviews={serviceReviews}
                  serviceName={selectedService.name}
                />
              )}
            </TabsContent>

            <TabsContent value="datetime" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <CalendarIcon size={18} className="mr-2" />
                    Select Date
                  </h3>
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
                        date.getDay() === 0 // Sundays closed
                      );
                    }}
                    className="rounded-md border p-4 shadow-sm"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <Clock size={18} className="mr-2" />
                    Available Times
                  </h3>
                  {selectedDate ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-3">
                        Selected date:{" "}
                        {format(selectedDate, "EEEE, MMMM d, yyyy")}
                      </p>
                      <TimeSlotPicker
                        slots={timeSlots}
                        selectedSlots={selectedTimeSlots}
                        onSelectSlot={handleTimeSlotSelect}
                        requiredSlots={getRequiredSlots()}
                      />
                      {selectedService && (
                        <p className="text-sm text-muted-foreground mt-3">
                          This service requires {selectedService.duration}{" "}
                          minutes ({getRequiredSlots()} slots of 15 minutes
                          each)
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      Please select a date first
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={goToPreviousStep}>
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Services
                </Button>

                <Button
                  onClick={goToNextStep}
                  disabled={
                    !selectedDate ||
                    selectedTimeSlots.length < getRequiredSlots()
                  }
                  className="bg-primary hover:bg-primary/90"
                >
                  Continue to Your Details
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="details" className="animate-fade-in">
              {selectedSalon &&
                selectedService &&
                selectedDate &&
                selectedTimeSlots.length >= getRequiredSlots() && (
                  <>
                    <div className="bg-muted p-4 rounded-lg mb-6">
                      <h3 className="font-medium text-lg">
                        Appointment Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Salon</p>
                          <p className="font-medium">{selectedSalon.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Service
                          </p>
                          <p className="font-medium">{selectedService.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {format(selectedDate, "EEEE, MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          Time Slots
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedTimeSlots.map((slotId) => {
                            const slot = timeSlots.find((s) => s.id === slotId);
                            return slot ? (
                              <span
                                key={slotId}
                                className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                              >
                                {slot.time}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="mt-6">
                      <h3 className="font-medium text-lg mb-4">
                        Enter Your Details
                      </h3>
                      <CustomerForm
                        selectedService={selectedService}
                        selectedDate={selectedDate}
                        selectedTimeSlot={selectedTimeSlots[0]} // For backward compatibility
                        onSubmit={handleSubmit}
                      />
                    </div>

                    <div className="mt-8">
                      <Button variant="outline" onClick={goToPreviousStep}>
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
