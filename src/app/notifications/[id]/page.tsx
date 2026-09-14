"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Bell, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/app/salon/dashboard/components/ui/button";
import React from "react";

interface Notification {
  _id: string;
  title: string;
  content: string;
  type: "booking" | "status_update" | "system" | "promotion";
  read: boolean;
  createdAt: string;
}

const NotificationsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { id } = React.use(params);

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      toast({
        title: "Invalid ID",
        description: "The notification ID is invalid.",
        variant: "destructive",
      });
      router.push("/auth/signin");
      return;
    }
    if (session.user?.id !== id) {
      toast({
        title: "Unauthorized",
        description: "You are not authorized to view this page.",
        variant: "destructive",
      });
      router.push("/auth/signin");
      return;
    }

    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/notifications?userId=${id}`);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data: Notification[] = await res.json();
        const sortedNotifications = data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(sortedNotifications);
      } catch (err: any) {
        console.error("Error fetching notifications:", err);
        setError(err.message || "Failed to fetch notifications");
        toast({
          title: "Error",
          description: err.message || "Failed to fetch notifications",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    const sseUrl = `/api/notifications/sse?userId=${id}`;
    eventSourceRef.current = new EventSource(sseUrl);

    eventSourceRef.current.onmessage = (event) => {
      const notification: Notification = JSON.parse(event.data);
      setNotifications((prev) => {
        if (!prev.some((n) => n._id === notification._id)) {
          return [notification, ...prev].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return prev;
      });
    };

    eventSourceRef.current.onerror = () => {
      console.error("SSE connection error, attempting reconnect...");
      if (eventSourceRef.current) eventSourceRef.current.close();
      setTimeout(() => {
        eventSourceRef.current = new EventSource(sseUrl);
      }, 5000);
    };

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, [id, session, router]);

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (!res.ok) throw new Error("Failed to mark notification as read");
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      toast({
        title: "Notification Marked as Read",
        description: "The notification has been marked as read.",
      });
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
      setError(err.message || "Failed to mark notification as read");
      toast({
        title: "Error",
        description: err.message || "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar size={16} className="text-blue-500" />;
      case "status_update":
        return <CheckCircle size={16} className="text-green-500" />;
      case "system":
        return <AlertCircle size={16} className="text-red-500" />;
      case "promotion":
        return <Bell size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">
          Your Notifications
        </h1>
        {error && (
          <p className="text-red-500 mb-4 text-center bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}
        {isLoading ? (
          <p className="text-center text-gray-600">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No notifications found.</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <ul className="space-y-4">
              {notifications.map((notif) => (
                <li
                  key={notif._id}
                  className={`flex items-start space-x-4 p-4 rounded-lg border ${
                    notif.read ? "bg-gray-100" : "bg-blue-50"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{notif.title}</p>
                    <p className="text-sm text-gray-600">{notif.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(
                        new Date(notif.createdAt),
                        "dd MMM yyyy, h:mm a"
                      )}
                    </p>
                  </div>
                  {!notif.read && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => markAsRead(notif._id)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Mark as Read
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;