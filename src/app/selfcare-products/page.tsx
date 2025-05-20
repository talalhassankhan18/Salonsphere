"use client";
import React from "react";
import { useState } from "react";
// import CategoryNavMenu from "@/common/category-nav-menu";
import BestSellers from "./components/best-sellers";
import BrandProductImages from "./components/brand-product-images";
import BudgetFriendly from "./components/budget-friendly";
import Hero from "./components/hero";
import NewArrivals from "./components/new-arrivals";
import AutoSliderShopBrand from "./components/shop-brand";
import Navbar from "@/common/navbar";
import Footer from "@/common/footer";
import Allproducts from "./components/Allproducts";
import Chatbot from "../Support/components/Chatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/Superadmin/dashboard/components/ui/tabs";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";


export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  

  return (
    <>
      <Navbar />
      <div className="m-4 p-6"></div>
      <Hero />
      <Allproducts />
      <BestSellers />
      <AutoSliderShopBrand />

      <NewArrivals />
      <BudgetFriendly />
      <BrandProductImages />
      <Chatbot isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />

      <motion.div
        className="fixed bottom-6 right-6 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {!isChatOpen && (
          <Button
            className="rounded-full w-12 h-12 bg-gradient-to-br from-[#B4004E] to-[#6B1A4B] shadow-lg"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageSquare className="h-6 w-6 text-white" />
          </Button>
        )}
      </motion.div>
      <Footer />
    </>
  );
}
