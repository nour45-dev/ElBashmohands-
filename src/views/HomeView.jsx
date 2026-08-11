import React, { useState } from 'react';
import { 
  Play, Sparkles, Code2, Languages, Clock, BookOpen, 
  ArrowRight, ShieldCheck, PlusCircle, Award, 
  MessageSquare, UserCheck, HelpCircle, ChevronRight, Lock
} from 'lucide-react';
import { ElmLogo } from '../components/ElmLogo';

export const HomeView = ({ 
  lessons, 
  userRole, 
  currentStudent, 
  setCurrentTab, 
  setSelectedLessonId 
}) => {
  const [currentGrade, setCurrentGrade] = useState('3sec');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const switchGrade = (grade) => {
    setCurrentGrade(grade);
  };

  const handleLessonCardClick = (lesson) => {
    const isFree = lesson.price === 0;
    const isSubscribed = currentStudent?.subscriptionType === 'premium' || currentStudent?.subscriptionType === 'monthly';
    const isPurchased = currentStudent?.unlockedLessons?.includes(lesson.id);

    if (userRole === 'admin' || isFree || isSubscribed || isPurchased) {
      setSelectedLessonId(lesson.id);
      setCurrentTab('lesson-detail');
    } else {
      setSelectedLessonId(lesson.id);
      setCurrentTab('lesson-detail');
    }
  };

  const filteredLessons = lessons.filter(les => {
    const matchGrade = les.grade === currentGrade;
    if (!matchGrade) return false;

    if (subjectFilter === 'all') return true;
    if (subjectFilter === 'arabic') {
      return les.subject === 'اللغة العربية' || les.subject?.includes('عرب');
    }
    if (subjectFilter === 'cs') {
      return les.subject === 'البرمجة وعلوم الحاسب' || les.subject?.includes('برمج');
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* ═══ Hero Section ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800">
        
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/2 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
          
          {/* Left: Text content */}
          <div className="p-8 md:p-12 space-y-6 text-right flex flex-col justify-center">

            <div className="inline-flex items-center gap-2 bg-[#D4A017]/10 border border-[#D4A017]/25 text-[#D4A017] px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg shadow-[#D4A017]/5 self-end">
              <Sparkles className="w-4 h-4 text-[#D4A017]" />
              <span>منصة تعليمية للمعرفة النافعة 💡⚡</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white flex flex-col gap-2">
                <span>منصة تعليمية</span>
                <span className="text-[#D4A017]">للمعرفة النافعة</span>
              </h1>

              <p className="text-xs md:text-sm text-[#F5E8C7] font-medium leading-relaxed max-w-xl">
                محتوى موثوق.. بأسلوب مبسط. لنتعلم ما ينتفع به في دينك ودنياك.
              </p>
            </div>

            {/* Subject badges */}
            <div className="flex flex-wrap gap-2 justify-end">
              <div className="flex items-center gap-1.5 bg-[#D4A017]/10 border border-[#D4A017]/20 text-[#D4A017] px-3 py-1.5 rounded-xl text-[11px] font-black">
                <Code2 className="w-3.5 h-3.5" />
                البرمجة وعلوم الحاسب
              </div>
              <div className="flex items-center gap-1.5 bg-[#D4A017]/10 border border-[#D4A017]/20 text-[#D4A017] px-3 py-1.5 rounded-xl text-[11px] font-black">
                <Languages className="w-3.5 h-3.5" />
                اللغة العربية
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button 
                onClick={() => setCurrentTab('lessons')}
                className="btn-accent text-xs md:text-sm px-8 py-4 rounded-2xl shadow-xl shadow-[#D4A017]/10 hover:scale-105 transition-all text-[#0D1B2A] font-black animate-pulse-glow"
                style={{ backgroundColor: '#D4A017' }}
              >
                <Play className="w-4 h-4 fill-[#0D1B2A]" />
                ابدأ التعلم الآن
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

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { val: '500+', label: 'طالب نشط', icon: '🎓' },
                { val: '100%', label: 'تصحيح فوري', icon: '✅' },
                { val: '24/7', label: 'متاح دائماً', icon: '⚡' }
              ].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <div className="text-base font-black text-white">{s.icon} {s.val}</div>
                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Large Centered Brand Logo */}
          <div className="relative hidden lg:flex items-center justify-center p-6 lg:p-8">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-slate-900/40 z-10" />
            <ElmLogo variant="vertical" size="full" className="w-80 h-80 z-20 animate-float" />
          </div>

        </div>
      </section>

      {/* ═══ Grade + Subject Selector ═══ */}
      <section className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-black text-slate-900">اختر الصف والمادة:</h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button onClick={() => switchGrade('3sec')} className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${currentGrade === '3sec' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              🎓 ثالثة ثانوي
            </button>
            <button onClick={() => switchGrade('2sec')} className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${currentGrade === '2sec' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              📘 ثاني ثانوي
            </button>
            <button onClick={() => switchGrade('1sec')} className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${currentGrade === '1sec' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              📗 أول ثانوي
            </button>
          </div>
        </div>

        {/* Subject Filter */}
        {userRole !== 'admin' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-slate-500">فلتر المادة:</span>
            <div className="flex gap-1.5 overflow-x-auto">
              <button onClick={() => setSubjectFilter('all')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${subjectFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600'}`}>الكل 📚</button>
              <button onClick={() => setSubjectFilter('cs')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${subjectFilter === 'cs' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600'}`}>البرمجة والحاسب 💻</button>
              <button onClick={() => setSubjectFilter('arabic')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${subjectFilter === 'arabic' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600'}`}>اللغة العربية 📖</button>
            </div>
          </div>
        )}
      </section>

      {/* ═══ Lessons Grid ═══ */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <div className="text-right">
            <h3 className="text-base font-black text-slate-900">المحاضرات والحصص الدراسية المتاحة</h3>
            <p className="text-[10px] text-slate-500 font-bold">شاهد الحصص، تفاعل مع الكود، واختبر معلوماتك فورياً</p>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">عدد المحاضرات: {filteredLessons.length}</span>
        </div>

        {filteredLessons.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto space-y-2">
            <span className="text-4xl block">📦</span>
            <h4 className="font-black text-slate-800 text-sm">لا توجد حصص مرفوعة بعد</h4>
            <p className="text-[11px] text-slate-500 font-bold">لم يتم رفع أي حصة دراسية لهذا الصف حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => {
              const isFree = lesson.price === 0;
              const isSubscribed = currentStudent?.subscriptionType === 'premium' || currentStudent?.subscriptionType === 'monthly';
              const isUnlocked = currentStudent?.unlockedLessons?.includes(lesson.id);
              const hasAccess = userRole === 'admin' || isFree || isSubscribed || isUnlocked;

              return (
                <div 
                  key={lesson.id} 
                  onClick={() => handleLessonCardClick(lesson)}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 relative"
                >
                  {/* Subject Badge */}
                  <span className="absolute top-3 right-3 z-10 bg-slate-900/80 text-[#D4A017] text-[9px] font-black px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10 uppercase">
                    {lesson.subject}
                  </span>

                  {/* Free badge */}
                  {isFree && (
                    <span className="absolute top-3 left-3 z-10 bg-emerald-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-md animate-pulse">
                      حصة مجانية 🎁
                    </span>
                  )}

                  {/* Thumbnail / Video Preview */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img 
                      src={lesson.thumbnail} 
                      alt={lesson.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-all flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#D4A017] text-[#0D1B2A] flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-right">
                    <div className="space-y-2">
                      <div className="flex items-center justify-end gap-1.5 text-slate-500 text-[10px] font-bold">
                        <span>{lesson.duration}</span>
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                        {lesson.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {lesson.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      {hasAccess ? (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          مشاهدة الآن
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          شراء الحصة
                        </span>
                      )}

                      <span className="text-xs font-black text-slate-900">
                        {isFree ? 'مجانًا' : `${lesson.price} جنيه`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══ Help FAQ banner ═══ */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h4 className="font-black text-sm md:text-base text-[#D4A017]">هل تواجه مشكلة أو تحتاج لدعم فني؟ 📲</h4>
          <p className="text-[11px] text-slate-400 font-bold max-w-lg">
            إذا واجهتك أي مشكلة في شحن محفظتك، أو تفعيل حسابك، تواصل مع الدعم الفني المباشر لحل مشكلتك فوراً.
          </p>
        </div>
        <a 
          href="https://wa.me/201002169889"
          target="_blank"
          rel="noreferrer"
          className="btn-whatsapp text-xs font-black px-6 py-3 rounded-xl shadow-lg whitespace-nowrap"
        >
          محادثة الدعم الفني واتساب 💬
        </a>
      </section>

    </div>
  );
};
