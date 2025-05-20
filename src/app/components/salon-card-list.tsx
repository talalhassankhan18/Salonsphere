"use client";

import CardList from "@/common/card-list";
import { SalonType } from "../../../types";
import Link from "next/link";
import { useState, useEffect } from "react";

const SalonCardList = () => {
  const [salons, setSalons] = useState<SalonType[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalons = async () => {
    try {
      const response = await fetch("/api/salon", {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response:", result); // Debug log
      const salonsData = Array.isArray(result) ? result : result.data;

      if (!salonsData || !Array.isArray(salonsData)) {
        throw new Error("Invalid API response: Expected an array of salons");
      }

      const mappedSalons: SalonType[] = salonsData.map((salon: any) => ({
        _id: salon._id?.toString() || "",
        salonName: salon.salonName || "Unknown Salon",
        avatar: salon.avatar || "/default-salon-image.jpg",
        address: salon.address || "No address provided",
        salonType: ["female", "male", "unisex"].includes(salon.salonType)
          ? salon.salonType
          : undefined,
        latitude: typeof salon.latitude === "number" ? salon.latitude : 0,
        longitude: typeof salon.longitude === "number" ? salon.longitude : 0,
        name: salon.salonName || "Unknown",
        ratings: typeof salon.ratings === "number" ? salon.ratings : 0,
        image: salon.avatar || "/default-salon-image.jpg",
        contact: {
          phone: typeof salon.contact?.phone === "string" ? salon.contact.phone : "N/A",
          email: typeof salon.contact?.email === "string" ? salon.contact.email : undefined,
        },
        location: {
          coordinates: [
            typeof salon.longitude === "number" ? salon.longitude : 0,
            typeof salon.latitude === "number" ? salon.latitude : 0,
          ] as [number, number],
          city: typeof salon.location?.city === "string" ? salon.location.city : "Unknown",
          state: typeof salon.location?.state === "string" ? salon.location.state : "Unknown",
          postalCode: typeof salon.location?.postalCode === "string" ? salon.location.postalCode : "N/A",
        },
        workingHours: Array.isArray(salon.workingHours) ? salon.workingHours : [],
        services: Array.isArray(salon.services) ? salon.services : [],
        isVerified: typeof salon.isVerified === "boolean" ? salon.isVerified : true,
        createdAt: salon.createdAt
          ? new Date(salon.createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: salon.updatedAt
          ? new Date(salon.updatedAt).toISOString()
          : new Date(salon.createdAt || Date.now()).toISOString(),
        gallery: Array.isArray(salon.gallery) ? salon.gallery : undefined,
        amenities: Array.isArray(salon.amenities) ? salon.amenities : undefined,
      }));

      setSalons(mappedSalons);
    } catch (err: any) {
      console.error("Error fetching salons:", err.message, err.stack);
      setError(err.message || "An error occurred while fetching salons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  if (isLoading) {
    return (
      <div className="px-2">
        <Link href="/salons" className="prose lg:prose-xl">
          <h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
            <span className="pl-4">Salons</span>
          </h3>
        </Link>
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-600">Loading salons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2">
        <Link href="/salons" className="prose lg:prose-xl">
          <h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
            <span className="pl-4">Salons</span>
          </h3>
        </Link>
        <div className="flex justify-center items-center h-40">
          <p className="text-red-600">{error}</p>
          <button
            className="ml-4 text-blue-500 underline"
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchSalons();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (salons.length === 0) {
    return (
      <div className="px-2">
        <Link href="/salons" className="prose lg:prose-xl">
          <h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
            <span className="pl-4">Salons</span>
          </h3>
        </Link>
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-600">No salons available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2">
      <Link href="/salons" className="prose lg:prose-xl">
        <h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
          <span className="pl-4">Salons</span>
        </h3>
      </Link>
      <CardList cards={salons} dataType="salon" shouldAnimate={false} />
    </div>
  );
};

export default SalonCardList;