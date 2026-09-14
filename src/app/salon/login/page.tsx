"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { FaUser, FaLock } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { setSession, clearAllRegistrationSessions } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      toast.error("Please wait, login in progress...");
      return;
    }

    if (!identifier || !password) {
      setError("Please provide both email/username and password");
      toast.error("Please provide both email/username and password");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Logging in...");

    try {
      // Relative so it works on localhost, previews and production alike
      // (an absolute production URL here sent local logins off-site).
      const callbackUrl = "/salon/dashboard";

      const result = await signIn("salon-credentials-login", {
        redirect: false,
        identifier,
        password,
        callbackUrl,
      });

      console.log("signIn result:", result);

      if (result?.error) {
        setError(result.error);
        if (result.error.includes("Payment incomplete")) {
          setSession("salon_registration_email", identifier);
          toast.error("Payment incomplete. Redirecting to payment page...", {
            id: toastId,
            duration: 3000,
          });
          setTimeout(
            () =>
              router.push(
                `/salon/register/payment?email=${encodeURIComponent(
                  identifier
                )}`
              ),
            3000
          );
        } else if (result.error.includes("Account not verified")) {
          setSession("salon_registration_email", identifier);
          toast.error(
            "Account not verified. Redirecting to verification page...",
            { id: toastId, duration: 3000 }
          );
          setTimeout(
            () =>
              router.push(
                `/salon/verify?email=${encodeURIComponent(identifier)}`
              ),
            3000
          );
        } else if (result.error.includes("Incorrect password")) {
          toast.error("Incorrect password. Please try again.", {
            id: toastId,
            duration: 5000,
          });
        } else if (result.error.includes("Invalid email or username")) {
          toast.error("Invalid email or username. Please check your input.", {
            id: toastId,
            duration: 5000,
          });
        } else {
          toast.error(result.error, { id: toastId, duration: 5000 });
        }
        setIsLoading(false);
        return;
      }

      if (!result?.url) {
        console.error("signIn: No redirect URL returned", result);
        setError("Login failed: No redirect URL provided");
        toast.error("Login failed: Please try again", { id: toastId });
        setIsLoading(false);
        return;
      }

      clearAllRegistrationSessions();
      toast.success("Login successful!", { id: toastId, duration: 5000 });
      router.push(callbackUrl);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login");
      toast.error(err.message || "Failed to login", { id: toastId });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-2xl rounded-xl p-8 sm:p-10">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/assets/images/logo.png"
            alt="Salon Logo"
            width={300}
            height={300}
            className="rounded-full"
          />
        </div>

        {/* Title and Subtitle */}
        <div className="text-center">
          <h2 className="mt-2 text-sm text-gray-600">
            Log in to manage your salon dashboard
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email/Username Field */}
          <div className="relative">
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700 sr-only"
            >
              Email or Username
            </label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaUser className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="identifier"
              id="identifier"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError("");
              }}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-[#B4004E] transition-all placeholder-gray-400"
              placeholder="Email or Username"
              required
              autoComplete="username"
            />
          </div>

          {/* Password Field */}
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

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              href="/salon/forgot-password"
              className="text-sm text-[#B4004E] hover:text-[#9a0042] font-medium transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
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

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              href="/salon/register/basic-info"
              className="font-medium text-[#B4004E] hover:text-[#9a0042] transition-colors"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
