import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ElmLogo } from '../components/ElmLogo';
import { 
  Cube3D, 
  Cylinder3D, 
  Cone3D, 
  GraduationCap3D, 
  WavyRibbon, 
  HeroFloatingScene 
} from '../components/FloatingShapes';
import { 
  User, 
  Lock, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Users,
  Eye,
  EyeOff,
  Mail,
  GraduationCap,
  Play,
  FileText,
  Award,
  Zap,
  HelpCircle,
  ChevronDown,
  PhoneCall,
  Flame,
  Check,
  Sun,
  Moon
} from 'lucide-react';

export const LoginView = () => {
  const { loginUser, registerStudent, verifyDeviceOtp, theme, toggleTheme } = useApp();

  // Active Tab: 'student-login' | 'student-signup' | 'parent-login' | 'admin-login'
  const [activeTab, setActiveTab] = useState('student-login');

  // Secret admin unlock (click logo 5 times rapidly)
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [showSecretEntry, setShowSecretEntry] = useState(false);
  const ADMIN_SECRET_GATE = 'bashmohandis';

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    if (newCount >= 5) {
      setLogoClickCount(0);
      setShowSecretEntry(true);
    }
  };

  // Show/Hide Password Eye State
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Student Login Fields
  const [phoneInput, setPhoneInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [deviceLocked, setDeviceLocked] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  // Student Signup Fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupParentPhone, setSignupParentPhone] = useState('');
  const [signupGrade, setSignupGrade] = useState('3sec');
  const [signupPass, setSignupPass] = useState('');
  const [signupConfirmPass, setSignupConfirmPass] = useState('');

  // Parent Login Fields
  const [parentPhoneInput, setParentPhoneInput] = useState('');
  const [parentStudentCode, setParentStudentCode] = useState('');

  // Admin Login Fields
  const [adminCode, setAdminCode] = useState('');
  const [selectedAdminIdentity, setSelectedAdminIdentity] = useState('eng_nour');

  // Messages
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = await loginUser('student', { phoneInput, passInput });
    if (!res.success) {
      if (res.isLocked) {
        setDeviceLocked(true);
      }
      setErrorMessage(res.message);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    const res = await verifyDeviceOtp(phoneInput, otpInput);
    if (res.success) {
      setSuccessMessage(res.message);
      setDeviceLocked(false);
      setOtpInput('');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleStudentSignup = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await registerStudent({
      name: signupName,
      email: signupEmail,
      phone: signupPhone,
      parentPhone: signupParentPhone,
      grade: signupGrade,
      password: signupPass,
      confirmPassword: signupConfirmPass
    });

    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
    }
  };

  const handleParentLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = await loginUser('parent', { parentPhone: parentPhoneInput, parentStudentCode });
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = await loginUser('admin', { adminCode, adminIdentity: selectedAdminIdentity });
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0D1B2A] text-slate-900 dark:text-white flex flex-col relative overflow-x-hidden font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300">
      
      {/* Background Animated Blobs & Glows */}
      <div className="fixed -top-40 -right-40 w-[32rem] h-[32rem] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-blob" />
      <div className="fixed top-1/2 -left-40 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-blob" style={{ animationDelay: '3s' }} />
      <div className="fixed -bottom-40 right-1/4 w-[36rem] h-[36rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-blob" style={{ animationDelay: '5s' }} />

      {/* ═══ Top Landing Header ═══ */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0D1B2A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo */}
          <div onClick={handleLogoClick} className="cursor-pointer flex items-center gap-2 hover:opacity-90 transition-all">
            <ElmLogo variant="horizontal" />
          </div>

          {/* Header Controls & WhatsApp Help */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-amber-400 hover:scale-105 transition-all shadow-xs"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Direct WhatsApp Help */}
            <a 
              href="https://wa.me/201002169889" 
              target="_blank" 
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>الدعم الفني: 01002169889</span>
            </a>

            {/* Start CTA */}
            <button
              onClick={() => { setActiveTab('student-signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ابدأ رحلتك الآن</span>
            </button>
          </div>

        </div>
      </header>

      {/* ═══ Main Split Hero Section (Auth Card + 3D Interactive Scene) ═══ */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 relative z-10 space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Right Side (7 Cols on Desktop): The Auth Card */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            
            {/* Top Motto Badge */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 px-4 py-1.5 rounded-full text-xs font-black shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>منصة عِلم التعليمية • عِلمٌ يُنتَفَعُ بِهِ 🎓</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                طريقك نحو <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-amber-400 dark:via-amber-200 dark:to-amber-500">القمة والتفوق</span> يبدأ هنا 🚀
              </h1>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed max-w-xl">
                شرح تفاعلي وافي، امتحانات إلكترونية مصححة فورياً، ومتابعة دقيقة لكل تفاصيل مستواك الدراسي في الثانوية العامة.
              </p>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="bg-slate-200/80 dark:bg-[#162534] p-1.5 rounded-2xl border border-slate-300/80 dark:border-slate-700/80 flex items-center justify-between gap-1 overflow-x-auto text-xs font-black shadow-inner">
              <button
                onClick={() => { setActiveTab('student-login'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 py-3 px-3 rounded-xl transition-all whitespace-nowrap text-center ${
                  activeTab === 'student-login' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                تسجيل الدخول 🔑
              </button>

              <button
                onClick={() => { setActiveTab('student-signup'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 py-3 px-3 rounded-xl transition-all whitespace-nowrap text-center ${
                  activeTab === 'student-signup' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                إنشاء حساب جديد ✨
              </button>

              <button
                onClick={() => { setActiveTab('parent-login'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`flex-1 py-3 px-3 rounded-xl transition-all whitespace-nowrap text-center ${
                  activeTab === 'parent-login' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                متابعة ولي الأمر 👨‍👦
              </button>
            </div>

            {/* Secret Gate Modal */}
            {showSecretEntry && (
              <div className="bg-white dark:bg-[#162534] border border-amber-500/50 rounded-2xl p-5 space-y-3 text-right animate-in fade-in shadow-xl">
                <p className="text-amber-600 dark:text-amber-400 font-black text-xs">🔐 أدخل كلمة السر للوصول لبوابة المعلم / الإدارة:</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={secretCodeInput}
                    onChange={(e) => setSecretCodeInput(e.target.value)}
                    placeholder="أدخل الكود السري..."
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none dir-ltr"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (secretCodeInput === ADMIN_SECRET_GATE) {
                          setAdminUnlocked(true);
                          setActiveTab('admin-login');
                          setShowSecretEntry(false);
                          setSecretCodeInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (secretCodeInput === ADMIN_SECRET_GATE) {
                        setAdminUnlocked(true);
                        setActiveTab('admin-login');
                        setShowSecretEntry(false);
                        setSecretCodeInput('');
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all"
                  >
                    تأكيد
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowSecretEntry(false); setSecretCodeInput(''); setLogoClickCount(0); }}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-white text-xs font-black px-3 py-2.5"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {/* Main Active Form Card */}
            <div className="bg-white dark:bg-[#162534] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-xl dark:shadow-2xl space-y-5 relative">
              
              {/* Tab 1: Student Login */}
              {activeTab === 'student-login' && (
                deviceLocked ? (
                  <form onSubmit={handleOtpSubmit} className="space-y-4 animate-in fade-in">
                    <div className="text-right border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h3 className="font-black text-amber-600 dark:text-amber-400 text-base">قفل الجهاز نشط 🔐</h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 font-bold">هذا الحساب مسجل بجهاز آخر بالفعل. يرجى التواصل مع الدعم الفني لتفعيل جهازك الجديد عبر رمز OTP.</p>
                      <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 p-2.5 rounded-xl text-center text-xs font-bold mt-2">
                        📞 تواصل مع الدعم الفني مباشرة: <a href="https://wa.me/201002169889" target="_blank" rel="noreferrer" className="text-emerald-700 dark:text-emerald-300 underline font-black">01002169889</a>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">أدخل رمز التفعيل (OTP):</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="أدخل الرمز المكون من 6 أرقام..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pr-10 py-3 text-xs font-mono font-black text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500 outline-none text-center"
                        />
                        <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3.5" />
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-3.5 rounded-xl justify-center shadow-lg transition-all"
                    >
                      تأكيد وفك قفل الجهاز 🔓
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleStudentLogin} className="space-y-4 animate-in fade-in">
                    <div className="text-right border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h3 className="font-black text-slate-900 dark:text-white text-base">تسجيل دخول الطالب 🎓</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">أدخل رقم هاتفك المسجل أو كود الطالب مع كلمة المرور</p>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف أو البريد الإلكتروني أو كود الطالب:</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="010xxxxxxxx أو student@example.com أو 3003"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pr-10 pl-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3.5" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-black text-slate-700 dark:text-slate-300">كلمة المرور:</label>
                        <a href="https://wa.me/201002169889" target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
                          نسيت كلمة السر؟
                        </a>
                      </div>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          value={passInput}
                          onChange={(e) => setPassInput(e.target.value)}
                          placeholder="أدخل كلمة المرور الخاصة بك..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pr-10 pl-10 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                        />
                        <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3.5" />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute left-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black py-3.5 rounded-xl justify-center shadow-lg shadow-blue-600/30 transition-all"
                    >
                      تسجيل الدخول للمنصة 🚀
                    </button>
                  </form>
                )
              )}

              {/* Tab 2: Student Signup */}
              {activeTab === 'student-signup' && (
                <form onSubmit={handleStudentSignup} className="space-y-4 animate-in fade-in">
                  <div className="text-right border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-black text-slate-900 dark:text-white text-base">إنشاء حساب طالب جديد ✨</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">انضم لآلاف الطلاب المتفوقين في منصة عِلم</p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">اسم الطالب رباعي:</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="مثال: أحمد محمود علي حسن"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني (Email):</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                      />
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">رقم هاتف الطالب:</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          placeholder="010xxxxxxxx"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                        />
                        <Smartphone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">رقم هاتف ولي الأمر:</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={signupParentPhone}
                          onChange={(e) => setSignupParentPhone(e.target.value)}
                          placeholder="010xxxxxxxx"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                        />
                        <Users className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">الصف الدراسي:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: '3sec', label: '🎓 ثالثة ثانوي' },
                        { id: '2sec', label: '📘 ثانية ثانوي' },
                        { id: '1sec', label: '📗 أولى ثانوي' }
                      ].map(g => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setSignupGrade(g.id)}
                          className={`py-2 px-2 rounded-xl text-xs font-black border transition-all ${
                            signupGrade === g.id
                              ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                              : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">كلمة المرور:</label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          value={signupPass}
                          onChange={(e) => setSignupPass(e.target.value)}
                          placeholder="6 أحرف أو أرقام على الأقل"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pr-8 pl-8 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute left-2.5 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        >
                          {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">تأكيد كلمة المرور:</label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          required
                          value={signupConfirmPass}
                          onChange={(e) => setSignupConfirmPass(e.target.value)}
                          placeholder="أعد كتابة كلمة المرور"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pr-8 pl-8 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute left-2.5 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        >
                          {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black py-3.5 rounded-xl justify-center shadow-lg shadow-blue-600/30 transition-all"
                  >
                    إنشاء الحساب والدخول التلقائي 🚀
                  </button>
                </form>
              )}

              {/* Tab 3: Parent Login */}
              {activeTab === 'parent-login' && (
                <form onSubmit={handleParentLogin} className="space-y-4 animate-in fade-in">
                  <div className="text-right border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-black text-slate-900 dark:text-white text-base">دخول أولياء الأمور 👨‍👦</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">متابعة دقيقة لدرجات الطالب ونسب المشاهدة وتقارير الحصص</p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">رقم هاتف ولي الأمر:</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={parentPhoneInput}
                        onChange={(e) => setParentPhoneInput(e.target.value)}
                        placeholder="أدخل رقم هاتفك كولي أمر..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pr-10 pl-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <Smartphone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">كود الطالب أو اسمه (مثل 3003 أو أحمد محمود):</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={parentStudentCode}
                        onChange={(e) => setParentStudentCode(e.target.value)}
                        placeholder="ادخل اسم الطالب أو كوده..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pr-10 pl-4 py-3 text-xs font-bold text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <Users className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3.5" />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black py-3.5 rounded-xl justify-center shadow-lg shadow-blue-600/30 transition-all"
                  >
                    عرض تقرير الطالب 📊
                  </button>
                </form>
              )}

              {/* Tab 4: Admin Login */}
              {activeTab === 'admin-login' && (
                <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in">
                  <div className="text-right border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-black text-amber-600 dark:text-amber-400 text-base">لوحة التحكم الإدارية (الأدمن) 🔐</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">اختر حساب المحاضر/المعلم وأدخل كلمة السر</p>
                  </div>

                  {/* Admin Identity Selection Cards */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300">حدد حساب المحاضر 👤:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setSelectedAdminIdentity('eng_nour')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-right space-y-1 ${
                          selectedAdminIdentity === 'eng_nour' 
                            ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/30' 
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>💻</span>
                          <span>مهندس نور</span>
                        </div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-300 font-bold">محاضر البرمجة وعلوم الحاسب</div>
                      </div>

                      <div
                        onClick={() => setSelectedAdminIdentity('mr_sayed')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-right space-y-1 ${
                          selectedAdminIdentity === 'mr_sayed' 
                            ? 'bg-amber-50 dark:bg-amber-600/20 border-amber-500 ring-2 ring-amber-500/30' 
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>📖</span>
                          <span>مستر سيد عبد العاطي</span>
                        </div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-300 font-bold">معلم اللغة العربية</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">كلمة المرور الرسمية:</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        placeholder="أدخل كلمة السر"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-amber-500/50 rounded-xl pr-10 pl-10 py-3 text-xs font-mono font-black text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500 outline-none dir-ltr"
                      />
                      <ShieldCheck className="w-4 h-4 text-amber-500 absolute right-3.5 top-3.5" />

                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute left-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-amber-400"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-3.5 rounded-xl justify-center shadow-lg transition-all"
                  >
                    دخول بحساب {selectedAdminIdentity === 'mr_sayed' ? 'مستر سيد عبد العاطي' : 'مهندس نور'} 🚀
                  </button>
                </form>
              )}

            </div>

          </div>

          {/* Left Side (5 Cols on Desktop): 3D Scene Mockup & Highlights */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center space-y-6 order-1 lg:order-2">
            
            {/* 3D Floating Scene Component */}
            <div className="w-full flex justify-center scale-95 md:scale-105">
              <HeroFloatingScene setCurrentTab={() => {}} />
            </div>

            {/* Quick Live Trust Stats Pill Row */}
            <div className="w-full grid grid-cols-3 gap-3 text-center">
              <div className="bg-white dark:bg-[#162534]/80 border border-slate-200 dark:border-slate-700/80 p-3 rounded-2xl space-y-0.5 shadow-sm">
                <div className="text-base font-black text-amber-500 dark:text-amber-400 font-mono">+5,000</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-300 font-bold">طالب مسجل</div>
              </div>
              <div className="bg-white dark:bg-[#162534]/80 border border-slate-200 dark:border-slate-700/80 p-3 rounded-2xl space-y-0.5 shadow-sm">
                <div className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">100%</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-300 font-bold">شرح تفاعلي</div>
              </div>
              <div className="bg-white dark:bg-[#162534]/80 border border-slate-200 dark:border-slate-700/80 p-3 rounded-2xl space-y-0.5 shadow-sm">
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">24/7</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-300 font-bold">دعم ومتابعة</div>
              </div>
            </div>

          </div>

        </div>

        {/* ═══ Section: إزاي المنصة بتشتغل؟ (The 4-Step Roadmap) ═══ */}
        <section className="bg-slate-100/90 dark:bg-[#111e2d] border border-slate-200 dark:border-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-xl dark:shadow-2xl space-y-10 relative overflow-hidden transition-colors">
          
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-black">
              <Zap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span>خطواتك البسيطة نحو الدرجة النهائية 🚀</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              إزاي منصة <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500">عِلم</span> بتشتغل؟
            </h2>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
              صممنا لك تجربة تعليمية ممتعة وسلسة تاخد بإيدك خطوة بخطوة من أول اختيار الحصة لحد التقفيل والدرجات النهائية.
            </p>
          </div>

          {/* 4 Interactive Journey Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            
            {/* Step 1 */}
            <div className="bg-white dark:bg-[#162534] border-2 border-slate-200 dark:border-slate-700/80 hover:border-blue-500 p-6 rounded-3xl shadow-md dark:shadow-xl space-y-4 text-right transition-all duration-300 hover:-translate-y-2 group relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-black shadow-sm group-hover:scale-110 transition-transform">
                🎯
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-blue-600 dark:text-blue-400">الخطوة الأولى</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">اختر صفك ومادتك</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                  حدد مرحلتك الدراسية (أولى، ثانية، أو ثالثة ثانوي) واختر بين كورسات البرمجة أو دروس اللغة العربية بضغطة واحدة.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] font-black text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <span>سهولة وسرعة فائقة</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-[#162534] border-2 border-slate-200 dark:border-slate-700/80 hover:border-amber-500 p-6 rounded-3xl shadow-md dark:shadow-xl space-y-4 text-right transition-all duration-300 hover:-translate-y-2 group relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-black shadow-sm group-hover:scale-110 transition-transform">
                🎬
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">الخطوة الثانية</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">شاهد الحصة بتركيز</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                  استمتع بشرح تفاعلي مبسط على مشغل فيديو محمي عالي الجودة، مع إمكانية تحميل وطباعة مذكرة الدرس PDF مباشرة.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] font-black text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                <span>مذكرات PDF مدمجة</span>
                <FileText className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-[#162534] border-2 border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 p-6 rounded-3xl shadow-md dark:shadow-xl space-y-4 text-right transition-all duration-300 hover:-translate-y-2 group relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-black shadow-sm group-hover:scale-110 transition-transform">
                📝
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">الخطوة الثالثة</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">حل الامتحان الإلكتروني</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                  اختبر فهمك بامتحان إلكتروني بوقت محدد، واستلم تصحيحك الفوري مع مراجعة نموذج الإجابات وتفسير كل سؤال.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] font-black text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <span>تصحيح فوري + نقاط XP</span>
                <Award className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-[#162534] border-2 border-slate-200 dark:border-slate-700/80 hover:border-purple-500 p-6 rounded-3xl shadow-md dark:shadow-xl space-y-4 text-right transition-all duration-300 hover:-translate-y-2 group relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-black shadow-sm group-hover:scale-110 transition-transform">
                📲
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-purple-600 dark:text-purple-400">الخطوة الرابعة</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">اسأل واستلم تقريرك</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                  اطرح أي استفسار تحت الفيديو ليجيبك المعلم، ويتم إرسال تقرير أدائك الموثق مباشرة إلى ولي أمرك على الواتساب.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] font-black text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                <span>متابعة واتساب للأهل</span>
                <Smartphone className="w-3.5 h-3.5 text-purple-500" />
              </div>
            </div>

          </div>

          {/* Prominent CTA below the 4 steps */}
          <div className="mt-8 text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 md:p-8 rounded-3xl text-white shadow-xl shadow-blue-600/20 space-y-4">
            <h3 className="text-xl md:text-2xl font-black">جاهز للبدء في تحقيق أعلى الدرجات؟ 🚀</h3>
            <p className="text-xs md:text-sm text-blue-100 font-bold max-w-xl mx-auto">
              سجل حسابك الآن في أقل من دقيقة وابدأ في مشاهدة الحصص والامتحانات التفاعلية مباشرة.
            </p>
            <button
              onClick={() => { setActiveTab('student-signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-8 py-3.5 rounded-2xl text-xs md:text-sm transition-all shadow-lg hover:scale-105 inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>ابدأ رحلتك التعليمية وسجل حساب جديد الآن 🎯</span>
            </button>
          </div>

        </section>

        {/* ═══ Section: المميزات والضمانات ═══ */}
        <section className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: '🔒', title: 'حماية وأمان كامل', desc: 'مشغل فيديو ضد التحميل والتسريب' },
            { icon: '🤖', title: 'مساعد ذكي 24/7', desc: 'شرح فوري لأي قاعدة أو كود' },
            { icon: '💳', title: 'شحن فوري بالـ InstaPay', desc: 'تفعيل سريع واشتراكات مريحة' },
            { icon: '🏆', title: 'أوائل الدفعة وجوائز', desc: 'لوحة شرف وتكريم للمتميزين' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-[#162534] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
              <div className="text-2xl">{item.icon}</div>
              <div className="text-xs font-black text-slate-900 dark:text-white">{item.title}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{item.desc}</div>
            </div>
          ))}
        </section>

        {/* ═══ Section: FAQ / الأسئلة الشائعة ═══ */}
        <section className="space-y-6 max-w-3xl mx-auto pt-4">
          
          <div className="text-center space-y-2">
            <h3 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white">الأسئلة الشائعة 💡</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">كل ما يدور في ذهنك عن الدراسة والتسجيل في منصة عِلم</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'إزاي أبدأ وأشترك في الحصص بعد إنشاء الحساب؟',
                a: 'بمجرد تسجيل حسابك، بتدخل على قسم المحفظة وتشحن رصيدك عبر InstaPay أو فودافون كاش، وبيتفعل حسابك فوراً وتقدر تفتح الحصة وتتفرج عليها في أي وقت ومن أي مكان.'
              },
              {
                q: 'هل مشغل الفيديو بيشتغل بدون تقطيع وعلى باقة الموبايل؟',
                a: 'نعم، مشغل الفيديو مبرمج بتقنية التكيف التلقائي مع سرعة الإنترنت، وبيقدم جودات متعددة تضمن لك المشاهدة السلسة حتى على أضعف سرعات الإنترنت وبأقل استهلاك للباقة.'
              },
              {
                q: 'إزاي ولي الأمر بيتابع درجات الطالب ومستواه؟',
                a: 'ولي الأمر يقدر يسجل دخوله برقم تليفونه أو كود الطالب من تبويب «ولي الأمر»، ويشوف تقرير شامل بنسب حضور الحصص، درجات الامتحانات والواجبات، والتقييم الدوري.'
              },
              {
                q: 'هل بقدر أسأل المعلم لو في نقطة مش فاهمها؟',
                a: 'بالتأكيد! يوجد صندوق أسئلة واستفسارات مخصص تحت كل فيديو، بجانب مساعد المعلم الذكي المتاح 24 ساعة للرد الفوري على استفسارات الكود والنحو.'
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-[#162534] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-right flex items-center justify-between font-black text-xs md:text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-amber-400 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-amber-500' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </section>

      </main>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 py-6 mt-12">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-bold">
          
          <div className="flex items-center gap-2">
            <ElmLogo variant="horizontal" className="scale-90" />
            <span>— عِلمٌ يُنتَفَعُ بِهِ</span>
          </div>

          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} لمنصة عِلم التعليمية.
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <a href="https://wa.me/201002169889" target="_blank" rel="noreferrer" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              واتساب الدعم 💬
            </a>
            <span>•</span>
            <button onClick={() => { setActiveTab('student-signup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-blue-600 dark:hover:text-amber-400 transition-colors">
              تسجيل حساب جديد
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
};
