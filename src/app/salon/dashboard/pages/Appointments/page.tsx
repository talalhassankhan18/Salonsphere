"use client"
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { generateMockAppointments } from '../../models/types';
import { format } from 'date-fns';
import { Calendar, Clock, User, Plus, Filter, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import AddAppointment from '../../components/appointments/AddAppointment';
import { toast } from '../../hooks/use-toast';
import { Appointment } from '../../models/types';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(generateMockAppointments());
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    // Status filter
    if (filter !== 'all' && appointment.status !== filter) {
      return false;
    }
    
    // Search filter (search in customer name and service name)
    if (searchTerm && !appointment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !appointment.service.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Date filter
    const today = new Date();
    const appointmentDate = new Date(appointment.startTime);
    
    if (dateFilter === 'today' && 
        !(appointmentDate.getDate() === today.getDate() && 
          appointmentDate.getMonth() === today.getMonth() && 
          appointmentDate.getFullYear() === today.getFullYear())) {
      return false;
    }
    
    if (dateFilter === 'thisWeek') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const endOfWeek = new Date(today);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      if (!(appointmentDate >= startOfWeek && appointmentDate <= endOfWeek)) {
        return false;
      }
    }
    
    if (dateFilter === 'thisMonth') {
      if (!(appointmentDate.getMonth() === today.getMonth() && 
            appointmentDate.getFullYear() === today.getFullYear())) {
        return false;
      }
    }
    
    return true;
  });

  const handleAddAppointment = (newAppointment: Appointment) => {
    setAppointments([newAppointment, ...appointments]);
  };

  const handleStatusChange = (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    setAppointments(
      appointments.map(appointment => 
        appointment._id === appointmentId 
          ? { ...appointment, status: newStatus } 
          : appointment
      )
    );
    
    toast({
      title: "Status updated",
      description: `Appointment ${newStatus}`,
    });
  };

  return (
    <DashboardLayout title="Appointments">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant={filter === 'all' ? "default" : "outline"}
                onClick={() => setFilter('all')}
                className={filter === 'all' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                All
              </Button>
              <Button 
                variant={filter === 'pending' ? "default" : "outline"}
                onClick={() => setFilter('pending')}
                className={filter === 'pending' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                Pending
              </Button>
              <Button 
                variant={filter === 'confirmed' ? "default" : "outline"}
                onClick={() => setFilter('confirmed')}
                className={filter === 'confirmed' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                Confirmed
              </Button>
              <Button 
                variant={filter === 'completed' ? "default" : "outline"}
                onClick={() => setFilter('completed')}
                className={filter === 'completed' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                Completed
              </Button>
              <Button 
                variant={filter === 'cancelled' ? "default" : "outline"}
                onClick={() => setFilter('cancelled')}
                className={filter === 'cancelled' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                Cancelled
              </Button>
            </div>
            
            <Button 
              className="bg-pink-600 hover:bg-pink-700"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} className="mr-2" />
              New Appointment
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search by customer or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={dateFilter === 'all' ? "default" : "outline"}
                onClick={() => setDateFilter('all')}
                className={dateFilter === 'all' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                <Calendar size={16} className="mr-1" /> All Dates
              </Button>
              <Button 
                variant={dateFilter === 'today' ? "default" : "outline"}
                onClick={() => setDateFilter('today')}
                className={dateFilter === 'today' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                Today
              </Button>
              <Button 
                variant={dateFilter === 'thisWeek' ? "default" : "outline"}
                onClick={() => setDateFilter('thisWeek')}
                className={dateFilter === 'thisWeek' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                This Week
              </Button>
              <Button 
                variant={dateFilter === 'thisMonth' ? "default" : "outline"}
                onClick={() => setDateFilter('thisMonth')}
                className={dateFilter === 'thisMonth' ? "bg-pink-600 hover:bg-pink-700" : ""}
                size="sm"
              >
                This Month
              </Button>
            </div>
          </div>
        </div>
            
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Service</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map(appointment => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User size={14} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{appointment.customer.name}</p>
                          <p className="text-xs text-gray-500">{appointment.customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{appointment.service.name}</p>
                      <p className="text-xs text-gray-500">{appointment.service.duration} min | ${appointment.service.price}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Calendar size={14} className="mr-1 text-gray-500" />
                        <span>{format(appointment.startTime, 'dd MMM yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Clock size={14} className="mr-1 text-gray-500" />
                        <span>
                          {format(appointment.startTime, 'h:mm a')} - {format(appointment.endTime, 'h:mm a')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full capitalize",
                        getStatusColor(appointment.status)
                      )}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button className="text-pink-600 hover:text-pink-800 transition-colors text-sm font-medium">
                          Details
                        </button>
                        {appointment.status === 'pending' && (
                          <button 
                            className="text-green-600 hover:text-green-800 transition-colors text-sm font-medium"
                            onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                          >
                            Confirm
                          </button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button 
                            className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                            onClick={() => handleStatusChange(appointment._id, 'completed')}
                          >
                            Complete
                          </button>
                        )}
                        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                          <button 
                            className="text-red-600 hover:text-red-800 transition-colors text-sm font-medium"
                            onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">No appointments found</p>
            </div>
          )}
        </div>
      </div>

      <AddAppointment 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddAppointment}
      />
    </DashboardLayout>
  );
};

export default Appointments;
