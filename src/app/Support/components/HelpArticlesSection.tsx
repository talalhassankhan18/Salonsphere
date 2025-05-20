// components/user-support/HelpArticlesSection.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/Superadmin/dashboard/components/ui/card";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Info, ShoppingCart, Calendar } from "lucide-react";
import { useState } from "react";

const supportArticles = [
  {
    title: "Getting Started on SalonSphere",
    description: "Learn how to browse and use SalonSphere as a guest or registered user",
    details: "Browse salons, services, and products as a guest. Add items to your cart or start a booking. Sign up to complete your order or booking and manage them in your account.",
    icon: Info,
    category: "Basics",
  },
  {
    title: "Booking a Salon Service",
    description: "Step-by-step guide to book a service",
    details: "Select a salon, choose a service, pick an available date and time slot, enter your details, and confirm. Choose between Cash on Service or Card Payment. Sign up if you’re a guest to finalize the booking.",
    icon: Calendar,
    category: "Bookings",
  },
  {
    title: "Purchasing Products",
    description: "How to buy products on SalonSphere",
    details: "Browse products on the Products page or through a salon’s profile. Add to cart, proceed to checkout, and select Cash on Delivery or Card Payment. Sign up to complete your purchase.",
    icon: ShoppingCart,
    category: "Purchases",
  },
  {
    title: "Managing Your Orders and Bookings",
    description: "Track and manage your purchases and appointments",
    details: "After signing up, go to 'My Orders' to track product purchases or 'My Bookings' to view your appointments. You can cancel or reschedule bookings if the salon allows.",
    icon: FileText,
    category: "Account",
  },
];

const HelpArticlesSection = () => {
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  const toggleArticleExpansion = (index: number) => {
    setExpandedArticle(expandedArticle === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none shadow-xl bg-base-200">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Help Articles</CardTitle>
          <CardDescription>
            Browse guides to make the most of SalonSphere.
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
  );
};

export default HelpArticlesSection;