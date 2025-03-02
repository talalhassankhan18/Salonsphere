import Navbar from "../Vendor/Components/Navbar";
import HeroSection from "../Vendor/Components/Hero";
import FeaturesSection from "../Vendor/Components/FeaturesSection";
import Testimonials from "../Vendor/Components/Testimonials";
import Pricing from "../Vendor/Components/Pricing";
import BusinessTypes from "../Vendor/Components/BusinessTypes";
import Footer from "@/common/footer";


const Home = () => {
  return (
    <div>
      <Navbar />
      <div className="m-4 p-6"></div>
      <HeroSection />
      <FeaturesSection />
      <Testimonials />
      <Pricing />
      <BusinessTypes />
      <Footer />
    </div>
  );
};

export default Home;
