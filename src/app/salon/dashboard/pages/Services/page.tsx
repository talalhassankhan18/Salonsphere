"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ServicesList from "../../components/services/ServicesList";
import { Service } from "../../../../../../types";
import { useSession } from "next-auth/react";
import { Toaster } from "react-hot-toast";

const Services: React.FC = () => {
  const { data: session, status } = useSession();
  const salonId = session?.user?.salonId;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch services from API
  useEffect(() => {
    if (status === "loading") {
      return; // Wait for session to load
    }

    if (!salonId) {
      setError("Salon ID not found. Please log in as a salon admin.");
      setLoading(false);
      return;
    }

    const fetchServices = async () => {
      try {
        const response = await fetch(`/api/services?salonId=${salonId}`);
        const data = await response.json();
        if (response.ok) {
          setServices(data);
        } else {
          setError(data.error || "Failed to fetch services");
        }
      } catch (err) {
        setError("An error occurred while fetching services");
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [salonId, status]);

  return (
    <DashboardLayout title="Services">
      <Toaster position="top-right" />
      {status === "loading" || loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading services...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <ServicesList salonId={salonId ?? ""} services={services} />
      )}
    </DashboardLayout>
  );
};

export default Services;
