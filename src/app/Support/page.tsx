// pages/user/support/page.tsx
"use client";

import { useState } from "react";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/Superadmin/dashboard/components/ui/tabs";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import FAQSection from "./components/FAQSection";
import HelpArticlesSection from "./components/HelpArticlesSection";
import ContactSupportSection from "./components/ContactSupportSection";
import Chatbot from "./components/Chatbot";
import Navbar from "@/common/navbar";

const Support = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    
    const handleLogout = () => {
      setIsLoggedIn(false);
    };

  return (
    <>
    <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
    <div className="m-4 p-6"></div>
    <div className="relative min-h-screen space-y-8 p-4 bg-base-100 text-base-content">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Customer Support Center
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Your one-stop hub for all SalonSphere support needs
        </p>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="mb-6 w-full justify-start gap-2 sm:gap-4 bg-transparent flex-wrap">
          <TabsTrigger
            value="faq"
            className="text-base sm:text-lg font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-content rounded-full px-3 sm:px-6 py-1 sm:py-2"
          >
            FAQ
          </TabsTrigger>
          <TabsTrigger
            value="articles"
            className="text-base sm:text-lg font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-content rounded-full px-3 sm:px-6 py-1 sm:py-2"
          >
            Help Articles
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="text-base sm:text-lg font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-content rounded-full px-3 sm:px-6 py-1 sm:py-2"
          >
            Contact Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <FAQSection />
        </TabsContent>

        <TabsContent value="articles">
          <HelpArticlesSection />
        </TabsContent>

        <TabsContent value="contact">
          <ContactSupportSection setIsChatOpen={setIsChatOpen} />
        </TabsContent>
      </Tabs>

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
    </div>
    </>
  );
};

export default Support;