import HairSalonImg from "@/assets/services/hair salon.jpg";
import BarbershopImg from "@/assets/services/Barbershop.jpg";
import MassageImg from "@/assets/services/Massage.jpg";
import NailSalonImg from "@/assets/services/nail salon.jpg";
import SpaImg from "@/assets/services/Spa.jpg";
import TattooPiercingImg from "@/assets/services/Tattoo & Piercing.jpg";

const businessTypes = [
  { name: "Hair Salon", label: "Hair & Styling", img: HairSalonImg },
  { name: "Nail Salon", label: "Nail Art & Care", img: NailSalonImg },
  { name: "Barbershop", label: "Men's Grooming", img: BarbershopImg },
  { name: "Massage", label: "Therapeutic & Relaxation", img: MassageImg },
  { name: "Tattoo & Piercing", label: "Body Art & Piercing", img: TattooPiercingImg },
  { name: "Spa", label: "Wellness & Rejuvenation", img: SpaImg },
];

const BusinessTypes = () => {
  return (
    <section className="py-14 px-6 bg-base-100">
      {/* Title */}
      <h2 className="text-center text-2xl md:text-3xl font-bold text-primary">
        Pick a Business Type
      </h2>

      {/* Business Type Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-10 max-w-5xl mx-auto">
        {businessTypes.map((business, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-primary"
          >
            {/* Image */}
            <img src={business.img.src} alt={business.name} className="w-full h-40 object-cover" />

            {/* Content */}
            <div className="p-4 text-center">
              <h3 className="text-lg md:text-xl font-semibold text-neutral">{business.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{business.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BusinessTypes;
