"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RegistrationStepper from "../../components/RegistrationStepper";
import LoadingSpinner from "@/common/LoadingSpinner";
import toast from "react-hot-toast";
import { getSession, setSession, clearAllRegistrationSessions } from "@/lib/session";

interface PlanData {
  name: string;
  price: string;
  productLimit: number;
  billingCycle: string;
}

const plans: PlanData[] = [
  {
    name: "Free Trial",
    price: "Free",
    productLimit: 5,
    billingCycle: "monthly",
  },
  {
    name: "Basic",
    price: "₨4,199/month",
    productLimit: 50,
    billingCycle: "monthly",
  },
  {
    name: "Premium",
    price: "₨8,399/month",
    productLimit: 150,
    billingCycle: "monthly",
  },
];

export default function PlanSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);

  useEffect(() => {
    const sessionEmail = getSession("salon_registration_email");
    const paramsEmail = searchParams.get("email") || "";

    if (sessionEmail) {
      setEmail(sessionEmail);
      console.log("PlanSelectionPage: Email from session:", sessionEmail);
    } else if (paramsEmail) {
      setEmail(paramsEmail);
      setSession("salon_registration_email", paramsEmail);
      console.log("PlanSelectionPage: Email from params:", paramsEmail);
    } else {
      toast.error("Email is required to proceed with plan selection.");
      router.push("/salon/register/basic-info");
      return;
    }

    // Check progress
    const checkProgress = async () => {
      try {
        const response = await fetch("/api/salon/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sessionEmail || paramsEmail }),
        });
        const data = await response.json();
        console.log("PlanSelectionPage: Progress check response:", data);

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.paymentStatus === "completed" && data.isActive) {
          toast.success("Registration already completed. Please log in.", {
            duration: 5000,
          });
          clearAllRegistrationSessions();
          router.push(`/salon/login?email=${encodeURIComponent(sessionEmail || paramsEmail)}`);
          return;
        }

        if (data.nextStep !== "/salon/register/plan-selection") {
          toast(`Please complete previous steps. Redirecting to ${data.nextStep.replace("/salon/register/", "")}`, {
            icon: "👋",
            duration: 5000,
          });
          router.push(`${data.nextStep}?email=${encodeURIComponent(sessionEmail || paramsEmail)}`);
        }
      } catch (err: any) {
        console.error("PlanSelectionPage: Progress check failed:", err);
        toast.error(err.message || "Failed to check your progress");
        router.push("/salon/register/basic-info");
      }
    };

    if (sessionEmail || paramsEmail) {
      checkProgress();
    }
  }, [router, searchParams]);

  const handleSelect = async (plan: PlanData) => {
    if (isLoading) {
      toast.error("Please wait, plan selection in progress...");
      return;
    }

    setIsLoading(true);
    setSelectedPlan(plan);
    localStorage.setItem("selectedPlan", JSON.stringify(plan));
    console.log("PlanSelectionPage: Selected plan:", plan);

    const toastId = toast.loading("Saving plan selection...");

    try {
      const response = await fetch("/api/register/plan-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan }),
      });

      const data = await response.json();
      console.log("PlanSelectionPage: Plan selection API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to save plan selection");
      }

      toast.success("Plan selected successfully!", { id: toastId, duration: 5000 });
      router.push(`/salon/register/payment?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error("PlanSelectionPage: Plan selection failed:", err);
      toast.error(err.message || "Failed to save plan selection", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Select a plan that best suits your salon’s needs.
          </p>
        </div>

        <RegistrationStepper currentStep="Plan Selection" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white shadow-md rounded-lg p-6 text-center ${
                selectedPlan?.name === plan.name ? "border-2 border-[#B4004E]" : ""
              }`}
            >
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">{plan.price}</p>
              <p className="mt-2 text-gray-600">Product Limit: {plan.productLimit}</p>
              <p className="mt-2 text-gray-600">Billing: {plan.billingCycle}</p>
              <button
                onClick={() => handleSelect(plan)}
                disabled={isLoading}
                className="mt-4 w-full bg-[#B4004E] text-white py-3 rounded-lg font-medium hover:bg-[#9a0042] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B4004E] disabled:opacity-50 transition-all"
              >
                {isLoading && selectedPlan?.name === plan.name ? "Selecting..." : "Select Plan"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}