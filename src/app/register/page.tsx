'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AccountStep from "./steps/AccountStep";
import SalonStep from "./steps/SalonStep";
import { signIn, useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

interface SalonData {
  salonName: string;
  salonAddress: string;
  salonCity: string;
  salonProvince: string;
  salonZip: string;
  salonPhone: string;
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const urlStep = searchParams.get("step");
  const initialStep = urlStep === "2" ? 2 : 1;
  const [step, setStep] = useState<1 | 2>(initialStep);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const { data: session, status, update } = useSession();

  useEffect(() => {
    const urlError = searchParams.get("error");
    const verifiedParam = searchParams.get("verified");

    if (urlError) {
      const decodedError = decodeURIComponent(urlError.replace(/\+/g, " "));
      setError(decodedError);
      toast.error(decodedError);
    }

    if (verifiedParam === "true") {
      setEmailVerified(true);
      setStep(2);
    }

    const validateUser = async () => {
      if (status === "authenticated" && session?.user) {
        const user = session.user as {
          _id: string;
          name: string;
          email: string;
          role: "admin" | "salon_admin" | "customer" | "super_admin" | "salonOwner";
          registrationStatus: "started" | "completed";
          emailVerified: boolean;
          salon?: string;
        };

        try {
          const response = await fetch(`/api/users/${user._id}`);
          if (!response.ok) {
            await signOut({ redirect: false });
            setError("User not found. Please register again.");
            toast.error("User not found. Please register again.");
            setStep(1);
            router.replace("/register");
            return;
          }

          if (user.registrationStatus === "completed") {
            router.push("/Salondashboard");
          } else if (user.emailVerified || emailVerified) {
            setStep(2);
            setEmailVerified(true);
          } else if (urlStep === "2") {
            setError("Email not verified. Please verify your email.");
            toast.error("Email not verified. Please verify your email.");
            setStep(1);
            router.replace("/register");
          }
        } catch (err) {
          console.error("Error validating user:", err);
          await signOut({ redirect: false });
          setError("Error validating user. Please register again.");
          toast.error("Error validating user. Please register again.");
          setStep(1);
          router.replace("/register");
        }
      } else if (status === "unauthenticated" && urlStep === "2") {
        setError("Please sign in to continue registration.");
        toast.error("Please sign in to continue registration.");
        router.push("/Login");
      }
    };

    validateUser();
  }, [searchParams, status, session, router, urlStep, emailVerified]);

  useEffect(() => {
    const handleVerification = async () => {
      if (step === 2 && status === "authenticated" && !session?.user.emailVerified) {
        setIsVerifying(true);
        try {
          await update();
          if (session?.user.emailVerified) {
            setEmailVerified(true);
          }
        } catch (err) {
          console.error("Failed to refresh session:", err);
          toast.error("Failed to verify email. Please try again.");
        } finally {
          setIsVerifying(false);
        }
      }
    };
    handleVerification();
  }, [step, status, session, update]);

  const handleAccountSubmit = async (accountData: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register/step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Account registration failed");
      }

      const signInResult = await signIn("credentials", {
        redirect: false,
        email: accountData.email,
        password: accountData.password,
      });

      if (signInResult?.error) {
        throw new Error("Failed to sign in after registration");
      }

      toast.success("Verification email sent! Please check your inbox.");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signIn("google", { redirect: false });
    } catch (err: any) {
      setError(err.message || "Google sign-in failed. Please try again.");
      toast.error(err.message || "Google sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalonSubmit = async (salonData: SalonData) => {
    if (!session?.user?._id) {
      toast.error("Session expired. Please sign in again.");
      router.push("/Login");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const backendData = {
        name: salonData.salonName,
        address: salonData.salonAddress,
        city: salonData.salonCity,
        province: salonData.salonProvince,
        zip: salonData.salonZip,
        phone: salonData.salonPhone,
        userId: session.user._id,
      };

      const response = await fetch("/api/auth/register/step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save salon information");
      }

      await update({
        ...session,
        user: {
          ...session.user,
          salon: data.salonId,
          registrationStatus: "completed",
        },
      });

      toast.success("Registration completed successfully!");
      router.push("/Salondashboard");
    } catch (err: any) {
      setError(err.message || "Failed to complete registration. Please try again.");
      toast.error(err.message || "Failed to complete registration.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
        <div className="text-center">
          <p className="text-gray-600">
            {isVerifying ? "Verifying your email..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <Image
            src="/assets/images/logo.png"
            alt="SalonSphere Logo"
            width={100}
            height={100}
            className="mx-auto rounded-full"
            priority
          />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500 mt-4">
            SalonSphere
          </h1>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">
            {step === 1 ? "Create your account" : "Complete salon details"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 ? "Start your journey with us" : "Tell us about your business"}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
        )}

        <div className="flex items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    1
                  </div>
                  <span className="text-xs mt-1 text-gray-500">Account</span>
                </div>
                <div className="flex-1 h-1 mx-2 bg-gray-200">
                  <div
                    className={`h-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
                    style={{ width: step > 1 ? "100%" : "0%" }}
                  ></div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    2
                  </div>
                  <span className="text-xs mt-1 text-gray-500">Salon</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <AccountStep
              onComplete={handleAccountSubmit}
              isLoading={isLoading}
              emailVerified={emailVerified}
            />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading || status === "authenticated"}
              className={`w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center ${
                isLoading || status === "authenticated" ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              Continue with Google
            </button>
          </div>
        ) : (
          <SalonStep
            onComplete={handleSalonSubmit}
            onBack={() => {
              setStep(1);
              router.replace("/register");
            }}
            isLoading={isLoading}
          />
        )}

        <div className="text-center text-sm space-y-2">
          <p className="text-gray-600">
            {step === 1 ? "Already have an account?" : "Need to change account details?"}{" "}
            <Link
              href={step === 1 ? "/Login" : "/register"}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {step === 1 ? "Sign in" : "Go back"}
            </Link>
          </p>
          <p className="text-gray-500 text-xs">
            By registering, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:text-blue-800">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}