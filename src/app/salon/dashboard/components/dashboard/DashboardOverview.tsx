"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import StatsCard from "./StatsCard";
import AppointmentList from "./AppointmentList";
import { Appointment, Order, Commission } from "../../models/types";
import {
  CalendarClock,
  Star,
  ShoppingBag,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface RevenueData {
  name: string;
  revenue: number;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  customerEmail: string;
  createdAt: string;
}

interface Payout {
  _id: string;
  orderId: string;
  salonId: string | null;
  amount: number;
  paymentMethod: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

const DashboardOverview: React.FC = () => {
  const { data: session, status } = useSession();
  const salonId = session?.user?.salonId as string | undefined;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevData, setPrevData] = useState<{
    appointments: Appointment[];
    reviews: Review[];
    commissions: Commission[];
  } | null>(null);

  useEffect(() => {
    if (status === "authenticated" && salonId) {
      fetchData();
      const interval = setInterval(fetchData, 15 * 60 * 1000); // 15 minutes
      return () => clearInterval(interval);
    }
  }, [status, salonId]);

  const fetchData = async () => {
    if (!salonId) {
      setError("Salon ID not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [appointmentsRes, reviewsRes, ordersRes, payoutsRes] = await Promise.all([
        fetch(`/api/bookings/salon-admin?salonId=${salonId}`),
        fetch(`/api/reviews?salonId=${salonId}`),
        fetch(`/api/orders?salonId=${salonId}`),
        fetch(`/api/payouts?salonId=${salonId}`),
      ]);

      if (!appointmentsRes.ok) throw new Error("Failed to fetch appointments");
      if (!reviewsRes.ok) throw new Error("Failed to fetch reviews");
      if (!ordersRes.ok) throw new Error("Failed to fetch orders");
      if (!payoutsRes.ok) throw new Error("Failed to fetch payouts");

      const appointmentsData = await appointmentsRes.json();
      const reviewsData = await reviewsRes.json();
      const ordersData = await ordersRes.json();
      const payoutsData = await payoutsRes.json();

      const mappedAppointments: Appointment[] = appointmentsData.bookings?.map((booking: any) => ({
        _id: booking._id,
        customer: {
          _id: booking.customerInfo?._id || "unknown",
          name: booking.customerInfo?.name || "N/A",
          email: booking.customerInfo?.email || "N/A",
          password: "",
          role: "customer",
          createdAt: new Date(booking.customerInfo?.createdAt || Date.now()),
          updatedAt: new Date(booking.customerInfo?.updatedAt || Date.now()),
        },
        salon: booking.salon?._id || salonId,
        service: {
          _id: booking.service?._id || "unknown",
          name: booking.service?.name || "Unknown Service",
          description: booking.service?.description || "",
          duration: booking.service?.duration || 0,
          price: booking.service?.price || 0,
          category: booking.service?.category || "",
          isActive: booking.service?.isActive ?? true,
          salon: booking.salon?._id || salonId,
          createdAt: new Date(booking.service?.createdAt || Date.now()),
          updatedAt: new Date(booking.service?.updatedAt || Date.now()),
        },
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime || new Date(new Date(booking.startTime).getTime() + (booking.duration || 0) * 60000)),
        status: booking.status || "pending",
        notes: booking.notes,
        amountPaid: booking.amountPaid || 0,
        createdAt: new Date(booking.createdAt),
        updatedAt: new Date(booking.updatedAt || booking.createdAt),
      })) || [];

      const mappedOrders: Order[] = ordersData.orders?.map((order: any) => ({
        _id: order._id,
        customer: {
          _id: order.customerId || "unknown",
          name: order.customer?.name || "N/A",
          email: order.customer?.email || "N/A",
          password: "",
          role: "customer",
          createdAt: new Date(order.customer?.createdAt || Date.now()),
          updatedAt: new Date(order.customer?.updatedAt || Date.now()),
        },
        salon: salonId,
        products: order.items?.map((item: any) => ({
          product: {
            _id: item.productId?._id || "unknown",
            name: item.productId?.name || "Unknown Product",
            description: item.productId?.description || "",
            price: item.productId?.price || item.subtotal || 0,
            image: item.productId?.image || "",
            category: item.productId?.category || "",
            stock: item.productId?.stock || 0,
            isActive: item.productId?.isActive ?? true,
            createdAt: new Date(item.productId?.createdAt || Date.now()),
            updatedAt: new Date(item.productId?.updatedAt || Date.now()),
          },
          quantity: item.quantity || 1,
          price: item.subtotal || 0,
          discount: item.discount || 0,
        })) || [],
        totalAmount: order.items?.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0) || 0,
        commissionAmount: order.items?.reduce((sum: number, item: any) => sum + ((item.subtotal || 0) * (item.commissionRate || 0.05)), 0) || 0,
        status: order.status || "pending",
        paymentStatus: order.paymentStatus || "pending",
        shippingAddress: order.shippingAddress || {
          street: "N/A",
          city: "N/A",
          state: "N/A",
          zipCode: "N/A",
          country: "N/A",
        },
        trackingNumber: order.trackingNumber,
        notes: order.notes,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt || order.createdAt),
      })) || [];

      const commissionData: Commission[] = mappedOrders.map((order, index) => {
        const payout = payoutsData.payouts?.find((p: Payout) => p.orderId === order._id);
        return {
          _id: `${order._id}-${index}`,
          salon: salonId,
          order: order,
          amount: order.commissionAmount,
          status: payout && payout.status === "completed" ? "paid" : "pending",
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
        } as Commission;
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Ensure reviewsData is an array
      const validReviews: Review[] = Array.isArray(reviewsData) ? reviewsData : [];

      // Calculate metrics for trends before updating state
      const prevTotalAppointments = prevData?.appointments?.length || 0;
      const prevTotalReviews = prevData?.reviews?.length || 0;
      const prevTotalRevenue =
        (prevData?.appointments?.reduce((acc, appt) => acc + (appt.amountPaid || 0), 0) || 0) +
        (prevData?.commissions?.reduce((acc, comm) => acc + comm.amount, 0) || 0);
      const prevTotalCommission = prevData?.commissions?.reduce((acc, comm) => acc + comm.amount, 0) || 0;

      // Update state
      setAppointments(mappedAppointments);
      setReviews(validReviews);
      setOrders(mappedOrders);
      setCommissions(commissionData);
      setPayouts(payoutsData.payouts || []);

      // Aggregate revenue data by month from appointments and commissions
      const revenueMap: { [key: string]: number } = {};
      mappedAppointments.forEach((appointment) => {
        const month = format(appointment.createdAt, "MMM");
        revenueMap[month] = (revenueMap[month] || 0) + (appointment.amountPaid || 0);
      });
      commissionData.forEach((commission) => {
        const month = format(commission.createdAt, "MMM");
        revenueMap[month] = (revenueMap[month] || 0) + commission.amount;
      });

      const revenueChartData: RevenueData[] = Object.entries(revenueMap)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => new Date(`01 ${a.name} 2025`).getTime() - new Date(`01 ${b.name} 2025`).getTime())
        .slice(-7);

      setRevenueData(revenueChartData);

      // Update prevData with current data
      setPrevData({
        appointments: mappedAppointments,
        reviews: validReviews,
        commissions: commissionData,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter((a) => a.status === "confirmed").length;
  const totalReviews = reviews.length;
  const averageRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0;
  const totalOrders = orders.length;
  const totalRevenue =
    appointments.reduce((acc, appointment) => acc + (appointment.amountPaid || 0), 0) +
    commissions.reduce((acc, comm) => acc + comm.amount, 0);
  const totalCommission = commissions.reduce((acc, comm) => acc + comm.amount, 0);
  const paidCommission = commissions.filter((comm) => comm.status === "paid").reduce((acc, comm) => acc + comm.amount, 0);

  // Calculate trends
  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const appointmentTrend = calculateTrend(totalAppointments, prevData?.appointments?.length || 0);
  const reviewTrend = calculateTrend(totalReviews, prevData?.reviews?.length || 0);
  const revenueTrend = calculateTrend(
    totalRevenue,
    prevData
      ? (prevData.appointments?.reduce((acc, appt) => acc + (appt.amountPaid || 0), 0) || 0) +
        (prevData.commissions?.reduce((acc, comm) => acc + comm.amount, 0) || 0)
      : 0
  );
  const commissionTrend = calculateTrend(
    totalCommission,
    prevData?.commissions?.reduce((acc, comm) => acc + comm.amount, 0) || 0
  );

  // Sort appointments by createdAt (latest first)
  const recentAppointments = appointments
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Appointments"
          value={totalAppointments}
          subValue={`${confirmedAppointments} confirmed`}
          icon={<CalendarClock className="text-blue-500" />}
          trend={appointmentTrend}
        />
        <StatsCard
          title="Reviews"
          value={totalReviews}
          subValue={`${averageRating.toFixed(1)} avg rating`}
          icon={<Star className="text-yellow-500" />}
          trend={reviewTrend}
        />
        <StatsCard
          title="Revenue"
          value={`Rs ${totalRevenue.toFixed(2)}`}
          subValue={`${totalOrders} orders`}
          icon={<ShoppingBag className="text-emerald-500" />}
          trend={revenueTrend}
        />
        <StatsCard
          title="Commission"
          value={`Rs ${totalCommission.toFixed(2)}`}
          subValue={`Rs ${paidCommission.toFixed(2)} paid`}
          icon={<DollarSign className="text-violet-500" />}
          trend={commissionTrend}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Revenue Overview</h2>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <TrendingUp size={16} />
              <span>{revenueTrend.toFixed(1)}% from last period</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "0.5rem",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                  formatter={(value: number) => [`Rs ${value.toFixed(2)}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Recent Appointments</h2>
          <AppointmentList appointments={recentAppointments} />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;