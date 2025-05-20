"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaUser, FaLock } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      toast.error("Please wait, login in progress...");
      return;
    }

    if (!email || !password) {
      setError("Please provide both email and password");
      toast.error("Please provide both email and password");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Logging in...");

    try {
      // Use environment variables for super admin credentials
      const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || "Superadmin@gmail.com";
      const superAdminPassword = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD || "Superadmin@123";

      // Validate credentials against environment variables
      if (email !== superAdminEmail || password !== superAdminPassword) {
        throw new Error("Invalid super admin credentials");
      }

      // Simulate a successful login (you can add session storage or other logic here if needed)
      toast.success("Login successful!", { id: toastId, duration: 5000 });
      router.push("/Superadmin/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to login", { id: toastId });
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-2xl rounded-xl p-8 sm:p-10">
        <div className="flex justify-center">
          <Image
            src="/assets/images/logo.png"
            alt="Super Admin Logo"
            width={48}
            height={48}
            className="rounded-full"
          />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Super Admin Login
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Log in to manage the platform
          </p>
        </div>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 sr-only"
            >
              Email
            </label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaUser className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-[#B4004E] transition-all placeholder-gray-400"
              placeholder="Email"
              required
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 sr-only"
            >
              Password
            </label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-[#B4004E] transition-all placeholder-gray-400"
              placeholder="Password"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#B4004E] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#9a0042] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B4004E] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Log In"
            )}
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Forgot Password?{" "}
            Contact Admin for Credentials
          </p>
        </div>
      </div>
    </div>
  );
}