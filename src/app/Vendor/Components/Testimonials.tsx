const Testimonials = () => {
    return (
      <section className="py-16 bg-base-100 text-center">
        <h2 className="text-3xl font-bold text-primary">What Our Users Say</h2>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {[
            { name: "Sarah", review: "Glimmer completely changed the way I manage my salon!" },
            { name: "James", review: "Easy booking, great experience, and seamless transactions!" },
          ].map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-md shadow-lg">
              <p className="text-lg">{t.review}</p>
              <h3 className="mt-4 font-semibold text-primary">- {t.name}</h3>
            </div>
          ))}
        </div>
      </section>
    );
  };
  
  export default Testimonials;
  