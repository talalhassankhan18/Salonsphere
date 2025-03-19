"use client";
import React from "react";
import BottomSlider from "./components/bottom-slider";
import GymBanner from "./components/gym-banner";
import Hero from "./components/hero";
import SalonCardList from "./components/salon-card-list";
import SeftcareCardList from "./components/selfcare-card-list";
import FakeReviewList from "./components/fake-review-list";
import Navbar from "../common/navbar"
import Footer from "@/common/footer";
import Starting from "../common/starting"
import HowItWorks from "./components/Howitworks";
import CallToAction from "./components/Calltoaction";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      {/* <div className="m-4 p-6"></div> */}
      <Hero />
      <SalonCardList />
      <SeftcareCardList />
      {/* <Starting /> */}
      <BottomSlider />
      <HowItWorks />
      <CallToAction />
      <GymBanner />
      <FakeReviewList />
      <Footer />
    </>
  );
}
