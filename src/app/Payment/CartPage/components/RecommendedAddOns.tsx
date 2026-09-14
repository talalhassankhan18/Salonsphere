'use client';

import { ShieldCheck, Lock, Search } from 'lucide-react';

function generateCircularPattern(maxRows = 25) {
  const rows = [];
  for (let i = 0; i <= maxRows; i++) {
    const numCount = i * 2 + 1;
    const padding = maxRows - i;
    // Deterministic so the server and client render the same pattern (hydration).
    const numbers = Array.from({ length: numCount }, (_, j) => (i * 7 + j * 3) % 10).join(" ");
    const paddedRow = " ".repeat(padding * 2) + numbers;
    rows.push(paddedRow);
  }

  const mirroredRows = rows.slice(0, -1).reverse();
  return [...rows, ...mirroredRows].join("\n");
}

export default function RecommendedAddOn() {
  const pattern = generateCircularPattern(40); // Smaller pattern for performance on mobile

  return (
    <div className="relative flex flex-col md:flex-row bg-[rgba(213,170,104,0.1)] border border-[#D5AA68] rounded-2xl p-6 shadow-md overflow-hidden">

      {/* ==================== PATTERN & CIRCLES FOR MOBILE BACKGROUND ==================== */}
      <div className="absolute inset-0 md:hidden z-0 flex justify-center items-center pointer-events-none">
        <div className="relative w-[300px] h-[300px] rounded-full overflow-hidden opacity-10">
          
          {/* Radial background */}
          <div className="absolute w-full h-full bg-gradient-radial from-transparent via-[rgba(213,170,104,0.08)] to-transparent"></div>
          
          {/* Pattern inside circle */}
          <div className="relative text-[#D5AA68] text-[10px] leading-3 tracking-wider whitespace-pre font-mono p-4">
            {pattern}
          </div>
        </div>
      </div>

      {/* ==================== LEFT CONTENT ==================== */}
      <div className="relative z-10 flex-1 space-y-4">
        <div className="bg-[#D5AA68] text-[#1A1A1A] text-xs font-semibold uppercase inline-block px-3 py-1 rounded-md shadow-sm">
          Recommended for you
        </div>
        <h2 className="text-2xl font-bold text-[#1A1A1A]">
          Protect your salonSphere account with advanced monitoring
        </h2>
        <ul className="mt-4 space-y-2 text-[#1A1A1A]">
          <li className="flex items-start space-x-2">
            <span className="text-green-600">✔</span>
            <p>Get alerts if your data appears on dark web</p>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-600">✔</span>
            <p>Secure your account with expert advice</p>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-600">✔</span>
            <p>Enjoy 24/7 peace of mind</p>
          </li>
        </ul>

        <div className="mt-6 text-[#1A1A1A]">
          <p className="text-2xl font-bold">Rs.499.00/month</p>
          <button className="mt-4 px-6 py-2 border border-[#D5AA68] text-[#D5AA68] rounded-lg hover:bg-[#D5AA68] hover:text-[#1A1A1A] transition">
            Get it now
          </button>
          <p className="mt-2 text-sm text-[#4A4A4A]">
            Plan renews at Rs.499.00/mo. Cancel anytime.
          </p>
        </div>
      </div>

      {/* ==================== GRAPHICS RIGHT SIDE FOR DESKTOP ==================== */}
      <div className="relative flex-1 hidden md:flex justify-center items-center mt-10 md:mt-0">
        
        {/* Background Pattern in Circular Shape */}
        <div className="absolute inset-0 z-5 flex justify-end items-end pr-300 pb-200">
          <div className="relative w-[320px] h-[320px] rounded-full overflow-hidden flex justify-center items-center">
            
            {/* Radial gradient behind pattern */}
            <div className="absolute w-full h-full bg-gradient-radial from-transparent via-[rgba(213,170,104,0.08)] to-transparent"></div>

            {/* Circular number pattern text */}
            <div className="relative text-[#D5AA68] opacity-40 text-[14px] leading-4 tracking-widest whitespace-pre font-mono p-8">
              {pattern}
            </div>
          </div>
        </div>

        {/* Circle graphic wrapper */}
        <div className="relative z-10 w-[300px] h-[300px] overflow-hidden flex justify-end items-end pr-16 pb-16">
          
          <div className="relative w-[120px] h-[120px] flex justify-center items-center">
            
            {/* Layered concentric circles */}
            <div className="absolute w-[300px] h-[300px] rounded-full border-2 border-[#D5AA68] opacity-20"></div>
            <div className="absolute w-[240px] h-[240px] rounded-full border-2 border-[#D5AA68] opacity-30"></div>
            <div className="absolute w-[180px] h-[180px] rounded-full border-2 border-[#D5AA68] opacity-40"></div>
            <div className="absolute w-[120px] h-[120px] rounded-full border-2 border-[#D5AA68] opacity-50"></div>
            <div className="absolute w-[80px] h-[80px] rounded-full border-2 border-[#D5AA68] opacity-60"></div>

            {/* Center Search icon */}
            <div className="relative z-20 w-10 h-10 bg-[#D5AA68] flex justify-center items-center rounded-full shadow">
              <Search className="text-[#1A1A1A] w-5 h-5" />
            </div>

            {/* Connecting lines */}
            <div className="absolute top-8 w-0.5 h-12 bg-[#D5AA68] left-1/2 -translate-x-1/2"></div>
            <div className="absolute bottom-8 w-0.5 h-12 bg-[#D5AA68] left-1/2 -translate-x-1/2"></div>

            {/* Shield icon repositioned */}
            <div className="absolute top-[-20px] left-[60px] w-12 h-12 bg-white rounded-xl flex justify-center items-center shadow z-20">
              <ShieldCheck className="text-[#B4004E] w-6 h-6" />
            </div>

            {/* Lock icon repositioned */}
            <div className="absolute bottom-[-20px] right-[60px] w-12 h-12 bg-white rounded-xl flex justify-center items-center shadow z-20">
              <Lock className="text-[#B4004E] w-6 h-6" />
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
