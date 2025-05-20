// src/app/salon/components/layout/MobileMenu.tsx
"use client";

import React from "react";
import { X } from "lucide-react";
import SidebarNavigation from "./SidebarNavigation";
import { cn } from "../../lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, toggleSidebar }) => {
  // Only render on client-side to avoid SSR mismatch
  if (typeof window === "undefined") {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white md:hidden transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <SidebarNavigation isOpen={true} toggleSidebar={toggleSidebar} />
      </div>
    </>
  );
};

export default MobileMenu;
