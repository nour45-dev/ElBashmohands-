import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, ShieldCheck, Phone, Lock, Sparkles, X, User, ArrowLeft } from 'lucide-react';

export const AuthModal = () => {
  const { showAuthModal, setShowAuthModal, loginUser } = useApp();

  if (!showAuthModal) return null;

  const [authRole, setAuthRole] = useState('student'); // 'student', 'parent', 'admin'
  const [phoneInput, setPhoneInput] = useState('01012345678');
  const [passInput, setPassInput] = useState('123456');
  const [parentStudentCode, setParentStudentCode] = useState('STD-101');
  const [adminCode, setAdminCode] = useState('2026');

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(authRole, { phoneInput, passInput, parentStudentCode, adminCode });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-6 text-white text-center relative">
          <button 
            onClick={() => setShowAuthModal(false)}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl mx-auto mb-2 shadow-lg shadow-amber-500/20">
            ⚡
          </div>
          <h3 className="font-black text-xl">تسجيل الدخول - منصة المعلم</h3>
          <p className="text-xs text-slate-300 font-medium mt-1">اختر نوع حسابك للمتابعة والدخول للمنصة</p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex gap-1">
          <button
            onClick={() => setAuthRole('student')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${authRole === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            👨‍🎓 حساب طالب
          </button>

          <button
            onClick={() => setAuthRole('parent')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${authRole === 'parent' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            👨‍👩‍👦 متابعة ولي الأمر
          </button>

          <button
            onClick={() => setAuthRole('admin')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${authRole === 'admin' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            👨‍🏫 المعلم / أدمن
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {authRole === 'student' && (
            <>
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">رقم الموبايل المسجل:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">كلمة المرور:</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>
            </>
          )}

          {authRole === 'parent' && (
            <>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
                💡 أدخل كود الطالب أو رقم الموبايل المسجل لمتابعة أداء ابنك ودرجاته فورياً على المنصة.
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">كود الطالب أو رقم موبايل الطالب:</label>
                <input
                  type="text"
                  required
                  value={parentStudentCode}
                  onChange={(e) => setParentStudentCode(e.target.value)}
                  placeholder="مثال: STD-101 أو 01012345678"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </>
          )}

          {authRole === 'admin' && (
            <>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                🔐 دخول الإدارة الخاص بالأستاذ والمعلم وفريق العمل.
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">رمز الأمان أو كلمة سر الأدمن:</label>
                <input
                  type="password"
                  required
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="أدخل رمز الأدمن..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 text-white shadow-lg transition-all ${authRole === 'student' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : authRole === 'parent' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}
          >
            <span>تسجيل الدخول والبدء 🚀</span>
          </button>

        </form>

      </div>
    </div>
  );
};
