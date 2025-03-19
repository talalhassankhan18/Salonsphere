"use client";

import React, { useEffect, useState } from "react";

const TimerBanner = () => {
  const [timeLeft, setTimeLeft] = useState(9060); // 16 mins

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")} : ${String(mins).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="relative bg-gradient-to-r from-primary to-accent rounded-2xl p-6 md:p-10 flex justify-between items-center text-primary-content shadow-lg overflow-hidden">
      {/* Left Box for Timer */}
      <div className="bg-primary text-primary-content px-6 py-4 rounded-lg shadow-md z-10">
        <p className="text-xs mb-2">Don’t miss out!</p>
        <p className="font-bold text-lg tracking-wide">{formatTime(timeLeft)}</p>
      </div>

      {/* Center Offer Text */}
      <div className="flex-1 text-center z-10">
        <p className="font-bold text-lg md:text-2xl">
          + 2 months free with a 12-month plan
        </p>
      </div>

      {/* Right Side Graphic */}
      <div className="absolute right-4 bottom-0 opacity-10 text-[12rem] font-extrabold z-0 leading-none">
        %
      </div>
    </div>
  );
};

export default TimerBanner;
