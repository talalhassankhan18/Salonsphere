"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "../../hooks/use-mobile";
import SidebarNavigation from "../../components/layout/SidebarNavigation";
import DashboardHeader from "../../components/layout/DashboardHeader";
import MobileMenu from "../../components/layout/MobileMenu";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, subMonths, isSameMonth } from "date-fns";

interface OrderItem {
  productId: { _id: string; name: string; imageUrl?: string };
  salonId?: { _id: string; salonName: string };
  quantity: number;
  unitPrice: number;
  commissionRate?: number;
  subtotal: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

interface Appointment {
  _id: string;
  salon: { salonName: string };
  service: { _id: string; name: string; category?: string };
  startTime: string;
  duration: number;
  paymentOption: "full" | "half" | "cash";
  amountPaid: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  createdAt: string;
}

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
}

interface RevenueData {
  name: string;
  services: number;
  products: number;
}

interface AppointmentsData {
  name: string;
  appointments: number;
}

interface ServicesData {
  name: string;
  value: number;
}

interface BestSellingProduct {
  productId: string;
  productName: string;
  sold: number;
  commission: number;
}

// Module-level fallbacks so fetchAnalyticsData need not depend on them.
const dummyServicesData: ServicesData[] = [
  { name: "Haircut", value: 5 },
  { name: "Facial", value: 3 },
  { name: "Manicure", value: 2 },
  { name: "Pedicure", value: 1 },
];

const dummyBestSellingProducts: BestSellingProduct[] = [
  { productId: "dummy1", productName: "Shampoo", sold: 10, commission: 150 },
  { productId: "dummy2", productName: "Conditioner", sold: 8, commission: 120 },
  { productId: "dummy3", productName: "Hair Oil", sold: 5, commission: 75 },
];

