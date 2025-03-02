import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="bg-base-100 text-center py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          Transform Your Business with Salon Sphere
        </h1>
        <p className="mt-4 text-lg text-Secondary">
          An innovative salon and product marketplace designed to enhance customer experience and streamline operations.
        </p>
        <div className="mt-6">
          <Link href="/started">
            <button className="btn btn-primary mr-4">Get Started</button>
          </Link>
          <button className="btn btn-outline btn-secondary">Learn More</button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
