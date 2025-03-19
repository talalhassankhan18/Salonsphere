"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GetStartedImage from "@/assets/images/getstarted.jpg";
import Image from "next/image";
import Logo from "@/assets/images/logo.png";
import { FaUserTie, FaUsers, FaGlobe, FaHeadset, FaSignInAlt } from "react-icons/fa";

export default function GetStartedPage() {
  const router = useRouter(); // Added router to fix the back button

  return (
    <div className="relative flex min-h-screen bg-base-100">
      {/* Left Section (Content) */}
      <div
        className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white p-10 relative 
                   md:bg-transparent"
      >
        {/* Background Image for Mobile */}
        <div className="absolute inset-0 w-full h-full md:hidden">
          <Image src={GetStartedImage} alt="Background" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Back Button */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-50">
          <button
            onClick={() => router.back()}
            className="bg-white text-black hover:bg-[#231F20] hover:text-white transition duration-200 
              px-2 py-1 sm:px-3 sm:py-1 text-[12px] sm:text-xs rounded-md shadow-md"
          >
            Back
          </button>
        </div>

        {/* Content Box with Background Blur on Mobile */}
        <div
          className="relative w-full max-w-md text-center px-6 py-8 bg-white bg-opacity-80 md:bg-transparent 
             md:p-0 rounded-lg md:rounded-none shadow-md md:shadow-none z-10 flex flex-col justify-center items-center"
        >
          {/* <h1 className="text-2xl font-extrabold text-primary mb-2">Continue to</h1> */}
          {/* Logo Centered */}
          <div className="mb-4 flex justify-center">
            <Image src={Logo} alt="Logo" width={300} height={300} />
          </div>
          {/* Heading with Icon
          <div className="flex items-center justify-center space-x-3 mb-6">
            <FaSignInAlt className="text-2xl md:text-3xl text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">Sign up / Log in</h1>
          </div> */}

          {/* Customer Option */}
          <div className="w-full mb-4 md:mb-6">
            <Link
              href="/"
              className="w-full flex items-center justify-between p-4 md:p-6 border border-neutral rounded-lg shadow-sm transition-all duration-200 
                hover:shadow-lg hover:bg-primary hover:text-primary-content group bg-white md:bg-transparent"
            >

              <div className="text-left w-full">
                <h2 className="font-bold text-lg md:text-xl group-hover:text-primary-content transition-colors duration-200">
                  SalonSphere for customers
                </h2>
                <p className="text-neutral text-sm md:text-base group-hover:text-primary-content transition-colors duration-200">
                  Book salons and spas near you & Buy <br /> Beauty Products
                </p>
              </div>
              {/* Icons on the Right with Margin & Padding */}
              <div className="flex items-center space-x-6">
                <FaUsers className="text-6xl md:text-6xl text-primary group-hover:text-primary-content transition-colors duration-200 p-2" />
              </div>
            </Link>
          </div>

          {/* Professionals Option */}
          <div className="w-full mb-4 md:mb-6">
            <Link
              href="/register"
              className="w-full flex items-center justify-between p-4 md:p-8 border border-neutral rounded-lg shadow-sm transition-all duration-200 
                        hover:shadow-lg hover:bg-primary hover:text-primary-content group bg-white md:bg-transparent"
            >
              <div className="text-left w-full">
                <h2 className="font-bold text-lg md:text-xl group-hover:text-primary-content transition-colors duration-200">
                  SalonSphere for professionals
                </h2>
                <p className="text-neutral text-sm md:text-base group-hover:text-primary-content transition-colors duration-200">
                  Manage and grow your business
                </p>
              </div>
              {/* Icons on the Right with Margin & Padding */}
              <div className="flex items-center space-x-5">
                <FaUserTie className="text-5xl md:text-5xl text-primary group-hover:text-primary-content transition-colors duration-200 p-2" />
              </div>
            </Link>
          </div>
          {/* Language and Support Buttons */}
          <div className="mt-4 flex justify-center space-x-3 sm:mt-6 sm:space-x-4">
            <button className="flex items-center space-x-1 text-white bg-gray-700 px-3 py-1 text-xs sm:text-sm sm:px-4 sm:py-2 rounded-lg hover:bg-gray-800">
              <FaGlobe />
              <span>Language</span>
            </button>
            <button className="flex items-center space-x-1 text-white bg-gray-700 px-3 py-1 text-xs sm:text-sm sm:px-4 sm:py-2 rounded-lg hover:bg-gray-800">
              <FaHeadset />
              <span>Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Section (Image for Desktop) */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url(${GetStartedImage.src})`,
        }}
      ></div>
    </div>
  );

}