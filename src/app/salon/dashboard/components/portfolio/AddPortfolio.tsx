"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { toast } from "../../hooks/use-toast";

interface PortfolioItem {
  _id?: string;
  title: string;
  description?: string;
  category: string;
  image: string;
  createdAt?: string;
}

interface AddPortfolioProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PortfolioItem & { imageFile?: File }) => void;
  initialData?: PortfolioItem;
}

const AddPortfolio: React.FC<AddPortfolioProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [image, setImage] = useState<string | null>(initialData?.image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setCategory(initialData.category);
      setImage(initialData.image);
      setImageFile(null);
    } else {
      setTitle("");
      setDescription("");
      setCategory("");
      setImage(null);
      setImageFile(null);
    }
  }, [initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast({
        title: "Error",
        description: "No file selected",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a JPG or PNG image",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setImageFile(file);
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read image file",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title for your portfolio item",
        variant: "destructive",
      });
      return;
    }

    if (!category.trim()) {
      toast({
        title: "Error",
        description: "Please provide a category for your portfolio item",
        variant: "destructive",
      });
      return;
    }

    if (!image) {
      toast({
        title: "Error",
        description: "Please upload an image for your portfolio item",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const portfolioData: PortfolioItem & { imageFile?: File } = {
      ...(initialData?._id && { _id: initialData._id }),
      title,
      description: description || undefined,
      category,
      image,
      ...(initialData?._id ? {} : { createdAt: new Date().toISOString() }),
    };

    if (imageFile) {
      portfolioData.imageFile = imageFile;
    }

    try {
      await onSave(portfolioData);
      if (!initialData) {
        setTitle("");
        setDescription("");
        setCategory("");
        setImage(null);
        setImageFile(null);
      }
      toast({
        title: "Success",
        description: initialData
          ? "Portfolio item updated"
          : "Portfolio item added",
      });
      setIsLoading(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the portfolio item",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Portfolio Item" : "Add New Portfolio Item"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update your portfolio item details"
              : "Showcase your best work to attract more clients"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Bridal Hairstyle"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Haircut, Makeup, Custom Category"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your work..."
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="image-upload">Image</Label>
              {image ? (
                <div className="relative mt-2 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt="Portfolio preview"
                    className="w-full h-56 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
                    disabled={isLoading}
                  >
                    <X size={16} className="text-gray-700" />
                  </button>
                </div>
              ) : (
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <ImageIcon size={32} className="text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500 mb-4">
                      Upload an image in JPG, PNG format (max 2MB)
                    </p>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        asChild
                      >
                        <span>
                          <Upload size={14} className="mr-2" /> Choose Image
                        </span>
                      </Button>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700"
              disabled={isLoading}
            >
              {isLoading
                ? "Saving..."
                : initialData
                ? "Update Portfolio Item"
                : "Save Portfolio Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPortfolio;
