import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/Booking/components/ui/form";
import { Input } from "@/app/Booking/components/ui/input";
import { Textarea } from "@/app/Booking/components/ui/textarea";
import { Button } from "@/app/Booking/components/ui/button";
import { Service } from "@/app/Booking/types/booking";
import { toast } from "@/app/Booking/hooks/use-toast";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CustomerFormProps {
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  onSubmit: (data: FormData) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  selectedService,
  selectedDate,
  selectedTimeSlot,
  onSubmit,
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) {
      toast({
        title: "Incomplete booking information",
        description: "Please select a service, date, and time slot.",
        variant: "destructive",
      });
      return;
    }
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="(123) 456-7890" {...field} />
              </FormControl>
              <FormDescription>
                We'll send appointment reminders to this number.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Instructions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any specific requests or information we should know?"
                  className="h-24 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={!selectedService || !selectedDate || !selectedTimeSlot}
        >
          Complete Booking
        </Button>
      </form>
    </Form>
  );
};

export default CustomerForm;
