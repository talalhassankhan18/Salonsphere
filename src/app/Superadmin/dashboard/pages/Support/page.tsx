"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/dashboard/components/ui/card";
import { Input } from "@/app/Superadmin/dashboard/components/ui/input";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/Superadmin/dashboard/components/ui/accordion";
import {
  ArrowRight,
  FileText,
  Info,
  LifeBuoy,
  MessageSquare,
  PhoneCall,
  Search,
  Send,
  UserPlus,
  X,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/dashboard/components/ui/tabs";
import { ScrollArea } from "@/app/Superadmin/dashboard/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const faqs = [
  {
    question: "How do I add a new salon to the platform?",
    answer:
      "To add a new salon, navigate to the Salons section and click on 'Add New Salon'. Fill in all the required details including salon name, owner information, contact details, and subscription plan. Once submitted, the salon will be registered and can begin using the platform.",
  },
  {
    question: "How do subscription plans work?",
    answer:
      "Salon Sphere offers monthly and yearly subscription plans. You can assign different plans to salons based on their needs. Plans determine feature access and commission rates. Subscription management is handled in the Salons section where you can view, modify, or cancel subscriptions.",
  },
  {
    question: "How are commissions calculated?",
    answer:
      "Commissions are calculated as a percentage of product sales. By default, salons receive 5% commission on products sold through their storefront. Commission rates can be customized per salon or subscription tier in the Settings section. Payouts are processed based on the schedule set in the Payouts section.",
  },
  {
    question: "How do I process refunds?",
    answer:
      "To process a refund, navigate to the Orders section, find the specific order, and click 'View'. On the order details page, click the 'Refund' button and follow the prompts to complete the refund process. You can choose to refund the full amount or a partial amount.",
  },
  {
    question: "How do I manage inventory across multiple salons?",
    answer:
      "Inventory management is centralized in the Stock section. You can view inventory levels across all salons, set low stock alerts, and manage stock transfers. Each product page also shows its current allocation and availability status across all participating salons.",
  },
  {
    question: "How do I create promotional banners?",
    answer:
      "To create promotional banners, go to the Banners section and click 'Add New Banner'. Upload your banner image, set the target URL, scheduling, and display rules. You can create global banners that appear across the platform or salon-specific banners for targeted promotions.",
  },
];

const supportArticles = [
  {
    title: "Getting Started with Salon Sphere",
    description: "Learn the basics of managing your multi-vendor salon platform",
    details: "Start by logging into the superadmin portal. Navigate to the Dashboard to get an overview of your platform's performance. Explore sections like Salons, Orders, and Products to manage your operations effectively. Use the Support section for additional help.",
    icon: Info,
    category: "Basics",
  },
  {
    title: "Managing Salon Subscriptions",
    description: "How to set up and manage subscription plans",
    details: "In the Salons section, select a salon and click 'Edit'. Under the subscription tab, choose between monthly or yearly plans, set commission rates, and save. You can also modify or cancel subscriptions from the same section.",
    icon: UserPlus,
    category: "Subscriptions",
  },
  {
    title: "Processing Payouts",
    description: "Learn how to manage and schedule salon payouts",
    details: "Go to the Payouts section to view pending payouts. Set a schedule for automatic payouts or process them manually. Ensure commission rates are correctly configured in the Settings section before processing.",
    icon: ArrowRight,
    category: "Finances",
  },
  {
    title: "Inventory Management",
    description: "Best practices for managing product inventory",
    details: "Use the Stock section to monitor inventory levels across all salons. Set low stock alerts to avoid shortages. Manage stock transfers by selecting products and assigning them to specific salons.",
    icon: FileText,
    category: "Products",
  },
  {
    title: "Analytics & Reporting",
    description: "How to use analytics to grow your business",
    details: "In the Analytics section, view detailed reports on sales, salon performance, and customer behavior. Use filters to customize your reports and export them for further analysis.",
    icon: FileText,
    category: "Analytics",
  },
  {
    title: "Security Best Practices",
    description: "Keep your platform and data secure",
    details: "Enable two-factor authentication for all superadmin accounts. Regularly update passwords and review user permissions in the Settings section. Monitor activity logs for any suspicious behavior.",
    icon: FileText,
    category: "Security",
  },
];

interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
}

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      text: "Hi! I'm here to assist with Salon Sphere. What can I help you with today?",
      isBot: true,
    },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      fetchSuggestedQuestions();
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
    if (suggestionsRef.current && suggestedQuestions.length > 0) {
      suggestionsRef.current.scrollTop = 0;
    }
  }, [chatMessages, suggestedQuestions]);

  const fetchSuggestedQuestions = async () => {
    try {
      const response = await fetch("/api/support/suggestions");
      const data = await response.json();
      setSuggestedQuestions(data.suggestions);
    } catch (error) {
      console.error("Error fetching suggested questions:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: chatMessages.length + 1,
      text: userMessage,
      isBot: false,
    };

    setChatMessages([...chatMessages, newMessage]);
    setUserMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      const botResponse: ChatMessage = {
        id: chatMessages.length + 2,
        text: data.response,
        isBot: true,
      };

      setChatMessages((prev) => [...prev, botResponse]);
      fetchSuggestedQuestions();
    } catch (error) {
      console.error("Error getting bot response:", error);
      const errorResponse: ChatMessage = {
        id: chatMessages.length + 2,
        text: "Sorry, something went wrong. Please try again.",
        isBot: true,
      };
      setChatMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    setUserMessage(question);
    await handleSendMessage();
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailData = {
      name: formData.get("name"),
      email: formData.get("email"),
    };

    try {
      const response = await fetch("/api/support/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        toast.success("Support Information Sent! We've sent an email with FAQs and support details to your inbox.");
        e.currentTarget.reset();
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      // toast.error("Failed to send support information. Please try again.");
    }
  };

  const toggleArticleExpansion = (index: number) => {
    setExpandedArticle(expandedArticle === index ? null : index);
  };

  return (
    <div className="relative min-h-screen space-y-8 p-4 bg-base-100 text-base-content">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnHover />

      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Support Center
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Your one-stop hub for all Salon Sphere support needs
        </p>
      </div>

      {/* <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-xl opacity-60"></div>
        <Card className="relative border-none shadow-2xl bg-base-200">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center max-w-3xl mx-auto mb-6">
              <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                We're Here to Help
              </h2>
              <p className="text-muted-foreground text-lg">
                Search our knowledge base, chat with our AI assistant, or contact our support team
              </p>
            </div>
            <div className="flex w-full max-w-xl mx-auto items-center relative">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                className="pl-12 pr-20 py-3 sm:py-4 text-base sm:text-lg rounded-full border-2 border-primary/20 focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="absolute right-2 rounded-full" size="sm">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div> */}

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about Salon Sphere.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-base">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="articles">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-xl bg-base-200">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Help Articles</CardTitle>
                <CardDescription>
                  Browse through our comprehensive help articles to master Salon Sphere.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {supportArticles.map((article, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="border border-primary/10 shadow-lg hover:shadow-xl transition-shadow bg-white">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                              <article.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-800">
                                {article.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-2">
                                {article.description}
                              </p>
                              <div className="flex items-center mt-4">
                                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                                  {article.category}
                                </span>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="ml-auto p-0 text-[#800000] hover:text-[#600000]"
                                  onClick={() => toggleArticleExpansion(index)}
                                >
                                  {expandedArticle === index ? "Show Less" : "Read More"}
                                </Button>
                              </div>
                              <AnimatePresence>
                                {expandedArticle === index && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-4 text-sm text-gray-600 border-t border-primary/20 pt-4"
                                  >
                                    {article.details}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="contact">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Contact Support</CardTitle>
                <CardDescription>
                  Get in touch with our support team for assistance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <Card className="border-none">
                      <CardContent className="p-4 sm:p-6 text-center">
                        <div className="mx-auto w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center rounded-full bg-primary/10 mb-2 sm:mb-4">
                          <MessageSquare className="h-5 sm:h-7 w-5 sm:w-7 text-primary" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">
                          Chat Support
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 sm:mb-4">
                          Chat with our AI assistant for quick answers
                        </p>
                        <Button
                          variant="outline"
                          className="w-full rounded-full"
                          onClick={() => setIsChatOpen(true)}
                        >
                          Start Chat
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <Card className="border-none">
                      <CardContent className="p-4 sm:p-6 text-center">
                        <div className="mx-auto w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center rounded-full bg-primary/10 mb-2 sm:mb-4">
                          <PhoneCall className="h-5 sm:h-7 w-5 sm:w-7 text-primary" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">
                          Phone Support
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 sm:mb-4">
                          Call us for immediate assistance
                        </p>
                        <Button variant="outline" className="w-full rounded-full">
                          +92 319 2590810
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <Card className="border-none">
                      <CardContent className="p-4 sm:p-6 text-center">
                        <div className="mx-auto w-12 sm:w-14 h-12 sm:h-14 flex items-center justify-center rounded-full bg-primary/10 mb-2 sm:mb-4">
                          <LifeBuoy className="h-5 sm:h-7 w-5 sm:w-7 text-primary" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">
                          Email Support
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 sm:mb-4">
                          Receive FAQs and support info via email
                        </p>
                        <Button variant="outline" className="w-full rounded-full">
                          support@salonsphere.com
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                <Card className="border-none">
                  <CardHeader>
                    <CardTitle className="text-xl">Get Support via Email</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4 sm:space-y-6" onSubmit={handleEmailSubmit}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <label
                            htmlFor="name"
                            className="text-sm font-medium"
                          >
                            Name
                          </label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Your name"
                            className="rounded-lg"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="text-sm font-medium"
                          >
                            Email
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Your email"
                            className="rounded-lg"
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full sm:w-auto rounded-full px-4 sm:px-6 bg-primary text-primary-content hover:bg-primary/90"
                      >
                        Get Support
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-[1.5rem] right-[1rem] w-full max-w-[90vw] sm:max-w-[340px] md:max-w-[380px] z-50 min-w-[250px]"
          >
            <div className="bg-gradient-to-br from-[#B4004E] to-[#6B1A4B] rounded-2xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-3 text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Chat with SalonBot</h3>
                    <p className="text-xs flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      We reply immediately
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="h-[40vh] sm:h-[250px] md:h-[300px] p-3 bg-white/5 max-h-[400px]">
                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`mb-3 flex ${message.isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-2 text-sm ${
                        message.isBot ? "bg-white text-gray-900" : "bg-[#D5AA68] text-white"
                      }`}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/20 rounded-lg p-2 text-white text-sm">
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        Typing...
                      </motion.div>
                    </div>
                  </div>
                )}
              </ScrollArea>
              <div className="p-3 bg-white/10">
                <div className="flex items-center space-x-2">
                  <Input
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Enter your message..."
                    className="flex-1 rounded-full bg-white/20 text-white placeholder-white/60 border-none focus:ring-2 focus:ring-[#D5AA68]"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="rounded-full bg-[#D5AA68] text-white hover:bg-[#B98A4A]"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                {suggestedQuestions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-white/70 mb-2">Suggested questions:</p>
                    <ScrollArea className="h-[30vh] sm:h-[180px] md:h-[200px] pr-2 max-h-[250px]">
                      {suggestedQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start text-xs sm:text-sm text-white bg-white/10 hover:bg-white/20 mb-2 rounded-lg"
                          onClick={() => handleSuggestedQuestion(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
  );
};

export default Support;