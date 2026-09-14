"use client";
import React, { useCallback, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useIsMobile } from "../../hooks/use-mobile";
import SidebarNavigation from "../../components/layout/SidebarNavigation";
import DashboardHeader from "../../components/layout/DashboardHeader";
import MobileMenu from "../../components/layout/MobileMenu";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
import { format } from "date-fns";

const Reviews: React.FC = () => {
  const isMobile = useIsMobile();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const salonId = session?.user?.salonId; // Use salonId from session
      if (!salonId) throw new Error("Salon ID not found in session");
      const response = await fetch(`/api/reviews?salonId=${salonId}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Must come after fetchReviews: the deps array is evaluated during render.
  useEffect(() => {
    setSidebarOpen(!isMobile);
    if (session?.user?.salonId) {
      fetchReviews();
    }
  }, [isMobile, session, fetchReviews]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }
        />
      ));
  };

  // Check if session is loading or user is not authenticated
  if (status === "loading") {
    return <div className="dashboard-content animate-fade-in">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="dashboard-content animate-fade-in text-red-500">
        Error: Please log in to view reviews
      </div>
    );
  }

  const userId = session?.user?.userId || "default-user-id"; // Use userId from session

  if (loading)
    return <div className="dashboard-content animate-fade-in">Loading...</div>;
  if (error)
    return (
      <div className="dashboard-content animate-fade-in text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="dashboard-layout">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <SidebarNavigation isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Mobile menu */}
      <MobileMenu isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-16"
        }`}
      >
        <DashboardHeader
          title="Reviews"
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          userId={userId}
        />
        <main className="dashboard-content animate-fade-in">
          <div className="space-y-6">
            <div className="glass p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-6">Reviews Overview</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {reviews.length}
                  </div>
                  <p className="text-gray-500">Total Reviews</p>
                </div>

                <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm text-center">
                  <div className="text-4xl font-bold text-yellow-500 mb-2">
                    {(
                      reviews.reduce((acc, r) => acc + r.rating, 0) /
                      (reviews.length || 1)
                    ).toFixed(1)}
                  </div>
                  <p className="text-gray-500">Average Rating</p>
                </div>

                <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm text-center">
                  <div className="text-4xl font-bold text-green-500 mb-2">
                    {reviews.filter((r) => r.rating >= 4).length}
                  </div>
                  <p className="text-gray-500">Positive Reviews</p>
                </div>

                <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm text-center">
                  <div className="text-4xl font-bold text-gray-500 mb-2">
                    {reviews.filter((r) => r.rating < 4).length}
                  </div>
                  <p className="text-gray-500">Improvement Needed</p>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-6">Recent Reviews</h2>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {review.customerEmail.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {review.customerEmail}
                          </h3>
                          <div className="flex items-center mt-1 space-x-1">
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {format(
                              new Date(review.createdAt),
                              "MMMM dd, yyyy"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {review.service?.name || "N/A"}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-gray-700">
                        {review.comment || "No comment"}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center space-x-4 pt-4 border-t">
                      <button className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
                        <MessageSquare size={16} className="mr-1" />
                        Reply
                      </button>
                      <button className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
                        <ThumbsUp size={16} className="mr-1" />
                        Thank
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reviews;
