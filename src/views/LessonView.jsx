import React, { useState, useEffect, useRef } from 'react';
import { useApp, formatVideoEmbedUrl } from '../context/AppContext';
import { 
  Play, 
  Lock, 
  FileText, 
  MessageSquare, 
  Award, 
  Download, 
  ShieldAlert, 
  Send, 
  User, 
  ArrowRight,
  ArrowLeft,
  Ticket,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Check,
  Zap,
  Clock,
  ChevronRight,
  Eye,
  XCircle
} from 'lucide-react';

// ─── Timer component ────────────────────────────────────────────────────────
const ExamTimer = ({ totalSeconds, onExpire }) => {
  const [remaining, setRemaining] = useState(totalSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire();
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');
  const isLow = remaining <= 60;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${isLow ? 'bg-rose-100 text-rose-700 border-rose-400 animate-pulse' : 'bg-amber-50 text-amber-700 border-amber-300'}`}>
      <Clock className="w-3.5 h-3.5" />
      <span>{mins}:{secs}</span>
      {isLow && <span>⚠️</span>}
    </div>
  );
};

// ─── Quiz Review Modal (after submission) ───────────────────────────────────
const QuizReviewModal = ({ attempt, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white max-w-xl w-full p-6 md:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-5 text-right relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-900 text-xs font-black bg-slate-100 px-3 py-1.5 rounded-xl"
        >
          إغلاق
        </button>

        {/* Score Header */}
        <div className="text-center space-y-2 pb-4 border-b border-slate-100">
          <div className="text-3xl">{attempt.percentage >= 80 ? '🌟' : attempt.percentage >= 60 ? '👍' : '❌'}</div>
          <h3 className="font-black text-slate-900 text-lg">{attempt.quizTitle}</h3>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="font-black text-slate-800">الدرجة: <span className="text-blue-600">{attempt.score}/{attempt.total}</span></span>
            <span className={`font-black px-3 py-1 rounded-xl ${attempt.percentage >= 80 ? 'bg-emerald-100 text-emerald-700' : attempt.percentage >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
              {attempt.percentage}% — {attempt.status}
            </span>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-4">
          <h4 className="font-black text-slate-800 text-sm">مراجعة الأسئلة والإجابات:</h4>
          {(attempt.questions || []).map((q, idx) => {
            const userIdx = attempt.userAnswers?.[idx];
            const correct = q.correctIndex;
            const isCorrect = userIdx === correct;
            return (
              <div key={idx} className={`p-4 rounded-2xl border space-y-2.5 ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-black text-slate-900">س{idx + 1}: {q.question}</span>
                  {isCorrect 
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  }
                </div>
                <div className="space-y-1.5">
                  {q.options.map((opt, optIdx) => {
                    const isUserAnswer = userIdx === optIdx;
                    const isCorrectAnswer = correct === optIdx;
                    let cls = 'bg-white border-slate-200 text-slate-700';
                    if (isCorrectAnswer) cls = 'bg-emerald-600 text-white border-emerald-600';
                    else if (isUserAnswer && !isCorrect) cls = 'bg-rose-500 text-white border-rose-500';
                    return (
                      <div key={optIdx} className={`w-full text-right px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between ${cls}`}>
                        <span>{opt}</span>
                        <div className="flex items-center gap-1 text-[10px] font-black">
                          {isCorrectAnswer && <span>✅ صح</span>}
                          {isUserAnswer && !isCorrect && <span>❌ إجابتك</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Main LessonView ─────────────────────────────────────────────────────────
export const LessonView = ({ lessonId, setCurrentTab, setSelectedLessonId }) => {
  const { 
    lessons, 
    student, 
    userRole, 
    unlockLesson, 
    applyCoupon,
    videoQuestions, 
    addStudentQuestion,
    recordExamResult,
    triggerWhatsAppSend,
    triggerSmsSend,
    hasAttemptedExam,
    getExamAttempt,
    adminIdentity
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('notes');
  const [questionInput, setQuestionInput] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [unlockMessage, setUnlockMessage] = useState(null);

  // Quiz Modal State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userQuizAnswers, setUserQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScoreResult, setQuizScoreResult] = useState(null);
  const [timerExpired, setTimerExpired] = useState(false);

  // Playlist Subject Filter ('programming' or 'arabic')
  const [playlistSubject, setPlaylistSubject] = useState('programming');

  const isSayedAdmin = userRole === 'admin' && adminIdentity === 'mr_sayed';
  const isNourAdmin = userRole === 'admin' && adminIdentity === 'eng_nour';

  const subjectFilteredAllLessons = lessons.filter(les => {
    const isArabic = les.subject === 'اللغة العربية' || les.subject?.includes('عرب');
    if (isSayedAdmin && !isArabic) return false;
    if (isNourAdmin && isArabic) return false;
    return true;
  });

  const lesson = (subjectFilteredAllLessons && subjectFilteredAllLessons.length > 0)
    ? (subjectFilteredAllLessons.find(les => les.id === lessonId) || subjectFilteredAllLessons[0])
    : null;

  // Sync playlist subject when lesson changes
  useEffect(() => {
    if (lesson) {
      const isArab = lesson.subject === 'اللغة العربية' || lesson.subject?.includes('عرب');
      setPlaylistSubject(isArab ? 'arabic' : 'programming');
    }
  }, [lessonId, lesson]);

  if (!lessons || lessons.length === 0 || !lesson) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mx-auto font-black">
          💻
        </div>
        <h3 className="font-black text-xl text-slate-900">لا توجد حصص مرفوعة حالياً</h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          المنصة جاهزة 100%. قم بالدخول كباشمهندس (الأدمن) لرفع أول حصة برمجة وتجربة تشغيل ملف الفيديو المرفوع من جهازك!
        </p>
        <button
          onClick={() => setCurrentTab('home')}
          className="btn-primary text-xs font-black px-6 py-3 rounded-xl"
        >
          العودة للرئيسية 🚀
        </button>
      </div>
    );
  }

  const lessonQuestions = videoQuestions ? videoQuestions.filter(q => q.lessonId === lesson.id) : [];

  // Filter lessons for sidebar playlist: Grade + Subject
  const gradeFilteredLessons = (userRole === 'admin' ? subjectFilteredAllLessons : subjectFilteredAllLessons.filter(les => les.grade === student?.grade))
    .filter(les => {
      const isArab = les.subject === 'اللغة العربية' || les.subject?.includes('عرب');
      return playlistSubject === 'arabic' ? isArab : !isArab;
    });

  const currentIdx = gradeFilteredLessons.findIndex(l => l.id === lesson.id);
  const nextLesson = currentIdx >= 0 && currentIdx < gradeFilteredLessons.length - 1
    ? gradeFilteredLessons[currentIdx + 1]
    : null;

  // Exam state helpers
  const quiz = lesson.attachedQuiz;
  const alreadyAttempted = quiz ? hasAttemptedExam(quiz.id) : false;
  const attemptRecord = quiz ? getExamAttempt(quiz.id) : null;

  // Next video unlocked if: no exam for this lesson, OR exam was attempted AND passed
  const canGoNextVideo = !quiz || (alreadyAttempted && attemptRecord?.passed);

  // Admin bypasses paywall automatically! Student needs free or unlocked.
  const isVideoAccessible = (userRole === 'admin') || (lesson.price === 0) || lesson.isUnlocked;

  // Format embed URL for YouTube / web videos
  const formattedEmbedUrl = formatVideoEmbedUrl(lesson.videoUrl);

  // Unlock via Wallet cash balance
  const handleUnlockWithWallet = () => {
    const res = unlockLesson(lesson.id, lesson.price, false);
    setUnlockMessage(res.message);
  };

  // Unlock via 1 Monthly Subscription Credit (out of 8)
  const handleUnlockWithMonthlyCredit = () => {
    const res = unlockLesson(lesson.id, lesson.price, true);
    setUnlockMessage(res.message);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponFeedback(null);
    const res = applyCoupon(couponInput, lesson.price);
    setCouponFeedback(res);
    if (res.success) {
      unlockLesson(lesson.id, res.finalPrice, false);
    }
  };

  const handlePostQuestion = (e) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    addStudentQuestion(lesson.id, questionInput);
    setQuestionInput('');
  };

  // Open quiz modal (only if not already attempted)
  const handleOpenQuiz = () => {
    if (alreadyAttempted) return;
    setUserQuizAnswers({});
    setQuizSubmitted(false);
    setTimerExpired(false);
    setShowQuizModal(true);
  };

  // Submit quiz answers (called manually or by timer expiry)
  const handleQuizSubmit = (autoSubmit = false) => {
    if (!quiz || quizSubmitted) return;
    const { resultRecord, waPayload } = recordExamResult(quiz, userQuizAnswers);
    setQuizScoreResult(resultRecord);
    setQuizSubmitted(true);

    if (waPayload) {
      triggerWhatsAppSend(waPayload, 'parent');
      triggerSmsSend(waPayload, 'parent');
    }
  };

  const handleTimerExpire = () => {
    setTimerExpired(true);
    handleQuizSubmit(true);
  };

  // EXAM_DURATION: 20 min per exam (1200 seconds), adjustable
  const EXAM_DURATION = 20 * 60;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentTab('home')}
          className="inline-flex items-center gap-2 text-xs font-black text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>

        <div className="flex items-center gap-2">
          {userRole === 'admin' && (
            <span className="badge badge-green">معاينة الأدمن (مفتوح بالكامل) 🔐</span>
          )}
          <span className="badge badge-amber">{lesson.grade === '3sec' ? 'ثانوية عامة' : 'صف ثانوي'}</span>
          <span className="badge badge-blue">{lesson.subject}</span>
        </div>
      </div>

      {/* Main Video & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Video Player Workspace */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Video Player Box */}
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative select-none">
            
            {/* Security Watermark */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none opacity-40 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-mono text-amber-300 border border-amber-500/30 animate-pulse">
              🛡️ {userRole === 'admin' ? 'وضع معاينة الباشمهندس' : `رقم الطالب: ${student.phone} | ${student.name}`}
            </div>

            {isVideoAccessible ? (
              <div 
                className="relative aspect-video w-full flex items-center justify-center bg-black"
                onContextMenu={(e) => e.preventDefault()}
              >
                {lesson.videoType === 'file' ? (
                  <video
                    src={lesson.videoUrl}
                    controls
                    controlsList="nodownload no picture-in-picture"
                    onContextMenu={(e) => e.preventDefault()}
                    autoPlay
                    className="w-full h-full rounded-2xl object-contain"
                  />
                ) : (
                  <iframe
                    src={formattedEmbedUrl}
                    title={lesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            ) : (
              <div className="aspect-video w-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Lock className="w-8 h-8" />
                </div>
                
                <div className="space-y-1 max-w-md">
                  <h3 className="font-black text-xl">الحصة مغلقة تتطلب الشراء أو كود الخصم</h3>
                  <p className="text-xs text-slate-400">
                    قيمتها <span className="text-amber-400 font-bold">{lesson.price} جنيه</span>. يمكنك تفعيلها بالمحفظة، أو بالكود، أو برصيد الـ 8 حصص المتاحة باشتراكك الشهري!
                  </p>
                </div>

                {/* Monthly Subscription Credit Unlock */}
                {student.subscriptionType === 'شهري' && (student.monthlyCreditsLeft || 0) > 0 && (
                  <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30 w-full max-w-md space-y-2">
                    <div className="text-xs font-black text-amber-300 flex items-center justify-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>متاح باشتراكك الشهري رصيد: ({student.monthlyCreditsLeft}/8 حصص)</span>
                    </div>
                    <button
                      onClick={handleUnlockWithMonthlyCredit}
                      className="w-full btn-accent text-xs font-black py-2.5 rounded-xl justify-center shadow-lg shadow-amber-500/20"
                    >
                      فتح هذه الحصة مجاناً باستهلاك 1 حصة شهرية 🎓
                    </button>
                  </div>
                )}

                {/* Coupon Form */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2 max-w-sm w-full pt-1">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="ادخل كود الخصم (مثل: FREE100)..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-400 focus:ring-2 focus:ring-amber-500 outline-none dir-ltr"
                  />
                  <button
                    type="submit"
                    className="btn-accent text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1"
                  >
                    <Ticket className="w-4 h-4" />
                    تطبيق الكود
                  </button>
                </form>

                {couponFeedback && (
                  <div className={`p-2.5 rounded-xl text-xs font-bold ${couponFeedback.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                    {couponFeedback.message}
                  </div>
                )}

                {unlockMessage && (
                  <div className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold p-2.5 rounded-xl">
                    {unlockMessage}
                  </div>
                )}

                {/* Wallet Cash Unlock */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleUnlockWithWallet}
                    className="btn-primary text-xs font-black px-6 py-3 rounded-xl shadow-lg"
                  >
                    خصم {lesson.price} ج.م من المحفظة 💳
                  </button>

                  <button
                    onClick={() => setCurrentTab('wallet')}
                    className="btn-outline text-white border-white/20 hover:bg-white/10 text-xs px-4 py-3 rounded-xl"
                  >
                    شحن الرصيد / الاشتراك
                  </button>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-slate-900 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                <span>حماية مشغل فيديو الباشمهندس مفعلة: يمنع التحميل أو تسجيل الشاشة.</span>
              </div>
              <span className="text-slate-400">{lesson.duration}</span>
            </div>
          </div>

          {/* ── NEXT VIDEO BUTTON ── */}
          {isVideoAccessible && nextLesson && (
            <div className="bg-gradient-to-l from-slate-900 to-slate-800 rounded-2xl p-4 flex items-center justify-between border border-slate-700 shadow-lg">
              <div className="space-y-1">
                <div className="text-xs font-black text-slate-400">الفيديو التالي:</div>
                <div className="text-sm font-black text-white line-clamp-1">{nextLesson.title}</div>
                {!canGoNextVideo && (
                  <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    يجب إجتياز امتحان هذه الحصة أولاً للمتابعة
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (canGoNextVideo) {
                    setSelectedLessonId(nextLesson.id);
                  } else {
                    // Scroll to the quiz section and highlight it
                    setActiveSubTab('notes');
                    const quizEl = document.getElementById('quiz-section');
                    if (quizEl) quizEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className={`flex items-center gap-2 text-xs font-black px-5 py-3 rounded-xl transition-all shadow-md ${canGoNextVideo ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-slate-900'}`}
              >
                {canGoNextVideo ? (
                  <>الفيديو التالي <ArrowLeft className="w-4 h-4" /></>
                ) : (
                  <>امتحن الآن 📝 <Lock className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          )}

          {/* Lesson Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
              {lesson.title}
            </h1>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {lesson.description}
            </p>

            {/* Workspace Subtabs */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 border-b pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveSubTab('notes')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${activeSubTab === 'notes' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <FileText className="w-4 h-4" />
                المحتوى المرفق (PDF / Word / امتحان)
              </button>

              <button
                onClick={() => setActiveSubTab('discussion')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${activeSubTab === 'discussion' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <MessageSquare className="w-4 h-4" />
                الأسئلة واستفسارات الطلاب ({lessonQuestions.length})
              </button>
            </div>

            {/* Subtab 1: Attachments */}
            {activeSubTab === 'notes' && (
              <div className="space-y-4 animate-in fade-in">
                
                {/* PDF or Word Attachment */}
                {lesson.attachmentPdf && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {lesson.attachmentType === 'word' ? 'DOC' : 'PDF'}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">{lesson.attachmentPdf}</div>
                        <div className="text-[10px] text-slate-500 font-bold">ملف ومذكرة كورس البرمجة المرفقة</div>
                      </div>
                    </div>

                    <a 
                      href={lesson.attachmentFileUrl || '#'}
                      download={lesson.attachmentPdf || 'مذكرة_الحصة.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!lesson.attachmentFileUrl) {
                          e.preventDefault();
                          alert(`تنبيه: تم إرفاق ملف "${lesson.attachmentPdf}". يمكنك تحميله بمجرد اختيار الملف الأصلي عند إنشاء الحصة.`);
                        }
                      }}
                      className="btn-primary text-xs font-extrabold px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل / فتح المستند 📄</span>
                    </a>
                  </div>
                )}

                {/* Attached Quiz */}
                {quiz && (
                  <div id="quiz-section">
                    {alreadyAttempted ? (
                      /* Already attempted — show result + review */
                      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3 border border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-xs font-black flex items-center gap-1.5 text-amber-400">
                              <Award className="w-4 h-4" />
                              {quiz.title}
                            </div>
                            <div className="text-sm font-black">
                              نتيجتك: <span className={`${attemptRecord?.percentage >= 80 ? 'text-emerald-400' : attemptRecord?.percentage >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                                {attemptRecord?.score}/{attemptRecord?.total} ({attemptRecord?.percentage}%)
                              </span>
                              {' '}— {attemptRecord?.status}
                            </div>
                          </div>
                          <div className="text-3xl">{attemptRecord?.percentage >= 80 ? '🌟' : attemptRecord?.percentage >= 60 ? '👍' : '❌'}</div>
                        </div>

                        <div className={`text-[10px] font-bold px-3 py-1.5 rounded-xl w-fit ${attemptRecord?.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                          {attemptRecord?.passed ? '✅ تم اجتياز الامتحان — يمكنك الانتقال للفيديو التالي' : '❌ لم تجتز الامتحان — راجع الأخطاء بالأسفل'}
                        </div>

                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-xs font-black px-4 py-2 rounded-xl transition-all border border-white/20"
                        >
                          <Eye className="w-4 h-4" />
                          مراجعة الأخطاء والإجابات الصحيحة 🔍
                        </button>
                      </div>
                    ) : (
                      /* Not yet attempted */
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-5 rounded-2xl shadow-md flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-xs font-black flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 fill-slate-950" />
                            <span>امتحان إلكتروني تفاعلي (عدد الأسئلة: {quiz.questions.length}) 📝</span>
                          </div>
                          <div className="text-xs font-extrabold opacity-90">{quiz.title}</div>
                          <div className="text-[10px] font-bold opacity-70 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            مدة الامتحان: 20 دقيقة — مرة واحدة فقط
                          </div>
                        </div>

                        <button
                          onClick={handleOpenQuiz}
                          className="bg-slate-950 text-amber-400 hover:bg-slate-900 text-xs font-black px-5 py-2.5 rounded-xl shadow-lg transition-all"
                        >
                          بدء الامتحان 🚀
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!quiz && !lesson.attachmentPdf && (
                  <div className="text-center py-6 text-xs text-slate-400 font-bold">
                    لا يوجد ملفات أو امتحانات مرفقة بهذه الحصة حتى الآن.
                  </div>
                )}
              </div>
            )}

            {/* Subtab 2: Video Q&A */}
            {activeSubTab === 'discussion' && (
              <div className="space-y-4 animate-in fade-in">
                <form onSubmit={handlePostQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder="اكتب سؤالك في كود الحصة للباشمهندس..."
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="btn-primary text-xs font-bold px-4 py-2.5 rounded-xl flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    إرسال السؤال
                  </button>
                </form>

                <div className="space-y-3 pt-2">
                  {lessonQuestions.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 font-bold">لا توجد أسئلة سابقة. اسأل الباشمهندس وسيجيبك فوراً! 💬</div>
                  ) : (
                    lessonQuestions.map(q => (
                      <div key={q.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-right space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            {q.studentName}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${q.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {q.status === 'answered' ? 'تم الرد ✅' : 'قيد المراجعة ⏳'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 font-medium leading-relaxed pr-5">
                          {q.questionText}
                        </p>

                        {q.replyText && (
                          <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 space-y-1 text-xs mt-2">
                            <div className="font-black text-blue-900 flex items-center gap-1">
                              <span>رد الباشمهندس الرسمي:</span>
                              <span className="text-[10px] text-slate-500">({q.repliedAt})</span>
                            </div>
                            <p className="text-slate-800 font-bold leading-relaxed">{q.replyText}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Playlist */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-xs">قائمة الحصص 📚</h3>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPlaylistSubject('programming')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${playlistSubject === 'programming' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'}`}
                >
                  💻 البرمجة
                </button>
                <button
                  type="button"
                  onClick={() => setPlaylistSubject('arabic')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${playlistSubject === 'arabic' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600'}`}
                >
                  📖 العربي
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {gradeFilteredLessons.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-bold">
                  لا توجد حصص في مادة {playlistSubject === 'arabic' ? 'اللغة العربية' : 'البرمجة'} لهذا الصف حالياً.
                </div>
              ) : (
                gradeFilteredLessons.map(les => (
                <div 
                  key={les.id}
                  onClick={() => setSelectedLessonId(les.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${les.id === lesson.id ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${les.id === lesson.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 line-clamp-1">{les.title}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{les.duration} • {les.price === 0 ? 'مجاني' : `${les.price} ج.م`}</div>
                    </div>
                  </div>
                  {/* Show exam status badge per lesson */}
                  {les.attachedQuiz && hasAttemptedExam(les.attachedQuiz.id) && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  )}
                </div>
              )))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Quiz Modal ── */}
      {showQuizModal && quiz && !alreadyAttempted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-xl w-full p-6 md:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6 text-right relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-lg">{quiz.title}</h3>
                <p className="text-xs text-slate-500 font-bold">
                  {quizSubmitted ? 'تم التسليم — شاهد نتيجتك أدناه' : 'أجب على جميع الأسئلة. المدة: 20 دقيقة. مرة واحدة فقط!'}
                </p>
              </div>

              {/* Live Timer (only while quiz is active) */}
              {!quizSubmitted && (
                <ExamTimer totalSeconds={EXAM_DURATION} onExpire={handleTimerExpire} />
              )}
            </div>

            {timerExpired && !quizSubmitted && (
              <div className="bg-rose-100 text-rose-800 text-xs font-black p-3 rounded-xl border border-rose-300 text-center">
                ⏰ انتهى الوقت! جارٍ تسليم إجاباتك تلقائياً...
              </div>
            )}

            {!quizSubmitted ? (
              <div className="space-y-6">
                {quiz.questions.map((q, idx) => (
                  <div key={q.id || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="text-xs font-black text-slate-900">س{idx + 1}: {q.question}</div>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => setUserQuizAnswers({ ...userQuizAnswers, [idx]: optIdx })}
                          className={`w-full text-right p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${userQuizAnswers[idx] === optIdx ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                        >
                          <span>{opt}</span>
                          {userQuizAnswers[idx] === optIdx && <Check className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => handleQuizSubmit(false)}
                  className="w-full btn-accent text-xs font-black py-3.5 rounded-xl justify-center shadow-lg shadow-amber-500/20"
                >
                  تسليم الامتحان الآن 🚀
                </button>
              </div>
            ) : (
              /* Result after submission */
              <div className="text-center py-6 space-y-4">
                <div className="text-5xl">{quizScoreResult?.percentage >= 80 ? '🌟' : quizScoreResult?.percentage >= 60 ? '👍' : '❌'}</div>
                <h4 className="font-black text-xl text-slate-900">
                  {timerExpired ? 'تم التسليم التلقائي بانتهاء الوقت!' : 'تم تسليم الامتحان!'}
                </h4>
                <p className="text-sm font-black text-slate-700">
                  درجتك: <span className="text-blue-600">{quizScoreResult?.score}</span> من {quizScoreResult?.total} — ({quizScoreResult?.percentage}%)
                </p>
                <p className="text-xs font-bold text-slate-500">{quizScoreResult?.status}</p>

                <div className={`text-xs font-black p-3 rounded-xl ${quizScoreResult?.passed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {quizScoreResult?.passed 
                    ? '✅ أحسنت! يمكنك الآن الانتقال للفيديو التالي'
                    : '❌ لم تجتز الامتحان. راجع الأخطاء لتحسين فهمك.'}
                </div>

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => { setShowReviewModal(true); setShowQuizModal(false); }}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-xs font-black px-5 py-2.5 rounded-xl transition-all border border-slate-200"
                  >
                    <Eye className="w-4 h-4" />
                    مراجعة الإجابات
                  </button>

                  <button
                    onClick={() => setShowQuizModal(false)}
                    className="btn-primary text-xs font-black px-5 py-2.5 rounded-xl"
                  >
                    إغلاق
                  </button>
                </div>

                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-bold space-y-1 border border-emerald-200">
                  <div>تم توجيه تقرير النتيجة الموثق تلقائياً لواتساب ورسائل SMS لولي الأمر ✅</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Review Modal (mistakes review) ── */}
      {showReviewModal && attemptRecord && (
        <QuizReviewModal
          attempt={attemptRecord}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
};
