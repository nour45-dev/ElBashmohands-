import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Languages
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
    <div className="space-y-10 pb-16">
      
      {/* ═══ Hero Section ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800">
        
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/2 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
          
          {/* Left: Text content */}
          <div className="p-8 md:p-12 space-y-6 text-right flex flex-col justify-center">

            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg shadow-amber-500/10 self-end">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>منصة مَنارة التعليمية 💡⚡</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
                تفوّق في{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">اللغة العربية</span>
                {' '}و{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">البرمجة</span>
                {' '}🚀
              </h1>

              <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
                منصة مَنارة التعليمية هي بوابتك المضيئة لتفوق <strong className="text-amber-300">اللغة العربية</strong> ونبوغ <strong className="text-blue-300">البرمجة وعلوم الحاسب</strong> لطلاب المرحلة الثانوية — مع امتحانات تفاعلية وتصحيح ذكي وتقارير فورية لأولياء الأمور 📲
              </p>
            </div>

            {/* Subject badges */}
            <div className="flex flex-wrap gap-2 justify-end">
              <div className="flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-3 py-1.5 rounded-xl text-[11px] font-black">
                <Code2 className="w-3.5 h-3.5" />
                البرمجة وعلوم الحاسب
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3 py-1.5 rounded-xl text-[11px] font-black">
                <Languages className="w-3.5 h-3.5" />
                اللغة العربية
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button 
                onClick={() => setCurrentTab('lessons')}
                className="btn-accent text-xs md:text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                تصفح الحصص الآن
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

          {/* Right: Student Photo */}
          <div className="relative hidden lg:flex items-end justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-slate-900/60 z-10" />
            <img
              src="/hero_student.jpg"
              alt="منصة مَنارة التعليمية"
              className="h-full w-full object-cover object-top"
              style={{ maxHeight: '480px' }}
            />
            {/* Floating score badge */}
            <div className="absolute top-6 left-6 z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-right shadow-xl">
              <div className="text-[10px] text-slate-300 font-bold">آخر امتحان برمجة</div>
              <div className="text-lg font-black text-emerald-400">100% 🌟</div>
              <div className="text-[9px] text-slate-400">تقرير أُرسل لولي الأمر ✅</div>
            </div>
            {/* Floating Arabic badge */}
            <div className="absolute bottom-16 left-6 z-20 bg-amber-500/90 backdrop-blur-md rounded-2xl p-3 text-right shadow-xl">
              <div className="text-[10px] text-amber-950 font-black">💬 مادة العربي</div>
              <div className="text-xs font-black text-amber-950">النحو والبلاغة ✨</div>
            </div>
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
                    ? s.color === 'blue' ? 'bg-blue-600 text-white border-blue-600' : s.color === 'amber' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
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
                <div key={folder.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
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
                        <button onClick={() => setCurrentTab('admin')} className="mt-3 text-xs text-blue-600 font-black hover:underline">
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
                            className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
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
                              <p className="font-black text-slate-800 text-xs leading-snug line-clamp-2">{lesson.title}</p>
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
                        className="text-xs text-blue-600 font-black hover:underline"
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
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                حصص {effectiveSubjectFilter === 'arabic' ? 'اللغة العربية 📖' : 'البرمجة وعلوم الحاسب 💻'}
              </h3>
              {userRole !== 'admin' && (
                <button
                  onClick={() => setSubjectFilter('all')}
                  className="text-xs text-slate-500 font-black hover:text-blue-600 flex items-center gap-1"
                >
                  ← رجوع للكل
                </button>
              )}
            </div>

            {filteredLessons.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mx-auto font-black">
                  {effectiveSubjectFilter === 'arabic' ? '📖' : '💻'}
                </div>
                <h4 className="font-black text-lg text-slate-900">لا توجد حصص لهذا الصف والمادة حالياً</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
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
                      className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
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
                            <span className="text-[10px] text-slate-400 font-bold">منصة الباشمهندس</span>
                          </div>
                          <h4 className="font-black text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-all">
                            {lesson.title}
                          </h4>
                        </div>

                        <button
                          onClick={() => { setSelectedLessonId(lesson.id); setCurrentTab('lesson-detail'); }}
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
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
