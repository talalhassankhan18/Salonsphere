"use client";

import React from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from "chart.js";

// Register required chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

// Mock Data
const analyticsData = {
  totalRevenue: 12500,
  totalAppointments: 150,
  newClients: 45,
  topServices: [
    { name: "Haircut", count: 50 },
    { name: "Nail Art", count: 30 },
    { name: "Facial", count: 25 },
    { name: "Tattoo", count: 20 },
  ],
};

// Bar Chart - Revenue Trend
const revenueData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Revenue ($)",
      data: [2000, 2500, 1800, 2200, 2600, 3000],
      backgroundColor: "#4F46E5",
    },
  ],
};

// Line Chart - Appointments Trend
const appointmentsData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [
    {
      label: "Appointments",
      data: [30, 35, 40, 45],
      borderColor: "#10B981",
      borderWidth: 2,
      fill: false,
    },
  ],
};

// Doughnut Chart - Top Services
const topServicesData = {
  labels: analyticsData.topServices.map((service) => service.name),
  datasets: [
    {
      label: "Service Popularity",
      data: analyticsData.topServices.map((service) => service.count),
      backgroundColor: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"],
    },
  ],
};

export default function Analytics() {
  return (
    <div className="p-6 min-h-screen bg-base-200">
      <div className="max-w-6xl mx-auto bg-base-100 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-base-content">Business Analytics</h2>
        <p className="text-base-content/70">Track your business performance and customer engagement.</p>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-primary/10 rounded-lg text-primary text-center">
            <h3 className="text-lg font-bold">${analyticsData.totalRevenue}</h3>
            <p className="text-sm">Total Revenue</p>
          </div>
          <div className="p-4 bg-secondary/10 rounded-lg text-secondary text-center">
            <h3 className="text-lg font-bold">{analyticsData.totalAppointments}</h3>
            <p className="text-sm">Total Appointments</p>
          </div>
          <div className="p-4 bg-green-100 text-green-600 rounded-lg text-center">
            <h3 className="text-lg font-bold">{analyticsData.newClients}</h3>
            <p className="text-sm">New Clients</p>
          </div>
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-lg text-center">
            <h3 className="text-lg font-bold">{analyticsData.topServices[0].name}</h3>
            <p className="text-sm">Top Service</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Revenue Trend</h3>
            <Bar data={revenueData} />
          </div>
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Appointments Growth</h3>
            <Line data={appointmentsData} />
          </div>
          <div className="bg-base-200 p-4 rounded-lg md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">Popular Services</h3>
            <Doughnut data={topServicesData} />
          </div>
        </div>
      </div>
    </div>
  );
}
