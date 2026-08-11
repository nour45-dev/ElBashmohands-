import React from 'react';

export const ElmLogo = ({ variant = 'horizontal', className = '' }) => {
  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-12 h-12 drop-shadow-[0_4px_10px_rgba(212,160,23,0.2)]">
      {/* Open Book (Golden Background) */}
      <path d="M15,70 Q35,62 50,70 Q65,62 85,70 L85,73 Q65,65 50,73 Q35,65 15,73 Z" fill="#D4A017" />
      <path d="M50,70 L50,73" stroke="#0D1B2A" stroke-width="1" />
      
      {/* Arabic Calligraphy word "عِلم" style */}
      <text x="50" y="58" font-family="'Cairo', 'Tajawal', sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" text-anchor="middle">عِلم</text>
      
      {/* Graduation Cap on top of Lam */}
      <polygon points="50,12 68,18 50,24 32,18" fill="#D4A017" />
      <polygon points="50,14 65,18 50,22 35,18" fill="#0D1B2A" />
      <path d="M46,20 L46,25 Q50,28 54,25 L54,20 Z" fill="#D4A017" />
      {/* Tassel */}
      <path d="M63,18 L66,30 Q65,33 63,33 Q61,33 60,30 Z" fill="#D4A017" />
    </svg>
  );

  if (variant === 'icon-only') {
    return icon;
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {icon}
        <div className="flex items-center gap-2 mt-1">
          <div className="w-6 h-[1px] bg-[#D4A017]/50"></div>
          <span className="text-xs font-black tracking-widest text-[#F5E8C7] uppercase">ينتفع به</span>
          <div className="w-6 h-[1px] bg-[#D4A017]/50"></div>
        </div>
      </div>
    );
  }

  // Horizontal variant (Default)
  return (
    <div className={`flex items-center gap-3 select-none text-right ${className}`}>
      {icon}
      <div className="flex flex-col justify-center">
        <span className="text-lg font-black text-white leading-none">منصة عِلم</span>
        <span className="text-[10px] font-bold text-[#D4A017] tracking-widest mt-0.5">يَنتَفِعُ بِهِ</span>
      </div>
    </div>
  );
};
