'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Components/Sidebar'; // Adjust path as necessary

const AddProducts: React.FC = () => {
  const router = useRouter();

  // State to track active menu
  const [activeMenu, setActiveMenu] = useState<string>('Add Products');

  // Handler for menu clicks
  const handleMenuClick = (label: string) => {
    setActiveMenu(label);
    const menuRoutes: Record<string, string> = {
      'Add Profile': '/Vendor/AddProfile',
      'Add Services': '/Vendor/AddServices',
      'Add Salon About': '/Vendor/AddAbout',
      'Add Products': '/Vendor/AddProducts',
      'View Service Orders': '/Vendor/ViewServiceOrders',
      'View Product Orders': '/Vendor/ViewProductOrders',
      'View Reviews': '/Vendor/ViewReviews',
      'View Analytics': '/Vendor/ViewAnalytics',
    };

    if (menuRoutes[label]) {
      router.push(menuRoutes[label]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />

      {/* Main Content */}
      <main className="w-4/5 p-8 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Page Heading */}
          <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
            Add Product Details
          </h2>

          {/* Form */}
          <form>
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    placeholder="Enter product title"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Enter product description"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  ></textarea>
                </div>

                {/* Max Allowed in Cart */}
                <div>
                  <label htmlFor="maxAllowed" className="block text-gray-700 font-semibold mb-2">
                    Max Allowed in Cart
                  </label>
                  <input
                    type="number"
                    id="maxAllowed"
                    placeholder="Enter maximum quantity allowed"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label htmlFor="rating" className="block text-gray-700 font-semibold mb-2">
                    Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="rating"
                    placeholder="Enter product rating (e.g., 4.5)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* How To Use */}
                <div>
                  <label htmlFor="howToUse" className="block text-gray-700 font-semibold mb-2">
                    How To Use
                  </label>
                  <input
                    type="text"
                    id="howToUse"
                    placeholder="Explain how to use the product"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-gray-700 font-semibold mb-2">
                    Price (in $)
                  </label>
                  <input
                    type="number"
                    id="price"
                    placeholder="Enter product price"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Discount */}
                <div>
                  <label htmlFor="discount" className="block text-gray-700 font-semibold mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    id="discount"
                    placeholder="Enter discount percentage"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Salon Ref ID */}
                <div>
                  <label htmlFor="salonRefId" className="block text-gray-700 font-semibold mb-2">
                    Salon Ref ID
                  </label>
                  <input
                    type="text"
                    id="salonRefId"
                    placeholder="Enter salon reference ID"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Variations */}
                <div>
                  <label htmlFor="variations" className="block text-gray-700 font-semibold mb-2">
                    Variations
                  </label>
                  <input
                    type="text"
                    id="variations"
                    placeholder="E.g., Size: Small, Medium | Color: Red, Blue"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                className="w-1/2 bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-600 transition duration-300"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddProducts;
