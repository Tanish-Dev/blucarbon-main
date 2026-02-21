import React from 'react';

const BrandLogoBig = ({ className = "text-slate-900" }) => {
  return (
    <div className={`text-3xl font-bold tracking-tight relative mb-4 pt-4 ${className}`}>
      BluCarbon
      <span className="absolute left-[3%] bottom-[-6px] w-[40%] h-[5px] bg-[#00e07a]"></span>
    </div>
  );
};

export default BrandLogoBig;