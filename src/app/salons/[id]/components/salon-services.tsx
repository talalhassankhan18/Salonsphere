"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Service } from "../../../../../types";
import Link from "next/link";

interface SalonServicesProps {
  salonId: string;
}

const SalonServices: React.FC<SalonServicesProps> = ({ salonId }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch services for the specific salon
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/services?salonId=${salonId}`);
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        } else {
          setError("Failed to fetch services");
        }
      } catch (err) {
        setError("An error occurred while fetching services");
      } finally {
        setLoading(false);
      }
    };

    if (salonId) {
      fetchServices();
    } else {
      setError("Invalid salon ID");
      setLoading(false);
    }
  }, [salonId]);

  // Get unique categories
  const categories = [...new Set(services.map((service) => service.category))];

  // Filter services based on search term and selected category
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? service.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory && service.isActive;
  });

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-gray-500">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold mb-6 text-primary">Our Services</h2>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
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

      <div className="block md:hidden">
        <Swiper
          spaceBetween={20}
          slidesPerView={1}
          loop={false}
          breakpoints={{
            280: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
          }}
        >
          {filteredServices.map((service) => (
            <SwiperSlide key={service._id}>
              <ServiceCard service={service} salonId={salonId} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <ServiceCard key={service._id} service={service} salonId={salonId} />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No services found</p>
        </div>
      )}
    </div>
  );
};

// Service Card Component
const ServiceCard: React.FC<{ service: Service; salonId: string }> = ({
  service,
  salonId,
}) => {
  return (
    <div className="glass rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 overflow-hidden">
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
          <p className="text-lg font-bold">PKR {service.price.toFixed(2)}</p>
        </div>

        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {service.description}
        </p>

        <div className="mt-2 text-sm text-gray-500">
          <span>Gender: {service.gender}</span> |{" "}
          <span>{service.duration} min</span>
        </div>

        <div className="mt-4 flex justify-end">
          <Link
            href={`/salons/${salonId}/book?serviceId=${service._id}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book Service
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SalonServices;
