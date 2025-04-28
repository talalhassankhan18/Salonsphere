"use client"
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import SidebarNavigation from '../../components/layout/SidebarNavigation';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileMenu from '../../components/layout/MobileMenu';
import { generateMockOrders } from '../../models/types';
import { format } from 'date-fns';
import { Package, Filter, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

const Orders: React.FC = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const orders = generateMockOrders();
  const [filter, setFilter] = useState<string>('all');
  
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  return (
    <div className="dashboard-layout">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <SidebarNavigation isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      
      {/* Mobile menu */}
      <MobileMenu isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        <DashboardHeader title="Orders" toggleSidebar={toggleSidebar} isMobile={isMobile} />
        <main className="dashboard-content animate-fade-in">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
                <button 
                  className={cn(
                    "px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap",
                    filter === 'all' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  )}
                  onClick={() => setFilter('all')}
                >
                  All Orders
                </button>
                <button 
                  className={cn(
                    "px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap",
                    filter === 'pending' ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  )}
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </button>
                <button 
                  className={cn(
                    "px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap",
                    filter === 'processing' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  )}
                  onClick={() => setFilter('processing')}
                >
                  Processing
                </button>
                <button 
                  className={cn(
                    "px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap",
                    filter === 'shipped' ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  )}
                  onClick={() => setFilter('shipped')}
                >
                  Shipped
                </button>
                <button 
                  className={cn(
                    "px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap",
                    filter === 'delivered' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  )}
                  onClick={() => setFilter('delivered')}
                >
                  Delivered
                </button>
              </div>
              
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter size={16} className="mr-2" />
                Filter
              </button>
            </div>
            
            <div className="glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Items</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Commission</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Payment</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">
                          #{order._id.split('_')[1].substring(0, 6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{order.customer.name}</span>
                            <span className="text-xs text-gray-500">{order.customer.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{order.products.length} items</span>
                            <span className="text-xs text-gray-500">
                              {order.products.map(p => p.product.name).join(', ').substring(0, 20)}
                              {order.products.map(p => p.product.name).join(', ').length > 20 ? '...' : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                          ${order.commissionAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 text-xs rounded-full capitalize",
                            getStatusColor(order.status)
                          )}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 text-xs rounded-full capitalize",
                            getPaymentStatusColor(order.paymentStatus)
                          )}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(order.createdAt, 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
                            <button className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium flex items-center">
                              Details
                              <ExternalLink size={14} className="ml-1" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Package size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500">No orders found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Orders;
