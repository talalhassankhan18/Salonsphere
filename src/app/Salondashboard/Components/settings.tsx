"use client";

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Settings() {
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  return (
    <div className="p-6 min-h-screen bg-base-200 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-base-100 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-base-content">Settings</h2>
        <p className="text-base-content/70">Manage your personal information and security.</p>

        {/* Personal Info */}
        <div className="border rounded-lg p-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Personal Info</h3>
            <button className="text-primary hover:underline">Edit</button>
          </div>
          <p className="text-gray-600 mt-1">Legal Name</p>
          <p className="text-base-content font-medium">Talal Khan</p>
        </div>

        {/* Contact Details */}
        <div className="border rounded-lg p-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Contact Details</h3>
            <button className="text-primary hover:underline">Edit</button>
          </div>
          <p className="text-gray-600 mt-2">Mobile number</p>
          <div className="flex items-center gap-2">
            <span className="text-base-content font-medium">
              {showPhone ? "+92 1234567890" : "+92 ********810"}
            </span>
            <button onClick={() => setShowPhone(!showPhone)}>
              {showPhone ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <p className="text-gray-600 mt-2">Email address</p>
          <div className="flex items-center gap-2">
            <span className="text-base-content font-medium">
              {showEmail ? "example@gmail.com" : "v*********0@gmail.com"}
            </span>
            <button onClick={() => setShowEmail(!showEmail)}>
              {showEmail ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="border rounded-lg p-4 mt-4">
          <h3 className="font-semibold">Security</h3>
          <p className="text-gray-600 mt-2">Password</p>
          <button className="mt-2 border px-3 py-1 rounded-lg text-primary hover:bg-primary hover:text-white transition">
            Create new password
          </button>

          <p className="text-gray-600 mt-4">Social Logins</p>
          <div className="flex flex-col gap-2 mt-2">
            <button className="border p-2 rounded-lg flex justify-between">
              <span>Google (Connected)</span>
              <span className="text-red-500">Disconnect</span>
            </button>
            <button className="border p-2 rounded-lg flex justify-between">
              <span>Facebook (Not connected)</span>
              <span className="text-primary">Connect</span>
            </button>
            <button className="border p-2 rounded-lg flex justify-between">
              <span>Apple (Not connected)</span>
              <span className="text-primary">Connect</span>
            </button>
          </div>
        </div>

        {/* Online Profile Visibility */}
        <div className="border rounded-lg p-4 mt-4">
          <h3 className="font-semibold">Online Profile Visibility</h3>
          <p className="text-gray-600 mt-2">Hide your professional profile on the marketplace.</p>
          <button className="mt-2 border px-3 py-1 rounded-lg text-primary hover:bg-primary hover:text-white transition">
            Hide Profile
          </button>
        </div>

        {/* Delete Account */}
        <div className="border rounded-lg p-4 mt-4">
          <h3 className="font-semibold text-red-500">Delete Account</h3>
          <p className="text-gray-600 mt-2">
            You will delete all your personal info and won’t be able to retrieve it. Are you sure you
            want to delete your account?
          </p>
          <button className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Delete Your Account
          </button>
        </div>
      </div>
    </div>
  );
}
