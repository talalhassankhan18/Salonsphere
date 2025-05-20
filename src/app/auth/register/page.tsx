"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

  useEffect(() => {
    if (verified === "true") {
      setSuccess(
        "Your email has been verified! Remember your password for login."
      );
    }
  }, [verified]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/registercustomer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await response.json();
      setSuccess(data.message);
      setError("");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setSuccess("");
      console.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6 font-poppins">
          Customer Registration
        </h1>
        {error && (
          <p className="text-red-500 text-center mb-4 text-sm bg-red-50 p-2 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-500 text-center mb-4 text-sm bg-green-50 p-2 rounded-lg">
            {success}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
            Register
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
