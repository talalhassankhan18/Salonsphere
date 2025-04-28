
import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DashboardHeaderProps {
  title: string;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, toggleSidebar, isMobile }) => {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-white">
      <div className="flex items-center space-x-4">
        {isMobile && (
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        )}
        
        <h1 className={cn(
          "font-semibold",
          isMobile ? "text-xl" : "text-2xl"
        )}>{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="py-2 pl-10 pr-4 w-64 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
