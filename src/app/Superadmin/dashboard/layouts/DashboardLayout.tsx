// DashboardLayout.tsx
"use client";
import { AppSidebar } from "@/app/Superadmin/dashboard/components/app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/app/Superadmin/dashboard/components/ui/sidebar";
import { ThemeToggle } from "@/app/Superadmin/dashboard/components/theme-toggle";
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import { Input } from "@/app/Superadmin/dashboard/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/Superadmin/dashboard/components/ui/avatar";
import { useState, useEffect, ReactNode } from "react";
import { useIsMobile } from "@/app/Superadmin/dashboard/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/app/Superadmin/dashboard/components/ui/sheet";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface DashboardLayoutProps {
  children?: ReactNode;
  title?: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const [mounted, setMounted] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && <AppSidebar />}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="w-full h-16 border-b flex items-center justify-between px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-2">
              {isMobile && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64">
                    <AppSidebar />
                  </SheetContent>
                </Sheet>
              )}
              {/* <div
                className={cn(
                  "relative transition-all duration-300 ease-in-out",
                  isSearchFocused ? "w-full max-w-xl" : "w-full max-w-xs"
                )}
              >
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Search anything..."
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </div> */}
              {title && <h1 className="text-xl font-semibold ml-4">{title}</h1>}
            </div>
            <div className="flex items-center gap-2">
              {/* <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button> */}
              {/* <ThemeToggle /> */}
              {/* Logo */}
              <div className="flex justify-center">
                <Image
                  src="/assets/images/logo.png"
                  alt="Salon Logo"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </div>
              {/* <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg" alt="Avatar" />
                <AvatarFallback>
                </AvatarFallback>
              </Avatar> */}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out">
            <div className="container py-6 animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;