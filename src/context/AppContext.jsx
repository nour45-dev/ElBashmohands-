import React, { createContext, useContext, useState } from 'react';

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

export const initialStudentsDB = [
  {
    id: 'std_101',
    code: 'ENG-101',
    name: 'أحمد محمود العبد',
    email: 'ahmed@bashmohandis.com',
    phone: '01012345678',
    parentPhone: '01198765432',
    password: '123',
    grade: '3sec',
    gradeName: 'الصف الثالث الثانوي (تانوية عامة)',
    avatar: null,
    walletBalance: 0,
    subscriptionStatus: 'active',
    subscriptionType: 'شهري',
    monthlyCreditsLeft: 8,
    points: 120,
    streakDays: 5,
    rank: 1,
    badges: [{ id: 'b1', name: 'عضو جديد 💻', icon: '💻', desc: 'انضم لمنصة الباشمهندس' }]
  }
];

export const initialCouponsDB = [
  {
    id: 'coup_1',
    code: 'BASHMO2026',
    type: 'percent',
    value: 50,
    targetGrade: 'all',
    maxUses: 100,
    usedCount: 14,
    active: true
  },
  {
    id: 'coup_2',
    code: 'FREE100',
    type: 'free',
    value: 100,
    targetGrade: '3sec',
    maxUses: 50,
    usedCount: 8,
    active: true
  }
];

export const initialQuizzes = [];

export const initialLessons = [
  {
    id: 'les_demo_1',
    title: 'مقدمة في لغة Python وكتابة أول برنامج',
    subject: 'برمجة وعلوم الحاسب',
    grade: '3sec',
    duration: '45 دقيقة',
    price: 25,
    videoType: 'url',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?auto=format&fit=crop&q=80&w=600',
    description: 'شرح مبسط وممتع لأساسيات المتغيرات وعمليات الإدخال والإخراج في Python.',
    attachmentType: 'pdf',
    attachmentPdf: 'مذكرة_Python_الحصة_الأولى.pdf',
    attachmentFileUrl: null,
    viewsCount: 142,
    isUnlocked: false,
    attachedQuiz: {
      id: 'qz_demo_1',
      title: 'الامتحان الإلكتروني للحصة الأولى - لغة Python',
      rewardPoints: 50,
      durationMinutes: 20,
      questions: [
        {
          id: 1,
          question: 'أي من الكلمات التالية تستخدم لطباعة مخرجات في لغة Python؟',
          options: ['echo', 'print()', 'Console.WriteLine()', 'printf()'],
          correctIndex: 1
        },
        {
          id: 2,
          question: 'كيف يتم تعريف المتغير x بقيمة نصية في Python؟',
          options: ['int x = "Hello"', 'x = "Hello"', 'var x = "Hello"', 'string x = "Hello"'],
          correctIndex: 1
        }
      ]
    }
  },
  {
    id: 'les_demo_2',
    title: 'شرح درس البلاغة - الكناية وأسرار الجمال',
    subject: 'اللغة العربية',
    grade: '3sec',
    duration: '40 دقيقة',
    price: 25,
    videoType: 'url',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=600',
    description: 'شرح تفصيلي لدرس الكناية وأنواعها (عن صفة، عن موصوف، عن نسبة) وتدريبات البلاغة للمرحلة الثانوية.',
    attachmentType: 'pdf',
    attachmentPdf: 'مذكرة_البلاغة_الكناية.pdf',
    attachmentFileUrl: null,
    viewsCount: 98,
    isUnlocked: false,
    attachedQuiz: {
      id: 'qz_demo_2',
      title: 'امتحان البلاغة الإلكتروني - درس الكناية',
      rewardPoints: 50,
      durationMinutes: 15,
      questions: [
        {
          id: 1,
          question: 'قال الشاعر: "فما جازه جود ولا حل دونه ... ولكن يسير الجود حيث يسير" — ما نوع الكناية هنا؟',
          options: ['كناية عن صفة', 'كناية عن موصوف', 'كناية عن نسبة', 'استعارة تصريحية'],
          correctIndex: 2
        }
      ]
    }
  }
];

