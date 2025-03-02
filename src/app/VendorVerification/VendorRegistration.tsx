"use client";

import React, { useEffect, useState, startTransition } from "react";
import { createVendor } from "./actions";
import Link from "next/link";
import { useActionState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function VendorRegistration() {
  const [businessRegistrationNumber, setRegistrationNumber] = useState("SS-");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { email } = useAuth();  // Get email from context
  
  // Generate Business Registration Number
  useEffect(() => {
    const generateRegistrationNumber = () => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setRegistrationNumber(`SS-${randomNum}`);
    };
    generateRegistrationNumber();
  }, []);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setProfileImage(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handling Form Submission
  const [state, formAction, isPending] = useActionState(createVendor, undefined);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    formData.append("businessRegistrationNumber", businessRegistrationNumber);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-5 bg-neutral">
        <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div className="text-center md:text-left">
              <h2 className="text-5xl font-extrabold text-primary mb-2">SalonSphere</h2>
              <p className="text-lg text-gray-600 italic">"Where Beauty Meets Excellence"</p>
              <h3 className="text-2xl font-extrabold text-primary mb-2">Review and Confirm</h3>
              <hr className="border-t-2 border-gray-300 mt-2" />
            </div>

            <div className="flex flex-col items-center">
              <label className="cursor-pointer relative">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <div className="w-32 h-32 rounded-full border-4 border-[#D4A76A] flex items-center justify-center overflow-hidden shadow-lg">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#D4A76A] text-lg font-semibold">Upload</span>
                  )}
                </div>
              </label>
              <p className="text-sm text-gray-500 mt-2">Upload your shop logo</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <input type="hidden" name="businessRegistrationNumber" value={businessRegistrationNumber} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2">
                <label className="form-label">Business Name</label>
                <input type="text" name="businessName" className="form-input" required />
              </div>
              <div>
                <label className="form-label">Business Registration Number</label>
                <input type="text" value={businessRegistrationNumber} className="form-input" disabled />
              </div>
            </div>

            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div><label className="form-label">First Name</label><input type="text" name="firstName" className="form-input" required /></div>
              <div><label className="form-label">Last Name</label><input type="text" name="lastName" className="form-input" required /></div>
              <div><label className="form-label">Email Address</label><input type="email" value={email}  readOnly name="email" className="form-input" required /></div>
            </div>

            {/* Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div><label className="form-label">Phone Number</label><input type="tel" name="phoneNumber" className="form-input" required /></div>
              <div><label className="form-label">Province</label><input type="text" name="province" className="form-input" required /></div>
              <div><label className="form-label">City</label><input type="text" name="city" className="form-input" required /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div><label className="form-label">Shop Number</label><input type="text" name="shopNumber" className="form-input" required /></div>
              <div><label className="form-label">Street</label><input type="text" name="street" className="form-input" required /></div>
              <div><label className="form-label">Area</label><input type="text" name="area" className="form-input" required /></div>
            </div>

            {/* Terms & Conditions */}
            <div className="mt-6">
              <label className="flex items-center text-gray-700">
                <input type="checkbox" name="termsAccepted" className="mr-2" required />
                <span className="mr-1">I agree to the</span>
                <Link href="/terms-and-conditions" className="text-primary hover:underline">terms and conditions</Link>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isPending} 
              className="w-full mt-6 py-3 bg-primary text-white text-lg font-semibold rounded-lg shadow-md hover:bg-[#90003D] transition duration-300"
            >
              {isPending ? "Processing..." : "Review and Confirm"}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .form-label { display: block; font-size: 1rem; font-weight: 600; margin-bottom: 5px; color: #231F20; }
        .form-input { width: 100%; padding: 10px; border: 2px solid #ccc; border-radius: 8px; background-color: #F3F3F3; transition: border-color 0.3s; }
        .form-input:focus { border-color: #B4004E; box-shadow: 0px 0px 5px rgba(180, 0, 78, 0.5); }
      `}</style>
    </>
  );
}
