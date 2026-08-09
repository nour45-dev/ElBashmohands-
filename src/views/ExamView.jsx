import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Send, 
  Sparkles, 
  FileText, 
  MessageSquare, 
  RefreshCw,
  PhoneCall,
  ArrowRight,
  TrendingUp,
  Lock,
  Eye,
  Play
} from 'lucide-react';

// ─── Review Modal ────────────────────────────────────────────────────────────
const ReviewModal = ({ attempt, onClose }) => (
  <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
    <div className="bg-white max-w-xl w-full p-6 md:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-5 text-right relative max-h-[90vh] overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 left-4 text-slate-400 hover:text-slate-900 text-xs font-black bg-slate-100 px-3 py-1.5 rounded-xl"
      >
        إغلاق ✕
      </button>

      {/* Score header */}
      <div className="text-center space-y-2 pb-4 border-b border-slate-100">
        <div className="text-4xl">{attempt.percentage >= 80 ? '🌟' : attempt.percentage >= 60 ? '👍' : '❌'}</div>
        <h3 className="font-black text-slate-900 text-lg">{attempt.quizTitle}</h3>
        <div className="flex items-center justify-center gap-4">
          <span className="text-sm font-black text-slate-800">
            الدرجة: <span className="text-blue-600">{attempt.score}/{attempt.total}</span>
          </span>
          <span className={`text-xs font-black px-3 py-1 rounded-xl ${attempt.percentage >= 80 ? 'bg-emerald-100 text-emerald-700' : attempt.percentage >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
            {attempt.percentage}% — {attempt.status}
          </span>
        </div>
      </div>

      {/* Questions review */}
      <div className="space-y-4">
        <h4 className="font-black text-slate-800 text-sm">مراجعة الأسئلة والإجابات الصحيحة:</h4>
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
                  const isUser = userIdx === optIdx;
                  const isRight = correct === optIdx;
                  let cls = 'bg-white border-slate-200 text-slate-700';
                  if (isRight) cls = 'bg-emerald-600 text-white border-emerald-600';
                  else if (isUser && !isCorrect) cls = 'bg-rose-500 text-white border-rose-500';
                  return (
                    <div key={optIdx} className={`w-full text-right px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between ${cls}`}>
                      <span>{opt}</span>
                      <span className="text-[10px] font-black">
                        {isRight && '✅ صح'}
                        {isUser && !isCorrect && '❌ إجابتك'}
                      </span>
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

// ─── Main ExamView ────────────────────────────────────────────────────────────
export const ExamView = ({ setCurrentTab }) => {
  const {
    quizzes,
    lessons,
    student,
    recordExamResult,
    examHistory,
    hasAttemptedExam,
    getExamAttempt,
    setActiveWhatsAppModal,
    adminIdentity,
    userRole
  } = useApp();

  const [activeQuiz, setActiveQuiz]       = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers]     = useState({});
  const [timeLeft, setTimeLeft]           = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [resultSummary, setResultSummary] = useState(null);
  const [reviewAttempt, setReviewAttempt] = useState(null);

  const isSayedAdmin = userRole === 'admin' && adminIdentity === 'mr_sayed';
  const isNourAdmin = userRole === 'admin' && adminIdentity === 'eng_nour';

  // Build full quiz list from lessons + standalone quizzes
  const allLessonsWithQuiz = lessons.filter(l => {
    if (isSayedAdmin) {
      const isArabic = l.subject === 'اللغة العربية' || l.subject?.includes('عرب');
      if (!isArabic) return false;
    }
    if (isNourAdmin) {
      const isArabic = l.subject === 'اللغة العربية' || l.subject?.includes('عرب');
      if (isArabic) return false;
    }
    return l.attachedQuiz;
  });

  const dynamicQuizzes = [
    ...quizzes.filter(q => {
      const les = lessons.find(l => l.id === q.lessonId || l.attachedQuiz?.id === q.id);
      const isArabic = les ? (les.subject === 'اللغة العربية' || les.subject?.includes('عرب')) : q.subject === 'اللغة العربية';
      if (isSayedAdmin && !isArabic) return false;
      if (isNourAdmin && isArabic) return false;
      return true;
    }),
    ...allLessonsWithQuiz.map(l => ({
      ...l.attachedQuiz,
      durationMinutes: l.attachedQuiz.durationMinutes || 20,
      totalQuestions: l.attachedQuiz.questions.length
    }))
  ];

  // Timer countdown
  useEffect(() => {
    if (!activeQuiz || quizCompleted) return;
    if (timeLeft <= 0) { handleSubmitExam(); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, quizCompleted, timeLeft]);

  const handleStartExam = (quiz) => {
    if (hasAttemptedExam(quiz.id)) return; // safety guard
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setTimeLeft((quiz.durationMinutes || 20) * 60);
    setQuizCompleted(false);
    setResultSummary(null);
  };

  const handleSelectOption = (qIdx, optionIdx) => {
    setUserAnswers(prev => ({ ...prev, [qIdx]: optionIdx }));
  };

  const handleSubmitExam = () => {
    if (!activeQuiz) return;
    const { resultRecord, waPayload } = recordExamResult(activeQuiz, userAnswers);
    setResultSummary({ resultRecord, waPayload });
    setQuizCompleted(true);
    if (resultRecord.percentage >= 70) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }
    if (waPayload) setActiveWhatsAppModal(waPayload);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLowTime = timeLeft <= 60;

  // ─── Quiz List Screen ───────────────────────────────────────────────────
  if (!activeQuiz) {
    return (
      <div className="space-y-8 pb-16">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 rounded-3xl border border-blue-800/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-right">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>نظام الاختبارات الإلكترونية والتصحيح الفوري</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">الامتحانات والواجبات الإلكترونية 📝</h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              اختبر مستواك في البرمجة، واحصل على التصحيح التلقائي فوراً، مع إرسال تقرير النتيجة لولي الأمر 📲
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-md">
            <Award className="w-10 h-10 text-amber-400" />
            <div className="text-right">
              <div className="text-xs text-slate-300 font-bold">إجمالي النقاط المكتسبة</div>
              <div className="text-xl font-black text-amber-400">+{student.points} نقطة 🏆</div>
            </div>
          </div>
        </div>

        {/* Available Quizzes Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">الامتحانات المتاحة ⚡</h3>
            <span className="text-xs font-bold text-slate-500">
              {dynamicQuizzes.filter(q => hasAttemptedExam(q.id)).length} / {dynamicQuizzes.length} مكتمل
            </span>
          </div>

          {dynamicQuizzes.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border text-center font-bold text-xs text-slate-500">
              لا توجد امتحانات إلكترونية حالياً. قم بإضافة امتحان من لوحة التحكم كباشمهندس وسيظهر هنا فوراً!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dynamicQuizzes.map((quiz, idx) => {
                const attempted = hasAttemptedExam(quiz.id);
                const attempt   = getExamAttempt(quiz.id);
                return (
                  <div
                    key={quiz.id || idx}
                    className={`bg-white p-6 rounded-3xl border shadow-md transition-all space-y-4 flex flex-col justify-between ${attempted ? 'border-slate-300 opacity-90' : 'border-slate-200/80 hover:shadow-xl'}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        {attempted ? (
                          <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${attempt?.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {attempt?.passed ? '✅ تم الاجتياز' : '❌ لم تجتز'}
                          </span>
                        ) : (
                          <span className="badge badge-amber">اختبار تفاعلي</span>
                        )}
                        <span className="badge badge-blue">+{quiz.rewardPoints || 50} نقطة</span>
                      </div>

                      <h4 className="font-black text-slate-900 text-lg">{quiz.title}</h4>

                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          {quiz.durationMinutes || 20} دقيقة
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="w-4 h-4 text-emerald-600" />
                          {quiz.questions ? quiz.questions.length : quiz.totalQuestions} سؤال
                        </span>
                        {attempted && (
                          <>
                            <span>•</span>
                            <span className={`font-black ${attempt?.percentage >= 80 ? 'text-emerald-600' : attempt?.percentage >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {attempt?.score}/{attempt?.total} ({attempt?.percentage}%)
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      {attempted ? (
                        <div className="flex items-center gap-2 w-full">
                          {/* Review mistakes button */}
                          <button
                            onClick={() => setReviewAttempt(attempt)}
                            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-4 py-2.5 rounded-xl border border-slate-200 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            مراجعة الأخطاء والإجابات
                          </button>

                          {/* Lock badge */}
                          <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 border border-slate-200 px-3 py-2.5 rounded-xl">
                            <Lock className="w-3.5 h-3.5" />
                            <span>مُحلول</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-1">
                            <span>تصحيح تلقائي + تقرير WhatsApp/SMS 📲</span>
                          </div>
                          <button
                            onClick={() => handleStartExam(quiz)}
                            className="btn-primary text-xs font-black px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20"
                          >
                            بدء الامتحان 🚀
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Exam History Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base">سجل الامتحانات والنتائج السابقة 📜</h3>
            <span className="text-xs text-slate-500 font-bold">مرتبة من الأحدث</span>
          </div>

          {examHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-bold">لم تحل أي امتحانات بعد.</div>
          ) : (
            <div className="space-y-3">
              {examHistory.map(hist => (
                <div
                  key={hist.id}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-right"
                >
                  <div className="space-y-1">
                    <div className="font-black text-slate-900 text-sm">{hist.quizTitle}</div>
                    <div className="text-xs text-slate-500 font-bold flex items-center gap-3">
                      <span>التاريخ: {hist.date}</span>
                      <span>•</span>
                      <span className={`font-black ${hist.percentage >= 80 ? 'text-emerald-700' : hist.percentage >= 60 ? 'text-amber-700' : 'text-rose-700'}`}>
                        النتيجة: {hist.score} / {hist.total} ({hist.percentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${hist.passed ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
                      {hist.status}
                    </span>

                    {/* Review button per history item */}
                    {hist.questions && hist.questions.length > 0 && (
                      <button
                        onClick={() => setReviewAttempt(hist)}
                        className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black px-3.5 py-1.5 rounded-xl border border-blue-200 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        مراجعة
                      </button>
                    )}

                    <button
                      onClick={() => setActiveWhatsAppModal({
                        studentName: student.name,
                        parentPhone: student.parentPhone,
                        gradeName: student.gradeName,
                        examTitle: hist.quizTitle,
                        score: hist.score,
                        total: hist.total,
                        percentage: hist.percentage,
                        pointsEarned: hist.pointsEarned,
                        date: hist.date
                      })}
                      className="btn-whatsapp text-xs font-black px-3.5 py-1.5 rounded-xl shadow-sm"
                    >
                      <span>إرسال لولي الأمر 💬</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {reviewAttempt && (
          <ReviewModal attempt={reviewAttempt} onClose={() => setReviewAttempt(null)} />
        )}
      </div>
    );
  }

  // ─── Active Exam Interface ──────────────────────────────────────────────
  const currentQ = activeQuiz.questions[currentQuestionIdx];

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">

      {/* Top Controls Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl flex items-center justify-between border border-slate-800 shadow-xl">
        <div>
          <h2 className="font-black text-base md:text-lg">{activeQuiz.title}</h2>
          <p className="text-xs text-slate-400 font-medium">سؤال {currentQuestionIdx + 1} من {activeQuiz.questions.length}</p>
        </div>

        {!quizCompleted && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-black dir-ltr ${isLowTime ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
            <Clock className={`w-4 h-4 ${isLowTime ? 'text-rose-400' : 'text-amber-400'}`} />
            <span>{formatTime(timeLeft)}</span>
            {isLowTime && <span>⚠️</span>}
          </div>
        )}
      </div>

      {/* Result Card */}
      {quizCompleted && resultSummary ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="text-5xl">{resultSummary.resultRecord.percentage >= 80 ? '🌟' : resultSummary.resultRecord.percentage >= 60 ? '👍' : '❌'}</div>

          <div className="space-y-2">
            <span className="badge badge-amber text-sm px-4 py-1">نتيجة الامتحان الفورية</span>
            <h3 className="text-2xl font-black text-slate-900">
              درجتك: <span className="text-blue-600">{resultSummary.resultRecord.score}</span> من{' '}
              <span className="text-slate-700">{resultSummary.resultRecord.total}</span>{' '}
              ({resultSummary.resultRecord.percentage}%)
            </h3>
            <p className="text-xs font-bold text-slate-500">
              تم إضافة <span className="text-amber-600 font-black">+{resultSummary.resultRecord.pointsEarned} نقطة</span> لرصيد حسابك!
            </p>
            <p className={`text-xs font-black ${resultSummary.resultRecord.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
              {resultSummary.resultRecord.passed ? '✅ تم اجتياز الامتحان!' : '❌ لم تجتز الامتحان. راجع الأخطاء.'}
            </p>
          </div>

          {/* WhatsApp Report */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 p-5 rounded-2xl text-right space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                <Send className="w-5 h-5 text-emerald-600" />
                <span>إرسال تقرير النتيجة لولي الأمر فوراً</span>
              </div>
              <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded">WhatsApp & SMS</span>
            </div>
            <button
              onClick={() => setActiveWhatsAppModal(resultSummary.waPayload)}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              📲 إرسال التقرير على الواتساب والـ SMS لولي الأمر الآن
            </button>
          </div>

          <div className="flex gap-3 justify-center">
            {/* Review mistakes */}
            <button
              onClick={() => setReviewAttempt(resultSummary.resultRecord)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-5 py-3 rounded-xl border border-slate-200 transition-all"
            >
              <Eye className="w-4 h-4" />
              مراجعة الأخطاء
            </button>

            <button
              onClick={() => setActiveQuiz(null)}
              className="btn-outline text-xs font-bold px-6 py-3 rounded-xl"
            >
              العودة للامتحانات
            </button>
          </div>
        </div>
      ) : (
        /* Question Card */
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">السؤال #{currentQuestionIdx + 1}</span>
            <h3 className="text-lg font-black text-slate-900 leading-snug">
              {currentQ ? currentQ.question : ''}
            </h3>
          </div>

          <div className="space-y-3">
            {currentQ && currentQ.options.map((optionText, optIdx) => {
              const isSelected = userAnswers[currentQuestionIdx] === optIdx;
              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQuestionIdx, optIdx)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 text-xs font-extrabold ${isSelected ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-400 text-transparent'}`}>
                    ✓
                  </div>
                  <span>{optionText}</span>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              className="btn-outline text-xs font-bold px-4 py-2.5 rounded-xl disabled:opacity-40"
            >
              السؤال السابق
            </button>

            <span className="text-xs font-black text-slate-500">
              {Object.keys(userAnswers).length} / {activeQuiz.questions.length} أسئلة مجاب عليها
            </span>

            {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                className="btn-primary text-xs font-black px-6 py-2.5 rounded-xl"
              >
                السؤال التالي
              </button>
            ) : (
              <button
                onClick={handleSubmitExam}
                className="btn-accent text-xs font-black px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20"
              >
                إنهاء وتسليم الامتحان 🏆
              </button>
            )}
          </div>
        </div>
      )}

      {/* Review modal while inside active-exam result */}
      {reviewAttempt && (
        <ReviewModal attempt={reviewAttempt} onClose={() => setReviewAttempt(null)} />
      )}
    </div>
  );
};
