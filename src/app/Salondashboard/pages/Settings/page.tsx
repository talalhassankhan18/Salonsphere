"use client"
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from '../../hooks/use-toast';
import { 
  UserCircle, 
  Lock, 
  Bell, 
  CreditCard, 
  Settings as SettingsIcon, 
  Banknote, 
  Check, 
  X,
  Palette,
  Building,
  Clock,
  Shield,
  Calendar,
  Users
} from 'lucide-react';

const Settings: React.FC = () => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState<boolean>(true);
  const [isMarketingEmailsEnabled, setIsMarketingEmailsEnabled] = useState<boolean>(false);
  const [isAppointmentRemindersEnabled, setIsAppointmentRemindersEnabled] = useState<boolean>(true);
  const [isPromotionalUpdatesEnabled, setIsPromotionalUpdatesEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleSaveProfile = (): void => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };

  const handleSavePassword = (): void => {
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully",
    });
  };

  const handleSaveNotifications = (): void => {
    toast({
      title: "Notifications updated",
      description: "Your notification settings have been updated",
    });
  };

  const handleSaveBilling = (): void => {
    toast({
      title: "Billing info updated",
      description: "Your billing information has been updated",
    });
  };

  const handleSaveSalon = (): void => {
    toast({
      title: "Salon settings updated",
      description: "Your salon settings have been updated successfully",
    });
  };

  const handleSaveSchedule = (): void => {
    toast({
      title: "Schedule settings updated",
      description: "Your scheduling preferences have been updated",
    });
  };

  const handleSavePrivacy = (): void => {
    toast({
      title: "Privacy settings updated",
      description: "Your privacy settings have been updated successfully",
    });
  };

  const toggleTheme = (): void => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    toast({
      title: "Theme changed",
      description: `Theme switched to ${theme === 'light' ? 'dark' : 'light'} mode`,
    });
  };

  const handleSwitchChange = (setter: React.Dispatch<React.SetStateAction<boolean>>) => 
    (checked: boolean): void => setter(checked);

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <TabsTrigger value="profile">
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="mr-2 h-4 w-4" />
              Password
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="salon">
              <Building className="mr-2 h-4 w-4" />
              Salon
            </TabsTrigger>
            <TabsTrigger value="scheduling">
              <Clock className="mr-2 h-4 w-4" />
              Scheduling
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="mr-2 h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="mr-2 h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile information and how you appear to others</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" placeholder="Write a short bio about yourself" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 (555) 123-4567" />
                </div>
                <div>
                  <Label htmlFor="position">Professional Title/Position</Label>
                  <Input id="position" placeholder="Hair Stylist, Salon Manager, etc." />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile}>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Update Password</CardTitle>
                <CardDescription>Change your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Password should be at least 8 characters long and include numbers, symbols, and uppercase letters.
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePassword}>
                  <Check className="mr-2 h-4 w-4" />
                  Update Password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications" className="font-medium">Enable All Notifications</Label>
                    <p className="text-sm text-muted-foreground">Master toggle for all notifications</p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={isNotificationsEnabled}
                    onCheckedChange={handleSwitchChange(setIsNotificationsEnabled)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="appointmentReminders" className="font-medium">Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get notified before scheduled appointments</p>
                  </div>
                  <Switch 
                    id="appointmentReminders"
                    checked={isAppointmentRemindersEnabled}
                    onCheckedChange={handleSwitchChange(setIsAppointmentRemindersEnabled)}
                    disabled={!isNotificationsEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketingEmails" className="font-medium">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional emails and offers</p>
                  </div>
                  <Switch 
                    id="marketingEmails"
                    checked={isMarketingEmailsEnabled}
                    onCheckedChange={handleSwitchChange(setIsMarketingEmailsEnabled)}
                    disabled={!isNotificationsEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="promotionalUpdates" className="font-medium">Promotional Updates</Label>
                    <p className="text-sm text-muted-foreground">Receive updates about new services and products</p>
                  </div>
                  <Switch 
                    id="promotionalUpdates"
                    checked={isPromotionalUpdatesEnabled}
                    onCheckedChange={handleSwitchChange(setIsPromotionalUpdatesEnabled)}
                    disabled={!isNotificationsEnabled}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveNotifications}>
                  <Check className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>Update your billing details and payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input id="cardName" defaultValue="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="**** **** **** ****" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="CVV" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Billing Address</Label>
                  <Input id="address" placeholder="123 Main Street" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="New York" />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Zip/Postal Code</Label>
                    <Input id="zipCode" placeholder="10001" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input id="state" placeholder="NY" />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" placeholder="United States" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add New Card
                </Button>
                <Button onClick={handleSaveBilling}>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="salon" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Salon Settings</CardTitle>
                <CardDescription>Configure your salon information and business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salonName">Salon Name</Label>
                    <Input id="salonName" placeholder="Beauty & Style Salon" />
                  </div>
                  <div>
                    <Label htmlFor="salonPhone">Business Phone</Label>
                    <Input id="salonPhone" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="salonAddress">Salon Address</Label>
                  <Input id="salonAddress" placeholder="123 Main Street" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salonCity">City</Label>
                    <Input id="salonCity" placeholder="New York" />
                  </div>
                  <div>
                    <Label htmlFor="salonZip">Zip/Postal Code</Label>
                    <Input id="salonZip" placeholder="10001" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="salonWebsite">Website</Label>
                  <Input id="salonWebsite" placeholder="https://www.yoursalon.com" />
                </div>
                <div>
                  <Label htmlFor="salonDescription">Business Description</Label>
                  <Input id="salonDescription" placeholder="Tell clients about your salon and services" />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSalon}>
                  <Check className="mr-2 h-4 w-4" />
                  Save Salon Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Scheduling Preferences</CardTitle>
                <CardDescription>Configure your appointment scheduling preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessHours">Business Hours</Label>
                    <div className="text-sm text-muted-foreground mb-2">Set your typical operating hours</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input id="openTime" placeholder="9:00 AM" />
                      <Input id="closeTime" placeholder="6:00 PM" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="appointmentBuffer">Appointment Buffer</Label>
                    <div className="text-sm text-muted-foreground mb-2">Minutes between appointments</div>
                    <Input id="buffer" placeholder="15" type="number" min="0" max="60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Working Days</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox id={day.toLowerCase()} defaultChecked={day !== 'Sunday'} />
                        <Label htmlFor={day.toLowerCase()}>{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="allowOnlineBooking" defaultChecked />
                  <Label htmlFor="allowOnlineBooking">Allow online appointment booking</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="requireConfirmation" defaultChecked />
                  <Label htmlFor="requireConfirmation">Require manual confirmation of appointments</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSchedule}>
                  <Check className="mr-2 h-4 w-4" />
                  Save Scheduling Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Manage your privacy and data sharing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dataSharing" className="font-medium">Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow anonymous usage data to improve services</p>
                  </div>
                  <Switch id="dataSharing" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showProfile" className="font-medium">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Make your profile visible to clients</p>
                  </div>
                  <Switch id="showProfile" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showPortfolio" className="font-medium">Portfolio Visibility</Label>
                    <p className="text-sm text-muted-foreground">Allow your work portfolio to be publicly visible</p>
                  </div>
                  <Switch id="showPortfolio" defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="font-medium">Data Management</Label>
                  <Button variant="outline" className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Client Data Access
                  </Button>
                  <Button variant="outline" className="w-full">
                    Download My Data
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePrivacy}>
                  <Check className="mr-2 h-4 w-4" />
                  Save Privacy Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="theme" className="font-medium">Theme</Label>
                    <p className="text-sm text-muted-foreground">Choose between light and dark mode</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={toggleTheme}>
                    {theme === 'light' ? (
                      <>
                        <Bell className="mr-2 h-4 w-4" />
                        Switch to Dark
                      </>
                    ) : (
                      <>
                        <Bell className="mr-2 h-4 w-4" />
                        Switch to Light
                      </>
                    )}
                  </Button>
                </div>
                <Separator />
                <div>
                  <Label className="font-medium">Color Palette</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {['Pink', 'Purple', 'Blue', 'Green', 'Orange'].map((color) => (
                      <div 
                        key={color}
                        className={`h-10 rounded-md flex items-center justify-center cursor-pointer border-2 ${color.toLowerCase() === 'pink' ? 'border-primary' : 'border-transparent'}`}
                        style={{
                          backgroundColor: 
                            color === 'Pink' ? 'hsl(327, 83%, 53.3%)' :
                            color === 'Purple' ? '#8B5CF6' :
                            color === 'Blue' ? '#0EA5E9' :
                            color === 'Green' ? '#10B981' :
                            '#F97316'
                        }}
                      >
                        {color === 'Pink' && <Check className="h-4 w-4 text-white" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Font Size</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Small', 'Medium', 'Large'].map((size) => (
                      <Button 
                        key={size}
                        variant={size === 'Medium' ? 'default' : 'outline'}
                        className="w-full"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>
                  <Check className="mr-2 h-4 w-4" />
                  Save Appearance
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;