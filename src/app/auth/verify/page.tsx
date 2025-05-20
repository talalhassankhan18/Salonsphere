// src/app/auth/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Component that uses useSearchParams
const VerifyContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(!!token);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError("Invalid verification link. Please try again.");
        setIsVerifying(false);
        return;
      }

      try {
        const res = await fetch(`/api/verify-customer?token=${token}`);
        if (res.ok) {
          setTimeout(() => {
            router.push("/auth/signin?verified=true"); // Redirect with verified flag
          }, 1000); // Brief delay for UX
        } else {
          const errorData = await res.json();
          setError(errorData.error || "Verification failed. Please try again.");
          setIsVerifying(false);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("An unexpected error occurred. Please try again.");
        setIsVerifying(false);
      }
    };

    verify();
  }, [token, router]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 font-poppins">
            Verifying Your Account
          </h1>
          <div className="flex justify-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
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
          </div>
          <p className="text-gray-600 mt-4">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 font-poppins">
            Verification Failed
          </h1>
          <p className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded-lg">
            {error}
          </p>
          <button
            onClick={() => router.push("/auth/register")}
            className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 font-poppins">
          Verifying Your Account
        </h1>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
};

// Main VerifyPage component with Suspense
export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 font-poppins">
              Loading...
            </h1>
            <div className="flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
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
            </div>
            <p className="text-gray-600 mt-4">Please wait...</p>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
