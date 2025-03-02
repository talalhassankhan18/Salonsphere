const businessTypes = [
    { name: "Hair Salon", label: "Hair & Styling", img: "src/assets/images/home-hero-img-1.webp" },
    { name: "Nail Salon", label: "Nail Art & Care", img: "src/assets/images/home-hero-img-1.webp" },
    { name: "Barbershop", label: "Men's Grooming", img: "src/assets/images/home-hero-img-1.webp" },
    { name: "Massage", label: "Therapeutic & Relaxation", img: "src/assets/images/home-hero-img-1.webp" },
    { name: "Tattoo & Piercing", label: "Body Art & Piercing", img: "src/assets/images/home-hero-img-1.webp" },
    { name: "Spa", label: "Wellness & Rejuvenation", img: "src/assets/images/home-hero-img-1.webp" },
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
              <img src={business.img} alt={business.name} className="w-full h-40 object-cover" />
  
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
  