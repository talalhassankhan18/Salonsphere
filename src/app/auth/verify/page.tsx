// app/auth/verify/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verify = async () => {
      if (token) {
        const res = await fetch(`/api/verify-customer?token=${token}`);
        if (res.ok) {
          router.push("/auth/signin"); // redirect on success
        } else {
          alert("Verification failed. Please try again.");
        }
      }
    };
    verify();
  }, [token]);

  return <p>Verifying your account...</p>;
}
