// components/user-support/ContactSupportSection.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/Superadmin/dashboard/components/ui/card";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import { Input } from "@/app/Superadmin/dashboard/components/ui/input";
import { motion } from "framer-motion";
import { MessageSquare, PhoneCall, LifeBuoy } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ContactSupportSectionProps {
  setIsChatOpen: (isOpen: boolean) => void;
}

const ContactSupportSection = ({ setIsChatOpen }: ContactSupportSectionProps) => {
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailData = {
      name: formData.get("name"),
      email: formData.get("email"),
    };

    try {
      const response = await fetch("/api/user/support/email", {
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
    } 
    catch (error) {
    //   toast.error("Failed to send support information. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnHover />
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
                    <label htmlFor="name" className="text-sm font-medium">
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
                    <label htmlFor="email" className="text-sm font-medium">
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
  );
};

export default ContactSupportSection;