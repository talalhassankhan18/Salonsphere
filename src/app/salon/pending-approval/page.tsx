"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface PendingSalon {
  salonName?: string;
  email?: string;
  salonType?: string;
  address?: string;
  isVerified?: boolean;
  paymentStatus?: "pending" | "completed" | "failed";
}

// Shown to a salon owner whose registration is not yet live. Reads the
// owner's own salon via /api/salon/[id] (the page used to call a
// non-existent /api/salon/pending and render fields that no model has).
const PendingApprovalPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [salon, setSalon] = useState<PendingSalon | null>(null);
  const [loading, setLoading] = useState(true);

  const salonId = session?.user?.salonId;

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Please sign in to continue");
      router.push("/salon/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!salonId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/salon/${salonId}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch salon (${res.status})`);
        setSalon(await res.json());
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.warn("Error fetching pending salon:", err);
        toast.error("Failed to load your salon details");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [status, salonId]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null; // Redirect handled in useEffect
  }

  const statusLabel = !salon
    ? "Unknown"
    : !salon.isVerified
      ? "Awaiting email verification"
      : salon.paymentStatus !== "completed"
        ? "Awaiting payment"
        : "Approved";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Salon Approval Pending</h1>
      {salon ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{salon.salonName || "Your salon"}</h2>
          <p className="text-gray-600 mb-4">
            Your salon registration is under review. We’ll notify you at{" "}
            <span className="font-medium">{salon.email || session?.user?.email}</span>{" "}
            once it’s approved.
          </p>
          <div className="mb-4">
            <h3 className="text-lg font-medium">Details Submitted:</h3>
            <p>Type: {salon.salonType || "—"}</p>
            <p>Location: {salon.address || "—"}</p>
            <p>Status: {statusLabel}</p>
          </div>
          <button
            onClick={() => router.push("/salon/dashboard")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <p className="text-gray-600">
          No pending salon found. Please contact support if this is an error.
        </p>
      )}
    </div>
  );
};

export default PendingApprovalPage;
