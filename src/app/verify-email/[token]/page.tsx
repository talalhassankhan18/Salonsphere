'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) throw new Error('Missing verification token');

        const response = await fetch(`/api/auth/verify/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed');
        }

        // Show success message
        toast.success(data.message || 'Email verified successfully!');

        // Automatically sign in the user after verification
        await signIn('credentials', {
          email: data.email,
          redirect: false,
        });

        // Redirect to salon registration
        router.push(data.redirectTo || '/salon/register');

      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Verification failed');
        router.push('/register');
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
        <p>Please wait while we verify your email address.</p>
      </div>
    </div>
  );
}