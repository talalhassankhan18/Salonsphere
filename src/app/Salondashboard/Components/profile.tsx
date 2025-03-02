"use client";

import React, { useState, useEffect } from "react";
import { fetchVendor } from "@/lib/utils";
import { FaUser, FaImages, FaGlobe, FaHeart, FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [vendor, setVendor] = useState<{
    firstName: string;
    lastName: string;
    businessName: string;
    profileImage?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [newSocialLink, setNewSocialLink] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function getVendor() {
      try {
        const data = await fetchVendor();
        if (data) {
          setVendor(data);
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      } finally {
        setLoading(false);
      }
    }
    getVendor();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const uploadedImage = URL.createObjectURL(event.target.files[0]);
      setImages([...images, uploadedImage]);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-8 flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-base-100 shadow-lg rounded-lg p-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Profile Image */}
          {vendor?.profileImage ? (
            <img
              src={vendor.profileImage}
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-primary shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-300 text-gray-600 shadow-md">
              <FaUser className="text-4xl" />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold">{vendor?.businessName || "Business Name"}</h2>
            <p className="text-sm text-green-500 font-medium">Online</p>
            <p className="text-sm text-base-content/70">No reviews yet</p>
          </div>
        </div>
        <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-base-300 transition">
          <FaEdit />
          Edit Profile
        </button>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Portfolio */}
        <div className="bg-base-100 shadow-lg rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full">
            <FaImages className="text-3xl" />
          </div>
          <h3 className="text-lg font-semibold mt-4">
            {images.length === 0 ? "No images added" : "Your Portfolio"}
          </h3>
          <p className="text-sm text-base-content/70">
            Add images to your online portfolio that best reflect your work.
          </p>
          <input type="file" id="imageUpload" className="hidden" onChange={handleImageUpload} />
          <label htmlFor="imageUpload" className="mt-4 px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition cursor-pointer">
            Add Images
          </label>
          <div className="mt-4 flex gap-3 flex-wrap justify-center">
            {images.map((img, index) => (
              <img key={index} src={img} alt="Uploaded" className="w-32 h-32 object-cover rounded-lg border" />
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="bg-base-100 shadow-lg rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full">
            <FaHeart className="text-3xl" />
          </div>
          <h3 className="text-lg font-semibold mt-4">
            {interests.length === 0 ? "No interests" : "Your Interests"}
          </h3>
          <p className="text-sm text-base-content/70">
            Continue setting up your profile to fill in your interests.
          </p>
          
          {/* Input Field for Adding Interests */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Enter your interest"
              className="border px-3 py-2 rounded-lg w-60"
            />
            <button
              onClick={() => {
                if (newInterest.trim()) {
                  setInterests([...interests, newInterest.trim()]);
                  setNewInterest(""); // Clear input
                }
              }}
              className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Add Interest
            </button>
          </div>

          <div className="mt-4 flex gap-3 flex-wrap justify-center">
            {interests.map((interest, index) => (
              <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm">
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-base-100 shadow-lg rounded-lg p-6 flex flex-col items-center text-center col-span-1 md:col-span-2">
          <div className="w-16 h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full">
            <FaGlobe className="text-3xl" />
          </div>
          <h3 className="text-lg font-semibold mt-4">
            {socialLinks.length === 0 ? "No social links" : "Your Social Links"}
          </h3>
          <p className="text-sm text-base-content/70">
            Add social links to your profile to help build your discoverability.
          </p>

          {/* Input Field for Adding Social Links */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newSocialLink}
              onChange={(e) => setNewSocialLink(e.target.value)}
              placeholder="Enter your social link"
              className="border px-3 py-2 rounded-lg w-60"
            />
            <button
              onClick={() => {
                if (newSocialLink.trim()) {
                  setSocialLinks([...socialLinks, newSocialLink.trim()]);
                  setNewSocialLink(""); // Clear input
                }
              }}
              className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Add Social Link
            </button>
          </div>

          <div className="mt-4 flex gap-3 flex-wrap justify-center">
            {socialLinks.map((link, index) => (
              <a key={index} href={link} target="_blank" className="text-primary underline">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
