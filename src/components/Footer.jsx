import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { ElmLogo } from './ElmLogo';

export const Footer = ({ setCurrentTab }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-14 pb-8 border-t border-slate-800 dark">
      <div className="container">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ElmLogo variant="horizontal" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              المنصة التعليمية الأولى المتخصصة في البرمجة واللغة العربية للمرحلة الثانوية العامة. تبسيط كامل للمناهج، امتحانات تفاعلية، وتقارير واتساب فورية.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
              <span>مصممة بأعلى جودة لمساعدة طلاب الثانوية ⚡</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">الروابط السريعة</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li>
                <button onClick={() => setCurrentTab('home')} className="hover:text-amber-400 transition-all">الرئيسية والحصص</button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('exams')} className="hover:text-amber-400 transition-all">الامتحانات والواجبات</button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('wallet')} className="hover:text-amber-400 transition-all">شحن المحفظة</button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('parent-view')} className="hover:text-amber-400 transition-all">متابعة ولي الأمر</button>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">الدعم الفني والواتساب</h4>
            <div className="space-y-2 text-xs font-bold">
              <a 
                href="https://wa.me/201002169889" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 p-2.5 rounded-xl hover:bg-emerald-600/30 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>واتساب الدعم: 01002169889</span>
              </a>
              <div className="flex items-center gap-2.5 text-slate-400">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>support@elbashmohandis.com</span>
              </div>
            </div>
          </div>

          {/* Col 4: Protection */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">حماية المنصة</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              جميع حقوق الطبع والنشر للمحتوى محفوظة لمنصة عِلم.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>نظام حماية الحصص والتصحيح الفوري</span>
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div>
            © 2026 جميع الحقوق محفوظة لمنصة عِلم التعليمية ⚡
          </div>
          <div className="flex items-center gap-1">
            <span>تم التطوير بكل</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>لأبطال الثانوية العامة</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
