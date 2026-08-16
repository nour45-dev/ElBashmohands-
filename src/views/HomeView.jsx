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
  Smartphone
} from 'lucide-react';

export const HomeView = ({ setCurrentTab, setSelectedLessonId }) => {
  const { currentGrade, switchGrade, lessons, student, leaderboard, userRole, adminIdentity } = useApp();
  const [subjectFilter, setSubjectFilter] = useState('all');

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
          <WavyRibbon />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left / Main Text Content (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-right flex flex-col justify-center">

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-black shadow-sm self-end animate-float-fast">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>منصة تعليمية ذكية ومتكاملة للثانوية العامة 🚀</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black tracking-tight leading-[1.3] text-slate-900 dark:text-white">
                منصة عِلم.. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-700 via-indigo-600 to-blue-900 dark:from-amber-400 dark:to-yellow-300">
                  منصة متكاملة بها كل ما يحتاجه الطالب ليتفوق
                </span> 🎓
              </h1>

              <p className="text-sm md:text-base text-slate-700 dark:text-[#F5E8C7] font-bold leading-relaxed max-w-xl">
                منصة ذكية بتساعدك تذاكر صح، تفهم كل درس بالخطوات والتطبيقات العملية، وتوصل لأعلى درجاتك في الثانوية العامة بكل سهولة وراحة بال.
              </p>
            </div>

            {/* Subject Badges with Icons */}
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

      {/* ═══ New Section: إزاي المنصة بتشتغل؟ (رحلة تفوقك خطوة بخطوة) ═══ */}
      <section className="how-it-works-section p-8 md:p-12 rounded-[2.5rem] shadow-xl space-y-10 relative overflow-hidden">
        
        {/* Section Title Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-xs font-black">
            <Zap className="w-4 h-4 text-blue-500" />
            <span>خطوات بسيطة نحو القمة 🚀</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            إزاي منصة <span className="text-amber-500 dark:text-amber-400">عِلم</span> بتشتغل؟
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
            صممنا لك تجربة تعليمية ممتعة وسلسة تاخد بإيدك خطوة بخطوة من أول اختيار الحصة لحد التقفيل والدرجات النهائية.
          </p>
        </div>

        {/* 4 Interactive Journey Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          
          {/* Step 1 */}
          <div className="journey-step-card p-6 rounded-3xl hover:border-blue-500 shadow-md space-y-4 text-right transition-all duration-300 hover:-translate-y-2 group relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-black shadow-md group-hover:scale-110 transition-transform">
              🎯
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-blue-700 dark:text-blue-400">الخطوة الأولى</span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">اختر صفك ومادتك</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                حدد مرحلتك الدراسية (أولى، ثانية، أو ثالثة ثانوي) واختر بين كورسات البرمجة أو دروس اللغة العربية بضغطة واحدة.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] font-black text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors">
              <span>سهولة تامة</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="journey-step-card p-6 rounded-3xl hover:border-amber-500 shadow-md space-y-4 text-right transition-all duration-300 hover:-translate-y-2 group relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-black shadow-md group-hover:scale-110 transition-transform">
              🎬
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-amber-700 dark:text-amber-400">الخطوة الثانية</span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">شاهد الحصة بتركيز</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                استمتع بشرح تفاعلي مبسط على مشغل فيديو محمي عالي الجودة، مع إمكانية تحميل وطباعة مذكرة الدرس PDF مباشرة.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] font-black text-slate-500 dark:text-slate-400 group-hover:text-amber-600 transition-colors">
              <span>مذكرات PDF مدمجة</span>
              <FileText className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="journey-step-card p-6 rounded-3xl hover:border-emerald-500 shadow-md space-y-4 text-right transition-all duration-300 hover:-translate-y-2 group relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-black shadow-md group-hover:scale-110 transition-transform">
              📝
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">الخطوة الثالثة</span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">حل الامتحان الإلكتروني</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                اختبر فهمك بامتحان إلكتروني بوقت محدد، واستلم تصحيحك الفوري مع مراجعة نموذج الإجابات وتفسير كل سؤال.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] font-black text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 transition-colors">
              <span>تصحيح فوري + نقاط XP</span>
              <Award className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="journey-step-card p-6 rounded-3xl hover:border-purple-500 shadow-md space-y-4 text-right transition-all duration-300 hover:-translate-y-2 group relative">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-black shadow-md group-hover:scale-110 transition-transform">
              📲
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-purple-700 dark:text-purple-400">الخطوة الرابعة</span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">اسأل واستلم تقريرك</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                اطرح أي استفسار تحت الفيديو ليجيبك المعلم، ويتم إرسال تقرير أدائك الموثق مباشرة إلى ولي أمرك على الواتساب.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] font-black text-slate-500 dark:text-slate-400 group-hover:text-purple-600 transition-colors">
              <span>متابعة واتساب للأهل</span>
              <Smartphone className="w-3.5 h-3.5 text-purple-500" />
            </div>
          </div>

        </div>

        {/* Interactive Features Badges Row */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: '🔒', title: 'حماية وأمان كامل', desc: 'مشغل فيديو ضد التحميل والتسريب' },
            { icon: '🤖', title: 'مساعد ذكي 24/7', desc: 'شرح فوري لأي قاعدة أو كود' },
            { icon: '💳', title: 'شحن فوري بالـ InstaPay', desc: 'تفعيل سريع واشتراكات مريحة' },
            { icon: '🏆', title: 'أوائل الدفعة وجوائز', desc: 'لوحة شرف وتكريم للمتميزين' }
          ].map((item, idx) => (
            <div key={idx} className="journey-step-card p-3.5 rounded-2xl space-y-1 shadow-xs">
              <div className="text-xl">{item.icon}</div>
              <div className="text-xs font-black text-slate-900 dark:text-white">{item.title}</div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">{item.desc}</div>
            </div>
          ))}
        </div>

      </section>

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

      {/* ═══ Lessons Section ═══ */}
      <section className="space-y-6">

        {effectiveSubjectFilter === 'all' ? (
          /* Folder View — show two subject folders */
          <div className="space-y-8">
            {[
              {
                id: 'programming',
                label: 'البرمجة وعلوم الحاسب',
                emoji: '💻',
                color: 'blue',
                gradient: 'from-blue-600 to-indigo-600',
                desc: 'Python، Web، C++، خوارزميات',
                matchFn: (les) => !les.subject?.includes('عرب') && !les.subject?.includes('لغة')
              },
              {
                id: 'arabic',
                label: 'اللغة العربية',
                emoji: '📖',
                color: 'amber',
                gradient: 'from-amber-500 to-orange-500',
                desc: 'نحو، بلاغة، نصوص، أدب',
                matchFn: (les) => les.subject?.includes('عرب') || les.subject?.includes('لغة')
              }
            ].map(folder => {
              const folderLessons = lessons.filter(les => les.grade === currentGrade && folder.matchFn(les));
              return (
                <div key={folder.id} className="bg-white dark:bg-[#162534] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden">
                  {/* Folder Header */}
                  <button
                    onClick={() => setSubjectFilter(folder.id)}
                    className={`w-full bg-gradient-to-l ${folder.gradient} px-6 py-5 flex items-center justify-between group hover:opacity-95 transition-all`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-md">
                        {folder.emoji}
                      </div>
                      <div className="text-right">
                        <h3 className="text-white font-black text-lg">{folder.label}</h3>
                        <p className="text-white/75 text-xs font-bold">{folder.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-white/20 text-white text-xs font-black px-3 py-1.5 rounded-xl">
                        {folderLessons.length} حصة
                      </span>
                      <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-all" />
                    </div>
                  </button>

                  {/* Preview of first 3 lessons */}
                  {folderLessons.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-slate-400 text-sm font-bold">لا توجد حصص بعد في هذه المادة</p>
                      {userRole === 'admin' && (
                        <button onClick={() => setCurrentTab('admin')} className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-black hover:underline">
                          + رفع أول حصة الآن
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {folderLessons.slice(0, 3).map(lesson => {
                        const isArabic = lesson.subject?.includes('عرب') || lesson.subject?.includes('لغة');
                        const fallbackThumb = isArabic
                          ? 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=500'
                          : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=500';
                        const thumbSrc = lesson.thumbnail || fallbackThumb;
                        return (
                          <div
                            key={lesson.id}
                            onClick={() => { setSelectedLessonId(lesson.id); setCurrentTab('lesson-detail'); }}
                            className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/80 overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500 transition-all group"
                          >
                            <div className="relative h-28 bg-slate-900 overflow-hidden">
                              <img src={thumbSrc} alt={lesson.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                              <div className="absolute top-2 right-2">
                                {lesson.price === 0
                                  ? <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg">مجاناً 🎁</span>
                                  : <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-lg">{lesson.price} ج.م</span>
                                }
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                                  <Play className="w-4 h-4 fill-white mr-0.5" />
                                </div>
                              </div>
                            </div>
                            <div className="p-3">
                              <p className="font-black text-slate-800 dark:text-white text-xs leading-snug line-clamp-2">{lesson.title}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {folderLessons.length > 3 && (
                    <div className="px-6 pb-4 text-center">
                      <button
                        onClick={() => setSubjectFilter(folder.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 font-black hover:underline"
                      >
                        عرض جميع الحصص ({folderLessons.length}) ←
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Filtered Lesson Grid */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                حصص {effectiveSubjectFilter === 'arabic' ? 'اللغة العربية 📖' : 'البرمجة وعلوم الحاسب 💻'}
              </h3>
              {userRole !== 'admin' && (
                <button
                  onClick={() => setSubjectFilter('all')}
                  className="text-xs text-slate-500 dark:text-slate-400 font-black hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                >
                  ← رجوع للكل
                </button>
              )}
            </div>

            {filteredLessons.length === 0 ? (
              <div className="bg-white dark:bg-[#162534] p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-xl mx-auto shadow-lg">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl mx-auto font-black">
                  {effectiveSubjectFilter === 'arabic' ? '📖' : '💻'}
                </div>
                <h4 className="font-black text-lg text-slate-900 dark:text-white">لا توجد حصص لهذا الصف والمادة حالياً</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  المنصة جاهزة 100%. قم بالدخول كباشمهندس لرفع أول حصة وشاهدها تعمل فوراً!
                </p>
                {userRole === 'admin' && (
                  <button
                    onClick={() => setCurrentTab('admin')}
                    className="btn-accent text-xs font-black px-6 py-3 rounded-xl shadow-md"
                  >
                    رفع حصة الآن من لوحة الإدارة 🚀
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map(lesson => {
                  const isArabic = lesson.subject?.includes('عرب') || lesson.subject?.includes('لغة');
                  const fallbackThumb = isArabic
                    ? 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=500'
                    : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=500';
                  const thumbSrc = lesson.thumbnail || fallbackThumb;
                  return (
                    <div
                      key={lesson.id}
                      className="bg-white dark:bg-[#162534] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                      <div className="relative h-44 bg-slate-900 overflow-hidden">
                        <img
                          src={thumbSrc}
                          alt={lesson.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                        <div className="absolute top-3 right-3">
                          {lesson.price === 0 ? (
                            <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-md">مجاناً 🎁</span>
                          ) : (
                            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-xl shadow-md">{lesson.price} ج.م</span>
                          )}
                        </div>

                        <div
                          onClick={() => { setSelectedLessonId(lesson.id); setCurrentTab('lesson-detail'); }}
                          className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-90 group-hover:opacity-100 transition-all"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-all">
                            <Play className="w-6 h-6 fill-white mr-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="badge badge-blue">{lesson.subject}</span>
                            <span className="text-[10px] text-slate-400 font-bold">منصة المعلم</span>
                          </div>
                          <h4 className="font-black text-slate-900 dark:text-white text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">
                            {lesson.title}
                          </h4>
                        </div>

                        <button
                          onClick={() => { setSelectedLessonId(lesson.id); setCurrentTab('lesson-detail'); }}
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>مشاهدة الحصة</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </section>


    </div>
  );
};
