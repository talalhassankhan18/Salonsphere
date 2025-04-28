"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import RegistrationStepper from "../../components/RegistrationStepper";
import LoadingSpinner from "@/common/LoadingSpinner";
import toast from "react-hot-toast";

const availableServices = [
  "Haircut",
  "Hair Coloring",
  "Manicure",
  "Pedicure",
  "Facial",
  "Massage",
  "Waxing",
];

export default function ServiceSelectionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user?.email) {
      toast.error("Please sign in to continue.");
      router.push("/login");
    } else {
      loadDraft(session.user.email);
    }
  }, [session, status, router]);

  const loadDraft = async (email: string) => {
    try {
      setIsDraftLoading(true);
      const response = await fetch("/api/draft/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "services" }),
      });
      const data = await response.json();
      if (response.ok && data.draft) {
        setSelectedServices(data.draft.data);
        toast.success("Services draft loaded successfully!");
      }
    } catch (err) {
      console.error("Failed to load draft:", err);
    } finally {
      setIsDraftLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!session?.user?.email) {
      toast.error("Please sign in to save draft");
      return;
    }
    try {
      setIsDraftLoading(true);
      const response = await fetch("/api/draft/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, type: "services", data: selectedServices }),
      });
      if (response.ok) {
        toast.success("Services draft saved successfully!");
      } else {
        throw new Error("Failed to save draft");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save draft");
    } finally {
      setIsDraftLoading(false);
    }
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    setIsLoading(true);
    toast.loading("Saving services...");

    try {
      const response = await fetch("/api/register/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email, services: selectedServices }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save services");
      }

      toast.success("Services saved successfully!");
      router.push("/register/review");
    } catch (err: any) {
      toast.error(err.message || "Failed to save services");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", color: "#333", marginBottom: "20px" }}>
        Select Services
      </h1>
      <RegistrationStepper currentStep="Services" />

      {isDraftLoading ? (
        <LoadingSpinner />
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {availableServices.map((service) => (
              <div
                key={service}
                onClick={() => toggleService(service)}
                style={{
                  padding: "10px",
                  border: `1px solid ${selectedServices.includes(service) ? "#B4004E" : "#ccc"}`,
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: selectedServices.includes(service) ? "#f9e6ec" : "#fff",
                }}
              >
                {service}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              type="button"
              onClick={saveDraft}
              disabled={isDraftLoading || isLoading}
              style={{
                background: "#666",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                cursor: isDraftLoading || isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isDraftLoading ? "Saving Draft..." : "Save Draft"}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: "#B4004E",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? <LoadingSpinner /> : "Continue"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}