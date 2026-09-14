"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import SidebarNavigation from "./SidebarNavigation";
import DashboardHeader from "./DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
}) => {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false); // Default for SSR

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Detect mobile screen size only on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768); // md breakpoint
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to access the dashboard.</div>;
  }

  const userId = session.user?.id || "";
  console.log("DashboardLayout userId:", userId);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarNavigation isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-1 overflow-auto transition-all duration-300 ${
          isSidebarOpen && !isMobile ? "md:ml-64" : "md:ml-16"
        }`}
      >
        <DashboardHeader
          title={title}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          userId={userId}
        />
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
