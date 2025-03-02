'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Sidebar from '../Components/Sidebar';
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ViewAnalytics: React.FC = () => {
  const router = useRouter();

  // State to track active menu
  const [activeMenu, setActiveMenu] = useState<string>('View Analytics');

  // Navigation handler
  const navigateTo = (path: string, label: string) => {
    setActiveMenu(label);
    router.push(path); // Using Next.js's router for navigation
  };

  // Sample data for analytics
  const [analyticsData, setAnalyticsData] = useState({
    totalOrders: 150,
    totalSales: 5000,
    commissionEarned: 250,
    avgOrderValue: 33.33,
    topVendor: 'Salon A',
  });

  // Sample data for charts (e.g., monthly sales)
  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [500, 1000, 750, 1200, 1500],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex h-screen bg-gray-100">
    {/* Sidebar */}
    <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />
      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-semibold mb-6 text-purple-700">View Analytics</h1>

        {/* Analytics Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Analytics Cards */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-purple-700">Overview</h2>
            <ul className="space-y-4">
              <li className="text-gray-700">
                <span className="font-bold">Total Orders:</span> {analyticsData.totalOrders}
              </li>
              <li className="text-gray-700">
                <span className="font-bold">Total Sales:</span> ${analyticsData.totalSales}
              </li>
              <li className="text-gray-700">
                <span className="font-bold">Commission Earned:</span> ${analyticsData.commissionEarned}
              </li>
              <li className="text-gray-700">
                <span className="font-bold">Average Order Value:</span> ${analyticsData.avgOrderValue.toFixed(2)}
              </li>
              <li className="text-gray-700">
                <span className="font-bold">Top Vendor:</span> {analyticsData.topVendor}
              </li>
            </ul>
          </div>

          {/* Chart Section */}
          <div className="bg-white shadow-md rounded-lg p-6 col-span-1 sm:col-span-2 lg:col-span-2">
            <h2 className="text-xl font-semibold text-purple-700 mb-4">Monthly Sales Analytics</h2>
            <Bar data={chartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Sales per Month' } } }} />
          </div>
        </div>

        {/* Placeholder for additional charts or metrics */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-purple-700">Additional Charts and Graphs</h2>
          <p className="text-gray-700">(You can add more charts here)</p>
          {/* Insert more chart components */}
        </div>
      </div>
    </div>
  );
};

export default ViewAnalytics;
