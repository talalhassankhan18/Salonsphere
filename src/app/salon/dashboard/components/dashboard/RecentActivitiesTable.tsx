
import React from 'react';
import { Calendar, User, ShoppingBag, Star, Clock } from 'lucide-react';
import { format } from 'date-fns';

type ActivityType = 'appointment' | 'order' | 'review';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: Date;
  user: {
    name: string;
    email: string;
  };
}

const RecentActivitiesTable: React.FC = () => {
  // Mock activities - in real app, this would come from an API
  const activities: Activity[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'New Appointment',
      description: 'Jane Smith booked a Classic Haircut',
      date: new Date(new Date().setHours(new Date().getHours() - 2)),
      user: {
        name: 'Jane Smith',
        email: 'jane@example.com'
      }
    },
    {
      id: '2',
      type: 'order',
      title: 'New Product Order',
      description: 'Michael Johnson ordered Hydrating Shampoo',
      date: new Date(new Date().setHours(new Date().getHours() - 5)),
      user: {
        name: 'Michael Johnson',
        email: 'michael@example.com'
      }
    },
    {
      id: '3',
      type: 'review',
      title: 'New Review',
      description: 'Emily Williams left a 5-star review',
      date: new Date(new Date().setHours(new Date().getHours() - 8)),
      user: {
        name: 'Emily Williams',
        email: 'emily@example.com'
      }
    },
    {
      id: '4',
      type: 'appointment',
      title: 'Appointment Updated',
      description: 'Sarah Brown rescheduled her appointment',
      date: new Date(new Date().setHours(new Date().getHours() - 10)),
      user: {
        name: 'Sarah Brown',
        email: 'sarah@example.com'
      }
    },
    {
      id: '5',
      type: 'order',
      title: 'Order Processed',
      description: 'David Miller order was forwarded to admin',
      date: new Date(new Date().setHours(new Date().getHours() - 24)),
      user: {
        name: 'David Miller',
        email: 'david@example.com'
      }
    }
  ];

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'appointment':
        return <Calendar size={16} className="text-pink-500" />;
      case 'order':
        return <ShoppingBag size={16} className="text-green-500" />;
      case 'review':
        return <Star size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold">Recent Activities</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Activity</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Time</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <User size={12} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.user.name}</p>
                      <p className="text-xs text-gray-500">{activity.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center text-sm">
                    <Clock size={14} className="mr-1 text-gray-500" />
                    <span>{format(activity.date, 'h:mm a')} - {format(activity.date, 'MMM dd')}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button className="text-pink-600 hover:text-pink-800 transition-colors text-sm font-medium">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {activities.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Clock size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No recent activities</p>
        </div>
      )}
      
      <div className="p-4 border-t border-gray-100 text-right">
        <button className="text-sm text-pink-600 hover:text-pink-800 transition-colors">
          View All Activities
        </button>
      </div>
    </div>
  );
};

export default RecentActivitiesTable;
