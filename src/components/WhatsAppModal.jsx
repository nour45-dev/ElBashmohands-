import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  Send, 
  X, 
  User, 
  Phone, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';

export const WhatsAppModal = () => {
  const { activeWhatsAppModal, setActiveWhatsAppModal, triggerWhatsAppSend, triggerSmsSend, getWhatsAppMsgText } = useApp();
  
  const [recipient, setRecipient] = useState('parent'); // 'parent' or 'student'
  const [copied, setCopied] = useState(false);

  if (!activeWhatsAppModal) return null;

  const msgText = (getWhatsAppMsgText && typeof getWhatsAppMsgText === 'function') 
    ? getWhatsAppMsgText(activeWhatsAppModal, recipient)
    : `📌 *إشعار من منصة منصة عِلم التعليمية*
👤 *الطالب:* ${activeWhatsAppModal.studentName || 'طالب منصة المعلم'}
🎓 *الصف:* ${activeWhatsAppModal.gradeName || 'الصف الثالث الثانوي'}
📝 *الموضوع:* ${activeWhatsAppModal.examTitle || activeWhatsAppModal.title || 'تقرير البرمجة الموثق'}

🔗 https://bassthalk.com/elbashmohandis`;

  const handleLaunchWhatsApp = () => {
    const { whatsappUrl } = triggerWhatsAppSend(activeWhatsAppModal, recipient);
    window.open(whatsappUrl, '_blank');
  };

  const handleLaunchSms = () => {
    const { smsUrl } = triggerSmsSend(activeWhatsAppModal, recipient);
    window.open(smsUrl, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(msgText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white max-w-lg w-full p-6 md:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6 text-right relative">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveWhatsAppModal(null)}
          className="absolute top-4 left-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>مرسل الواتساب والرسائل النصية SMS 📲💬</span>
          </div>
          <h3 className="font-black text-slate-900 text-xl">إرسال التقرير الموثق</h3>
        </div>

        {/* Recipient Switcher */}
        <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRecipient('parent')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${recipient === 'parent' ? 'bg-emerald-600 text-white shadow-md font-black' : 'text-slate-700 hover:text-slate-900'}`}
          >
            <User className="w-4 h-4" />
            <span>واتساب / SMS ولي الأمر 👨‍👦</span>
          </button>

          <button
            type="button"
            onClick={() => setRecipient('student')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${recipient === 'student' ? 'bg-blue-600 text-white shadow-md font-black' : 'text-slate-700 hover:text-slate-900'}`}
          >
            <Phone className="w-4 h-4" />
            <span>واتساب / SMS الطالب 🎓</span>
          </button>
        </div>

        {/* Target Number */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
          <span className="text-slate-500 font-bold">الرقم المستهدف:</span>
          <span className="font-mono font-black text-slate-900 text-sm dir-ltr">
            {recipient === 'parent' ? activeWhatsAppModal.parentPhone : activeWhatsAppModal.studentPhone}
          </span>
        </div>

        {/* Message Preview Box */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-2 text-right">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>معاينة نص الرسالة</span>
            <button
              onClick={handleCopyText}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'تم النسخ!' : 'نسخ الرسالة'}</span>
            </button>
          </div>
          <div className="text-xs font-mono whitespace-pre-wrap leading-relaxed opacity-90 dir-rtl max-h-40 overflow-y-auto">
            {msgText}
          </div>
        </div>

        {/* Dual Actions: Launch WhatsApp OR SMS */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleLaunchWhatsApp}
            className="w-full btn-whatsapp text-xs font-black py-3.5 rounded-xl justify-center shadow-lg shadow-emerald-500/20"
          >
            <ExternalLink className="w-4 h-4" />
            <span>إرسال عبر الواتساب 📲</span>
          </button>

          <button
            onClick={handleLaunchSms}
            className="w-full btn-primary text-xs font-black py-3.5 rounded-xl justify-center shadow-lg shadow-blue-500/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>إرسال عبر الـ SMS 💬</span>
          </button>
        </div>

      </div>
    </div>
  );
};
