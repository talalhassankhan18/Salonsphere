'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Components/Sidebar';

// State to track active menu
const ViewServiceOrders: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('ViewServiceOrders');
  const router = useRouter(); // Router hook to navigate between pages

  // Navigation handler
  const navigateTo = (path: string, label: string) => {
    setActiveMenu(label);
    router.push(path);
  };

  interface ServiceOrder {
    id: string;
    customerName: string;
    serviceName: string;
    price: string;
    dateTime: string;
    status: string;
  }

  // State to hold sample service order data
  const [orders, setOrders] = useState<ServiceOrder[]>([
    {
      id: "001",
      customerName: "John Doe",
      serviceName: "Haircut",
      price: "$30",
      dateTime: "2024-06-20 10:30 AM",
      status: "Completed",
    },
    {
      id: "002",
      customerName: "Jane Smith",
      serviceName: "Facial",
      price: "$50",
      dateTime: "2024-06-21 01:00 PM",
      status: "Pending",
    },
    {
      id: "003",
      customerName: "Mark Johnson",
      serviceName: "Massage",
      price: "$60",
      dateTime: "2024-06-22 03:00 PM",
      status: "Canceled",
    },
  ]);

  // Handle Cancel and Delete actions
  const handleCancelOrder = (id: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status: "Canceled" } : order
      )
    );
  };

  const handleDeleteOrder = (id: string) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
  };

  const handleMarkAsCompleted = (id: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status: "Completed" } : order
      )
    );
  };

  const handleEditOrder = (id: string) => {
    // Implement an edit form or redirect here
    router.push(`/editOrder/${id}`);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/orderDetails/${id}`);
  };

  const handleRefundOrder = (id: string) => {
    // Refund logic goes here
    console.log(`Refunding order with id: ${id}`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-semibold mb-6 text-purple-700">View Service Orders</h1>

        {/* Orders Table */}
        <div className="overflow-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto border-collapse text-left">
            <thead className="bg-purple-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Order ID</th>
                <th className="border border-gray-300 px-4 py-2">Customer</th>
                <th className="border border-gray-300 px-4 py-2">Service</th>
                <th className="border border-gray-300 px-4 py-2">Price</th>
                <th className="border border-gray-300 px-4 py-2">Date & Time</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-purple-50">
                  <td className="border border-gray-300 px-4 py-2">{order.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.customerName}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.serviceName}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.price}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.dateTime}</td>
                  <td
                    className={`border border-gray-300 px-4 py-2 font-semibold ${
                      order.status === "Completed"
                        ? "text-green-500"
                        : order.status === "Pending"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {order.status}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {/* Action Buttons */}
                    {order.status !== 'Completed' && order.status !== 'Canceled' && (
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                        onClick={() => handleMarkAsCompleted(order.id)}
                      >
                        Mark as Completed
                      </button>
                    )}
                    {order.status !== 'Canceled' && (
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </button>
                    )}
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleEditOrder(order.id)}
                    >
                      Edit Order
                    </button>
                    <button
                      className="bg-gray-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleViewDetails(order.id)}
                    >
                      View Details
                    </button>
                    {order.status === 'Canceled' && (
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleRefundOrder(order.id)}
                      >
                        Refund Order
                      </button>
                    )}
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDeleteOrder(order.id)}
                    >
                      Delete Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewServiceOrders;
