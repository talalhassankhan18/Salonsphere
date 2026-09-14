// app/auth/verify/page.tsx
"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyPageContent() {
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

// useSearchParams() must sit under a Suspense boundary for static prerendering.
export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPageContent />
    </Suspense>
  );
}
