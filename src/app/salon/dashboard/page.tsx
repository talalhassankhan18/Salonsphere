"use client";
import { useSession } from "next-auth/react"; // Add this import
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "@/common/LoadingSpinner";
import DashboardLayout from "./components/layout/DashboardLayout";
import MobileMenu from "./components/layout/MobileMenu";
import { Heart, Store } from "lucide-react";

interface SalonDetails {
  salonName: string;
  ownerName: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); // Use useSession
  const [salonDetails, setSalonDetails] = useState<SalonDetails | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redirect if not authenticated or not salon_admin
  useEffect(() => {
    if (status === "loading") return; // Wait for session to load
    if (!session || !session.user) {
      toast.error("Please log in to access the dashboard");
      router.push("/salon/login");
    } else if (session.user.role !== "salon_admin") {
      toast.error("Unauthorized access to salon dashboard");
      router.push("/salon/login");
    }
  }, [session, status, router]);

  // Fetch salon details
  useEffect(() => {
    if (session?.user?.email) {
      const fetchSalonDetails = async () => {
        try {
          const response = await fetch("/api/salon/details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });

          const data = await response.json();
          console.log("DashboardPage: Salon details response:", data);

          if (!response.ok || data.error) {
            throw new Error(data.error || "Failed to load salon details");
          }

          if (!data.salonName || !data.name) {
            throw new Error("Incomplete salon details received");
          }

          if (!data.isActive) {
            toast.error(
              "Your salon is not active. Please complete registration."
            );
            router.push(data.lastStep || "/salon/register/basic-info");
            return;
          }

          setSalonDetails({
            salonName: data.salonName,
            ownerName: data.name,
          });
        } catch (err: any) {
          console.error("DashboardPage: Failed to fetch salon details:", err);
          toast.error(err.message || "Failed to load salon details");
          router.push("/salon/login");
        }
      };

      fetchSalonDetails();
    }
  }, [session, router]);

  if (status === "loading" || !salonDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <MobileMenu isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="space-y-8">
        <div className="text-center bg-white shadow-md rounded-lg p-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <Store className="w-12 h-12 text-[#B4004E]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Your Salon Dashboard
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Hello <strong>{salonDetails.ownerName}</strong>, your salon{" "}
            <strong>{salonDetails.salonName}</strong> is ready to shine!
          </p>
          <p className="mt-2 text-md text-gray-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500 mr-2" />
            Wishing you success and prosperity with your salon!
          </p>
        </div>
        <div className="text-center text-gray-500">
          <p>More features coming soon to manage your salon!</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
