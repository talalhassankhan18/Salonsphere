
import React from 'react';
import { Appointment } from '../../models/types';
import { format } from 'date-fns';
import { Clock, Calendar, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AppointmentListProps {
  appointments: Appointment[];
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments }) => {
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

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-gray-500">
        <Calendar size={24} className="mb-2" />
        <p>No upcoming appointments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div key={appointment._id} className="p-4 border border-gray-100 rounded-lg hover:bg-blue-50/30 transition-colors">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium">{appointment.customer.name}</h3>
                <p className="text-sm text-gray-500">{appointment.service.name}</p>
              </div>
            </div>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full capitalize",
              getStatusColor(appointment.status)
            )}>
              {appointment.status}
            </span>
          </div>
          
          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{format(appointment.startTime, 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{format(appointment.startTime, 'h:mm a')} - {format(appointment.endTime, 'h:mm a')}</span>
            </div>
          </div>
        </div>
      ))}
      
      <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors">
        View all appointments
        <link rel="stylesheet" href="/Appointments" />
      </button>
    </div>
  );
};

export default AppointmentList;
