"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaArrowRight } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import DefaultAvatar from "@/assets/images/default-avatar.png";

// Define the props interface
interface SideMenuProps {
  isLoggedIn: boolean;
  handleLogout: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isLoggedIn, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as HTMLElement)
      ) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const Menu = ({ className = "" }: { className?: string }) => (
    <ul className={`space-y-3 ${className}`}>
      <li>
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2 text-base"
        >
          <FaArrowRight className="text-xl" /> Home
        </Link>
      </li>
      <li>
        <Link
          href="/salons"
          onClick={closeMenu}
          className="flex items-center gap-2 text-base"
        >
          <FaArrowRight className="text-xl" /> Salons
        </Link>
      </li>
      <li>
        <Link
          href="/selfcare-products"
          onClick={closeMenu}
          className="flex items-center gap-2 text-base"
        >
          <FaArrowRight className="text-xl" /> Products
        </Link>
      </li>
      <li>
        <Link
          href="/register"
          onClick={closeMenu}
          className="flex items-center gap-2 text-base"
        >
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
            className="flex items-center gap-2 text-base w-full text-left"
          >
            <img
              src={DefaultAvatar.src}
              alt="User Avatar"
              className="w-7 rounded-full"
            />
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            onClick={closeMenu}
            className="flex items-center gap-2 text-base"
          >
            <FaArrowRight className="text-xl" /> Login as Salon
          </Link>
        )}
      </li>
      <li>
        <Link
          href="/ContactUs"
          onClick={closeMenu}
          className="flex items-center gap-2 text-base"
        >
          <FaArrowRight className="text-xl" /> Contact Us
        </Link>
      </li>
      <li>
        <Link
          href="/Vendor"
          onClick={closeMenu}
          className="flex items-center gap-2 text-base"
        >
          <FaArrowRight className="text-xl" /> For Business
        </Link>
      </li>
      <li>
        <Link
          href="/cart"
          onClick={closeMenu}
          className="flex items-center gap-2 text-base"
        >
          <FaArrowRight className="text-xl" /> View Cart
        </Link>
      </li>
    </ul>
  );

  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden md:block relative" ref={menuRef}>
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
      <div className="md:hidden" ref={menuRef}>
        <button
          onClick={handleToggle}
          className="btn btn-ghost btn-circle avatar"
          aria-label="Open mobile menu"
        >
          <GiHamburgerMenu className="text-2xl" />
        </button>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex"
            id="mobile-menu"
          >
            <div className="w-80 min-h-full bg-white shadow-lg p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Menu</span>
                <button
                  onClick={closeMenu}
                  aria-label="Close menu"
                  className="p-2 hover:bg-gray-200 rounded-full"
                >
                  <MdClose size={24} className="text-primary" />
                </button>
              </div>
              <Menu />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SideMenu;
