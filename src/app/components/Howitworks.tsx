'use client';
// components/HowItWorks.tsx
import Image from "next/image";
import DiscoverImage from "@/assets/services/Spa.jpg";
import BookingImage from "@/assets/services/hair salon.jpg";
import ReviewImage from "@/assets/services/nail salon.jpg";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Discover",
      description:
        "Browse through our curated selection of salons and beauty products. Filter by location, services, or ratings.",
      image: DiscoverImage,
      alt: "Browsing salon services",
    },
    {
      id: 2,
      title: "Book & Shop",
      description:
        "Schedule your appointment or purchase products with our secure and simple booking system.",
      image: BookingImage,
      alt: "Booking appointment",
    },
    {
      id: 3,
      title: "Enjoy & Review",
      description:
        "Experience your service or product, then share your feedback to help our community.",
      image: ReviewImage,
      alt: "Reviewing products",
    },
  ];

  return (
    <section className="bg-base-200 py-16 text-base-content">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-secondary">How SalonSphere Works</h2>
        <p className="text-base-content mt-2">
          Our platform makes it easy to discover, book, and enjoy premium beauty services.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-8">
        {steps.map((step) => (
          <div
            key={step.id}
            className="bg-white shadow-lg rounded-2xl p-6 w-80 text-center border border-base-300"
          >
            <div className="text-primary text-lg font-bold">{step.id}</div>
            <h3 className="text-xl font-semibold mt-2">{step.title}</h3>
            <p className="text-neutral mt-3">{step.description}</p>
            <div className="mt-4">
              <Image
                src={step.image}
                alt={step.alt}
                width={200}
                height={120}
                className="rounded-lg mx-auto"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
