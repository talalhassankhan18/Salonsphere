"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/assets/images/logo.png";
import Link from "next/link";
import CartNavbar from "./cart-navbar";
import PhoneBtn from "./phone-btn";
import SideMenu from "./side-menu";
import { FiSearch, FiHeart} from "react-icons/fi"; // Icons


const Navbar = ({
  isLoggedIn,
  handleLogout,
}: { isLoggedIn: boolean; handleLogout: () => void }) => {
  const pathname = usePathname();

  const getLinkClasses = (path: string) =>
    `relative py-2 transition-all duration-300 
    ${pathname === path
      ? "text-black font-semibold after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-black"
      : "text-gray-600 hover:text-black hover:after:content-[''] hover:after:absolute hover:after:left-0 hover:after:bottom-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-black"
    }`;
      const [search, setSearch] = useState("");

  return (
    <nav className="bg-base-100 shadow-md font-poppins fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link className="flex items-center" href="/">
          <img src={Logo.src} alt="logo" className="h-9" />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <li className="relative group">
            <Link
              href="/"
            >
              Home
            </Link>
          </li>

          <li>
            <Link href="/salons" className={getLinkClasses("/salons")}>
              Salons
            </Link>
          </li>
          <li>
            <Link href="/selfcare-products" className={getLinkClasses("/selfcare-products")}>
              Products
            </Link>
          </li>
          <li>
            <Link href="/Vendor" className={getLinkClasses("/Vendor")}>
              For Business
            </Link>
          </li>
          <li>
            <Link href="/ContactUs" className={getLinkClasses("/ContactUs")}>
              Contact Us
            </Link>
          </li>
          {isLoggedIn ? (
            <li>
              <button onClick={handleLogout} className={getLinkClasses("/logout")}>
                Logout
              </button>
            </li>
          ) : (
            <li>
              <Link href="/login" className={getLinkClasses("/login")}>
                Login
              </Link>
            </li>
          )}
                  {/* Search Bar & Icons */}
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-100 text-sm px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          {/* Wishlist & Cart Icons */}
          <FiHeart className="text-xl cursor-pointer hover:text-gray-700" />
                    {/* Phone & Cart Icons - Aligned Properly */}
                    <li className="flex items-center space-x-4">
            {/* <PhoneBtn /> */}
            <CartNavbar />
          </li>
        </div>
        </ul>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <SideMenu isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
