"use client"
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import SidebarNavigation from '../../components/layout/SidebarNavigation';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileMenu from '../../components/layout/MobileMenu';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Analytics: React.FC = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock data for charts
  const revenueData = [
    { name: 'Jan', services: 1500, products: 800 },
    { name: 'Feb', services: 2200, products: 1000 },
    { name: 'Mar', services: 1800, products: 900 },
    { name: 'Apr', services: 2400, products: 1200 },
    { name: 'May', services: 2100, products: 1100 },
    { name: 'Jun', services: 2800, products: 1400 },
    { name: 'Jul', services: 3100, products: 1600 },
  ];

  const appointmentsData = [
    { name: 'Jan', appointments: 45 },
    { name: 'Feb', appointments: 58 },
    { name: 'Mar', appointments: 52 },
    { name: 'Apr', appointments: 63 },
    { name: 'May', appointments: 59 },
    { name: 'Jun', appointments: 72 },
    { name: 'Jul', appointments: 80 },
  ];

  const servicesCategoryData = [
    { name: 'Hair', value: 45 },
    { name: 'Nails', value: 25 },
    { name: 'Skin', value: 20 },
    { name: 'Makeup', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
        <DashboardHeader title="Analytics" toggleSidebar={toggleSidebar} isMobile={isMobile} />
        <main className="dashboard-content animate-fade-in">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-1">Total Revenue</h3>
                <p className="text-3xl font-bold">$18,500</p>
                <p className="text-sm text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="glass p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-1">Appointments</h3>
                <p className="text-3xl font-bold">254</p>
                <p className="text-sm text-green-600 mt-1">+8% from last month</p>
              </div>
              <div className="glass p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-1">Products Sold</h3>
                <p className="text-3xl font-bold">145</p>
                <p className="text-sm text-green-600 mt-1">+15% from last month</p>
              </div>
              <div className="glass p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-1">Commission</h3>
                <p className="text-3xl font-bold">$925</p>
                <p className="text-sm text-green-600 mt-1">+15% from last month</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '0.5rem',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="services" name="Services" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="products" name="Products" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="glass p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Appointments Trend</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={appointmentsData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '0.5rem',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="appointments" 
                        name="Appointments" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="glass p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Services by Category</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={servicesCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {servicesCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '0.5rem',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="glass p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Best Selling Products</h3>
                <div className="h-80 overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sold</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Revenue</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Commission</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-md bg-gray-100"></div>
                            <span className="font-medium">Anti-Aging Serum</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">42</td>
                        <td className="px-4 py-3 text-sm">$2,099.58</td>
                        <td className="px-4 py-3 text-sm">$104.98</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-md bg-gray-100"></div>
                            <span className="font-medium">Hydrating Shampoo</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">38</td>
                        <td className="px-4 py-3 text-sm">$949.62</td>
                        <td className="px-4 py-3 text-sm">$47.48</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-md bg-gray-100"></div>
                            <span className="font-medium">Nourishing Conditioner</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">36</td>
                        <td className="px-4 py-3 text-sm">$827.64</td>
                        <td className="px-4 py-3 text-sm">$41.38</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-md bg-gray-100"></div>
                            <span className="font-medium">Moisturizing Face Cream</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">29</td>
                        <td className="px-4 py-3 text-sm">$1,015.00</td>
                        <td className="px-4 py-3 text-sm">$50.75</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
