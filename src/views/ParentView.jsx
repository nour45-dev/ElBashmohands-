import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Award, 
  CheckCircle2, 
  Send, 
  Flame, 
  Wallet, 
  BookOpen, 
  Radio, 
  TrendingUp, 
  Star, 
  Clock, 
  Calendar, 
  Sparkles, 
  MessageCircle,
  HelpCircle,
  BarChart3
} from 'lucide-react';

export const ParentView = () => {
  const { 
    student, 
    studentsDB = [], 
    examHistory = [], 
    lessons = [], 
    liveSessionsDB = [], 
    setActiveWhatsAppModal, 
    userRole 
  } = useApp();

  // Admin preview selector, for parents/students defaults to the current active student
  const [selectedStudentId, setSelectedStudentId] = useState(student?.id || (studentsDB[0]?.id || ''));
  const currentTargetStudent = (userRole === 'admin' ? studentsDB.find(s => s.id === selectedStudentId) : null) || student || studentsDB[0] || {
    name: 'طالبنا العزيز',
    code: '3003',
    gradeName: 'الصف الثالث الثانوي (ثانوية عامة)',
    grade: '3sec',
    walletBalance: 0,
    points: 150,
    streakDays: 5,
    rank: 1
  };

  // Filter student exams
  const studentExams = examHistory.filter(e => e.studentId === currentTargetStudent.id || !e.studentId);
  
  // 100% Real Average Exam Score & Overall Percentage (NO fake benchmarks)
  const totalExamsCount = studentExams.length;
  const avgPercentage = totalExamsCount > 0 
    ? Math.round(studentExams.reduce((acc, curr) => acc + (Number(curr.percentage) || (curr.total ? (curr.score / curr.total) * 100 : 0)), 0) / totalExamsCount)
    : null;

  const getOverallGradeLabel = (pct) => {
    if (pct === null) return { label: 'في انتظار حل الامتحانات ⏳', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700' };
    if (pct >= 90) return { label: 'ممتاز جداً 🌟', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (pct >= 80) return { label: 'جيد جداً ⚡', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
    if (pct >= 65) return { label: 'جيد 👍', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: 'يحتاج متابعة ⚠️', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
  };

  const gradeInfo = getOverallGradeLabel(avgPercentage);

  // 100% Real Lessons progress
  const targetGradeLessons = lessons.filter(l => l.grade === currentTargetStudent.grade || l.grade === 'all' || !l.grade);
  const completedLessonsCount = (currentTargetStudent.completedLessons?.length) || (currentTargetStudent.unlockedLessons?.length) || 0;
  const lessonsProgressPct = targetGradeLessons.length > 0 
    ? Math.min(100, Math.round((completedLessonsCount / targetGradeLessons.length) * 100))
    : 0;

  // 100% Real Live Broadcast Attendance
  const targetLiveSessions = liveSessionsDB.filter(s => s.grade === currentTargetStudent.grade || s.grade === 'all' || !s.grade);
  const attendedLiveCount = currentTargetStudent.attendedLiveSessions?.length || 0;
  const liveAttendancePct = targetLiveSessions.length > 0 
    ? Math.min(100, Math.round((attendedLiveCount / targetLiveSessions.length) * 100))
    : 0;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto" dir="rtl">
      
      {/* ═══ Header Banner (بدون أي مربع بحث) ═══ */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-blue-500/30 shadow-xl relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-black px-3.5 py-1 rounded-full backdrop-blur-md">
              <Users className="w-4 h-4 text-amber-300" />
              <span>بوابة متابعة ولي الأمر المباشرة 👨‍👩‍👦</span>
            </div>

            <h1 className="text-xl md:text-3xl font-black flex items-center gap-2">
              <span>تقرير أداء الطالب:</span>
              <span className="text-amber-300 underline decoration-amber-400/50 underline-offset-4">{currentTargetStudent.name}</span>
            </h1>

            <p className="text-xs md:text-sm text-blue-100 font-medium max-w-2xl leading-relaxed">
              تقرير فوري ومحدث لحظياً يشمل درجات الامتحانات والواجبات، رصيد المحفظة، نسبة الحضور في الحصص والبث المباشر، والتقدير الكلي.
            </p>
          </div>

          {/* Admin Switcher only if Admin is inspecting */}
          {userRole === 'admin' && studentsDB.length > 0 && (
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-md space-y-1">
              <label className="text-[10px] font-black text-amber-300 block">معاينة كأدمن لطالب آخر:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none border border-slate-700 w-full"
              >
                {studentsDB.map(st => (
                  <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Overall Performance & Key Stats Grid ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. التقدير الكلي العام */}
        <div className="bg-white dark:bg-[#162534] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">التقدير الكلي للابن</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white font-mono">
              {avgPercentage !== null ? `${avgPercentage}%` : '—'}
            </div>
            <div className="mt-2">
              <span className={`text-xs font-black px-3 py-1 rounded-lg border ${gradeInfo.bg} ${gradeInfo.color}`}>
                {gradeInfo.label}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {totalExamsCount > 0 ? `متوسط ${totalExamsCount} امتحان تم حلهم` : 'لم يتم حل امتحانات حتى الآن'}
          </p>
        </div>

        {/* 2. رصيد محفظة الابن */}
        <div className="bg-white dark:bg-[#162534] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">رصيد المحفظة المتاح</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {currentTargetStudent.walletBalance || 0} <span className="text-base font-bold text-slate-500">ج.م</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-2">
              {currentTargetStudent.walletBalance > 0 ? 'رصيد كافي لشراء الحصص ⚡' : 'الرصيد الحالي 0 ج.م'}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">يستخدم في فتح الحصص والاختبارات</p>
        </div>

      </div>

      {/* ═══ Progress in Lessons & Live Broadcast ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Progress in Lessons */}
        <div className="bg-white dark:bg-[#162534] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm">مستوى التقدم في الحصص والدروس</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">نسبة إنهاء ومذاكرة فيديوهات المنهج</p>
              </div>
            </div>
            <span className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">{lessonsProgressPct}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div 
              className="bg-gradient-to-l from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${lessonsProgressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-bold pt-1">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>أكمل {completedLessonsCount} من أصل {targetGradeLessons.length} حصة</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {targetGradeLessons.length === 0 ? 'لا توجد حصص بعد' : `${completedLessonsCount}/${targetGradeLessons.length} مكتمل`}
            </span>
          </div>
        </div>

        {/* Attendance in Live Broadcasts */}
        <div className="bg-white dark:bg-[#162534] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm">نسبة الحضور في البث المباشر</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">حضور حصص الأونلاين التفاعلية والمشاركة</p>
              </div>
            </div>
            <span className="text-sm font-black text-rose-600 dark:text-rose-400 font-mono">{liveAttendancePct}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div 
              className="bg-gradient-to-l from-rose-500 to-pink-600 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${liveAttendancePct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-bold pt-1">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>حضر {attendedLiveCount} من أصل {targetLiveSessions.length} بث</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {targetLiveSessions.length === 0 ? 'لا يوجد بث حالياً' : `${attendedLiveCount}/${targetLiveSessions.length} حضور`}
            </span>
          </div>
        </div>

      </div>

      {/* ═══ Detailed Exam Scores & History Table ═══ */}
      <div className="bg-white dark:bg-[#162534] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="font-black text-slate-900 dark:text-white text-base md:text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>سجل درجات الامتحانات والواجبات الدورية للابن 📜</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              كافة الاختبارات الإلكترونية التي أداها الطالب وتفاصيل درجاته في كل امتحان
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-black px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800">
              إجمالي الامتحانات: {studentExams.length}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {studentExams.length > 0 ? (
            studentExams.map((exam, idx) => {
              const scorePct = exam.percentage ? Number(exam.percentage) : Math.round((Number(exam.score) / (Number(exam.total) || 1)) * 100);
              const isExcellent = scorePct >= 85;
              const isGood = scorePct >= 65 && scorePct < 85;

              return (
                <div 
                  key={exam.id || idx} 
                  className="bg-slate-50 dark:bg-slate-900/80 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-blue-400/40"
                >
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-900 dark:text-white text-sm md:text-base">
                        {exam.quizTitle || exam.title || 'امتحان إلكتروني دوري'}
                      </span>
                      {exam.subject && (
                        <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {exam.subject}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.date || 'اليوم'}</span>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        +{exam.pointsEarned || 50} نقطة تميز ⚡
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
                    {/* Score badge */}
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 dark:text-white font-mono flex items-center gap-1">
                        <span className={isExcellent ? 'text-emerald-600 dark:text-emerald-400' : isGood ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}>
                          {exam.score}
                        </span>
                        <span className="text-xs text-slate-400">/ {exam.total}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono text-center font-bold">
                        ({scorePct}%)
                      </div>
                    </div>

                    {/* Performance Status Tag */}
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${
                      isExcellent 
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                        : isGood
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}>
                      {isExcellent ? 'درجة ممتازة 🏆' : isGood ? 'جيد جداً 👍' : 'مستوى متوسط ✍️'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center space-y-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="text-3xl">📝</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold max-w-md mx-auto">
                لم يؤد الطالب أي امتحانات إلكترونية حتى الآن. ستظهر جميع النتائج والدرجات ونسبة التقفيل هنا فور حل أي اختبار.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ═══ Direct Teacher Contact Button ═══ */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-right">
          <h4 className="font-black text-sm md:text-base flex items-center justify-center sm:justify-start gap-2">
            <MessageCircle className="w-5 h-5" />
            <span>هل لديك أي استفسار أو ترغب في التحدث مع معلم المادة؟</span>
          </h4>
          <p className="text-xs text-emerald-100 font-medium">
            فريق التدريس وإدارة المنصة متاحون دائماً لخدمتكم ومتابعة مستوى الطالب خطوة بخطوة.
          </p>
        </div>

        <a
          href="https://wa.me/201017973649?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%86%D8%A7%20%D9%88%D9%84%D9%8A%20%D8%A3%D9%85%D8%B1%20%D8%A7%D9%84%D8%B7%D8%A7%D9%84%D8%A8%20%D9%88%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D8%B3%D8%AA%D9%88%D8%A7%D9%87"
          target="_blank"
          rel="noreferrer"
          className="bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-black px-6 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 flex-shrink-0 hover:scale-105"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>تواصل مع الإدارة عبر الواتساب 💬</span>
        </a>
      </div>

    </div>
  );
};

