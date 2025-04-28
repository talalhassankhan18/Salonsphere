"use client"
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { generateMockPortfolioItems } from '../../models/types';
import { Plus, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';
import AddPortfolio from '../../components/portfolio/AddPortfolio';
import { Button } from '../../components/ui/button';
import { toast } from '../../hooks/use-toast';

const Portfolio: React.FC = () => {
  const [portfolioItems, setPortfolioItems] = useState(generateMockPortfolioItems());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const handleAddItem = (newItem: any) => {
    setPortfolioItems([
      {
        ...newItem,
        _id: `portfolio-${Date.now()}`,
      },
      ...portfolioItems
    ]);
  };

  const handleDeleteItem = (itemId: string) => {
    setPortfolioItems(portfolioItems.filter(item => item._id !== itemId));
    toast({
      title: "Item deleted",
      description: "Portfolio item has been removed"
    });
  };

  return (
    <DashboardLayout title="Portfolio">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Your Portfolio</h2>
          <Button 
            className="bg-pink-600 hover:bg-pink-700 text-white"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} className="mr-2" />
            Add Portfolio Item
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map(item => (
            <div key={item._id} className="glass rounded-xl overflow-hidden hover-lift">
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => toast({
                        title: "Coming soon",
                        description: "Edit functionality will be available soon"
                      })}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => handleDeleteItem(item._id)}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{item.title}</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-pink-100 text-pink-800 rounded-full">
                    {item.category}
                  </span>
                </div>
                
                {item.description && (
                  <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                )}
                
                <p className="mt-3 text-xs text-gray-500">
                  Added on {format(item.createdAt, 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
          ))}
          
          {/* Add new portfolio item placeholder */}
          <div 
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-gray-300 transition-colors cursor-pointer h-[394px]"
            onClick={() => setIsAddModalOpen(true)}
          >
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <Plus size={24} className="text-pink-600" />
            </div>
            <h3 className="font-semibold mb-2">Add New Item</h3>
            <p className="text-sm text-gray-500">
              Showcase your best work to attract more clients
            </p>
          </div>
        </div>
      </div>

      <AddPortfolio 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddItem}
      />
    </DashboardLayout>
  );
};

export default Portfolio;
