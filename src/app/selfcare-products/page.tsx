"use client";
import React from "react";
// import CategoryNavMenu from "@/common/category-nav-menu";
import BestSellers from "./components/best-sellers";
import BrandProductImages from "./components/brand-product-images";
import BudgetFriendly from "./components/budget-friendly";
import Hero from "./components/hero";
import NewArrivals from "./components/new-arrivals";
import AutoSliderShopBrand from "./components/shop-brand";
import Navbar from "@/common/navbar";
import Footer from "@/common/footer";
import Allproducts from "./components/Allproducts";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <div className="m-4 p-6"></div>
      <Hero />
      <Allproducts />
      <BestSellers />
      <AutoSliderShopBrand />

      <NewArrivals />
      <BudgetFriendly />
      <BrandProductImages />
      <Footer />
    </>
  );
}
