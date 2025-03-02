"use client";

import React, { useState } from "react";
import { useTheme } from "@/app/Salondashboard/Components/ThemeProvider";

interface Order {
  id: string;
  customer: string;
  date: string;
  status: "Pending" | "Completed" | "Canceled";
  total: number;
}

const initialOrders: Order[] = [
  { id: "ORD123", customer: "John Doe", date: "2024-02-10", status: "Pending", total: 120 },
  { id: "ORD124", customer: "Jane Smith", date: "2024-02-11", status: "Completed", total: 75 },
  { id: "ORD125", customer: "Mike Johnson", date: "2024-02-12", status: "Canceled", total: 200 },
];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const { theme } = useTheme(); // Get theme context

  const updateStatus = (id: string, newStatus: Order["status"]) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const deleteOrder = (id: string) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-background">
      <div className="max-w-5xl mx-auto bg-card shadow-lg rounded-lg p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-primary">Orders</h2>
        <p className="text-muted-foreground">Manage all your customer orders efficiently.</p>

        <div className="overflow-x-auto mt-4 md:mt-6">
          <table className="w-full border-collapse shadow-md rounded-lg">
            <thead>
              <tr className="bg-muted text-primary">
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left hidden sm:table-cell">Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left hidden sm:table-cell">Total ($)</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted transition">
                    <td className="p-3 font-mono text-primary">{order.id}</td>
                    <td className="p-3 text-foreground">{order.customer}</td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{order.date}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === "Completed"
                            ? "bg-success text-success-content"
                            : order.status === "Pending"
                            ? "bg-warning text-warning-content"
                            : "bg-error text-error-content"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 hidden sm:table-cell text-foreground">${order.total}</td>
                    <td className="p-3 flex flex-col sm:flex-row gap-2">
                      <select
                        className="border rounded-md px-2 py-1 bg-card text-foreground"
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value as Order["status"])}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Canceled">Canceled</option>
                      </select>
                      <button
                        className="bg-[#E63946] text-white px-3 py-1 rounded-md hover:bg-[#E63946]/80 transition"
                        onClick={() => deleteOrder(order.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
