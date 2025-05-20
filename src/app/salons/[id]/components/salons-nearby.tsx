"use client";

import React, { useState, useEffect } from "react";
import CardList from "@/common/card-list";
import Link from "next/link";
import { SalonType } from "../../../../../types";

interface SalonsNearbyProps {
  currentSalonAddress?: string;
}

const SalonsNearby = ({ currentSalonAddress }: SalonsNearbyProps) => {
  const [salons, setSalons] = useState<SalonType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentSalonAddress) {
      setError("No address provided for nearby salons.");
      return;
    }

    const fetchNearbySalons = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/salon?address=${encodeURIComponent(currentSalonAddress)}`,
          {
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API response:", result); // Debug log

        // Handle both array and object responses
        const salonsData = Array.isArray(result) ? result : result.data;

        if (!salonsData || !Array.isArray(salonsData)) {
          throw new Error("Invalid API response: Expected an array of salons");
        }

        // Map API data to SalonType
        const mappedSalons: SalonType[] = salonsData.map((salon: any) => ({
          _id: salon._id?.toString() || "",
          salonName: salon.salonName || "Unknown Salon",
          avatar: salon.avatar || "/default-salon-image.jpg", // Ensure fallback image
          address: salon.address || "No address provided",
          salonType: ["female", "male", "unisex"].includes(salon.salonType)
            ? salon.salonType
            : undefined,
          latitude: typeof salon.latitude === "number" ? salon.latitude : 0,
          longitude: typeof salon.longitude === "number" ? salon.longitude : 0,
          name: salon.salonName || "Unknown",
          ratings: typeof salon.ratings === "number" ? salon.ratings : 0,
          image: salon.avatar || "/default-salon-image.jpg", // Ensure fallback image
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
        console.error("Error fetching nearby salons:", err.message, err.stack);
        setError("Unable to load nearby salons. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearbySalons();
  }, [currentSalonAddress]);

  if (isLoading) {
    return (
      <div className="px-2 mb-4 md:mb-8">
        <Link href="/salons" className="prose lg:prose-xl">
          <h2 className="mb-2 md:mb-3">Nearby Salons</h2>
        </Link>
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-600">Loading nearby salons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2 mb-4 md:mb-8">
        <Link href="/salons" className="prose lg:prose-xl">
          <h2 className="mb-2 md:mb-3">Nearby Salons</h2>
        </Link>
        <div className="flex justify-center items-center h-40">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (salons.length === 0) {
    return (
      <div className="px-2 mb-4 md:mb-8">
        <Link href="/salons" className="prose lg:prose-xl">
          <h2 className="mb-2 md:mb-3">Nearby Salons</h2>
        </Link>
        <p className="prose lg:prose-xl">No nearby salons found.</p>
      </div>
    );
  }

  return (
    <div className="px-2 mb-4 md:mb-8">
      <Link href="/salons" className="prose lg:prose-xl">
        <h2 className="mb-2 md:mb-3">Nearby Salons</h2>
      </Link>
      <CardList cards={salons} dataType="salon" shouldAnimate={true} />
    </div>
  );
};

export default SalonsNearby;