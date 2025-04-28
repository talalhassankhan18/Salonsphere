"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      toast.error(error);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  }, [error, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#B4004E] mb-4">Authentication Error</h1>
        <p className="text-gray-600">{error || "An error occurred. Redirecting to login..."}</p>
      </div>
    </div>
  );
}