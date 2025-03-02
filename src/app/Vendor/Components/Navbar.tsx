"use client";
import { useState } from "react";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  return (
    <nav className="bg-white text-gray-900 shadow-md w-full fixed top-0 left-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <h1 className="font-bold text-2xl text-primary">SalonSphere</h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/pricing" className="text-lg font-medium hover:text-primary transition">Pricing</Link>

          {/* Dropdown for More Options */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className="flex items-center text-lg font-medium hover:text-primary transition"
            >
              Menu <FiChevronDown className="ml-2" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-md overflow-hidden z-50">
                <Link href="/pricing" className="block px-4 py-3 hover:bg-gray-100">Pricing</Link>
                <Link href="/support" className="block px-4 py-3 hover:bg-gray-100">Support for Business</Link>
                <Link href="/customers" className="block px-4 py-3 hover:bg-gray-100">For Customers</Link>
                <Link href="/language" className="block px-4 py-3 hover:bg-gray-100">Language</Link>
              </div>
            )}
          </div>

          {/* Login Button */}
          <Link href="/login" className="text-lg font-medium hover:text-primary transition">Login</Link>

          {/* Sign Up Button */}
          <Link href="/signup" className="px-5 py-2 bg-primary text-white rounded-md font-medium hover:opacity-90 transition">
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-2xl text-primary" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md absolute w-full left-0 py-4">
          <Link href="/pricing" className="block px-6 py-3 border-b hover:bg-gray-100">Pricing</Link>

          {/* Mobile Dropdown */}
          <button 
            className="w-full flex justify-between px-6 py-3 border-b hover:bg-gray-100"
            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
          >
            Menu <FiChevronDown />
          </button>

          {mobileDropdownOpen && (
            <div className="bg-gray-50">
              <Link href="/pricing" className="block px-6 py-3 hover:bg-gray-200">Pricing</Link>
              <Link href="/support" className="block px-6 py-3 hover:bg-gray-200">Support for Business</Link>
              <Link href="/customers" className="block px-6 py-3 hover:bg-gray-200">For Customers</Link>
              <Link href="/language" className="block px-6 py-3 hover:bg-gray-200">Language</Link>
            </div>
          )}

          {/* Login Button (Mobile) */}
          <Link href="/login" className="block px-6 py-3 border-b hover:bg-gray-100">Login</Link>

          {/* Sign Up Button (Mobile) */}
          <Link href="/register" className="block px-6 py-3 bg-primary text-white font-medium text-center">Sign Up</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
