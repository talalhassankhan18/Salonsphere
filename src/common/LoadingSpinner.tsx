import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-t-[#B4004E] border-gray-200 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;