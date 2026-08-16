import React from 'react';

// 3D Isometric Cube SVG
export const Cube3D = ({ className = '', size = 48, color = 'gold' }) => {
  const colors = {
    gold: { top: '#e5b839', left: '#D4A017', right: '#b45309' },
    blue: { top: '#60a5fa', left: '#2563eb', right: '#1d4ed8' },
    emerald: { top: '#34d399', left: '#10b981', right: '#047857' },
    purple: { top: '#a78bfa', left: '#8b5cf6', right: '#6d28d9' }
  };
  const c = colors[color] || colors.gold;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`shape-3d-cube select-none ${className}`}>
      {/* Top Face */}
      <polygon points="50,15 90,35 50,55 10,35" fill={c.top} opacity="0.95" />
      {/* Left Face */}
      <polygon points="10,35 50,55 50,95 10,75" fill={c.left} opacity="0.9" />
      {/* Right Face */}
      <polygon points="50,55 90,35 90,75 50,95" fill={c.right} opacity="1" />
      {/* Subtle Highlights */}
      <polyline points="50,15 50,55 90,35" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
      <line x1="50" y1="55" x2="10" y2="35" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    </svg>
  );
};

// 3D Cylinder SVG
export const Cylinder3D = ({ className = '', size = 42, color = 'emerald' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 100" className={`select-none ${className}`}>
      <defs>
        <linearGradient id="cylGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      {/* Body */}
      <path d="M10,25 L10,75 C10,88 70,88 70,75 L70,25 Z" fill="url(#cylGrad)" />
      {/* Top Ellipse */}
      <ellipse cx="40" cy="25" rx="30" ry="12" fill="#6ee7b7" />
      <ellipse cx="40" cy="25" rx="28" ry="10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    </svg>
  );
};

// 3D Cone / Pyramid SVG
export const Cone3D = ({ className = '', size = 44 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 80 100" className={`select-none ${className}`}>
      <defs>
        <linearGradient id="coneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e5b839" />
          <stop offset="60%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      <path d="M40,10 L70,80 C70,90 10,90 10,80 Z" fill="url(#coneGrad)" />
      <ellipse cx="40" cy="80" rx="30" ry="8" fill="#b45309" opacity="0.6" />
    </svg>
  );
};

// Floating Graduation Cap
export const GraduationCap3D = ({ className = '', size = 52 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`drop-shadow-lg select-none ${className}`}>
      {/* Cap Cap (Diamond) */}
      <polygon points="50,18 88,32 50,46 12,32" fill="#D4A017" />
      <polygon points="50,22 82,32 50,42 18,32" fill="#0D1B2A" />
      {/* Skullcap */}
      <path d="M26,38 L26,56 C26,68 74,68 74,56 L74,38 C68,44 58,46 50,46 C42,46 32,44 26,38 Z" fill="#D4A017" />
      {/* Button & Tassel */}
      <circle cx="50" cy="32" r="3.5" fill="#fef08a" />
      <path d="M50,32 Q72,38 74,60" stroke="#fef08a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="71" y="58" width="6" height="12" rx="2" fill="#fef08a" />
    </svg>
  );
};

// Wavy Curved Ribbon Line
export const WavyRibbon = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 1200 300" className={`w-full h-full pointer-events-none opacity-40 ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M-50,150 C200,50 350,250 600,120 C850,-10 1000,220 1250,140"
        stroke="url(#ribbonGrad)"
        strokeWidth="3.5"
        strokeDasharray="8 8"
        className="animate-dash"
      />
      <path
        d="M-30,180 C220,90 400,280 650,160 C900,30 1050,260 1280,180"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />
      <defs>
        <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4A017" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Bassthalk-style Hero Floating Scene (with Illustrated character windows)
