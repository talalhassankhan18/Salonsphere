"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Logo from "@/assets/images/logo.png";
import { IoClose } from "react-icons/io5";

const ProfilePage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/customers/${id}`);
        if (!res.ok) throw new Error("Failed to fetch customer profile");
        const data = await res.json();
        setCustomer(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session, id]);

  const handleClose = () => {
    router.push("/");
  };

  if (!session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      <div className="relative z-10 bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <IoClose size={24} />
        </button>

        <div className="flex justify-center mb-6">
          <img src={Logo.src} alt="logo" className="h-12" />
        </div>

        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Your Profile
        </h1>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <strong>Name:</strong> {customer.name}
            </div>
            <div>
              <strong>Email:</strong> {customer.email}
            </div>
            <div>
              <strong>Verified:</strong> {customer.isVerified ? "Yes" : "No"}
            </div>
            <div>
              <strong>Auth Method:</strong> {customer.authMethod}
            </div>
            <div>
              <strong>Joined:</strong>{" "}
              {new Date(customer.createdAt).toLocaleDateString()}
            </div>
            <div>
              <strong>Total Orders:</strong> {customer.orders?.length || 0}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
