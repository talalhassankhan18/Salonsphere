"use client"
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { generateMockOrders } from '../../models/types';
import { format } from 'date-fns';
import { Package, User, Calendar, ChevronRight, ArrowRight, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const ProductOrders: React.FC = () => {
  const orders = generateMockOrders();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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

  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    // Search filter (search in customer name and order ID)
    if (searchTerm && !order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !order._id.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const forwardToAdmin = (orderId: string) => {
    console.log(`Order ${orderId} forwarded to admin`);
    // In a real app, this would make an API call
  };

  return (
    <DashboardLayout title="Product Orders">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant={statusFilter === 'all' ? "default" : "outline"}
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                All
              </Button>
              <Button 
                variant={statusFilter === 'pending' ? "default" : "outline"}
                onClick={() => setStatusFilter('pending')}
                className={statusFilter === 'pending' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                Pending
              </Button>
              <Button 
                variant={statusFilter === 'processing' ? "default" : "outline"}
                onClick={() => setStatusFilter('processing')}
                className={statusFilter === 'processing' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                Processing
              </Button>
              <Button 
                variant={statusFilter === 'shipped' ? "default" : "outline"}
                onClick={() => setStatusFilter('shipped')}
                className={statusFilter === 'shipped' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                Shipped
              </Button>
              <Button 
                variant={statusFilter === 'delivered' ? "default" : "outline"}
                onClick={() => setStatusFilter('delivered')}
                className={statusFilter === 'delivered' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                Delivered
              </Button>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
            
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Commission</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono">#{order._id.split('_')[1].substring(0, 8)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User size={14} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-xs text-gray-500">{order.customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Calendar size={14} className="mr-1 text-gray-500" />
                        <span>{format(order.createdAt, 'MMM dd, yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-pink-600">${order.commissionAmount.toFixed(2)}</p>
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
                      <div className="flex space-x-3">
                        <button className="text-pink-600 hover:text-pink-800 transition-colors text-sm font-medium">
                          Details
                        </button>
                        {order.status === 'processing' && (
                          <button 
                            className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium flex items-center"
                            onClick={() => forwardToAdmin(order._id)}
                          >
                            Forward <ArrowRight size={14} className="ml-1" />
                          </button>
                        )}
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
    </DashboardLayout>
  );
};

export default ProductOrders;
