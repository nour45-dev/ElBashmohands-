import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wallet, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  TrendingUp,
  History,
  Copy,
  Zap,
  Sparkles,
  Ticket,
  GraduationCap,
  Upload,
  Clock,
  XCircle,
  Check
} from 'lucide-react';

export const WalletView = () => {
  const { student, submitPaymentRequest, purchaseSubscription, paymentRequestsDB, userRole } = useApp();

  if (userRole === 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl font-black border border-amber-500/20 shadow-md">
          🛡️
        </div>
        <h2 className="text-xl font-black text-slate-900">وضع معاينة المعلم (الأدمن) 💻</h2>
        <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-md">
          أنت الآن مسجل دخول كـ **أدمن**. هذه الصفحة (المحفظة والرصيد) مخصصة فقط لعرض ومتابعة أرصدة واشتراكات الطلاب.
        </p>
        <p className="text-xs text-slate-400 font-medium max-w-sm">
          لشحن رصيد أي طالب، أو تفعيل اشتراكه، أو قبول طلبات الشحن والمدفوعات، يرجى الذهاب لتبويب **"لوحة المعلم"** في الشريط العلوي لإدارة المنصة بالكامل.
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('recharge');
  const [paymentMethod, setPaymentMethod] = useState('instapay');
  const [selectedAmount, setSelectedAmount] = useState(150);
  const [refNumber, setRefNumber] = useState('');
  
  // Proof Receipt Image Picker
  const proofInputRef = useRef(null);
  const [proofFile, setProofFile] = useState(null);

  const [feedback, setFeedback] = useState(null);

  const studentRequests = paymentRequestsDB.filter(r => r.studentId === student.id);

  const handleProofFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setProofFile(file);
  };

  const handleSubscribe = (planType, price) => {
    setFeedback(null);
    const res = purchaseSubscription(planType, price);
    setFeedback(res);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!refNumber.trim() || refNumber.length < 4) {
      setFeedback({ success: false, message: 'يرجى إدخال مرجع التحويل أو رقم الموبايل المحول منه.' });
      return;
    }

    if (!proofFile) {
      setFeedback({ success: false, message: 'تنبيه أمان: يرجى رفع صورة إيصال التحويل (Screenshot) للتأكيد والتحقق من الشحن.' });
      return;
    }

    const proofImageUrl = URL.createObjectURL(proofFile);

    const res = submitPaymentRequest({
      amount: selectedAmount,
      method: paymentMethod,
      refNumber: refNumber.trim(),
      proofImage: proofImageUrl
    });

    setFeedback(res);
    if (res.success) {
      setRefNumber('');
      setProofFile(null);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      
      {/* Wallet Balance Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="space-y-3 text-right z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-full border border-amber-500/30">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span>محفظة المعلم الإلكترونية والاشتراكات 💳</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black">
            رصيدك الحالي: <span className="text-amber-400 font-mono dir-ltr">{student.walletBalance}</span> جنيه
          </h1>

          <p className="text-xs text-slate-400 font-medium">
            حالة الاشتراك الحالي: <span className="text-emerald-400 font-bold">{student.subscriptionType || 'غير مشترك'}</span> {student.subscriptionType === 'شهري' && `(رصيدك: ${student.monthlyCreditsLeft || 0}/8 حصص)`} • صف الطالب: ({student.gradeName})
          </p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-center space-y-2 z-10 w-full md:w-auto">
          <div className="text-xs text-slate-400 font-bold">كود الطالب الخاص بك:</div>
          <div className="text-xl font-mono font-black text-amber-400 dir-ltr">{student.code}</div>
        </div>

      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <button
          onClick={() => { setActiveTab('recharge'); setFeedback(null); }}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'recharge' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Wallet className="w-4 h-4 text-purple-400" />
          <span>شحن المحفظة برفع صورة الإيصال (InstaPay / كاش) 💳</span>
        </button>

        <button
          onClick={() => { setActiveTab('subscriptions'); setFeedback(null); }}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === 'subscriptions' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>اشتراكات الصف (8 حصص شهرياً) 🎓</span>
        </button>
      </div>

      {/* Recharge Wallet with Proof Upload */}
      {activeTab === 'recharge' && (
        <div className="space-y-8 animate-in fade-in">
          
          <div className="bg-white dark:bg-[#162534] p-6 md:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-1">
              <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                اختر طريقة الدفع المناسبة واشحن محفظتك بسهولة ⚡
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">قم بتحويل المبلغ على الرقم الرسمي الموحد للمنصة، ثم ارفع صورة الإيصال للموافقة الفورية من الأدمن.</p>
            </div>

            {/* Payment Channels Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('instapay')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'instapay' ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-300 font-black ring-2 ring-purple-500/20' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold'}`}
              >
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-black">انستا باي InstaPay ⚡</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('vodafone')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'vodafone' ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-300 font-black ring-2 ring-rose-500/20' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold'}`}
              >
                <Smartphone className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                <span className="text-sm font-black">فودافون كاش (Vodafone Cash)</span>
              </button>
            </div>

            {/* Custom Guidance Instructions Box for Each Selected Method */}
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 rounded-2xl space-y-3 text-right border border-slate-800">
              
              {paymentMethod === 'instapay' && (
                <div className="space-y-1.5 text-xs">
                  <div className="font-black text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>خطوات الشحن عبر تطبيق InstaPay:</span>
                  </div>
                  <p className="text-slate-300">1. افتح تطبيق InstaPay واختر تحويل إلى عنوان دفع لحظي (IPA) أو رقم موبايل.</p>
                  <p className="text-slate-300">2. عنوان الدفع (IPA): <span className="font-mono text-amber-300 font-black text-sm select-all">noureldinahmedh@instapay</span> أو رقم الموبايل: <span className="font-mono text-amber-300 font-black text-sm select-all">01002169889</span></p>
                  <p className="text-slate-300">3. بعد إتمام التحويل، خذ سكرين شوت لشاشة النجاح وارفقها بالأسفل.</p>
                </div>
              )}

              {paymentMethod === 'vodafone' && (
                <div className="space-y-1.5 text-xs">
                  <div className="font-black text-rose-400 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>خطوات الشحن عبر فودافون كاش (Vodafone Cash):</span>
                  </div>
                  <p className="text-slate-300">1. اطلب الكود المباشر: <span className="font-mono text-rose-300 font-black dir-ltr text-sm">*9*7*01002169889*المبلغ#</span></p>
                  <p className="text-slate-300">2. أو اذهب لفرع فودافون كاش وحول المبلغ للرقم: <span className="font-mono text-rose-300 font-black text-sm select-all">01002169889</span></p>
                  <p className="text-slate-300">3. صور سكرين شوت للرسالة النصية المأكدة للتحويل وارفقها بالأسفل.</p>
                </div>
              )}

            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              
              {/* Amount Selector */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">المبلغ المراد شحنه:</label>
                <div className="flex flex-wrap items-center gap-2">
                  {[50, 100, 150, 200, 300, 1200].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedAmount(amt)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${selectedAmount === amt ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      {amt} ج.م
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">مرجع العملية / رقم الموبايل المحول منه:</label>
                <input
                  type="text"
                  required
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  placeholder="أدخل رقم العملية أو الموبايل المحول منه هنا..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none dir-ltr"
                />
              </div>

              {/* Proof Image Screenshot Upload Box */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300">رفع صورة إيصال التحويل (Screenshot):</label>
                <div 
                  onClick={() => proofInputRef.current && proofInputRef.current.click()}
                  className="border-2 border-dashed border-purple-300 dark:border-purple-600/50 hover:border-purple-500 p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 text-center space-y-2 cursor-pointer transition-all"
                >
                  <Upload className="w-7 h-7 text-purple-600 dark:text-purple-400 mx-auto animate-bounce" />
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200">اضغط لرفع صورة سكرين شوت الإيصال من موبايلك 📱</div>
                  <input
                    ref={proofInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProofFileChange}
                    className="hidden"
                  />
                  {proofFile && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 p-2 rounded-xl text-xs font-bold">
                      تم تحديد صورة الإيصال: {proofFile.name} ✅
                    </div>
                  )}
                </div>
              </div>

              {feedback && (
                <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${feedback.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                  {feedback.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
                  <span>{feedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-accent text-xs font-black py-3.5 rounded-xl justify-center shadow-lg shadow-amber-500/20"
              >
                إرسال طلب الشحن وصورة الإيصال للمراجعة والموافقة 🚀
              </button>

            </form>

          </div>

          {/* Student Submitted Requests Status Table */}
          <div className="bg-white dark:bg-[#162534] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base">سجل طلبات الشحن الخاصة بك</h3>
            
            {studentRequests.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-bold">لا توجد طلبات شحن سابقة.</div>
            ) : (
              <div className="space-y-3">
                {studentRequests.map(req => (
                  <div key={req.id} className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-black text-slate-900 dark:text-white">{req.amount} جنيه • ({req.method.toUpperCase()})</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">المرجع: {req.refNumber} • {req.requestDate}</div>
                    </div>

                    <div>
                      {req.status === 'pending' && (
                        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          قيد مراجعة الأدمن ⏳
                        </span>
                      )}
                      {req.status === 'approved' && (
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تمت الموافقة وإضافة الرصيد ✅
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          مرفوض (راجع بيانات التحويل) ❌
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Subscriptions Workspace */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Plan 1: Monthly Subscription */}
            <div className="bg-white dark:bg-[#162534] p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-md space-y-4 flex flex-col justify-between transition-all">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-black px-3 py-1 rounded-full">
                  <GraduationCap className="w-4 h-4" />
                  <span>الاشتراك الشهري (8 حصص اختيارية) 📅</span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white">150 جنيه <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">/ شهرياً</span></h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  يمنحك رصيد 8 حصص اختيارية لفتح أي 8 فيديوهات تختارها بنفسك في صفك الدراسي ({student.gradeName}).
                </p>
              </div>

              <button
                onClick={() => handleSubscribe('شهري', 150)}
                className="w-full btn-primary text-xs font-black py-3.5 rounded-xl justify-center shadow-md shadow-blue-500/20"
              >
                تفعيل الاشتراك الشهري بـ 150 ج.م 🚀
              </button>
            </div>

            {/* Plan 2: Annual Subscription */}
            <div className="bg-gradient-to-b from-slate-900 to-blue-950 text-white p-6 rounded-3xl border-2 border-amber-500/50 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-3 z-10">
                <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-500/30">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>الاشتراك السنوي الكامل 🎓</span>
                </div>

                <h3 className="text-3xl font-black text-white">1,200 جنيه <span className="text-xs text-slate-300 font-bold">/ للعام كاملاً</span></h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  يفتح لك كافة الحصص الحالية والجديدة طوال العام الدراسي بالإضافة لمراجعات ليلة الامتحان والـ PDF.
                </p>
              </div>

              <button
                onClick={() => handleSubscribe('سنوي', 1200)}
                className="w-full btn-accent text-xs font-black py-3.5 rounded-xl justify-center shadow-lg shadow-amber-500/20 z-10"
              >
                تفعيل الاشتراك السنوي بـ 1200 ج.م 🌟
              </button>
            </div>

          </div>

          {feedback && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${feedback.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
              {feedback.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
              <span>{feedback.message}</span>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
