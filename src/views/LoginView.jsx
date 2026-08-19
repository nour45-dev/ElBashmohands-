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

  // Active Tab: 'student-login' | 'student-signup' | 'parent-login'
  const [activeTab, setActiveTab] = useState('student-login');

  // Secret admin unlock (click logo 5 times rapidly)
  const [logoClickCount, setLogoClickCount] = useState(0);
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

  // Student / Teacher Login Fields
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

      {/* ═══ Main Split Hero Section ═══ */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 relative z-10 space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Right Side: The Auth Card */}
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

            {/* Segmented Tab Switcher (Without Admin tab) */}
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
                        if (secretCodeInput === ADMIN_SECRET_GATE || secretCodeInput === 'nour2026' || secretCodeInput === 'sayed2026') {
                          loginUser('student', { phoneInput: '01002169889', passInput: secretCodeInput });
                          setShowSecretEntry(false);
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      loginUser('student', { phoneInput: '01002169889', passInput: secretCodeInput });
                      setShowSecretEntry(false);
                    }}
                    className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black"
                  >
                    دخول
                  </button>
                </div>
              </div>
            )}

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-black flex items-center gap-2 animate-in fade-in shadow-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl text-xs font-black flex items-center gap-2 animate-in fade-in shadow-xs">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 1. Student / Teacher Login Form */}
            {activeTab === 'student-login' && (
              <div className="bg-white dark:bg-[#162534] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">تسجيل الدخول للمنصة 🚀</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">أدخل رقم الهاتف أو كود الحساب وكلمة المرور للمتابعة.</p>
                </div>

                {!deviceLocked ? (
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                        رقم الموبايل أو كود الحساب 📱:
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="01002169889 أو كود الحساب"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr text-right"
                        />
                        <Smartphone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                        كلمة المرور 🔒:
                      </label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          value={passInput}
                          onChange={(e) => setPassInput(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr text-right"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="text-slate-400 hover:text-slate-600 absolute left-4 top-3.5"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                    >
                      <span>دخول الحساب 🔑</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-400 font-bold">
                      ⚠️ الحساب مقيد بهذا الجهاز. تم إرسال رمز تحقق OTP.
                    </div>
                    <div>
                      <label className="block text-xs font-black mb-1.5">رمز التحقق OTP:</label>
                      <input
                        type="text"
                        required
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="أدخل رمز الـ OTP..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 rounded-xl p-3 text-center font-mono font-black"
                      />
                    </div>
                    <button type="submit" className="w-full bg-amber-500 text-slate-950 font-black py-3 rounded-xl">
                      تأكيد الجهاز والدخول
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 2. Student Signup Form */}
            {activeTab === 'student-signup' && (
              <div className="bg-white dark:bg-[#162534] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">إنشاء حساب طالب جديد ✨</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">سجل بياناتك للانضمام فوراً ومتابعة الحصص والامتحانات.</p>
                </div>

                <form onSubmit={handleStudentSignup} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">اسم الطالب الثلاثي 👤:</label>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="مثال: محمد أحمد علي"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">رقم هاتف الطالب 📱:</label>
                      <input
                        type="tel"
                        required
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="01012345678"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">رقم هاتف ولي الأمر 👨‍👦:</label>
                      <input
                        type="tel"
                        required
                        value={signupParentPhone}
                        onChange={(e) => setSignupParentPhone(e.target.value)}
                        placeholder="01112345678"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني ✉️:</label>
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">الصف الدراسي 🎓:</label>
                      <select
                        value={signupGrade}
                        onChange={(e) => setSignupGrade(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="3sec">الصف الثالث الثانوي (تانوية عامة)</option>
                        <option value="2sec">الصف الثاني الثانوي</option>
                        <option value="1sec">الصف الأول الثانوي</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">كلمة المرور 🔒:</label>
                      <input
                        type="password"
                        required
                        value={signupPass}
                        onChange={(e) => setSignupPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">تأكيد كلمة المرور 🔒:</label>
                      <input
                        type="password"
                        required
                        value={signupConfirmPass}
                        onChange={(e) => setSignupConfirmPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr text-right"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <span>إنشاء الحساب وبدء التعلم 🚀</span>
                  </button>
                </form>
              </div>
            )}

            {/* 3. Parent Login Form */}
            {activeTab === 'parent-login' && (
              <div className="bg-white dark:bg-[#162534] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">بوابة متابعة ولي الأمر 👨‍👦</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">متابعة درجات الامتحانات والواجبات ونسب الحضور للطالب.</p>
                </div>

                <form onSubmit={handleParentLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                      رقم هاتف ولي الأمر المسجل 📱:
                    </label>
                    <input
                      type="tel"
                      required
                      value={parentPhoneInput}
                      onChange={(e) => setParentPhoneInput(e.target.value)}
                      placeholder="01112345678"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                      كود الطالب أو اسمه 👤:
                    </label>
                    <input
                      type="text"
                      required
                      value={parentStudentCode}
                      onChange={(e) => setParentStudentCode(e.target.value)}
                      placeholder="مثال: 3001 أو محمد أحمد"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-right"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <span>دخول لوحة ولي الأمر 📊</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Left Side: 3D Interactive Floating Graphic Scene */}
          <div className="lg:col-span-5 hidden lg:block order-1 lg:order-2">
            <HeroFloatingScene />
          </div>

        </div>

      </main>

    </div>
  );
};
