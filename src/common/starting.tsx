'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const Starting = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative overflow-hidden pt-24 md:pt-28 pb-16 md:pb-20">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-soft/50 via-background to-background" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-soft rounded-full blur-3xl opacity-50 -translate-y-1/2" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-gold-light rounded-full blur-3xl opacity-40 -translate-y-1/3" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">
          <div className="flex flex-col space-y-6 max-w-xl">
            <div className={cn(
              "opacity-0",
              isLoaded && "animate-fadeIn"
            )}>
              <span className="inline-block py-1 px-3 text-xs font-medium bg-accent text-glimmer-800 rounded-full mb-4">
                Discover Beauty & Wellness
              </span>
            </div>
            
            <h1 className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-display font-medium text-glimmer-900 dark:text-white leading-tight opacity-0",
              isLoaded && "animate-slideUp"
            )}>
              Your Beauty Journey <span className="text-accent-foreground">Starts Here</span>
            </h1>
            
            <p className={cn(
              "text-lg md:text-xl text-muted-foreground mt-4 opacity-0 animation-delay-300",
              isLoaded && "animate-slideUp"
            )}>
              Discover and book premium salon services, explore beauty products, and connect with top stylists—all in one place.
            </p>
            
            <div className={cn(
              "flex flex-col sm:flex-row gap-4 pt-4 opacity-0 animation-delay-600",
              isLoaded && "animate-slideUp"
            )}>
              <button className="min-w-[160px] rounded-full">
                <Link href="/salons">Find Salons</Link>
              </button>
              <button className="min-w-[160px] rounded-full">
                <Link href="/selfcare-products">Shop Products</Link>
              </button>
            </div>
            
            <div className={cn(
              "flex items-center space-x-6 pt-2 opacity-0 animation-delay-900",
              isLoaded && "animate-slideUp"
            )}>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-background bg-accent flex items-center justify-center text-xs font-medium text-glimmer-800"
                    aria-hidden="true"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Join <span className="font-medium text-foreground">500+</span> happy clients
              </div>
            </div>
          </div>
          
          <div className={cn(
            "relative opacity-0",
            isLoaded && "animate-slideInRight"
          )}>
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/5] w-full max-w-[500px] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-soft/80 to-accent/20 mix-blend-overlay z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Salon stylists working" 
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -left-8 top-1/4 p-3 glass-card dark:glass-card-dark rounded-xl shadow-lg animate-float">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground text-sm font-medium">+8%</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bookings</p>
                  <p className="text-sm font-medium">This Week</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-4 bottom-1/4 p-3 glass-card dark:glass-card-dark rounded-xl shadow-lg animation-delay-300 animate-float">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gold-light rounded-full flex items-center justify-center">
                  <span className="text-glimmer-800 text-sm font-medium">156</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">New</p>
                  <p className="text-sm font-medium">Products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Starting;
