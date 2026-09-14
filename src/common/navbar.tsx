"use client";
import React, { useState, useEffect } from "react";
import Logo from "@/assets/images/logo.png";
import Link from "next/link";
import CartNavbar from "./cart-navbar";
import { FiSearch, FiHeart, FiMenu, FiX } from "react-icons/fi";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [pathname, setPathname] = useState("");
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  const getLinkClasses = (path: string) =>
    `relative py-2 transition-all duration-300 
    ${pathname === path
      ? "text-black font-semibold after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-black"
      : "text-gray-600 hover:text-black hover:after:content-[''] hover:after:absolute hover:after:left-0 hover:after:bottom-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-black"
    }`;

  const toggleAccountDropdown = () => {
    setAccountDropdownOpen((prev) => !prev);
  };

  const handleLogoutClick = async () => {
    await signOut({ redirect: false });
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/auth/signin");
  };

  const getInitial = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleReportIssueClick = () => {
    router.push("/report-issue");
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleOrdersClick = () => {
    if (session?.user?.id) {
      router.push(`/order-history/${session.user.id}`);
    }
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleNotificationsClick = () => {
    if (session?.user?.id) {
      router.push(`/notifications/${session.user.id}`);
    }
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (session?.user?.id) {
      router.push(`/profile/${session.user.id}`);
    }
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleBookingsClick = () => {
    router.push("/bookings");
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // Handle search submission
  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/search?query=${encodeURIComponent(search.trim())}`);
      setSearch(""); // Clear the search input
      setMobileMenuOpen(false); // Close mobile menu if open
    }
  };

  // Handle Enter key press for search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
    <nav className="bg-base-100 shadow-md font-poppins fixed top-0 left-0 w-full z-50">
      {/* md+: 3-column grid with equal outer columns so the links are truly
          centred while the logo stays left and cart/profile stay right.
          Fixed height so the spacer below can match it exactly. */}
      <div className="container mx-auto h-[4.5rem] px-6 flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
        <Link className="flex items-center md:justify-self-start" href="/">
          <img src={Logo.src} alt="logo" className="h-9" />
        </Link>

        <ul className="hidden md:flex items-center space-x-6 text-sm font-medium md:justify-self-center">
          <li>
            <Link href="/" className={getLinkClasses("/")}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/salons" className={getLinkClasses("/salons")}>
              Salons
            </Link>
          </li>
          <li>
            <Link
              href="/selfcare-products"
              className={getLinkClasses("/selfcare-products")}
            >
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
          <li>
            <Link
              href="/Support"
              className={getLinkClasses("/Support")}
            >
              Support
            </Link>
          </li>
        </ul>

        {/* Right-aligned actions: cart + account. Kept as a list because the
            auth branches below render <li>. */}
        <ul className="hidden md:flex items-center space-x-4 md:justify-self-end">
          <li className="flex items-center">
            {/* <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-gray-100 text-sm px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <FiSearch
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={handleSearch}
              />
            </div>
            <FiHeart className="text-xl cursor-pointer hover:text-gray-700 transition-colors duration-200" /> */}
            <CartNavbar initialCartCount={0} />
          </li>
          {session?.user?.role === "admin" ||
            session?.user?.role === "super_admin" ? (
            <li>
              <button
                onClick={handleLogoutClick}
                className={getLinkClasses("/logout")}
              >
                Logout
              </button>
            </li>
          ) : session?.user?.role === "customer" && session.user.name ? (
            <li className="relative">
              <button
                onClick={toggleAccountDropdown}
                className="flex items-center gap-2 focus:outline-none"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white font-bold text-sm shadow-md transform hover:scale-105 transition-transform duration-200">
                  {getInitial()}
                </span>
              </button>
              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 p-2 z-50 transform transition-all duration-200 ease-in-out">
                  <ul className="space-y-1">
                    <li>
                      <div className="px-3 py-1.5 text-xs text-gray-700 font-medium bg-gray-50 rounded-md">
                        <p className="truncate">
                          {session.user.email || "No email"}
                        </p>
                      </div>
                    </li>
                    <li>
                      <button
                        onClick={handleReportIssueClick}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center gap-1.5"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Report Issue
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleOrdersClick}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center gap-1.5"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Orders
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleNotificationsClick}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center gap-1.5"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0119 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        Notifications
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleBookingsClick}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center gap-1.5"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Your Bookings
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center gap-1.5"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Profile
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogoutClick}
                        className="w-full text-left px-3 py-1.5 text-xs text-red-600 font-medium hover:bg-red-50 rounded-md transition-colors duration-150 flex items-center gap-1.5"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </li>
          ) : (
            <li>
              <Link href="/auth/signin" className={getLinkClasses("/login")}>
                Login
              </Link>
            </li>
          )}
        </ul>

        <div className="md:hidden flex items-center space-x-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-xl focus:outline-none"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <div className="flex items-center space-x-2">
            {/* <FiHeart className="text-xl cursor-pointer hover:text-gray-700 transition-colors duration-200" /> */}
            <CartNavbar initialCartCount={0} />
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-base-100 shadow-md p-4 z-50">
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link href="/" className={getLinkClasses("/")}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/salons" className={getLinkClasses("/salons")}>
                  Salons
                </Link>
              </li>
              <li>
                <Link
                  href="/selfcare-products"
                  className={getLinkClasses("/selfcare-products")}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link href="/Vendor" className={getLinkClasses("/Vendor")}>
                  For Business
                </Link>
              </li>
              <li>
                <Link
                  href="/ContactUs"
                  className={getLinkClasses("/ContactUs")}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/Support"
                  className={getLinkClasses("/Support")}
                >
                  Support
                </Link>
              </li>
              {/* <li>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-gray-100 text-sm px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                  <FiSearch
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                    onClick={handleSearch}
                  />
                </div>
              </li> */}
              {session?.user?.role === "admin" ||
                session?.user?.role === "super_admin" ? (
                <li>
                  <button
                    onClick={handleLogoutClick}
                    className={getLinkClasses("/logout")}
                  >
                    Logout
                  </button>
                </li>
              ) : session?.user?.role === "customer" && session.user.name ? (
                <li className="relative">
                  <button
                    onClick={toggleAccountDropdown}
                    className="flex items-center gap-2 focus:outline-none w-full text-left py-2"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white font-bold text-sm shadow-md">
                      {getInitial()}
                    </span>
                    Account
                  </button>
                  {accountDropdownOpen && (
                    <div className="mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 p-2">
                      <ul className="space-y-1">
                        <li>
                          <div className="px-3 py-1.5 text-xs text-gray-700 font-medium bg-gray-50 rounded-md">
                            <p className="truncate">
                              {session.user.email || "No email"}
                            </p>
                          </div>
                        </li>
                        <li>
                          <button
                            onClick={handleReportIssueClick}
                            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center gap-1.5"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Report Issue
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={handleOrdersClick}
                            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center gap-1.5"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Orders
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={handleNotificationsClick}
                            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center gap-1.5"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0119 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                              />
                            </svg>
                            Notifications
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={handleBookingsClick}
                            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center gap-1.5"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Your Bookings
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={handleProfileClick}
                            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center gap-1.5"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Profile
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={handleLogoutClick}
                            className="w-full text-left px-3 py-1.5 text-xs text-red-600 font-medium hover:bg-red-50 rounded-md transition-colors duration-150 flex items-center gap-1.5"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Sign Out
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </li>
              ) : (
                <li>
                  <Link
                    href="/auth/signin"
                    className={getLinkClasses("/login")}
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
    {/* The nav is position:fixed, so reserve its height in normal flow —
        otherwise the top 4.5rem of every page renders underneath it. */}
    <div aria-hidden className="h-[4.5rem]" />
    </>
  );
};

export default Navbar;