export const initialPaymentRequests = [
  {
    id: 'req_1001',
    studentId: 'std_101',
    studentName: 'أحمد محمود العبد',
    studentPhone: '01012345678',
    parentPhone: '01198765432',
    amount: 150,
    method: 'instapay',
    refNumber: 'INSTA-88741259',
    proofImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=400',
    status: 'pending',
    requestDate: new Date().toLocaleDateString('ar-EG')
  }
];

export const AppProvider = ({ children }) => {
  const [currentGrade, setCurrentGrade] = useState('3sec');
  
  const [userRole, setUserRoleState] = useState(() => {
    return localStorage.getItem('bashmohandis_role') || 'student';
  });

  const [adminIdentity, setAdminIdentityState] = useState(() => {
    return localStorage.getItem('bashmohandis_admin_identity') || 'eng_nour';
  });

  const setAdminIdentity = (identity) => {
    setAdminIdentityState(identity);
    localStorage.setItem('bashmohandis_admin_identity', identity);
  };
  
  const [isAuthenticated, setIsAuthenticatedState] = useState(() => {
    return localStorage.getItem('bashmohandis_auth') === 'true';
  });

  // Teacher accounts for quick login from student login page
  const TEACHER_ACCOUNTS = [
    { email: 'nour@bashmohandis.com', phone: '01002169889', password: 'nour2026', identity: 'eng_nour', name: 'مهندس نور' },
    { email: 'sayed@bashmohandis.com', phone: '01094273996', password: 'sayed2026', identity: 'mr_sayed', name: 'مستر سيد' }
  ];

  const [studentsDB, setStudentsDBState] = useState(() => {
    const saved = localStorage.getItem('bashmohandis_studentsDB');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialStudentsDB;
  });

  const setStudentsDB = (updater) => {
    setStudentsDBState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('bashmohandis_studentsDB', JSON.stringify(next));
      return next;
    });
  };
  
  const [currentStudent, setCurrentStudentState] = useState(() => {
    const saved = localStorage.getItem('bashmohandis_student');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return { 
          ...parsed, 
          walletBalance: parsed.walletBalance || 0,
          monthlyCreditsLeft: parsed.monthlyCreditsLeft !== undefined ? parsed.monthlyCreditsLeft : 8
        };
      } catch (e) {}
    }
    return initialStudentsDB[0];
  });
  
  const [lessons, setLessons] = useState(initialLessons);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [couponsDB, setCouponsDB] = useState(initialCouponsDB);
  const [paymentRequestsDB, setPaymentRequestsDB] = useState(initialPaymentRequests);
  const [examHistory, setExamHistory] = useState([]);
  const [examAttempts, setExamAttempts] = useState({}); // { quizId: { ...resultRecord, userAnswers, questions } }
  const [whatsappLogs, setWhatsappLogs] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);

  // Video Q&A State
  const [videoQuestions, setVideoQuestions] = useState([
    {
      id: 'q_101',
      lessonId: 'les_demo_1',
      studentName: 'أحمد محمود العبد',
      studentPhone: '01012345678',
      questionText: 'يا باشمهندس ازاي أفرق بين List و Tuple في لغة Python؟',
      replyText: 'أهلاً يا أحمد! الـ List قابلة للتعديل (mutable)، بينما الـ Tuple ثابته ولا يمكن تعديل عناصرها بعد إنشائها.',
      repliedAt: 'منذ ساعتين',
      status: 'answered'
    }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'مرحباً بك في منصة الباشمهندس للبرمجة! 💻', body: 'التطبيق جاهز ومحمي بالكامل 100%.', time: 'الآن', unread: true }
  ]);

  const [activeWhatsAppModal, setActiveWhatsAppModal] = useState(null);

  // Sync to localStorage
  const setIsAuthenticated = (val) => {
    setIsAuthenticatedState(val);
    localStorage.setItem('bashmohandis_auth', val ? 'true' : 'false');
  };

  const setUserRole = (role) => {
    setUserRoleState(role);
    localStorage.setItem('bashmohandis_role', role);
  };

  const setCurrentStudent = (std) => {
    setCurrentStudentState(std);
    localStorage.setItem('bashmohandis_student', JSON.stringify(std));
  };

  // Student Registration Handler
  const registerStudent = ({ name, email, phone, parentPhone, grade, password, confirmPassword }) => {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim();
    const cleanPhone = (phone || '').trim();
    const cleanPass = (password || '').trim();
    const cleanConfirm = (confirmPassword || '').trim();

    if (!cleanName || cleanName.length < 3) {
      return { success: false, message: 'يرجى إدخال اسم الطالب الثلاثي بشكل صحيح.' };
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'يرجى إدخال بريد إلكتروني صحيح.' };
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, message: 'يرجى إدخال رقم هاتف الطالب المكون من 11 رقم.' };
    }

    if (cleanPass !== cleanConfirm) {
      return { success: false, message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين!' };
    }

    const existing = studentsDB.find(s => s.phone === cleanPhone || s.email === cleanEmail);
    if (existing) {
      return { success: false, message: 'رقم الموبايل أو البريد هذا مسجل مسبقاً! يرجى تسجيل الدخول.' };
    }

    const nextCodeNumber = studentsDB.length + 101;
    const newStudentCode = `ENG-${nextCodeNumber}`;

    const newStudentObj = {
      id: 'std_' + Date.now(),
      code: newStudentCode,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      parentPhone: (parentPhone || '').trim(),
      password: cleanPass,
      grade: grade || '3sec',
      gradeName: grade === '1sec' ? 'الصف الأول الثانوي' : grade === '2sec' ? 'الصف الثاني الثانوي' : 'الصف الثالث الثانوي (تانوية عامة)',
      avatar: null,
      walletBalance: 0,
      subscriptionStatus: 'none',
      subscriptionType: 'غير مشترك',
      monthlyCreditsLeft: 0,
      points: 0,
      streakDays: 1,
      rank: studentsDB.length + 1,
      badges: [{ id: 'b_new', name: 'عضو جديد 🚀', icon: '🚀', desc: 'انضم لمنصة الباشمهندس للبرمجة' }]
    };

    setStudentsDB(prev => [newStudentObj, ...prev]);
    setCurrentStudent(newStudentObj);
    setCurrentGrade(newStudentObj.grade);
    setUserRole('student');
    setIsAuthenticated(true);

    return { success: true, studentCode: newStudentCode, message: `تم إنشاء حسابك بنجاح! كود الطالب الخاص بك هو: ${newStudentCode}` };
  };

  // Login Handler
  const loginUser = (role, credentials) => {
    if (role === 'admin') {
      const inputPass = (credentials.adminCode || '').trim();
      const identity = credentials.adminIdentity || 'eng_nour';
      if (inputPass === '0123456') {
        setUserRole('admin');
        setAdminIdentity(identity);
        setIsAuthenticated(true);
        const nameText = identity === 'mr_sayed' ? 'مستر سيد عبد العاطي 📖' : 'مهندس نور 💻';
        return { success: true, message: `أهلاً وسهلاً بك يا ${nameText}! تم تسجيل الدخول إلى لوحة التحكم الإدارية.` };
      } else {
        return { success: false, message: 'كلمة سر الأدمن غير صحيحة! (كلمة المرور الرسمية: 0123456)' };
      }
    }

    if (role === 'parent') {
      const search = (credentials.parentStudentCode || '').trim().toUpperCase();
      if (!search) {
        return { success: false, message: 'يرجى إدخال اسم أو كود الطالب لمتابعة حسابه.' };
      }
      const matched = studentsDB.find(s => s.code === search || s.phone === search || s.name.includes(search));
      if (matched) {
        setCurrentStudent(matched);
        setUserRole('parent');
        setIsAuthenticated(true);
        return { success: true, matchedStudent: matched, message: `تم الوصول لحساب الطالب: ${matched.name}` };
      } else {
        return { success: false, message: 'لم يتم العثور على طالب بهذا الكود أو الاسم. تأكد من إدخال بيانات صحيحة.' };
      }
    }

    const identifier = (credentials.phoneInput || '').trim();
    const pass = (credentials.passInput || '').trim();

    if (!identifier || !pass) {
      return { success: false, message: 'يرجى إدخال البريد الإلكتروني أو رقم الموبايل وكلمة المرور.' };
    }

    // Helper to normalize phone numbers (removes spaces, replaces +20 or 20 prefix with 0)
    const normalizePhone = (p) => {
      if (!p) return '';
      const clean = p.replace(/\s+/g, '');
      if (clean.startsWith('+20')) return '0' + clean.substring(3);
      if (clean.startsWith('20') && clean.length > 10) return '0' + clean.substring(2);
      if (clean.startsWith('+2')) return '0' + clean.substring(2);
      return clean;
    };

    const cleanIdentifier = normalizePhone(identifier);

    // Check teacher accounts first
    const foundTeacher = TEACHER_ACCOUNTS.find(
      t => (t.email.toLowerCase() === identifier.toLowerCase() || normalizePhone(t.phone) === cleanIdentifier) && t.password === pass
    );
    if (foundTeacher) {
      setUserRole('admin');
      setAdminIdentity(foundTeacher.identity);
      setIsAuthenticated(true);
      return { success: true, message: `أهلاً وسهلاً يا ${foundTeacher.name}! تم تسجيل الدخول.` };
    }

    const foundStudent = studentsDB.find(
      s => normalizePhone(s.phone) === cleanIdentifier || s.email.toLowerCase() === identifier.toLowerCase()
    );
    if (!foundStudent) {
      return { success: false, message: 'البريد أو رقم الموبايل غير مسجل! يرجى إنشاء حساب جديد أولاً.' };
    }

    if (foundStudent.password !== pass) {
      return { success: false, message: 'كلمة المرور غير صحيحة! يرجى التأكد منها.' };
    }

    setCurrentStudent(foundStudent);
    setCurrentGrade(foundStudent.grade);
    setUserRole('student');
    setIsAuthenticated(true);
    return { success: true, message: `أهلاً بعودتك يا ${foundStudent.name}` };
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bashmohandis_auth');
  };

  const switchGrade = (gradeId) => {
    if (userRole === 'admin') {
      setCurrentGrade(gradeId);
    } else {
      setCurrentGrade(currentStudent.grade || gradeId);
    }
  };

  // Submit Payment Recharge Request (Requires Admin Approval)
  const submitPaymentRequest = ({ amount, method, refNumber, proofImage }) => {
    if (!refNumber || refNumber.length < 4) {
      return { success: false, message: 'يرجى إدخال مرجع عملية التحويل بشكل صحيح.' };
    }

    const newRequest = {
      id: 'req_' + Date.now(),
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentPhone: currentStudent.phone,
      parentPhone: currentStudent.parentPhone,
      amount: Number(amount) || 100,
      method: method || 'instapay',
      refNumber: refNumber.trim(),
      proofImage: proofImage || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=400',
      status: 'pending',
      requestDate: new Date().toLocaleDateString('ar-EG')
    };

    setPaymentRequestsDB(prev => [newRequest, ...prev]);

    return { 
      success: true, 
      message: 'تم إرسال طلب الشحن وصورة الإيصال بنجاح للإدارة! سيتم إضافة الرصيد فور مراجعة التحويل ⏳' 
    };
  };

  // Admin Approve Payment Request
  const adminApprovePayment = (requestId) => {
    const req = paymentRequestsDB.find(r => r.id === requestId);
    if (!req) return;

    setStudentsDB(prev => prev.map(st => {
      if (st.id === req.studentId) {
        const newBalance = st.walletBalance + req.amount;
        if (st.id === currentStudent.id) {
          setCurrentStudent({ ...st, walletBalance: newBalance });
        }
        return { ...st, walletBalance: newBalance };
      }
      return st;
    }));

    setPaymentRequestsDB(prev => [requestId].includes(r => r.id === requestId ? { ...r, status: 'approved' } : r));

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
  };

  // Admin Reject Payment Request
  const adminRejectPayment = (requestId, reason = 'بيانات التحويل أو صورة الإيصال غير واضحة.') => {
    setPaymentRequestsDB(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected', rejectReason: reason } : r));
  };

  // Admin Lesson Edit Handler (Full Edit Title, Price, Grade, Attachment & Quiz)
  const adminUpdateLesson = (lessonId, updatedData) => {
    setLessons(prev => prev.map(les => les.id === lessonId ? { ...les, ...updatedData } : les));
  };

  // Admin Coupon Delete Handler
  const adminDeleteCoupon = (couponId) => {
    setCouponsDB(prev => prev.filter(c => c.id !== couponId));
  };

  // Admin Student Management: Edit Student
  const adminUpdateStudent = (studentId, updatedData) => {
    setStudentsDB(prev => prev.map(st => st.id === studentId ? { ...st, ...updatedData } : st));
    if (currentStudent && currentStudent.id === studentId) {
      setCurrentStudent(prev => ({ ...prev, ...updatedData }));
    }
  };

  // Admin Student Management: Delete Student
  const adminDeleteStudent = (studentId) => {
    setStudentsDB(prev => prev.filter(st => st.id !== studentId));
  };

  // Manual Recharge via Code (fallback)
  const rechargeWallet = (codeOrAmount, paymentMethod = 'code') => {
    let amount = 0;
    const cleanCode = (codeOrAmount || '').trim().toUpperCase();
    if (cleanCode.includes('50') || cleanCode === 'SAYED50') amount = 50;
    else if (cleanCode.includes('100') || cleanCode === 'SAYED100') amount = 100;
    else if (cleanCode.includes('200') || cleanCode === 'SAYED200') amount = 200;
    else if (cleanCode.length >= 6) amount = 50;
    else {
      return { success: false, message: 'كود الشحن غير صحيح أو مستعمل مسبقاً.' };
    }

    setCurrentStudent(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + amount
    }));

    return { success: true, amount, message: `تم شحن ${amount} جنيه بنجاح إلى محفظتك! 🎟️` };
  };

  // Purchase Monthly (8 Video Credits) or Annual Subscription
  const purchaseSubscription = (planType, price) => {
    if (currentStudent.walletBalance < price) {
      return { success: false, message: `رصيد المحفظة لا يكفي الاشتراك (${price} ج.م). يرجى شحن المحفظة أولاً.` };
    }

    const isMonthly = planType === 'شهري';
    const newCredits = isMonthly ? 8 : 999;

    setCurrentStudent(prev => ({
      ...prev,
      walletBalance: prev.walletBalance - price,
      subscriptionStatus: 'active',
      subscriptionType: planType,
      monthlyCreditsLeft: newCredits
    }));

    return { 
      success: true, 
      message: isMonthly 
        ? `تم تفعيل الاشتراك الشهري بنجاح! تم منحك رصيد 8 حصص اختيارية تختار فتحها بنفسك 🎓`
        : `تم تفعيل الاشتراك السنوي الشامل بنجاح! تم فتح كافة حصص الصف كاملاً 🌟`
    };
  };

  // Unlock Lesson via Wallet, Coupon, OR 1 Monthly Credit (out of 8)
  const unlockLesson = (lessonId, price, useMonthlyCredit = false) => {
    if (useMonthlyCredit) {
      if ((currentStudent.monthlyCreditsLeft || 0) <= 0) {
        return { success: false, message: 'استنفذت رصيد الـ 8 حصص المتاحة باشتراكك الشهري.' };
      }

      setCurrentStudent(prev => ({
        ...prev,
        monthlyCreditsLeft: prev.monthlyCreditsLeft - 1
      }));

      setLessons(prev => prev.map(les => les.id === lessonId ? { ...les, isUnlocked: true } : les));
      return { success: true, message: `تم فتح الحصة باستخدام 1 حصة من اشتراكك الشهري! (متبقي: ${currentStudent.monthlyCreditsLeft - 1}/8 حصص)` };
    }

    if (currentStudent.walletBalance < price) {
      return { success: false, message: 'رصيد المحفظة لا يكفي. يرجى شحن المحفظة أولاً.' };
    }

    setCurrentStudent(prev => ({
      ...prev,
      walletBalance: prev.walletBalance - price
    }));

    setLessons(prev => prev.map(les => les.id === lessonId ? { ...les, isUnlocked: true } : les));

    return { success: true, message: 'تم فتح الحصة بنجاح! مشاهدة ممتعة.' };
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
⭐ *إجمالي النقاط:* ${std.points} نقطة
🏆 *الترتيب في أوائل الدفعة:* المركز #${std.rank || 1}
📝 *آخر امتحان:* ${lastExam.quizTitle} (${lastExam.score} من ${lastExam.total} - ${lastExam.percentage}%)

💡 *ملاحظة الباشمهندس:* الطالب متميز جداً وملتزم بكورسات وتطبيقات البرمجة العملية.

🔗 لمتابعة المحتوى والدروس على منصة الباشمهندس:
https://bassthalk.com/elbashmohandis`;
  };

  // Safe Text Generator for WhatsApp Modal
  const getWhatsAppMsgText = (payload, recipient = 'parent') => {
    if (!payload) return '';
    if (payload.isFullParentReport) {
      return getParentFullWhatsAppReport(currentStudent);
    }
    return `📌 *إشعار من منصة الباشمهندس للبرمجة*
👤 *الطالب:* ${payload.studentName || currentStudent.name}
🎓 *الصف:* ${payload.gradeName || currentStudent.gradeName}
📝 *الموضوع:* ${payload.examTitle || payload.title || 'تقرير البرمجة الموثق'}

🔗 https://bassthalk.com/elbashmohandis`;
  };

  // Dual Dispatcher: WhatsApp Send Trigger
  const triggerWhatsAppSend = (payload, targetRecipient = 'parent') => {
    const targetPhone = targetRecipient === 'parent' ? (payload.parentPhone || currentStudent.parentPhone) : (payload.studentPhone || currentStudent.phone);
    const recipientLabel = targetRecipient === 'parent' ? 'ولي الأمر' : 'الطالب';
    
    const msgText = getWhatsAppMsgText(payload, targetRecipient);

    const encodedMsg = encodeURIComponent(msgText);
    const formattedPhone = targetPhone.startsWith('0') ? '2' + targetPhone : targetPhone;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;

    setWhatsappLogs(prev => [
      {
        id: 'wa_' + Date.now(),
        timestamp: new Date().toLocaleString('ar-EG'),
        studentName: payload.studentName || currentStudent.name,
        phoneSentTo: `${targetPhone} (${recipientLabel})`,
        examTitle: payload.examTitle || 'تقرير ولي الأمر الشامل',
        scoreText: 'WhatsApp ✅',
        status: 'تم التوجيه للواتساب ✅'
      },
      ...prev
    ]);

    return { whatsappUrl, msgText };
  };

  // SMS Send Trigger — returns message data for modal display (sms: protocol unreliable on desktop)
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

    const formattedPhone = targetPhone.startsWith('0') ? '2' + targetPhone : targetPhone;
    // WhatsApp as SMS fallback (works on mobile + desktop)
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
      // Attempt sms: protocol anyway for mobile browsers
      smsUrl: `sms:${targetPhone}?body=${encodeURIComponent(msgText)}`
    };
  };

  // In-Platform Notification Engine
  const addNotification = ({ targetGrade, title, body, subject }) => {
    const newNote = {
      id: 'n_' + Date.now(),
      targetGrade: targetGrade || 'all',
      subject: subject || 'general',
      title: (title || '').trim(),
      body: (body || '').trim(),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('ar-EG'),
      unread: true
    };
    setNotifications(prev => [newNote, ...prev]);
    return newNote;
  };

  // Broadcast new lesson to ALL registered students via WhatsApp
  const broadcastNewLesson = (lessonData) => {
    const broadcastLinks = studentsDB
      .filter(st => st.phone)
      .map(st => {
        const msg = `🎉 *حصة جديدة على منصة الباشمهندس!*\n\n📚 *${lessonData.title}*\n🎓 الصف: ${lessonData.grade === '3sec' ? 'ثالثة ثانوي' : lessonData.grade === '2sec' ? 'ثاني ثانوي' : 'أول ثانوي'}\n💰 السعر: ${lessonData.price === 0 ? 'مجاناً 🎁' : `${lessonData.price} ج.م`}\n\n🔗 ادخل المنصة وشاهد الحصة الآن!`;
        const formatted = st.phone.startsWith('0') ? '2' + st.phone : st.phone;
        return {
          studentName: st.name,
          phone: st.phone,
          whatsappUrl: `https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`
        };
      });

    return broadcastLinks;
  };

  // Coupon Engine
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

    setCouponsDB(prev => prev.map(c => c.id === coupon.id ? { ...c, usedCount: c.usedCount + 1 } : c));

    return {
      success: true,
      couponType: coupon.type,
      discountText,
      finalPrice,
      message: `تم تطبيق الكوبون بنجاح! (${discountText})`
    };
  };

  const adminCreateCoupon = (couponData) => {
    const newCoupon = {
      ...couponData,
      id: 'coup_' + Date.now(),
      code: couponData.code.trim().toUpperCase(),
      usedCount: 0,
      active: true
    };
    setCouponsDB(prev => [newCoupon, ...prev]);
    return newCoupon;
  };

  const addStudentQuestion = (lessonId, questionText) => {
    if (!questionText.trim()) return;
    const newQ = {
      id: 'q_' + Date.now(),
      lessonId,
      studentName: currentStudent.name,
      studentPhone: currentStudent.phone,
      questionText: questionText.trim(),
      replyText: null,
      repliedAt: null,
      status: 'pending'
    };
    setVideoQuestions(prev => [newQ, ...prev]);
  };

  const adminReplyToQuestion = (questionId, replyText) => {
    if (!replyText.trim()) return;
    setVideoQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          replyText: replyText.trim(),
          repliedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          status: 'answered'
        };
      }
      return q;
    }));
  };

  const recordExamResult = (quiz, userAnswers) => {
    // Block if already attempted
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

    const resultRecord = {
      id: 'ex_hist_' + Date.now(),
      quizId: quiz.id,
      lessonId: quiz.lessonId,
      quizTitle: quiz.title,
      score: correctCount,
      total,
      percentage,
      date: new Date().toISOString().split('T')[0],
      pointsEarned,
      passed: percentage >= 60,
      status: percentage >= 80 ? 'ممتاز 🌟' : percentage >= 60 ? 'جيد 👍' : 'يحتاج مراجعة ❌',
      userAnswers,
      questions: quiz.questions
    };

    setExamHistory(prev => [resultRecord, ...prev]);

    // Mark this quiz as attempted for this student session
    setExamAttempts(prev => ({ ...prev, [quiz.id]: resultRecord }));

    setCurrentStudent(prev => ({
      ...prev,
      points: prev.points + pointsEarned
    }));

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
  };

  const hasAttemptedExam = (quizId) => !!examAttempts[quizId];
  const getExamAttempt = (quizId) => examAttempts[quizId] || null;

  const adminAddLesson = (lessonData) => {
    const createdObj = {
      ...lessonData,
      id: 'les_' + Date.now(),
      viewsCount: 0,
      isUnlocked: false,
      comments: []
    };
    setLessons(prev => [createdObj, ...prev]);
    return createdObj;
  };

  const adminDeleteLesson = (lessonId) => {
    setLessons(prev => prev.filter(les => les.id !== lessonId));
  };

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
      setActiveWhatsAppModal
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
