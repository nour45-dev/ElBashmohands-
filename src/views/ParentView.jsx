import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search, PhoneCall, Award, CheckCircle2, Send, Flame, Wallet, BookOpen, Sparkles } from 'lucide-react';

export const ParentView = () => {
  const { student, studentsDB, examHistory, setActiveWhatsAppModal, userRole } = useApp();

  const [studentSearchInput, setStudentSearchInput] = useState(student ? student.code : '3003');
  const [foundStudent, setFoundStudent] = useState(student || studentsDB[0]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = studentSearchInput.trim().toUpperCase();
    const matched = studentsDB.find(s => s.code === query || s.name.includes(query) || s.phone.includes(query));
    if (matched) {
      setFoundStudent(matched);
    } else {
      alert('لم يتم العثور على طالب بهذا الكود أو الاسم. جرب كتابة 3003 أو 1001 أو ENG-101');
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-8 rounded-3xl border border-blue-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full backdrop-blur-md">
            <Users className="w-4 h-4 text-amber-300" />
            <span>نظام متابعة أولياء الأمور - منصة عِلم التعليمية 👨‍👩‍👦</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">بوابة متابعة أداء الطالب</h1>
          <p className="text-xs md:text-sm text-blue-100 font-medium">
            متابعة شاملة لدرجات الطالب، نسبة الحضور والتفاعل، واستقبال التقارير الموثقة على الواتساب.
          </p>
        </div>

        {/* Dynamic Search Box */}
        <form onSubmit={handleSearch} className="bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-md flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={studentSearchInput}
            onChange={(e) => setStudentSearchInput(e.target.value)}
            placeholder="أدخل اسم أو كود الطالب..."
            className="bg-white text-slate-900 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider outline-none flex-1"
          />
          <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl flex-shrink-0 shadow-md transition-all">
            بحث 🔍
          </button>
        </form>
      </div>

      {/* Student Performance Live Card */}
      {foundStudent && (
        <div className="space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white dark:bg-[#162534] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-6">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-2xl shadow-md border border-blue-200 dark:border-blue-500/30">
                  👤
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{foundStudent.name}</h3>
                    <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-xs font-black">كود: {foundStudent.code}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">{foundStudent.gradeName || 'الصف الثالث الثانوي'}</p>
                </div>
              </div>

              {/* Direct WhatsApp Report Trigger Button (Admin only) */}
              {userRole === 'admin' && (
                <button
                  onClick={() => setActiveWhatsAppModal({
                    studentName: foundStudent.name,
                    parentPhone: foundStudent.parentPhone,
                    studentPhone: foundStudent.phone,
                    gradeName: foundStudent.gradeName,
                    examTitle: 'تقرير المستوى الشامل - منصة عِلم التعليمية',
                    score: 5,
                    total: 5,
                    percentage: 100,
                    pointsEarned: 100,
                    date: new Date().toISOString().split('T')[0],
                    teacherNotes: 'طالب متميز وملتزم بمشاهدة الحصص وحل الامتحانات الدورية.'
                  })}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال تقرير الأداء على الواتساب</span>
                </button>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">الترتيب العام</div>
                <div className="text-xl font-black text-amber-600 dark:text-amber-400">المركز #{foundStudent.rank || 1} 🏆</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">معدل التقفيل في الامتحانات</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">98% 🌟</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">الشعلة والالتزام اليومي</div>
                <div className="text-xl font-black text-amber-500">{foundStudent.streakDays || 5} أيام 🔥</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">رصيد النقاط المكتسبة</div>
                <div className="text-xl font-black text-blue-600 dark:text-blue-400">{foundStudent.points || 120} ⚡</div>
              </div>
            </div>

          </div>

          {/* Exam History Breakdown for Parents */}
          <div className="bg-white dark:bg-[#162534] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base">سجل نتائج الامتحانات والواجبات 📜</h3>

            <div className="space-y-3">
              {(examHistory && examHistory.length > 0) ? (
                examHistory.map(hist => (
                  <div key={hist.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-bold">
                    <div className="space-y-1 text-right">
                      <div className="font-black text-slate-900 dark:text-white text-sm">{hist.quizTitle}</div>
                      <div className="text-slate-500 dark:text-slate-400">تاريخ الامتحان: {hist.date}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">النتيجة: {hist.score}/{hist.total} ({hist.percentage}%)</span>
                      <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        {hist.status || 'مكتمل بنجاح'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 font-bold">
                  لم يسجل الطالب أي امتحانات بعد. ستظهر النتائج والتقارير هنا فور حل الطالب لأي كويز أو امتحان. ✨
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

