"use client";

import { useState, useEffect, useCallback } from "react";
import React from "react";
import Navbar from "@/common/navbar";
import Hero from "./components/hero";
import Saloons from "./components/salons";
import RecommendedSalons from "./components/recommended-salons";
import NewSalons from "./components/new-salons";
import TrendingSalons from "./components/trending-saloons";
import QrCodeSection from "./components/qr-code-section-img";
import GlimmerAchieves from "./components/glimmer-achieves";
import GlimmerForBusiness from "./components/glimmer-for-business";
import BrowseByAreaList from "./components/browse-by-area-list";
import Footer from "@/common/footer";
import Chatbot from "@/app/Support/components/Chatbot";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { SalonType } from "../../../types";

// Debounce function to limit API calls
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [salonName, setSalonName] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState<"female" | "male" | "unisex" | "">("");
  const [service, setService] = useState("");
  const [salons, setSalons] = useState<SalonType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalons = useCallback(async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams({
        ...(salonName && { salonName }),
        ...(location && { address: location }),
        ...(gender && { salonType: gender }),
        ...(service && { serviceName: service }),
      }).toString();
      console.log("Fetching with Query:", query); // Debug the query
      const response = await fetch(`/api/salon?${query}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch salons (${response.status})`);
      }
      const data = await response.json();
      const mappedSalons: SalonType[] = data.map((salon: any) => ({
        _id: salon._id,
        name: salon.salonName || salon.name || "",
        address: salon.address || "",
        ratings: salon.ratings || 0,
        image: salon.avatar || salon.image || "",
        contact: { phone: salon.contact?.phone || "" },
        location: {
          coordinates: [salon.latitude || 0, salon.longitude || 0],
          city: salon.location?.city || "",
          state: salon.location?.state || "",
          postalCode: salon.location?.postalCode || "",
        },
        workingHours: salon.workingHours || [],
        services: salon.services || [],
        isVerified: salon.isVerified || false,
        createdAt: salon.createdAt || new Date().toISOString(),
        updatedAt: salon.updatedAt || new Date().toISOString(),
        salonType: salon.salonType || "unisex",
      }));
      setSalons(mappedSalons);
      console.log("Mapped Salons:", JSON.stringify(mappedSalons, null, 2)); // Debug the response
    } catch (err: any) {
      console.error("Error fetching salons:", err);
      setError("Failed to load salons. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [salonName, location, gender, service]);

  // Debounced version of fetchSalons
  const debouncedFetchSalons = useCallback(debounce(fetchSalons, 500), [fetchSalons]);

  // Fetch salons on initial load
  useEffect(() => {
    fetchSalons();
  }, []);

  // Fetch salons whenever filter states change
  useEffect(() => {
    debouncedFetchSalons();
  }, [salonName, location, gender, service, debouncedFetchSalons]);

  const handleSearch = () => {
    console.log("Search Triggered with:", { salonName, location, gender, service }); // Debug search trigger
    fetchSalons(); // Still allow manual search if needed
  };

  const filteredSalons = salons.filter((salon) => {
    const salonNameSafe = salon.name || "";
    const addressSafe = salon.address || "";
    const matchesName = !salonName || salonNameSafe.toLowerCase().includes(salonName.toLowerCase());
    const matchesLocation = !location || addressSafe.toLowerCase().includes(location.toLowerCase());
    const matchesGender = !gender || salon.salonType === gender;
    return matchesName && matchesLocation && matchesGender;
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      <Navbar />
      <div className="m-4 p-6"></div>
      <Hero
        salonName={salonName}
        setSalonName={setSalonName}
        location={location}
        setLocation={setLocation}
        gender={gender}
        setGender={setGender}
        service={service}
        setService={setService}
        handleSearch={handleSearch}
      />
      <Saloons
        salons={filteredSalons.slice(0, 4)}
        isLoading={isLoading}
        error={error}
      />
      <TrendingSalons
        salons={filteredSalons.slice(4, 8)}
        isLoading={isLoading}
        error={error}
      />
      <RecommendedSalons
        salons={filteredSalons.slice(8, 12)}
        isLoading={isLoading}
        error={error}
      />
      <NewSalons
        salons={filteredSalons.slice(12, 16)}
        isLoading={isLoading}
        error={error}
      />
      <QrCodeSection />
      <GlimmerAchieves />
      <GlimmerForBusiness />
      <BrowseByAreaList />
      <Chatbot isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />

      <motion.div
        className="fixed bottom-6 right-6 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {!isChatOpen && (
          <Button
            className="rounded-full w-12 h-12 bg-gradient-to-br from-[#B4004E] to-[#6B1A4B] shadow-lg"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageSquare className="h-6 w-6 text-white" />
          </Button>
        )}
      </motion.div>
      <Footer />
    </>
  );
}
