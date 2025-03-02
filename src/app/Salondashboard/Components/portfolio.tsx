"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaUpload, FaInstagram, FaPlus } from "react-icons/fa";

export default function Portfolio() {
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setPortfolioImages([...portfolioImages, ...newImages]);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-base-200 flex flex-col items-center">
      <div className="max-w-5xl w-full bg-base-100 shadow-lg rounded-lg p-6">
        {/* Portfolio Header */}
        <h2 className="text-2xl font-bold text-base-content">
          Showcase your unique skills with your own portfolio
        </h2>
        <p className="text-base-content/70 mt-2">
          Add images to highlight your best work and attract more clients.
        </p>

        {/* Upload & Instagram Connect Section */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          {/* Upload Images */}
          <label className="flex-1 cursor-pointer border border-primary p-4 rounded-lg flex items-center justify-center gap-2 text-primary hover:bg-primary hover:text-white transition">
            <FaUpload size={20} />
            Upload images manually
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          {/* Connect Instagram */}
          <button
            className={`flex-1 border p-4 rounded-lg flex items-center justify-center gap-2 ${
              isInstagramConnected
                ? "bg-green-500 text-white"
                : "border-primary text-primary hover:bg-primary hover:text-white transition"
            }`}
            onClick={() => setIsInstagramConnected(!isInstagramConnected)}
          >
            <FaInstagram size={20} />
            {isInstagramConnected ? "Connected to Instagram" : "Connect Instagram"}
          </button>
        </div>

        {/* Portfolio Image Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {portfolioImages.length === 0 ? (
            <p className="text-center text-base-content col-span-4">
              No images added. Start by uploading or connecting Instagram.
            </p>
          ) : (
            portfolioImages.map((src, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden">
                <Image
                  src={src}
                  alt={`Portfolio Image ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-32 object-cover"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
