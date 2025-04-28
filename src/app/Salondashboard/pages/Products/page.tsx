"use client"
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';
import SidebarNavigation from '../../components/layout/SidebarNavigation';
import DashboardHeader from '../../components/layout/DashboardHeader';
import MobileMenu from '../../components/layout/MobileMenu';
import { generateMockProducts } from '../../models/types';
import { ShoppingBag, Search, ExternalLink } from 'lucide-react';

const Products: React.FC = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const products = generateMockProducts();
  
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
        <DashboardHeader title="Products" toggleSidebar={toggleSidebar} isMobile={isMobile} />
        <main className="dashboard-content animate-fade-in">
          <div className="space-y-6">
            <div className="glass p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Available Products from SalonSphere</h2>
              <p className="text-gray-500 mb-4">
                You can list these products under your salon and earn 5% commission on each sale.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="py-2 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product._id} className="border border-gray-100 rounded-xl overflow-hidden hover-lift bg-white">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    
                    <div className="p-5">
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {product.category}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-bold">${product.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{product.stock} in stock</p>
                      </div>
                      
                      <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                        <ShoppingBag size={16} className="mr-2" />
                        Add to My Listings
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center">
                  View all products
                  <ExternalLink size={14} className="ml-1" />
                </button>
              </div>
            </div>
            
            <div className="glass p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">My Product Listings</h2>
              
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">You haven't added any products to your listings yet</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Commission</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.slice(0, 2).map(product => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-md overflow-hidden">
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{product.category}</td>
                          <td className="px-4 py-3 text-sm">${product.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm">${(product.price * 0.05).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button className="text-blue-600 hover:text-blue-800 transition-colors">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Products;
