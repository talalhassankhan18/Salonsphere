"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import LoadingSpinner from "@/common/LoadingSpinner";
import DashboardLayout from "./components/layout/DashboardLayout";
import MobileMenu from "./components/layout/MobileMenu";
import DashboardOverview from "./components/dashboard/DashboardOverview";
import RecentActivitiesTable from "./components/dashboard/RecentActivitiesTable";
import StatsCard from "./components/dashboard/StatsCard";
import { DollarSign, Calendar } from "lucide-react";

interface SalonDetails {
  salonName: string;
  ownerName: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
      setIsMobile(window.innerWidth < 768); // md breakpoint is 768px
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch salon details (mocked since there's no backend)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/salon/login");
      return;
    }

    if (status === "authenticated" && session?.user?.email) {
      // Simulate fetching salon details
      const fetchSalonDetails = async () => {
        try {
          const mockResponse = {
            ok: true,
            salonName: "Glamour Salon",
            name: "John Doe",
          };

          if (mockResponse.ok) {
            setSalonDetails({
              salonName: mockResponse.salonName,
              ownerName: mockResponse.name,
            });
          } else {
            throw new Error("Failed to load salon details");
          }
        } catch (err: any) {
          toast.error(err.message || "Failed to load salon details");
          router.push("/salon/login");
        }
      };

      fetchSalonDetails();
    }
  }, [status, session, router]);

  if (status === "loading" || !salonDetails) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout title="Dashboard">

      <MobileMenu isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome to Your Salon Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Hello {salonDetails.ownerName}, your salon{" "}
            <strong>{salonDetails.salonName}</strong> is ready to manage!
          </p>
        </div>

        {/* Dashboard Components */}
        <DashboardOverview />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard
            title="Total Appointments"
            value="25"
            icon={<Calendar size={24} />}
          />
          <StatsCard
            title="Revenue"
            value="$1,500"
            icon={<DollarSign size={24} />}
          />
          <RecentActivitiesTable />
        </div>
      </div>
    </DashboardLayout>
  );
}