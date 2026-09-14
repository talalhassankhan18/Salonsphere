"use client";

import { useState } from "react";
import React from "react";
import BottomSlider from "./components/bottom-slider";
import GymBanner from "./components/gym-banner";
import Hero from "./components/hero";
import SalonCardList from "./components/salon-card-list";
import SeftcareCardList from "./components/selfcare-card-list";
import FakeReviewList from "./components/fake-review-list";
import Navbar from "../common/navbar"
import Footer from "@/common/footer";
import Starting from "../common/starting"
import HowItWorks from "./components/Howitworks";
import CallToAction from "./components/Calltoaction";
import Chatbot from "./Support/components/Chatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/Superadmin/dashboard/components/ui/tabs";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";


export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      <Navbar />
      {/* <div className="m-4 p-6"></div> */}
      <Hero />
      <SalonCardList />
      <SeftcareCardList />
      {/* <Starting /> */}
      <BottomSlider />
      <HowItWorks />
      <CallToAction />
      <GymBanner />
      <FakeReviewList />
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
