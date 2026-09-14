"use client";

import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface GalleryImage {
  _id: string;
  salon: string;
  imageUrl: string;
  caption?: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface AddGalleryFormProps {
  salonId: string;
  onSubmit: (image: GalleryImage) => void;
  onCancel: () => void;
}

const AddGalleryForm: React.FC<AddGalleryFormProps> = ({
  salonId,
  onSubmit,
  onCancel,
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      toast.error("Please upload an image");
      return;
    }

    if (!salonId) {
      toast.error("Salon ID is missing");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("salonId", salonId);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      const response = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        onSubmit({
          _id: data._id,
          salon: salonId,
          imageUrl: data.imageUrl,
          caption: data.caption,
          isActive: data.isActive,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
        toast.success("Image added successfully!");
      } else {
        throw new Error(data.error || "Failed to add image");
      }
    } catch (error: any) {
      console.error("Error adding image:", error);
      toast.error(error.message || "Failed to add image");
    } finally {
      setUploading(false);
    }
  };

  const isFormValid = image;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Add Gallery Image</h2>
        <button
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gallery Image
            </label>
            {preview ? (
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Gallery preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="text-gray-700" />
                </button>
              </div>
            ) : (
              <label className="block h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div>
            <label
              htmlFor="caption"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Caption (Optional)
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Describe the image..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid || uploading}
            className={cn(
              "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors",
              isFormValid && !uploading
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            )}
          >
            {uploading ? "Uploading..." : "Add Image"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddGalleryForm;
