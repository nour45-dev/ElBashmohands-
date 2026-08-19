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
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [questionInput, setQuestionInput] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Quiz Modal State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [userQuizAnswers, setUserQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScoreResult, setQuizScoreResult] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);

  const lesson = lessons.find(l => l.id === lessonId) || lessons[0];

  if (!lesson) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-black text-slate-800">الحصة غير موجودة</h2>
        <button onClick={() => setCurrentTab('home')} className="btn-primary">العودة للرئيسية</button>
      </div>
    );
  }

  const isUnlocked = lesson.isFree || (student.unlockedLessons && student.unlockedLessons.includes(lesson.id));
  const isVideoAccessible = userRole === 'admin' || isUnlocked;

  // Quiz & Attempt info
  const quiz = lesson.quiz;
  const alreadyAttempted = quiz ? hasAttemptedExam(quiz.id) : false;
  const previousAttempt = quiz ? getExamAttempt(quiz.id) : null;

  const formattedEmbedUrl = formatVideoEmbedUrl(lesson.videoUrl);

  const handleUnlockWithWallet = () => {
    if (student.walletBalance < lesson.price) {
      alert(`رصيد المحفظة (${student.walletBalance} ج) لا يكفي لسعر الحصة (${lesson.price} ج). يرجى شحن المحفظة أولاً من تبويب المحفظة.`);
      return;
    }
    setIsUnlocking(true);
    setTimeout(() => {
      unlockLesson(lesson.id, lesson.price, false);
      setIsUnlocking(false);
    }, 400);
  };

  const handleUnlockWithMonthlyCredit = () => {
    if (!student.monthlyCreditsLeft || student.monthlyCreditsLeft <= 0) {
      alert('لقد استهلكت جميع الحصص المتاحة في اشتراكك الشهري لهذا الشهر (8 حصص).');
      return;
    }
    setIsUnlocking(true);
    setTimeout(() => {
      unlockLesson(lesson.id, 0, true);
      setIsUnlocking(false);
    }, 400);
  };

  const handleApplyCouponSubmit = (e) => {
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

  const handleOpenQuiz = () => {
    if (alreadyAttempted) return;
    setUserQuizAnswers({});
    setQuizSubmitted(false);
    setTimerExpired(false);
    setShowQuizModal(true);
  };

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
              🛡️ {userRole === 'admin' ? 'وضع معاينة المعلم' : `رقم الطالب: ${student.phone} | ${student.name}`}
            </div>

            {isVideoAccessible ? (
              <div 
                className="relative aspect-video w-full flex items-center justify-center bg-black"
                onContextMenu={(e) => e.preventDefault()}
              >
                {(lesson.videoType === 'file' || 
                  lesson.videoUrl?.includes('/uploads/') || 
                  lesson.videoUrl?.includes('.mp4') || 
                  lesson.videoUrl?.includes('.webm') || 
                  lesson.videoUrl?.startsWith('blob:')) ? (
                  <video
                    src={lesson.videoUrl}
                    controls
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    autoPlay
                    className="w-full h-full rounded-2xl object-contain bg-black"
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

                {/* Direct Wallet Balance Unlock */}
                <button
                  onClick={handleUnlockWithWallet}
                  disabled={isUnlocking}
                  className="btn-primary text-xs font-black px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all"
                >
                  فتح الحصة برصيد المحفظة ({lesson.price} ج) 💳
                </button>
              </div>
            )}
            
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>🛡️ حماية مشغل فيديو المعلم مفعلة: يمنع التحميل أو تسجيل الشاشة.</span>
              <span className="font-mono text-amber-400">{lesson.duration}</span>
            </div>
          </div>

          {/* Lesson Title & Details */}
          <div className="card space-y-3">
            <h1 className="text-xl md:text-2xl font-black text-slate-900">{lesson.title}</h1>
            <p className="text-xs leading-relaxed text-slate-600 font-medium">{lesson.description}</p>
          </div>

          {/* Subtabs: Notes, Quiz, Questions */}
          <div className="card space-y-6">
            <div className="flex border-b border-slate-100 pb-3 gap-2">
              <button
                onClick={() => setActiveSubTab('notes')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeSubTab === 'notes' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                المذكرة وملفات PDF 📄
              </button>

              {lesson.quiz && (
                <button
                  onClick={() => setActiveSubTab('quiz')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeSubTab === 'quiz' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  الواجب والاختبار 📝
                </button>
              )}

              <button
                onClick={() => setActiveSubTab('qa')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeSubTab === 'qa' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                اسأل المستر 💬
              </button>
            </div>

            {/* Notes Body */}
            {activeSubTab === 'notes' && (
              <div className="space-y-4">
                {lesson.pdfUrl ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                        PDF
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">مذكرة شرح الحصة والتدريبات</h4>
                        <span className="text-[10px] text-slate-500">جاهزة للعرض والتحميل</span>
                      </div>
                    </div>
                    <a
                      href={lesson.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-accent text-xs font-black px-4 py-2 rounded-xl"
                    >
                      تحميل المذكرة 📥
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">لا توجد ملفات مرفقة مع هذه الحصة.</p>
                )}
              </div>
            )}

            {/* Quiz Body */}
            {activeSubTab === 'quiz' && lesson.quiz && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{lesson.quiz.title}</h4>
                      <p className="text-xs text-slate-500">{lesson.quiz.questions?.length || 0} أسئلة اختيار من متعدد</p>
                    </div>
                    {alreadyAttempted && (
                      <span className="badge badge-green">تم أداء الاختبار بنجاح ✓</span>
                    )}
                  </div>

                  {alreadyAttempted ? (
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="btn-primary text-xs font-black px-4 py-2 rounded-xl"
                      >
                        مراجعة نتيجتي وإجاباتي 📊
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleOpenQuiz}
                      className="btn-accent text-xs font-black px-6 py-2.5 rounded-xl shadow-lg"
                    >
                      بدء الاختبار الآن ⏱️
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Q&A Body */}
            {activeSubTab === 'qa' && (
              <div className="space-y-4">
                <form onSubmit={handlePostQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder="اكتب سؤالك للمستر حول هذه الحصة..."
                    className="input-field flex-1 text-xs"
                  />
                  <button type="submit" className="btn-primary text-xs px-4 py-2 rounded-xl">
                    إرسال
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

        {/* Sidebar: Lesson Playlist & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="card space-y-4">
            <h3 className="font-black text-sm text-slate-900 flex items-center justify-between">
              <span>قائمة الحصص 📚</span>
              <span className="badge badge-blue">{lessons.filter(l => l.subject === lesson.subject).length} حصة</span>
            </h3>

            <div className="space-y-2 max-h-[450px] overflow-y-auto">
              {lessons.filter(l => l.subject === lesson.subject).map(item => {
                const isSelected = item.id === lesson.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLessonId(item.id)}
                    className={`w-full p-3 rounded-2xl border text-right transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs' 
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black truncate max-w-[180px]">{item.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{item.duration || 'حصة مسجلة'} • {item.isFree ? 'مجاني' : `${item.price} ج`}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Review Modal */}
      {showReviewModal && previousAttempt && (
        <QuizReviewModal attempt={previousAttempt} onClose={() => setShowReviewModal(false)} />
      )}

    </div>
  );
};
