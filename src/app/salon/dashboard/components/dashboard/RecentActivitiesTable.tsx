"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar, User, ShoppingBag, Star, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

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
  const { data: session, status } = useSession();
  const salonId = session?.user?.salonId as string | undefined;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && salonId) {
      fetchActivities();
      const interval = setInterval(fetchActivities, 30 * 1000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [status, salonId]);

  const fetchActivities = async () => {
    if (!salonId) {
      setError("Salon ID not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [appointmentsRes, ordersRes, reviewsRes] = await Promise.all([
        fetch(`/api/bookings/salon-admin?salonId=${salonId}`),
        fetch(`/api/orders?salonId=${salonId}`),
        fetch(`/api/reviews?salonId=${salonId}`),
      ]);

      if (!appointmentsRes.ok) throw new Error("Failed to fetch appointments");
      if (!ordersRes.ok) throw new Error("Failed to fetch orders");
      if (!reviewsRes.ok) throw new Error("Failed to fetch reviews");

      const appointmentsData = await appointmentsRes.json();
      const ordersData = await ordersRes.json();
      const reviewsData = await reviewsRes.json();

      const appointmentActivities: Activity[] = appointmentsData.bookings.map((booking: any) => ({
        id: booking._id,
        type: "appointment" as ActivityType,
        title: booking.status === "pending" ? "New Appointment" : `Appointment ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`,
        description: `${booking.customerInfo.name || "Customer"} booked ${booking.service?.name || "a service"}`,
        date: new Date(booking.createdAt),
        user: {
          name: booking.customerInfo.name || "N/A",
          email: booking.customerInfo.email || "N/A",
        },
      }));

      const orderActivities: Activity[] = ordersData.orders.flatMap((order: any) =>
        order.items
          .filter((item: any) => item.salonId?._id?.toString() === salonId)
          .map((item: any, index: number) => ({
            id: `${order._id}-${index}`,
            type: "order" as ActivityType,
            title: `New Product Order`,
            description: `${order.customerId} ordered ${item.productId.name}`,
            date: new Date(order.createdAt),
            user: {
              name: order.customerId, // Customer name not available; using ID
              email: "N/A", // Customer email not available in orders
            },
          }))
      );

      const reviewActivities: Activity[] = reviewsData.map((review: any) => ({
        id: review._id,
        type: "review" as ActivityType,
        title: "New Review",
        description: `${review.customerEmail} left a ${review.rating}-star review`,
        date: new Date(review.createdAt),
        user: {
          name: review.customerEmail.split("@")[0], // Extract name from email
          email: review.customerEmail,
        },
      }));

      const allActivities = [...appointmentActivities, ...orderActivities, ...reviewActivities]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10); // Limit to 10 recent activities

      setActivities(allActivities);
    } catch (err: any) {
      setError(err.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
              {/* <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th> */}
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
                {/* <td className="px-4 py-3">
                  <button className="text-pink-600 hover:text-pink-800 transition-colors text-sm font-medium">
                    View Details
                  </button>
                </td> */}
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
        {/* <button className="text-sm text-pink-600 hover:text-pink-800 transition-colors">
          View All Activities
        </button> */}
      </div>
    </div>
  );
};

export default RecentActivitiesTable;