"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginUser } from "./actions";
import GetStartedImage from "@/assets/images/getstarted.jpg";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGlobe, FaHeadset } from "react-icons/fa";
import Logo from "@/assets/images/logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (response.success) {
        router.push("/Salondashboard");
      } else {
        toast.success('Login successful!');
        router.push('/salon/dashboard');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-base-100">
      {/* Background Image for Mobile */}
      <div className="absolute inset-0 w-full h-full md:hidden">
        <Image src={GetStartedImage} alt="Background" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Main Content */}
      <div className="relative flex w-full flex-col md:flex-row-reverse">
        {/* Right Half - Background Image (Hidden on Mobile) */}
        <div className="hidden md:block md:w-1/2 relative">
          <Image src={GetStartedImage} alt="Background" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Left Half - Login Form */}
        <div className="relative w-full md:w-1/2 flex justify-center items-center px-6 sm:px-8 md:px-12 lg:px-16 min-h-screen">
          {/* Back Button */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-50">
            <button
              onClick={() => router.back()}
              className="bg-white text-black hover:bg-[#231F20] hover:text-white transition duration-200 px-2 py-1 sm:px-3 sm:py-1 text-[12px] sm:text-xs rounded-md"
            >
              Back
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white/90 shadow-lg border border-gray-200 rounded-xl p-6 w-full max-w-xs sm:max-w-sm md:max-w-md backdrop-blur-md transform transition-all duration-300 hover:shadow-xl flex flex-col items-center">
            {/* Logo Centered */}
            <div className="mb-4">
              <Image src={Logo} alt="Logo" width={200} height={200} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 text-center">Welcome Back</h1>
            <p className="text-gray-500 mb-5 text-center text-sm sm:text-base">Sign in to continue</p>

            <form onSubmit={handleSubmit} className="w-full space-y-3 sm:space-y-4">
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-500 sm:left-4 sm:top-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full p-3 pl-10 text-sm sm:text-base sm:pl-12 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 hover:border-gray-400"
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-500 sm:left-4 sm:top-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full p-3 pl-10 pr-10 text-sm sm:text-base sm:pl-12 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 hover:border-gray-400"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 sm:right-4 sm:top-4"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm sm:text-base rounded-lg font-semibold bg-[#B4004E] text-white shadow-md transition duration-200 hover:bg-[#90003E]"
              >
                {loading ? "Processing..." : "Log In"}
              </button>
              
              {/* Sign Up Link */}
              <p className="mt-4 text-gray-600 text-sm text-center">
                Don't have an account? {" "}
                <Link href="/register" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </form>

        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <div className="mt-4 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}  