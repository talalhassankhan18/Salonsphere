"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/app/Superadmin/dashboard/components/ui/sidebar";
import {
  BarChart4,
  Bell,
  CircleDollarSign,
  ClipboardList,
  Database,
  HelpCircle,
  Home,
  Layers,
  Package,
  ScrollText,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "@/app/Superadmin/dashboard/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = "/Superadmin/dashboard";

  // Function to check if the current path is active
  const isActive = (path: string) => {
    // Normalize paths for comparison
    const normalizedPathname = pathname.toLowerCase();
    const normalizedTargetPath = `${basePath}/pages/${path}`.toLowerCase();
    
    // Check if the pathname starts with the target path or matches exactly
    return normalizedPathname === normalizedTargetPath || 
           normalizedPathname.startsWith(`${normalizedTargetPath}/`);
  };

  const handleLogout = () => {
    localStorage.removeItem("superAdminEmail");
    localStorage.removeItem("superAdminLoggedIn");
    router.push("/Superadmin/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-6 flex justify-center items-center border-b">
        <Link href={`${basePath}/dashboard`} className="flex items-center gap-2">
          <span className="font-semibold text-lg text-primary">SS</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(isActive("Dashboard") && "bg-primary text-white")}
                  asChild
                >
                  <Link href={`${basePath}/pages/Dashboard`}>
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(isActive("Salons") && "bg-primary text-white")}
                  asChild
                >
                  <Link href={`${basePath}/pages/Salons`}>
                    <Store className="h-4 w-4" />
                    <span>Salons</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(isActive("Customers") && "bg-primary text-white")}
                  asChild
                >
                  <Link href={`${basePath}/pages/Customers`}>
                    <Users className="h-4 w-4" />
                    <span>Customers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(isActive("Orders") && "bg-primary text-white")}
                  asChild
                >
                  <Link href={`${basePath}/pages/Orders`}>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Catalogue</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(isActive("Products") && "bg-primary text-white")}
                  asChild
                >
                  <Link href={`${basePath}/pages/Products`}>
                    <Package className="h-4 w-4" />
                    <span>Products</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(isActive("Coupons") && "bg-primary text-white")}
                  asChild
                >
                  <Link href={`${basePath}/pages/Coupons`}>
                    <Tag className="h-4 w-4" />
                    <span>Coupons</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(isActive("Categories") && "bg-primary text-white")}
                  asChild
                >
                  <Link href={`${basePath}/pages/Categories`}>
                    <Layers className="h-4 w-4" />
                    <span>Categories</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(isActive("Attributes") && "bg-primary text-white")}
                  asChild
                >
                  <Link href={`${basePath}/pages/Attributes`}>
                    <ClipboardList className="h-4 w-4" />
                    <span>Attributes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(isActive("Banners") && "bg-primary text-white")}
                  asChild
                >
                  <Link href={`${basePath}/pages/Banners`}>
                    <ScrollText className="h-4 w-4" />
                    <span>Banners</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(isActive("Stock") && "bg-primary text-white")}
                  asChild
                >
                  <Link href={`${basePath}/pages/Stock`}>
                    <Database className="h-4 w-4" />
                    <span>Stock</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(isActive("Payouts") && "bg-primary text-white")}
                  asChild
                >
                  <Link href={`${basePath}/pages/Payouts`}>
                    <CircleDollarSign className="h-4 w-4" />
                    <span>Payouts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(isActive("Analytics") && "bg-primary text-white")}
                  asChild
                >
                  <Link href={`${basePath}/pages/Analytics`}>
                    <BarChart4 className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(isActive("Notifications") && "bg-primary text-white")}
                  asChild
                >
                  <Link href={`${basePath}/pages/Notifications`}>
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn(isActive("Settings") && "bg-primary text-white")}
              asChild
            >
              <Link href={`${basePath}/pages/Settings`}>
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn(isActive("Support") && "bg-primary text-white")}
              asChild
            >
              <Link href={`${basePath}/pages/Support`}>
                <HelpCircle className="h-4 w-4" />
                <span>Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-4 mt-4">
          <SidebarTrigger className="w-full flex items-center justify-center gap-2 p-2 rounded-md border border-border bg-background hover:bg-secondary transition-colors">
            <span className="text-xs font-medium">Collapse Sidebar</span>
          </SidebarTrigger>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}