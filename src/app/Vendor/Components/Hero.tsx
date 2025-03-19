import Link from "next/link";

const HeroSection = () => {
  return (
    <section className=" mt-16 text-center py-20 px-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,199,89,1) 5%, rgba(255,199,89,1) 80%, rgba(255,255,255,1) 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-secondary">
          Transform Your Business with Salon Sphere
        </h1>
        <p className="mt-4 text-lg text-Secondary">
          An innovative salon and product marketplace designed to enhance customer experience and streamline operations.
        </p>
        <div className="mt-6">
          <Link href="/started">
            <button className="btn btn-secondary mr-4 transition-all duration-300 transform hover:scale-105 hover:bg-base-100 hover:text-secondary">
              Get Started
            </button>
          </Link>
          <button className="btn btn-outline btn-secondary">Learn More</button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
