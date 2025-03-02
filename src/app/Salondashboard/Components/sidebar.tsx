"use client";
import React, { useState } from "react";
import {
  FaHome,
  FaImages,
  FaStar,
  FaCog,
  FaCalendarAlt,
  FaChartBar,
  FaBox,
  FaShoppingBag,
  FaChevronDown,
  FaBrush,
} from "react-icons/fa";

const menuItems = [
  { name: "Profile", icon: <FaHome /> },
  { name: "Portfolio", icon: <FaImages /> },
  { name: "Reviews", icon: <FaStar /> },
  { name: "Settings", icon: <FaCog /> },
  { name: "Appointments", icon: <FaCalendarAlt /> },
  { name: "Analytics", icon: <FaChartBar /> },
  {
    name: "Orders",
    icon: <FaBox />,
    subItems: [
      { name: "Product Orders", icon: <FaShoppingBag /> },
      { name: "Service Orders", icon: <FaBrush /> },
    ],
  },
  { name: "Products", icon: <FaShoppingBag /> },
];

export default function Sidebar({
  setActiveSection,
  activeSection,
  isOpen,
  setIsOpen,
}: {
  setActiveSection: (section: string) => void;
  activeSection: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  return (
    <>
      {/* Sidebar - Fixed on the Left */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-lg p-6 flex flex-col transition-transform duration-300 
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ paddingTop: "80px" }} // Push sidebar items below the navbar
      >
        <ul className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {menuItems.map(({ name, icon, subItems }) => (
            <li key={name} className="mb-2">
              <div
                className={`flex items-center justify-between gap-3 py-3 px-4 cursor-pointer rounded-lg transition-all duration-300 
                ${
                  activeSection === name
                    ? "bg-primary text-white shadow-md"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => {
                  if (subItems) {
                    setExpandedMenu(expandedMenu === name ? null : name);
                  } else {
                    setActiveSection(name);
                    setIsOpen(false);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg transition-colors ${
                      activeSection === name ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {icon}
                  </span>
                  <span className="text-base font-medium">{name}</span>
                </div>
                {subItems && (
                  <FaChevronDown
                    className={`transition-transform ${
                      expandedMenu === name ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>

              {/* Dropdown Items */}
              {subItems && expandedMenu === name && (
                <ul className="ml-6 mt-1 space-y-2 overflow-hidden transition-all duration-300">
                  {subItems.map(({ name, icon }) => (
                    <li
                      key={name}
                      className={`flex items-center gap-3 py-2 px-4 cursor-pointer rounded-lg transition-all duration-300
                        ${
                          activeSection === name
                            ? "bg-gray-200 text-primary shadow-sm"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      onClick={() => {
                        setActiveSection(name);
                        setIsOpen(false);
                      }}
                    >
                      <span className="text-sm">{icon}</span>
                      <span className="text-sm">{name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="mt-auto text-center text-sm text-gray-500 hover:text-gray-700 transition duration-300">
          © 2025 SalonSphere
        </div>
      </div>
    </>
  );
}
