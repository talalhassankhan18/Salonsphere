"use client";

import { screenBreakpoints } from "@/hooks";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  cards: React.JSX.Element[];
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
        "w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
        shouldAnimate && hasAnimated && "animate-fade-in",
        className
      )}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          className={cn(
            "transition-all duration-300",
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
