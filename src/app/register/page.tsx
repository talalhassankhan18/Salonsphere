"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import GetStartedImage from "@/assets/images/getstarted.jpg";
import { createUser } from "@/app/register/actions"; // Ensure this import is correct
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaGlobe,
  FaHeadset,
} from "react-icons/fa";
import { useAuth } from "@/app/context/AuthContext"; // Import useAuth
import Logo from "@/assets/images/logo.png";

const validDomains = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "hotmail.com",
];

export default function RegisterPage() {
  const router = useRouter();
  const { email, setEmail } = useAuth(); // Using Context API

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: "off",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email") {
      setEmail(value); // Set email in Context API
    }
    setError("");
    setSuccess("");
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email))
      return "Invalid email format (e.g., example@domain.com)";

    const domain = email.split("@")[1];
    if (!validDomains.includes(domain)) {
      return `Invalid email domain: ${domain} does not exist.`;
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const { email, password, confirmPassword, agreeToTerms } = formData;

    if (!email || !password || !confirmPassword || agreeToTerms !== "on") {
      setError("All fields are required, and you must agree to the terms.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      // const response = await createUser({}, formData);

      setLoading(false);

      const payload = new FormData();
      payload.append("email", formData.email);
      payload.append("password", formData.password);
      const response = await createUser({}, payload);
      if (response.success) {
        setEmail(formData.email); // Store email in context
        router.push("/order-tracking"); // Redirect to next form
      } else {
        setError(response.message);
      }
    } catch (error) {
      setLoading(false);
      setError("An error occurred during registration.");
    }
  };

  return (
    <div className="relative flex min-h-screen bg-base-100">
      {/* Background Image for Mobile */}
      <div className="absolute inset-0 w-full h-full md:hidden">
        <Image
          src={GetStartedImage}
          alt="Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Main Content */}
      <div className="relative flex w-full flex-col md:flex-row-reverse">
        {/* Right Half - Background Image (Hidden on Mobile) */}
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            src={GetStartedImage}
            alt="Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Left Half - Registration Form (Now Centered on All Screens) */}
        <div className="relative w-full md:w-1/2 flex justify-center items-center px-6 sm:px-8 md:px-12 lg:px-16 min-h-screen">
          {/* Back Button */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-50">
            <button
              onClick={() => router.back()}
              className="bg-white text-black hover:bg-[#231F20] hover:text-white transition duration-200 
              px-2 py-1 sm:px-3 sm:py-1 text-[12px] sm:text-xs rounded-md"
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

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 text-center">
              Create an Account
            </h1>
            <p className="text-gray-500 mb-5 text-center text-sm sm:text-base">
              Sign up to manage your business effortlessly.
            </p>

            <form
              onSubmit={handleSubmit}
              className="w-full space-y-3 sm:space-y-4"
            >
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

              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-500 sm:left-4 sm:top-4" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full p-3 pl-10 pr-10 text-sm sm:text-base sm:pl-12 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 hover:border-gray-400"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 sm:right-4 sm:top-4"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Agree to Terms */}
              <div className="flex items-center text-xs sm:text-sm">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms === "on"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      agreeToTerms: e.target.checked ? "on" : "off",
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="agreeToTerms" className="text-gray-600">
                  I agree to the terms and conditions
                </label>
              </div>

              {error && (
                <p className="text-red-500 text-xs sm:text-sm">{error}</p>
              )}
              {success && (
                <p className="text-green-600 text-xs sm:text-sm">{success}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm sm:text-base rounded-lg font-semibold bg-[#B4004E] text-white shadow-md transition duration-200 hover:bg-[#90003E]"
              >
                {loading ? "Processing..." : "Sign Up"}
              </button>
              {/* Login Link */}
              <p className="mt-4 text-gray-600 text-sm text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Log in
                </Link>
              </p>
            </form>
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
      </div>
    </div>
  );
}
