"use client"
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index/page";
import Login from "../register/page";
import Register from "../register/page";
import Dashboard from "./pages/Dashboard/page";
import Services from "./pages/Services/page";
import Products from "./pages/Products/page";
import Appointments from "./pages/Appointments/page";
import Reviews from "./pages/Reviews/page";
import Portfolio from "./pages/Portfolio/page";
import Analytics from "./pages/Analytics/page";
import Orders from "./pages/Orders/page";
import ProductOrders from "./pages/ProductOrders/page";
import Commission from "./pages/Commission/page";
import CommissionPayouts from "./pages/CommissionPayouts/page";
import Settings from "./pages/Settings/page";
import NotFound from "./pages/NotFound/page";
import SuperAdminDashboard from "./pages/SuperAdminDashboard/page";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
        
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/products" element={<Products />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/product-orders" element={<ProductOrders />} />
          <Route path="/commission" element={<Commission />} />
          <Route path="/commission-payouts" element={<CommissionPayouts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
