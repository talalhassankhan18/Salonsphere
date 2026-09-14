"use client";

import React, { useState, useEffect } from "react";
import { Service } from "../../../../../../types";
import { Edit, Trash, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import AddServiceForm from "./AddServiceForm";
import EditServiceForm from "./EditServiceForm";
import { toast } from "react-hot-toast"; // For user feedback

interface ServicesListProps {
  salonId: string;
  services: Service[];
}

const ServicesList: React.FC<ServicesListProps> = ({ salonId, services }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [serviceList, setServiceList] = useState<Service[]>(services);

  // Update local state when services prop changes
  useEffect(() => {
    setServiceList(services);
  }, [services]);

  const categories = [
    ...new Set(serviceList.map((service) => service.category)),
  ];

  const filteredServices = serviceList.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? service.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const handleAddService = async (newService: Service) => {
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newService, salonId }),
      });
      const data = await response.json();
      if (response.ok) {
        setServiceList([...serviceList, data]);
        setShowAddForm(false);
        toast.success("Service added successfully!");
      } else {
        console.error("Error adding service:", data.error);
        toast.error(data.error || "Failed to add service");
      }
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("An error occurred while adding the service");
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setShowEditForm(true);
  };

  const handleUpdateService = async (updatedService: Partial<Service>) => {
    if (!selectedService) return;
    try {
      const response = await fetch(`/api/services/${selectedService._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedService),
      });
      const data = await response.json();
      if (response.ok) {
        setServiceList(
          serviceList.map((s) => (s._id === selectedService._id ? data : s))
        );
        setShowEditForm(false);
        setSelectedService(null);
        toast.success("Service updated successfully!");
      } else {
        console.error("Error updating service:", data.error);
        toast.error(data.error || "Failed to update service");
      }
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("An error occurred while updating the service");
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setServiceList(
          serviceList.filter((service) => service._id !== serviceId)
        );
        toast.success("Service deleted successfully!");
      } else {
        const data = await response.json();
        console.error("Error deleting service:", data.error);
        toast.error(data.error || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("An error occurred while deleting the service");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="py-2 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add New Service
        </button>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-3 py-1 text-sm rounded-full transition-colors",
              selectedCategory === null
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-3 py-1 text-sm rounded-full transition-colors",
                selectedCategory === category
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service._id}
            className="glass rounded-xl overflow-hidden hover-lift"
          >
            <div className="h-40 overflow-hidden">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {service.category}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold">{service.name}</h3>
                </div>
                <p className="text-lg font-bold">
                  PKR {service.price.toFixed(2)}
                </p>
              </div>

              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {service.description}
              </p>

              <div className="mt-2 text-sm text-gray-500">
                <span>Gender: {service.gender}</span> |{" "}
                <span>{service.duration} min</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {service.isActive ? "Active" : "Inactive"}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditService(service)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Trash size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No services found</p>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AddServiceForm
              onSubmit={handleAddService}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {showEditForm && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <EditServiceForm
              service={selectedService}
              onSubmit={handleUpdateService}
              onCancel={() => {
                setShowEditForm(false);
                setSelectedService(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesList;