export const HeroFloatingScene = ({ setCurrentTab }) => {
  return (
    <div className="relative w-full h-[400px] md:h-[460px] flex items-center justify-center select-none">
      
      {/* Background Soft Glow Circles */}
      <div className="absolute w-72 h-72 rounded-full bg-blue-400/20 blur-3xl animate-blob pointer-events-none" />
      <div className="absolute w-60 h-60 rounded-full bg-amber-400/20 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '3s' }} />

      {/* Decorative Wavy Squiggle in background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400" fill="none">
        <path
          d="M30,180 Q100,50 200,200 T370,160"
          stroke="#93c5fd"
          strokeWidth="3"
          strokeDasharray="6 6"
          className="animate-dash"
          opacity="0.6"
        />
      </svg>

      {/* Floating 3D Geometric Elements */}
      <div className="absolute top-4 right-6 animate-float-slow">
        <Cube3D size={56} color="gold" />
      </div>

      <div className="absolute bottom-10 left-6 animate-float-reverse">
        <Cube3D size={48} color="blue" />
      </div>

      <div className="absolute top-16 left-10 animate-float-fast">
        <Cylinder3D size={44} color="emerald" />
      </div>

      <div className="absolute bottom-6 right-24 animate-float-slow" style={{ animationDelay: '1.5s' }}>
        <Cone3D size={46} />
      </div>

      <div className="absolute top-2 left-1/2 -translate-x-1/2 animate-float">
        <GraduationCap3D size={58} />
      </div>

      {/* Main Central Mobile / Tablet Device Mockup */}
      <div className="relative z-10 w-64 md:w-72 bg-gradient-to-b from-slate-900 to-blue-950 p-3 rounded-[2.5rem] border-4 border-slate-700/60 shadow-2xl hero-phone-mockup transform rotate-2 hover:rotate-0 transition-transform duration-500">
        
        {/* Device Screen */}
        <div className="bg-slate-950 rounded-[2rem] p-4 text-white overflow-hidden space-y-3 relative border border-slate-800">
          
          {/* Top Notch & Camera */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
            <span>منصة عِلم</span>
            <div className="w-12 h-2.5 bg-slate-800 rounded-full mx-auto" />
            <span className="text-amber-400 font-bold">Live ⚡</span>
          </div>

          {/* Active Lesson Header Preview */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 rounded-2xl space-y-1 shadow-md">
            <div className="flex items-center justify-between text-[10px]">
              <span className="bg-white/20 px-2 py-0.5 rounded-md font-black">حصة مباشرة</span>
              <span className="text-amber-300 font-black">⭐⭐⭐⭐⭐</span>
            </div>
            <div className="text-xs font-black text-white line-clamp-1">مقدمة في اللغة العربية والبرمجة</div>
            <div className="text-[10px] text-blue-100 font-medium"> أ / سيد عبد العاطي•باشمهندس نور </div>
          </div>

          {/* Video Play Area with Pulse Glow */}
          <div className="relative aspect-video bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden border border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-transparent to-amber-500/20" />
            <div className="w-11 h-11 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg animate-pulse cursor-pointer">
              <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <div className="absolute bottom-1.5 right-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded font-mono text-white">45:00</div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="text-amber-400 font-black text-xs">100%</div>
              <div className="text-slate-400">تصحيح فوري</div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <div className="text-emerald-400 font-black text-xs">+120 XP</div>
              <div className="text-slate-400">نقاط تفوق</div>
            </div>
          </div>

        </div>

      </div>

      {/* Floating Teacher Badge Left */}
      <div className="absolute -left-2 md:left-2 top-1/3 z-20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 rounded-2xl border-2 border-blue-400/40 shadow-xl flex items-center gap-2.5 animate-float-slow max-w-[180px]">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-black shadow-md flex-shrink-0">
          👨‍💻
        </div>
        <div className="text-right">
          <div className="text-[11px] font-black text-amber-600 dark:text-amber-400 leading-tight">أ/ سيد عبد العاطي</div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">أسرار اللغة العربية</div>
        </div>
      </div>

      {/* Floating Teacher Badge Right */}
      <div className="absolute -right-2 md:right-4 bottom-1/4 z-20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 rounded-2xl border-2 border-amber-400/40 shadow-xl flex items-center gap-2.5 animate-float-reverse max-w-[180px]">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-lg font-black shadow-md flex-shrink-0">
          📖
        </div>
        <div className="text-right">
          <div className="text-[11px] font-black text-blue-600 dark:text-blue-400 leading-tight">م. نور الدين</div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">شرح وتطبيق برمجي</div>
        </div>
      </div>

      {/* Floating Exam Success Badge */}
      <div className="absolute right-12 top-6 z-20 bg-emerald-500 text-white px-3.5 py-1.5 rounded-full text-[11px] font-black shadow-lg flex items-center gap-1.5 animate-float-fast">
        <span>✅ امتحان موثق</span>
      </div>

    </div>
  );
};
