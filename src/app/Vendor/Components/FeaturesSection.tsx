const features = [
  { title: "Appointment Scheduling", desc: "Manage appointments seamlessly." },
  { title: "Payment Processing", desc: "Securely process client payments." },
  { title: "Point of Sale (POS)", desc: "Manage salon retail operations." },
  { title: "Marketing Promotions", desc: "Grow business with marketing." },
  { title: "Product Inventory", desc: "Manage stock & sell products." },
  { title: "Reporting & Analytics", desc: "Track sales, trends & growth." },
];

const FeaturesSection = () => {
  return (
    <section className="py-10 px-6 bg-white">
      <h2 className="text-xl md:text-2xl font-bold text-center text-primary">Manage & Grow Your Business</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-gray-100 p-4 md:p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="text-gray-600 mt-2 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
