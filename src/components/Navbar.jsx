import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Video, 
  Award, 
  Users, 
  Wallet, 
  LogOut, 
  Bell, 
  ShieldCheck, 
  Menu, 
  X,
  Code,
  Zap,
  PhoneCall
} from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab }) => {
  const { 
    userRole, 
    logoutUser, 
    student, 
    notifications,
    setNotifications,
    currentGrade, 
    switchGrade 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      
      <div className="container py-3 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 transform hover:scale-105 transition-all">
            <Zap className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>

          <div>
            <div className="text-base font-black text-slate-900 leading-none">
              منصة الباشمهندس
            </div>
            <div className="text-[10px] font-extrabold text-blue-600 mt-1">
              المنصة الأولى لبرمجة الثانوية العامة ⚡
            </div>
          </div>
        </div>

        {/* Desktop Navigation Items */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
          
          <button 
            onClick={() => setCurrentTab('home')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${currentTab === 'home' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
          >
            <BookOpen className="w-4 h-4" />
            الرئيسية
          </button>

          <button 
            onClick={() => setCurrentTab('lessons')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${currentTab === 'lessons' || currentTab === 'lesson-detail' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
          >
            <Video className="w-4 h-4" />
            الحصص والدروس
          </button>

          <button 
            onClick={() => setCurrentTab('exams')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${currentTab === 'exams' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
          >
            <Award className="w-4 h-4" />
            الامتحانات والواجبات
          </button>

          <button 
            onClick={() => setCurrentTab('wallet')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${currentTab === 'wallet' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
          >
            <Wallet className="w-4 h-4" />
            المحفظة والرصيد
          </button>

          {/* Hide Parent View from Students */}
          {(userRole === 'parent' || userRole === 'admin') && (
            <button 
              onClick={() => setCurrentTab('parent-view')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${currentTab === 'parent-view' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              متابعة ولي الأمر
            </button>
          )}

          {userRole === 'admin' && (
            <button 
              onClick={() => setCurrentTab('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${currentTab === 'admin' ? 'bg-slate-900 text-amber-400 shadow-sm' : 'bg-slate-900/10 text-slate-900 hover:bg-slate-900 hover:text-white'}`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              لوحة الباشمهندس
            </button>
          )}

        </nav>

        {/* Right User Bar & Profile Actions */}
        <div className="flex items-center gap-3">
          
          {/* Student Wallet Badge */}
          {userRole === 'student' && (
            <div 
              onClick={() => setCurrentTab('wallet')}
              className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all shadow-2xs"
            >
              <Wallet className="w-4 h-4 text-amber-600" />
              <div className="text-right">
                <div className="text-[11px] font-black leading-none font-mono">{student.walletBalance} ج.م</div>
              </div>
            </div>
          )}

          {/* 🔔 Notification Bell Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-xl transition-all border ${showNotifications ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600'}`}
              title="الإشعارات"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-md border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div
                className="absolute left-0 top-full mt-2 w-80 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden"
                dir="rtl"
              >
                {/* Panel Header */}
                <div className="bg-gradient-to-l from-amber-500 to-amber-400 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-white" />
                    <span className="text-white font-black text-sm">الإشعارات</span>
                    {unreadCount > 0 && (
                      <span className="bg-white/30 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {unreadCount} جديد
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-white/70 hover:text-white text-lg font-black leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Notifications List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="text-2xl mb-2">🔔</div>
                      <p className="text-slate-400 text-xs font-bold">لا توجد إشعارات حالياً</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 hover:bg-slate-50 transition-all ${n.unread ? 'bg-amber-50/60' : ''}`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Subject Badge */}
                          <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${
                            n.subject === 'programming' ? 'bg-blue-100 text-blue-700' :
                            n.subject === 'arabic' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {n.subject === 'programming' ? '💻' : n.subject === 'arabic' ? '📖' : '📢'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />}
                              <p className="font-black text-slate-900 text-xs leading-snug">{n.title}</p>
                            </div>
                            {n.body && <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">{n.body}</p>}
                            <div className="flex items-center gap-2 mt-1">
                              {n.subject && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                  n.subject === 'programming' ? 'bg-blue-100 text-blue-700' :
                                  n.subject === 'arabic' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-500'
                                }`}>
                                  {n.subject === 'programming' ? '💻 البرمجة' : n.subject === 'arabic' ? '📖 العربي' : '📢 عام'}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">{n.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Mark All Read */}
                {unreadCount > 0 && (
                  <div className="border-t border-slate-100 px-4 py-2.5">
                    <button
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                        setShowNotifications(false);
                      }}
                      className="w-full text-center text-xs text-amber-600 font-black hover:text-amber-800 transition-all"
                    >
                      تعليم الكل كمقروء ✓
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile Neutral Avatar */}
          <div className="flex items-center gap-2.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs shadow-xs">
              {userRole === 'admin' ? '👨‍💻' : (student?.name?.[0] || '👤')}
            </div>
            <div className="hidden md:block text-right pr-1">
              <div className="text-xs font-black text-slate-900 leading-none">
                {userRole === 'admin' ? 'الباشمهندس (الأدمن)' : student.name}
              </div>
              <div className="text-[10px] text-amber-600 font-mono font-bold mt-0.5">
                {userRole === 'admin' ? 'الإدارة المركزية' : `كود: ${student.code}`}
              </div>
            </div>

            <button 
              onClick={logoutUser}
              title="تسجيل الخروج"
              className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all mr-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>


      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-2 animate-in slide-in-from-top duration-200">
          <button 
            onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
            className="w-full text-right px-4 py-3 rounded-xl text-xs font-extrabold bg-slate-50 text-slate-900 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            الرئيسية
          </button>

          <button 
            onClick={() => { setCurrentTab('lessons'); setMobileMenuOpen(false); }}
            className="w-full text-right px-4 py-3 rounded-xl text-xs font-extrabold bg-slate-50 text-slate-900 flex items-center gap-2"
          >
            <Video className="w-4 h-4 text-blue-600" />
            الحصص والدروس
          </button>

          <button 
            onClick={() => { setCurrentTab('exams'); setMobileMenuOpen(false); }}
            className="w-full text-right px-4 py-3 rounded-xl text-xs font-extrabold bg-slate-50 text-slate-900 flex items-center gap-2"
          >
            <Award className="w-4 h-4 text-blue-600" />
            الامتحانات والواجبات
          </button>

          <button 
            onClick={() => { setCurrentTab('wallet'); setMobileMenuOpen(false); }}
            className="w-full text-right px-4 py-3 rounded-xl text-xs font-extrabold bg-slate-50 text-slate-900 flex items-center gap-2"
          >
            <Wallet className="w-4 h-4 text-amber-600" />
            المحفظة والرصيد {student ? `(${student.walletBalance} ج.م)` : ''}
          </button>

          {(userRole === 'parent' || userRole === 'admin') && (
            <button 
              onClick={() => { setCurrentTab('parent-view'); setMobileMenuOpen(false); }}
              className="w-full text-right px-4 py-3 rounded-xl text-xs font-extrabold bg-slate-50 text-slate-900 flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-emerald-600" />
              متابعة ولي الأمر
            </button>
          )}

          {userRole === 'admin' && (
            <button 
              onClick={() => { setCurrentTab('admin'); setMobileMenuOpen(false); }}
              className="w-full text-right px-4 py-3 rounded-xl text-xs font-black bg-slate-900 text-amber-400 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              لوحة التحكم الإدارية
            </button>
          )}
        </div>
      )}
 
    </header>
  );
};
