"use client";

import { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
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
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/Superadmin/dashboard/components/ui/tabs";
import {
  BarChart,
  Image,
  Palette,
  Package,
  Plus,
  X,
  Upload,
} from "lucide-react";
import { Badge } from "@/app/Superadmin/dashboard/components/ui/badge";

interface FormData {
  name: string;
  description: string;
  category: string;
  brand: string;
  tags: string[];
  images: File[];
  videoUrl?: string;
  view360Url?: string;
  price: number;
  discountPercent?: number;
  cost?: number;
  sku: string;
  barcode: string;
  stock: number;
  trackInventory: boolean;
  hasVariants: boolean;
  published: boolean;
}

const categories = [
  { id: "new-arrivals", name: "New Arrivals" },
  { id: "best-sellers", name: "Best Sellers" },
  { id: "budget-friendly", name: "Budget Friendly" },
  { id: "hair-care", name: "Hair Care" },
  { id: "styling-products", name: "Styling Products" },
  { id: "hair-color", name: "Hair Color" },
  { id: "salon-equipment", name: "Salon Equipment" },
  { id: "mens-products", name: "Men's Products" },
];

export default function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      category: "hair-care",
      brand: "",
      tags: [],
      images: [],
      videoUrl: "",
      view360Url: "",
      price: 0,
      discountPercent: 0,
      cost: 0,
      sku: "",
      barcode: "",
      stock: 0,
      trackInventory: true,
      hasVariants: false,
      published: true,
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const {
    fields: tags,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control,
    name: "tags",
  });

  const price = watch("price");
  const discountPercent = watch("discountPercent");
  const discountedPrice = discountPercent
    ? price * (1 - discountPercent / 100)
    : null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 4 - imagePreviews.length;
      if (remainingSlots <= 0) {
        toast({
          title: "Limit Reached",
          description: "You can only upload up to 4 images.",
          variant: "destructive",
        });
        return;
      }
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const newPreviews: string[] = [];
      filesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === filesToProcess.length) {
            setImagePreviews((prev) => [...prev, ...newPreviews]);
            setValue("images", [...watch("images"), ...filesToProcess]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    const updatedImages = watch("images").filter((_, i) => i !== index);
    setValue("images", updatedImages);
  };

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("category", data.category);
    formData.append("price", data.price.toString());
    formData.append("stock", data.stock.toString());
    formData.append("attributes", JSON.stringify([])); // Empty for now
    formData.append("discountPercent", data.discountPercent?.toString() || "0");
    formData.append("description", data.description);
    formData.append("published", data.published.toString());
    formData.append("brand", data.brand);
    formData.append("sku", data.sku);
    formData.append("barcode", data.barcode);

    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append("images", data.images[i]);
      }
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        toast({
          title: "Product created",
          description: "The product has been created successfully.",
        });
        setOpen(false);
        setImagePreviews([]);
        reset();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create product.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new product to your catalogue
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="images">Images & Media</TabsTrigger>
                  <TabsTrigger value="inventory">
                    Pricing & Inventory
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter product description"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter brand name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag, index) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="px-3 py-1 flex items-center gap-1"
                        >
                          {tag.value}
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Add tags"
                          value={form.watch("tags")[tags.length] || ""}
                          onChange={(e) => {
                            const newTags = [...form.watch("tags")];
                            newTags[tags.length] = e.target.value;
                            setValue("tags", newTags);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const newTag = form.watch("tags")[tags.length];
                              if (
                                newTag &&
                                !tags.some((t) => t.value === newTag)
                              ) {
                                appendTag(newTag);
                                setValue("tags", [...form.watch("tags"), ""]);
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newTag = form.watch("tags")[tags.length];
                          if (newTag && !tags.some((t) => t.value === newTag)) {
                            appendTag(newTag);
                            setValue("tags", [...form.watch("tags"), ""]);
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <FormDescription>
                      Tags help customers find your product more easily
                    </FormDescription>
                  </FormItem>
                </TabsContent>

                <TabsContent value="images" className="space-y-6">
                  <FormField
                    control={control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Images</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          {imagePreviews.length > 0 && (
                            <div className="relative border rounded-md overflow-hidden h-[150px]">
                              <img
                                src={imagePreviews[0]}
                                alt="Featured Product"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {imagePreviews.slice(1).map((image, index) => (
                            <div
                              key={index + 1}
                              className="relative border rounded-md overflow-hidden h-[150px]"
                            >
                              <img
                                src={image}
                                alt={`Product ${index + 2}`}
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6"
                                onClick={() => removeImage(index + 1)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {imagePreviews.length < 4 && (
                            <div className="border-2 border-dashed rounded-md flex flex-col items-center justify-center p-6 h-[150px] relative">
                              <Image className="h-10 w-10 mb-2 text-muted-foreground" />
                              <p className="text-sm font-medium">
                                Upload Images
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG up to 5MB (Max 4)
                              </p>
                              <Input
                                type="file"
                                multiple
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  handleImageChange(e);
                                  field.onChange(
                                    e.target.files
                                      ? Array.from(e.target.files)
                                      : []
                                  );
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <FormDescription className="mt-2">
                          Upload up to 4 images. The first image will be the
                          featured image.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="videoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Video URL (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., https://youtube.com/watch?v=..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Link to a product demonstration video
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="view360Url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>360° View URL (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter URL for 360° view"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (PKR)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="discountPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Percent (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Enter percentage (0-100) for discount.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {discountPercent !== 0 && (
                      <div className="flex items-center gap-2">
                        <FormLabel>Discounted Price (PKR)</FormLabel>
                        <span className="text-muted-foreground line-through">
                          {price.toFixed(2)} PKR
                        </span>
                        <span className="font-bold">
                          {discountedPrice?.toFixed(2)} PKR
                        </span>
                      </div>
                    )}

                    <FormField
                      control={control}
                      name="cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost (PKR)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Stock Keeping Unit"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="barcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barcode</FormLabel>
                          <FormControl>
                            <Input placeholder="UPC, EAN, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={control}
                    name="trackInventory"
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            <div className="flex items-center">
                              <BarChart className="h-5 w-5 mr-2" />
                              Track Inventory
                            </div>
                          </FormLabel>
                          <FormDescription>
                            Enable to keep track of product stock levels
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    )}
                  />

                  <FormField
                    control={control}
                    name="hasVariants"
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            <div className="flex items-center">
                              <Palette className="h-5 w-5 mr-2" />
                              Has Variants
                            </div>
                          </FormLabel>
                          <FormDescription>
                            Enable if this product has multiple variants like
                            size, color
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <FormField
                control={control}
                name="published"
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Published</FormLabel>
                      <FormDescription>
                        Make this product visible in the store
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
