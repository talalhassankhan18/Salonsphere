// src/app/salon/register/verification.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react"; // Import Suspense
import RegistrationStepper from "../../components/RegistrationStepper";
import LoadingSpinner from "@/common/LoadingSpinner";
import toast from "react-hot-toast";
import { getSession, setSession } from "@/lib/session";

// Component that uses useSearchParams
const VerificationContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState<number | null>(null);

  useEffect(() => {
    const sessionEmail = getSession("salon_registration_email");
    const paramsEmail = searchParams.get("email") || "";

    if (sessionEmail) {
      setEmail(sessionEmail);
      console.log("VerificationPage: Email from session:", sessionEmail);
    } else if (paramsEmail) {
      setEmail(paramsEmail);
      setSession("salon_registration_email", paramsEmail);
      console.log("VerificationPage: Email from params:", paramsEmail);
    } else {
      toast.error("Email is required to proceed.");
      router.push("/salon/register/basic-info");
      return;
    }

    const checkProgressAndSendCode = async () => {
      try {
        const response = await fetch("/api/salon/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sessionEmail || paramsEmail }),
        });
        const data = await response.json();
        console.log("Progress check response:", data);

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.nextStep !== "/salon/register/verification") {
          toast(
            `Welcome back! You left off at ${data.nextStep.replace(
              "/salon/register/",
              ""
            )}`,
            {
              icon: "👋",
              duration: 5000,
            }
          );
          router.push(
            `${data.nextStep}?email=${encodeURIComponent(
              sessionEmail || paramsEmail
            )}`
          );
        } else if (!data.exists) {
          toast.error("Please complete the basic information step first.");
          router.push("/salon/register/basic-info");
        } else if (!isCodeSent && !data.isVerified) {
          const sendCodeResponse = await fetch("/api/register/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: sessionEmail || paramsEmail,
              action: "send",
            }),
          });

          const sendCodeData = await sendCodeResponse.json();
          console.log("Auto-send code API response:", sendCodeData);

          if (!sendCodeResponse.ok || sendCodeData.error) {
            if (sendCodeResponse.status === 429) {
              const waitTime =
                parseInt(sendCodeData.error.match(/\d+/)[0], 10) || 30;
              setResendCooldown(waitTime);
              toast.error(
                `Please wait ${waitTime} seconds before requesting a new code.`,
                {
                  duration: 5000,
                }
              );
            } else {
              throw new Error(
                sendCodeData.error || "Failed to send verification code"
              );
            }
          } else {
            setIsCodeSent(true);
            toast.success(
              "Verification code sent to your email! Check your inbox or spam folder.",
              {
                duration: 5000,
              }
            );
          }
        }
      } catch (err: any) {
        console.error("Progress check or send code failed:", err);
        toast.error(
          err.message ||
            "Failed to send verification email. Please check your email address or contact support.",
          { duration: 7000 }
        );
        router.push("/salon/register/basic-info");
      }
    };

    if (sessionEmail || paramsEmail) {
      checkProgressAndSendCode();
    }
  }, [router, searchParams, isCodeSent]);

  useEffect(() => {
    if (resendCooldown !== null && resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) =>
          prev !== null && prev > 1 ? prev - 1 : null
        );
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleSendCode = async () => {
    if (isLoading) {
      toast.error("Please wait, processing...");
      return;
    }

    if (resendCooldown !== null && resendCooldown > 0) {
      toast.error(
        `Please wait ${resendCooldown} seconds before requesting a new code.`
      );
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Sending verification code...");

    try {
      const response = await fetch("/api/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "send" }),
      });

      const data = await response.json();
      console.log("Send code API response:", data);

      if (!response.ok || data.error) {
        if (response.status === 429) {
          const waitTime = parseInt(data.error.match(/\d+/)[0], 10) || 30;
          setResendCooldown(waitTime);
          throw new Error(
            `Please wait ${waitTime} seconds before requesting a new code`
          );
        }
        throw new Error(data.error || "Failed to send verification code");
      }

      setIsCodeSent(true);
      toast.success(
        "Verification code sent to your email! Check your inbox or spam folder.",
        {
          id: toastId,
          duration: 5000,
        }
      );
    } catch (err: any) {
      console.error("Send code error:", err);
      toast.error(
        err.message ||
          "Failed to send verification email. Please check your email address or contact support.",
        { id: toastId, duration: 7000 }
      );
      setError(
        err.message ||
          "Failed to send verification email. Please try again or contact support."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (isLoading) {
      toast.error("Please wait, processing...");
      return;
    }

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Verifying code...");

    try {
      const response = await fetch("/api/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "verify", code }),
      });

      const data = await response.json();
      console.log("Verify code API response:", data);

      if (!response.ok || data.error) {
        throw new Error(data.error || "Invalid verification code");
      }

      toast.success("Email verified successfully!", {
        id: toastId,
        duration: 5000,
      });
      const redirectUrl = `/salon/register/plan-selection?email=${encodeURIComponent(
        email
      )}`;
      console.log("Redirecting to:", redirectUrl);
      router.push(redirectUrl);
    } catch (err: any) {
      console.error("Verify code error:", err);
      toast.error(err.message || "Invalid verification code", { id: toastId });
      setError(err.message || "Invalid verification code");
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
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Verify Your Email
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            We’ve sent a code to {email}. Check your inbox or spam folder. If
            you don’t receive it, try resending or contact support.
          </p>
        </div>

        <RegistrationStepper currentStep="Verification" />

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-6">
          {!isCodeSent ? (
            <div className="space-y-6">
              <button
                onClick={handleSendCode}
                disabled={
                  isLoading || (resendCooldown !== null && resendCooldown > 0)
                }
                className="w-full bg-[#B4004E] text-white py-3 rounded-lg font-medium hover:bg-[#9a0042] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B4004E] disabled:opacity-50 transition-all"
              >
                {isLoading
                  ? "Sending..."
                  : resendCooldown !== null && resendCooldown > 0
                  ? `Wait ${resendCooldown}s to Send`
                  : "Send Verification Code"}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700"
                >
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(value);
                    setError("");
                  }}
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B4004E] focus:border-transparent transition-all"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                />
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isLoading}
                className="w-full bg-[#B4004E] text-white py-3 rounded-lg font-medium hover:bg-[#9a0042] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B4004E] disabled:opacity-50 transition-all"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                onClick={handleSendCode}
                disabled={
                  isLoading || (resendCooldown !== null && resendCooldown > 0)
                }
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50 transition-all"
              >
                {isLoading
                  ? "Sending..."
                  : resendCooldown !== null && resendCooldown > 0
                  ? `Wait ${resendCooldown}s to Resend`
                  : "Resend Code"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main VerificationPage component with Suspense
export default function VerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}
