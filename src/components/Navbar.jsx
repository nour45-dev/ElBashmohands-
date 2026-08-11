import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Menu, 
  X, 
  Wallet, 
  LogOut, 
  Bell, 
  ChevronDown,
  BookOpen,
  GraduationCap,
  Award,
  Users
} from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab }) => {
  const { 
    userRole, 
    logoutUser, 
    student, 
    notifications,
    setNotifications,
    currentGrade, 
    switchGrade,
    theme,
    toggleTheme
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);

  // Filter notifications relevant to this student's grade
  const grade = student?.grade || currentGrade;
  const relevantNotifs = notifications.filter(
    (n) => n.unread && (n.targetGrade === 'all' || n.targetGrade === grade)
  );
  const unreadCount = relevantNotifs.length;

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const getGradeLabel = (g) => {
    if (g === '3sec') return 'الصف الثالث الثانوي';
    if (g === '2sec') return 'الصف الثاني الثانوي';
    return 'الصف الأول الثانوي';
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand Logo and Platform Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-500 flex items-center justify-center text-xl shadow-md shadow-blue-500/20 font-black">
            💡
          </div>
          <div className="text-right">
            <h1 className="text-sm font-black tracking-wide text-white leading-none">مَنارة التعلِيمية</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">بوابتك للغة العربية والبرمجة</p>
          </div>
        </div>

        {/* Desktop Tabs Navigation (Only if logged in) */}
        {userRole !== 'parent' && (
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => handleTabChange('home')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${currentTab === 'home' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-white'}`}
            >
              الصفحة الرئيسية 🏠
            </button>
            <button
              onClick={() => handleTabChange('lessons')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${currentTab === 'lessons' || currentTab === 'lesson-detail' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              الحصص والمحاضرات 📚
            </button>
            <button
              onClick={() => handleTabChange('exams')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${currentTab === 'exams' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              الامتحانات والواجبات 📝
            </button>
            {userRole === 'student' && (
              <>
                <button
                  onClick={() => handleTabChange('wallet')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${currentTab === 'wallet' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  المحفظة والرصيد 💳
                </button>
                <button
                  onClick={() => handleTabChange('leaderboard')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${currentTab === 'leaderboard' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  لوحة الشرف والأوسمة 🏆
                </button>
              </>
            )}
            {userRole === 'admin' && (
              <button
                onClick={() => handleTabChange('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${currentTab === 'admin' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                لوحة التحكم للأدمن 👨‍💻
              </button>
            )}
          </div>
        )}

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
                <div className="text-[11px] font-black leading-none font-mono">{student?.walletBalance ?? 0} ج.م</div>
              </div>
            </div>
          )}

          {/* 🔔 Notification Bell Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-xl transition-all border ${showNotifications ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600'}`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Container */}
            {showNotifications && (
              <div className="absolute left-0 mt-2.5 w-72 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                  <h4 className="text-xs font-black">أحدث الإشعارات والتنبيهات 🔔</h4>
                  {unreadCount > 0 && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {unreadCount} جديد
                    </span>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
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
                {userRole === 'admin' ? 'الباشمهندس (الأدمن)' : (student?.name || 'جاري التحميل...')}
              </div>
              <div className="text-[10px] text-amber-600 font-mono font-bold mt-0.5">
                {userRole === 'admin' ? 'الإدارة المركزية' : `كود: ${student?.code || '...'}`}
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              title={theme === 'light' ? 'الوضع الداكن 🌙' : 'الوضع المضيء ☀️'}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all ml-1 text-sm leading-none"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <button 
              onClick={logoutUser}
              title="تسجيل الخروج"
              className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all mr-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-800 text-white lg:hidden hover:bg-slate-700 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          
          <button 
            onClick={() => handleTabChange('home')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs font-extrabold flex items-center gap-2 ${currentTab === 'home' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
          >
            الصفحة الرئيسية 🏠
          </button>
          
          <button 
            onClick={() => handleTabChange('lessons')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs font-extrabold flex items-center gap-2 ${currentTab === 'lessons' || currentTab === 'lesson-detail' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
            الحصص والمحاضرات 📚
          </button>
          
          <button 
            onClick={() => handleTabChange('exams')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs font-extrabold flex items-center gap-2 ${currentTab === 'exams' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
          >
            <GraduationCap className="w-4 h-4 text-amber-500" />
            الامتحانات والواجبات 📝
          </button>

          {userRole === 'student' && (
            <>
              <button 
                onClick={() => { handleTabChange('leaderboard'); }}
                className="w-full text-right px-4 py-3 rounded-xl text-xs font-extrabold bg-slate-800 text-slate-300 flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-yellow-500" />
                لوحة الشرف والأوسمة 🏆
              </button>
              <button 
                onClick={() => { setCurrentTab('wallet'); setMobileMenuOpen(false); }}
                className="w-full text-right px-4 py-3 rounded-xl text-xs font-extrabold bg-slate-50 text-slate-900 flex items-center gap-2"
              >
                <Wallet className="w-4 h-4 text-amber-600" />
                المحفظة والرصيد {student ? `(${student.walletBalance} ج.م)` : ''}
              </button>
            </>
          )}

          {userRole === 'admin' && (
            <button 
              onClick={() => handleTabChange('admin')}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs font-extrabold flex items-center gap-2 ${currentTab === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}
            >
              لوحة التحكم للأدمن 👨‍💻
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
