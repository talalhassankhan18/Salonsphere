"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import GetStartedImage from "@/assets/images/getstarted.jpg";
import { createUser } from "@/app/register/actions"; // Ensure this import is correct
import { FaUser, FaLock, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "@/app/context/AuthContext";  // Import useAuth

const validDomains = ["gmail.com", "outlook.com", "yahoo.com", "icloud.com", "hotmail.com"];

export default function RegisterPage() {
  const router = useRouter();
  const { email, setEmail } = useAuth();  // Using Context API

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: "off",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!emailRegex.test(email)) return "Invalid email format (e.g., example@domain.com)";

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

      const response = await createUser({}, formData);
    if (response.success) {
      setEmail(formData.email);  // Store email in context
      router.push("/VendorVerification");  // Redirect to next form
    }
      
      else {
        setError(response.message);
      }
    } catch (error) {
      setLoading(false);
      setError("An error occurred during registration.");
    }
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

      {/* Form Card */}
      <div className="bg-white/80 shadow-xl border border-gray-200 rounded-2xl p-10 w-full max-w-md backdrop-blur-lg transform transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-3 text-center">Create an Account</h1>
        <p className="text-gray-500 mb-6 text-center">Create an account or log in to manage your business.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-4 text-gray-500" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-4 pl-12 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 hover:border-gray-400"
            />
          </div>
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
          <div className="relative">
            <FaLock className="absolute left-4 top-4 text-gray-500" />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full p-4 pl-12 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 hover:border-gray-400"
            />
          </div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms === "on"}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked ? "on" : "off" })}
                className="mr-2"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                I agree to the terms and conditions
              </label>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-600 text-sm mb-4">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg font-semibold text-lg bg-[#B4004E] text-[#FFFFFF] shadow-md transition duration-200 hover:bg-[#90003E]"
            >
              {loading ? "Processing..." : "Signup"}
            </button>
          </form>

          {/* Already have an account? */}
          <p className="mt-4 text-gray-600 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>

          {/* Footer */}
          <div className="flex justify-between text-sm text-gray-500 mt-6">
            <Link href="/" className="hover:text-primary">Language</Link>
            <Link href="/support" className="hover:text-primary">Support</Link>
          </div>
        </div>
      </div>

      {/* Right Section (Image) */}
      <div className="w-1/2 relative">
        <Image src={GetStartedImage} alt="Get Started" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
    </div>
  );
}
