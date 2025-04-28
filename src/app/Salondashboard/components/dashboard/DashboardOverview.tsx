import React from 'react';
import StatsCard from './StatsCard';
import AppointmentList from './AppointmentList';
import { 
  generateMockAppointments, 
  generateMockReviews, 
  generateMockOrders, 
  generateMockCommissions,
  Review,
  Order,
  Commission,
  Appointment
} from '../../models/types';
import { 
  CalendarClock, 
  Star, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface RevenueData {
  name: string;
  revenue: number;
}

const DashboardOverview: React.FC = () => {
  const appointments: Appointment[] = generateMockAppointments();
  const reviews: Review[] = generateMockReviews();
  const orders: Order[] = generateMockOrders();
  const commissions: Commission[] = generateMockCommissions();

  // Calculate statistics
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter((a: Appointment) => a.status === 'confirmed').length;
  const totalReviews = reviews.length;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc: number, review: Review) => acc + review.rating, 0) / reviews.length 
    : 0;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc: number, order: Order) => acc + order.totalAmount, 0);
  const totalCommission = commissions.reduce((acc: number, comm: Commission) => acc + comm.amount, 0);
  const paidCommission = commissions
    .filter((comm: Commission) => comm.status === 'paid')
    .reduce((acc: number, comm: Commission) => acc + comm.amount, 0);
  
  // Chart data
  const revenueData: RevenueData[] = [
    { name: 'Jan', revenue: 1200 },
    { name: 'Feb', revenue: 1900 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Appointments"
          value={totalAppointments}
          subValue={`${confirmedAppointments} confirmed`}
          icon={<CalendarClock className="text-blue-500" />}
          trend={10}
        />
        <StatsCard
          title="Reviews"
          value={totalReviews}
          subValue={`${averageRating.toFixed(1)} avg rating`}
          icon={<Star className="text-yellow-500" />}
          trend={5}
        />
        <StatsCard
          title="Orders"
          value={totalOrders}
          subValue={`$${totalRevenue.toFixed(2)} revenue`}
          icon={<ShoppingBag className="text-emerald-500" />}
          trend={15}
        />
        <StatsCard
          title="Commission"
          value={`$${totalCommission.toFixed(2)}`}
          subValue={`$${paidCommission.toFixed(2)} paid`}
          icon={<DollarSign className="text-violet-500" />}
          trend={20}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Revenue Overview</h2>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <TrendingUp size={16} />
              <span>+12.5% from last month</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{
                  top: 5,
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
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
          <AppointmentList appointments={appointments.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;