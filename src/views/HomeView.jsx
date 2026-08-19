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
  const { currentGrade, switchGrade, lessons, student, leaderboard, userRole, adminIdentity, liveSessionsDB = [] } = useApp();
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Find active or upcoming live session for this grade
  const targetLiveSession = liveSessionsDB.find(s => 
    (s.grade === currentGrade || s.grade === 'all') && (s.status === 'live' || s.status === 'scheduled')
  ) || liveSessionsDB[0];

  const isSayedAdmin = userRole === 'admin' && adminIdentity === 'mr_sayed';
  const isNourAdmin = userRole === 'admin' && adminIdentity === 'eng_nour';

  const effectiveSubjectFilter = userRole === 'admin'
    ? (isSayedAdmin ? 'arabic' : 'programming')
    : subjectFilter;

  const filteredLessons = lessons.filter(les => {
    const gradeMatch = les.grade === currentGrade;
    if (effectiveSubjectFilter === 'all') return gradeMatch;
    if (effectiveSubjectFilter === 'arabic') {
      return gradeMatch && (les.subject?.includes('عرب') || les.subject?.includes('Arabic') || les.subject?.includes('لغة'));
    }
    return gradeMatch && !les.subject?.includes('عرب') && !les.subject?.includes('لغة');
  });

  const gradeTitles = {
    '3sec': 'الصف الثالث الثانوي (دفعة 2026)',
    '2sec': 'الصف الثاني الثانوي',
    '1sec': 'الصف الأول الثانوي'
  };

  return (
    <div className="space-y-14 pb-20 relative overflow-hidden">
      
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
      <div className="absolute top-[1200px] left-8 pointer-events-none opacity-50 hidden lg:block animate-float-slow">
        <Cube3D size={48} color="blue" />
      </div>

      {/* ═══ Bassthalk-Inspired Alive Hero Section ═══ */}
      <section className="relative overflow-hidden hero-card-container rounded-[2.5rem] shadow-xl dark:shadow-2xl p-6 md:p-12">
        
        {/* Background Ambient Glowing Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-blob" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Wavy Animated Ribbon Line */}
        <div className="absolute inset-0 pointer-events-none">
          <WavyRibbon className="w-full h-full opacity-40 dark:opacity-30" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* Left / Text Content (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-right">
            
            {/* Top Glowing Badges Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-blue-600 text-white shadow-md animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>المنصة التعليمية الأولى لدفعة 2026</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>ثانوية عامة وبرمجة حديثة</span>
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.25] tracking-tight">
                طريقك للتفوق في <span className="gradient-text-gold">اللغة العربية</span> و <span className="gradient-text-blue">البرمجة</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 font-bold leading-relaxed max-w-xl">
                شرح مبسط، حل تدريبات تفاعلية، امتحانات دورية، وتصحيح لحظي مع نخبة من أقوى المعلمين لمساعدتك في حصد الدرجات النهائية.
              </p>
            </div>

            {/* Dual Subject Badges */}
            <div className="flex flex-wrap gap-2.5 justify-end">
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 text-blue-800 dark:text-blue-300 px-3.5 py-2 rounded-2xl text-xs font-black shadow-xs hover:scale-105 transition-transform">
                <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>البرمجة وعلوم الحاسب</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 px-3.5 py-2 rounded-2xl text-xs font-black shadow-xs hover:scale-105 transition-transform">
                <Languages className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>اللغة العربية والبلاغة</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button 
                onClick={() => setCurrentTab('lessons')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm md:text-base font-black px-8 py-4 rounded-2xl shadow-xl shadow-emerald-600/30 hover:scale-105 transition-all flex items-center gap-2.5 animate-pulse-glow"
              >
                <span>ابدأ رحلتك الآن</span>
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setCurrentTab('exams')}
                className="hero-secondary-btn text-xs md:text-sm font-black px-6 py-4 rounded-2xl shadow-md hover:scale-105 transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>الامتحانات والتحديات</span>
              </button>

              {userRole === 'admin' && (
                <button 
                  onClick={() => setCurrentTab('admin')}
                  className="btn-primary text-xs md:text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-blue-500/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  رفع حصة جديدة 💻
                </button>
              )}
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              {[
                { val: '500+', label: 'طالب متفوق', icon: '🎓' },
                { val: '100%', label: 'تصحيح ومتابعة', icon: '✅' },
                { val: '24/7', label: 'متاح دائماً', icon: '⚡' }
              ].map((s, i) => (
                <div key={i} className="hero-stat-pill rounded-2xl p-3 text-center shadow-xs">
                  <div className="text-base font-black text-slate-900 dark:text-white">{s.icon} {s.val}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-bold mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Right: Dynamic Interactive Scene (5 Cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <HeroFloatingScene setCurrentTab={setCurrentTab} />
          </div>

        </div>
      </section>

      {/* ═══ Live Classroom Banner ═══ */}
      {targetLiveSession && (
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
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-bounce-subtle'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <span>{targetLiveSession.status === 'live' ? 'دخول قاعة البث المباشر فوراً 🚀' : 'عرض تفاصيل وموعد البث 📅'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

        </section>
      )}

      {/* ═══ Grade + Subject Selector ═══ */}
      <section className="bg-white dark:bg-[#162534] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white">اختر الصف والمادة:</h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button 
              onClick={() => switchGrade('3sec')} 
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${currentGrade === '3sec' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              🎓 ثالثة ثانوي
            </button>
            <button 
              onClick={() => switchGrade('2sec')} 
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${currentGrade === '2sec' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              📘 ثاني ثانوي
            </button>
            <button 
              onClick={() => switchGrade('1sec')} 
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${currentGrade === '1sec' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              📗 أول ثانوي
            </button>
          </div>
        </div>

        {/* Subject Filter */}
        {userRole !== 'admin' && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">فلتر المادة:</span>
            {[
              { id: 'all', label: '📚 الكل', color: 'slate' },
              { id: 'programming', label: '💻 البرمجة', color: 'blue' },
              { id: 'arabic', label: '📖 العربي', color: 'amber' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSubjectFilter(s.id)}
                className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black transition-all border ${
                  subjectFilter === s.id
                    ? s.color === 'blue' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : s.color === 'amber' 
                        ? 'bg-amber-500 text-slate-950 border-amber-500' 
                        : 'bg-slate-800 dark:bg-blue-600 text-white border-slate-800 dark:border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ═══ Lessons Grid ═══ */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>الحصص والمحاضرات المتاحة</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono">
                {filteredLessons.length} حصة
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {gradeTitles[currentGrade]} • محتوى متجدد دورياً بأعلى جودة
            </p>
          </div>

          <button 
            onClick={() => setCurrentTab('lessons')}
            className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>عرض كل الحصص</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredLessons.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#162534] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-4xl">📚</div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-200">لا توجد حصص مضافة لهذا الصف حالياً</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">سيتم إضافة المحاضرات والواجبات قريباً جداً بإذن الله.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map(les => {
              const isFree = les.price === 0;
              const isLocked = !isFree && !student?.unlockedLessons?.includes(les.id);
              const isArabic = les.subject?.includes('عرب') || les.subject?.includes('Arabic');

              return (
                <div 
                  key={les.id}
                  onClick={() => {
                    setSelectedLessonId(les.id);
                    setCurrentTab('lesson-detail');
                  }}
                  className="bg-white dark:bg-[#162534] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail Image Container */}
                    <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img 
                        src={les.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"} 
                        alt={les.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-4">
                        <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl shadow-md ${isArabic ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'}`}>
                          {les.subject}
                        </span>

                        <span className="text-[11px] font-black text-white/90 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{les.duration || '45 دقيقة'}</span>
                        </span>
                      </div>

                      {/* Lock / Free Badge */}
                      <div className="absolute top-3 right-3">
                        {isFree ? (
                          <span className="bg-emerald-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <span>مجانية 🎁</span>
                          </span>
                        ) : isLocked ? (
                          <span className="bg-slate-900/80 backdrop-blur-md text-amber-400 text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg border border-amber-500/30 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>{les.price} ج.م</span>
                          </span>
                        ) : (
                          <span className="bg-blue-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>مفعلة بحسابك</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Info */}
                    <div className="p-5 space-y-2.5">
                      <h3 className="font-black text-slate-900 dark:text-white text-sm md:text-base line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {les.title}
                      </h3>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                        {les.description || 'شرح تفصيلي مع تدريبات مكثفة وأسئلة امتحانية متوقعة.'}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Button */}
                  <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                      {isFree ? 'متاحة للمشاهدة فوراً' : isLocked ? 'فتح الحصة الآن' : 'متابعة المشاهدة'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
                      <Play className="w-4 h-4 fill-current mr-0.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══ Top Students Leaderboard Preview ═══ */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 md:p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Award className="w-3.5 h-3.5" />
              <span>لوحة الشرف • أبطال منصة عِلم</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black">أوائل المنصة الأكثر اجتهاداً وحلاً للاختبارات</h2>
          </div>

          <button 
            onClick={() => setCurrentTab('leaderboard')}
            className="self-start sm:self-auto text-xs font-black text-amber-400 hover:text-amber-300 border border-amber-500/30 bg-amber-500/10 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>عرض الترتيب بالكامل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(leaderboard || []).slice(0, 3).map((st, idx) => (
            <div 
              key={st.id || idx}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-md ${
                  idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : 'bg-amber-700 text-white'
                }`}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>
                <div>
                  <div className="font-black text-xs md:text-sm text-white">{st.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">كود: {st.code}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black text-amber-400 font-mono">{st.points || 0} نقطة</div>
                <div className="text-[10px] text-slate-400 font-bold">{st.gradeName ? 'ثانوية عامة' : 'طالب متميز'}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
