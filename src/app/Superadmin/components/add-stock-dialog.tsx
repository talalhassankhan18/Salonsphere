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
import { Textarea } from "@/app/Superadmin/components/ui/textarea";
import { Package, Plus, Warehouse } from "lucide-react";

export function AddStockDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Stock added",
      description: "The product stock has been updated successfully.",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Product Stock</DialogTitle>
          <DialogDescription>
            Update inventory by adding stock to existing products
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <FormItem>
            <FormLabel>Product</FormLabel>
            <Select>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="shampoo">Shampoo Premium</SelectItem>
                <SelectItem value="styling">Styling Gel Extra Hold</SelectItem>
                <SelectItem value="serum">Hair Serum Repair</SelectItem>
                <SelectItem value="curling">
                  Curling Iron Professional
                </SelectItem>
                <SelectItem value="beard">Beard Oil Sandalwood</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Select the product you want to add stock for
            </FormDescription>
          </FormItem>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder="Enter quantity" />
              </FormControl>
              <FormDescription>Number of units to add</FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Warehouse</FormLabel>
              <Select>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="main">Main Warehouse</SelectItem>
                  <SelectItem value="equipment">Equipment Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Unit Cost (Rs)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter cost per unit"
                />
              </FormControl>
              <FormDescription>Cost price per unit</FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Batch/Lot Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter batch number" />
              </FormControl>
            </FormItem>
          </div>

          <FormItem>
            <FormLabel>Supplier (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Enter supplier name" />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Notes (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter any additional information..."
                rows={3}
              />
            </FormControl>
          </FormItem>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Package className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
