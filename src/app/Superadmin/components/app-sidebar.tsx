"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/app/Superadmin/components/ui/sidebar";
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
  Percent,
  ScrollText,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { cn } from "@/app/Superadmin/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  // Extract the last segment of the pathname for comparison
  const pathSegment = pathname.split("/").pop() || "dashboard";

  const isActive = (path: string) => {
    return pathSegment === path;
  };

  // Base path for links, assuming the app runs under /Superadmin
  const basePath = "/Superadmin";

  return (
    <Sidebar>
      <SidebarHeader className="py-6 flex justify-center items-center border-b">
        <Link
          href={`${basePath}/dashboard`}
          className="flex items-center gap-2"
        >
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center glass-card">
            <Store className="h-5 w-5 text-white dark:text-slate-900" />
          </div>
          <span className="font-semibold text-lg">SalonSphere</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={cn(
                    isActive("dashboard") && "bg-primary text-white"
                  )}
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
                  className={cn(isActive("salons") && "bg-primary text-white")}
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
                  className={cn(
                    isActive("customers") && "bg-primary text-white"
                  )}
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
                  className={cn(isActive("orders") && "bg-primary text-white")}
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
                  className={cn(
                    isActive("products") && "bg-primary text-white"
                  )}
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
                  className={cn(isActive("coupons") && "bg-primary text-white")}
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
                  className={cn(
                    isActive("categories") && "bg-primary text-white"
                  )}
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
                  className={cn(
                    isActive("attributes") && "bg-primary text-white"
                  )}
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
                  className={cn(isActive("banners") && "bg-primary text-white")}
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
                  className={cn(isActive("stock") && "bg-primary text-white")}
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
                  className={cn(isActive("payouts") && "bg-primary text-white")}
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
                  className={cn(
                    isActive("analytics") && "bg-primary text-white"
                  )}
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
                  className={cn(
                    isActive("notifications") && "bg-primary text-white"
                  )}
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
              className={cn(isActive("settings") && "bg-primary text-white")}
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
              className={cn(isActive("support") && "bg-primary text-white")}
              asChild
            >
              <Link href={`${basePath}/pages/Support`}>
                <HelpCircle className="h-4 w-4" />
                <span>Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-4 mt-4">
          <SidebarTrigger className="w-full flex items-center justify-center gap-2 p-2 rounded-md border border-border bg-background hover:bg-secondary transition-colors">
            <span className="text-xs font-medium">Toggle Sidebar</span>
          </SidebarTrigger>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
