"use client";

import React, { useState } from "react";
import { IoMdCall } from "react-icons/io";
import { HiMail } from "react-icons/hi";
import { FaMapMarkerAlt } from "react-icons/fa";
import ContactImage from "@/assets/images/contact-us.jpg"; // Add an image in public/assets/images/
import Navbar from "@/common/navbar";
import Footer from "@/common/footer";

export default function ContactUs() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
      setFormData({ name: "", email: "", message: "" });
      alert("Your message has been sent!");
    }
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <section className="bg-gray-50">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-10 bg-white shadow-lg overflow-hidden">

          {/* Left Image Section */}
          <div className="hidden md:block md:w-1/2">
            <img src={ContactImage.src} alt="Contact Us" className="w-full h-full object-cover" />
          </div>

          {/* Right Contact Form Section */}
          <div className="w-full md:w-1/2 px-8 py-10">
            <h2 className="pt-10 text-center text-4xl font-extrabold text-primary mb-2">Get in Touch</h2>
            
            <p className="text-gray-600 text-center mb-8">
              Have questions or need assistance? Feel free to reach out, and we’ll get back to you as soon as possible.
            </p>

            {/* Contact Details */}
            <div className="mb-6">
              <div className="flex items-center text-gray-700 mb-4">
                <FaMapMarkerAlt className="text-primary text-xl mr-3" />
                <p>123 Street, Lahore, Pakistan</p>
              </div>
              <div className="flex items-center text-gray-700 mb-4">
                <IoMdCall className="text-primary text-xl mr-3" />
                <p>+92-319-2590810</p>
              </div>
              <div className="flex items-center text-gray-700">
                <HiMail className="text-primary text-xl mr-3" />
                <p>talalhassankhan2003@gmail.com</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border rounded-lg focus:ring-primary focus:border-primary shadow-sm transition duration-300 focus:outline-none"
                  placeholder="Enter your name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border rounded-lg focus:ring-primary focus:border-primary shadow-sm transition duration-300 focus:outline-none"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border rounded-lg focus:ring-primary focus:border-primary shadow-sm transition duration-300 focus:outline-none"
                  placeholder="Enter your message"
                  rows={4}
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:bg-primary-dark shadow-md"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
