"use client";

import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Index from "./pages/Index/page";
import Dashboard from "./pages/Dashboard/page";
import Salons from "./pages/Salons/page";
import Customers from "./pages/Customers/page";
import Orders from "./pages/Orders/page";
import Products from "./pages/Products/page";
import Coupons from "./pages/Coupons/page";
import Categories from "./pages/Categories/page";
import Attributes from "./pages/Attributes/page";
import Banners from "./pages/Banners/page";
import Stock from "./pages/Stock/page";
import Payouts from "./pages/Payouts/page";
import Analytics from "./pages/Analytics/page";
import Notifications from "./pages/Notifications/page";
import Settings from "./pages/Settings/page";
import Support from "./pages/Support/page";
import NotFound from "./pages/NotFound/page";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/index" element={<Index />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="salons" element={<Salons />} />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="categories" element={<Categories />} />
            <Route path="attributes" element={<Attributes />} />
            <Route path="banners" element={<Banners />} />
            <Route path="stock" element={<Stock />} />
            <Route path="payouts" element={<Payouts />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="support" element={<Support />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
