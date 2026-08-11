import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  GraduationCap
} from 'lucide-react';

export const LoginView = () => {
  const { loginUser, registerStudent, verifyDeviceOtp } = useApp();

  const [activeTab, setActiveTab] = useState('student-login'); // 'student-login', 'student-signup', 'parent-login', 'admin-login'

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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Glow Elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Workspace Container */}
      <div className="w-full max-w-lg space-y-6 relative z-10 my-8">
        
        {/* Brand Title */}
        <div className="text-center space-y-2">
          <div
            onClick={handleLogoClick}
            className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-1.5 rounded-full text-xs font-black shadow-lg cursor-pointer select-none"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>منصة مَنارة التعليمية 💡⚡</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white">
            مرحباً بك في منصة مَنارة
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            بوابتك لتفوق اللغة العربية واحتراف البرمجة • كورسات تفاعلية وتصحيح ذكي
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-1 overflow-x-auto text-xs font-bold">
          
          <button
            onClick={() => { setActiveTab('student-login'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'student-login' ? 'bg-blue-600 text-white shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
          >
            دخول الطالب 🎓
          </button>

          <button
            onClick={() => { setActiveTab('student-signup'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'student-signup' ? 'bg-blue-600 text-white shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
          >
            حساب جديد ✨
          </button>

          <button
            onClick={() => { setActiveTab('parent-login'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'parent-login' ? 'bg-blue-600 text-white shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
          >
            ولي الأمر 👨‍👦
          </button>

          {/* Admin tab only shows after secret unlock */}
          {adminUnlocked && (
            <button
              onClick={() => { setActiveTab('admin-login'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'admin-login' ? 'bg-amber-500 text-slate-950 shadow-md font-black' : 'text-amber-400/60 hover:text-amber-400'}`}
            >
              الباشمهندس 💻
            </button>
          )}

        </div>

        {/* Secret Code Entry Modal */}
        {showSecretEntry && (
          <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-5 space-y-3 text-right animate-in fade-in">
            <p className="text-amber-400 font-black text-sm">🔐 أدخل كلمة السر للوصول لبوابة الإدارة:</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={secretCodeInput}
                onChange={(e) => setSecretCodeInput(e.target.value)}
                placeholder="كلمة السر السرية..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none dir-ltr"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (secretCodeInput === ADMIN_SECRET_GATE) {
                      setAdminUnlocked(true);
                      setActiveTab('admin-login');
                      setShowSecretEntry(false);
                      setSecretCodeInput('');
                    } else {
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
                  } else {
                    setSecretCodeInput('');
                  }
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                دخول
              </button>
              <button
                type="button"
                onClick={() => { setShowSecretEntry(false); setSecretCodeInput(''); setLogoClickCount(0); }}
                className="text-slate-500 hover:text-slate-300 text-xs font-black px-3 py-2.5"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Main Form Box */}
        <div className="bg-slate-900/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
          
          {/* Tab 1: Student Login */}
          {activeTab === 'student-login' && (
            deviceLocked ? (
              <form onSubmit={handleOtpSubmit} className="space-y-4 animate-in fade-in">
                <div className="text-right border-b border-slate-800 pb-3">
                  <h3 className="font-black text-amber-400 text-base">قفل الجهاز نشط 🔐</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-bold">هذا الحساب مسجل بجهاز آخر بالفعل. يرجى التواصل مع الدعم الفني لإلغاء قفل الجهاز وتفعيل حسابك عبر رمز تحقق (OTP).</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 mb-1">أدخل رمز التفعيل (OTP):</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="أدخل الرمز المكون من 6 أرقام..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 py-3 text-xs font-mono font-black text-amber-400 focus:ring-2 focus:ring-amber-500 outline-none text-center"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-rose-500/10 text-rose-300 border border-rose-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 btn-primary text-xs font-black py-3.5 rounded-xl justify-center shadow-lg shadow-blue-500/20"
                  >
                    تفعيل الجهاز والدخول 🚀
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDeviceLocked(false); setErrorMessage(null); }}
                    className="px-4 py-3.5 bg-slate-850 text-white rounded-xl text-xs font-black hover:bg-slate-700 transition-all border border-slate-700"
                  >
                    رجوع
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleStudentLogin} className="space-y-4 animate-in fade-in">
                <div className="text-right border-b border-slate-800 pb-3">
                  <h3 className="font-black text-white text-base">تسجيل دخول الطالب</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">ادخل بريدك الإلكتروني أو رقم موبايلك وكلمة المرور للدخول</p>
                </div>

              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">البريد الإلكتروني أو رقم الموبايل:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="مثال: ahmed@bashmohandis.com أو 01012345678"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-xs font-medium text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">كلمة المرور:</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-10 py-3 text-xs font-medium text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                  
                  {/* Password Show/Hide Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-3 text-slate-500 hover:text-white transition-all"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-rose-500/10 text-rose-300 border border-rose-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-primary text-xs font-black py-3.5 rounded-xl justify-center shadow-lg shadow-blue-500/20"
              >
                تسجيل الدخول للمنصة 🚀
              </button>
            </form>
            )
          )}

          {/* Tab 2: Student Sign Up */}
          {activeTab === 'student-signup' && (
            <form onSubmit={handleStudentSignup} className="space-y-4 animate-in fade-in">
              <div className="text-right border-b border-slate-800 pb-3">
                <h3 className="font-black text-white text-base">إنشاء حساب طالب جديد</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">ادخل بياناتك كاملة للبدء في تعلم البرمجة</p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">الاسم الكامل (ثلاثي):</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="أحمد محمود العبد"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs font-medium text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-300 mb-1">الصف الدراسي:</label>
                  <select
                    value={signupGrade}
                    onChange={(e) => setSignupGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="3sec">الصف الثالث الثانوي (3 ثانوي)</option>
                    <option value="2sec">الصف الثاني الثانوي</option>
                    <option value="1sec">الصف الأول الثانوي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 mb-1">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="student@mail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-medium text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-300 mb-1">موبايل الطالب:</label>
                  <input
                    type="text"
                    required
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 mb-1">موبايل ولي الأمر:</label>
                  <input
                    type="text"
                    required
                    value={signupParentPhone}
                    onChange={(e) => setSignupParentPhone(e.target.value)}
                    placeholder="01198765432"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-300 mb-1">كلمة المرور:</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={signupPass}
                      onChange={(e) => setSignupPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-3 pl-8 py-2.5 text-xs font-medium text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute left-2.5 top-3 text-slate-500 hover:text-white"
                    >
                      {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-300 mb-1">تأكيد كلمة المرور:</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={signupConfirmPass}
                      onChange={(e) => setSignupConfirmPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-3 pl-8 py-2.5 text-xs font-medium text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute left-2.5 top-3 text-slate-500 hover:text-white"
                    >
                      {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-rose-500/10 text-rose-300 border border-rose-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-primary text-xs font-black py-3.5 rounded-xl justify-center shadow-lg shadow-blue-500/20"
              >
                إنشاء الحساب والدخول التلقائي 🚀
              </button>
            </form>
          )}

          {/* Tab 3: Parent Login */}
          {activeTab === 'parent-login' && (
            <form onSubmit={handleParentLogin} className="space-y-4 animate-in fade-in">
              <div className="text-right border-b border-slate-800 pb-3">
                <h3 className="font-black text-white text-base">دخول أولياء الأمور</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">متابعة درجات الطالب وتقارير أداء كورس العربي والبرمجة</p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">رقم هاتف ولي الأمر:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={parentPhoneInput}
                    onChange={(e) => setParentPhoneInput(e.target.value)}
                    placeholder="أدخل رقم هاتفك كولي أمر..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <Smartphone className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">اسم الطالب أو كوده (مثل 1001 أو أحمد محمود):</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={parentStudentCode}
                    onChange={(e) => setParentStudentCode(e.target.value)}
                    placeholder="ادخل اسم الطالب أو كوده..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-3 text-xs font-bold text-amber-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <Users className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {errorMessage && (
                <div className="bg-rose-500/10 text-rose-300 border border-rose-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-primary text-xs font-black py-3.5 rounded-xl justify-center shadow-lg shadow-blue-500/20"
              >
                عرض تقرير الطالب 📊
              </button>
            </form>
          )}

          {/* Tab 4: Admin Login */}
          {activeTab === 'admin-login' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              setErrorMessage(null);
              const res = loginUser('admin', { adminCode, adminIdentity: selectedAdminIdentity });
              if (!res.success) setErrorMessage(res.message);
            }} className="space-y-4 animate-in fade-in">
              <div className="text-right border-b border-slate-800 pb-3">
                <h3 className="font-black text-amber-400 text-base">لوحة التحكم الإدارية (الأدمن) 🔐</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">اختر حساب المحاضر/المعلم وأدخل كلمة السر</p>
              </div>

              {/* Admin Identity Selection Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-300">حدد حساب المحاضر 👤:</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedAdminIdentity('eng_nour')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-right space-y-1 ${selectedAdminIdentity === 'eng_nour' ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/30' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>💻</span>
                      <span>مهندس نور</span>
                    </div>
                    <div className="text-[10px] text-blue-300 font-bold">محاضر البرمجة وعلوم الحاسب</div>
                  </div>

                  <div
                    onClick={() => setSelectedAdminIdentity('mr_sayed')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-right space-y-1 ${selectedAdminIdentity === 'mr_sayed' ? 'bg-amber-600/20 border-amber-500 ring-2 ring-amber-500/30' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>📖</span>
                      <span>مستر سيد عبد العاطي</span>
                    </div>
                    <div className="text-[10px] text-amber-300 font-bold">معلم اللغة العربية</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">كلمة المرور الرسمية:</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="أدخل كلمة السر 0123456"
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-xl pr-10 pl-10 py-3 text-xs font-mono font-black text-amber-400 focus:ring-2 focus:ring-amber-500 outline-none dir-ltr"
                  />
                  <ShieldCheck className="w-4 h-4 text-amber-500 absolute right-3.5 top-3.5" />

                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-3 text-slate-500 hover:text-amber-400"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-rose-500/10 text-rose-300 border border-rose-500/30 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-accent text-xs font-black py-3.5 rounded-xl justify-center shadow-lg shadow-amber-500/20"
              >
                دخول بحساب {selectedAdminIdentity === 'mr_sayed' ? 'مستر سيد عبد العاطي' : 'مهندس نور'} 🚀
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
