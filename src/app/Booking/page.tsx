"use client";

import React from "react";
import "@/app/globals.css";
import "./App.css";
import { Toaster as ShadToaster } from "@/app/Booking/components/ui/toaster";
import { Toaster as Sonner } from "@/app/Booking/components/ui/sonner";
import { TooltipProvider } from "@/app/Booking/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BookAppointment from "@/app/Booking/pages/BookAppointment";

const queryClient = new QueryClient();

export default function BookingPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ShadToaster />
        <Sonner />
        <BookAppointment />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
