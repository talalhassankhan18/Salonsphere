"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/components/ui/card";
import { Input } from "@/app/Superadmin/components/ui/input";
import { Button } from "@/app/Superadmin/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/Superadmin/components/ui/accordion";
import {
  ArrowRight,
  FileText,
  HelpCircle,
  Info,
  LifeBuoy,
  MessageSquare,
  PhoneCall,
  Search,
  Send,
  UserPlus,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/Superadmin/components/ui/tabs";
import { Textarea } from "@/app/Superadmin/components/ui/textarea";

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
    description:
      "Learn the basics of managing your multi-vendor salon platform",
    icon: Info,
    category: "Basics",
  },
  {
    title: "Managing Salon Subscriptions",
    description: "How to set up and manage subscription plans",
    icon: UserPlus,
    category: "Subscriptions",
  },
  {
    title: "Processing Payouts",
    description: "Learn how to manage and schedule salon payouts",
    icon: ArrowRight,
    category: "Finances",
  },
  {
    title: "Inventory Management",
    description: "Best practices for managing product inventory",
    icon: FileText,
    category: "Products",
  },
  {
    title: "Analytics & Reporting",
    description: "How to use analytics to grow your business",
    icon: FileText,
    category: "Analytics",
  },
  {
    title: "Security Best Practices",
    description: "Keep your platform and data secure",
    icon: FileText,
    category: "Security",
  },
];

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground">Help and support center</p>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur-xl opacity-50"></div>
        <Card className="relative border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <h2 className="text-2xl font-bold mb-2">
                How can we help you today?
              </h2>
              <p className="text-muted-foreground">
                Search our knowledge base or browse the FAQ section below
              </p>
            </div>
            <div className="flex w-full max-w-lg mx-auto items-center relative">
              <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                className="pl-10 pr-16 py-6 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="absolute right-1" size="sm">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="articles">Help Articles</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about Salon Sphere.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-base font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles">
          <Card>
            <CardHeader>
              <CardTitle>Help Articles</CardTitle>
              <CardDescription>
                Browse through our comprehensive help articles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supportArticles.map((article, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <article.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{article.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {article.description}
                          </p>
                          <div className="flex items-center mt-3">
                            <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                              {article.category}
                            </span>
                            <Button
                              variant="link"
                              size="sm"
                              className="ml-auto p-0"
                            >
                              Read More
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Get in touch with our support team for assistance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Live Chat</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Chat with our support team in real-time
                    </p>
                    <Button variant="outline" className="w-full">
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                      <PhoneCall className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Phone Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Call us for immediate assistance
                    </p>
                    <Button variant="outline" className="w-full">
                      +1 (800) 123-4567
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                      <LifeBuoy className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send us a detailed message
                    </p>
                    <Button variant="outline" className="w-full">
                      support@salonsphere.com
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Send us a message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Name
                        </label>
                        <Input id="name" placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Your email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <Input id="subject" placeholder="How can we help you?" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Please describe your issue in detail..."
                        rows={5}
                      />
                    </div>
                    <Button className="w-full sm:w-auto">
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
