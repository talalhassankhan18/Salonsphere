import React from 'react';
import Link from 'next/link';

const VendorDashboard = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/5 bg-purple-700 text-white p-6">
        <ul className="space-y-4">
          <li>
            <Link href="/Vendor/AddProfile">
              <div className="cursor-pointer p-2 rounded hover:bg-purple-500/20 transition duration-300">
                Add Profile
              </div>
            </Link>
          </li>
          <li>
            <Link href="/Vendor/AddServices">
              <div className="cursor-pointer p-2 rounded hover:bg-purple-500/20 transition duration-300">
                Add Services
              </div>
            </Link>
          </li>
          <li>
            <Link href="/Vendor/AddSalonAbout">
              <div className="cursor-pointer p-2 rounded hover:bg-purple-500/20 transition duration-300">
                Add Salon About
              </div>
            </Link>
          </li>
          <li>
            <Link href="/Vendor/AddProducts">
              <div className="cursor-pointer p-2 rounded hover:bg-purple-500/20 transition duration-300">
                Add Products
              </div>
            </Link>
          </li>
          <li>
            <Link href="/Vendor/ViewServiceOrders">
              <div className="cursor-pointer p-2 rounded hover:bg-purple-500/20 transition duration-300">
                View Service Orders
              </div>
            </Link>
          </li>
          <li>
            <Link href="/Vendor/ViewProductOrders">
              <div className="cursor-pointer p-2 rounded hover:bg-purple-500/20 transition duration-300">
                View Product Orders
              </div>
            </Link>
          </li>
          <li>
            <Link href="/Vendor/ViewReviews">
              <div className="cursor-pointer p-2 rounded hover:bg-purple-500/20 transition duration-300">
                View Reviews
              </div>
            </Link>
          </li>
          <li>
          <Link href="/Vendor/ViewAnalytics">
              <div className="cursor-pointer p-2 rounded hover:bg-purple-500/20 transition duration-300">
                View Analytics
              </div>
            </Link>
            </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Vendor Dashboard</h2>
          <div className="text-gray-700 font-medium">0331-2062376</div>
        </div>

        {/* Table Placeholder */}
        <div className="text-gray-600">
          Select an option from the sidebar to view details.
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
