"use client";

import React, { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import Navbar from "@/common/navbar";
import Footer from "@/common/footer";
import Chatbot from "@/app/Support/components/Chatbot";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import { MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ContactUs() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImage] = useState(() => {
    const images = [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
    ];
    return images[Math.floor(Math.random() * images.length)];
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = { name: "", email: "", message: "" };
    if (!formData.name) newErrors.name = "Name is required!";
    if (!formData.email) newErrors.email = "Email is required!";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format!";
    if (!formData.message) newErrors.message = "Message cannot be empty!";

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/Contactus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to send email");
      }

      toast.success("Your message has been sent successfully.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <section className="py-16">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12 px-4 lg:px-8">
          {/* Left Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block lg:w-1/2 overflow-hidden rounded-2xl"
          >
            <motion.img
              src={currentImage}
              alt="Contact Us"
              className="w-full h-[800px] object-cover rounded-2xl shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Right Contact Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 bg-base-100 p-8 rounded-2xl shadow-2xl"
          >
            <h2 className="text-4xl font-bold text-base-content mb-4 text-center">Let’s Connect</h2>
            <p className="text-neutral text-center mb-8">
              We’re here to help! Drop us a message, and we’ll respond promptly.
            </p>

            {/* WhatsApp Button */}
            <div className="flex justify-center mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-success text-success-content font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-success/90 transition-all duration-300"
                onClick={() => {
                  window.open(
                    "https://wa.me/923192590810?text=Hi! I'm interested in placing a bulk order with SalonSphere.",
                    "_blank"
                  );
                  toast.success("Opening WhatsApp!", {
                    position: "bottom-right",
                    autoClose: 2000,
                  });
                }}
              >
                <FaWhatsapp className="text-xl" />
                Contact via WhatsApp
              </motion.button>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-base-content font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all duration-300 bg-base-200 text-base-content placeholder-neutral"
                  placeholder="Enter your name"
                />
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-error text-sm mt-1"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="block text-base-content font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all duration-300 bg-base-200 text-base-content placeholder-neutral"
                  placeholder="Enter your email"
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-error text-sm mt-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="block text-base-content font-medium mb-1">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all duration-300 bg-base-200 text-base-content placeholder-neutral"
                  placeholder="Enter your message"
                  rows={4}
                />
                <AnimatePresence>
                  {errors.message && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-error text-sm mt-1"
                    >
                      {errors.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-primary text-primary-content py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"
                }`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>

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

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Footer />
    </div>
  );
}