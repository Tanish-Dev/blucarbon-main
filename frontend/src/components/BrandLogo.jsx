import React from 'react';

const BrandLogo = ({ className = "text-slate-900" }) => {
  return (
    <div className={`text-xl font-bold tracking-tight relative ${className}`}>
      BluCarbon
      <span className="absolute left-[3%] bottom-[-4px] w-[30%] h-[3.8px] bg-[#00e07a]"></span>
    </div>
  );
};

export default BrandLogo;