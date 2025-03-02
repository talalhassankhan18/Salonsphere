"use client";
import React from "react";
import Navbar from "@/common/navbar";
import Hero from "./components/hero";
import Saloons from "./components/salons";
import RecommendedSaloons from "./components/recommended-salons";
import NewSaloons from "./components/new-salons";
import TrendingSaloons from "./components/trending-saloons";
import QrCodeSection from "./components/qr-code-section-img";
import BrowseByAreaList from "./components/browse-by-area-list";
import GlimmerAchieves from "./components/glimmer-achieves";
import GlimmerForBusiness from "./components/glimmer-for-business";
import Footer from "@/common/footer";

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <div className="m-4 p-6"></div>
      <Hero />
      <Saloons />
      <RecommendedSaloons />
      <NewSaloons />
      <TrendingSaloons />
      <QrCodeSection />
      <GlimmerAchieves />
      <GlimmerForBusiness />
      <BrowseByAreaList />
      <Footer />
    </>
  );
}
