"use client";
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/components/ui/card";
import { Button } from "@/app/Superadmin/components/ui/button";
import { Input } from "@/app/Superadmin/components/ui/input";
import { Textarea } from "@/app/Superadmin/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/Superadmin/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Superadmin/components/ui/select";
import { useToast } from "@/app/Superadmin/hooks/use-toast";
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
  Filter,
} from "lucide-react";
import { Badge } from "@/app/Superadmin/components/ui/badge";
import { Switch } from "@/app/Superadmin/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Superadmin/components/ui/table";

// Mock data for notifications
const notificationData = [
  {
    id: "not-1",
    title: "Holiday Sale Announcement",
    content:
      "Our special holiday sale will begin next week. All products will be 25% off.",
    type: "announcement",
    target: "all",
    status: "scheduled",
    recipientCount: 350,
    createdAt: "2023-11-15T10:30:00Z",
    scheduledFor: "2023-11-20T08:00:00Z",
  },
  {
    id: "not-2",
    title: "New Product Line Launch",
    content:
      "We're excited to announce our new premium hair care line launching tomorrow!",
    type: "product",
    target: "salons",
    status: "sent",
    recipientCount: 120,
    createdAt: "2023-11-12T14:45:00Z",
    sentAt: "2023-11-12T15:00:00Z",
  },
  {
    id: "not-3",
    title: "Subscription Payment Reminder",
    content:
      "This is a reminder that your monthly subscription payment will be processed in 3 days.",
    type: "billing",
    target: "specific",
    status: "sent",
    recipientCount: 45,
    createdAt: "2023-11-10T09:15:00Z",
    sentAt: "2023-11-10T09:30:00Z",
  },
  {
    id: "not-4",
    title: "Salon Dashboard Update",
    content:
      "We've updated the salon dashboard with new analytics features. Check them out!",
    type: "system",
    target: "salons",
    status: "draft",
    recipientCount: 0,
    createdAt: "2023-11-08T16:20:00Z",
  },
  {
    id: "not-5",
    title: "Black Friday Promotion",
    content:
      "Don't miss our biggest sale of the year this Black Friday. Special discounts on all products!",
    type: "promotion",
    target: "all",
    status: "scheduled",
    recipientCount: 350,
    createdAt: "2023-11-05T11:10:00Z",
    scheduledFor: "2023-11-25T00:00:00Z",
  },
];

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

// Helper function for target audience icons
const getTargetIcon = (target: string) => {
  switch (target) {
    case "all":
      return <Users className="h-4 w-4" />;
    case "salons":
      return <Store className="h-4 w-4" />;
    case "specific":
      return <Users className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

const Notifications = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const form = useForm();
  const onSubmit = (data: any) => {
    console.log(data);
  };

  const filteredNotifications = notificationData.filter(
    (notification) =>
      (notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.content
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (typeFilter === "all" || notification.type === typeFilter) &&
      (statusFilter === "all" || notification.status === statusFilter)
  );

  const sendTestNotification = () => {
    toast({
      title: "Test notification sent",
      description: "The test notification has been sent to your account.",
    });
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
        <Button>
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
                  {notificationData.length}
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
                    notificationData.filter(
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
                    notificationData.filter(
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
                    notificationData.filter(
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

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <TabsList>
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification) => (
                        <TableRow key={notification.id}>
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
                          <TableCell>{notification.recipientCount}</TableCell>
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
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {notification.status === "draft" && (
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon">
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
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
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Notification title"
                          {...form.register("message")}
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your notification content here..."
                          rows={5}
                          {...form.register("message")}
                        />
                      </FormControl>
                    </FormItem>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder="Select type"
                                {...form.register("message")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="announcement">
                              Announcement
                            </SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="promotion">Promotion</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>

                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <Select>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder="Select audience"
                                {...form.register("message")}
                              />
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
                      </FormItem>
                    </div>

                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Schedule for later
                        </FormLabel>
                        <FormDescription>
                          Toggle to schedule this notification for a future date
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch />
                      </FormControl>
                    </FormItem>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        type="submit"
                        onClick={sendTestNotification}
                      >
                        Send Test
                      </Button>
                      <div className="space-x-2">
                        <Button variant="outline">Save as Draft</Button>
                        <Button>Send Notification</Button>
                      </div>
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Welcome Message</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">
                  Welcome to SalonSphere! We're excited to have you join our
                  platform.
                </p>
              </CardContent>
              <CardContent className="pt-0 flex justify-end">
                <Button variant="ghost" size="sm">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Product Launch</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">
                  Exciting news! We're launching a new product line that's now
                  available.
                </p>
              </CardContent>
              <CardContent className="pt-0 flex justify-end">
                <Button variant="ghost" size="sm">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment Reminder</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">
                  This is a friendly reminder that your subscription payment is
                  due soon.
                </p>
              </CardContent>
              <CardContent className="pt-0 flex justify-end">
                <Button variant="ghost" size="sm">
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
