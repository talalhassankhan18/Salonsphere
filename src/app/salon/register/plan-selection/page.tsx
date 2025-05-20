"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/common/LoadingSpinner";
import toast from "react-hot-toast";
import {
  getSession,
  setSession,
  clearAllRegistrationSessions,
} from "@/lib/session";
import { CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

interface PlanData {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  productLimit: number;
  features: string[];
  isActive: boolean;
  upgradedAt?: string;
}

const plans: PlanData[] = [
  {
    name: "Starter",
    monthlyPrice: 300,
    yearlyPrice: 300 * 12 * 0.9,
    productLimit: 0,
    features: [
      "Online Appointment",
      "Social Media Integration",
      "Profile Customization",
      "Reminders",
      "Business Listing",
    ],
    isActive: true,
  },
  {
    name: "Basic",
    monthlyPrice: 4199,
    yearlyPrice: 4199 * 12 * 0.9,
    productLimit: 100,
    features: [
      "Product Listing",
      "Product Order Tracking",
      "Commission",
      "Online Appointment",
      "Social Media Integration",
      "Profile Customization",
      "Reminders",
      "Business Listing",
    ],
    isActive: true,
  },
  {
    name: "Premium",
    monthlyPrice: 8399,
    yearlyPrice: 8399 * 12 * 0.9,
    productLimit: 0, // Unlimited
    features: [
      "Product Listing",
      "Product Order Tracking",
      "Commission",
      "Online Appointment",
      "Analytics",
      "Advertisement Boost",
      "Social Media Integration",
      "Profile Customization",
      "Reminders",
      "Business Listing",
      "Priority Support",
    ],
    isActive: true,
  },
];

const commonFeatures = [
  "Product Listing",
  "Product Order Tracking",
  "Commission",
  "Online Appointment",
  "Analytics",
  "Advertisement Boost",
  "Social Media Integration",
  "Profile Customization",
  "Reminders",
  "Business Listing",
  "Priority Support",
];

export default function PlanSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanData | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  useEffect(() => {
    const sessionEmail = getSession("salon_registration_email");
    const paramsEmail = searchParams.get("email") || "";
    const action = searchParams.get("action");
    const selectedPlanName = searchParams.get("selectedPlan");

    // Set email from session or params
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

    // Pre-select plan from query parameter
    if (selectedPlanName) {
      const plan = plans.find((p) => p.name === selectedPlanName);
      if (plan) {
        setSelectedPlan(plan);
        localStorage.setItem("selectedPlan", JSON.stringify(plan));
        console.log("PlanSelectionPage: Pre-selected plan:", plan);
      }
    }

    const checkProgressAndPlan = async () => {
      try {
        // Handle upgrades for authenticated users
        if (
          action === "upgrade" &&
          status === "authenticated" &&
          session?.user?.email
        ) {
          if (session.user.email.toLowerCase() !== email.toLowerCase()) {
            toast.error(
              "Email mismatch. Please use the same email as your account."
            );
            router.push("/salon/login");
            return;
          }
          // Fetch current plan for upgrade
          const planResponse = await fetch("/api/register/plan-selection", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email,
              action: "get",
            }),
          });
          const planData = await planResponse.json();
          console.log(
            "PlanSelectionPage: Current plan response (upgrade):",
            planData
          );

          if (planData.success && planData.plan) {
            setCurrentPlan(planData.plan);
          } else {
            setCurrentPlan(null);
          }

          // For upgrades, check progress but allow proceeding to payment
          const progressResponse = await fetch("/api/salon/progress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-action": "upgrade",
            },
            body: JSON.stringify({ email }),
          });
          const progressData = await progressResponse.json();
          console.log(
            "PlanSelectionPage: Progress check response (upgrade):",
            progressData
          );

          if (progressData.error) {
            throw new Error(progressData.error);
          }

          if (
            progressData.nextStep !== "/salon/register/plan-selection" &&
            progressData.nextStep !== "/salon/register/payment"
          ) {
            toast(
              `Please complete previous steps. Redirecting to ${progressData.nextStep.replace(
                "/salon/register/",
                ""
              )}`,
              {
                icon: "👋",
                duration: 5000,
              }
            );
            router.push(
              `${progressData.nextStep}?email=${encodeURIComponent(email)}`
            );
            return;
          }

          return; // Allow staying on plan selection or proceeding to payment
        }

        // For non-upgrades or unauthenticated upgrades, check registration progress
        if (status === "loading") {
          return; // Wait for session to load
        }

        if (action === "upgrade" && status === "unauthenticated") {
          toast.error("Please log in to upgrade your plan.");
          router.push(
            `/salon/login?redirect=/salon/register/plan-selection?email=${encodeURIComponent(
              email
            )}&action=upgrade${
              selectedPlanName ? `&selectedPlan=${selectedPlanName}` : ""
            }`
          );
          return;
        }

        // Check progress for new registrations
        const progressResponse = await fetch("/api/salon/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sessionEmail || paramsEmail }),
        });
        const progressData = await progressResponse.json();
        console.log(
          "PlanSelectionPage: Progress check response:",
          progressData
        );

        if (progressData.error) {
          throw new Error(progressData.error);
        }

        if (
          progressData.paymentStatus === "completed" &&
          progressData.isActive &&
          action !== "upgrade"
        ) {
          toast.success("Registration already completed. Please log in.", {
            duration: 5000,
          });
          clearAllRegistrationSessions();
          router.push(
            `/salon/login?email=${encodeURIComponent(
              sessionEmail || paramsEmail
            )}`
          );
          return;
        }

        if (progressData.nextStep !== "/salon/register/plan-selection") {
          toast(
            `Please complete previous steps. Redirecting to ${progressData.nextStep.replace(
              "/salon/register/",
              ""
            )}`,
            {
              icon: "👋",
              duration: 5000,
            }
          );
          router.push(
            `${progressData.nextStep}?email=${encodeURIComponent(
              sessionEmail || paramsEmail
            )}`
          );
          return;
        }

        // Fetch current plan for new registration
        const planResponse = await fetch("/api/register/plan-selection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: sessionEmail || paramsEmail,
            action: "get",
          }),
        });
        const planData = await planResponse.json();
        console.log("PlanSelectionPage: Current plan response:", planData);

        if (planData.success && planData.plan) {
          setCurrentPlan(planData.plan);
        } else {
          setCurrentPlan(null);
        }
      } catch (err: any) {
        console.error("PlanSelectionPage: Progress or plan check failed:", err);
        toast.error(err.message || "Failed to check your progress or plan");
        router.push("/salon/register/basic-info");
      }
    };

    if (sessionEmail || paramsEmail) {
      checkProgressAndPlan();
    }
  }, [router, searchParams, session, status]);

  const handleSelect = async (plan: PlanData, action: "set" | "upgrade") => {
    if (isLoading) {
      toast.error("Please wait, plan selection in progress...");
      return;
    }

    setIsLoading(true);
    setSelectedPlan(plan);
    localStorage.setItem("selectedPlan", JSON.stringify(plan));
    console.log(
      `PlanSelectionPage: ${
        action === "upgrade" ? "Upgrading" : "Selecting"
      } plan:`,
      plan
    );

    const toastId = toast.loading(
      `${action === "upgrade" ? "Upgrading" : "Saving"} plan...`
    );

    try {
      const response = await fetch("/api/register/plan-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan, action }),
      });

      const data = await response.json();
      console.log(`PlanSelectionPage: Plan ${action} API response:`, data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to ${action === "upgrade" ? "upgrade" : "save"} plan`
        );
      }

      toast.success(
        `Plan ${action === "upgrade" ? "upgraded" : "selected"} successfully!`,
        {
          id: toastId,
          duration: 5000,
        }
      );
      router.push(
        `/salon/register/payment?email=${encodeURIComponent(
          email
        )}&action=${action}`
      );
    } catch (err: any) {
      console.error(`PlanSelectionPage: Plan ${action} failed:`, err);
      toast.error(
        err.message ||
          `Failed to ${action === "upgrade" ? "upgrade" : "save"} plan`,
        {
          id: toastId,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (
    status === "unauthenticated" &&
    searchParams.get("action") === "upgrade"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to upgrade your plan.
          </p>
          <button
            className="px-4 py-2 bg-[#B4004E] text-white rounded-lg hover:bg-[#9a0042]"
            onClick={() =>
              router.push(
                `/salon/login?redirect=/salon/register/plan-selection?email=${encodeURIComponent(
                  email
                )}&action=upgrade${
                  selectedPlan ? `&selectedPlan=${selectedPlan.name}` : ""
                }`
              )
            }
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  const validUpgrades: Record<string, string[]> = {
    Starter: ["Basic", "Premium"],
    Basic: ["Premium"],
    Premium: [],
  };
  const currentPlanName = currentPlan?.name || "Starter";
  const canUpgrade = (planName: string) =>
    validUpgrades[currentPlanName].includes(planName);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col items-center p-4 md:p-10 transition-all duration-300">
      <div className="mb-6">
        <Image
          src="/assets/images/logo.png"
          alt="Salon Sphere Logo"
          width={150}
          height={50}
          className="object-contain"
        />
      </div>

      <div className="w-full max-w-5xl text-center mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#B4004E] mb-3">
          {currentPlan ? "Upgrade Your Plan" : "Choose the "}
          {currentPlan && (
            <span className="underline decoration-gray-400">Perfect Plan</span>
          )}
        </h1>
        <p className="text-sm text-gray-600">
          {currentPlan
            ? `Current Plan: ${currentPlanName}. Upgrade for more features!`
            : "Flexible pricing for businesses at every stage. Try risk-free for 14 days."}
        </p>
      </div>

      <div className="flex items-center space-x-4 mt-6 bg-gray-900 text-white p-2 rounded-lg shadow-lg text-xs">
        {["monthly", "yearly"].map((cycle) => (
          <button
            key={cycle}
            className={`px-4 py-1 rounded-lg font-semibold transition-all ${
              billingCycle === cycle ? "bg-white text-black" : "text-gray-300"
            }`}
            onClick={() => setBillingCycle(cycle as "monthly" | "yearly")}
          >
            {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
          </button>
        ))}
        <span className="bg-yellow-500 text-black px-2 py-1 rounded-md font-bold text-xs">
          Save 10%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-10">
        {plans.map((plan) => {
          const isPopular = plan.name === "Basic";
          const isCurrentPlan = currentPlan?.name === plan.name;
          const isSelected = selectedPlan?.name === plan.name;
          const canUpgradeTo = canUpgrade(plan.name);
          const displayPrice =
            billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
          const duration =
            billingCycle === "yearly" ? "Yearly Plan" : "Monthly Plan";
          const support = plan.features.includes("Priority Support")
            ? "Priority Support"
            : "Email Support";
          const featureMatch: Record<string, boolean | string> = {
            "Product Listing": plan.features.includes("Product Listing"),
            "Product Order Tracking": plan.features.includes(
              "Product Order Tracking"
            ),
            Commission: plan.features.includes("Commission"),
            "Online Appointment": plan.features.includes("Online Appointment"),
            Analytics: plan.features.includes("Analytics"),
            "Advertisement Boost": plan.features.includes(
              "Advertisement Boost"
            ),
            "Social Media Integration": plan.features.includes(
              "Social Media Integration"
            ),
            "Profile Customization": plan.features.includes(
              "Profile Customization"
            ),
            Reminders: plan.features.includes("Reminders"),
            "Business Listing": plan.features.includes("Business Listing"),
            "Priority Support": plan.features.includes("Priority Support"),
            "Product Limit": `${
              plan.productLimit === 0
                ? plan.name === "Starter"
                  ? "0"
                  : "Unlimited"
                : plan.productLimit
            } products`,
          };

          return (
            <div
              key={plan.name}
              className={`relative border rounded-xl p-6 transition-all duration-300 transform 
                bg-white shadow-md w-full md:w-80 flex flex-col justify-between hover:shadow-lg hover:scale-[1.02]
                ${
                  isSelected
                    ? "border-[#B4004E] ring-2 ring-[#B4004E] shadow-lg shadow-[#B4004E]/20"
                    : isCurrentPlan
                    ? "border-gray-500 opacity-75"
                    : "border-gray-300"
                }`}
            >
              {isPopular && (
                <span className="absolute top-3 right-3 bg-[#B4004E] text-white px-2 py-1 rounded-md text-xs font-semibold">
                  Most Popular
                </span>
              )}

              {isCurrentPlan && (
                <span className="absolute top-0 left-0 bg-gray-500 text-white px-3 py-1 rounded-tl-lg rounded-br-md text-xs font-semibold">
                  Current Plan
                </span>
              )}

              {isSelected && !isCurrentPlan && (
                <span className="absolute top-0 left-0 bg-[#B4004E] text-white px-3 py-1 rounded-tl-lg rounded-br-md text-xs font-semibold">
                  Selected
                </span>
              )}

              <div className="flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500">{support}</p>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-bold text-gray-900">
                    ₨{displayPrice.toLocaleString()}
                    <span className="text-sm font-normal text-gray-500">
                      {billingCycle === "yearly" ? "/yr" : "/mo"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">{duration}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {commonFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center text-sm text-gray-600"
                    >
                      {featureMatch[feature] === true ? (
                        <CheckCircle
                          className="w-5 h-5 text-green-500 mr-2"
                          aria-label="Feature included"
                        />
                      ) : featureMatch[feature] === false ? (
                        <XCircle
                          className="w-5 h-5 text-red-500 mr-2"
                          aria-label="Feature not included"
                        />
                      ) : (
                        <span className="w-5 h-5 mr-2 inline-block" />
                      )}
                      {typeof featureMatch[feature] === "string"
                        ? featureMatch[feature]
                        : feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200
                  ${
                    isCurrentPlan
                      ? "bg-gray-400 cursor-not-allowed"
                      : isSelected
                      ? "bg-[#B4004E] hover:bg-[#9a0042]"
                      : canUpgradeTo || !currentPlan
                      ? "bg-[#B4004E] hover:bg-[#9a0042]"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                onClick={() =>
                  !isCurrentPlan &&
                  (canUpgradeTo || !currentPlan) &&
                  handleSelect(plan, currentPlan ? "upgrade" : "set")
                }
                disabled={
                  isCurrentPlan || (!canUpgradeTo && currentPlan !== null)
                }
              >
                {isCurrentPlan
                  ? "Current Plan"
                  : isSelected
                  ? "Selected"
                  : canUpgradeTo || !currentPlan
                  ? currentPlan
                    ? "Upgrade Now"
                    : "Select Plan"
                  : "Not Available"}
              </button>
            </div>
          );
        })}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}