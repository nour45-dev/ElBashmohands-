import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const formatVideoEmbedUrl = (url) => {
  if (!url) return '';
  let cleanUrl = url.trim();

  if (cleanUrl.includes('youtube.com/watch') || cleanUrl.includes('youtu.be') || cleanUrl.includes('youtube.com/shorts')) {
    let videoId = '';
    if (cleanUrl.includes('v=')) {
      videoId = cleanUrl.split('v=')[1]?.split('&')[0];
    } else if (cleanUrl.includes('youtu.be/')) {
      videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
    } else if (cleanUrl.includes('shorts/')) {
      videoId = cleanUrl.split('shorts/')[1]?.split('?')[0];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
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

  // Theme states (Light / Dark)
  const [theme, setTheme] = useState(localStorage.getItem('manara_theme') || 'dark');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-mode');
    } else {
      root.classList.remove('light-mode');
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

  // Load public data (lessons list and notifications list)
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
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch public data:', err);
    }
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
          title: `تم تأكيد إضافة ${req.amount} جنيه لرصيدك بمحفظة الباشمهندس`,
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

    return `📌 *تقرير متابعة ولي الأمر الموثق - منصة الباشمهندس للبرمجة* 💻
━━━━━━━━━━━━━━━━━━━━
👤 *اسم الطالب:* ${std.name}
🆔 *كود الطالب:* ${std.code}
🎓 *الصف الدراسي:* ${std.gradeName}
📊 *حالة الاشتراك:* ${std.subscriptionType || 'مجاني'} (متبقي: ${std.monthlyCreditsLeft || 0} حصص)
💰 *رصيد المحفظة:* ${std.walletBalance} جنيه
🏆 *الترتيب في أوائل الدفعة:* المركز #${std.rank || 1}
📝 *آخر امتحان:* ${lastExam.quizTitle} (${lastExam.score} من ${lastExam.total} - ${lastExam.percentage}%)

💡 *ملاحظة الباشمهندس:* الطالب متميز جداً وملتزم بكورسات وتطبيقات البرمجة العملية.

🔗 لمتابعة المحتوى والدروس على منصة الباشمهندس:
https://elbashmohands.dev`;
  };

  const getWhatsAppMsgText = (payload, recipient = 'parent') => {
    if (!payload) return '';
    if (payload.isFullParentReport) {
      return getParentFullWhatsAppReport(currentStudent);
    }
    return `📌 *إشعار من منصة الباشمهندس للبرمجة*
👤 *الطالب:* ${payload.studentName || currentStudent?.name}
🎓 *الصف:* ${payload.gradeName || currentStudent?.gradeName}
📝 *الموضوع:* ${payload.examTitle || payload.title || 'تقرير البرمجة الموثق'}

🔗 https://elbashmohands.dev`;
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
      msgText = `📌 تقرير منصة الباشمهندس\nالطالب: ${currentStudent?.name}\nالاشتراك: ${currentStudent?.subscriptionType || 'مجاني'}\nالرصيد: ${currentStudent?.walletBalance || 0} ج\nالنقاط: ${currentStudent?.points || 0}`;
    } else {
      msgText = `📌 تنبيه من منصة الباشمهندس للبرمجة\n${payload.examTitle || payload.title || 'إشعار جديد'}\nالطالب: ${payload.studentName || currentStudent?.name || ''}`;
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
      const msg = `🎉 *حصة جديدة على منصة الباشمهندس!*\n\n📚 *${lessonData.title}*\n📖 المادة: ${lessonData.subject || 'برمجة'}\n🎓 الصف: ${gradeLabel}\n💰 السعر: ${priceLabel}\n\n🔗 ادخل المنصة وشاهد الحصة الآن!\n📱 للتواصل: 01002169889`;
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

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black text-sm">
        جاري تهيئة منصة مَنارة التعليمية... 💡⚙️
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
      verifyDeviceOtp
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
