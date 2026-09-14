"use client";

import { useState } from "react";
import { useToast } from "@/app/Superadmin/dashboard/hooks/use-toast";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/Superadmin/dashboard/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/Superadmin/dashboard/components/ui/form";
import { Input } from "@/app/Superadmin/dashboard/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Superadmin/dashboard/components/ui/select";
import { Switch } from "@/app/Superadmin/dashboard/components/ui/switch";
import { Textarea } from "@/app/Superadmin/dashboard/components/ui/textarea";
import { Image as ImageIcon, Plus, Upload } from "lucide-react";

export function AddBannerDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Banner created",
      description: "The banner has been created successfully.",
    });
    setOpen(false);
    setImagePreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Banner</DialogTitle>
          <DialogDescription>
            Create a new banner for your storefront or promotions
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <FormItem>
            <FormLabel>Banner Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter banner title" />
            </FormControl>
            <FormDescription>
              This title will be used for internal reference
            </FormDescription>
          </FormItem>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Banner Type</FormLabel>
              <Select>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="hero">Hero Banner</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <FormLabel>Target Page</FormLabel>
              <Select>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select page" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="home">Home Page</SelectItem>
                  <SelectItem value="products">Products Page</SelectItem>
                  <SelectItem value="category">Category Page</SelectItem>
                  <SelectItem value="salon">Salon Page</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </div>

          <FormItem>
            <FormLabel>Banner Image</FormLabel>
            <div className="flex items-center justify-center border-2 border-dashed rounded-md p-6 relative">
              {imagePreview ? (
                <div className="relative w-full">
                  <img
                    src={imagePreview}
                    alt="Banner preview"
                    className="max-h-[200px] mx-auto rounded-md object-contain"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setImagePreview(null)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Drag and drop your image here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or WebP up to 5MB
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                </div>
              )}
            </div>
          </FormItem>

          <FormItem>
            <FormLabel>Link URL (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="e.g., /products/hair-care" />
            </FormControl>
            <FormDescription>
              Enter a URL if clicking on the banner should navigate somewhere
            </FormDescription>
          </FormItem>

          <FormItem>
            <FormLabel>Banner Description (Optional)</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter a brief description..." rows={3} />
            </FormControl>
          </FormItem>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Active Banner</FormLabel>
              <FormDescription>
                Enable to display this banner on the site
              </FormDescription>
            </div>
            <Switch />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Banner</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
