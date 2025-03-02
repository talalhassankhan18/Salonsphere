'use client';

import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar'; // Import Sidebar

const AddProfile: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('Add Profile');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />

      {/* Main Content */}
      <div className="flex-1 flex justify-between p-6">
        {/* Form Section */}
        <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold mb-6 text-purple-700">Add Profile</h2>
          <form>
            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter full name"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter email"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
              />
            </div>

            {/* Contact Number */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="contact">
                Contact Number
              </label>
              <input
                type="tel"
                id="contact"
                placeholder="Enter contact number"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
              />
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="address">
                Address
              </label>
              <textarea
                id="address"
                rows={3}
                placeholder="Enter address"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
              ></textarea>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-600 transition duration-300"
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* Image Upload Section */}
        <div className="w-1/3 bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4 text-purple-700">Upload Profile Image</h3>

          {/* Image Placeholder */}
          <div className="relative w-40 h-40 rounded-full bg-gray-200 overflow-hidden mb-4">
            {/* Add your Image Upload logic */}
          </div>

          {/* File Input */}
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            className="hidden"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
          >
            Choose Image
          </label>

          {/* Save Button */}
          <button
            className="mt-4 w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-600 transition duration-300"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProfile;
