import React, { useState, useEffect } from 'react';
import { Bell, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationBanner = () => {
  const { notifications, setNotifications, student, currentGrade, userRole } = useApp();
  const [visible, setVisible] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Filter notifications relevant to this student's grade
  const grade = student?.grade || currentGrade;
  const relevantNotifs = notifications.filter(
    (n) => n.unread && (n.targetGrade === 'all' || n.targetGrade === grade)
  );

  const unreadCount = relevantNotifs.length;

  useEffect(() => {
    if (unreadCount > 0 && userRole === 'student') {
      setVisible(true);
      setCurrentIdx(0);
    }
  }, [unreadCount, userRole]);

  if (!visible || relevantNotifs.length === 0 || userRole !== 'student') return null;

  const current = relevantNotifs[currentIdx];

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
    setVisible(false);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleNext = () => {
    if (currentIdx < relevantNotifs.length - 1) setCurrentIdx(currentIdx + 1);
    else markAllRead();
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={markAllRead}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-amber-200 w-full max-w-md overflow-hidden"
        style={{ animation: 'scaleIn 0.3s ease' }}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-l from-amber-500 to-amber-400 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/30 rounded-full p-2">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-base">إشعار جديد 🔔</h3>
              <p className="text-amber-100 text-[11px] font-bold">
                {currentIdx + 1} / {relevantNotifs.length} إشعار
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="bg-white/20 hover:bg-white/40 rounded-full p-1.5 transition-all"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <h4 className="font-black text-slate-900 text-lg leading-snug mb-2">
            {current.title}
          </h4>
          {current.body && (
            <p className="text-slate-600 text-sm leading-relaxed">{current.body}</p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-lg">
              {current.targetGrade === 'all' ? 'لجميع الطلاب' : current.targetGrade === '3sec' ? 'ثالثة ثانوي' : current.targetGrade === '2sec' ? 'ثاني ثانوي' : 'أول ثانوي'}
            </span>
            {current.time && (
              <span className="text-[11px] text-slate-400 font-bold">
                {current.date ? `${current.date} - ${current.time}` : current.time}
              </span>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-5 flex items-center justify-between gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 text-slate-500 text-sm font-bold disabled:opacity-30 hover:text-slate-700 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
            السابق
          </button>

          {currentIdx < relevantNotifs.length - 1 ? (
            <button
              onClick={handleNext}
              className="bg-amber-500 hover:bg-amber-600 text-white font-black px-5 py-2 rounded-xl text-sm transition-all shadow-md flex items-center gap-1"
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={markAllRead}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-5 py-2 rounded-xl text-sm transition-all shadow-md"
            >
              فهمت ✓
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
