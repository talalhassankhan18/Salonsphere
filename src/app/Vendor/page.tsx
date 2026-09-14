"use client";

import { useState } from "react";
import Navbar from "../Vendor/Components/Navbar";
import HeroSection from "../Vendor/Components/Hero";
import FeaturesSection from "../Vendor/Components/FeaturesSection";
import Testimonials from "../Vendor/Components/Testimonials";
import Pricing from "../Vendor/Components/Pricing";
import BusinessTypes from "../Vendor/Components/BusinessTypes";
import Footer from "@/common/footer";
import Chatbot from "@/app/Support/components/Chatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/Superadmin/dashboard/components/ui/tabs";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";


const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <div>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Testimonials />
      <Pricing />
      <BusinessTypes />
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
            aria-label="Open support chat"
          >
            <MessageSquare className="h-6 w-6 text-white" />
          </Button>
        )}
      </motion.div>
      <Footer />
    </div>
  );
};

export default Home;
