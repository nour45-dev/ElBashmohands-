import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Flame, Award, Trophy, Star, ShieldCheck, Gift } from 'lucide-react';

export const GamificationView = () => {
  const { student, leaderboard } = useApp();

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      
      {/* Hero Leaderboard Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-slate-900 text-white p-8 rounded-3xl border border-amber-400/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <span className="bg-slate-950/40 text-amber-200 text-xs font-black px-3 py-1 rounded-full border border-amber-300/30">
            نظام النقط والتحفيز والتميز 👑
          </span>
          <h1 className="text-2xl md:text-3xl font-black">أوائل دفعة 2026 في الفيزياء</h1>
          <p className="text-xs md:text-sm text-amber-100 font-medium max-w-lg">
            كل مشاهدة حصة، حل امتحان، أو التزام يومي بيديك نقاط ترفع ترتيبك وتفتحلك أوسمة تفوق وهدايا حصص مجانية!
          </p>
        </div>

        {/* Student Stats Mini Card */}
        <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-right min-w-[220px] space-y-2 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs text-slate-400 font-bold">ترتيبك الحالي:</span>
            <span className="text-sm font-black text-amber-400">المركز #{student?.rank ?? '-'} 🏆</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">رصيد النقاط:</span>
            <span className="text-sm font-black text-blue-400">{student?.points ?? 0} نقطة ⚡</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">الشعلة اليومية:</span>
            <span className="text-sm font-black text-amber-500">{student?.streakDays ?? 0} أيام متتالية 🔥</span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {leaderboard.slice(0, 3).map((item, idx) => (
          <div 
            key={idx}
            className={`bg-white p-6 rounded-3xl border text-center space-y-3 relative shadow-lg ${idx === 0 ? 'border-amber-400 bg-gradient-to-b from-amber-50/50 to-white ring-4 ring-amber-400/20 md:-translate-y-3' : 'border-slate-200'}`}
          >
            <div className="absolute -top-4 right-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow-md">
              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
            </div>

            <img 
              src={item.avatar} 
              alt={item.name} 
              className="w-20 h-20 rounded-2xl object-cover mx-auto ring-4 ring-amber-400/30 shadow-md pt-2"
            />

            <div>
              <h4 className="font-black text-slate-900 text-base">{item.name}</h4>
              <p className="text-xs text-slate-500 font-bold mt-0.5">{item.badge}</p>
            </div>

            <div className="bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-200 inline-flex items-center gap-1.5 text-xs font-black text-amber-700">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{item.points} نقطة تفوق</span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
        <h3 className="font-black text-slate-900 text-base">جدول الترتيب الشامل لطلاب الثانوية 📊</h3>

        <div className="space-y-2">
          {leaderboard.map((item, idx) => (
            <div 
              key={idx}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all ${item.name.includes('(أنت)') ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-black text-slate-500">#{item.rank}</span>
                <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-xl object-cover" />
                <span className="font-black text-slate-900">{item.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-bold hidden sm:inline">{item.badge}</span>
                <span className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-amber-700 font-black">
                  {item.points} نقطة
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
        <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          أوسمة الشرف والأوسمة المكتسبة 🏅
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(student?.badges || []).map(badge => (
            <div key={badge.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center text-xl shadow-sm">
                {badge.icon}
              </div>
              <div>
                <div className="font-black text-slate-900 text-xs">{badge.name}</div>
                <div className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">{badge.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
