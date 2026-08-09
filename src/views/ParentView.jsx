import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search, PhoneCall, Award, CheckCircle2, Send, Flame, Wallet, BookOpen, Sparkles } from 'lucide-react';

export const ParentView = () => {
  const { student, studentsDB, examHistory, setActiveWhatsAppModal } = useApp();

  const [studentSearchInput, setStudentSearchInput] = useState(student ? student.code : 'ENG-101');
  const [foundStudent, setFoundStudent] = useState(student || studentsDB[0]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = studentSearchInput.trim().toUpperCase();
    const matched = studentsDB.find(s => s.code === query || s.name.includes(query) || s.phone.includes(query));
    if (matched) {
      setFoundStudent(matched);
    } else {
      alert('لم يتم العثور على طالب بهذ الكود أو الاسم. جرب كتابة ENG-101 أو ENG-102');
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white p-8 rounded-3xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full backdrop-blur-md">
            <Users className="w-4 h-4 text-amber-300" />
            <span>نظام متابعة أولياء الأمور - منصة الباشمهندس للبرمجة 👨‍👩‍👦</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">بوابة متابعة أداء الطالب</h1>
          <p className="text-xs md:text-sm text-amber-100 font-medium">
            ابحث بكود الطالب أو اسمه لمتابعة درجات البرمجة، نسبة الحضور والتفاعل، واستقبال التقرير الموثق على الواتساب.
          </p>
        </div>

        {/* Dynamic Search Box */}
        <form onSubmit={handleSearch} className="bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-md flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={studentSearchInput}
            onChange={(e) => setStudentSearchInput(e.target.value)}
            placeholder="أدخل اسم أو كود الطالب (ENG-101)..."
            className="bg-white text-slate-900 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider outline-none flex-1"
          />
          <button type="submit" className="btn-accent text-xs font-black px-4 py-2 rounded-xl flex-shrink-0">
            بحث 🔍
          </button>
        </form>
      </div>

      {/* Student Performance Live Card */}
      {foundStudent && (
        <div className="space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-2xl shadow-md">
                  👤
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">{foundStudent.name}</h3>
                    <span className="badge badge-amber">كود: {foundStudent.code}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold mt-1">{foundStudent.gradeName}</p>
                </div>
              </div>

              {/* Direct WhatsApp Report Trigger Button */}
              <button
                onClick={() => setActiveWhatsAppModal({
                  studentName: foundStudent.name,
                  parentPhone: foundStudent.parentPhone,
                  studentPhone: foundStudent.phone,
                  gradeName: foundStudent.gradeName,
                  examTitle: 'تقرير المستوى والبرمجة الشامل - منصة الباشمهندس',
                  score: 5,
                  total: 5,
                  percentage: 100,
                  pointsEarned: 100,
                  date: new Date().toISOString().split('T')[0],
                  teacherNotes: 'طالب متميز وملتزم بكورسات البرمجة وحل التحديات الكودية.'
                })}
                className="btn-whatsapp text-xs font-black px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/20"
              >
                <span>📲 إرسال تقرير الأداء الموثق على الواتساب</span>
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
                <div className="text-xs font-bold text-slate-500">الترتيب في البرمجة</div>
                <div className="text-xl font-black text-amber-600">المركز #{foundStudent.rank} 🏆</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
                <div className="text-xs font-bold text-slate-500">معدل التقفيل في الامتحانات</div>
                <div className="text-xl font-black text-emerald-600">98% 🌟</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
                <div className="text-xs font-bold text-slate-500">الشعلة والالتزام اليومي</div>
                <div className="text-xl font-black text-amber-500">{foundStudent.streakDays} أيام 🔥</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
                <div className="text-xs font-bold text-slate-500">رصيد النقاط المكتسبة</div>
                <div className="text-xl font-black text-blue-600">{foundStudent.points} ⚡</div>
              </div>
            </div>

          </div>

          {/* Exam History Breakdown for Parents */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <h3 className="font-black text-slate-900 text-base">سجل نتائج امتحانات البرمجة والواجبات 📜</h3>

            <div className="space-y-3">
              {examHistory.map(hist => (
                <div key={hist.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-bold">
                  <div className="space-y-1 text-right">
                    <div className="font-black text-slate-900 text-sm">{hist.quizTitle}</div>
                    <div className="text-slate-500">تاريخ الامتحان: {hist.date}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-emerald-700 font-black text-sm">النتيجة: {hist.score}/{hist.total} ({hist.percentage}%)</span>
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200">
                      {hist.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
