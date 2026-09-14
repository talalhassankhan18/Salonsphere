
"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { toast } from "../../hooks/use-toast";

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

interface AddAppointmentProps {
  open: boolean;
  onClose: () => void;
  onSave: (newAppointment: Appointment) => void;
  salonId: string;
}

const AddAppointment: React.FC<AddAppointmentProps> = ({
  open,
  onClose,
  onSave,
  salonId,
}) => {
  const [formData, setFormData] = useState({
    serviceName: "",
    customerName: "",
    email: "",
    phone: "",
    startTime: "",
    duration: 30,
    paymentOption: "cash" as "full" | "half" | "cash",
    amountPaid: 0,
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salonId,
          serviceId: "placeholder-service-id", // Replace with actual service ID logic
          startTime: formData.startTime,
          duration: formData.duration,
          paymentOption: formData.paymentOption,
          amountPaid: formData.amountPaid,
          customerInfo: {
            name: formData.customerName,
            email: formData.email,
            phone: formData.phone,
            notes: "",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create appointment");
      }

      const newAppointment: Appointment = await response.json();
      onSave(newAppointment);
      onClose();
      toast({
        title: "Appointment Created",
        description: "The new appointment has been successfully created.",
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create appointment",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Service Name"
            value={formData.serviceName}
            onChange={(e) =>
              setFormData({ ...formData, serviceName: e.target.value })
            }
          />
          <Input
            placeholder="Customer Name"
            value={formData.customerName}
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
          />
          <Input
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <Input
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
          <Input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
          />
          <Input
            type="number"
            placeholder="Duration (minutes)"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: parseInt(e.target.value) })
            }
          />
          <select
            value={formData.paymentOption}
            onChange={(e) =>
              setFormData({
                ...formData,
                paymentOption: e.target.value as "full" | "half" | "cash",
              })
            }
          >
            <option value="full">Full Payment</option>
            <option value="half">Half Payment</option>
            <option value="cash">Cash on Service</option>
          </select>
          <Input
            type="number"
            placeholder="Amount Paid"
            value={formData.amountPaid}
            onChange={(e) =>
              setFormData({ ...formData, amountPaid: parseFloat(e.target.value) })
            }
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAppointment;
