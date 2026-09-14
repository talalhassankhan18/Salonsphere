
"use client";
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/dashboard/components/ui/card";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import { Input } from "@/app/Superadmin/dashboard/components/ui/input";
import { Textarea } from "@/app/Superadmin/dashboard/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/dashboard/components/ui/tabs";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/Superadmin/dashboard/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Superadmin/dashboard/components/ui/select";
import { useToast } from "@/app/Superadmin/dashboard/hooks/use-toast";
import {
  Bell,
  Megaphone,
  Users,
  Store,
  Calendar,
  Tag,
  Plus,
  Info,
  CheckCircle,
  Send,
  Clock,
  EyeOff,
  Trash2,
  Edit,
  Search,
} from "lucide-react";
import { Badge } from "@/app/Superadmin/dashboard/components/ui/badge";
import { Switch } from "@/app/Superadmin/dashboard/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Superadmin/dashboard/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/Superadmin/dashboard/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/app/Superadmin/dashboard/components/ui/calendar";
import MultiSelect from "@/app/Superadmin/dashboard/components/ui/multi-select";

// Interfaces
interface Notification {
  _id: string;
  title: string;
  content: string;
  type: string;
  target: string;
  recipientIds: string[];
  status: string;
  createdAt: string;
  scheduledFor?: string;
  sentAt?: string;
  read: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  type: "customer" | "salon";
}

// Form data type
interface FormData {
  title: string;
  content: string;
  type: string;
  target: string;
  recipientIds: string[];
  schedule: boolean;
  scheduledFor: string;
}

// Helper function for notification type icons
const getNotificationTypeIcon = (type: string) => {
  switch (type) {
    case "announcement":
      return <Megaphone className="h-4 w-4 text-purple-600" />;
    case "product":
      return <Tag className="h-4 w-4 text-blue-600" />;
    case "promotion":
      return <Tag className="h-4 w-4 text-amber-600" />;
    case "billing":
      return <Calendar className="h-4 w-4 text-rose-600" />;
    case "system":
      return <Info className="h-4 w-4 text-slate-600" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

// Helper function for status badges
const getStatusBadge = (status: string) => {
  switch (status) {
    case "sent":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-500">
          Sent
        </Badge>
      );
    case "scheduled":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-500">
          Scheduled
        </Badge>
      );
    case "draft":
      return (
        <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-500">
          Draft
        </Badge>
      );
    default:
      return <Badge>Unknown</Badge>;
  }
};

// Helper function for read status
const getReadBadge = (read: boolean) => {
  return read ? (
    <Badge className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500">
      Read
    </Badge>
  ) : (
    <Badge className="bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500">
      Unread
    </Badge>
  );
};

