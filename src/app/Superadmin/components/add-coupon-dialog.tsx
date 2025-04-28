"use client";

import { useState } from "react";
import { useToast } from "@/app/Superadmin/hooks/use-toast";
import { Button } from "@/app/Superadmin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/Superadmin/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/Superadmin/components/ui/form";
import { Input } from "@/app/Superadmin/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Superadmin/components/ui/select";
import { Switch } from "@/app/Superadmin/components/ui/switch";
import { Calendar } from "@/app/Superadmin/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/Superadmin/components/ui/popover";
import { CalendarIcon, Percent, Plus, Tags } from "lucide-react";
import { format } from "date-fns";

export function AddCouponDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Coupon created",
      description: "The coupon has been created successfully.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Coupon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Coupon</DialogTitle>
          <DialogDescription>
            Create a new discount coupon for your products or services
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Coupon Code</FormLabel>
              <FormControl>
                <div className="relative">
                  <Tags className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input placeholder="e.g., SUMMER25" className="pl-9" />
                </div>
              </FormControl>
              <FormDescription>Enter a unique coupon code</FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Discount Type</FormLabel>
              <Select>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="free_shipping">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Discount Value</FormLabel>
              <FormControl>
                <div className="relative">
                  <Percent className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="e.g., 25"
                    className="pl-9"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Enter the discount percentage or amount
              </FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Minimum Purchase</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    placeholder="e.g., 50"
                    className="pl-8"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Minimum order amount required (optional)
              </FormDescription>
            </FormItem>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="w-full pl-3 text-left font-normal flex justify-between"
                    >
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>

            <FormItem>
              <FormLabel>End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="w-full pl-3 text-left font-normal flex justify-between"
                    >
                      {endDate ? (
                        format(endDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) =>
                      date < new Date() ||
                      (startDate ? date < startDate : false)
                    }
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          </div>

          <FormItem>
            <FormLabel>Apply To</FormLabel>
            <Select>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select application scope" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="categories">Specific Categories</SelectItem>
                <SelectItem value="products">Specific Products</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>

          <FormItem>
            <FormLabel>Usage Limit</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormControl>
                  <Input type="number" placeholder="Total usage limit" />
                </FormControl>
                <FormDescription className="text-xs">
                  Maximum number of times this coupon can be used
                </FormDescription>
              </div>
              <div>
                <FormControl>
                  <Input type="number" placeholder="Per customer limit" />
                </FormControl>
                <FormDescription className="text-xs">
                  Usage limit per customer
                </FormDescription>
              </div>
            </div>
          </FormItem>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Active Coupon</FormLabel>
              <FormDescription>
                Enable to make this coupon available for use
              </FormDescription>
            </div>
            <Switch defaultChecked />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Coupon</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
