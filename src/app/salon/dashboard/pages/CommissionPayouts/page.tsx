"use client"
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { generateMockCommissions } from '../../models/types';
import { format } from 'date-fns';
import { DollarSign, Calendar, Package, CreditCard, UserCheck, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const CommissionPayouts: React.FC = () => {
  const commissions = generateMockCommissions();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Calculate total commission amounts
  const totalCommission = commissions.reduce((total, commission) => total + commission.amount, 0);
  const totalPaid = commissions
    .filter(commission => commission.status === 'paid')
    .reduce((total, commission) => total + commission.amount, 0);
  const totalPending = commissions
    .filter(commission => commission.status === 'pending')
    .reduce((total, commission) => total + commission.amount, 0);
  
  const filteredCommissions = commissions.filter(commission => {
    // Status filter
    if (statusFilter !== 'all' && commission.status !== statusFilter) {
      return false;
    }
    
    // Search filter (search in order ID)
    if (searchTerm && !commission.order._id.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <DashboardLayout title="Commission & Payouts">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stats-card bg-pink-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Commission</p>
              <div className="p-2 bg-pink-100 rounded-full">
                <DollarSign size={16} className="text-pink-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold">${totalCommission.toFixed(2)}</h3>
            <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
          </div>
          
          <div className="stats-card bg-green-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Paid Commission</p>
              <div className="p-2 bg-green-100 rounded-full">
                <CreditCard size={16} className="text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold">${totalPaid.toFixed(2)}</h3>
            <p className="text-xs text-gray-500 mt-1">Already paid out</p>
          </div>
          
          <div className="stats-card bg-yellow-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Pending Commission</p>
              <div className="p-2 bg-yellow-100 rounded-full">
                <UserCheck size={16} className="text-yellow-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold">${totalPending.toFixed(2)}</h3>
            <p className="text-xs text-gray-500 mt-1">Waiting for payout</p>
          </div>
        </div>
        
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
                variant={statusFilter === 'paid' ? "default" : "outline"}
                onClick={() => setStatusFilter('paid')}
                className={statusFilter === 'paid' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                Paid
              </Button>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search by order ID..."
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
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Order Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Commission</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCommissions.map(commission => (
                  <tr key={commission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Package size={16} className="text-gray-500" />
                        <p className="text-sm font-mono">#{commission.order._id.split('_')[1].substring(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Calendar size={14} className="mr-1 text-gray-500" />
                        <span>{format(commission.createdAt, 'MMM dd, yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">${commission.order.totalAmount.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-pink-600">${commission.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">5% commission</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full capitalize",
                        commission.status === 'pending' ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                      )}>
                        {commission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {commission.paymentDate ? (
                        <div className="flex items-center text-sm">
                          <CreditCard size={14} className="mr-1 text-gray-500" />
                          <span>{format(commission.paymentDate, 'MMM dd, yyyy')}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Pending</span>
                      )}
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
    </DashboardLayout>
  );
};

export default CommissionPayouts;
