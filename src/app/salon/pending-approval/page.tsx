'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

const PendingApprovalPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [salon, setSalon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please sign in to continue');
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.isVerified !== true) {
      toast.error('Please verify your email first');
      router.push('/login');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchPendingSalon = async () => {
      if (status === 'authenticated' && session?.user?.isVerified) {
        try {
          const response = await fetch('/api/salon/pending', {
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await response.json();

          if (!response.ok) {
            toast.error(data.message || 'Failed to fetch pending salon');
            return;
          }

          setSalon(data.salon);
        } catch (error) {
          console.error('Error fetching pending salon:', error);
          toast.error('Failed to fetch pending salon');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPendingSalon();
  }, [status, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status !== 'authenticated' || session?.user?.isVerified !== true) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Salon Approval Pending</h1>
      {salon ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {salon.basicInfo.salonName}
          </h2>
          <p className="text-gray-600 mb-4">
            Your salon registration is under review. We’ll notify you at{' '}
            <span className="font-medium">{salon.basicInfo.email}</span> once it’s
            approved.
          </p>
          <div className="mb-4">
            <h3 className="text-lg font-medium">Details Submitted:</h3>
            <p>Type: {salon.salonType}</p>
            <p>Location: {salon.location.address}, {salon.location.city}</p>
            <p>Status: {salon.status}</p>
          </div>
          <button
            onClick={() => router.push('/salon/dashboard')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <p className="text-gray-600">
          No pending salon found. Please contact support if this is an error.
        </p>
      )}
    </div>
  );
};

export default PendingApprovalPage;