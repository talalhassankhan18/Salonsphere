"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  cards: JSX.Element[];
  shouldAnimate?: boolean;
  className?: string;
};

const CardListWrapper = ({
  cards,
  shouldAnimate = false,
  className,
}: Props) => {
  const containerRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.8 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [hasAnimated, shouldAnimate]);

  return (
    <div
      ref={containerRef}
      className={cn(
        // Base styles for all screens
        "w-full flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory",
        // Responsive spacing: larger gap on larger screens
        "sm:space-x-8",
        // Hide scrollbar
        "scrollbar-hide",
        shouldAnimate && hasAnimated && "animate-fade-in",
        className
      )}
      style={{
        // Ensure smooth scrolling
        scrollBehavior: "smooth",
        // Hide scrollbar for different browsers
        WebkitOverflowScrolling: "touch",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          className={cn(
            // Responsive card width: 80% on mobile, fixed 256px on larger screens
            "flex-none w-[80vw] max-w-[280px] transition-all duration-300 snap-start",
            "sm:w-64",
            shouldAnimate && hasAnimated && "animate-slide-in"
          )}
          style={{
            animationDelay: shouldAnimate ? `${index * 0.1}s` : "0s",
          }}
        >
          {card}
        </div>
      ))}
    </div>
  );
};

export default CardListWrapper;