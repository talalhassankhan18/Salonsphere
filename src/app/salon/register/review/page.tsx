"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import RegistrationStepper from "../../components/RegistrationStepper";
import LoadingSpinner from "@/common/LoadingSpinner";
import toast from "react-hot-toast";

interface ReviewData {
  plan: any;
  basicInfo: any;
  payment: any;
  profile: any;
  services: string[];
}

export default function ReviewPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user?.email) {
      toast.error("Please sign in to continue.");
      router.push("/login");
    } else {
      loadReviewData(session.user.email);
    }
  }, [session, status, router]);

  const loadReviewData = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/register/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setReviewData(data);
        toast.success("Review data loaded successfully!");
      } else {
        throw new Error("Failed to load review data");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load review data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.loading("Finalizing registration...");

    try {
      const response = await fetch("/api/register/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email, finalize: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to finalize registration");
      }

      toast.success("Registration completed successfully!");
      await fetch("/api/draft/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email }),
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to finalize registration");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <LoadingSpinner />;
  }

  if (!reviewData) {
    return <div>Loading review data...</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", color: "#333", marginBottom: "20px" }}>
        Review Your Information
      </h1>
      <RegistrationStepper currentStep="Review" />

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <h2 style={{ fontSize: "18px", color: "#B4004E" }}>Plan</h2>
          <p>Name: {reviewData.plan?.name}</p>
          <p>Price: {reviewData.plan?.price}</p>
          <p>Product Limit: {reviewData.plan?.productLimit}</p>
          <p>Billing Cycle: {reviewData.plan?.billingCycle}</p>
        </div>

        <div>
          <h2 style={{ fontSize: "18px", color: "#B4004E" }}>Basic Info</h2>
          <p>Name: {reviewData.basicInfo?.name}</p>
          <p>Email: {reviewData.basicInfo?.email}</p>
          <p>Phone: {reviewData.basicInfo?.phone}</p>
          <p>Username: {reviewData.basicInfo?.username}</p>
          <p>Salon Name: {reviewData.basicInfo?.salonName}</p>
          <p>Address: {reviewData.basicInfo?.address}</p>
        </div>

        <div>
          <h2 style={{ fontSize: "18px", color: "#B4004E" }}>Payment</h2>
          <p>Card Number: {reviewData.payment?.cardNumber}</p>
          <p>Expiry: {reviewData.payment?.expiry}</p>
          <p>CVV: {reviewData.payment?.cvv}</p>
        </div>

        <div>
          <h2 style={{ fontSize: "18px", color: "#B4004E" }}>Profile</h2>
          <p>Description: {reviewData.profile?.description}</p>
          <p>Logo: <a href={reviewData.profile?.logo} target="_blank">{reviewData.profile?.logo}</a></p>
          <p>Images: {reviewData.profile?.images?.length} uploaded</p>
        </div>

        <div>
          <h2 style={{ fontSize: "18px", color: "#B4004E" }}>Services</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {reviewData.services?.map((service: string) => (
              <li key={service}>✓ {service}</li>
            ))}
          </ul>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleSubmit}
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
            {isLoading ? <LoadingSpinner /> : "Complete Registration"}
          </button>
        </div>
      </div>
    </div>
  );
}