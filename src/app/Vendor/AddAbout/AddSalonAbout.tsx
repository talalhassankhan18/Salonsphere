'use client';

import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar'; // Adjust the path as needed

const AddSalonAbout: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('Add Salon About');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center p-6">
        {/* Add Salon About Form */}
        <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-semibold mb-6 text-purple-700">Add Salon About</h2>
          <form>
            {/* Salon Name */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="salonName">
                Salon Name
              </label>
              <input
                type="text"
                id="salonName"
                placeholder="Enter salon name"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
              />
            </div>

            {/* Salon Description */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="salonDescription">
                Salon Description
              </label>
              <textarea
                id="salonDescription"
                rows={4}
                placeholder="Enter salon description"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
              ></textarea>
            </div>

            {/* Salon Location */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="salonLocation">
                Salon Location
              </label>
              <input
                type="text"
                id="salonLocation"
                placeholder="Enter salon location"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
              />
            </div>

            {/* Contact Number */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="contactNumber">
                Contact Number
              </label>
              <input
                type="text"
                id="contactNumber"
                placeholder="Enter contact number"
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-purple-400"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-600 transition duration-300"
            >
              Save About
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSalonAbout;
