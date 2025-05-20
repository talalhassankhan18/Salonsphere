// components/user-support/FAQSection.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/Superadmin/dashboard/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/Superadmin/dashboard/components/ui/card";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "Can I browse salons and products without an account?",
    answer:
      "Yes, as a guest user, you can browse salons, view their services, and check out products. You can also add products to your cart. However, to complete a booking or order, you’ll need to sign up for an account.",
  },
  {
    question: "How do I book a service at a salon?",
    answer:
      "Browse salons and their services, select a service, and choose a date and time slot. If the slot is available, enter your details, confirm the booking, and choose your payment method—Cash on Service or Card Payment. You’ll need to sign up if you don’t have an account.",
  },
  {
    question: "How can I purchase products on SalonSphere?",
    answer:
      "You can purchase products in two ways: 1) From the Products page by browsing the catalog, or 2) From a salon’s profile by viewing their listed products. Add the product to your cart, proceed to checkout, and choose between Cash on Delivery or Card Payment. You’ll need to sign up to complete the purchase.",
  },
  {
    question: "What payment options are available for bookings and purchases?",
    answer:
      "For bookings, you can pay via Cash on Service or Card Payment (Bank Transfer). For product purchases, you can choose Cash on Delivery or Card Payment. Select your preferred method during checkout.",
  },
  {
    question: "How do I track my orders or bookings?",
    answer:
      "After signing up and completing your order or booking, you can track them in your account. Go to 'My Orders' for product purchases or 'My Bookings' for service appointments to view their status.",
  },
  {
    question: "What happens if I don’t sign up after adding to cart or starting a booking?",
    answer:
      "You can add products to your cart or start a booking as a guest, but to finalize the order or booking, you’ll need to sign up. Your cart and booking details will be saved once you create an account.",
  },
];

const FAQSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find answers to common questions about using SalonSphere.
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
  );
};

export default FAQSection;