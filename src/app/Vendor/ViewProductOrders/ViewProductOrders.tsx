import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Components/Sidebar';
const ViewProductOrders: React.FC = () => {
  const router = useRouter();

  // State to track active menu
  const [activeMenu, setActiveMenu] = useState<string>('View Product Orders');

  // Navigation handler
  const navigateTo = (path: string, label: string) => {
    setActiveMenu(label);
    router.push(path);
  };

  interface ProductOrder {
    id: string;
    productName: string;
    price: number;
    commission: number;
    orderStatus: string;
    salonVendor: string;
  }

  // State to hold sample product order data
  const [orders, setOrders] = useState<ProductOrder[]>([
    {
      id: "001",
      productName: "Shampoo",
      price: 50,
      commission: 50 * 0.05,
      orderStatus: "Pending",
      salonVendor: "Salon A",
    },
    {
      id: "002",
      productName: "Hair Gel",
      price: 30,
      commission: 30 * 0.05,
      orderStatus: "Pending",
      salonVendor: "Salon B",
    },
    {
      id: "003",
      productName: "Conditioner",
      price: 40,
      commission: 40 * 0.05,
      orderStatus: "Pending",
      salonVendor: "Salon C",
    },
  ]);

  // Forward order to superadmin
  const forwardToSuperAdmin = (id: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, orderStatus: "Forwarded to Superadmin" } : order
      )
    );
  };

  // Handle actions like Mark as Approved by Superadmin
  const handleSuperAdminApproval = (id: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, orderStatus: "Approved" } : order
      )
    );
  };

  // Handle Reject by Superadmin
  const handleRejectOrder = (id: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, orderStatus: "Rejected" } : order
      )
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />
      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-semibold mb-6 text-purple-700">
          View Product Orders
        </h1>

        {/* Product Orders Table */}
        <div className="overflow-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto border-collapse text-left">
            <thead className="bg-purple-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Order ID</th>
                <th className="border border-gray-300 px-4 py-2">Product Name</th>
                <th className="border border-gray-300 px-4 py-2">Price</th>
                <th className="border border-gray-300 px-4 py-2">Commission (5%)</th>
                <th className="border border-gray-300 px-4 py-2">Order Status</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-purple-50">
                  <td className="border border-gray-300 px-4 py-2">{order.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.productName}</td>
                  <td className="border border-gray-300 px-4 py-2">${order.price}</td>
                  <td className="border border-gray-300 px-4 py-2">${order.commission.toFixed(2)}</td>
                  <td
                    className={`border border-gray-300 px-4 py-2 font-semibold ${
                      order.orderStatus === "Approved"
                        ? "text-green-500"
                        : order.orderStatus === "Forwarded to Superadmin"
                        ? "text-yellow-500"
                        : order.orderStatus === "Rejected"
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {order.orderStatus}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {/* Action Buttons */}
                    {order.orderStatus === "Pending" && (
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                        onClick={() => forwardToSuperAdmin(order.id)}
                      >
                        Forward to Superadmin
                      </button>
                    )}
                    {order.orderStatus === "Forwarded to Superadmin" && (
                      <>
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                          onClick={() => handleSuperAdminApproval(order.id)}
                        >
                          Approve Order
                        </button>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded"
                          onClick={() => handleRejectOrder(order.id)}
                        >
                          Reject Order
                        </button>
                      </>
                    )}
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

export default ViewProductOrders;
