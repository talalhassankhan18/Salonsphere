"use client"
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Scissors, 
  ShoppingBag, 
  Calendar, 
  Star, 
  Image, 
  BarChart, 
  Package, 
  DollarSign, 
  Settings,
  ChevronLeft,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
};

const SidebarNavigation = ({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) => {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    { title: 'Dashboard', path: './Dashboard', icon: <LayoutDashboard size={20} /> },
    { title: 'Services', path: './Services', icon: <Scissors size={20} /> },
    { title: 'Products', path: './Products', icon: <ShoppingBag size={20} /> },
    { title: 'Appointments', path: './Appointments', icon: <Calendar size={20} /> },
    { title: 'Reviews', path: './Reviews', icon: <Star size={20} /> },
    { title: 'Portfolio', path: './Portfolio', icon: <Image size={20} /> },
    { title: 'Analytics', path: './Analytics', icon: <BarChart size={20} /> },
    { title: 'Orders', path: './Orders', icon: <Package size={20} /> },
    { title: 'Commission', path: './Commission', icon: <DollarSign size={20} /> },
    { title: 'Settings', path: './Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-0 md:w-16"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {isOpen ? (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-pink-400">
              SalonSphere
            </span>
          </Link>
        ) : (
          <div className="w-full flex justify-center">
            <Link href="/dashboard" className="text-pink-600 font-bold">
              S
            </Link>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors md:flex hidden"
        >
          <ChevronLeft
            size={18}
            className={cn("text-gray-500 transition-transform", !isOpen && "rotate-180")}
          />
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg transition-all group",
                    isActive
                      ? "bg-pink-50 text-pink-600"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className="flex items-center justify-center">{item.icon}</span>
                  
                  {isOpen && (
                    <span className="ml-3 font-medium text-sm">{item.title}</span>
                  )}
                  
                  {!isOpen && (
                    <span className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity invisible md:visible z-50">
                      {item.title}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        {isOpen ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-pink-600 font-medium">SA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Salon Admin</p>
              <p className="text-xs text-gray-500 truncate">admin@salon.com</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-pink-600 font-medium">SA</span>
            </div>
          </div>
        )}

        <button className={cn(
          "mt-4 flex items-center justify-center w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg py-2 transition-colors",
          isOpen ? "px-3" : "px-0"
        )}>
          <LogOut size={18} />
          {isOpen && <span className="ml-2 text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default SidebarNavigation;