// Helper function for target audience icons
const getTargetIcon = (target: string) => {
  switch (target) {
    case "all":
      return <Users className="h-4 w-4" />;
    case "salons":
      return <Store className="h-4 w-4" />;
    case "customers":
      return <Users className="h-4 w-4" />;
    case "specific":
      return <Users className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

// Templates
const templates = [
  {
    name: "Welcome Message",
    title: "Welcome to SalonSphere!",
    content:
      "Welcome to SalonSphere! We're excited to have you join our platform.",
    type: "system",
  },
  {
    name: "Product Launch",
    title: "New Product Launch",
    content:
      "Exciting news! We're launching a new product line that's now available.",
    type: "product",
  },
  {
    name: "Payment Reminder",
    title: "Payment Reminder",
    content:
      "This is a friendly reminder that your subscription payment is due soon.",
    type: "billing",
  },
];

const Notifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      content: "",
      type: "",
      target: "",
      recipientIds: [],
      schedule: false,
      scheduledFor: "",
    },
  });

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/notifications");
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data: Notification[] = await response.json();
        setNotifications(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Fetch users (salons and customers) for specific target
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [salonResponse, customerResponse] = await Promise.all([
          fetch("/api/salon"),
          fetch("/api/customers"),
        ]);
        if (!salonResponse.ok || !customerResponse.ok) {
          throw new Error("Failed to fetch users");
        }
        const salons = await salonResponse.json();
        const customers = await customerResponse.json();

        const mappedUsers = [
          ...salons.map((salon: any) => ({
            _id: salon._id,
            name: salon.salonName,
            email: salon.email,
            type: "salon",
          })),
          ...customers.map((customer: any) => ({
            _id: customer._id,
            name: customer.name || "N/A",
            email: customer.email,
            type: "customer",
          })),
        ];
        setUsers(mappedUsers);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    fetchUsers();
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(
    (notification) =>
      (notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.content
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (typeFilter === "all" || notification.type === typeFilter) &&
      (statusFilter === "all" || notification.status === statusFilter) &&
      (readFilter === "all" ||
        (readFilter === "read" && notification.read) ||
        (readFilter === "unread" && !notification.read)) &&
      (activeTab === "all" || notification.status === activeTab)
  );

  // Form submission
  const onSubmit = async (data: FormData) => {
    try {
      const scheduledFor =
        data.schedule && data.scheduledFor
          ? new Date(data.scheduledFor).toISOString()
          : null;
      const status = data.schedule ? "scheduled" : "sent";

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          type: data.type,
          target: data.target,
          recipientIds: data.recipientIds ?? [],
          status,
          scheduledFor,
          read: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create notification");
      }

      const newNotification: Notification = await response.json();
      setNotifications([newNotification, ...notifications]);
      toast({
        title: "Success",
        description: "Notification created successfully!",
      });
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Save as draft
  const saveAsDraft = async () => {
    const data = form.getValues();
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          type: data.type,
          target: data.target,
          recipientIds: data.recipientIds ?? [],
          status: "draft",
          scheduledFor: null,
          read: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save draft");
      }

      const newNotification: Notification = await response.json();
      setNotifications([newNotification, ...notifications]);
      toast({ title: "Success", description: "Draft saved successfully!" });
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Send test notification
  const sendTestNotification = () => {
    const data = form.getValues();
    if (!data.title || !data.content) {
      toast({
        title: "Error",
        description: "Title and content are required for a test notification",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Test notification sent",
      description: `Test notification "${data.title}" has been sent to your account.`,
    });
  };

  // Delete notification
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete notification");
      }
      setNotifications(notifications.filter((n) => n._id !== id));
      toast({
        title: "Success",
        description: "Notification deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Send draft notification
  const handleSendDraft = async (notification: Notification) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...notification,
          _id: undefined,
          status: "sent",
          sentAt: new Date().toISOString(),
          read: false,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send notification");
      }
      await handleDelete(notification._id);
      const updatedNotification: Notification = await response.json();
      setNotifications([updatedNotification, ...notifications]);
      toast({
        title: "Success",
        description: "Notification sent successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Edit notification
  const handleEdit = (notification: Notification) => {
    form.setValue("title", notification.title);
    form.setValue("content", notification.content);
    form.setValue("type", notification.type);
    form.setValue("target", notification.target);
    form.setValue("recipientIds", notification.recipientIds ?? []);
    form.setValue("schedule", !!notification.scheduledFor);
    form.setValue("scheduledFor", notification.scheduledFor || "");
    setActiveTab("create");
  };

  // Use template
  const handleUseTemplate = (template: any) => {
    form.setValue("title", template.title);
    form.setValue("content", template.content);
    form.setValue("type", template.type);
    setActiveTab("create");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Create and manage notifications for users and salons
          </p>
        </div>
        <Button onClick={() => setActiveTab("create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Notification
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Notifications
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {notifications.length}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sent
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {
                    notifications.filter(
                      (notification) => notification.status === "sent"
                    ).length
                  }
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/30">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Scheduled
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {
                    notifications.filter(
                      (notification) => notification.status === "scheduled"
                    ).length
                  }
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center dark:bg-amber-900/30">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Drafts
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {
                    notifications.filter(
                      (notification) => notification.status === "draft"
                    ).length
                  }
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-900/30">
                <EyeOff className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <TabsList>
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="promotion">Promotions</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Read Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Read</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification) => (
                        <TableRow key={notification._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {notification.content}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getNotificationTypeIcon(notification.type)}
                              <span className="text-sm capitalize">
                                {notification.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getTargetIcon(notification.target)}
                              <span className="text-sm capitalize">
                                {notification.target}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {notification.recipientIds?.length ?? 0}
                          </TableCell>
                          <TableCell>
                            {notification.status === "sent"
                              ? new Date(
                                  notification.sentAt as string
                                ).toLocaleDateString()
                              : notification.status === "scheduled"
                              ? new Date(
                                  notification.scheduledFor as string
                                ).toLocaleDateString()
                              : new Date(
                                  notification.createdAt
                                ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(notification.status)}
                          </TableCell>
                          <TableCell>
                            {getReadBadge(notification.read)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {notification.status === "draft" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(notification)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {notification.status === "draft" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleSendDraft(notification)}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(notification._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          No notifications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Read</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification) => (
                        <TableRow key={notification._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {notification.content}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getNotificationTypeIcon(notification.type)}
                              <span className="text-sm capitalize">
                                {notification.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getTargetIcon(notification.target)}
                              <span className="text-sm capitalize">
                                {notification.target}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {notification.recipientIds?.length ?? 0}
                          </TableCell>
                          <TableCell>
                            {notification.sentAt
                              ? new Date(
                                  notification.sentAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(notification.status)}
                          </TableCell>
                          <TableCell>
                            {getReadBadge(notification.read)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(notification._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          No sent notifications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Read</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification) => (
                        <TableRow key={notification._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {notification.content}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getNotificationTypeIcon(notification.type)}
                              <span className="text-sm capitalize">
                                {notification.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getTargetIcon(notification.target)}
                              <span className="text-sm capitalize">
                                {notification.target}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {notification.recipientIds?.length ?? 0}
                          </TableCell>
                          <TableCell>
                            {notification.scheduledFor
                              ? new Date(
                                  notification.scheduledFor
                                ).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(notification.status)}
                          </TableCell>
                          <TableCell>
                            {getReadBadge(notification.read)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(notification)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(notification._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          No scheduled notifications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Read</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification) => (
                        <TableRow key={notification._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {notification.content}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getNotificationTypeIcon(notification.type)}
                              <span className="text-sm capitalize">
                                {notification.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getTargetIcon(notification.target)}
                              <span className="text-sm capitalize">
                                {notification.target}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {notification.recipientIds?.length ?? 0}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(notification.status)}
                          </TableCell>
                          <TableCell>
                            {getReadBadge(notification.read)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(notification)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSendDraft(notification)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(notification._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center h-24">
                          No draft notifications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Create New Notification</CardTitle>
              <CardDescription>
                Compose and send a new notification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    rules={{ required: "Title is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Notification title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    rules={{ required: "Content is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write your notification content here..."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      rules={{ required: "Type is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="announcement">
                                Announcement
                              </SelectItem>
                              <SelectItem value="product">Product</SelectItem>
                              <SelectItem value="promotion">
                                Promotion
                              </SelectItem>
                              <SelectItem value="billing">Billing</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target"
                      rules={{ required: "Target audience is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select audience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="salons">All Salons</SelectItem>
                              <SelectItem value="customers">
                                All Customers
                              </SelectItem>
                              <SelectItem value="specific">
                                Specific Users
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("target") === "specific" && (
                    <FormField
                      control={form.control}
                      name="recipientIds"
                      rules={{
                        required: "Please select at least one recipient",
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Recipients</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={users.map((user) => ({
                                value: user._id,
                                label: `${user.name} (${user.email}) - ${user.type}`,
                              }))}
                              onChange={(selected: string[]) =>
                                field.onChange(selected)
                              }
                              selected={field.value}
                              placeholder="Select users..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="schedule"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Schedule for later
                          </FormLabel>
                          <FormDescription>
                            Toggle to schedule this notification for a future
                            date
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("schedule") && (
                    <FormField
                      control={form.control}
                      name="scheduledFor"
                      rules={{ required: "Please select a schedule date" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={`w-full justify-start text-left font-normal ${
                                    !field.value && "text-muted-foreground"
                                  }`}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(new Date(field.value), "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  field.onChange(date ? date.toISOString() : "")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={sendTestNotification}
                    >
                      Send Test
                    </Button>
                    <div className="space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={saveAsDraft}
                      >
                        Save as Draft
                      </Button>
                      <Button type="submit">Send Notification</Button>
                    </div>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Notification Templates</CardTitle>
          <CardDescription>
            Reusable templates for common notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground">{template.content}</p>
                </CardContent>
                <CardContent className="pt-0 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