const Analytics: React.FC = () => {
  const isMobile = useIsMobile();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [productsSold, setProductsSold] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [appointmentsData, setAppointmentsData] = useState<AppointmentsData[]>([]);
  const [servicesData, setServicesData] = useState<ServicesData[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<BestSellingProduct[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const salonId = session?.user?.salonId as string | undefined;
  const userId = session?.user?.id as string | undefined;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Dummy data for when real-time data is unavailable
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchAnalyticsData = useCallback(async () => {
    if (status !== "authenticated" || !salonId || !userId) {
      setError("Session data missing. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const currentDate = new Date();
      console.log("Current Date (PKT):", currentDate.toISOString());

      // Fetch Services
      const servicesResponse = await fetch(`/api/services?salonId=${salonId}`);
      if (!servicesResponse.ok) {
        throw new Error(`Failed to fetch services: ${servicesResponse.status}`);
      }
      const servicesData = await servicesResponse.json();
      console.log("Fetched Services:", servicesData);
      setServices(servicesData);

      // Fetch Orders
      const ordersResponse = await fetch(`/api/orders?salonId=${salonId}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!ordersResponse.ok) {
        throw new Error(`Failed to fetch orders: ${ordersResponse.status}`);
      }
      const ordersData = await ordersResponse.json();
      const orders: Order[] = ordersData.orders || [];
      console.log("Fetched Orders:", orders);

      // Fetch Appointments
      const appointmentsResponse = await fetch(`/api/bookings/salon-admin?salonId=${salonId}`);
      if (!appointmentsResponse.ok) {
        throw new Error(`Failed to fetch appointments: ${appointmentsResponse.status}`);
      }
      const appointmentsData = await appointmentsResponse.json();
      console.log("Raw Appointments Data:", appointmentsData);

      const fetchedAppointments: Appointment[] = appointmentsData.bookings.map((booking: any) => {
        const service = servicesData.find((s: Service) => s._id === booking.service?._id);
        const startTime = new Date(booking.startTime);
        console.log(`Appointment ${booking._id} Start Time:`, startTime.toISOString());
        return {
          _id: booking._id,
          salon: { salonName: booking.salon?.salonName || "Unknown Salon" },
          service: {
            _id: booking.service?._id,
            name: booking.service?.name || "Unknown Service",
            category: service?.category || "N/A",
          },
          startTime: booking.startTime,
          duration: booking.duration,
          paymentOption: booking.paymentOption,
          amountPaid: booking.amountPaid || 0,
          status: booking.status,
          customerInfo: {
            name: booking.customerInfo.name || "N/A",
            email: booking.customerInfo.email || "N/A",
            phone: booking.customerInfo.phone || "N/A",
            notes: booking.customerInfo.notes || "N/A",
          },
          createdAt: booking.createdAt,
        };
      });
      setAppointments(fetchedAppointments);

      // Filter appointments for the current month (May 2025)
      const currentMonthAppointments = fetchedAppointments.filter(appt => {
        const apptDate = new Date(appt.startTime);
        const isMatch = isSameMonth(apptDate, currentDate);
        console.log(`Appointment ${appt._id} Date: ${apptDate.toISOString()}, Matches Current Month: ${isMatch}`);
        return isMatch;
      });
      console.log("Current Month Appointments:", currentMonthAppointments);
      setTotalAppointments(currentMonthAppointments.length);

      // Calculate Total Revenue (Service Revenue + Product Commissions)
      const serviceRevenue = currentMonthAppointments
        .filter(appt => appt.status === "completed" || appt.status === "confirmed")
        .reduce((sum, appt) => sum + (appt.amountPaid || 0), 0);
      const commission = orders
        .flatMap((order) => order.items || [])
        .filter((item) => item?.salonId?._id?.toString() === salonId)
        .reduce((sum, item) => sum + (item?.subtotal || 0) * (item?.commissionRate || 0.05), 0);
      setTotalCommission(commission);
      setTotalRevenue(serviceRevenue + commission);

      // Calculate Products Sold
      const totalProductsSold = orders
        .flatMap((order) => order.items || [])
        .filter((item) => item?.salonId?._id?.toString() === salonId)
        .reduce((sum, item) => sum + (item?.quantity || 0), 0);
      setProductsSold(totalProductsSold);

      // Revenue Breakdown (Last 7 Months)
      const revenueMap: { [key: string]: { services: number; products: number } } = {};
      for (let i = 6; i >= 0; i--) {
        const month = format(subMonths(currentDate, i), "MMM");
        revenueMap[month] = { services: 0, products: 0 };
      }

      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        const month = format(orderDate, "MMM");
        if (revenueMap[month]) {
          const orderCommission = (order.items || [])
            .filter((item) => item?.salonId?._id?.toString() === salonId)
            .reduce((sum, item) => sum + (item?.subtotal || 0) * (item?.commissionRate || 0.05), 0);
          revenueMap[month].products += orderCommission;
        }
      });

      fetchedAppointments.forEach((appt) => {
        const apptDate = new Date(appt.startTime);
        const month = format(apptDate, "MMM");
        if (revenueMap[month] && (appt.status === "completed" || appt.status === "confirmed")) {
          revenueMap[month].services += appt.amountPaid || 0;
        }
      });

      const revenueChartData = Object.entries(revenueMap).map(([name, data]) => ({
        name,
        services: parseFloat(data.services.toFixed(2)),
        products: parseFloat(data.products.toFixed(2)),
      }));
      setRevenueData(revenueChartData);

      // Appointments Trend (Current Month Only)
      const appointmentsMap: { [key: string]: number } = {};
      const currentMonth = format(currentDate, "MMM");
      appointmentsMap[currentMonth] = currentMonthAppointments.length;
      const appointmentsChartData = Object.entries(appointmentsMap).map(([name, count]) => ({
        name,
        appointments: count,
      }));
      setAppointmentsData(appointmentsChartData);

      // Services by Name (Count of appointments per service)
      const serviceMap: Record<string, number> = {};
      currentMonthAppointments.forEach((appt) => {
        const serviceName = appt.service.name || "Unknown Service";
        serviceMap[serviceName] = (serviceMap[serviceName] || 0) + 1;
      });

      const servicesChartData = Object.entries(serviceMap)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));
      console.log("Services Data:", servicesChartData);

      // Use dummy data if no real data is available
      setServicesData(servicesChartData.length > 0 ? servicesChartData : dummyServicesData);

      // Best Selling Products
      const productMap: { [key: string]: BestSellingProduct } = {};
      orders
        .flatMap((order) => order.items || [])
        .filter((item) => item?.salonId?._id?.toString() === salonId)
        .forEach((item) => {
          const productId = item?.productId?._id;
          if (!productId) return;
          if (!productMap[productId]) {
            productMap[productId] = {
              productId,
              productName: item?.productId?.name || "Unknown",
              sold: 0,
              commission: 0,
            };
          }
          productMap[productId].sold += item?.quantity || 0;
          productMap[productId].commission += (item?.subtotal || 0) * (item?.commissionRate || 0.05);
        });

      const bestSellingData = Object.values(productMap)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 4);
      console.log("Best Selling Products:", bestSellingData);

      // Use dummy data if no real data is available
      setBestSellingProducts(bestSellingData.length > 0 ? bestSellingData : dummyBestSellingProducts);

    } catch (err: any) {
      console.error("Analytics fetch error:", err.message, err.stack);
      setError(err.message || "Failed to load analytics data. Retrying in 10 seconds...");
      // Use dummy data on error
      setServicesData(dummyServicesData);
      setBestSellingProducts(dummyBestSellingProducts);
      // Retry after 10 seconds
      setTimeout(() => fetchAnalyticsData(), 10000);
    } finally {
      setLoading(false);
    }
  }, [status, salonId, userId]);

  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 30 * 1000);
    return () => clearInterval(interval);
  }, [fetchAnalyticsData]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (status === "loading" || loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-600">{error}</div>;
  if (!userId || !salonId) return <div className="flex items-center justify-center h-screen text-red-600">Error: User ID or Salon ID not found</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="hidden md:block">
        <SidebarNavigation isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      <MobileMenu isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-16"}`}>
        <DashboardHeader
          title="Analytics Dashboard"
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          userId={userId}
        />
        <main className="p-4 md:p-8 bg-gray-100 min-h-[calc(100vh-64px)]">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Total Revenue", value: `PKR ${totalRevenue.toFixed(2)}`, change: "+12%", color: "text-blue-600" },
                { title: "Appointments", value: totalAppointments, change: "+8%", color: "text-green-600" },
                { title: "Products Sold", value: productsSold, change: "+15%", color: "text-secondary" },
                { title: "Commission", value: `PKR ${totalCommission.toFixed(2)}`, change: "+10%", color: "text-primary" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                >
                  <h3 className="text-sm font-medium text-gray-500">{item.title}</h3>
                  <p className={`text-2xl font-semibold ${item.color} mt-2`}>{item.value}</p>
                  <div className="flex items-center mt-3">
                    <span className="text-xs font-medium bg-green-50 text-green-600 px-2 py-1 rounded-full">
                      {item.change} from last month
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Breakdown */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Breakdown</h3>
                <div className="h-80">
                  {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={revenueData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "0.5rem",
                            border: "1px solid #e5e7eb",
                          }}
                          formatter={(value) => [`PKR ${value}`, undefined]}
                        />
                        <Legend />
                        <Bar dataKey="services" name="Services" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="products" name="Product Commissions" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No revenue data available for the last 7 months.
                    </div>
                  )}
                </div>
              </div>

              {/* Appointments Trend */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointments Trend</h3>
                <div className="h-80">
                  {appointmentsData.length > 0 && appointmentsData.some(data => data.appointments > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={appointmentsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "0.5rem",
                            border: "1px solid #e5e7eb",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="appointments"
                          name="Appointments"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No appointments data available for this month.
                    </div>
                  )}
                </div>
              </div>

              {/* Services by Name */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Services by Name</h3>
                <div className="h-80">
                  {servicesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={servicesData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          // label={({ name }) => name}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {servicesData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "0.5rem",
                            border: "1px solid #e5e7eb",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No services data available for this month.
                    </div>
                  )}
                </div>
              </div>

              {/* Best Selling Products */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Best Selling Products</h3>
                <div className="overflow-x-auto">
                  {bestSellingProducts.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-600">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 font-medium">Product</th>
                          <th className="px-4 py-3 font-medium">Sold</th>
                          <th className="px-4 py-3 font-medium">Commission</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bestSellingProducts.map((product, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="font-medium text-gray-800">{product.productName}</span>
                            </td>
                            <td className="px-4 py-3">{product.sold}</td>
                            <td className="px-4 py-3">PKR {product.commission.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex items-center justify-center h-40 text-gray-500">
                      No best-selling products data available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;