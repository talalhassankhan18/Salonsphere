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
import { Textarea } from "@/app/Superadmin/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/components/ui/tabs";
import {
  BarChart,
  DollarSign,
  Image,
  Layers,
  Palette,
  Package,
  Plus,
  Tag,
  X,
  Upload,
} from "lucide-react";
import { Badge } from "@/app/Superadmin/components/ui/badge";

export function AddProductDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("hair-care");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === files.length) {
            setImages((prev) => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags((prev) => [...prev, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Product created",
      description: "The product has been created successfully.",
    });
    setOpen(false);
    setImages([]);
    setTags([]);
  };

  // Mock categories data
  const categories = [
    { id: "hair-care", name: "Hair Care" },
    { id: "styling-products", name: "Styling Products" },
    { id: "hair-color", name: "Hair Color" },
    { id: "salon-equipment", name: "Salon Equipment" },
    { id: "mens-products", name: "Men's Products" },
  ];

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
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="images">Images & Media</TabsTrigger>
              <TabsTrigger value="inventory">Pricing & Inventory</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter product description" rows={5} />
                </FormControl>
              </FormItem>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    defaultValue={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>

                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter brand name" />
                  </FormControl>
                </FormItem>
              </div>

              <FormItem>
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="px-3 py-1 flex items-center gap-1"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="Add tags"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTag}
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
              <FormItem>
                <FormLabel>Product Images</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative border rounded-md overflow-hidden h-[150px]"
                    >
                      <img
                        src={image}
                        alt={`Product ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  <div className="border-2 border-dashed rounded-md flex flex-col items-center justify-center p-6 h-[150px] relative">
                    <Image className="h-10 w-10 mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Upload Images</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
                <FormDescription className="mt-2">
                  Upload multiple images. The first image will be the featured
                  image.
                </FormDescription>
              </FormItem>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Product Video URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., https://youtube.com/watch?v=..." />
                  </FormControl>
                  <FormDescription>
                    Link to a product demonstration video
                  </FormDescription>
                </FormItem>

                <FormItem>
                  <FormLabel>360° View URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter URL for 360° view" />
                  </FormControl>
                </FormItem>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>Sale Price ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>Cost ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                </FormItem>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Stock Keeping Unit" />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <Input placeholder="UPC, EAN, etc." />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" />
                  </FormControl>
                </FormItem>
              </div>

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
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    <div className="flex items-center">
                      <Palette className="h-5 w-5 mr-2" />
                      Has Variants
                    </div>
                  </FormLabel>
                  <FormDescription>
                    Enable if this product has multiple variants like size,
                    color
                  </FormDescription>
                </div>
                <Switch />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Published</FormLabel>
              <FormDescription>
                Make this product visible in the store
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
            <Button type="submit">Save Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
