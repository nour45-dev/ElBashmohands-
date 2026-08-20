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
  Play, 
  Sparkles, 
  Flame, 
  Award, 
  Users, 
  Zap, 
  MessageSquare, 
  ArrowLeft,
  BookOpen,
  Lock,
  Wallet,
  PlusCircle,
  Code2,
  Languages,
  CheckCircle2,
  FileText,
  Clock,
  Send,
  HelpCircle,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Radio
} from 'lucide-react';

export const HomeView = ({ setCurrentTab, setSelectedLessonId, setSelectedLiveId }) => {
  const { currentGrade, switchGrade, lessons, student, userRole, adminIdentity, liveSessionsDB = [] } = useApp();
  
  // Lock grade to student's registered grade if student, or currentGrade for admin
  const activeGrade = (userRole === 'student' && student?.grade) ? student.grade : currentGrade;

  // Find active or upcoming live session for this user/admin
  const targetLiveSession = (liveSessionsDB || []).find(s => {
    if (userRole === 'admin') {
      if (adminIdentity === 'eng_nour') return (!s.subject?.includes('عرب') && s.subject !== 'اللغة العربية' && s.subject !== 'arabic') && (s.status === 'live' || s.status === 'scheduled');
      if (adminIdentity === 'mr_sayed') return (s.subject?.includes('عرب') || s.subject === 'اللغة العربية' || s.subject === 'arabic') && (s.status === 'live' || s.status === 'scheduled');
    }
    // If student: show any active live broadcast, or scheduled broadcast for student grade/all
    if (s.status === 'live') return true;
    return (s.grade === activeGrade || s.grade === 'all' || !s.grade) && s.status === 'scheduled';
  });

  const gradeTitles = {
    '3sec': 'الصف الثالث الثانوي (دفعة 2026)',
    '2sec': 'الصف الثاني الثانوي',
    '1sec': 'الصف الأول الثانوي'
  };

  // Separate lessons strictly into Arabic and Programming for this grade
  const arabicLessons = lessons.filter(les => 
    (les.grade === activeGrade || les.grade === 'all') && 
    (les.subject?.includes('عرب') || les.subject?.includes('Arabic') || les.subject?.includes('لغة'))
  );

  const programmingLessons = lessons.filter(les => 
    (les.grade === activeGrade || les.grade === 'all') && 
    !(les.subject?.includes('عرب') || les.subject?.includes('Arabic') || les.subject?.includes('لغة'))
  );

  return (
    <div className="space-y-12 pb-20 relative overflow-hidden" dir="rtl">
      
      {/* Global Floating Background Shapes */}
      <div className="absolute top-20 right-4 pointer-events-none opacity-60 hidden lg:block animate-float-slow">
        <Cube3D size={52} color="gold" />
      </div>
      <div className="absolute top-96 left-6 pointer-events-none opacity-60 hidden lg:block animate-float-reverse">
        <Cylinder3D size={46} color="emerald" />
      </div>
      <div className="absolute top-[800px] right-8 pointer-events-none opacity-50 hidden lg:block animate-float-fast">
        <Cone3D size={44} />
      </div>

      {/* ═══ Alive Hero Section ═══ */}
      <section className="relative overflow-hidden hero-card-container rounded-[2.5rem] shadow-xl dark:shadow-2xl p-6 md:p-12">
        
        {/* Background Ambient Glowing Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-blob" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none animate-blob" style={{ animationDelay: '4s' }} />

        {/* Wavy Animated Ribbon Line */}
        <div className="absolute inset-0 pointer-events-none">
          <WavyRibbon />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left / Main Text Content (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-right flex flex-col justify-center">

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-black shadow-sm self-start">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>منصة تعليمية ذكية ومتكاملة • {gradeTitles[activeGrade] || 'الثانوية العامة'} 🚀</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.3] text-slate-900 dark:text-white">
                طريقك للتفوق في <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-500 via-amber-600 to-amber-700 dark:from-amber-400 dark:to-yellow-300">
                  اللغة العربية
                </span> و <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 via-indigo-600 to-blue-800 dark:from-blue-400 dark:to-cyan-300">
                  البرمجة
                </span> 🎓
              </h1>

              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-bold leading-relaxed max-w-xl">
                شرح مبسط، حل تدريبات تفاعلية مكثفة، وتصحيح فوري لجميع امتحاناتك مع نخبة من أفضل المعلمين.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button 
                onClick={() => setCurrentTab('lessons')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black px-7 py-3.5 rounded-2xl shadow-xl shadow-emerald-600/30 hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>تصفح كل الحصص والدروس</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setCurrentTab('exams')}
                className="hero-secondary-btn text-xs sm:text-sm font-black px-6 py-3.5 rounded-2xl shadow-md hover:scale-105 transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>الامتحانات والاختبارات</span>
              </button>
            </div>

          </div>

          {/* Right: Dynamic Interactive Scene (5 Cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <HeroFloatingScene setCurrentTab={setCurrentTab} />
          </div>

        </div>
      </section>

      {/* ═══ Live Classroom Banner ═══ */}
      {targetLiveSession ? (
        <section className={`p-5 md:p-6 rounded-3xl border shadow-lg transition-all flex flex-col md:flex-row items-center justify-between gap-5 ${
          targetLiveSession.status === 'live'
            ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border-rose-500/40 text-white ring-2 ring-rose-500/20'
            : 'bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border-blue-500/30 text-white'
        }`}>
          
          <div className="flex items-center gap-4 text-right">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl flex-shrink-0 ${
              targetLiveSession.status === 'live'
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-blue-600/30 border border-blue-400/40 text-blue-300'
            }`}>
              <Radio className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {targetLiveSession.status === 'live' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black animate-pulse shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>مباشر الآن 🔴</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-black">
                    <Clock className="w-3.5 h-3.5" />
                    <span>حصة بث مباشر قادمة ⏳</span>
                  </span>
                )}

                <span className="text-[11px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  {targetLiveSession.subject}
                </span>
              </div>

              <h3 className="text-base md:text-lg font-black text-white">
                {targetLiveSession.title}
              </h3>
              <p className="text-xs text-slate-300 font-bold">
                المحاضر: <span className="text-amber-300">{targetLiveSession.instructor}</span> • {targetLiveSession.gradeName}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (setSelectedLiveId) setSelectedLiveId(targetLiveSession.id);
              setCurrentTab('live');
            }}
            className={`px-6 py-3.5 rounded-2xl text-xs md:text-sm font-black transition-all flex items-center gap-2 shadow-xl hover:scale-105 flex-shrink-0 ${
              targetLiveSession.status === 'live'
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <span>{targetLiveSession.status === 'live' ? 'دخول قاعة البث المباشر فوراً 🚀' : 'عرض تفاصيل وموعد البث 📅'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

        </section>
      )}

      {/* ═══ Grade Switcher Bar (Interactive for Admin, Locked for Student) ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#162534] border border-blue-200 dark:border-blue-800/60 p-4 md:p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100 text-xs md:text-sm font-black">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg flex-shrink-0">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span>المحتوى المعروض حالياً:</span>
              <span className="text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                {gradeTitles[activeGrade] || 'الصف الدراسي'}
              </span>
            </div>
            {userRole === 'admin' && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                👑 بصفتك أدمن: يمكنك الضغط على أي صف دراسي أدناه لمعاينة وتصفح حصصه فوراً:
              </p>
            )}
          </div>
        </div>

        {/* Interactive Grade Selector Tabs for Admin */}
        {userRole === 'admin' ? (
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-stretch sm:self-auto justify-center">
            {[
              { id: '3sec', label: '🎓 ثالثة ثانوي (2026)' },
              { id: '2sec', label: '📘 ثانية ثانوي' },
              { id: '1sec', label: '📗 أولى ثانوي' }
            ].map(g => (
              <button
                key={g.id}
                onClick={() => switchGrade(g.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeGrade === g.id
                    ? 'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800'
                }`}
              >
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 px-3.5 py-1.5 rounded-2xl text-xs font-black self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>حساب الطالب مخصص لصفك الدراسي فقط ✓</span>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          1️⃣ CARD 1: قسم اللغة العربية والبلاغة (مستر سيد عبد العاطي)
          (مخفي تماماً عن المهندس نور الدين)
         ══════════════════════════════════════════════════════════════ */}
      {!(userRole === 'admin' && adminIdentity === 'eng_nour') && (
      <section className="bg-white dark:bg-[#162534] rounded-3xl border-2 border-amber-500/30 shadow-xl overflow-hidden">
        
        {/* Card Header Banner */}
        <div className="bg-gradient-to-l from-amber-600 via-amber-500 to-orange-600 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-md flex-shrink-0">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black bg-slate-950/30 px-2.5 py-0.5 rounded-full">
                  فرع النحو والبلاغة والأدب والنصوص
                </span>
                <span className="text-[11px] font-black bg-white/20 px-2.5 py-0.5 rounded-full">
                  {arabicLessons.length} حصة متاحة
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black mt-1">
                قسم مادة اللغة العربية • أ / سيد عبد العاطي
              </h2>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('lessons')}
            className="self-start sm:self-auto bg-slate-950/40 hover:bg-slate-950/60 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-md"
          >
            <span>عرض كل حصص العربي</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card Body / Lessons Grid */}
        <div className="p-6">
          {arabicLessons.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <div className="text-3xl">📖</div>
              <p className="text-xs font-bold">لا توجد حصص لغة عربية مضافة لهذا الصف حالياً، سيتم رفعها قريباً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {arabicLessons.map(les => {
                const isFree = les.price === 0;
                const isUnlocked = isFree || student?.unlockedLessons?.includes(les.id);
                return (
                  <div
                    key={les.id}
                    onClick={() => { setSelectedLessonId(les.id); setCurrentTab('lesson-detail'); }}
                    className="bg-slate-50 dark:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        <img
                          src={les.thumbnail || "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800"}
                          alt={les.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                          <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                            اللغة العربية
                          </span>
                          <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{les.duration || '45 دقيقة'}</span>
                          </span>
                        </div>

                        <div className="absolute top-2 right-2">
                          {isFree ? (
                            <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow">مجانية 🎁</span>
                          ) : isUnlocked ? (
                            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow">مفعلة ✓</span>
                          ) : (
                            <span className="bg-slate-900/90 text-amber-400 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow">
                              {les.price} ج.م
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-1.5">
                        <h4 className="font-black text-slate-900 dark:text-white text-xs md:text-sm line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {les.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">
                          {les.description || 'شرح تفصيلي مع تدريبات مكثفة وأسئلة وزارية.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-200/60 dark:border-slate-800/60 mt-2 flex items-center justify-between">
                      <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                        {isUnlocked ? 'مشاهدة الحصة الآن' : 'فتح الحصة'}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center group-hover:scale-110 transition-all shadow-xs">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          2️⃣ CARD 2: قسم البرمجة وعلوم الحاسب (مهندس نور الدين)
          (مخفي تماماً عن الأستاذ سيد عبد العاطي)
         ══════════════════════════════════════════════════════════════ */}
      {!(userRole === 'admin' && adminIdentity === 'mr_sayed') && (
      <section className="bg-white dark:bg-[#162534] rounded-3xl border-2 border-blue-500/30 shadow-xl overflow-hidden">
        
        {/* Card Header Banner */}
        <div className="bg-gradient-to-l from-blue-700 via-indigo-600 to-blue-800 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-md flex-shrink-0">
              💻
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black bg-slate-950/30 px-2.5 py-0.5 rounded-full">
                  Python, Web, Algorithms & AI
                </span>
                <span className="text-[11px] font-black bg-white/20 px-2.5 py-0.5 rounded-full">
                  {programmingLessons.length} حصة متاحة
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black mt-1">
                قسم البرمجة وعلوم الحاسب • م / نور الدين
              </h2>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('lessons')}
            className="self-start sm:self-auto bg-slate-950/40 hover:bg-slate-950/60 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-md"
          >
            <span>عرض كل حصص البرمجة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card Body / Lessons Grid */}
        <div className="p-6">
          {programmingLessons.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <div className="text-3xl">💻</div>
              <p className="text-xs font-bold">لا توجد حصص برمجة مضافة لهذا الصف حالياً، سيتم رفعها قريباً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {programmingLessons.map(les => {
                const isFree = les.price === 0;
                const isUnlocked = isFree || student?.unlockedLessons?.includes(les.id);
                return (
                  <div
                    key={les.id}
                    onClick={() => { setSelectedLessonId(les.id); setCurrentTab('lesson-detail'); }}
                    className="bg-slate-50 dark:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        <img
                          src={les.thumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800"}
                          alt={les.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                          <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-md">
                            البرمجة
                          </span>
                          <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{les.duration || '45 دقيقة'}</span>
                          </span>
                        </div>

                        <div className="absolute top-2 right-2">
                          {isFree ? (
                            <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow">مجانية 🎁</span>
                          ) : isUnlocked ? (
                            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow">مفعلة ✓</span>
                          ) : (
                            <span className="bg-slate-900/90 text-amber-400 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow">
                              {les.price} ج.م
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-1.5">
                        <h4 className="font-black text-slate-900 dark:text-white text-xs md:text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {les.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">
                          {les.description || 'شرح عملي تطبيقي مع تمارين برمجية ومشاريع حقيقية.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-200/60 dark:border-slate-800/60 mt-2 flex items-center justify-between">
                      <span className="text-[11px] font-black text-blue-600 dark:text-blue-400">
                        {isUnlocked ? 'مشاهدة الحصة الآن' : 'فتح الحصة'}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-all shadow-xs">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      )}
    </div>
  );
};
