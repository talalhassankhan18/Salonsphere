"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GetStartedImage from "@/assets/images/getstarted.jpg";

export default function GetStartedPage() {
  const router = useRouter(); // Added router to fix the back button

  return (
    <div className="flex min-h-screen relative">
      {/* Left Section */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white relative p-10">
        {/* Back Button - Adjusted Position */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-[#231F20] hover:bg-[#231F20] hover:text-[#FFFFFF] transition duration-200 px-4 py-2 rounded-md"
        >
          Back
        </button>

        <div className="text-center w-full px-10 mt-12">
          <h1 className="text-3xl font-bold mb-8">Sign up/log in</h1>

          {/* Customer Option */}
          <div className="mb-6">
            <Link
              href="/"
              className="w-full flex items-center justify-between p-8 border border-neutral rounded-lg shadow-sm transition-all duration-200 
                         hover:shadow-lg hover:bg-primary hover:text-primary-content group"
            >
              <div className="text-left w-full">
                <h2 className="font-bold text-xl group-hover:text-primary-content transition-colors duration-200">
                  SalonSphere for customers
                </h2>
                <p className="text-neutral text-base group-hover:text-primary-content transition-colors duration-200">
                  Book salons and spas near you & Buy Beauty Products
                </p>
              </div>
              <span className="text-xl text-secondary-content group-hover:text-primary-content transition-colors duration-200">
                &#8594;
              </span>
            </Link>
          </div>

          {/* Professionals Option */}
          <div className="mb-6">
            <Link
              href="/register"
              className="w-full flex items-center justify-between p-8 border border-neutral rounded-lg shadow-sm transition-all duration-200 
                         hover:shadow-lg hover:bg-primary hover:text-primary-content group"
            >
              <div className="text-left w-full">
                <h2 className="font-bold text-xl group-hover:text-primary-content transition-colors duration-200">
                  SalonSphere for professionals
                </h2>
                <p className="text-neutral text-base group-hover:text-primary-content transition-colors duration-200">
                  Manage and grow your business
                </p>
              </div>
              <span className="text-xl text-secondary-content group-hover:text-primary-content transition-colors duration-200">
                &#8594;
              </span>
            </Link>
          </div>
        </div>

        {/* Language & Support Buttons */}
        <div className="flex justify-between w-3/4 text-sm text-neutral mt-12">
          <button className="hover:underline hover:text-info transition-colors duration-200">
            English
          </button>
          <button className="hover:underline hover:text-info transition-colors duration-200">
            Support
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div
        className="w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url(${GetStartedImage.src})`,
        }}
      ></div>
    </div>
  );
}
