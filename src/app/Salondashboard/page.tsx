'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface Salon {
  _id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  phone: string;
}

const SalonDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/Login');
    } else if (status === 'authenticated' && session?.user) {
      if (session.user.registrationStatus !== 'completed') {
        router.push('/register?step=2');
      } else if (!['salonOwner', 'salon_admin'].includes(session.user.role)) {
        router.push('/dashboard');
      } else {
        fetchSalonData();
      }
    }
  }, [status, session, router]);

  const fetchSalonData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/salons?userId=${session?.user._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch salon data');
      }
      const data = await response.json();
      setSalon(data);
    } catch (error) {
      toast.error('Failed to load salon data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center">
                <Image
                  src="/assets/images/logo.png"
                  alt="SalonSphere Logo"
                  width={50}
                  height={50}
                  className="rounded-full mr-4"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome, {session.user.name}!
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage your salon operations with ease
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                {salon ? (
                  <>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Salon Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {salon.name}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {salon.address}, {salon.city}, {salon.province} {salon.zip}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {salon.phone}
                      </dd>
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-5 sm:px-6">
                    <p className="text-sm text-gray-600">
                      No salon information available.
                    </p>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonDashboard;