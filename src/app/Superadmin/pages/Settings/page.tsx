"use client";

import { useState } from "react";
import { Button } from "@/app/Superadmin/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/components/ui/card";
import { Input } from "@/app/Superadmin/components/ui/input";
import { Label } from "@/app/Superadmin/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/components/ui/tabs";
import { Switch } from "@/app/Superadmin/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Superadmin/components/ui/select";
import { Textarea } from "@/app/Superadmin/components/ui/textarea";
import { Separator } from "@/app/Superadmin/components/ui/separator";
import {
  Bell,
  CreditCard,
  Globe,
  Lock,
  Mail,
  Percent,
  Save,
  Shield,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Settings saved successfully");
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage platform settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start mb-6 overflow-x-auto">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="salon" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Salon Settings</span>
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            <span>Commissions</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Billing</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage basic platform settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" defaultValue="SalonSphere" />
                <p className="text-sm text-muted-foreground">
                  The name displayed throughout the platform.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  defaultValue="support@salonsphere.com"
                />
                <p className="text-sm text-muted-foreground">
                  Email address for customer support inquiries.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">
                      UTC (Coordinated Universal Time)
                    </SelectItem>
                    <SelectItem value="est">
                      EST (Eastern Standard Time)
                    </SelectItem>
                    <SelectItem value="cst">
                      CST (Central Standard Time)
                    </SelectItem>
                    <SelectItem value="mst">
                      MST (Mountain Standard Time)
                    </SelectItem>
                    <SelectItem value="pst">
                      PST (Pacific Standard Time)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Default timezone for displaying dates and times.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="cad">CAD (C$)</SelectItem>
                    <SelectItem value="aud">AUD (A$)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Default currency for prices and payments.
                </p>
              </div>

              <Separator />

              <div className="flex flex-row items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to temporarily disable the platform.
                  </p>
                </div>
                <Switch id="maintenance-mode" />
              </div>

              <div className="flex flex-row items-center justify-between">
                <div>
                  <Label htmlFor="analytics">Analytics Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable analytics tracking to collect usage data.
                  </p>
                </div>
                <Switch id="analytics" defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="salon">
          <Card>
            <CardHeader>
              <CardTitle>Salon Settings</CardTitle>
              <CardDescription>
                Configure default settings for salons.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="default-commission">
                    Default Commission Rate (%)
                  </Label>
                  <Input
                    id="default-commission"
                    type="number"
                    defaultValue="5"
                    min="0"
                    max="100"
                  />
                  <p className="text-sm text-muted-foreground">
                    Default commission percentage for all salons.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payout-schedule">
                    Default Payout Schedule
                  </Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger id="payout-schedule">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Default schedule for processing salon payouts.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription-tiers">Subscription Plans</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Basic</CardTitle>
                      <CardDescription>$49/month</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>Maximum 100 products</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>5% commission rate</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>Basic analytics</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>Email support</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Standard</CardTitle>
                      <CardDescription>$99/month</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>Maximum 500 products</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>4% commission rate</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>Advanced analytics</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>Priority support</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Premium</CardTitle>
                      <CardDescription>$199/month</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>Unlimited products</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>3% commission rate</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>Full analytics suite</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>24/7 dedicated support</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              <div className="flex flex-row items-center justify-between">
                <div>
                  <Label htmlFor="salon-approval">Require Salon Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    Manually approve all new salon registrations.
                  </p>
                </div>
                <Switch id="salon-approval" defaultChecked />
              </div>

              <div className="flex flex-row items-center justify-between">
                <div>
                  <Label htmlFor="product-approval">
                    Require Product Approval
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Manually approve all new products added by salons.
                  </p>
                </div>
                <Switch id="product-approval" defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" defaultValue="Admin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" defaultValue="User" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="admin@salonsphere.com"
                />
                <p className="text-sm text-muted-foreground">
                  This email is used for notifications and login.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="+1 (555) 123-4567" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-role">Admin Role</Label>
                <Select defaultValue="superadmin">
                  <SelectTrigger id="admin-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="support">Support Agent</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Your access level within the system.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="change-password">Change Password</Label>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Current password"
                  />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="New password"
                  />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  Update Password
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Additional security for your account.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-base">Active Sessions</Label>
                <p className="text-sm text-muted-foreground">
                  Manage your active login sessions.
                </p>

                <div className="space-y-4 mt-4">
                  <div className="flex justify-between items-start border rounded-md p-3">
                    <div>
                      <p className="font-medium">Chrome on Windows</p>
                      <p className="text-sm text-muted-foreground">
                        Current session · Last active just now
                      </p>
                      <p className="text-xs text-muted-foreground">
                        192.168.1.1 · New York, USA
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </Button>
                  </div>

                  <div className="flex justify-between items-start border rounded-md p-3">
                    <div>
                      <p className="font-medium">Safari on macOS</p>
                      <p className="text-sm text-muted-foreground">
                        Last active 2 days ago
                      </p>
                      <p className="text-xs text-muted-foreground">
                        192.168.1.2 · Los Angeles, USA
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </Button>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="mt-2">
                  Logout of All Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Control which notifications you receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base">Email Notifications</Label>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">New Salon Registration</p>
                      <p className="text-sm text-muted-foreground">
                        Receive email when a new salon registers
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">New Orders</p>
                      <p className="text-sm text-muted-foreground">
                        Receive email for new orders
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Payment Processing</p>
                      <p className="text-sm text-muted-foreground">
                        Receive email for payment confirmations
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Customer Support</p>
                      <p className="text-sm text-muted-foreground">
                        Receive email for new support tickets
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Marketing Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features and updates
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base">System Notifications</Label>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Low Stock Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Notification when product stock is low
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Payout Confirmations</p>
                      <p className="text-sm text-muted-foreground">
                        Notification when payouts are processed
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Notification for suspicious account activity
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input
                  id="notification-email"
                  type="email"
                  defaultValue="notifications@salonsphere.com"
                />
                <p className="text-sm text-muted-foreground">
                  Separate email address for receiving notifications.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Commission Settings</CardTitle>
              <CardDescription>
                Configure commission rates and payout settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base">Default Commission Rates</Label>
                <p className="text-sm text-muted-foreground">
                  Set the default commission percentage for each subscription
                  plan.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="basic-commission">Basic Plan</Label>
                    <div className="flex items-center">
                      <Input
                        id="basic-commission"
                        type="number"
                        defaultValue="5"
                        min="0"
                        max="100"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="standard-commission">Standard Plan</Label>
                    <div className="flex items-center">
                      <Input
                        id="standard-commission"
                        type="number"
                        defaultValue="4"
                        min="0"
                        max="100"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="premium-commission">Premium Plan</Label>
                    <div className="flex items-center">
                      <Input
                        id="premium-commission"
                        type="number"
                        defaultValue="3"
                        min="0"
                        max="100"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-base">Payout Schedule</Label>
                <p className="text-sm text-muted-foreground">
                  Configure when commissions are calculated and paid out.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="calculation-period">
                      Calculation Period
                    </Label>
                    <Select defaultValue="monthly">
                      <SelectTrigger id="calculation-period">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payout-day">Payout Day</Label>
                    <Select defaultValue="1">
                      <SelectTrigger id="payout-day">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st of month</SelectItem>
                        <SelectItem value="15">15th of month</SelectItem>
                        <SelectItem value="last">Last day of month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-base">Minimum Payout Amount</Label>
                <p className="text-sm text-muted-foreground">
                  Minimum amount required for commission payout.
                </p>

                <div className="flex items-center mt-2 w-full max-w-xs">
                  <span className="mr-2">$</span>
                  <Input
                    id="min-payout"
                    type="number"
                    defaultValue="50"
                    min="0"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Amounts below this threshold will roll over to the next payout
                  period.
                </p>
              </div>

              <Separator />

              <div className="flex flex-row items-center justify-between">
                <div>
                  <Label htmlFor="automatic-payouts">Automatic Payouts</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically process payouts on the scheduled day.
                  </p>
                </div>
                <Switch id="automatic-payouts" defaultChecked />
              </div>

              <div className="flex flex-row items-center justify-between">
                <div>
                  <Label htmlFor="commission-notifications">
                    Commission Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to salons when commissions are processed.
                  </p>
                </div>
                <Switch id="commission-notifications" defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>
                Manage payment methods and billing information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base">Payment Methods</Label>

                <div className="space-y-4 mt-4">
                  <div className="flex justify-between items-center border rounded-md p-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">
                          Credit Card (Visa ending in 4242)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires 12/2025
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="mt-2">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-base">Billing Information</Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" defaultValue="SalonSphere Inc." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax-id">Tax ID / VAT Number</Label>
                    <Input id="tax-id" defaultValue="US123456789" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billing-email">Billing Email</Label>
                    <Input
                      id="billing-email"
                      type="email"
                      defaultValue="billing@salonsphere.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billing-phone">Billing Phone</Label>
                    <Input
                      id="billing-phone"
                      defaultValue="+1 (555) 987-6543"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base">Billing Address</Label>

                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      defaultValue="123 Main Street, Suite 100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" defaultValue="San Francisco" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State / Province</Label>
                      <Input id="state" defaultValue="CA" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP / Postal Code</Label>
                      <Input id="zip" defaultValue="94103" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select defaultValue="us">
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
