"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import { FaSun, FaMoon, FaUserCircle, FaBars } from "react-icons/fa";
import { useTheme } from "@/app/Salondashboard/Components/ThemeProvider";
import { fetchVendor } from "@/lib/utils";

export default function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter(); // Initialize Next.js router
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vendor, setVendor] = useState<{ businessName: string; profileImage?: string } | null>(null);

  useEffect(() => {
    async function getVendor() {
      try {
        const data = await fetchVendor();
        if (data) {
          setVendor(data);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        setIsLoggedIn(false);
      }
    }
    getVendor();
  }, []);

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setVendor(null);
    router.push("/login"); // Redirect user to login page
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-base-100 shadow-md">
      {/* Left Section: Sidebar Toggle (Mobile Only) & Title */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle Button (Visible on Mobile) */}
        <button onClick={toggleSidebar} className="md:hidden p-2 rounded-full bg-primary text-white shadow-md">
          <FaBars size={20} />
        </button>

        {/* Logo */}
        <h1 className="text-2xl font-bold text-primary">SalonSphere</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button onClick={toggleTheme} className="p-2 rounded-full bg-secondary text-secondary-content">
          {theme === "light" ? <FaMoon size={20} /> : <FaSun size={20} />}
        </button>

        {/* Login/Logout */}
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            {/* Profile Image */}
            {vendor?.profileImage ? (
              <img
                src={vendor.profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-primary shadow"
              />
            ) : (
              <FaUserCircle className="text-3xl text-primary" />
            )}
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")} // Redirect to login on click
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
