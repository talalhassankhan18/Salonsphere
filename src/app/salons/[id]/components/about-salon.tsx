// components/about-salon.tsx
import React from "react";
import Image from "next/image";

interface SalonDetails {
  salonName: string;
  address: string;
  salonType: "female" | "male" | "unisex";
  avatar?: string;
  email: string;
  name: string;
  phone: string;
}

interface AboutSalonProps {
  salon: SalonDetails | null;
}

const AboutSalon: React.FC<AboutSalonProps> = ({ salon }) => {
  if (!salon) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-red-600">Salon not found or not verified.</p>
      </div>
    );
  }

  // Ensure a fallback image if avatar is not provided
  const avatarSrc = salon.avatar || "/default-salon-image.jpg";

  return (
    <div className="container mx-auto py-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        About {salon.salonName}
      </h2>
      <div className="bg-white rounded-xl shadow-md p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="md:mr-6 mb-4 md:mb-0">
          <Image
            src={avatarSrc}
            alt={salon.salonName}
            width={128}
            height={128}
            className="w-32 h-32 rounded-full object-cover shadow-md"
            unoptimized // Use if images are external and you don't want optimization
          />
        </div>
        <div className="text-center md:text-left space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">
            {salon.salonName}
          </h3>
          <p className="text-gray-600">{salon.address}</p>
          <p className="text-gray-600 capitalize">{salon.salonType} Salon</p>
          <p className="text-gray-600">Owner: {salon.name}</p>
          <p className="text-gray-600">Email: {salon.email}</p>
          <p className="text-gray-600">Phone: {salon.phone}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutSalon;
