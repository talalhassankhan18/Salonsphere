"use client";

import React, { useState, useEffect } from "react";
import { createVendor } from "./actions";
import { useActionState } from "react";
import Link from "next/link";
import Logo from "@/assets/images/logo.png";
import Navbar from "@/common/navbar";


export default function SignUpForm() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const [data, action, isPending] = useActionState(createVendor, undefined);
  const [registrationNumber, setRegistrationNumber] = useState("");

  // Assuming that the registration number is fetched or generated here.
  useEffect(() => {
    // For now, let's simulate fetching the registration number (in real use, this may be an API call)
    const fetchRegistrationNumber = () => {
      // Example of setting an auto-generated registration number
      setRegistrationNumber("GL-" + Math.floor(Math.random() * 1000000));
    };

    fetchRegistrationNumber();
  }, []); // Empty dependency array means it runs only once on mount

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <div className="flex items-center justify-center p-5 min-h-screen bg-gradient-to-r from-[#ffc759] to-[#ebe9f7]">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
          <div className="flex justify-evenly">
            <h2 className="text-3xl font-bold text-center text-[#333] mb-6">
              Sign up
            </h2>
            <img src={Logo.src} alt="logo" className="h-10 hidden md:block " />
          </div>

          <form action={action} method="POST">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* First Name Field */}
              <div className="mb-4">
                <label htmlFor="firstName" className="block text-lg text-[#333] mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="w-full p-3 border-2 border-[#ccc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc759]"
                  placeholder="Enter your first name"
                  required
                />
                {data?.errors?.firstName && (
                  <p className="text-red-500 text-sm">{data?.errors?.firstName}</p>
                )}
              </div>

              {/* Last Name Field */}
              <div className="mb-4">
                <label htmlFor="lastName" className="block text-lg text-[#333] mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="w-full p-3 border-2 border-[#ccc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc759]"
                  placeholder="Enter your last name"
                  required
                />
                {data?.errors?.lastName && (
                  <p className="text-red-500 text-sm">{data?.errors?.lastName}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-lg text-[#333] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full p-3 border-2 border-[#ccc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc759]"
                  placeholder="Enter your email"
                  required
                />
                {data?.errors?.email && (
                  <p className="text-red-500 text-sm">{data?.errors?.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-lg text-[#333] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full p-3 border-2 border-[#ccc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc759]"
                  placeholder="Enter your password"
                  required
                />
                {data?.errors?.password && (
                  <p className="text-red-500 text-sm">{data?.errors?.password}</p>
                )}
              </div>

              {/* Mobile Number Field */}
              <div className="mb-4">
                <label htmlFor="mobileNumber" className="block text-lg text-[#333] mb-2">
                  Mobile Number
                </label>
                <input
                  type="text"
                  id="mobileNumber"
                  name="mobileNumber"
                  className="w-full p-3 border-2 border-[#ccc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc759]"
                  placeholder="Enter your mobile number"
                  required
                />
                {data?.errors?.mobileNumber && (
                  <p className="text-red-500 text-sm">{data?.errors?.mobileNumber}</p>
                )}
              </div>

              {/* Country Field */}
              <div className="mb-4">
                <label htmlFor="country" className="block text-lg text-[#333] mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  className="w-full p-3 border-2 border-[#ccc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc759]"
                  placeholder="Enter your country"
                  required
                />
                {data?.errors?.country && (
                  <p className="text-red-500 text-sm">{data?.errors?.country}</p>
                )}
              </div>

              {/* Shop Name Field */}
              <div className="mb-4">
                <label htmlFor="shopName" className="block text-lg text-[#333] mb-2">
                  Shop Name
                </label>
                <input
                  type="text"
                  id="shopName"
                  name="shopName"
                  className="w-full p-3 border-2 border-[#ccc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc759]"
                  placeholder="Enter your shop name"
                  required
                />
                {data?.errors?.shopName && (
                  <p className="text-red-500 text-sm">{data?.errors?.shopName}</p>
                )}
              </div>

              {/* City Field */}
              <div className="mb-4">
                <label htmlFor="city" className="block text-lg text-[#333] mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="w-full p-3 border-2 border-[#ccc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc759]"
                  placeholder="Enter your city"
                  required
                />
                {data?.errors?.city && (
                  <p className="text-red-500 text-sm">{data?.errors?.city}</p>
                )}
              </div>

              {/* Area Field */}
              <div className="mb-6">
                <label htmlFor="area" className="block text-lg text-[#333] mb-2">
                  Area
                </label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  className="w-full p-3 border-2 border-[#ccc] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc759]"
                  placeholder="Enter your area"
                  required
                />
                {data?.errors?.area && (
                  <p className="text-red-500 text-sm">{data?.errors?.area}</p>
                )}
              </div>
            </div>

            {/* Business Registration Number */}
            <div className="mb-4">
              <label htmlFor="registrationNumber" className="block text-lg text-[#333]">
                Business Registration Number
              </label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                value={registrationNumber || ""}
                readOnly
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100 text-[#333]"
              />
              <p className="text-sm text-gray-500 mt-1">
                Your registration number is auto-generated and cannot be changed.
              </p>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="mb-4">
              <label htmlFor="agreeToTerms" className="flex items-center text-lg text-[#333]">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  className="mr-2"
                  required
                />
                I agree to the{" "}
                <a href="/terms-and-conditions" className="text-[#ffc759] hover:underline ml-1">
                  terms and conditions
                </a>
              </label>
              {data?.errors?.agreeToTerms && (
                <p className="text-red-500 text-sm">{data?.errors?.agreeToTerms}</p>
              )}
            </div>

            {/* Error Message */}
            {data?.message && (
              <p className="text-green-500 text-sm mb-4">{data?.message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full p-3 bg-[#ffc759] text-white text-lg rounded-lg hover:bg-[#f8b03c] transition duration-300"
            >
              {isPending ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-[#333]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#ffc759] hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
