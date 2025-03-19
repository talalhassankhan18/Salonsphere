'use client';
// components/CallToAction.tsx
import Link from "next/link";

const CallToAction = () => {
    return (
        <section className="relative h-96 flex items-center justify-center text-center bg-base-100 py-16 text-base-content my-16">

            {/* Content */}
            <div className="relative z-10">
                <h2 className="text-3xl font-extrabold text-primary">Ready to Transform Your Beauty Experience?</h2>
                <p className="mt-2 text-lg">
                    Join SalonSphere today and discover a new way to enhance your beauty and wellness journey.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <button className="bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-primary/90">
                        <Link href="/Vendor" >
                            Join Now
                        </Link>
                    </button>
                    <button className="bg-accent text-accent-content px-6 py-3 rounded-full shadow-lg hover:bg-accent/90">
                        <Link href="/salons" >
                            Explore Salons →
                        </Link>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CallToAction;
