"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import RegistrationStepper from "../../components/RegistrationStepper";
import LoadingSpinner from "@/common/LoadingSpinner";
import { toast } from "sonner";
import {
  getSession,
  setSession,
  clearAllRegistrationSessions,
} from "@/lib/session";
import convertToSubcurrency from "@/lib/ConvertToSubcurrency";
import CheckoutPage from "../../components/CheckoutPage";
import BillingAddressForm from "@/app/Payment/Checkout/components/BillingAddress";
import {
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover,
  FaPaypal,
  FaGooglePay,
  FaLock,
} from "react-icons/fa";

// Initialize Stripe
if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

interface PlanData {
  name: string;
  monthlyPrice: number; // Price in PKR
  yearlyPrice: number;
  productLimit: number;
  features: string[];
  isActive: boolean;
}

interface SalonDetails {
  salonName: string;
  ownerName: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlanLoading, setIsPlanLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [salonDetails, setSalonDetails] = useState<SalonDetails | null>(null);
  const hasShownToast = useRef(false);

  useEffect(() => {
    const initializePayment = async () => {
      const paramsEmail = searchParams.get("email");
      const sessionEmail = getSession("salon_registration_email");
      const action = searchParams.get("action") || "set";

      console.log("PaymentPage: Query param email:", paramsEmail);
      console.log("PaymentPage: Session email:", sessionEmail);
      console.log("PaymentPage: Action:", action);

      const userEmail = paramsEmail || sessionEmail;

      if (!userEmail) {
        console.error("PaymentPage: No email found in query params or session");
        toast.error("Email is required to proceed with payment.");
        router.push("/salon/register/basic-info");
        return;
      }

      setEmail(userEmail);
      if (!sessionEmail && paramsEmail) {
        setSession("salon_registration_email", userEmail);
        console.log("PaymentPage: Set session email:", userEmail);
      }

      const checkProgress = async () => {
        try {
          const response = await fetch("/api/salon/progress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-action": action,
            },
            body: JSON.stringify({ email: userEmail }),
          });
          const data = await response.json();
          console.log("PaymentPage: Progress check response:", data);

          if (!response.ok || data.error) {
            throw new Error(data.error || "Failed to check progress");
          }

          if (
            data.paymentStatus === "completed" &&
            data.isActive &&
            action !== "upgrade"
          ) {
            if (!hasShownToast.current) {
              toast.success("Registration already completed. Please log in.", {
                duration: 5000,
              });
              hasShownToast.current = true;
            }
            clearAllRegistrationSessions();
            router.push(`/salon/login?email=${encodeURIComponent(userEmail)}`);
            return;
          }

          const normalizedNextStep = data.nextStep?.toLowerCase();
          if (normalizedNextStep !== "/salon/register/payment") {
            if (!hasShownToast.current) {
              console.log(
                "PaymentPage: Redirecting to nextStep:",
                data.nextStep
              );
              toast.info(
                `Please complete the ${data.nextStep.replace(
                  "/salon/register/",
                  ""
                )} step`,
                {
                  duration: 5000,
                }
              );
              hasShownToast.current = true;
            }
            router.push(
              `${data.nextStep}?email=${encodeURIComponent(userEmail)}`
            );
            return;
          }

          let selectedPlan: PlanData | null = null;
          if (action === "upgrade" && data.pendingPlan) {
            selectedPlan = validatePlan(data.pendingPlan);
          } else if (data.plan) {
            selectedPlan = validatePlan(data.plan);
          }

          if (!selectedPlan) {
            const storedPlan = localStorage.getItem("selectedPlan");
            if (storedPlan) {
              try {
                const parsedPlan = JSON.parse(storedPlan);
                selectedPlan = validatePlan(parsedPlan);
                console.log(
                  "PaymentPage: Using plan from localStorage:",
                  selectedPlan
                );
              } catch (err) {
                console.error("PaymentPage: Failed to parse stored plan:", err);
              }
            }
          }

          if (!selectedPlan) {
            console.log("PaymentPage: Re-fetching plan for", userEmail);
            const planResponse = await fetch("/api/register/plan-selection", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: userEmail, action: "get" }),
            });
            const planData = await planResponse.json();
            console.log("PaymentPage: Plan re-fetch response:", planData);
            if (planResponse.ok && planData.plan) {
              selectedPlan = validatePlan(planData.plan);
              localStorage.setItem(
                "selectedPlan",
                JSON.stringify(selectedPlan)
              );
            } else {
              throw new Error("No plan selected. Please choose a plan.");
            }
          }

          setPlan(selectedPlan);

