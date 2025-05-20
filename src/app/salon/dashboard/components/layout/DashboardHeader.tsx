"use client";
import React, { useState, useEffect, useRef } from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/Superadmin/dashboard/components/ui/popover";

interface Notification {
  _id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  read: boolean;
}

interface DashboardHeaderProps {
  title: string;
  toggleSidebar: () => void;
  isMobile: boolean;
  userId: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  toggleSidebar,
  isMobile,
  userId,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [hasPendingSound, setHasPendingSound] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchNotifications = async () => {
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      console.error("Invalid userId, cannot fetch notifications");
      return;
    }
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data: Notification[] = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const initializeSSE = () => {
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      console.error("Invalid userId, skipping SSE connection");
      return;
    }

    const sseUrl = `/api/notifications/sse?userId=${userId}`;
    eventSourceRef.current = new EventSource(sseUrl);

    eventSourceRef.current.onopen = () => {
      console.log("SSE connection established for userId:", userId);
    };

    eventSourceRef.current.onmessage = (event) => {
      const notification: Notification = JSON.parse(event.data);
      setNotifications((prev) => {
        if (!prev.some((n) => n._id === notification._id)) {
          const updated = [notification, ...prev];
          setUnreadCount(updated.filter((n) => !n.read).length);
          if (!notification.read) {
            playSound();
            setIsPopupOpen(true);
            setTimeout(() => setIsPopupOpen(false), 2500);
          }
          return updated;
        }
        return prev;
      });
    };

    eventSourceRef.current.onerror = (error) => {
      console.error("SSE connection error:", error);
      setTimeout(() => {
        console.log("Attempting to reconnect SSE...");
        if (eventSourceRef.current) eventSourceRef.current.close();
        initializeSSE();
      }, 5000);
    };

    // Send heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      if (eventSourceRef.current && eventSourceRef.current.readyState === 1) {
        eventSourceRef.current.dispatchEvent(new Event("ping"));
      }
    }, 30000);

    return () => clearInterval(heartbeat);
  };

  useEffect(() => {
    fetchNotifications();
    initializeSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        console.log("SSE connection closed");
      }
    };
  }, [userId]);

  const playSound = () => {
    if (!audioRef.current) {
      console.error("Audio element not found");
      return;
    }
    audioRef.current
      .play()
      .then(() => {
        console.log("Sound played successfully");
        setHasPendingSound(false);
      })
      .catch((error) => {
        console.error(
          "Error playing sound, queuing for next interaction:",
          error.message
        );
        setHasPendingSound(true);
      });
  };

  const handleBellClick = () => {
    if (hasPendingSound) playSound();
    setIsPopupOpen(true);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n._id);
      await Promise.all(
        unreadIds.map((id) =>
          fetch("/api/notifications/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationId: id }),
          })
        )
      );
      await fetchNotifications();
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow">
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </Button>
      )}
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center space-x-4">
        <Popover open={isPopupOpen} onOpenChange={setIsPopupOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="relative"
              onClick={handleBellClick}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Notifications</h4>
                {unreadCount > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Mark All as Read
                  </Button>
                )}
              </div>
              {hasPendingSound && (
                <p className="text-sm text-yellow-600">
                  Click the bell to enable notification sounds.
                </p>
              )}
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-2 rounded ${
                      notification.read ? "bg-gray-100" : "bg-blue-50"
                    }`}
                  >
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-600">
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    {!notification.read && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => markAsRead(notification._id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <audio ref={audioRef} src="/notification.wav" preload="auto" />
    </header>
  );
};

export default DashboardHeader;