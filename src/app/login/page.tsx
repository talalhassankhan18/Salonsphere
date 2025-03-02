"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginUser } from "./actions";
import GetStartedImage from "@/assets/images/getstarted.jpg";
import { FaUser, FaLock, FaArrowLeft } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await loginUser({}, formData);

      if (response.success) {
        router.push("/Salondashboard");
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("An error occurred during login.");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-base-100">
      {/* Left Section: Login Form */}
      <div className="w-1/2 flex flex-col justify-center items-center px-12 relative">
        {/* Back Button (Upper Left Corner) */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-[#231F20] hover:bg-[#231F20] hover:text-[#FFFFFF] transition duration-200 px-4 py-2 rounded-md"
        >
          Back
        </button>


        {/* Branding */}
        <h2 className="text-5xl font-extrabold text-primary mb-2">SalonSphere</h2>
        <p className="text-base text-gray-600 italic mb-6">"Where Beauty Meets Excellence"</p>

        {/* Form Card */}
        <div className="bg-white/80 shadow-xl border border-gray-200 rounded-2xl p-10 w-full max-w-md backdrop-blur-lg transform transition-all duration-300 hover:shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-3 text-center">Welcome Back!</h1>
          <p className="text-gray-500 mb-6 text-center">Log in to continue managing your business.</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-4 pl-12 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 hover:border-gray-400"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <FaLock className="absolute left-4 top-4 text-gray-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full p-4 pl-12 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 hover:border-gray-400"
              />
            </div>

            {/* Error Message */}
            {error && <p className="text-error text-sm text-center">{error}</p>}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg font-semibold text-lg bg-primary text-primary-content shadow-md transition-all duration-300 transform hover:bg-secondary hover:text-primary-content hover:scale-[1.02]"
            >
              {loading ? "Processing..." : "Log in"}
            </button>
          </form>

          {/* Signup Link */}
          <p className="mt-4 text-gray-600 text-sm text-center">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          {/* Footer */}
          <div className="flex justify-between text-sm text-gray-500 mt-6">
            <Link href="/" className="hover:text-primary">Language</Link>
            <Link href="/support" className="hover:text-primary">Support</Link>
          </div>
        </div>
      </div>

      {/* Right Section: Background Image */}
      <div className="w-1/2 relative">
        <Image src={GetStartedImage} alt="Get Started" fill className="object-cover rounded-l-lg" />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
    </div>
  );
}
