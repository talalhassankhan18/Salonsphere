"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "./Components/sidebar";
import Profile from "./Components/profile";
import Portfolio from "./Components/portfolio";
import Reviews from "./Components/reviews";
import Settings from "./Components/settings";
import Appointments from "./Components/appointments";
import Analytics from "./Components/analytics";
import Orders from "./Components/orders";
import Products from "./Components/products";
import ProductOrders from "./Components/ProductOrders";
import ServiceOrders from "./Components/ServiceOrders";
import Navbar from "./Components/navbar";
import { fetchVendor } from "@/lib/utils";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/app/context/AuthContext";  // Import useAuth
import { useTheme } from "@/app/Salondashboard/Components/ThemeProvider";

export default function SalonDashboard() {
  const [activeSection, setActiveSection] = useState("Profile");
  const [vendor, setVendor] = useState<{ businessName: string; profileImage?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { email, setEmail } = useAuth();  // Using Context API

  useEffect(() => {
    async function getVendor() {
      try {
        const data = await fetchVendor();
        if (data) {
          setVendor(data);
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      } finally {
        setLoading(false);
      }
    }
    getVendor();
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "Profile":
        return <Profile />;
      case "Portfolio":
        return <Portfolio />;
      case "Reviews":
        return <Reviews />;
      case "Settings":
        return <Settings />;
      case "Appointments":
        return <Appointments />;
      case "Analytics":
        return <Analytics />;
      case "Orders":
        return <Orders />;
      case "Products":
        return <Products />;
      case "Product Orders":
        return <ProductOrders />;
      case "Service Orders":
        return <ServiceOrders />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className="flex h-screen bg-base-100 text-base-content transition-all duration-300">
      {/* Sidebar */}
      <Sidebar
        setActiveSection={setActiveSection}
        activeSection={activeSection}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content - Ensuring Scrollbar is on the Right Side */}
      <div className="flex-1 flex flex-col md:ml-64 pt-20 h-screen overflow-hidden">
        {/* Navbar */}
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {/* Header */}
          <header
            className="flex justify-between items-center p-6 rounded-lg shadow-lg transition-all 
              bg-gradient-to-r from-primary to-accent text-primary-content"
          >
            <h1 className="text-2xl font-bold">
              {loading ? "Loading..." : `Welcome, ${email || "Admin"}!`}
            </h1>
            <div className="flex items-center gap-4">
              {vendor?.profileImage ? (
                <img
                  src={vendor.profileImage}
                  alt="Shop Logo"
                  className="w-14 h-14 rounded-full border-2 border-white shadow-lg"
                />
              ) : (
                <FaUserCircle className="text-4xl" />
              )}
            </div>
          </header>

          {/* Main Content */}
          <div className="mt-6 p-6 bg-base-200 shadow-lg rounded-lg">{renderSection()}</div>
        </div>
      </div>
    </div>
  );
}
