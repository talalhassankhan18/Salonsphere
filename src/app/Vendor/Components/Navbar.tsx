"use client";
import { useState } from "react";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import Logo from "@/assets/images/logo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  return (
    <nav className="bg-white text-gray-900 shadow-md w-full fixed top-0 left-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link className="flex items-center" href="/">
          <img src={Logo.src} alt="logo" className="h-9" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/Subscription" className="text-lg font-medium hover:text-primary transition">
            Pricing
          </Link>

          {/* Dropdown for More Options */}
          <div className="relative group">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className="flex items-center text-lg font-medium hover:text-primary transition"
            >
              Menu <FiChevronDown className="ml-2 transition-transform duration-300" 
                style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-md overflow-hidden z-50 animate-fadeIn">
                <Link href="/Subscription" className="block px-4 py-3 hover:bg-gray-100">Pricing</Link>
                <Link href="/Support" className="block px-4 py-3 hover:bg-gray-100">Support for Business</Link>
                <Link href="/" className="block px-4 py-3 hover:bg-gray-100">For Customers</Link>
              </div>
            )}
          </div>

          {/* Login & Sign Up */}
          <Link href="/salon/login" className="text-lg font-medium hover:text-primary transition">Login</Link>
          <Link href="/salon/register/basic-info" className="px-5 py-2 bg-primary text-white rounded-md font-medium hover:opacity-90 transition">
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-2xl text-primary" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-white shadow-md absolute w-full left-0 py-4 transform transition-transform duration-300 ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}>
        <Link href="/Subscription" className="block px-6 py-3 border-b hover:bg-gray-100">Pricing</Link>

        {/* Mobile Dropdown */}
        <button 
          className="w-full flex justify-between px-6 py-3 border-b hover:bg-gray-100"
          onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
        >
          Menu <FiChevronDown 
            className="transition-transform duration-300"
            style={{ transform: mobileDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} 
          />
        </button>

        {mobileDropdownOpen && (
          <div className="bg-gray-50 animate-fadeIn">
            <Link href="/Subscription" className="block px-6 py-3 hover:bg-gray-200">Pricing</Link>
            <Link href="/Support" className="block px-6 py-3 hover:bg-gray-200">Support for Business</Link>
            <Link href="/" className="block px-6 py-3 hover:bg-gray-200">For Customers</Link>
          </div>
        )}

        {/* Login & Sign Up (Mobile) */}
        <Link href="/salon/login" className="block px-6 py-3 border-b hover:bg-gray-100">Login</Link>
        <Link href="/salon/register/basic-info" className="block px-6 py-3 bg-primary text-white font-medium text-center">Sign Up</Link>
      </div>
    </nav>
  );
};

export default Navbar;
