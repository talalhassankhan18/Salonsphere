"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaArrowRight } from "react-icons/fa";
import DefaultAvatar from "@/assets/images/default-avatar.png";
import { MdClose } from "react-icons/md";

const SideMenu = ({
  isLoggedIn,
  handleLogout,
}: { isLoggedIn: boolean; handleLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById("mobile-menu");
      if (menu && !menu.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const Menu = ({ className }: { className?: string }) => (
    <ul className={`space-y-3 ${className}`}>
      <li>
        <Link href="/" className="flex items-center gap-2 text-base" onClick={closeMenu}>
          <FaArrowRight className="text-xl" /> Home
        </Link>
      </li>
      <li>
        <Link href="/salons" className="flex items-center gap-2 text-base" onClick={closeMenu}>
          <FaArrowRight className="text-xl" /> Salons
        </Link>
      </li>
      <li>
        <Link href="/selfcare-products" className="flex items-center gap-2 text-base" onClick={closeMenu}>
          <FaArrowRight className="text-xl" /> Products
        </Link>
      </li>
      <li>
        <Link href="/register" className="flex items-center gap-2 text-base" onClick={closeMenu}>
          <FaArrowRight className="text-xl" /> Register Your Salon
        </Link>
      </li>
      <li>
        {isLoggedIn ? (
          <button
            onClick={() => {
              handleLogout();
              closeMenu();
            }}
            className="flex items-center gap-2 text-base w-full text-left cursor-pointer"
          >
            <img alt="User Avatar" src={DefaultAvatar.src} className="w-7 rounded-full" />
            Logout
          </button>
        ) : (
          <Link href="/login" className="flex items-center gap-2 text-base" onClick={closeMenu}>
            <FaArrowRight className="text-xl" /> Login as Salon
          </Link>
        )}
      </li>
      <li>
        <Link href="/ContactUs" className="flex items-center gap-2 text-base" onClick={closeMenu}>
          <FaArrowRight className="text-xl" /> Contact Us
        </Link>
      </li>
      <li>
        <Link href="/Vendor" className="flex items-center gap-2 text-base" onClick={closeMenu}>
          <FaArrowRight className="text-xl" /> For Business
        </Link>
      </li>
      <li>
        <Link href="/cart" className="flex items-center gap-2 text-base" onClick={closeMenu}>
          <FaArrowRight className="text-xl" />View Cart
        </Link>
      </li>
    </ul>
  );

  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden md:block relative">
        <button
          onClick={handleToggle}
          className="btn btn-ghost btn-circle avatar"
          aria-label="Open menu"
        >
          <GiHamburgerMenu className="text-2xl" />
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md p-4 z-50">
            <Menu />
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      <div className="md:hidden">
        <button
          onClick={handleToggle}
          className="btn btn-ghost btn-circle avatar"
          aria-label="Open mobile menu"
        >
          <GiHamburgerMenu className="text-2xl" />
        </button>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex" id="mobile-menu">
            <div className="w-80 min-h-full bg-white shadow-lg p-4 overflow-y-auto">
              <Menu />
              <div className="flex items-center space-x-2">
                <button
                  onClick={closeMenu}
                  className="flex items-center space-x-2 p-2 bg-transparent hover:bg-gray-200 rounded-full focus:outline-none"
                  aria-label="Close menu"
                >
                  <MdClose size={24} className="text-primary" />
                  <span className="text-primary font-bold">Close</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SideMenu;
