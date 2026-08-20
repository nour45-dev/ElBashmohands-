import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const formatVideoEmbedUrl = (url) => {
  if (!url) return '';
  let cleanUrl = url.trim();

  // If user pasted an entire iframe tag, extract the src
  if (cleanUrl.startsWith('<iframe') && cleanUrl.includes('src=')) {
    const match = cleanUrl.match(/src=["']([^"']+)["']/);
    if (match && match[1]) cleanUrl = match[1];
  }

  // 1. YouTube Live & Videos (watch, youtu.be, live, shorts, embed)
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    let videoId = '';
    if (cleanUrl.includes('youtube.com/live/')) {
      videoId = cleanUrl.split('youtube.com/live/')[1]?.split('?')[0]?.split('&')[0];
    } else if (cleanUrl.includes('v=')) {
      videoId = cleanUrl.split('v=')[1]?.split('&')[0];
    } else if (cleanUrl.includes('youtu.be/')) {
      videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
    } else if (cleanUrl.includes('shorts/')) {
      videoId = cleanUrl.split('shorts/')[1]?.split('?')[0]?.split('&')[0];
    } else if (cleanUrl.includes('embed/')) {
      videoId = cleanUrl.split('embed/')[1]?.split('?')[0]?.split('&')[0];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    }
  }

  // 2. Facebook Live & Video Player
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=false&autoplay=true`;
  }

  // 3. Vimeo Player
  if (cleanUrl.includes('vimeo.com/')) {
    const vimeoId = cleanUrl.split('vimeo.com/')[1]?.split('?')[0]?.split('#')[0];
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
    }
  }

  return cleanUrl;
};

export const AppProvider = ({ children }) => {
  const [currentGrade, setCurrentGrade] = useState('3sec');
  const [userRole, setUserRole] = useState('student');
  const [adminIdentity, setAdminIdentity] = useState('eng_nour');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  // Core Data Lists loaded from DB API
  const [studentsDB, setStudentsDB] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [couponsDB, setCouponsDB] = useState([]);
  const [paymentRequestsDB, setPaymentRequestsDB] = useState([]);
  const [videoQuestions, setVideoQuestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [examAttempts, setExamAttempts] = useState({});

  // Local helper UI logs
  const [whatsappLogs, setWhatsappLogs] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [activeWhatsAppModal, setActiveWhatsAppModal] = useState(null);

  // Live Broadcast & Virtual Classroom State
  const [liveSessionsDB, setLiveSessionsDB] = useState([]);
  const [activeLiveSession, setActiveLiveSession] = useState(null);

  // Theme states (Light / Dark) - Default: Light Mode
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('manara_theme');
    return saved !== null ? saved : 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-mode');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light-mode');
      root.classList.add('dark');
    }
    localStorage.setItem('manara_theme', theme);
  }, [theme]);

  // 1. Session check on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setUserRole(data.role);
          if (data.role === 'admin') {
            setAdminIdentity(data.identity);
            fetchAdminData();
          } else {
            setCurrentStudent(data.user);
            setCurrentGrade(data.user.grade || '3sec');
            fetchStudentData();
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoadingSession(false);
      }
    };
    checkSession();
    fetchPublicData();
  }, [isAuthenticated, userRole]);

  // Load public data (lessons list, notifications, live sessions)
  const fetchPublicData = async () => {
    try {
      const resLessons = await fetch('/api/lessons');
      if (resLessons.ok) {
        const data = await resLessons.json();
        setLessons(data);
      }
      const resNotifs = await fetch('/api/notifications');
      if (resNotifs.ok) {
        const data = await resNotifs.json();
        const readIds = JSON.parse(localStorage.getItem('read_notif_ids') || '[]');
        const processed = data.map(n => ({
          ...n,
          unread: readIds.includes(n.id) ? false : (n.unread ?? false)
        }));
        setNotifications(processed);
      }
      const resLive = await fetch('/api/live');
      if (resLive.ok) {
        const data = await resLive.json();
        setLiveSessionsDB(data);
      }
    } catch (err) {
      console.error('Failed to fetch public data:', err);
    }
  };

  // Real-time automatic background synchronization for live broadcasts & notifications
  useEffect(() => {
    const liveSyncInterval = setInterval(async () => {
      try {
        const [resLive, resNotif] = await Promise.all([
          fetch('/api/live'),
          fetch('/api/notifications')
        ]);
        if (resLive.ok) {
          const liveData = await resLive.json();
          setLiveSessionsDB(liveData);
        }
        if (resNotif.ok) {
          const notifData = await resNotif.json();
          const readIds = JSON.parse(localStorage.getItem('read_notif_ids') || '[]');
          setNotifications(notifData.map(n => ({
            ...n,
            unread: readIds.includes(n.id) ? false : (n.unread ?? false)
          })));
        }
      } catch (e) {}
    }, 3500);

    return () => clearInterval(liveSyncInterval);
  }, []);

  const markNotificationAsRead = (id) => {
    try {
      const readIds = JSON.parse(localStorage.getItem('read_notif_ids') || '[]');
      if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem('read_notif_ids', JSON.stringify(readIds));
      }
    } catch (e) {
      console.error(e);
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAllNotificationsAsRead = () => {
    try {
      const allIds = notifications.map(n => n.id);
      localStorage.setItem('read_notif_ids', JSON.stringify(allIds));
    } catch (e) {
      console.error(e);
    }
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Load student-specific data
  const fetchStudentData = async () => {
    try {
      const resQuestions = await fetch('/api/questions', { credentials: 'include' });
      if (resQuestions.ok) {
        const data = await resQuestions.json();
        setVideoQuestions(data);
      }
      const resExams = await fetch('/api/exams', { credentials: 'include' });
      if (resExams.ok) {
        const data = await resExams.json();
        setExamHistory(data);
        // Build attempts mapping
        const attemptsMap = {};
        data.forEach(ex => {
          if (ex.quizId) attemptsMap[ex.quizId] = ex;
        });
        setExamAttempts(attemptsMap);
      }
    } catch (err) {
      console.error('Failed to load student data:', err);
    }
  };

  // Load admin-only tables
  const fetchAdminData = async () => {
    try {
      const resStudents = await fetch('/api/students', { credentials: 'include' });
      if (resStudents.ok) {
        const data = await resStudents.json();
        setStudentsDB(data);
      }
      const resPayments = await fetch('/api/payments', { credentials: 'include' });
      if (resPayments.ok) {
        const data = await resPayments.json();
        setPaymentRequestsDB(data);
      }
      const resCoupons = await fetch('/api/coupons', { credentials: 'include' });
      if (resCoupons.ok) {
        const data = await resCoupons.json();
        setCouponsDB(data);
      }
      const resQuestions = await fetch('/api/questions', { credentials: 'include' });
      if (resQuestions.ok) {
        const data = await resQuestions.json();
        setVideoQuestions(data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  // Student Registration Handler
  const registerStudent = async ({ name, email, phone, parentPhone, grade, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      return { success: false, message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين!' };
    }

    try {
      let devId = localStorage.getItem('manara_device_uuid');
      if (!devId) {
        devId = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now();
        localStorage.setItem('manara_device_uuid', devId);
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, parentPhone, grade, password, deviceId: devId }),
        credentials: 'include'
      });

      if (!res.ok) {
        const errData = await res.json();
        return { success: false, message: errData.error || 'فشلت عملية إنشاء الحساب.' };
      }

      const data = await res.json();
      setIsAuthenticated(true);
      setUserRole('student');
      setCurrentStudent(data.user);
      setCurrentGrade(data.user.grade || '3sec');
      
      return { success: true, studentCode: data.user.code, message: `تم إنشاء حسابك بنجاح! كود الطالب الخاص بك هو: ${data.user.code}` };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  // Login Handler
  const loginUser = async (role, credentials) => {
    try {
      const bodyCredentials = { ...credentials };
      if (role === 'student') {
        let devId = localStorage.getItem('manara_device_uuid');
        if (!devId) {
          devId = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now();
          localStorage.setItem('manara_device_uuid', devId);
        }
        bodyCredentials.deviceId = devId;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, credentials: bodyCredentials }),
        credentials: 'include'
      });

      if (!res.ok) {
        const errData = await res.json();
        if (res.status === 403 && errData.code === 'DEVICE_LOCKED') {
          return { success: false, isLocked: true, message: errData.error };
        }
        return { success: false, message: errData.error || 'بيانات الدخول غير صحيحة.' };
      }

      const data = await res.json();
      setIsAuthenticated(true);
      setUserRole(data.role);

      if (data.role === 'admin') {
        setAdminIdentity(data.identity);
        await fetchAdminData();
        return { success: true, message: `أهلاً وسهلاً بك يا ${data.name}! تم تسجيل الدخول.` };
      } else if (data.role === 'parent') {
        setCurrentStudent(data.matchedStudent);
        await fetchStudentData();
        return { success: true, matchedStudent: data.matchedStudent, message: `تم الوصول لحساب الطالب: ${data.matchedStudent.name}` };
      } else {
        setCurrentStudent(data.user);
        setCurrentGrade(data.user.grade || '3sec');
        await fetchStudentData();
        return { success: true, message: `أهلاً بعودتك يا ${data.user.name}` };
      }
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const verifyDeviceOtp = async (phoneOrCode, otp) => {
    try {
      let devId = localStorage.getItem('manara_device_uuid');
      if (!devId) {
        devId = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now();
        localStorage.setItem('manara_device_uuid', devId);
      }

      const res = await fetch('/api/auth/verify-device-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrCode, otp, deviceId: devId }),
        credentials: 'include'
      });

      if (!res.ok) {
        const errData = await res.json();
        return { success: false, message: errData.error || 'رمز OTP غير صحيح أو منتهي الصلاحية.' };
      }

      const data = await res.json();
      setIsAuthenticated(true);
      setUserRole(data.role);
      setCurrentStudent(data.user);
      setCurrentGrade(data.user.grade || '3sec');
      await fetchStudentData();
      return { success: true, message: `تم تفعيل الجهاز الجديد والدخول بنجاح! أهلاً بك يا ${data.user.name}` };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  // Logout Handler
  const logoutUser = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    setIsAuthenticated(false);
    setUserRole('student');
    setCurrentStudent(null);
    setExamHistory([]);
    setExamAttempts({});
  };

  const switchGrade = (gradeId) => {
    if (userRole === 'admin') {
      setCurrentGrade(gradeId);
    } else {
      setCurrentGrade(currentStudent?.grade || gradeId);
    }
  };

  // Submit Payment Recharge Request (Requires Admin Approval)
  const submitPaymentRequest = async ({ amount, method, refNumber, proofImage }) => {
    if (!refNumber || refNumber.length < 4) {
      return { success: false, message: 'يرجى إدخال مرجع عملية التحويل بشكل صحيح.' };
    }

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method, refNumber, proofImage }),
        credentials: 'include'
      });

      if (!res.ok) {
        const errData = await res.json();
        return { success: false, message: errData.error || 'فشل إرسال طلب الدفع.' };
      }

      const newRequest = await res.json();
      setPaymentRequestsDB(prev => [newRequest, ...prev]);

      return { 
        success: true, 
        message: 'تم إرسال طلب الشحن وصورة الإيصال بنجاح للإدارة! سيتم إضافة الرصيد فور مراجعة التحويل ⏳' 
      };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  // Admin Approve Payment Request
  const adminApprovePayment = async (requestId) => {
    const req = paymentRequestsDB.find(r => r.id === requestId);
    if (!req) return;

    try {
      const res = await fetch(`/api/payments/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
        credentials: 'include'
      });

      if (res.ok) {
        setStudentsDB(prev => prev.map(st => {
          if (st.id === req.studentId) {
            const newBalance = st.walletBalance + req.amount;
            return { ...st, walletBalance: newBalance };
          }
          return st;
        }));
        setPaymentRequestsDB(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));

        triggerWhatsAppSend({
          isFullParentReport: false,
          studentName: req.studentName,
          parentPhone: req.parentPhone,
          studentPhone: req.studentPhone,
          title: `تأكيد موافقة شحن رصيد بقيمة ${req.amount} ج.م`
        }, 'parent');

        triggerSmsSend({
          title: `تم تأكيد إضافة ${req.amount} جنيه لرصيدك بمحفظة المعلم`,
          studentName: req.studentName,
          parentPhone: req.parentPhone,
          studentPhone: req.studentPhone
        }, 'student');
      }
    } catch (err) {
      console.error('Approve payment failed:', err);
    }
  };

  // Admin Reject Payment Request
  const adminRejectPayment = async (requestId, reason = 'بيانات التحويل أو صورة الإيصال غير واضحة.') => {
    try {
      const res = await fetch(`/api/payments/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
        credentials: 'include'
      });

      if (res.ok) {
        setPaymentRequestsDB(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected', rejectReason: reason } : r));
      }
    } catch (err) {
      console.error('Reject payment failed:', err);
    }
  };

  // Admin Lesson Edit Handler
  const adminUpdateLesson = async (lessonId, updatedData) => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
        credentials: 'include'
      });

      if (res.ok) {
        const updated = await res.json();
        setLessons(prev => prev.map(les => les.id === lessonId ? updated : les));
      }
    } catch (err) {
      console.error('Update lesson failed:', err);
    }
  };

  // Admin Coupon Delete Handler
  const adminDeleteCoupon = async (couponId) => {
    try {
      const res = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setCouponsDB(prev => prev.filter(c => c.id !== couponId));
      }
    } catch (err) {
      console.error('Delete coupon failed:', err);
    }
  };

  // Admin Student Management: Edit Student
  const adminUpdateStudent = async (studentId, updatedData) => {
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
        credentials: 'include'
      });

      if (res.ok) {
        const updated = await res.json();
        setStudentsDB(prev => prev.map(st => st.id === studentId ? updated : st));
        if (currentStudent && currentStudent.id === studentId) {
          setCurrentStudent(updated);
        }
      }
    } catch (err) {
      console.error('Update student failed:', err);
    }
  };

  // Admin Student Management: Delete Student
  const adminDeleteStudent = async (studentId) => {
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setStudentsDB(prev => prev.filter(st => st.id !== studentId));
      }
    } catch (err) {
      console.error('Delete student failed:', err);
    }
  };

  // Manual Recharge via Code (fallback - purely clientside or updates student balance)
  const rechargeWallet = async (codeOrAmount, paymentMethod = 'code') => {
    let amount = 0;
    const cleanCode = (codeOrAmount || '').trim().toUpperCase();
    if (cleanCode.includes('50') || cleanCode === 'SAYED50') amount = 50;
    else if (cleanCode.includes('100') || cleanCode === 'SAYED100') amount = 100;
    else if (cleanCode.includes('200') || cleanCode === 'SAYED200') amount = 200;
    else if (cleanCode.length >= 6) amount = 50;
    else {
      return { success: false, message: 'كود الشحن غير صحيح أو مستعمل مسبقاً.' };
    }

    try {
      const newBalance = (currentStudent.walletBalance || 0) + amount;
      const res = await fetch(`/api/students/${currentStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletBalance: newBalance }),
        credentials: 'include'
      });

      if (res.ok) {
        const updated = await res.json();
        setCurrentStudent(updated);
        return { success: true, amount, message: `تم شحن ${amount} جنيه بنجاح إلى محفظتك! 🎟️` };
      }
      return { success: false, message: 'فشلت عملية الشحن التلقائية.' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  // Purchase Monthly (8 Video Credits) or Annual Subscription
  const purchaseSubscription = async (planType, price) => {
    if (currentStudent.walletBalance < price) {
      return { success: false, message: `رصيد المحفظة لا يكفي الاشتراك (${price} ج.م). يرجى شحن المحفظة أولاً.` };
    }

    const isMonthly = planType === 'شهري';
    const newCredits = isMonthly ? 8 : 999;
    const newBalance = currentStudent.walletBalance - price;

    try {
      const res = await fetch(`/api/students/${currentStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletBalance: newBalance,
          subscriptionStatus: 'active',
          subscriptionType: planType,
          monthlyCreditsLeft: newCredits
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const updated = await res.json();
        setCurrentStudent(updated);
        return { 
          success: true, 
          message: isMonthly 
            ? `تم تفعيل الاشتراك الشهري بنجاح! تم منحك رصيد 8 حصص اختيارية تختار فتحها بنفسك 🎓`
            : `تم تفعيل الاشتراك السنوي الشامل بنجاح! تم فتح كافة حصص الصف كاملاً 🌟`
        };
      }
      return { success: false, message: 'فشل تفعيل الاشتراك.' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  // Unlock Lesson via Wallet, Coupon, OR 1 Monthly Credit (out of 8)
  const unlockLesson = async (lessonId, price, useMonthlyCredit = false) => {
    if (useMonthlyCredit) {
      if ((currentStudent.monthlyCreditsLeft || 0) <= 0) {
        return { success: false, message: 'استنفذت رصيد الـ 8 حصص المتاحة باشتراكك الشهري.' };
      }

      const newCredits = currentStudent.monthlyCreditsLeft - 1;

      try {
        const resUser = await fetch(`/api/students/${currentStudent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ monthlyCreditsLeft: newCredits }),
          credentials: 'include'
        });

        if (resUser.ok) {
          const updatedUser = await resUser.json();
          setCurrentStudent(updatedUser);

          // Update lesson status in state/db
          setLessons(prev => prev.map(les => les.id === lessonId ? { ...les, isUnlocked: true } : les));
          return { success: true, message: `تم فتح الحصة باستخدام 1 حصة من اشتراكك الشهري! (متبقي: ${newCredits}/8 حصص)` };
        }
      } catch (e) {
        return { success: false, message: 'خطأ في الاتصال بالخادم.' };
      }
    }

    if (currentStudent.walletBalance < price) {
      return { success: false, message: 'رصيد المحفظة لا يكفي. يرجى شحن المحفظة أولاً.' };
    }

    const newBalance = currentStudent.walletBalance - price;

    try {
      const resUser = await fetch(`/api/students/${currentStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletBalance: newBalance }),
        credentials: 'include'
      });

      if (resUser.ok) {
        const updatedUser = await resUser.json();
        setCurrentStudent(updatedUser);
        setLessons(prev => prev.map(les => les.id === lessonId ? { ...les, isUnlocked: true } : les));
        return { success: true, message: 'تم فتح الحصة بنجاح! مشاهدة ممتعة.' };
      }
    } catch (e) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  // Parent WhatsApp Report Generator
  const getParentFullWhatsAppReport = (std = currentStudent) => {
    const lastExam = examHistory[0] || { quizTitle: 'اختبار البرمجة الموثق', score: 5, total: 5, percentage: 100 };

    return `📌 *تقرير متابعة ولي الأمر الموثق - منصة منصة عِلم التعليمية* 💻
━━━━━━━━━━━━━━━━━━━━
👤 *اسم الطالب:* ${std.name}
🆔 *كود الطالب:* ${std.code}
🎓 *الصف الدراسي:* ${std.gradeName}
📊 *حالة الاشتراك:* ${std.subscriptionType || 'مجاني'} (متبقي: ${std.monthlyCreditsLeft || 0} حصص)
💰 *رصيد المحفظة:* ${std.walletBalance} جنيه
🏆 *الترتيب في أوائل الدفعة:* المركز #${std.rank || 1}
📝 *آخر امتحان:* ${lastExam.quizTitle} (${lastExam.score} من ${lastExam.total} - ${lastExam.percentage}%)

💡 *ملاحظة المعلم:* الطالب متميز جداً وملتزم بكورسات وتطبيقات البرمجة العملية.

🔗 لمتابعة المحتوى والدروس على منصة المعلم:
https://elm.up.railway.app`;
  };

  const getWhatsAppMsgText = (payload, recipient = 'parent') => {
    if (!payload) return '';
    if (payload.isFullParentReport) {
      return getParentFullWhatsAppReport(currentStudent);
    }
    return `📌 *إشعار من منصة منصة عِلم التعليمية*
👤 *الطالب:* ${payload.studentName || currentStudent?.name}
🎓 *الصف:* ${payload.gradeName || currentStudent?.gradeName}
📝 *الموضوع:* ${payload.examTitle || payload.title || 'تقرير البرمجة الموثق'}

🔗 https://elm.up.railway.app`;
  };

  const triggerWhatsAppSend = (payload, targetRecipient = 'parent') => {
    const targetPhone = targetRecipient === 'parent' ? (payload.parentPhone || currentStudent?.parentPhone) : (payload.studentPhone || currentStudent?.phone);
    const recipientLabel = targetRecipient === 'parent' ? 'ولي الأمر' : 'الطالب';
    
    const msgText = getWhatsAppMsgText(payload, targetRecipient);

    const encodedMsg = encodeURIComponent(msgText);
    const formattedPhone = (targetPhone || '').replace(/\s/g, '').startsWith('0') ? '2' + (targetPhone || '').replace(/\s/g, '') : (targetPhone || '').replace(/\s/g, '');
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;

    setWhatsappLogs(prev => [
      {
        id: 'wa_' + Date.now(),
        timestamp: new Date().toLocaleString('ar-EG'),
        studentName: payload.studentName || currentStudent?.name,
        phoneSentTo: `${targetPhone} (${recipientLabel})`,
        examTitle: payload.examTitle || 'تقرير ولي الأمر الشامل',
        scoreText: 'WhatsApp ✅',
        status: 'تم التوجيه للواتساب ✅'
      },
      ...prev
    ]);

    return { whatsappUrl, msgText };
  };

  const triggerSmsSend = (payload, targetRecipient = 'parent') => {
    const targetPhone = targetRecipient === 'parent'
      ? (payload.parentPhone || currentStudent?.parentPhone || '')
      : (payload.studentPhone || currentStudent?.phone || '');
    const recipientLabel = targetRecipient === 'parent' ? 'ولي الأمر' : 'الطالب';

    let msgText = '';
    if (payload.isFullParentReport) {
      msgText = `📌 تقرير منصة المعلم\nالطالب: ${currentStudent?.name}\nالاشتراك: ${currentStudent?.subscriptionType || 'مجاني'}\nالرصيد: ${currentStudent?.walletBalance || 0} ج\nالنقاط: ${currentStudent?.points || 0}`;
    } else {
      msgText = `📌 تنبيه من منصة منصة عِلم التعليمية\n${payload.examTitle || payload.title || 'إشعار جديد'}\nالطالب: ${payload.studentName || currentStudent?.name || ''}`;
    }

    const formattedPhone = targetPhone.replace(/\s/g, '').startsWith('0') ? '2' + targetPhone.replace(/\s/g, '') : targetPhone.replace(/\s/g, '');
    const whatsappFallbackUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msgText)}`;

    setSmsLogs(prev => [
      {
        id: 'sms_' + Date.now(),
        timestamp: new Date().toLocaleString('ar-EG'),
        studentName: payload.studentName || currentStudent?.name || '',
        phoneSentTo: `${targetPhone} (${recipientLabel})`,
        messageSnippet: msgText,
        status: 'جاهز للإرسال ✅'
      },
      ...prev
    ]);

    return { 
      phone: targetPhone,
      formattedPhone,
      msgText,
      whatsappFallbackUrl,
      smsUrl: `sms:${targetPhone}?body=${encodeURIComponent(msgText)}`
    };
  };

  const addNotification = async ({ targetGrade, title, body, subject }) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetGrade, title, body, subject }),
        credentials: 'include'
      });

      if (res.ok) {
        const newNote = await res.json();
        setNotifications(prev => [newNote, ...prev]);
        return newNote;
      }
    } catch (err) {
      console.error('Add notification failed:', err);
    }
  };

  const broadcastNewLesson = (lessonData) => {
    const gradeLabel = lessonData.grade === '3sec' ? 'ثالثة ثانوي' : lessonData.grade === '2sec' ? 'ثاني ثانوي' : 'أول ثانوي';
    const priceLabel = lessonData.price === 0 ? 'مجاناً 🎁' : `${lessonData.price} ج.م`;

    const targetStudents = studentsDB.filter(st =>
      (st.phone || st.parentPhone) && (lessonData.grade === 'all' || st.grade === lessonData.grade)
    );

    const broadcastLinks = targetStudents.map(st => {
      const targetPhone = st.phone || st.parentPhone;
      const msg = `🎉 *حصة جديدة على منصة المعلم!*\n\n📚 *${lessonData.title}*\n📖 المادة: ${lessonData.subject || 'برمجة'}\n🎓 الصف: ${gradeLabel}\n💰 السعر: ${priceLabel}\n\n🔗 ادخل المنصة وشاهد الحصة الآن!\n📱 للتواصل: 01002169889`;
      const formatted = (targetPhone || '').replace(/\s/g, '').startsWith('0') ? '2' + (targetPhone || '').replace(/\s/g, '') : (targetPhone || '').replace(/\s/g, '');
      return {
        studentName: st.name,
        phone: targetPhone,
        whatsappUrl: `https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`
      };
    });

    return broadcastLinks;
  };

  const applyCoupon = (couponCode, lessonPrice) => {
    const cleanCode = (couponCode || '').trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'يرجى كتابة كود الكوبون.' };

    const coupon = couponsDB.find(c => c.code === cleanCode && c.active);
    if (!coupon) return { success: false, message: 'كود الكوبون غير صالح.' };

    if (coupon.usedCount >= coupon.maxUses) return { success: false, message: 'انتهت استخدامات هذا الكوبون.' };

    let finalPrice = lessonPrice;
    let discountText = '';

    if (coupon.type === 'free') {
      finalPrice = 0;
      discountText = 'مجاني 100% 🎁';
    } else if (coupon.type === 'percent') {
      const discount = Math.round((lessonPrice * coupon.value) / 100);
      finalPrice = Math.max(0, lessonPrice - discount);
      discountText = `خصم ${coupon.value}% (${discount} ج.م)`;
    } else if (coupon.type === 'fixed') {
      finalPrice = Math.max(0, lessonPrice - coupon.value);
      discountText = `خصم بقيمة ${coupon.value} ج.م`;
    }

    return {
      success: true,
      couponType: coupon.type,
      discountText,
      finalPrice,
      message: `تم تطبيق الكوبون بنجاح! (${discountText})`
    };
  };

  const adminCreateCoupon = async (couponData) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData),
        credentials: 'include'
      });

      if (res.ok) {
        const newCoupon = await res.json();
        setCouponsDB(prev => [newCoupon, ...prev]);
        return newCoupon;
      }
    } catch (err) {
      console.error('Create coupon failed:', err);
    }
  };

  const addStudentQuestion = async (lessonId, questionText) => {
    if (!questionText.trim()) return;
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, questionText }),
        credentials: 'include'
      });

      if (res.ok) {
        const newQ = await res.json();
        setVideoQuestions(prev => [newQ, ...prev]);
      }
    } catch (err) {
      console.error('Add question failed:', err);
    }
  };

  const adminReplyToQuestion = async (questionId, replyText) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/questions/${questionId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText }),
        credentials: 'include'
      });

      if (res.ok) {
        setVideoQuestions(prev => prev.map(q => {
          if (q.id === questionId) {
            return {
              ...q,
              replyText: replyText.trim(),
              repliedAt: 'الآن',
              status: 'answered'
            };
          }
          return q;
        }));
      }
    } catch (err) {
      console.error('Reply question failed:', err);
    }
  };

  const recordExamResult = async (quiz, userAnswers) => {
    if (examAttempts[quiz.id]) {
      return { resultRecord: examAttempts[quiz.id], waPayload: null, alreadyAttempted: true };
    }

    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const total = quiz.questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const pointsEarned = percentage >= 80 ? (quiz.rewardPoints || 50) : 25;

    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          lessonId: quiz.lessonId,
          quizTitle: quiz.title,
          score: correctCount,
          total,
          percentage,
          pointsEarned,
          passed: percentage >= 60,
          status: percentage >= 80 ? 'ممتاز 🌟' : percentage >= 60 ? 'جيد 👍' : 'يحتاج مراجعة ❌',
          userAnswers,
          questions: quiz.questions
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const resultRecord = await res.json();
        setExamHistory(prev => [resultRecord, ...prev]);
        setExamAttempts(prev => ({ ...prev, [quiz.id]: resultRecord }));

        const nextPoints = (currentStudent.points || 0) + pointsEarned;
        setCurrentStudent(prev => ({ ...prev, points: nextPoints }));

        // Increment student points in Database
        await fetch(`/api/students/${currentStudent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: nextPoints }),
          credentials: 'include'
        });

        const waPayload = {
          studentName: currentStudent.name,
          parentPhone: currentStudent.parentPhone,
          studentPhone: currentStudent.phone,
          gradeName: currentStudent.gradeName,
          examTitle: quiz.title,
          score: correctCount,
          total,
          percentage,
          pointsEarned,
          date: resultRecord.date
        };

        return { resultRecord, waPayload };
      }
    } catch (err) {
      console.error('Record exam failed:', err);
    }
    return { resultRecord: null, waPayload: null };
  };

  const hasAttemptedExam = (quizId) => !!examAttempts[quizId];
  const getExamAttempt = (quizId) => examAttempts[quizId] || null;

  const adminAddLesson = async (lessonData) => {
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData),
        credentials: 'include'
      });

      if (res.ok) {
        const createdObj = await res.json();
        setLessons(prev => [createdObj, ...prev]);

        // Auto-fire in-platform notification when lesson is uploaded
        const gradeLabel = lessonData.grade === '3sec' ? 'ثالثة ثانوي' : lessonData.grade === '2sec' ? 'ثاني ثانوي' : 'أول ثانوي';
        const priceLabel = lessonData.price === 0 ? 'مجاناً 🎁' : `${lessonData.price} ج.م`;
        const subjectTag = (lessonData.subject || '').includes('عربي') ? 'arabic' : 'programming';

        await addNotification({
          targetGrade: lessonData.grade || 'all',
          subject: subjectTag,
          title: `📚 حصة جديدة: ${lessonData.title}`,
          body: `📖 المادة: ${lessonData.subject} | 🎓 الصف: ${gradeLabel} | 💰 السعر: ${priceLabel}`
        });

        return createdObj;
      }
    } catch (err) {
      console.error('Create lesson failed:', err);
    }
  };

  const adminDeleteLesson = async (lessonId) => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setLessons(prev => prev.filter(les => les.id !== lessonId));
      }
    } catch (err) {
      console.error('Delete lesson failed:', err);
    }
  };

  const adminDeleteNotification = async (notifId) => {
    try {
      const res = await fetch(`/api/notifications/${notifId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notifId));
        return { success: true };
      }
      const data = await res.json();
      return { success: false, message: data.error || 'فشلت عملية الحذف.' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  // ═══ Live Sessions & Virtual Classroom Methods ═══
  const fetchLiveSessions = async () => {
    try {
      const res = await fetch('/api/live');
      if (res.ok) {
        const data = await res.json();
        setLiveSessionsDB(data);
      }
    } catch (err) {
      console.error('Failed to load live sessions:', err);
    }
  };

  const refreshLiveSession = async (id) => {
    try {
      const res = await fetch(`/api/live/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveLiveSession(data);
        setLiveSessionsDB(prev => prev.map(s => s.id === id ? data : s));
        return data;
      }
    } catch (err) {
      console.error('Failed to refresh live session:', err);
    }
    return null;
  };

  const adminCreateLiveSession = async (sessionData) => {
    try {
      const res = await fetch('/api/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLiveSessionsDB(prev => [data.session, ...prev]);
        return { success: true, session: data.session, message: data.message };
      }
      return { success: false, message: data.error || 'فشلت عملية إنشاء البث' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const adminUpdateLiveStatus = async (sessionId, status, recordingUrl = null, streamUrl = null) => {
    try {
      const res = await fetch(`/api/live/${sessionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, recordingUrl, streamUrl }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLiveSessionsDB(prev => prev.map(s => s.id === sessionId ? { ...s, status, ...(recordingUrl ? { recordingUrl } : {}), ...(streamUrl ? { streamUrl } : {}) } : s));
        if (activeLiveSession?.id === sessionId) {
          setActiveLiveSession(prev => ({ ...prev, status, ...(recordingUrl ? { recordingUrl } : {}), ...(streamUrl ? { streamUrl } : {}) }));
        }
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'فشل تحديث حالة البث' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const adminDeleteLiveSession = async (sessionId) => {
    try {
      const res = await fetch(`/api/live/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setLiveSessionsDB(prev => prev.filter(s => s.id !== sessionId));
        if (activeLiveSession?.id === sessionId) setActiveLiveSession(null);
        return { success: true };
      }
      return { success: false, message: data.error || 'فشل حذف البث' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const adminBroadcastLiveAlert = async (sessionId, customMessage) => {
    try {
      const res = await fetch(`/api/live/${sessionId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customMessage }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.inAppNotification) {
          setNotifications(prev => [data.inAppNotification, ...prev]);
        }
        return { success: true, message: data.message, whatsappLinks: data.whatsappLinks, studentsCount: data.studentsCount };
      }
      return { success: false, message: data.error || 'فشل إرسال الإشعارات' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const sendLiveChatMessage = async (sessionId, text) => {
    try {
      const senderName = userRole === 'admin' 
        ? (adminIdentity === 'mr_sayed' ? 'أ / سيد عبد العاطي 📖' : 'م / نور الدين 💻')
        : (currentStudent?.name || 'طالب');
      const senderRole = userRole === 'admin' ? 'teacher' : 'student';

      const res = await fetch(`/api/live/${sessionId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderName, senderRole, text }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveLiveSession(prev => {
          if (!prev || prev.id !== sessionId) return prev;
          return {
            ...prev,
            chatMessages: [...(prev.chatMessages || []), data.message]
          };
        });
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'فشل إرسال الرسالة' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const adminLaunchLivePoll = async (sessionId, pollData) => {
    try {
      const res = await fetch(`/api/live/${sessionId}/poll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pollData),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveLiveSession(prev => {
          if (!prev || prev.id !== sessionId) return prev;
          const polls = (prev.polls || []).map(p => ({ ...p, isActive: false }));
          return { ...prev, polls: [...polls, data.poll] };
        });
        return { success: true, poll: data.poll, message: data.message };
      }
      return { success: false, message: data.error || 'فشل إطلاق السؤال' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const submitLivePollVote = async (sessionId, pollId, optionIndex) => {
    try {
      const res = await fetch(`/api/live/${sessionId}/poll/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionIndex, studentId: currentStudent?.id }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveLiveSession(prev => {
          if (!prev || prev.id !== sessionId || !prev.polls) return prev;
          const polls = prev.polls.map(p => {
            if (p.id !== pollId) return p;
            const votes = { ...(p.votes || {}) };
            votes[optionIndex] = (votes[optionIndex] || 0) + 1;
            return { ...p, votes, totalVotes: (p.totalVotes || 0) + 1 };
          });
          return { ...prev, polls };
        });
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'فشل تسجيل التصويت' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const sendHandRaiseRequest = async (sessionId) => {
    try {
      const res = await fetch(`/api/live/${sessionId}/hand-raise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentStudent?.id || 'std_anon',
          studentName: currentStudent?.name || 'طالب',
          studentCode: currentStudent?.code || ''
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'فشل إرسال الطلب' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const requestJoinLive = async (sessionId) => {
    try {
      const res = await fetch(`/api/live/${sessionId}/join-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentStudent?.id || 'std_anon',
          studentName: currentStudent?.name || 'طالب منصة عِلم',
          studentCode: currentStudent?.code || '3001',
          studentPhone: currentStudent?.phone || ''
        }),
        credentials: 'include'
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const admitStudentLive = async (sessionId, requestId, allow) => {
    try {
      const res = await fetch(`/api/live/${sessionId}/admit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, allow }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshLiveSession(sessionId);
      }
      return data;
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const admitAllStudentsLive = async (sessionId) => {
    try {
      const res = await fetch(`/api/live/${sessionId}/admit-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshLiveSession(sessionId);
      }
      return data;
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const sendLiveHeartbeat = async (sessionId) => {
    try {
      const userKey = userRole === 'admin' ? `admin_${adminIdentity}` : (currentStudent?.code || 'std_anon');
      const userName = userRole === 'admin' ? (adminIdentity === 'mr_sayed' ? 'أ / سيد عبد العاطي' : 'م / نور الدين') : (currentStudent?.name || 'طالب');
      const res = await fetch(`/api/live/${sessionId}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userKey, userName, userRole }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.viewersCount !== undefined) {
        setLiveSessionsDB(prev => prev.map(s => s.id === sessionId ? { ...s, viewersCount: data.viewersCount } : s));
      }
      return data;
    } catch (err) {
      return null;
    }
  };

  const uploadVideoFile = async (file, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload-stream');
      xhr.setRequestHeader('x-filename', encodeURIComponent(file.name));
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            resolve({ success: true, url: xhr.responseText });
          }
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(file);
    });
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white font-black text-sm">
        جاري تهيئة منصة عِلم التعليمية... 💡⚙️
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      currentGrade,
      switchGrade,
      userRole,
      setUserRole,
      adminIdentity,
      setAdminIdentity,
      isAuthenticated,
      registerStudent,
      loginUser,
      logoutUser,
      studentsDB,
      student: currentStudent,
      lessons,
      quizzes,
      couponsDB,
      paymentRequestsDB,
      videoQuestions,
      leaderboard: studentsDB,
      examHistory,
      examAttempts,
      hasAttemptedExam,
      getExamAttempt,
      whatsappLogs,
      smsLogs,
      notifications,
      setNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      addNotification,
      rechargeWallet,
      submitPaymentRequest,
      adminApprovePayment,
      adminRejectPayment,
      adminUpdateStudent,
      adminDeleteStudent,
      adminUpdateLesson,
      adminDeleteCoupon,
      unlockLesson,
      applyCoupon,
      adminCreateCoupon,
      purchaseSubscription,
      addStudentQuestion,
      adminReplyToQuestion,
      recordExamResult,
      adminAddLesson,
      adminDeleteLesson,
      getParentFullWhatsAppReport,
      getWhatsAppMsgText,
      triggerWhatsAppSend,
      triggerSmsSend,
      broadcastNewLesson,
      activeWhatsAppModal,
      setActiveWhatsAppModal,
      adminDeleteNotification,
      theme,
      toggleTheme,
      verifyDeviceOtp,
      uploadVideoFile,
      // Live Broadcast values
      liveSessionsDB,
      activeLiveSession,
      setActiveLiveSession,
      fetchLiveSessions,
      refreshLiveSession,
      adminCreateLiveSession,
      adminUpdateLiveStatus,
      adminDeleteLiveSession,
      adminBroadcastLiveAlert,
      sendLiveChatMessage,
      adminLaunchLivePoll,
      submitLivePollVote,
      sendHandRaiseRequest,
      requestJoinLive,
      admitStudentLive,
      admitAllStudentsLive,
      sendLiveHeartbeat
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
