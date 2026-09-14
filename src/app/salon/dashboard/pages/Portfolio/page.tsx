"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Plus, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import AddPortfolio from "../../components/portfolio/AddPortfolio";
import { Button } from "../../components/ui/button";
import { toast } from "../../hooks/use-toast";

interface PortfolioItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  image: string;
  createdAt: string;
}

const Portfolio: React.FC = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [salonId, setSalonId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    const fetchSalonId = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/session");
        const session: { user?: { salonId?: string } } = await response.json();
        console.log("Session data:", session);
        if (session?.user?.salonId) {
          setSalonId(session.user.salonId);
        } else {
          console.error("Salon ID not found in session");
          setSessionError(true);
          toast({
            title: "Error",
            description:
              "Failed to fetch salon information. Please log in again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setSessionError(true);
        toast({
          title: "Error",
          description:
            "An error occurred while fetching session. Please log in again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSalonId();
  }, []);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        console.log("Fetching portfolios for salonId:", salonId);
        const response = await fetch(`/api/salon/portfolio?salonId=${salonId}`);
        const data = await response.json();
        console.log("Fetch portfolios response:", data);
        if (response.ok) {
          setPortfolioItems(data);
        } else {
          console.error("Fetch portfolios error:", data.message);
          toast({
            title: "Error",
            description: data.message || "Failed to fetch portfolios",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching portfolios:", error);
        toast({
          title: "Error",
          description: "An error occurred while fetching portfolios",
          variant: "destructive",
        });
      }
    };

    if (salonId) {
      fetchPortfolios();
    }
  }, [salonId]);

  useEffect(() => {
    console.log("Portfolio items updated:", portfolioItems);
  }, [portfolioItems]);

  const handleAddItem = async (newItem: any) => {
    try {
      if (!salonId) {
        toast({
          title: "Error",
          description:
            "Salon information is not available. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      console.log("Adding portfolio item:", newItem);
      const formData = new FormData();
      formData.append("title", newItem.title);
      formData.append("description", newItem.description || "");
      formData.append("category", newItem.category);
      formData.append("salonId", salonId);
      if (newItem.imageFile) {
        formData.append("image", newItem.imageFile);
      }

      const response = await fetch("/api/salon/portfolio", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("API response:", data);

      if (response.ok) {
        setPortfolioItems([data, ...portfolioItems]);
        toast({
          title: "Success",
          description: "Portfolio item added successfully",
        });
      } else {
        console.error("API error:", data.message);
        toast({
          title: "Error",
          description: data.message || "Failed to add portfolio item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding portfolio:", error);
      toast({
        title: "Error",
        description: "An error occurred while adding the portfolio item",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = async (updatedItem: any) => {
    try {
      console.log("Editing portfolio item:", updatedItem);
      const formData = new FormData();
      formData.append("title", updatedItem.title);
      formData.append("description", updatedItem.description || "");
      formData.append("category", updatedItem.category);
      if (updatedItem.imageFile) {
        formData.append("image", updatedItem.imageFile);
      }

      const response = await fetch(`/api/salon/portfolio/${updatedItem._id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await response.json();
      console.log("API response:", data);

      if (response.ok) {
        setPortfolioItems(
          portfolioItems.map((item) =>
            item._id === updatedItem._id ? data : item
          )
        );
        toast({
          title: "Success",
          description: "Portfolio item updated successfully",
        });
      } else {
        console.error("API error:", data.message);
        toast({
          title: "Error",
          description: data.message || "Failed to update portfolio item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating portfolio:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the portfolio item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      console.log("Deleting portfolio item:", itemId);
      const response = await fetch(`/api/salon/portfolio/${itemId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      console.log("API response:", data);

      if (response.ok) {
        setPortfolioItems(portfolioItems.filter((item) => item._id !== itemId));
        toast({
          title: "Success",
          description: "Portfolio item deleted successfully",
        });
      } else {
        console.error("API error:", data.message);
        toast({
          title: "Error",
          description: data.message || "Failed to delete portfolio item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the portfolio item",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  if (sessionError) {
    return (
      <DashboardLayout title="Portfolio">
        <div className="text-center py-10">
          <h2 className="text-lg font-semibold text-red-600">Session Error</h2>
          <p className="text-gray-600">
            Unable to load salon information. Please{" "}
            <Link href="/salon/login" className="text-blue-600 underline">
              log in again
            </Link>
            .
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Portfolio">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Your Portfolio</h2>
          <Button
            className="bg-pink-600 hover:bg-pink-700 text-white"
            onClick={() => setIsAddModalOpen(true)}
            disabled={loading || !salonId}
          >
            <Plus size={16} className="mr-2" />
            {loading ? "Loading..." : "Add Portfolio Item"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <div
              key={item._id}
              className="glass rounded-xl overflow-hidden hover-lift"
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={() =>
                    console.error(`Failed to load image: ${item.image}`)
                  }
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex space-x-2">
                    <button
                      className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => openEditModal(item)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => handleDeleteItem(item._id)}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{item.title}</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-pink-100 text-pink-800 rounded-full">
                    {item.category}
                  </span>
                </div>

                {item.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {item.description}
                  </p>
                )}

                <p className="mt-3 text-xs text-gray-500">
                  Added on {format(new Date(item.createdAt), "MMMM dd, yyyy")}
                </p>
              </div>
            </div>
          ))}

          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-gray-300 transition-colors cursor-pointer h-[394px]"
            onClick={() => !loading && salonId && setIsAddModalOpen(true)}
            style={{ pointerEvents: loading || !salonId ? "none" : "auto" }}
          >
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <Plus size={24} className="text-pink-600" />
            </div>
            <h3 className="font-semibold mb-2">
              {loading ? "Loading..." : "Add New Item"}
            </h3>
            <p className="text-sm text-gray-500">
              Showcase your best work to attract more clients
            </p>
          </div>
        </div>
      </div>

      <AddPortfolio
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddItem}
      />

      {editingItem && (
        <AddPortfolio
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleEditItem}
          initialData={editingItem}
        />
      )}
    </DashboardLayout>
  );
};

export default Portfolio;
