import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const formatVideoEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  }
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  }
  return url;
};

export const AppProvider = ({ children }) => {
  const [currentGrade, setCurrentGrade] = useState('3sec');
  const [userRole, setUserRole] = useState('student'); // 'student' | 'parent' | 'admin'
  const [adminIdentity, setAdminIdentity] = useState('mr_sayed'); // 'mr_sayed' | 'eng_nour'
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

  const switchGrade = (gradeId) => {
    setCurrentGrade(gradeId);
  };

  // 2. Auth Methods
  const registerStudent = async (studentData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setUserRole('student');
        setCurrentStudent(data.user);
        setCurrentGrade(data.user.grade || '3sec');
        fetchStudentData();
        return { success: true, message: data.message, user: data.user };
      }
      return { success: false, message: data.error || 'فشلت عملية إنشاء الحساب' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const loginUser = async (role, credentials) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, ...credentials }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
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
        return { success: true, message: data.message, user: data.user, role: data.role };
      }

      if (data.deviceLocked) {
        return {
          success: false,
          deviceLocked: true,
          studentId: data.studentId,
          phone: data.phone,
          message: data.error || 'الحساب مسجل على جهاز آخر.'
        };
      }

      return { success: false, message: data.error || 'بيانات الدخول غير صحيحة.' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const verifyDeviceOtp = async (studentId, otp) => {
    try {
      const res = await fetch('/api/auth/verify-device-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, otp }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setUserRole('student');
        setCurrentStudent(data.user);
        setCurrentGrade(data.user.grade || '3sec');
        fetchStudentData();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'رمز التأكيد غير صحيح أو منتهي.' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const logoutUser = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setIsAuthenticated(false);
      setUserRole('student');
      setCurrentStudent(null);
      setStudentsDB([]);
      setPaymentRequestsDB([]);
      setCouponsDB([]);
      setVideoQuestions([]);
      setExamHistory([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Student Actions
  const rechargeWallet = async (amount) => {
    if (!currentStudent) return;
    const newBal = (currentStudent.walletBalance || 0) + Number(amount);
    setCurrentStudent(prev => ({ ...prev, walletBalance: newBal }));
    await fetch(`/api/students/${currentStudent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletBalance: newBal }),
      credentials: 'include'
    });
  };

  const submitPaymentRequest = async (requestData) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentRequestsDB(prev => [data.payment, ...prev]);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'فشل تقديم طلب الشحن' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const unlockLesson = async (lessonId, price) => {
    if (!currentStudent) return { success: false, message: 'سجل دخولك أولاً.' };
    const balance = currentStudent.walletBalance || 0;
    if (balance < price) {
      return { success: false, message: 'رصيد محفظتك غير كافٍ. يرجى شحن الرصيد أولاً.' };
    }

    try {
      const newBal = balance - price;
      const currentUnlocked = currentStudent.unlockedLessons || [];
      const updatedUnlocked = [...currentUnlocked, lessonId];

      const res = await fetch(`/api/students/${currentStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletBalance: newBal,
          unlockedLessons: updatedUnlocked
        }),
        credentials: 'include'
      });

      if (res.ok) {
        setCurrentStudent(prev => ({
          ...prev,
          walletBalance: newBal,
          unlockedLessons: updatedUnlocked
        }));
        return { success: true, message: 'تم فتح الحصة بنجاح! مشاهدة ممتعة 🎓' };
      }
    } catch (err) {
      console.error(err);
    }
    return { success: false, message: 'حدث خطأ أثناء تفعيل الحصة.' };
  };

  const purchaseSubscription = async (subType, price, monthlyCredits) => {
    if (!currentStudent) return { success: false, message: 'سجل دخولك أولاً.' };
    const balance = currentStudent.walletBalance || 0;
    if (balance < price) {
      return { success: false, message: 'رصيد محفظتك غير كافٍ للاشتراك.' };
    }

    try {
      const newBal = balance - price;
      const res = await fetch(`/api/students/${currentStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletBalance: newBal,
          subscriptionStatus: 'active',
          subscriptionType: subType,
          monthlyCreditsLeft: monthlyCredits
        }),
        credentials: 'include'
      });

      if (res.ok) {
        setCurrentStudent(prev => ({
          ...prev,
          walletBalance: newBal,
          subscriptionStatus: 'active',
          subscriptionType: subType,
          monthlyCreditsLeft: monthlyCredits
        }));
        return { success: true, message: 'تم تفعيل الاشتراك بنجاح! 🚀' };
      }
    } catch (err) {
      console.error(err);
    }
    return { success: false, message: 'حدث خطأ أثناء تفعيل الاشتراك.' };
  };

  const applyCoupon = async (code) => {
    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newBal = (currentStudent?.walletBalance || 0) + Number(data.value);
        setCurrentStudent(prev => ({ ...prev, walletBalance: newBal }));
        return { success: true, message: data.message, value: data.value };
      }
      return { success: false, message: data.error || 'الكوبون غير صالح.' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const addStudentQuestion = async (questionData) => {
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVideoQuestions(prev => [data.question, ...prev]);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'فشل إرسال السؤال' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  // Admin Actions
  const adminApprovePayment = async (requestId) => {
    try {
      const res = await fetch(`/api/payments/${requestId}/approve`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentRequestsDB(prev => prev.map(p => p.id === requestId ? { ...p, status: 'approved' } : p));
        fetchAdminData();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'فشلت الموافقة على الطلب' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const adminRejectPayment = async (requestId) => {
    try {
      const res = await fetch(`/api/payments/${requestId}/reject`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentRequestsDB(prev => prev.map(p => p.id === requestId ? { ...p, status: 'rejected' } : p));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'فشل رفض الطلب' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const adminUpdateStudent = async (studentId, updatedData) => {
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
        credentials: 'include'
      });
      if (res.ok) {
        setStudentsDB(prev => prev.map(s => s.id === studentId ? { ...s, ...updatedData } : s));
        if (currentStudent?.id === studentId) {
          setCurrentStudent(prev => ({ ...prev, ...updatedData }));
        }
        return { success: true };
      }
    } catch (err) {
      console.error('Update student error:', err);
    }
    return { success: false };
  };

  const adminDeleteStudent = async (studentId) => {
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setStudentsDB(prev => prev.filter(s => s.id !== studentId));
        return { success: true };
      }
    } catch (err) {
      console.error('Delete student error:', err);
    }
    return { success: false };
  };

  const adminUpdateLesson = async (lessonId, updatedData) => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
        credentials: 'include'
      });
      if (res.ok) {
        setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, ...updatedData } : l));
        return { success: true };
      }
    } catch (err) {
      console.error('Update lesson error:', err);
    }
    return { success: false };
  };

  const adminCreateCoupon = async (couponData) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCouponsDB(prev => [data.coupon, ...prev]);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'فشل إنشاء الكوبون' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const adminDeleteCoupon = async (code) => {
    try {
      const res = await fetch(`/api/coupons/${code}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setCouponsDB(prev => prev.filter(c => c.code !== code));
        return { success: true };
      }
    } catch (err) {
      console.error('Delete coupon error:', err);
    }
    return { success: false };
  };

  const adminReplyToQuestion = async (questionId, replyText) => {
    try {
      const res = await fetch(`/api/questions/${questionId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVideoQuestions(prev => prev.map(q => q.id === questionId ? { ...q, replyText, status: 'answered', repliedAt: 'الآن' } : q));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'فشل إرسال الرد' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  const addNotification = async (notifData) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifData),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(prev => [data.notification, ...prev]);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'فشل إرسال الإشعار' };
    } catch (err) {
      return { success: false, message: 'خطأ في الاتصال بالخادم.' };
    }
  };

  // WhatsApp & SMS Trigger Generators
  const getParentFullWhatsAppReport = (std) => {
    if (!std) return '';
    return encodeURIComponent(
      `تقرير ولي أمر الطالب: ${std.name} 🎓\n` +
      `📌 كود الطالب: ${std.code}\n` +
      `📚 الصف: ${std.gradeName || 'الصف الثالث الثانوي'}\n` +
      `💰 رصيد المحفظة: ${std.walletBalance || 0} ج.م\n` +
      `🌟 النقاط والتفوق: ${std.points || 0} نقطة\n` +
      `--------------------------------\n` +
      `منصة عِلم التعليمية تتمنى لنجلكم دوام التفوق والنجاح ✨`
    );
  };

  const getWhatsAppMsgText = (msg) => encodeURIComponent(msg);

  const triggerWhatsAppSend = (phone, text) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/2${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const triggerSmsSend = (phone, text) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const url = `sms:0${cleanPhone}?body=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const broadcastNewLesson = (lesson) => {
    const students = studentsDB.filter(s => s.grade === lesson.grade || lesson.grade === 'all');
    return students.map(st => {
      const cleanPhone = (st.phone || st.parentPhone || '').replace(/[^0-9]/g, '');
      const msg = `أهلاً يا ${st.name} 👋\nتم رفع حصة جديدة بعنوان: "${lesson.title}" لمادة ${lesson.subject}.\nادخل الآن وشاهد الحصة على منصة عِلم 🚀\nhttps://elbashmohands.dev/`;
      return {
        studentName: st.name,
        phone: cleanPhone,
        whatsappUrl: `https://wa.me/2${cleanPhone}?text=${encodeURIComponent(msg)}`
      };
    });
  };

  const recordExamResult = async (quiz, answers, correctCount, total, percentage, pointsEarned) => {
    if (!currentStudent) return { resultRecord: null, waPayload: null };
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          quizTitle: quiz.title,
          studentName: currentStudent.name,
          studentPhone: currentStudent.phone,
          parentPhone: currentStudent.parentPhone,
          score: correctCount,
          total,
          percentage,
          pointsEarned,
          answers
        }),
        credentials: 'include'
      });

      if (res.ok) {
        const resultRecord = await res.json();
        setExamHistory(prev => [resultRecord, ...prev]);
        setExamAttempts(prev => ({ ...prev, [quiz.id]: resultRecord }));

        const nextPoints = (currentStudent.points || 0) + pointsEarned;
        setCurrentStudent(prev => ({ ...prev, points: nextPoints }));

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
      sendHandRaiseRequest
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
