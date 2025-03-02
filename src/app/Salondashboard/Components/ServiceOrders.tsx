"use client";

import React, { useState } from "react";

const sampleOrders = [
  { id: 54321, customer: "Emma Johnson", date: "Feb 20, 2025", status: "Completed", service: "Haircut & Styling", total: "$50.00" },
  { id: 54322, customer: "David Lee", date: "Feb 18, 2025", status: "In Progress", service: "Facial Treatment", total: "$70.00" },
  { id: 54323, customer: "Sophia Martinez", date: "Feb 16, 2025", status: "Pending", service: "Nail Art", total: "$30.00" },
  { id: 54324, customer: "James Anderson", date: "Feb 14, 2025", status: "Canceled", service: "Massage Therapy", total: "$90.00" },
];

export default function ServiceOrders() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500 text-white";
      case "In Progress":
        return "bg-blue-500 text-white";
      case "Completed":
        return "bg-green-500 text-white";
      case "Canceled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const filteredOrders = sampleOrders.filter(
    (order) =>
      (filter === "All" || order.status === filter) &&
      (order.customer.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toString().includes(search))
  );

  return (
    <div className="min-h-screen bg-base-200 p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-base-content">Service Orders</h1>
        <p className="text-base-content/70 mt-2">Manage and track all your service orders efficiently.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center justify-between bg-base-100 shadow-md p-4 rounded-lg">
        <input
          type="text"
          placeholder="Search by Order ID or Customer Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          className="border border-gray-300 p-2 rounded-lg w-full md:w-1/4 mt-2 md:mt-0 focus:outline-none focus:ring-2 focus:ring-primary"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Orders</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Canceled">Canceled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="mt-6 bg-base-100 shadow-lg rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-sm font-semibold text-gray-700">Order ID</th>
              <th className="p-4 text-sm font-semibold text-gray-700">Customer</th>
              <th className="p-4 text-sm font-semibold text-gray-700">Date</th>
              <th className="p-4 text-sm font-semibold text-gray-700">Service</th>
              <th className="p-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-700">Total</th>
              <th className="p-4 text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4">{order.id}</td>
                  <td className="p-4">{order.customer}</td>
                  <td className="p-4">{order.date}</td>
                  <td className="p-4">{order.service}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">{order.total}</td>
                  <td className="p-4">
                    <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition">
                      View Order
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
