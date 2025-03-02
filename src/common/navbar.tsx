"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Logo from "@/assets/images/logo.png";
import Link from "next/link";
import CartNavbar from "./cart-navbar";
import PhoneBtn from "./phone-btn";
import SideMenu from "./side-menu";

const Navbar = ({
  isLoggedIn,
  handleLogout,
}: { isLoggedIn: boolean; handleLogout: () => void }) => {
  const pathname = usePathname();

  const getLinkClasses = (path: string) =>
    `px-3 py-1.5 rounded-md transition duration-300 hover:text-primary-content hover:bg-primary ${
      pathname === path ? "underline text-primary" : ""
    }`;

  return (
    <nav className="bg-base-100 shadow-md font-poppins fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link className="flex items-center" href="/">
          <img src={Logo.src} alt="logo" className="h-9" />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-5 text-[15px] font-medium text-base-content">
          <li>
            <Link href="/" className={getLinkClasses("/")}>Home</Link>
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
          {isLoggedIn ? (
            <li>
              <button onClick={handleLogout} className={getLinkClasses("/logout")}>
                Logout
              </button>
            </li>
          ) : (
            <li>
              <Link href="/login" className={getLinkClasses("/login")}>
                Login as Salon
              </Link>
            </li>
          )}
          <li>
            <Link href="/ContactUs" className={getLinkClasses("/ContactUs")}>
              Contact Us
            </Link>
          </li>
          
          {/* Phone & Cart Icons - Aligned Properly */}
          <li className="flex items-center space-x-4">
            <PhoneBtn />
            <CartNavbar />
          </li>
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
