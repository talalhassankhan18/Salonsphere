"use client"
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import SidebarNavigation from '../../components/layout/SidebarNavigation';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileMenu from '../../components/layout/MobileMenu';
import { generateMockCommissions } from '../../models/types';
import { format } from 'date-fns';
import { DollarSign, Calendar, Download, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const Commission: React.FC = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const commissions = generateMockCommissions();
  const [filter, setFilter] = useState<string>('all');
  
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const totalCommission = commissions.reduce((acc, commission) => acc + commission.amount, 0);
  const paidCommission = commissions.filter(c => c.status === 'paid').reduce((acc, commission) => acc + commission.amount, 0);
  const pendingCommission = commissions.filter(c => c.status === 'pending').reduce((acc, commission) => acc + commission.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCommissions = commissions.filter(commission => {
    if (filter === 'all') return true;
    return commission.status === filter;
  });

  // Chart data
  const chartData = [
    { month: 'Jan', amount: 120 },
    { month: 'Feb', amount: 145 },
    { month: 'Mar', amount: 160 },
    { month: 'Apr', amount: 190 },
    { month: 'May', amount: 210 },
    { month: 'Jun', amount: 230 },
    { month: 'Jul', amount: 250 },
  ];

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
        <DashboardHeader title="Commission & Payouts" toggleSidebar={toggleSidebar} isMobile={isMobile} />
        <main className="dashboard-content animate-fade-in">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <DollarSign size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Commission</p>
                    <p className="text-2xl font-bold">${totalCommission.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="glass p-6 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Paid Commission</p>
                    <p className="text-2xl font-bold">${paidCommission.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="glass p-6 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <DollarSign size={24} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending Commission</p>
                    <p className="text-2xl font-bold">${pendingCommission.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Monthly Commission</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                      formatter={(value) => [`$${value}`, 'Commission']}
                    />
                    <Bar dataKey="amount" name="Commission" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="glass rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-lg font-semibold">Commission History</h2>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      className={cn(
                        "px-3 py-1 text-sm rounded-full transition-colors",
                        filter === 'all' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      )}
                      onClick={() => setFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={cn(
                        "px-3 py-1 text-sm rounded-full transition-colors",
                        filter === 'paid' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      )}
                      onClick={() => setFilter('paid')}
                    >
                      Paid
                    </button>
                    <button 
                      className={cn(
                        "px-3 py-1 text-sm rounded-full transition-colors",
                        filter === 'pending' ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      )}
                      onClick={() => setFilter('pending')}
                    >
                      Pending
                    </button>
                    
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Download size={14} className="mr-1" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Created Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCommissions.map(commission => (
                      <tr key={commission._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">
                          #{commission.order._id.split('_')[1].substring(0, 6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{commission.order.customer.name}</span>
                            <span className="text-xs text-gray-500">{commission.order.customer.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                          ${commission.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 text-xs rounded-full capitalize",
                            getStatusColor(commission.status)
                          )}>
                            {commission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(commission.createdAt, 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {commission.paymentDate 
                            ? format(commission.paymentDate, 'MMM dd, yyyy')
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredCommissions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <DollarSign size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500">No commission records found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Commission;
