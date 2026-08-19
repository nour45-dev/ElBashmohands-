import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Video, 
  CreditCard, 
  MessageSquare, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck,
  Upload,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  Ticket,
  Edit,
  Trash2,
  Send,
  DollarSign,
  Eye,
  Award,
  HelpCircle,
  MessageCircle,
  Plus,
  Clock,
  XCircle,
  Check,
  Image as ImageIcon,
  X,
  BarChart2,
  Bell,
  Radio,
  Hand,
  Sparkles,
  Share2
} from 'lucide-react';

export const AdminView = ({ setCurrentTab, setSelectedLessonId, setSelectedLiveId }) => {
  const { 
    studentsDB,
    lessons, 
    couponsDB,
    paymentRequestsDB,
    videoQuestions,
    whatsappLogs,
    examHistory,
    notifications,
    addNotification,
    adminDeleteNotification,
    adminAddLesson,
    adminDeleteLesson,
    adminUpdateLesson,
    adminCreateCoupon,
    adminDeleteCoupon,
    adminReplyToQuestion,
    adminApprovePayment,
    adminRejectPayment,
    adminUpdateStudent,
    adminDeleteStudent,
    triggerWhatsAppSend,
    triggerSmsSend,
    broadcastNewLesson,
    adminIdentity,
    setActiveWhatsAppModal,
    // Live Studio functions
    liveSessionsDB,
    adminCreateLiveSession,
    adminUpdateLiveStatus,
    adminDeleteLiveSession,
    adminBroadcastLiveAlert,
    adminLaunchLivePoll,
    uploadVideoFile
  } = useApp();

  const isSayedAdmin = adminIdentity === 'mr_sayed';
  const isNourAdmin = adminIdentity === 'eng_nour';
  const defaultAdminSubject = isSayedAdmin ? 'اللغة العربية' : 'برمجة وعلوم الحاسب';

  // Broadcast Modal State
  const [broadcastModal, setBroadcastModal] = useState(null); // { lessonTitle, links: [{studentName, phone, whatsappUrl}] }
  const [smsModal, setSmsModal] = useState(null); // { phone, msgText, whatsappFallbackUrl }

  const [adminTab, setAdminTab] = useState('videos');
  const [searchTerm, setSearchTerm] = useState('');

  // Live Studio States
  const [newLiveTitle, setNewLiveTitle] = useState('');
  const [newLiveSubject, setNewLiveSubject] = useState(defaultAdminSubject);
  const [newLiveGrade, setNewLiveGrade] = useState('3sec');
  const [newLiveDate, setNewLiveDate] = useState('');
  const [newLiveTime, setNewLiveTime] = useState('');
  const [newLiveStreamUrl, setNewLiveStreamUrl] = useState('');
  const [newLiveDesc, setNewLiveDesc] = useState('');
  const [liveSuccessMsg, setLiveSuccessMsg] = useState(null);
  const [selectedStudioSessionId, setSelectedStudioSessionId] = useState(null);
  
  // Live Studio Poll Creator State
  const [newPollQ, setNewPollQ] = useState('');
  const [newPollOptA, setNewPollOptA] = useState('');
  const [newPollOptB, setNewPollOptB] = useState('');
  const [newPollOptC, setNewPollOptC] = useState('');
  const [newPollOptD, setNewPollOptD] = useState('');
  const [newPollCorrect, setNewPollCorrect] = useState('0');

  // Student Performance Modal State
  const [studentPerfModal, setStudentPerfModal] = useState(null); // student object

  // Proof Image Preview Modal State
  const [previewProofImage, setPreviewProofImage] = useState(null);

  // Edit Student Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editGrade, setEditGrade] = useState('3sec');
  const [editBalance, setEditBalance] = useState(0);
  const [editPassword, setEditPassword] = useState('');

  // Edit Lesson Modal State
  const [editingLessonModal, setEditingLessonModal] = useState(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonPrice, setEditLessonPrice] = useState(25);
  const [editLessonGrade, setEditLessonGrade] = useState('3sec');
  const [editLessonDesc, setEditLessonDesc] = useState('');

  // Live Stream Source Type: 'native' (Platform In-Browser Camera & Screen) | 'youtube_live' (External link)
  const [newLiveStreamType, setNewLiveStreamType] = useState('native');

  // Live Management Handlers
  const handleCreateLive = async (e) => {
    e.preventDefault();
    if (!newLiveTitle.trim()) return;

    const scheduledIso = (newLiveDate && newLiveTime) 
      ? new Date(`${newLiveDate}T${newLiveTime}`).toISOString()
      : new Date().toISOString();

    const isStartingNow = !newLiveDate || new Date(scheduledIso) <= new Date(Date.now() + 10 * 60 * 1000);

    const res = await adminCreateLiveSession({
      title: newLiveTitle.trim(),
      instructor: isSayedAdmin ? 'أ / سيد عبد العاطي' : 'م / نور الدين',
      instructorId: adminIdentity,
      subject: newLiveSubject,
      grade: newLiveGrade,
      status: isStartingNow ? 'live' : 'scheduled',
      scheduledAt: scheduledIso,
      streamType: newLiveStreamType,
      streamUrl: newLiveStreamType === 'native' 
        ? `platform_native_${Date.now()}` 
        : (newLiveStreamUrl.trim() || 'https://www.youtube.com/watch?v=jfKfPfyJRdk'),
      description: newLiveDesc.trim() || `حصة بث مباشر تفاعلية لمادة ${newLiveSubject}`
    });

    if (res.success) {
      setLiveSuccessMsg('تم إنشاء وبدء قاعة البث المباشر بنجاح! 🔴 جاري فتح القاعة وإرسال الإشعارات للطلاب...');
      
      // Automatic Instant In-App Notification & WhatsApp Dispatcher
      const notifyRes = await adminBroadcastLiveAlert(res.session.id);
      if (notifyRes.success && notifyRes.whatsappLinks?.length > 0) {
        setBroadcastModal({
          lessonTitle: `🔴 بث مباشر: ${res.session.title}`,
          links: notifyRes.whatsappLinks
        });
      }

      setNewLiveTitle('');
      setNewLiveDesc('');
      setNewLiveStreamUrl('');

      // Auto-navigate Teacher immediately into the Live Video Room (like Zoom)
      setTimeout(() => {
        if (setSelectedLiveId) setSelectedLiveId(res.session.id);
        if (setCurrentTab) setCurrentTab('live');
      }, 1000);
    } else {
      alert(res.message);
    }
  };

  const handleBroadcastLive = async (session) => {
    const res = await adminBroadcastLiveAlert(session.id);
    if (res.success) {
      setBroadcastModal({
        lessonTitle: `🔴 بث مباشر: ${session.title}`,
        links: res.whatsappLinks || []
      });
    } else {
      alert(res.message);
    }
  };

  const handleLaunchStudioPoll = async (e) => {
    e.preventDefault();
    if (!newPollQ.trim() || !newPollOptA.trim() || !newPollOptB.trim()) {
      alert('يرجى كتابة السؤال وخيارين على الأقل');
      return;
    }
    const activeStudioSession = liveSessionsDB.find(s => s.id === selectedStudioSessionId) || liveSessionsDB[0];
    if (!activeStudioSession) {
      alert('حدد حصة البث المباشر أولاً');
      return;
    }

    const options = [newPollOptA, newPollOptB];
    if (newPollOptC.trim()) options.push(newPollOptC.trim());
    if (newPollOptD.trim()) options.push(newPollOptD.trim());

    const res = await adminLaunchLivePoll(activeStudioSession.id, {
      question: newPollQ.trim(),
      options,
      correctIndex: Number(newPollCorrect)
    });

    if (res.success) {
      setNewPollQ('');
      setNewPollOptA('');
      setNewPollOptB('');
      setNewPollOptC('');
      setNewPollOptD('');
      alert('تم إطلاق السؤال التفاعلي على شاشات الطلاب الآن بنجاح! 🎯');
    }
  };

  const handleResetDevice = async (studentId) => {
    try {
      const res = await fetch(`/api/students/${studentId}/reset-device`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        alert('تم إلغاء قفل الجهاز للطالب بنجاح! يمكنه الآن الدخول من أي جهاز جديد.');
        window.location.reload();
      } else {
        alert('فشل إلغاء قفل الجهاز.');
      }
    } catch (e) {
      alert('خطأ في الاتصال بالخادم.');
    }
  };

  const handleGenerateOtp = async (student) => {
    try {
      const res = await fetch(`/api/students/${student.id}/generate-otp`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        alert(`تم توليد رمز الـ OTP بنجاح!\nالرمز الخاص بالطالب ${student.name} هو: ${data.otp}\nيمكنك إرساله له الآن لتفعيل جهازه الجديد.`);
      } else {
        alert('فشل توليد رمز OTP.');
      }
    } catch (e) {
      alert('خطأ في الاتصال بالخادم.');
    }
  };

  // Refs for local file uploads
  const videoInputRef = useRef(null);
  const docInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  // Video Form State
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonSubject, setNewLessonSubject] = useState(defaultAdminSubject);
  const [newLessonGrade, setNewLessonGrade] = useState('3sec');
  const [newLessonPrice, setNewLessonPrice] = useState(25);
  const [newLessonDesc, setNewLessonDesc] = useState('');
  
  const [videoUploadMode, setVideoUploadMode] = useState('file'); 
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');

  // Thumbnail State (Custom upload OR Auto-captured from video)
  const [customThumbFile, setCustomThumbFile] = useState(null);
  const [customThumbUrlData, setCustomThumbUrlData] = useState(null);
  const [autoVideoFrameUrl, setAutoVideoFrameUrl] = useState(null);

  // Attachment Choice: 'pdf', 'word', 'quiz'
  const [attachmentType, setAttachmentType] = useState('pdf');
  const [attachmentFile, setAttachmentFile] = useState(null);

  // Multi-Question Quiz Builder State
  const [quizQuestionsList, setQuizQuestionsList] = useState([
    {
      id: 1,
      question: 'ما هي أسرع لغة برمجة لتطوير تطبيقات الويب الحديثة؟',
      options: ['JavaScript / Node.js', 'Python', 'C++', 'Java'],
      correctIndex: 0
    }
  ]);
  const [newQTitle, setNewQTitle] = useState('');
  const [newQOptA, setNewQOptA] = useState('');
  const [newQOptB, setNewQOptB] = useState('');
  const [newQOptC, setNewQOptC] = useState('');
  const [newQOptD, setNewQOptD] = useState('');
  const [newQCorrectIdx, setNewQCorrectIdx] = useState(0);
  const [quizDurationMinutes, setQuizDurationMinutes] = useState(20);

  const [uploadError, setUploadError] = useState(null);
  const [lessonSuccessMsg, setLessonSuccessMsg] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadFileName, setCurrentUploadFileName] = useState('');

  const uploadFileToR2 = (file, uploadUrl) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`فشل الرفع برمز حالة: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('حدث خطأ في الاتصال بالشبكة أثناء الرفع.'));
      };

      xhr.send(file);
    });
  };

  const uploadFileHelper = async (file) => {
    if (!file) return null;

    const res = await fetch('/api/upload/presign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'فشل في استلام رابط الرفع من السيرفر.');
    }

    const { uploadUrl, videoUrl } = await res.json();
    await uploadFileToR2(file, uploadUrl);
    return videoUrl;
  };

  // Coupon Form State
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState('percent');
  const [couponValue, setCouponValue] = useState(50);
  const [couponGrade, setCouponGrade] = useState('all');
  const [couponMaxUses, setCouponMaxUses] = useState(50);
  const [couponSuccess, setCouponSuccess] = useState(false);

  // Notification Form State
  const [notifTargetGrade, setNotifTargetGrade] = useState('all');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifSubject, setNotifSubject] = useState(() => {
    return adminIdentity === 'mr_sayed' ? 'arabic' : adminIdentity === 'eng_nour' ? 'programming' : 'general';
  });
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Q&A Reply State
  const [replyTexts, setReplyTexts] = useState({});

  // Auto-capture video frame when video file changes
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      
      // Extract video snapshot thumbnail using canvas
      try {
        const videoEl = document.createElement('video');
        videoEl.src = URL.createObjectURL(file);
        videoEl.currentTime = 1.0;
        videoEl.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 480;
          canvas.height = 270;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
          setAutoVideoFrameUrl(canvas.toDataURL('image/jpeg'));
        };
      } catch (err) {
        console.log('Auto frame extraction note:', err);
      }
    }
  };

  const handleDocFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setAttachmentFile(file);
  };

  // Open Edit Lesson Modal
  const handleOpenEditLessonModal = (les) => {
    setEditingLessonModal(les);
    setEditLessonTitle(les.title);
    setEditLessonPrice(les.price);
    setEditLessonGrade(les.grade);
    setEditLessonDesc(les.description || '');
  };

  // Save Edit Lesson
  const handleSaveEditLesson = (e) => {
    e.preventDefault();
    if (!editingLessonModal) return;

    adminUpdateLesson(editingLessonModal.id, {
      title: editLessonTitle,
      price: Number(editLessonPrice),
      grade: editLessonGrade,
      description: editLessonDesc
    });

    setEditingLessonModal(null);
  };

  const handleOpenEditStudentModal = (std) => {
    setEditingStudent(std);
    setEditName(std.name);
    setEditPhone(std.phone);
    setEditParentPhone(std.parentPhone);
    setEditGrade(std.grade);
    setEditBalance(std.walletBalance);
    setEditPassword(std.password);
  };

  const handleSaveEditStudent = (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    adminUpdateStudent(editingStudent.id, {
      name: editName,
      phone: editPhone,
      parentPhone: editParentPhone,
      grade: editGrade,
      gradeName: editGrade === '1sec' ? 'الصف الأول الثانوي' : editGrade === '2sec' ? 'الصف الثاني الثانوي' : 'الصف الثالث الثانوي (تانوية عامة)',
      walletBalance: Number(editBalance),
      password: editPassword
    });

    setEditingStudent(null);
  };

  const handleAddQuestionToQuiz = () => {
    if (!newQTitle.trim()) return;
    const newQuestionObj = {
      id: quizQuestionsList.length + 1,
      question: newQTitle.trim(),
      options: [newQOptA || 'خيار 1', newQOptB || 'خيار 2', newQOptC || 'خيار 3', newQOptD || 'خيار 4'],
      correctIndex: Number(newQCorrectIdx)
    };
    setQuizQuestionsList(prev => [...prev, newQuestionObj]);
    setNewQTitle('');
    setNewQOptA('');
    setNewQOptB('');
    setNewQOptC('');
    setNewQOptD('');
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setUploadError(null);

    if (!newLessonTitle.trim()) {
      setUploadError('يرجى إدخال عنوان الحصة البرمجية.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let finalVideoUrl = '';
      let videoType = videoUploadMode;

      if (videoUploadMode === 'file') {
        if (!videoFile) {
          setUploadError('يرجى اختيار ملف الفيديو من الجهاز.');
          setIsUploading(false);
          return;
        }
        setCurrentUploadFileName('ملف الفيديو 🎬');
        finalVideoUrl = await uploadFileHelper(videoFile);
        videoType = 'file';
      } else {
        if (!videoUrlInput.trim()) {
          setUploadError('يرجى كتابة رابط الفيديو.');
          setIsUploading(false);
          return;
        }
        finalVideoUrl = videoUrlInput.trim();
      }

      // Upload attachment file if present
      let docFileUrl = null;
      if (attachmentFile) {
        setCurrentUploadFileName('الملخص / المستند المرفق 📄');
        setUploadProgress(0);
        docFileUrl = await uploadFileHelper(attachmentFile);
      }

      // Upload custom thumbnail or use auto/default
      let finalThumbnail = '';
      if (customThumbFile) {
        setCurrentUploadFileName('الصورة المصغرة 🖼️');
        setUploadProgress(0);
        finalThumbnail = await uploadFileHelper(customThumbFile);
      } else {
        const defaultSubjectThumb = newLessonSubject === 'اللغة العربية'
          ? 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=500'
          : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=500';
        finalThumbnail = autoVideoFrameUrl || defaultSubjectThumb;
      }

      let attachedQuizObj = null;
      if (attachmentType === 'quiz') {
        attachedQuizObj = {
          id: 'qz_' + Date.now(),
          title: `الامتحان الإلكتروني التفاعلي للحصة - ${newLessonTitle}`,
          rewardPoints: 50,
          durationMinutes: Number(quizDurationMinutes) || 20,
          questions: quizQuestionsList
        };
      }

      const createdObj = adminAddLesson({
        title: newLessonTitle,
        subject: newLessonSubject,
        grade: newLessonGrade,
        duration: '45 دقيقة',
        price: Number(newLessonPrice),
        videoType: videoType,
        videoUrl: finalVideoUrl,
        thumbnail: finalThumbnail,
        videoFileName: videoFile ? videoFile.name : 'فيديو مرفوع',
        description: newLessonDesc || `حصة ${newLessonSubject} مرفوعة من لوحة التحكم الإدارية.`,
        attachmentType: attachmentType,
        attachmentPdf: attachmentFile ? attachmentFile.name : (attachmentType === 'word' ? 'ملخص_الحصة.docx' : 'مذكرة_الحصة.pdf'),
        attachmentFileUrl: docFileUrl,
        attachedQuiz: attachedQuizObj
      });

      setLessonSuccessMsg(true);

      // Broadcast to all students via WhatsApp
      if (broadcastNewLesson) {
        const links = broadcastNewLesson(createdObj);
        setBroadcastModal({ lessonTitle: createdObj.title, links });
      }
      
      setTimeout(() => {
        if (setSelectedLessonId && setCurrentTab) {
          setSelectedLessonId(createdObj.id);
          setCurrentTab('lesson-detail');
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      setUploadError('حدث خطأ أثناء رفع الملفات للـ Firebase: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentUploadFileName('');
    }
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    adminCreateCoupon({
      code: couponCode,
      type: couponType,
      value: Number(couponValue),
      targetGrade: couponGrade,
      maxUses: Number(couponMaxUses)
    });

    setCouponCode('');
    setCouponSuccess(true);
    setTimeout(() => setCouponSuccess(false), 3000);
  };

  const handleReplySubmit = (questionId) => {
    const text = replyTexts[questionId];
    if (!text || !text.trim()) return;
    adminReplyToQuestion(questionId, text);
    setReplyTexts(prev => ({ ...prev, [questionId]: '' }));
  };

  // Bulk WhatsApp Broadcast to All Students in DB — يُرسل من رقم المنصة 01002169889
  const handleBulkWhatsAppBroadcast = () => {
    if (studentsDB.length === 0) {
      alert('لا يوجد طلاب مسجلين بعد!');
      return;
    }
    const links = studentsDB
      .filter(std => std.parentPhone || std.phone)
      .map(std => {
        const targetPhone = std.parentPhone || std.phone;
        const gradeLabel = std.grade === '3sec' ? 'ثالثة ثانوي' : std.grade === '2sec' ? 'ثاني ثانوي' : 'أول ثانوي';
        const msg = `📌 *تقرير متابعة من منصة المعلم*\n\nالطالب/ة: *${std.name}*\nالصف: ${gradeLabel}\nالرصيد: ${std.walletBalance || 0} ج.م\n\n🔗 تابع تقدم ابنك على منصتنا الآن!`;
        const formatted = (targetPhone || '').replace(/\s/g, '').startsWith('0') ? '2' + (targetPhone || '').replace(/\s/g, '') : (targetPhone || '').replace(/\s/g, '');
        return {
          studentName: std.name,
          phone: targetPhone,
          whatsappUrl: `https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`
        };
      });
    setBroadcastModal({ lessonTitle: '📊 تقرير متابعة لجميع الطلاب', links });
  };

  // Bulk SMS Broadcast to All Students in DB
  const handleBulkSmsBroadcast = () => {
    studentsDB.forEach(std => {
      triggerSmsSend({
        title: 'تنبيه من منصة منصة عِلم التعليمية',
        studentName: std.name,
        parentPhone: std.parentPhone,
        studentPhone: std.phone
      }, 'parent');
    });
    alert(`تم فتح تطبيق الرسائل القصيرة SMS لبث الإشعارات لجميع الطلاب المسجلين!`);
  };

  const pendingPaymentsCount = paymentRequestsDB.filter(r => r.status === 'pending').length;
  const pendingQAQuestionsCount = videoQuestions.filter(q => q.status === 'pending').length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Admin Header Banner */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-black px-3.5 py-1 rounded-full border border-amber-500/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{isSayedAdmin ? 'أ / سيد عبد العاطي • معلم خبير اللغة العربية 📖' : 'م / نور الدين • مهندس البرمجة وعلوم الحاسب 💻'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">
            {isSayedAdmin ? 'لوحة تحكم مادة اللغة العربية 📖' : 'لوحة تحكم مادة البرمجة وعلوم الحاسب 💻'}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {isSayedAdmin 
              ? 'إدارة حصص ومذكرات واختبارات وبثوث مادة اللغة العربية للثانوية العامة.'
              : 'إدارة حصص وأكواد وتطبيقات واختبارات وبثوث مادة البرمجة وعلوم الحاسب.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkWhatsAppBroadcast}
            className="btn-whatsapp text-xs font-black px-4 py-2.5 rounded-xl shadow-md"
          >
            بث واتساب لطلاب المادة 📲
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('live')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${adminTab === 'live' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Radio className="w-4 h-4 text-rose-400" />
          <span>🔴 البث المباشر ({liveSessionsDB.filter(s => isSayedAdmin ? (s.subject === 'اللغة العربية' || s.subject?.includes('عرب') || s.subject === 'arabic') : (!s.subject?.includes('عرب') && s.subject !== 'arabic')).length})</span>
          {liveSessionsDB.some(s => s.status === 'live') && (
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          )}
        </button>

        <button
          onClick={() => setAdminTab('videos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${adminTab === 'videos' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Video className="w-4 h-4" />
          الحصص والمذكرات ({lessons.filter(l => isSayedAdmin ? (l.subject === 'اللغة العربية' || l.subject?.includes('عرب') || l.subject === 'arabic') : (!l.subject?.includes('عرب') && l.subject !== 'arabic')).length})
        </button>

        <button
          onClick={() => setAdminTab('coupons')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${adminTab === 'coupons' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Ticket className="w-4 h-4 text-amber-500" />
          الكوبونات ({couponsDB.length})
        </button>

        <button
          onClick={() => setAdminTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${adminTab === 'payments' ? 'bg-purple-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <CreditCard className="w-4 h-4 text-amber-400" />
          <span>المدفوعات ({pendingPaymentsCount} معلق) 💳</span>
        </button>

        <button
          onClick={() => setAdminTab('qa')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${adminTab === 'qa' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <MessageSquare className="w-4 h-4 text-amber-400" />
          الأسئلة والردود ({videoQuestions.filter(q => isSayedAdmin ? (q.subject === 'اللغة العربية' || q.subject?.includes('عرب') || q.subject === 'arabic') : (!q.subject?.includes('عرب') && q.subject !== 'arabic')).length}) 💬
        </button>

        <button
          onClick={() => setAdminTab('students')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${adminTab === 'students' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Users className="w-4 h-4" />
          الطلاب ({studentsDB.length})
        </button>

        <button
          onClick={() => setAdminTab('notifications')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${adminTab === 'notifications' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Bell className="w-4 h-4" />
          الإشعارات ({notifications.length}) 🔔
        </button>
      </div>

      {/* ═══ Tab: Live Studio (إدارة البث المباشر) ═══ */}
      {adminTab === 'live' && (
        <div className="space-y-8 animate-in fade-in" dir="rtl">
          
          {/* Header Action Banner */}
          <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-slate-950 text-white p-6 md:p-8 rounded-3xl border border-rose-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-right">
              <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 text-xs font-black px-3.5 py-1 rounded-full border border-rose-500/30">
                <Radio className="w-4 h-4 text-rose-400" />
                <span>استوديو البث المباشر التفاعلي • Live Studio 🔴</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black">جدولة وبث الحصص المباشرة والتفاعل مع الطلاب</h2>
              <p className="text-xs text-slate-300 font-bold max-w-xl leading-relaxed">
                حدد موعد الحصة، ابدأ البث الحي بجودة عالية، وأرسل إشعاراً ورسالة واتساب بضغطة زر لكل الطلاب المسجلين لحضور البث فوراً.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="#create-live-form"
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>جدولة بث جديد</span>
              </a>
            </div>
          </div>

          {/* Success Message Banner */}
          {liveSuccessMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl text-xs font-black flex items-center gap-2 animate-in fade-in shadow-xs">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{liveSuccessMsg}</span>
            </div>
          )}

          {/* ═══ Form: Create / Schedule New Live Broadcast ═══ */}
          <form 
            id="create-live-form" 
            onSubmit={handleCreateLive} 
            className="bg-white dark:bg-[#162534] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5"
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-black text-slate-900 dark:text-white text-base md:text-lg flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-500" />
                <span>إنشاء أو جدولة حصة بث مباشر جديدة 🔴</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-bold">
                أدخل تفاصيل البث ومصدر الفيديو ورابط الشرح
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">عنوان البث المباشر:</label>
                <input
                  type="text"
                  required
                  value={newLiveTitle}
                  onChange={(e) => setNewLiveTitle(e.target.value)}
                  placeholder="مثال: المراجعة النهائية الشاملة: فرع النحو وأسرار الامتحان 🔴"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">المادة:</label>
                <select
                  value={newLiveSubject}
                  onChange={(e) => setNewLiveSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="اللغة العربية">📖 اللغة العربية (أ / سيد عبد العاطي)</option>
                  <option value="برمجة وعلوم الحاسب">💻 برمجة وعلوم الحاسب (م / نور الدين)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">الصف الدراسي المستهدف:</label>
                <select
                  value={newLiveGrade}
                  onChange={(e) => setNewLiveGrade(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="3sec">🎓 الصف الثالث الثانوي (ثانوية عامة)</option>
                  <option value="2sec">📘 الصف الثاني الثانوي</option>
                  <option value="1sec">📗 الصف الأول الثانوي</option>
                  <option value="all">🌟 جميع الصفوف</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">تاريخ البث:</label>
                <input
                  type="date"
                  value={newLiveDate}
                  onChange={(e) => setNewLiveDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">توقيت البث (الساعة):</label>
                <input
                  type="time"
                  value={newLiveTime}
                  onChange={(e) => setNewLiveTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              {/* Stream Source Option */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300">نوع ومصدر قاعة البث المباشر 📡:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setNewLiveStreamType('google_meet')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                      newLiveStreamType === 'google_meet'
                        ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs sm:text-sm flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-500" />
                      <span>قاعة Google Meet 📹 (موصى به)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                      رابط اجتماع Google Meet رسمي (كاميرا، مايك للطلاب، ومشاركة شاشة).
                    </p>
                  </div>

                  <div
                    onClick={() => setNewLiveStreamType('native')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                      newLiveStreamType === 'native'
                        ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/20 text-rose-700 dark:text-rose-300'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs sm:text-sm flex items-center gap-2">
                      <Radio className="w-4 h-4 text-rose-500" />
                      <span>استوديو المنصة المباشر 🎥</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                      بث فيديو مباشر من متصفحك مباشرة بدون برامج.
                    </p>
                  </div>

                  <div
                    onClick={() => setNewLiveStreamType('youtube_live')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                      newLiveStreamType === 'youtube_live'
                        ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <div className="font-black text-xs sm:text-sm flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-emerald-500" />
                      <span>رابط يوتيوب لايف / خارجي 🔗</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                      وضع رابط يوتيوب لايف أو زووم جاهز مسبقاً.
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Meet Input & 1-Click Generator */}
              {newLiveStreamType === 'google_meet' && (
                <div className="md:col-span-2 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-black text-blue-900 dark:text-blue-200">
                      رابط اجتماع Google Meet المباشر (مثل meet.google.com/onk-ftnq-wrg):
                    </label>
                    <a
                      href="https://meet.google.com/new"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>+ إنشاء رابط Google Meet جديد الآن 🚀</span>
                    </a>
                  </div>
                  <input
                    type="text"
                    required
                    value={newLiveStreamUrl}
                    onChange={(e) => setNewLiveStreamUrl(e.target.value)}
                    placeholder="https://meet.google.com/onk-ftnq-wrg أو onk-ftnq-wrg"
                    className="w-full bg-white dark:bg-slate-950 border border-blue-300 dark:border-blue-800 rounded-xl px-4 py-3 text-xs font-mono font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none dir-ltr"
                  />
                </div>
              )}

              {newLiveStreamType === 'youtube_live' && (
                <div className="md:col-span-2 animate-in fade-in">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">رابط مصدر البث المباشر (YouTube Live / Vimeo / Stream URL):</label>
                  <input
                    type="url"
                    required
                    value={newLiveStreamUrl}
                    onChange={(e) => setNewLiveStreamUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-mono font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none dir-ltr"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">وصف ومحاور الحصة المباشرة:</label>
                <textarea
                  rows="3"
                  value={newLiveDesc}
                  onChange={(e) => setNewLiveDesc(e.target.value)}
                  placeholder="اكتب نبذة تشويقية عما سيتم شرحه في الحصة والأسئلة التي سيتم حلها..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

            </div>

            {/* Auto Dispatch Guarantee Strip */}
            <div className="bg-emerald-500/10 border border-emerald-500/25 p-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <span className="font-black">الإرسال التلقائي الفوري ⚡:</span> عند بدء البث، سيتم إرسال إشعار فوري داخل المنصة لجميع الطلاب وتجهيز رسائل الواتساب بروابط الدخول المباشرة فوراً.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 hover:scale-105"
              >
                <Radio className="w-4 h-4" />
                <span>بدء البث المباشر وإرسال الإشعارات والواتساب فوراً 🚀</span>
              </button>
            </div>

          </form>

          {/* ═══ Live Sessions Management Table & Live Studio Controls ═══ */}
          <div className="bg-white dark:bg-[#162534] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base md:text-lg">
                  قائمة حصص البث المباشر ({
                    (liveSessionsDB || []).filter(s => isSayedAdmin ? (s.subject === 'اللغة العربية' || s.subject?.includes('عربي') || s.subject === 'arabic' || s.instructor?.includes('سيد')) : (s.subject === 'برمجة وعلوم الحاسب' || s.subject?.includes('برمج') || s.subject === 'programming' || s.instructor?.includes('نور'))).length
                  })
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-bold">
                  {isSayedAdmin ? 'خاص بحصص مادة اللغة العربية (مستر سيد عبد العاطي)' : 'خاص بحصص مادة البرمجة وعلوم الحاسب (م / نور الدين)'}
                </p>
              </div>
            </div>

            {(() => {
              const teacherLiveSessions = (liveSessionsDB || []).filter(s => {
                if (isSayedAdmin) {
                  return s.subject === 'اللغة العربية' || s.subject?.includes('عربي') || s.subject === 'arabic' || s.instructor?.includes('سيد');
                } else if (isNourAdmin) {
                  return s.subject === 'برمجة وعلوم الحاسب' || s.subject?.includes('برمج') || s.subject === 'programming' || s.instructor?.includes('نور');
                }
                return true;
              });

              if (teacherLiveSessions.length === 0) {
                return (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <Radio className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                    <p className="text-xs font-bold">لا توجد حصص بث مباشر مسجلة لمادتك حتى الآن.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {teacherLiveSessions.map(s => {
                    const isStudioActive = selectedStudioSessionId === s.id;
                    const safeDateString = (() => {
                      if (!s.scheduledAt) return 'الآن';
                      try {
                        const d = new Date(s.scheduledAt);
                        return isNaN(d.getTime()) ? 'الآن' : d.toLocaleString('ar-EG');
                      } catch (e) {
                        return 'الآن';
                      }
                    })();

                    return (
                      <div 
                        key={s.id}
                        className={`p-5 rounded-3xl border transition-all space-y-4 ${
                          s.status === 'live'
                            ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/40 ring-2 ring-rose-500/20'
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                                {s.subject} • {s.gradeName}
                              </span>

                              {s.status === 'live' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black animate-pulse shadow-xs">
                                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                  <span>مباشر الآن 🔴</span>
                                </span>
                              ) : s.status === 'scheduled' ? (
                                <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                                  ⏳ موعد البث: {safeDateString}
                                </span>
                              ) : (
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                  📼 مسجل ومنتهي
                                </span>
                              )}
                            </div>

                          <h4 className="text-base font-black text-slate-900 dark:text-white">
                            {s.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                            المحاضر: <span className="text-slate-800 dark:text-slate-200">{s.instructor}</span> • المشاهدين: <span className="text-amber-500 font-mono font-black">{s.viewersCount || 0}</span> • الرسائل: <span className="font-mono">{s.chatMessages?.length || 0}</span>
                          </p>
                        </div>

                        {/* Actions Control Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          
                          {/* Direct Enter Live Video Room Button */}
                          <button
                            onClick={() => {
                              if (setSelectedLiveId) setSelectedLiveId(s.id);
                              if (setCurrentTab) setCurrentTab('live');
                            }}
                            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-105"
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>دخول قاعة البث (مثل Zoom) 🎥🚀</span>
                          </button>

                          {/* Broadcast to Students Button */}
                          <button
                            onClick={() => handleBroadcastLive(s)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5 rotate-180" />
                            <span>📢 بث إشعار وواتساب للطلاب</span>
                          </button>

                          {/* Status Actions */}
                          {s.status !== 'live' && (
                            <button
                              onClick={() => adminUpdateLiveStatus(s.id, 'live')}
                              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                            >
                              <Radio className="w-3.5 h-3.5" />
                              <span>بدء البث فوراً 🔴</span>
                            </button>
                          )}

                          {s.status === 'live' && (
                            <button
                              onClick={async () => {
                                if (window.confirm(`هل أنت متأكد من إنهاء وإيقاف بث "${s.title}" لجميع الطلاب الآن؟`)) {
                                  const res = await adminUpdateLiveStatus(s.id, 'ended');
                                  alert(res.message || 'تم إنهاء البث بنجاح!');
                                }
                              }}
                              className="bg-rose-700 hover:bg-rose-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 animate-pulse"
                            >
                              <span>⏹️ إنهاء البث فوراً</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedStudioSessionId(isStudioActive ? null : s.id)}
                            className={`text-xs font-black px-4 py-2.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                              isStudioActive 
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' 
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isStudioActive ? 'إغلاق لوحة التفاعل' : 'لوحة التفاعل والأسئلة 🎯'}</span>
                          </button>

                          <button
                            onClick={() => { if (confirm('هل أنت متأكد من حذف هذا البث؟')) adminDeleteLiveSession(s.id); }}
                            className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50"
                            title="حذف البث"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>

                      </div>

                      {/* ═══ Expandable Live Studio Interactivity & Polls & Hand-Raises Panel ═══ */}
                      {isStudioActive && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-6 bg-white dark:bg-slate-950/60 p-5 rounded-2xl">
                          
                          {/* Live Interactive Quiz / Poll Launcher (7 cols) */}
                          <div className="md:col-span-7 space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs md:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-500" />
                                <span>إطلاق سؤال تفاعلي لحظي على شاشات الطلاب 🎯</span>
                              </h5>
                              <span className="text-[11px] text-slate-400 font-bold">يظهر للطالب فوراً على الفيديو</span>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-[11px] font-black text-slate-600 dark:text-slate-400 mb-1">نص السؤال:</label>
                                <input
                                  type="text"
                                  value={newPollQ}
                                  onChange={(e) => setNewPollQ(e.target.value)}
                                  placeholder="اكتب السؤال هنا (مثال: ما إعراب كلمة «العلم» في الجملة؟)..."
                                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الخيار (أ):</label>
                                  <input
                                    type="text"
                                    value={newPollOptA}
                                    onChange={(e) => setNewPollOptA(e.target.value)}
                                    placeholder="الخيار الأول..."
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الخيار (ب):</label>
                                  <input
                                    type="text"
                                    value={newPollOptB}
                                    onChange={(e) => setNewPollOptB(e.target.value)}
                                    placeholder="الخيار الثاني..."
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الخيار (ج):</label>
                                  <input
                                    type="text"
                                    value={newPollOptC}
                                    onChange={(e) => setNewPollOptC(e.target.value)}
                                    placeholder="الخيار الثالث (اختياري)..."
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الخيار (د):</label>
                                  <input
                                    type="text"
                                    value={newPollOptD}
                                    onChange={(e) => setNewPollOptD(e.target.value)}
                                    placeholder="الخيار الرابع (اختياري)..."
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-400">الإجابة الصحيحة:</span>
                                  <select
                                    value={newPollCorrect}
                                    onChange={(e) => setNewPollCorrect(e.target.value)}
                                    className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-bold px-2 py-1"
                                  >
                                    <option value="0">الخيار (أ)</option>
                                    <option value="1">الخيار (ب)</option>
                                    <option value="2">الخيار (ج)</option>
                                    <option value="3">الخيار (د)</option>
                                  </select>
                                </div>

                                <button
                                  type="button"
                                  onClick={handleLaunchStudioPoll}
                                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
                                >
                                  بث السؤال للطلاب الآن 🚀
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Hand Raises Queue (5 cols) */}
                          <div className="md:col-span-5 space-y-3 border-r md:border-r-slate-200 dark:md:border-r-slate-800 md:pr-5">
                            <h5 className="text-xs md:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <Hand className="w-4 h-4 text-emerald-500" />
                              <span>طابور طلبات المداخلة ✋ ({s.handRaises?.length || 0})</span>
                            </h5>

                            <div className="max-h-48 overflow-y-auto space-y-2">
                              {(!s.handRaises || s.handRaises.length === 0) ? (
                                <p className="text-[11px] text-slate-400 font-bold py-6 text-center">لا توجد طلبات مداخلة حالياً.</p>
                              ) : (
                                s.handRaises.map(hr => (
                                  <div key={hr.id} className="bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl text-xs flex items-center justify-between">
                                    <div>
                                      <div className="font-black text-slate-900 dark:text-white">{hr.studentName}</div>
                                      <div className="text-[10px] text-slate-500 font-mono">كود: {hr.studentCode} • {hr.requestedAt}</div>
                                    </div>
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-600 font-black px-2 py-0.5 rounded-md">
                                      طالب للمداخلة
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* ═══ Recorded Live Sessions Archive & Publishing to Student Cards ═══ */}
          <div className="bg-white dark:bg-[#162534] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base md:text-lg flex items-center gap-2">
                  <span>📼 أرشيف الحصص المباشرة المسجلة ونشرها للطلاب</span>
                  <span className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono px-2.5 py-0.5 rounded-full">
                    {liveSessionsDB.filter(s => s.status === 'ended' || s.recordingUrl).length} تسجيل
                  </span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-bold">
                  تحكم في تسجيلات الحصص بعد انتهائها، عدل روابط التسجيلات (Google Drive / YouTube)، وانشرها لتظهر في كروت الطلاب فوراً!
                </p>
              </div>
            </div>

            {liveSessionsDB.filter(s => {
              const sessionEnded = s.status === 'ended' || s.recordingUrl;
              if (!sessionEnded) return false;
              // فصل المواد: م/ نور يشوف برمجة فقط، أ/ سيد يشوف عربي فقط
              if (isNourAdmin) return s.subject !== 'اللغة العربية';
              if (isSayedAdmin) return s.subject === 'اللغة العربية';
              return true;
            }).length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <div className="text-3xl">📼</div>
                <p className="text-xs font-bold">لا توجد حصص منتهية أو مسجلة في الأرشيف حتى الآن.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveSessionsDB.filter(s => {
                  const sessionEnded = s.status === 'ended' || s.recordingUrl;
                  if (!sessionEnded) return false;
                  if (isNourAdmin) return s.subject !== 'اللغة العربية';
                  if (isSayedAdmin) return s.subject === 'اللغة العربية';
                  return true;
                }).map(session => (
                  <div 
                    key={session.id} 
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        {session.subject} • {session.gradeName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {session.scheduledAt ? new Date(session.scheduledAt).toLocaleDateString('ar-EG') : 'مسجل'}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {session.title}
                    </h4>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
                          ملف أو رابط تسجيل الحصة:
                        </label>
                        {session.recordingUrl && (
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md">
                            ✓ التسجيل محفوظ وجاهز
                          </span>
                        )}
                      </div>

                      {/* Direct Video File Upload Button (Zero manual link copying) */}
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 hover:scale-105">
                          <span>📁 رفع فيديو مسجل من جهازك فوراً 🚀</span>
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                alert('جاري رفع وتخزين الفيديو على السيرفر...');
                                const res = await uploadVideoFile(file);
                                if (res?.url) {
                                  await adminUpdateLiveStatus(session.id, session.status, res.url);
                                  alert('تم رفع وتخزين الفيديو تلقائياً بنجاح! 💾🎉');
                                }
                              } catch (err) {
                                alert('فشل رفع الفيديو');
                              }
                            }}
                          />
                        </label>

                        <input
                          type="url"
                          value={session.recordingUrl || ''}
                          placeholder="الرابط يوضع تلقائياً عند التسجيل أو الرفع..."
                          onChange={(e) => {
                            const newUrl = e.target.value.trim();
                            adminUpdateLiveStatus(session.id, session.status, newUrl);
                          }}
                          className="flex-1 min-w-[200px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none dir-ltr"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={async () => {
                          if (!session.recordingUrl) {
                            alert('تنبيه: يرجى تسجيل أو رفع فيديو الحصة أولاً عبر زر [📁 رفع فيديو] قبل النشر للطلاب.');
                            return;
                          }
                          const isDirectFile = session.recordingUrl.includes('/uploads/') || session.recordingUrl.endsWith('.mp4') || session.recordingUrl.endsWith('.webm');
                          const newLessonObj = {
                            id: `lesson_live_${session.id}`,
                            title: `📼 تسجيل: ${session.title}`,
                            description: session.description || `تسجيل الحصة المباشرة لمادة ${session.subject}`,
                            videoUrl: session.recordingUrl,
                            videoType: isDirectFile ? 'file' : 'youtube',
                            grade: session.grade,
                            subject: session.subject === 'اللغة العربية' ? 'arabic' : 'programming',
                            duration: session.duration || 'حصة مسجلة',
                            price: 0,
                            isFree: true
                          };
                          await adminAddLesson(newLessonObj);
                          alert('تم نشر تسجيل الحصة بنجاح في كروت المواد للطلاب! 🎉 ستظهر الآن في الصفحة الرئيسية.');
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <span>📤 نشر التسجيل في كروت الطلاب</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {session.recordingUrl && (
                          <a
                            href={session.recordingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-black px-3 py-2 rounded-xl transition-all flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة</span>
                          </a>
                        )}

                        {/* زرار مسح الجلسة من الأرشيف نهائياً */}
                        <button
                          onClick={async () => {
                            if (window.confirm(`⚠️ هل أنت متأكد من مسح جلسة "${session.title}" من الأرشيف نهائياً؟\n\nسيتم حذف التسجيل والجلسة بالكامل ولا يمكن التراجع!`)) {
                              await adminDeleteLiveSession(session.id);
                              alert('تم مسح الجلسة من الأرشيف بنجاح! 🗑️');
                            }
                          }}
                          className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs hover:scale-105"
                          title="مسح هذه الجلسة من الأرشيف نهائياً"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>مسح من الأرشيف 🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

      {/* Tab: Notifications */}
      {adminTab === 'notifications' && (
        <div className="space-y-8 animate-in fade-in" dir="rtl">
          {/* Send New Notification Form */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-5 max-w-2xl mx-auto">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                إرسال إشعار جديد
              </h3>
              <p className="text-slate-500 text-xs mt-1">ابعث إشعاراً داخل المنصة لكل الطلاب أو لصف دراسي معين</p>
            </div>

            {notifSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                تم إرسال الإشعار بنجاح! سيراه الطلاب عند فتح المنصة 🎉
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!notifTitle.trim()) return;
                addNotification({ targetGrade: notifTargetGrade, title: notifTitle, body: notifBody, subject: notifSubject });
                setNotifSuccess(true);
                setNotifTitle('');
                setNotifBody('');
                setNotifTargetGrade('all');
                setNotifSubject(adminIdentity === 'mr_sayed' ? 'arabic' : adminIdentity === 'eng_nour' ? 'programming' : 'general');
                setTimeout(() => setNotifSuccess(false), 4000);
              }}
              className="space-y-4"
            >
              {/* Target Audience */}
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1.5">الفئة المستهدفة</label>
                <div className="relative">
                  <select
                    value={notifTargetGrade}
                    onChange={(e) => setNotifTargetGrade(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 appearance-none cursor-pointer"
                  >
                    <option value="all">كل الطلاب</option>
                    <option value="3sec">الصف الثالث الثانوي (3 ثانوي)</option>
                    <option value="2sec">الصف الثاني الثانوي (2 ثانوي)</option>
                    <option value="1sec">الصف الأول الثانوي (1 ثانوي)</option>
                  </select>
                </div>
              </div>

              {/* Subject Tag */}
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1.5">المادة (من أي مادة؟)</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { value: 'general', label: '📢 إشعار عام' },
                    { value: 'programming', label: '💻 البرمجة', disabled: isSayedAdmin },
                    { value: 'arabic', label: '📖 العربي', disabled: isNourAdmin }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => setNotifSubject(opt.value)}
                      className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                        opt.disabled
                          ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-300'
                          : notifSubject === opt.value
                            ? opt.value === 'programming'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                              : opt.value === 'arabic'
                                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                                : 'bg-slate-800 text-white border-slate-800 shadow-md'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Title */}
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1.5">عنوان الإشعار</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="مثال: امتحان الشهر هيبدأ الأسبوع الجاي"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Notification Body */}
              <div>
                <label className="block text-sm font-black text-slate-700 mb-1.5">تفاصيل إضافية (اختياري)</label>
                <textarea
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  rows={4}
                  placeholder="اكتب تفاصيل الإشعار هنا..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black px-8 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                  إرسال
                </button>
              </div>
            </form>
          </div>

          {/* Sent Notifications History */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md max-w-2xl mx-auto">
            <h4 className="font-black text-slate-700 text-base mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              آخر الإشعارات المُرسلة
            </h4>
            {notifications.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">لا توجد إشعارات مُرسلة بعد</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 text-right">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-slate-800 text-sm">{n.title}</span>
                        <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap">
                          {n.date ? `${n.date} - ${n.time}` : n.time}
                        </span>
                      </div>
                      {n.body && (
                        <p className="text-slate-600 text-xs mt-1">{n.body}</p>
                      )}
                      <div>
                        <span className="text-[10px] bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-lg">
                          {n.targetGrade === 'all' ? 'كل الطلاب' : n.targetGrade === '3sec' ? 'ثالثة ثانوي' : n.targetGrade === '2sec' ? 'ثاني ثانوي' : 'أول ثانوي'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذا الإشعار نهائياً؟')) {
                          adminDeleteNotification(n.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all border border-rose-100 flex-shrink-0"
                      title="مسح الإشعار"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Videos Management */}
      {adminTab === 'videos' && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Create Lesson Form */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6 max-w-2xl mx-auto">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                رفع حصة فيديو جديدة + مستند PDF / Word أو امتحان تفاعلي
              </h3>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">عنوان الحصة البرمجية:</label>
                <input
                  type="text"
                  required
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="مثال: الحصة 1: أساسيات لغة Python..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">المادة الدراسية 📚:</label>
                  <div className={`p-2 rounded-xl border text-xs font-black flex items-center gap-1.5 ${isSayedAdmin ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-blue-50 text-blue-900 border-blue-300'}`}>
                    <span>{isSayedAdmin ? '📖' : '💻'}</span>
                    <span>{defaultAdminSubject}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">الصف المستهدف:</label>
                  <select
                    value={newLessonGrade}
                    onChange={(e) => setNewLessonGrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2.5 text-xs font-bold"
                  >
                    <option value="3sec">الصف الثالث الثانوي (3 ثانوي)</option>
                    <option value="2sec">الصف الثاني الثانوي</option>
                    <option value="1sec">الصف الأول الثانوي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">السعر (0 = مجاني):</label>
                  <input
                    type="number"
                    value={newLessonPrice}
                    onChange={(e) => setNewLessonPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Video Upload Mode Switcher */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-700">
                  <span>مصدر الفيديو:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setVideoUploadMode('file')}
                      className={`px-3 py-1 rounded-lg ${videoUploadMode === 'file' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                    >
                      رفع من الجهاز 📁
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoUploadMode('url')}
                      className={`px-3 py-1 rounded-lg ${videoUploadMode === 'url' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                    >
                      رابط فيديو 🔗
                    </button>
                  </div>
                </div>

                {videoUploadMode === 'file' ? (
                  <div 
                    onClick={() => videoInputRef.current && videoInputRef.current.click()}
                    className="border-2 border-dashed border-blue-300 hover:border-blue-500 p-6 rounded-2xl bg-blue-50/50 text-center space-y-2 cursor-pointer transition-all"
                  >
                    <Upload className="w-8 h-8 text-blue-600 mx-auto animate-bounce" />
                    <div className="text-xs font-black text-slate-800">اضغط لاختيار ملف الفيديو من جهازك (MP4, WebM)</div>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                    {videoFile && (
                      <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl text-xs font-bold">
                        تم اختيار الفيديو: {videoFile.name} ✅
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-bold outline-none dir-ltr"
                  />
                )}
              </div>

              {/* Thumbnail Image Picker & Auto Frame Preview */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-700">الصورة المصغرة للحصة (اختياري 🖼️):</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current && thumbInputRef.current.click()}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>اختيار صورة مصغرة من الجهاز</span>
                  </button>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setCustomThumbFile(file);
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          setCustomThumbUrlData(evt.target.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  {customThumbFile && (
                    <div className="flex items-center gap-2">
                      {customThumbUrlData && (
                        <img src={customThumbUrlData} alt="Thumb preview" className="w-12 h-12 object-cover rounded-lg border border-emerald-400" />
                      )}
                      <span className="text-xs text-emerald-600 font-bold">تم اختيار الصورة بنجاح ✅</span>
                    </div>
                  )}
                </div>

                {/* Auto frame preview */}
                {!customThumbFile && autoVideoFrameUrl && (
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-3">
                    <img src={autoVideoFrameUrl} alt="Auto Frame" className="w-20 h-12 object-cover rounded-lg border" />
                    <span className="text-[11px] text-slate-600 font-bold">تم التقاط صورة من الفيديو المرفوع تلقائياً 📸</span>
                  </div>
                )}
              </div>

              {/* Attachment Selection */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-700">اختر المحتوى المرفق بالفيديو:</label>
                
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAttachmentType('pdf')}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${attachmentType === 'pdf' ? 'bg-rose-50 border-rose-500 text-rose-900 font-black' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span>مستند PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttachmentType('word')}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${attachmentType === 'word' ? 'bg-blue-50 border-blue-500 text-blue-900 font-black' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>مستند Word</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttachmentType('quiz')}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${attachmentType === 'quiz' ? 'bg-amber-50 border-amber-500 text-amber-900 font-black' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>امتحان إلكتروني 📝</span>
                  </button>
                </div>

                {/* PDF & Word Document File Uploader */}
                {(attachmentType === 'pdf' || attachmentType === 'word') && (
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-black text-slate-700">اختيار ملزمة / مستند ({attachmentType.toUpperCase()}) من الجهاز:</label>
                    <div 
                      onClick={() => docInputRef.current && docInputRef.current.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-500 p-4 rounded-2xl bg-slate-50 text-center space-y-1 cursor-pointer transition-all"
                    >
                      <FileText className="w-6 h-6 text-slate-600 mx-auto" />
                      <div className="text-xs font-bold text-slate-700">اضغط لاختيار ملف الـ {attachmentType.toUpperCase()} من جهازك</div>
                      <input
                        ref={docInputRef}
                        type="file"
                        accept={attachmentType === 'word' ? '.doc,.docx' : '.pdf'}
                        onChange={handleDocFileChange}
                        className="hidden"
                      />
                      {attachmentFile && (
                        <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl text-xs font-bold mt-2">
                          تم اختيار المستند: {attachmentFile.name} ✅
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Multi-Question Builder */}
                {attachmentType === 'quiz' && (
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-4 text-right">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-900">تأليف الامتحان الإلكتروني المتعدد (عدد الأسئلة: {quizQuestionsList.length}):</span>
                    </div>

                    {/* Exam Duration Field */}
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-amber-300">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <label className="text-xs font-black text-slate-700 flex-shrink-0">مدة الامتحان (دقيقة):</label>
                      <input
                        type="number"
                        min={5}
                        max={180}
                        value={quizDurationMinutes}
                        onChange={(e) => setQuizDurationMinutes(e.target.value)}
                        className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-black text-center"
                      />
                      <span className="text-[11px] text-slate-500 font-bold">دقيقة (5–180)</span>
                    </div>

                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {quizQuestionsList.map((q, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-200 text-xs font-bold flex justify-between">
                          <span>س{idx + 1}: {q.question}</span>
                          <span className="text-emerald-600">الإجابة: ({q.options[q.correctIndex]})</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-amber-300 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700">إضافة سؤال جديد للامتحان:</label>
                      <input
                        type="text"
                        value={newQTitle}
                        onChange={(e) => setNewQTitle(e.target.value)}
                        placeholder="نص السؤال..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold"
                      />

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <input type="text" placeholder="خيار (أ)" value={newQOptA} onChange={(e) => setNewQOptA(e.target.value)} className="bg-slate-50 p-1.5 border rounded-lg" />
                        <input type="text" placeholder="خيار (ب)" value={newQOptB} onChange={(e) => setNewQOptB(e.target.value)} className="bg-slate-50 p-1.5 border rounded-lg" />
                        <input type="text" placeholder="خيار (ج)" value={newQOptC} onChange={(e) => setNewQOptC(e.target.value)} className="bg-slate-50 p-1.5 border rounded-lg" />
                        <input type="text" placeholder="خيار (د)" value={newQOptD} onChange={(e) => setNewQOptD(e.target.value)} className="bg-slate-50 p-1.5 border rounded-lg" />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <select
                          value={newQCorrectIdx}
                          onChange={(e) => setNewQCorrectIdx(e.target.value)}
                          className="bg-slate-50 border p-1 rounded-lg text-xs font-bold"
                        >
                          <option value={0}>الإجابة الصحيحة: خيار (أ)</option>
                          <option value={1}>الإجابة الصحيحة: خيار (ب)</option>
                          <option value={2}>الإجابة الصحيحة: خيار (ج)</option>
                          <option value={3}>الإجابة الصحيحة: خيار (د)</option>
                        </select>

                        <button
                          type="button"
                          onClick={handleAddQuestionToQuiz}
                          className="btn-accent text-[11px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة السؤال</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-slate-700">
                    <span>نسبة الرفع المئوية: {uploadProgress}%</span>
                    <span className="animate-pulse text-blue-600">جاري رفع {currentUploadFileName}... ⏳</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-200 text-xs font-bold">
                  {uploadError}
                </div>
              )}

              {lessonSuccessMsg && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs font-bold">
                  تم نشر الحصة بالمستند المرفق وبث التنبيه للطلاب بنجاح! 🚀
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className={`w-full text-xs font-black py-3.5 rounded-xl justify-center shadow-lg flex items-center gap-2 ${isUploading ? 'bg-slate-400 text-slate-200 cursor-not-allowed' : 'btn-primary shadow-blue-500/20'}`}
              >
                {isUploading ? 'جاري رفع الملفات للمنصة... ⏳' : 'نشر الحصة وإرسال إشعار الواتساب والـ SMS 🚀'}
              </button>
            </form>
          </div>

          {/* Lessons List CRUD Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <h3 className="font-black text-slate-900 text-base">قائمة الفيديوهات المرفوعة (تعديل السعر والاسم ومسح الحصة)</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                  <tr>
                    <th className="p-3">عنوان الحصة</th>
                    <th className="p-3">الصف الدراسي</th>
                    <th className="p-3">السعر الحالي</th>
                    <th className="p-3">المحاذات</th>
                    <th className="p-3 text-center">إجراءات التعديل والحذف ✏️ 🗑️</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {lessons
                    .filter(les => {
                      const isArabic = les.subject === 'اللغة العربية' || les.subject?.includes('عرب');
                      return isSayedAdmin ? isArabic : !isArabic;
                    })
                    .map(les => (
                      <tr key={les.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{les.title}</td>
                        <td className="p-3 text-slate-600">{les.grade === '3sec' ? 'ثانوية عامة' : les.grade}</td>
                        <td className="p-3 font-black text-emerald-600 text-sm">{les.price === 0 ? 'مجاني 🎁' : `${les.price} ج.م`}</td>
                        <td className="p-3 text-slate-700 font-mono">{les.viewsCount || 0}</td>
                        <td className="p-3 flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditLessonModal(les)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-all flex items-center gap-1 shadow-sm"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>تعديل الحصة والسعر ✏️</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              if (window.confirm(`هل أنت تأكد من حذف حصة "${les.title}" نهائياً من المنصة؟`)) {
                                adminDeleteLesson(les.id);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all shadow-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>مسح الفيديو 🗑️</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Coupons Management */}
      {adminTab === 'coupons' && (
        <div className="space-y-8 animate-in fade-in">
          
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6 max-w-2xl mx-auto">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-500" />
              إنشاء وتفعيل كود كوبون جديد للطلاب
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">كود الكوبون (مثال: FREE100):</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="BASHMO2026"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-black text-amber-600 outline-none dir-ltr uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">نوع الخصم:</label>
                  <select value={couponType} onChange={(e) => setCouponType(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold">
                    <option value="percent">نسبة مئوية (%)</option>
                    <option value="fixed">قيمة ثابتة (جنيه)</option>
                    <option value="free">مجاني 100% 🎁</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">القيمة الخصمية:</label>
                  <input type="number" value={couponValue} onChange={(e) => setCouponValue(e.target.value)} disabled={couponType === 'free'} className="w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold" />
                </div>
              </div>

              {couponSuccess && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs font-bold">
                  تم إنشاء وتفعيل الكوبون بنجاح! 🎟️
                </div>
              )}

              <button type="submit" className="w-full btn-accent text-xs font-black py-3.5 rounded-xl justify-center">
                تفعيل الكوبون الآن 🎟️
              </button>
            </form>
          </div>

          {/* Active Coupons List Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <h3 className="font-black text-slate-900 text-base">جدول الكوبونات الفعالة حالياً بالمنصة</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                  <tr>
                    <th className="p-3">كود الكوبون</th>
                    <th className="p-3">نوع الخصم</th>
                    <th className="p-3">الاستخدامات</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">حذف الكوبون 🗑️</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {couponsDB.map(coup => (
                    <tr key={coup.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-black text-amber-600 text-sm">{coup.code}</td>
                      <td className="p-3 font-bold text-slate-900">
                        {coup.type === 'free' ? 'مجاني 100% 🎁' : coup.type === 'percent' ? `خصم ${coup.value}%` : `خصم ${coup.value} ج.م`}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">{coup.usedCount} من {coup.maxUses}</td>
                      <td className="p-3">
                        <span className="badge badge-green">مفعل ⚡</span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`مسح كود الكوبون "${coup.code}"؟`)) {
                              adminDeleteCoupon(coup.id);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-sm"
                        >
                          مسح الكوبون 🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Payments Review */}
      {adminTab === 'payments' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              مراجعة إيصالات تحويلات الطلاب (InstaPay / فودافون كاش / فيزا / فوري)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                <tr>
                  <th className="p-3">الطالب</th>
                  <th className="p-3">طريقة التحويل</th>
                  <th className="p-3">المبلغ</th>
                  <th className="p-3">مرجع العملية</th>
                  <th className="p-3">إيصال الشاشة (Proof)</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center">قرار الأدمن 🛡️</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paymentRequestsDB.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">
                      <div>{req.studentName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{req.studentPhone}</div>
                    </td>
                    <td className="p-3 font-bold uppercase text-purple-700">{req.method}</td>
                    <td className="p-3 font-black text-emerald-600 text-sm">{req.amount} ج.م</td>
                    <td className="p-3 font-mono font-bold text-slate-800 dir-ltr">{req.refNumber}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setPreviewProofImage(req.proofImage)}
                        className="btn-outline text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                        <span>معاينة الإيصال 🖼️</span>
                      </button>
                    </td>
                    <td className="p-3">
                      {req.status === 'pending' && <span className="badge badge-amber">قيد المراجعة ⏳</span>}
                      {req.status === 'approved' && <span className="badge badge-green">تمت الموافقة ✅</span>}
                      {req.status === 'rejected' && <span className="badge badge-rose">مرفوض ❌</span>}
                    </td>
                    <td className="p-3 flex items-center justify-center gap-2">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => adminApprovePayment(req.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            <span>موافقة وإضافة الرصيد ✅</span>
                          </button>

                          <button
                            onClick={() => adminRejectPayment(req.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black hover:bg-rose-700 transition-all flex items-center gap-1 shadow-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>رفض الطلب ❌</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">تم اتخاذ القرار</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Q&A Student Questions Management */}
      {adminTab === 'qa' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              أسئلة واستفسارات الطلاب البرمجية على الفيديوهات ({videoQuestions.length})
            </h3>
            <span className="text-xs font-bold text-slate-500">الرد يصل للطالب فوراً على صفحته</span>
          </div>

          <div className="space-y-4">
            {videoQuestions.filter(q => {
              const les = lessons.find(l => l.id === q.lessonId);
              if (!les) return false;
              const isArabic = les.subject === 'اللغة العربية' || les.subject?.includes('عرب');
              return isSayedAdmin ? isArabic : !isArabic;
            }).length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-bold">لا توجد أسئلة من الطلاب في المادة الخاصة بك حالياً.</div>
            ) : (
              videoQuestions.filter(q => {
                const les = lessons.find(l => l.id === q.lessonId);
                if (!les) return false;
                const isArabic = les.subject === 'اللغة العربية' || les.subject?.includes('عرب');
                return isSayedAdmin ? isArabic : !isArabic;
              }).map(q => (
                <div key={q.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-right">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">{q.studentName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({q.studentPhone})</span>
                    </div>

                    {q.status === 'pending' ? (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        في انتظار الرد ⏳
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        تم الرد ✅
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-800 font-bold bg-white p-3 rounded-xl border border-slate-200">
                    ❓ {q.questionText}
                  </p>

                  {q.replyText ? (
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900 space-y-1">
                      <div>💬 رد المعلم: {q.replyText}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">تاريخ الرد: {q.repliedAt}</div>
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="اكتب رد المعلم هنا..."
                        value={replyTexts[q.id] || ''}
                        onChange={(e) => setReplyTexts(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                      />
                      <button
                        onClick={() => handleReplySubmit(q.id)}
                        className="btn-primary text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال الرد 💬</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Student DB */}
      {adminTab === 'students' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-black text-slate-900 text-base">بيانات حسابات الطلاب وتعديل ومسح الحسابات</h3>
            
            <div className="relative">
              <input
                type="text"
                placeholder="بحث باسم أو رقم الطالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-4 py-2 text-xs font-bold w-64 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                <tr>
                  <th className="p-3">كود الطالب</th>
                  <th className="p-3">اسم الطالب</th>
                  <th className="p-3">موبايل الطالب</th>
                  <th className="p-3">موبايل ولي الأمر</th>
                  <th className="p-3">الرصيد</th>
                  <th className="p-3 text-center">إجراءات التعديل والمسح 🛠️</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {studentsDB
                  .filter(s => s.name.includes(searchTerm) || s.code.includes(searchTerm) || s.phone.includes(searchTerm))
                  .map(st => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-black text-amber-600">{st.code}</td>
                      <td className="p-3 font-bold text-slate-900">{st.name}</td>
                      <td className="p-3 text-slate-700 font-mono dir-ltr">{st.phone}</td>
                      <td className="p-3 text-slate-700 font-mono dir-ltr">{st.parentPhone}</td>
                      <td className="p-3 font-black text-emerald-600">{st.walletBalance} ج.م</td>
                      <td className="p-3 flex items-center justify-center gap-2 flex-wrap max-w-[320px]">
                        <button
                          onClick={() => setStudentPerfModal(st)}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-100 text-purple-700 font-bold hover:bg-purple-200 transition-all flex items-center gap-1"
                          title="متابعة درجات الطالب"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>مستوى</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditStudentModal(st)}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-100 text-blue-700 font-bold hover:bg-blue-200 transition-all flex items-center gap-1"
                          title="تعديل بيانات الطالب"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>

                        {st.deviceId ? (
                          <button
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من إلغاء قفل جهاز الطالب "${st.name}"؟`)) {
                                handleResetDevice(st.id);
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-100 text-amber-800 font-bold hover:bg-amber-200 transition-all flex items-center gap-1"
                            title="إعادة تعيين قفل الجهاز المتعدد"
                          >
                            🔓 فك الجهاز
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold px-2 py-1 bg-slate-100 rounded-xl">غير مقفل</span>
                        )}

                        <button
                          onClick={() => handleGenerateOtp(st)}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-100 text-teal-800 font-bold hover:bg-teal-200 transition-all flex items-center gap-1"
                          title="توليد رمز OTP لتسجيل جهاز جديد"
                        >
                          🔑 OTP
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`مسح حساب الطالب "${st.name}" نهائياً؟`)) {
                              adminDeleteStudent(st.id);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>مسح 🗑️</span>
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proof Image Preview Modal */}
      {previewProofImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white p-4 rounded-3xl max-w-md w-full space-y-4 text-center">
            <h4 className="font-black text-slate-900 text-sm">معاينة صورة إيصال تحويل الشاشة 🖼️</h4>
            <img src={previewProofImage} alt="Proof" className="w-full max-h-80 object-contain rounded-2xl border" />
            <button
              onClick={() => setPreviewProofImage(null)}
              className="btn-primary text-xs font-black px-6 py-2 rounded-xl"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal */}
      {editingLessonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white p-6 md:p-8 rounded-3xl max-w-md w-full space-y-4 text-right relative">
            <button onClick={() => setEditingLessonModal(null)} className="absolute top-4 left-4 p-1.5 rounded-xl bg-slate-100 text-slate-500">
              <X className="w-4 h-4" />
            </button>

            <h4 className="font-black text-slate-900 text-base">تعديل بيانات وسعر الحصة البرمجية ✏️</h4>

            <form onSubmit={handleSaveEditLesson} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block mb-1">اسم الحصة البرمجية:</label>
                <input type="text" value={editLessonTitle} onChange={(e) => setEditLessonTitle(e.target.value)} className="w-full border p-2.5 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">سعر الحصة (ج.م):</label>
                  <input type="number" value={editLessonPrice} onChange={(e) => setEditLessonPrice(e.target.value)} className="w-full border p-2.5 rounded-xl" />
                </div>

                <div>
                  <label className="block mb-1">الصف المستهدف:</label>
                  <select value={editLessonGrade} onChange={(e) => setEditLessonGrade(e.target.value)} className="w-full border p-2.5 rounded-xl">
                    <option value="3sec">3 ثانوي (ثانوية عامة)</option>
                    <option value="2sec">2 ثانوي</option>
                    <option value="1sec">1 ثانوي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">وصف الحصة:</label>
                <textarea value={editLessonDesc} onChange={(e) => setEditLessonDesc(e.target.value)} className="w-full border p-2.5 rounded-xl h-20" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 btn-primary text-xs py-3 rounded-xl">حفظ التعديلات بالسعر الجديد ✅</button>
                <button type="button" onClick={() => setEditingLessonModal(null)} className="btn-outline text-xs py-3 px-4 rounded-xl">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white p-6 md:p-8 rounded-3xl max-w-md w-full space-y-4 text-right">
            <h4 className="font-black text-slate-900 text-base">تعديل بيانات حساب الطالب ({editingStudent.code})</h4>
            
            <form onSubmit={handleSaveEditStudent} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block mb-1">اسم الطالب الكامل:</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>

              <div>
                <label className="block mb-1">موبايل الطالب:</label>
                <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full border p-2 rounded-xl dir-ltr" />
              </div>

              <div>
                <label className="block mb-1">موبايل ولي الأمر:</label>
                <input type="text" value={editParentPhone} onChange={(e) => setEditParentPhone(e.target.value)} className="w-full border p-2 rounded-xl dir-ltr" />
              </div>

              <div>
                <label className="block mb-1">رصيد المحفظة (جنيه):</label>
                <input type="number" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>

              <div>
                <label className="block mb-1">كلمة المرور:</label>
                <input type="text" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 btn-primary text-xs py-2.5 rounded-xl">حفظ التعديلات ✅</button>
                <button type="button" onClick={() => setEditingStudent(null)} className="btn-outline text-xs py-2.5 px-4 rounded-xl">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Student Performance Modal */}
      {studentPerfModal && (() => {
        const studentExams = examHistory.filter(e => {
          // Filter by subject
          const les = lessons.find(l => l.attachedQuiz?.id === e.quizId || l.id === e.lessonId);
          if (les) {
            const isArabic = les.subject === 'اللغة العربية' || les.subject?.includes('عرب');
            if (isSayedAdmin ? !isArabic : isArabic) return false;
          }
          return true; // For a real app, also filter by studentId
        });
        const avgPct = studentExams.length
          ? Math.round(studentExams.reduce((sum, e) => sum + e.percentage, 0) / studentExams.length)
          : null;
        const passed = studentExams.filter(e => e.passed).length;
        return (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white max-w-lg w-full p-6 md:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-5 text-right relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setStudentPerfModal(null)} className="absolute top-4 left-4 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-purple-600" />
                  <h4 className="font-black text-slate-900 text-base">مستوى الطالب: {studentPerfModal.name}</h4>
                </div>
                <p className="text-[10px] text-slate-500 font-bold">كود: {studentPerfModal.code} | صف: {studentPerfModal.gradeName}</p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
                  <div className="text-xl font-black text-blue-700">{studentExams.length}</div>
                  <div className="text-[10px] font-bold text-blue-600">إجمالي الامتحانات</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-center">
                  <div className="text-xl font-black text-emerald-700">{passed}</div>
                  <div className="text-[10px] font-bold text-emerald-600">اجتاز بنجاح</div>
                </div>
                <div className={`p-3 rounded-2xl border text-center ${avgPct !== null ? (avgPct >= 80 ? 'bg-emerald-50 border-emerald-100' : avgPct >= 60 ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100') : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`text-xl font-black ${avgPct !== null ? (avgPct >= 80 ? 'text-emerald-700' : avgPct >= 60 ? 'text-amber-700' : 'text-rose-700') : 'text-slate-400'}`}>
                    {avgPct !== null ? `${avgPct}%` : '—'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-600">متوسط الدرجات</div>
                </div>
              </div>

              {/* Student Info Quick View */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-black text-slate-700">المحفظة:</span> <span className="text-emerald-600 font-bold">{studentPerfModal.walletBalance} ج.م</span></div>
                  <div><span className="font-black text-slate-700">النقاط:</span> <span className="text-amber-600 font-bold">{studentPerfModal.points} نقطة</span></div>
                  <div><span className="font-black text-slate-700">الاشتراك:</span> <span className="font-bold">{studentPerfModal.subscriptionType}</span></div>
                  <div><span className="font-black text-slate-700">الموبايل:</span> <span className="font-mono">{studentPerfModal.phone}</span></div>
                </div>
              </div>

              {/* Exam History Table */}
              <div className="space-y-2">
                <h5 className="font-black text-slate-800 text-sm">سجل الامتحانات:</h5>
                {studentExams.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-bold">لم يتم تسجيل أي امتحان لهذا الطالب بعد.</div>
                ) : (
                  <div className="space-y-2">
                    {studentExams.map(ex => (
                      <div key={ex.id} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${ex.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                        <div className="space-y-0.5">
                          <div className="font-black text-slate-900 line-clamp-1">{ex.quizTitle}</div>
                          <div className="text-[10px] text-slate-500">{ex.date}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800">{ex.score}/{ex.total}</span>
                          <span className={`font-black px-2.5 py-0.5 rounded-full ${ex.percentage >= 80 ? 'bg-emerald-200 text-emerald-800' : ex.percentage >= 60 ? 'bg-amber-200 text-amber-800' : 'bg-rose-200 text-rose-800'}`}>
                            {ex.percentage}%
                          </span>
                          <span className="text-sm">{ex.percentage >= 80 ? '🌟' : ex.percentage >= 60 ? '👍' : '❌'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setStudentPerfModal(null)}
                className="w-full btn-primary text-xs font-black py-2.5 rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        );
      })()}

      {/* ═══ Broadcast Modal (WhatsApp to All Students) ═══ */}
      {broadcastModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  💬
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">إرسال إشعار الحصة الجديدة للطلاب 📲</h4>
                  <p className="text-[10px] text-slate-500 font-bold">{broadcastModal.lessonTitle}</p>
                </div>
              </div>
              <button onClick={() => setBroadcastModal(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-xs text-blue-900 font-bold flex items-start gap-2">
              <span className="text-base">📱</span>
              <span>تأكد إنك بتبعت من رقم المنصة: <strong dir="ltr">01002169889</strong> — افتح كل رابط من موبايلك وابعت الرسالة</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-800 font-medium">
              تم تجهيز روابط إرسال الواتساب لـ <strong>{broadcastModal.links.length} طالب</strong> مسجل بالسيستم! اضغط على زر الإرسال لكل طالب:
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {broadcastModal.links.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs">
                  <div>
                    <div className="font-black text-slate-900">{item.studentName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.phone}</div>
                  </div>
                  <a
                    href={item.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-sm transition-all"
                  >
                    <span>إرسال واتساب</span>
                    <Send className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBroadcastModal(null)}
                className="btn-primary text-xs font-black py-2.5 px-6 rounded-xl"
              >
                تم الإرسال / إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