          const salonResponse = await fetch("/api/salon/details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail }),
          });
          const salonData = await salonResponse.json();
          console.log("PaymentPage: Salon details response:", salonData);

          if (!salonResponse.ok || salonData.error) {
            throw new Error(salonData.error || "Failed to load salon details");
          }

          if (salonData.isActive && salonData.paymentStatus === "completed") {
            setPaymentCompleted(true);
            setSalonDetails({
              salonName: salonData.salonName,
              ownerName: salonData.name,
            });
            if (!hasShownToast.current) {
              toast.success("Your payment is completed!", {
                duration: 5000,
              });
              hasShownToast.current = true;
            }
          } else {
            if (!hasShownToast.current) {
              toast.info("Please complete your payment to continue", {
                duration: 5000,
              });
              hasShownToast.current = true;
            }
          }
        } catch (err: any) {
          console.error("PaymentPage: Progress check failed:", err);
          toast.error(
            err.message || "Failed to load payment details. Please try again."
          );
          router.push(
            `/salon/register/plan-selection?email=${encodeURIComponent(
              userEmail
            )}`
          );
        } finally {
          setIsPlanLoading(false);
        }
      };

      checkProgress();
    };

    initializePayment();
  }, [router, searchParams]);

  // Validate plan object and provide defaults for missing fields
  const validatePlan = (plan: any): PlanData => {
    if (!plan || typeof plan !== "object") {
      console.warn("Invalid plan object, using default values:", plan);
      return {
        name: "Unknown",
        monthlyPrice: 0,
        yearlyPrice: 0,
        productLimit: 0,
        features: ["No features available"],
        isActive: false,
      };
    }

    return {
      name: plan.name || "Unknown",
      monthlyPrice:
        typeof plan.monthlyPrice === "number" ? plan.monthlyPrice : 0,
      yearlyPrice: typeof plan.yearlyPrice === "number" ? plan.yearlyPrice : 0,
      productLimit:
        typeof plan.productLimit === "number" ? plan.productLimit : 0,
      features: Array.isArray(plan.features)
        ? plan.features
        : ["No features available"],
      isActive: typeof plan.isActive === "boolean" ? plan.isActive : false,
    };
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    if (isLoading) {
      toast.error("Please wait, payment in progress...");
      return;
    }

    setIsLoading(true);

    try {
      const action = searchParams.get("action") || "set";
      const response = await fetch("/api/register/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          plan,
          paymentIntentId: paymentIntent.id,
          action,
        }),
      });

      const data = await response.json();
      console.log("PaymentPage: Payment API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Payment processing failed");
      }

      toast.success(
        `Your payment is completed! Salon ${
          action === "upgrade" ? "upgraded" : "activated"
        } successfully`,
        {
          duration: 5000,
        }
      );
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
      toast.error(err.message || "Failed to process payment");
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
            Welcome {salonDetails.ownerName}, your salon{" "}
            <strong>{salonDetails.salonName}</strong> is active now!
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

  // Convert PKR to USD (approximate exchange rate: 1 USD = 280 PKR)
  const amountInUSD = plan.monthlyPrice / 280;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
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
            <h3 className="text-lg font-semibold text-gray-900">
              Selected Plan
            </h3>
            <p className="text-gray-600">Plan: {plan.name}</p>
            <p className="text-gray-600">
              Monthly Price: ₨{plan.monthlyPrice} (~${amountInUSD.toFixed(2)})
            </p>
            <p className="text-gray-600">Yearly Price: ₨{plan.yearlyPrice}</p>
            <p className="text-gray-600">Product Limit: {plan.productLimit}</p>
            <p className="text-gray-600">
              Features:{" "}
              {plan.features.length > 0 ? plan.features.join(", ") : "None"}
            </p>
          </div>

          <h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
            <span className="pl-4">Billing Address</span>
          </h3>
          <BillingAddressForm />

          <div className="ml-10">
            <h3 className="ml-28 mt-6 mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
              <span className="pl-4">Payment</span>
            </h3>
          </div>

          <div className="pt-6 mt-6 max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <Elements
              stripe={stripePromise}
              options={{
                mode: "payment",
                amount: convertToSubcurrency(amountInUSD),
                currency: "usd",
              }}
            >
              <CheckoutPage
                amount={amountInUSD}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </Elements>
            <div className="flex gap-2 mt-3 text-gray-500">
              <FaCcVisa size={24} />
              <FaCcMastercard size={24} />
              <FaCcAmex size={24} />
              <FaCcDiscover size={24} />
              <FaPaypal size={24} />
              <FaGooglePay size={24} />
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-3">
              <FaLock className="mr-2" /> Encrypted and secure payments
            </div>
            <p className="text-xs text-gray-500 mt-3">
              By checking out you agree with our{" "}
              <a href="#" className="underline font-medium">
                Terms of Service
              </a>{" "}
              and confirm that you have read our{" "}
              <a href="#" className="underline font-medium">
                Privacy Policy
              </a>
              . You can cancel recurring payments at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}