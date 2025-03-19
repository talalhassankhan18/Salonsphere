"use client";

import React from "react";

const Footer = () => {
  return (
    <footer className="bg-neutral text-neutral-content py-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 ">
        <p className="text-sm">&copy; {new Date().getFullYear()} SalonSphere. All rights reserved.</p>
        <div className="flex space-x-6 text-sm">
          <a href="#" className="hover:text-accent">Privacy Policy</a>
          <a href="#" className="hover:text-accent">Terms of Service</a>
          <a href="#" className="hover:text-accent">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
