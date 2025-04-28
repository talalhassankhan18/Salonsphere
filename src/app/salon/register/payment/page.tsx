"use client";

import { useState, useEffect, useRef } from "react";
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

interface PaymentFormData {
  cardNumber: string;
  expiry: string;
  cvv: string;
}

interface SalonDetails {
  salonName: string;
  ownerName: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPlanLoading, setIsPlanLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [salonDetails, setSalonDetails] = useState<SalonDetails | null>(null);
  const hasShownToast = useRef(false);

  useEffect(() => {
    const sessionEmail = getSession("salon_registration_email");
    const paramsEmail = searchParams.get("email") || "";

    if (sessionEmail) {
      setEmail(sessionEmail);
      console.log("PaymentPage: Email from session:", sessionEmail);
    } else if (paramsEmail) {
      setEmail(paramsEmail);
      setSession("salon_registration_email", paramsEmail);
      console.log("PaymentPage: Email from params:", paramsEmail);
    } else {
      toast.error("Email is required to proceed with payment.");
      router.push("/salon/register/basic-info");
      return;
    }

    const checkProgress = async () => {
      try {
        const response = await fetch("/api/salon/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sessionEmail || paramsEmail }),
        });
        const data = await response.json();
        console.log("PaymentPage: Progress check response:", data);

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

        // Normalize nextStep to lowercase for comparison
        const normalizedNextStep = data.nextStep?.toLowerCase();
        if (normalizedNextStep !== "/salon/register/payment") {
          if (!hasShownToast.current) {
            console.log("Redirecting to nextStep from /api/salon/progress:", data.nextStep);
            toast(`Complete payment to proceed to ${data.nextStep.replace("/salon/register/", "")}`, {
              icon: "👋",
              duration: 5000,
            });
            hasShownToast.current = true;
          }
          router.push(`${data.nextStep}?email=${encodeURIComponent(sessionEmail || paramsEmail)}`);
          return;
        }

        if (data.exists) {
          let selectedPlan = data.plan;
          // Fallback to localStorage if plan is missing
          if (!selectedPlan) {
            const storedPlan = localStorage.getItem("selectedPlan");
            if (storedPlan) {
              selectedPlan = JSON.parse(storedPlan);
              console.log("PaymentPage: Using plan from localStorage:", selectedPlan);
            }
          }

          // Re-fetch plan from /api/register/plan-selection if still missing
          if (!selectedPlan) {
            console.log("PaymentPage: Re-fetching plan for", sessionEmail || paramsEmail);
            const planResponse = await fetch("/api/register/plan-selection", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: sessionEmail || paramsEmail, action: "get" }),
            });
            const planData = await planResponse.json();
            console.log("PaymentPage: Plan re-fetch response:", planData);
            if (planResponse.ok && planData.plan) {
              selectedPlan = planData.plan;
              localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));
            }
          }

          if (selectedPlan) {
            setPlan(selectedPlan);
            localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));
            const salonResponse = await fetch("/api/salon/details", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: sessionEmail || paramsEmail }),
            });
            const salonData = await salonResponse.json();
            if (salonResponse.ok) {
              if (salonData.isActive) {
                setPaymentCompleted(true);
                setSalonDetails({
                  salonName: salonData.salonName,
                  ownerName: salonData.name,
                });
                if (!hasShownToast.current) {
                  toast("Your payment is completed!", {
                    icon: "🎉",
                    duration: 5000,
                  });
                  hasShownToast.current = true;
                }
              } else {
                if (!hasShownToast.current) {
                  toast("Welcome back! Please complete your payment to continue", {
                    icon: "👋",
                    duration: 5000,
                  });
                  hasShownToast.current = true;
                }
              }
            } else {
              throw new Error("Failed to load salon details");
            }
          } else {
            throw new Error("No plan selected. Please choose a plan.");
          }
        } else {
          throw new Error("Salon not found");
        }
      } catch (err: any) {
        console.error("PaymentPage: Progress check failed:", err);
        toast.error(err.message || "Failed to check your progress. Please select a plan.");
        router.push(`/salon/register/plan-selection?email=${encodeURIComponent(sessionEmail || paramsEmail)}`);
      } finally {
        setIsPlanLoading(false);
      }
    };

    if (sessionEmail || paramsEmail) {
      checkProgress();
    }
  }, [router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.cardNumber || formData.cardNumber.replace(/\D/g, "").length !== 16) {
      return "Invalid card number (16 digits required)";
    }
    if (!formData.expiry || !/^\d{2}\/\d{2}$/.test(formData.expiry)) {
      return "Invalid expiry date (MM/YY format)";
    }
    if (!formData.cvv || formData.cvv.length !== 3) {
      return "Invalid CVV (3 digits required)";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      toast.error("Please wait, payment in progress...");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Processing payment...");

    try {
      const response = await fetch("/api/register/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          plan,
          cardNumber: formData.cardNumber,
          expiry: formData.expiry,
          cvv: formData.cvv,
        }),
      });

      const data = await response.json();
      console.log("Payment API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      toast.success("Your payment is completed! Salon activated successfully", { id: toastId, duration: 5000 });
      setPaymentCompleted(true);

      const salonResponse = await fetch("/api/salon/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const salonData = await salonResponse.json();
      if (salonResponse.ok) {
        setSalonDetails({
          salonName: salonData.salonName,
          ownerName: salonData.name,
        });
      } else {
        toast.error("Failed to load salon details");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process payment", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedFurther = () => {
    clearAllRegistrationSessions();
    localStorage.removeItem("selectedPlan");
    router.push(`/salon/login?email=${encodeURIComponent(email)}`);
  };

  if (isPlanLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (paymentCompleted && salonDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Congratulations!
          </h1>
          <p className="text-lg text-gray-600">
            Welcome {salonDetails.ownerName}, your salon <strong>{salonDetails.salonName}</strong> is active now!
          </p>
          <button
            onClick={handleProceedFurther}
            className="bg-[#B4004E] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#9a0042] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B4004E] transition-all"
          >
            Proceed to Login
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Payment Details
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Complete your payment to activate your salon.
          </p>
        </div>

        <RegistrationStepper currentStep="Payment" />

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Selected Plan</h3>
            <p className="text-gray-600">{plan.name} - {plan.price}</p>
            <p className="text-gray-600">Product Limit: {plan.productLimit}</p>
            <p className="text-gray-600">Billing Cycle: {plan.billingCycle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                Card Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 16);
                  setFormData((prev) => ({ ...prev, cardNumber: value }));
                }}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all"
                required
                maxLength={16}
                placeholder="1234 5678 9012 3456"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                  Expiry (MM/YY) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="expiry"
                  value={formData.expiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
                    if (value.length >= 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
                    setFormData((prev) => ({ ...prev, expiry: value }));
                  }}
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all"
                  required
                  maxLength={5}
                  placeholder="MM/YY"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                  CVV <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
                    setFormData((prev) => ({ ...prev, cvv: value }));
                  }}
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all"
                  required
                  maxLength={3}
                  placeholder="123"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#B4004E] text-white py-3 rounded-lg font-medium hover:bg-[#9a0042] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B4004E] disabled:opacity-50 transition-all"
            >
              {isLoading ? "Processing..." : "Process Payment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}