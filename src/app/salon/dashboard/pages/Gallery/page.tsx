"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { Plus, Trash } from "lucide-react";
import AddGalleryForm from "../../components/gallery/AddGalleryForm";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";

interface GalleryImage {
  _id: string;
  salon: string;
  imageUrl: string;
  caption?: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const Gallery: React.FC = () => {
  const { data: session, status } = useSession();
  const salonId = session?.user.salonId;
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    console.log("Session:", session); // Debug log

    if (!salonId) {
      setError("Salon ID not found. Please log in as a salon admin.");
      setLoading(false);
      return;
    }

    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/gallery?salonId=${salonId}`);
        const data = await response.json();
        if (response.ok) {
          setImages(data);
        } else {
          setError(data.error || "Failed to fetch gallery images");
        }
      } catch (err) {
        setError("An error occurred while fetching gallery images");
        console.error("Error fetching gallery:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [salonId, status]);

  const handleAddImage = (newImage: GalleryImage) => {
    setImages([...images, newImage]);
    setShowAddForm(false);
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/gallery/${imageId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setImages(images.filter((image) => image._id !== imageId));
        toast.success("Image deleted successfully!");
      } else {
        const data = await response.json();
        console.error("Error deleting image:", data.error);
        toast.error(data.error || "Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("An error occurred while deleting the image");
    }
  };

  return (
    <DashboardLayout title="Gallery">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!salonId}
          >
            <Plus size={18} className="mr-2" />
            Add New Image
          </button>
        </div>

        {status === "loading" || loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading gallery...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No images in the gallery</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image._id}
                className="glass rounded-xl overflow-hidden hover-lift"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.caption || "Gallery image"}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {image.caption || "No caption"}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {image.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => handleDeleteImage(image._id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Trash size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddForm && salonId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <AddGalleryForm
                salonId={salonId}
                onSubmit={handleAddImage}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Gallery;
