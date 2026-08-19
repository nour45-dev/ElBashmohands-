import React, { useState, useEffect, useRef } from 'react';
import { useApp, formatVideoEmbedUrl } from '../context/AppContext';
import { 
  Radio, 
  Users, 
  MessageSquare, 
  Send, 
  Flame, 
  Heart, 
  ThumbsUp, 
  Sparkles, 
  Clock, 
  Calendar, 
  Share2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  HelpCircle, 
  Award, 
  Hand, 
  Pin, 
  Check, 
  ExternalLink,
  ChevronRight,
  Video,
  Eye,
  BellRing
} from 'lucide-react';

export const LiveView = ({ selectedLiveId, onBack, onSelectLive }) => {
  const { 
    liveSessionsDB, 
    activeLiveSession, 
    setActiveLiveSession, 
    refreshLiveSession, 
    adminUpdateLiveStatus,
    sendLiveChatMessage, 
    submitLivePollVote, 
    sendHandRaiseRequest, 
    student, 
    userRole, 
    adminIdentity,
    currentGrade 
  } = useApp();

  const [currentSessionId, setCurrentSessionId] = useState(selectedLiveId || liveSessionsDB[0]?.id || 'live_demo_1');

  useEffect(() => {
    if (selectedLiveId) {
      setCurrentSessionId(selectedLiveId);
    } else if (liveSessionsDB.length > 0) {
      const activeLive = liveSessionsDB.find(s => s.status === 'live');
      if (activeLive) {
        setCurrentSessionId(activeLive.id);
      } else {
        setCurrentSessionId(liveSessionsDB[0].id);
      }
    }
  }, [selectedLiveId, liveSessionsDB]);

  const currentSession = liveSessionsDB.find(s => s.id === currentSessionId) || activeLiveSession || liveSessionsDB[0];

  // Tab: 'chat' | 'qa' | 'archive'
  const [sidebarTab, setSidebarTab] = useState('chat');
  
  // Chat input
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef(null);

  // Floating floating reactions state
  const [floatingReactions, setFloatingReactions] = useState([]);

  // Hand raise status
  const [handRaised, setHandRaised] = useState(false);
  const [handRaiseSuccessMsg, setHandRaiseSuccessMsg] = useState(null);

  // Selected option for active poll
  const [selectedPollOption, setSelectedPollOption] = useState(null);
  const [pollVoted, setPollVoted] = useState(false);

  // Theater mode & True Fullscreen state
  const [isTheater, setIsTheater] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef(null);

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else if (videoContainerRef.current.webkitRequestFullscreen) {
        videoContainerRef.current.webkitRequestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // In-Browser Native Camera & Screen Share Live Studio State (for Teacher)
  const [localStream, setLocalStream] = useState(null);
  const [isStreamingCamera, setIsStreamingCamera] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const localVideoRef = useRef(null);

  const isTeacher = userRole === 'admin';

  const startCameraStream = async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
      setLocalStream(stream);
      setIsStreamingCamera(true);
      setIsSharingScreen(false);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (e) {
      alert('يرجى السماح بالوصول للكاميرا والمايك لبدء البث المباشر من المتصفح');
    }
  };

  const startScreenShare = async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true });
      setLocalStream(stream);
      setIsSharingScreen(true);
      setIsStreamingCamera(false);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getVideoTracks()[0].onended = () => {
        stopLocalStream();
      };
    } catch (e) {
      console.log('Screen share cancelled');
    }
  };

  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }
    setIsStreamingCamera(false);
    setIsSharingScreen(false);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!currentSession?.scheduledAt) return;
    const interval = setInterval(() => {
      const diff = new Date(currentSession.scheduledAt).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentSession?.scheduledAt]);

  // Anti-piracy watermark floating position
  const [watermarkPos, setWatermarkPos] = useState({ top: '15%', left: '15%' });

  useEffect(() => {
    const interval = setInterval(() => {
      const top = `${Math.floor(Math.random() * 70) + 10}%`;
      const left = `${Math.floor(Math.random() * 70) + 10}%`;
      setWatermarkPos({ top, left });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.chatMessages, sidebarTab]);

  // Send message in chat
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;
    setIsSendingChat(true);
    try {
      await sendLiveChatMessage(currentSession.id, chatInput.trim());
      setChatInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Trigger floating reaction emoji
  const triggerReaction = (emoji) => {
    const id = Date.now() + Math.random();
    const x = Math.floor(Math.random() * 60) + 20;
    setFloatingReactions(prev => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2500);
  };

  // Submit hand raise
  const handleHandRaise = async () => {
    if (handRaised) return;
    setHandRaised(true);
    const res = await sendHandRaiseRequest(currentSession.id);
    if (res.success) {
      setHandRaiseSuccessMsg('تم رفع يدك بنجاح! سيصل تنبيه للمستر وسيقوم بفتح المايك لك ✋');
      setTimeout(() => setHandRaiseSuccessMsg(null), 5000);
    }
  };

  // Vote on live poll
  const handleVotePoll = async (pollId, optionIndex) => {
    if (pollVoted) return;
    setSelectedPollOption(optionIndex);
    setPollVoted(true);
    await submitLivePollVote(currentSession.id, pollId, optionIndex);
  };

  // Share session link
  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/#live?session=${currentSession.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const studentDisplayName = userRole === 'admin'
    ? (adminIdentity === 'mr_sayed' ? 'أ / سيد عبد العاطي' : 'م / نور الدين')
    : (student?.name || 'طالب منصة عِلم');

  const studentCode = student?.code || 'ADM-2026';
  const studentPhone = student?.phone || '01002169889';

  const activePoll = currentSession?.polls?.find(p => p.isActive);

  return (
    <div className="space-y-6 pb-20 relative" dir="rtl">
      
      {/* ═══ Top Header Breadcrumb & Status Strip ═══ */}
      <div className="bg-white dark:bg-[#162534] p-4 md:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
            title="الرجوع للرئيسية"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                {currentSession?.subject} • {currentSession?.gradeName}
              </span>

              {currentSession?.status === 'live' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-black animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>مباشر الآن 🔴</span>
                </span>
              ) : currentSession?.status === 'scheduled' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-black">
                  <Clock className="w-3.5 h-3.5" />
                  <span>بث مباشر مجدول ⏳</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تسجيل الحصة متاح 📼</span>
                </span>
              )}
            </div>
            <h1 className="text-base md:text-xl font-black text-slate-900 dark:text-white mt-1">
              {currentSession?.title}
            </h1>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          
          <button
            onClick={handleShareLink}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black transition-all flex items-center gap-1.5 shadow-xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">تم نسخ الرابط!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة البث</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsTheater(!isTheater)}
            title={isTheater ? 'الوضع العادي' : 'وضع المسرح المكبر'}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-all shadow-xs"
          >
            {isTheater ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* ═══ Main Live Classroom Grid (Video + Real-time Interactive Sidebar) ═══ */}
      <div className={`grid grid-cols-1 ${isTheater ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-6 items-start`}>
        
        {/* Left / Main Column (Video Player + Live Interactive Overlays + Details) */}
        <div className={`${isTheater ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
          
          {/* Main Video Stream Player Container with Anti-Piracy Floating Watermark */}
          <div 
            ref={videoContainerRef}
            className="relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl aspect-video group flex flex-col justify-between"
          >
            
            {/* Top Live Overlay Header Badge */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-none">
              <div className="bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>LIVE HD</span>
              </div>
              <div className="bg-black/70 backdrop-blur-md text-white/90 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-white/10">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentSession.viewersCount || 342} متواجد الآن</span>
              </div>
            </div>

            {/* Top Left Subject / Fullscreen Status */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2 pointer-events-none">
              <span className="bg-black/60 backdrop-blur-md text-amber-400 px-3 py-1 rounded-full text-xs font-black border border-amber-500/20">
                {currentSession.instructor} • {currentSession.subject}
              </span>
            </div>

            {/* Floating Anti-Piracy Watermark */}
            <div 
              style={{ top: watermarkPos.top, left: watermarkPos.left }}
              className="absolute pointer-events-none z-40 transition-all duration-1000 select-none bg-black/50 backdrop-blur-[2px] border border-white/10 text-white/50 text-[10px] md:text-xs font-mono font-black px-3 py-1 rounded-lg"
            >
              🔒 {studentDisplayName} • {studentCode} • {studentPhone}
            </div>

            {/* 1. Main Live Stream Video Screen Area */}
            <div className="relative w-full h-full flex-1 flex items-center justify-center bg-slate-950 overflow-hidden">
              
              {/* External YouTube / Stream if selected */}
              {currentSession.streamType === 'youtube_live' && currentSession.streamUrl && !currentSession.streamUrl.includes('platform_native') && !currentSession.streamUrl.includes('meet.google') ? (
                <iframe
                  src={formatVideoEmbedUrl(currentSession.streamUrl)}
                  title={currentSession.title}
                  className="w-full h-full object-cover border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              ) : currentSession.streamUrl?.includes('meet.google.com') ? (
                /* Google Meet Direct Integration Banner */
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 text-white max-w-lg">
                  <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-4xl shadow-2xl">
                    📹
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black">حصة Google Meet المباشرة 🚀</h3>
                    <p className="text-xs text-slate-300 font-bold leading-relaxed">
                      هذا البث مستضاف عبر Google Meet المباشر. اضغط على الزر أدناه للدخول إلى القاعة والتفاعل بالصوت والصورة.
                    </p>
                  </div>
                  <a
                    href={currentSession.streamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black text-sm px-8 py-3.5 rounded-2xl shadow-xl transition-all flex items-center gap-2 hover:scale-105"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>دخول اجتماع Google Meet الآن 🚀</span>
                  </a>
                </div>
              ) : (
                /* Native In-House Google Meet Classroom Feed */
                <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted={isTeacher}
                    className={`w-full h-full object-contain ${(!localStream && isTeacher) ? 'hidden' : ''}`}
                  />

                  {/* Teacher Pre-stream Screen */}
                  {!localStream && isTeacher && (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 text-white max-w-md animate-in fade-in">
                      <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-4xl shadow-2xl animate-pulse">
                        🎥
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg md:text-xl font-black">قاعة الشرح المباشر (مثل Google Meet) 💻</h3>
                        <p className="text-xs text-slate-300 font-bold leading-relaxed">
                          جاهز لبدء الحصة؟ شغل الكاميرا والمايك أو شارك شاشة جهازك لشرح المذكرات والتمارين للطلاب فوراً.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          onClick={startCameraStream}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-xl transition-all flex items-center gap-2 hover:scale-105"
                        >
                          <Radio className="w-4 h-4" />
                          <span>تشغيل الكاميرا والمايك 📹</span>
                        </button>
                        <button
                          onClick={startScreenShare}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-xl transition-all flex items-center gap-2 hover:scale-105"
                        >
                          <span>مشاركة شاشة الكمبيوتر 🖥️</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Student View Screen */}
                  {!localStream && !isTeacher && (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 text-white max-w-md">
                      <div className="w-20 h-20 rounded-3xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-4xl shadow-2xl animate-bounce">
                        📡
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-white">قاعة البث التفاعلية المباشرة 🔴</h3>
                        <p className="text-xs text-slate-300 font-bold leading-relaxed">
                          المحاضر متواجد الآن بالقاعة. جهز كشكول الملاحظات وتفاعل مع الأسئلة والشات لحظة بلحظة.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black px-4 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>متصل بالقاعة بنجاح ✓</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Floating Reaction Animation Emojis */}
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {floatingReactions.map(r => (
                  <div
                    key={r.id}
                    style={{ left: `${r.x}%` }}
                    className="absolute bottom-16 text-3xl md:text-4xl animate-float-up opacity-90"
                  >
                    {r.emoji}
                  </div>
                ))}
              </div>

              {/* In-Video Live Poll Overlay Banner */}
              {activePoll && (
                <div className="absolute bottom-20 left-4 right-4 z-40 bg-slate-900/95 backdrop-blur-md border-2 border-amber-500/80 p-4 rounded-2xl shadow-2xl text-right animate-in slide-in-from-bottom space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎯</span>
                      <div>
                        <span className="text-[10px] font-black text-amber-400">سؤال تفاعلي مباشر من المستر!</span>
                        <h4 className="text-xs md:text-sm font-black text-white">{activePoll.question}</h4>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-1 rounded-lg">
                      {activePoll.totalVotes || 0} إجابة
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activePoll.options.map((opt, oIdx) => {
                      const total = activePoll.totalVotes || 0;
                      const votes = activePoll.votes?.[oIdx] || 0;
                      const percent = total > 0 ? Math.round((votes / total) * 100) : 0;
                      const isSelected = selectedPollOption === oIdx;

                      return (
                        <button
                          key={oIdx}
                          disabled={pollVoted}
                          onClick={() => handleVotePoll(activePoll.id, oIdx)}
                          className={`p-2.5 rounded-xl border text-xs font-black text-right transition-all flex items-center justify-between relative overflow-hidden ${
                            isSelected 
                              ? 'bg-amber-500/25 border-amber-500 text-amber-300' 
                              : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-200'
                          }`}
                        >
                          {pollVoted && (
                            <div 
                              style={{ width: `${percent}%` }}
                              className="absolute inset-y-0 right-0 bg-amber-500/20 pointer-events-none transition-all duration-500"
                            />
                          )}
                          <span className="relative z-10">{opt}</span>
                          {pollVoted && (
                            <span className="relative z-10 text-[11px] font-mono text-amber-400 font-bold">{percent}%</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* ═══ Google Meet Style Bottom Floating Toolbar (شريط تحكم جوجل ميت) ═══ */}
            <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 z-30 flex items-center justify-between gap-3">
              
              {/* Left / Teacher Studio Media Controls */}
              <div className="flex items-center gap-2">
                {isTeacher ? (
                  <>
                    {/* Mic Toggle */}
                    <button
                      onClick={localStream ? toggleMic : startCameraStream}
                      title={isMicMuted ? 'تشغيل المايك' : 'كتم المايك'}
                      className={`p-3 rounded-2xl font-black text-xs transition-all flex items-center gap-1.5 shadow-md ${
                        isMicMuted 
                          ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isMicMuted ? <Volume2 className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                      <span className="hidden sm:inline">{isMicMuted ? 'المايك مكتوم' : 'المايك شغال'}</span>
                    </button>

                    {/* Camera Toggle */}
                    <button
                      onClick={isStreamingCamera ? stopLocalStream : startCameraStream}
                      title="تشغيل/إيقاف الكاميرا"
                      className={`p-3 rounded-2xl font-black text-xs transition-all flex items-center gap-1.5 shadow-md ${
                        isStreamingCamera 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <Video className="w-4 h-4 text-white" />
                      <span className="hidden sm:inline">{isStreamingCamera ? 'الكاميرا شغالة 📹' : 'تشغيل الكاميرا'}</span>
                    </button>

                    {/* Screen Share Toggle */}
                    <button
                      onClick={isSharingScreen ? stopLocalStream : startScreenShare}
                      title="مشاركة شاشة الكمبيوتر"
                      className={`p-3 rounded-2xl font-black text-xs transition-all flex items-center gap-1.5 shadow-md ${
                        isSharingScreen 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <Share2 className="w-4 h-4 text-white" />
                      <span className="hidden sm:inline">{isSharingScreen ? 'مشاركة الشاشة نشطة 🖥️' : 'مشاركة الشاشة'}</span>
                    </button>

                    {/* Stop Streaming Button */}
                    {localStream && (
                      <button
                        onClick={stopLocalStream}
                        className="px-3.5 py-3 rounded-2xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-black transition-all shadow-md"
                      >
                        ⏹️ إيقاف البث
                      </button>
                    )}
                  </>
                ) : (
                  /* Student Interactive Buttons */
                  <button
                    onClick={handleHandRaise}
                    disabled={handRaised}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-md ${
                      handRaised 
                        ? 'bg-amber-500 text-slate-950 border border-amber-400 font-black' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <Hand className="w-4 h-4 text-amber-400" />
                    <span>{handRaised ? 'تم إرسال طلب المداخلة ✋' : 'طلب مداخلة مع المستر ✋'}</span>
                  </button>
                )}
              </div>

              {/* Right / Reaction Bar & True Fullscreen Toggle */}
              <div className="flex items-center gap-2">
                
                {/* Floating Emojis Reaction Selector */}
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 p-1.5 rounded-2xl">
                  {['🔥', '👏', '💡', '❤️', '💯'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => triggerReaction(emoji)}
                      className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-base transition-all hover:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* True Fullscreen Toggle Button */}
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'تصغير الشاشة' : 'تكبير الشاشة ملء الشاشة بالكامل'}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-1 text-xs font-black shadow-md hover:scale-105"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
                  <span className="hidden md:inline">{isFullscreen ? 'تصغير' : 'ملء الشاشة ⛶'}</span>
                </button>

              </div>

            </div>

            {/* 2. Scheduled Live Countdown Screen */}
            {currentSession?.status === 'scheduled' && (
              <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center space-y-5 bg-gradient-to-br from-slate-950 via-slate-900 to-[#0D1B2A] text-white">
                
                <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-3xl shadow-xl animate-bounce">
                  ⏳
                </div>

                <div className="space-y-2 max-w-md">
                  <span className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-3.5 py-1 rounded-full text-xs font-black">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>موعد البث المباشر القادم</span>
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white">{currentSession.title}</h3>
                  <p className="text-xs text-slate-300 font-bold leading-relaxed">{currentSession.description}</p>
                </div>

                {/* Flip-style Big Countdown Boxes */}
                <div className="flex items-center gap-3 dir-ltr">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 md:p-4 rounded-2xl min-w-[4.5rem] text-center space-y-1">
                    <div className="text-2xl md:text-4xl font-mono font-black text-amber-400">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">ساعة</div>
                  </div>

                  <span className="text-2xl font-black text-amber-400">:</span>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 md:p-4 rounded-2xl min-w-[4.5rem] text-center space-y-1">
                    <div className="text-2xl md:text-4xl font-mono font-black text-amber-400">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">دقيقة</div>
                  </div>

                  <span className="text-2xl font-black text-amber-400">:</span>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 md:p-4 rounded-2xl min-w-[4.5rem] text-center space-y-1">
                    <div className="text-2xl md:text-4xl font-mono font-black text-amber-400">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">ثانية</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {isTeacher ? (
                    <button
                      onClick={() => adminUpdateLiveStatus(currentSession.id, 'live')}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-xl transition-all flex items-center gap-2 hover:scale-105 animate-pulse"
                    >
                      <Radio className="w-4 h-4" />
                      <span>بدء وفتح قاعة الفيديو (مثل Google Meet) الآن 🔴</span>
                    </button>
                  ) : (
                    <a
                      href="https://wa.me/201002169889"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-lg"
                    >
                      <span>طلب تذكير على الواتساب 📲</span>
                    </a>
                  )}
                </div>

              </div>
            )}

            {/* 3. Ended Live Recording Available Screen */}
            {currentSession?.status === 'ended' && (
              <div className="w-full h-full relative">
                {currentSession.recordingUrl ? (
                  <iframe
                    src={formatVideoEmbedUrl(currentSession.recordingUrl)}
                    title={currentSession.title}
                    className="w-full h-full object-cover border-0"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950 text-white">
                    <div className="text-4xl">📼</div>
                    <h3 className="text-base font-black">انتهى البث المباشر</h3>
                    <p className="text-xs text-slate-400 font-bold">جاري معالجة تسجيل الحصة لتكون متاحة بجودة عالية في الأرشيف قريباً.</p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Session Overview Box */}
          <div className="bg-white dark:bg-[#162534] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-black">
                  👨‍🏫
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    {currentSession.instructor}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    محاضر المادة • {currentSession.subject}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                  {currentSession.gradeName}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">عن هذه الحصة:</h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                {currentSession.description || 'شرح تفاعلي مباشر مع حل تدريبات وزارية ونماذج امتحانات وإجابة على أسئلة الطلاب لحظة بلحظة.'}
              </p>
            </div>

            {handRaiseSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{handRaiseSuccessMsg}</span>
              </div>
            )}
          </div>

        </div>

        {/* Right / Sidebar: Real-time Live Chat & Interactive QA Queue */}
        <div className={`${isTheater ? 'lg:col-span-12' : 'lg:col-span-4'} space-y-4`}>
          
          <div className="bg-white dark:bg-[#162534] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[560px]">
            
            {/* Sidebar Tabs */}
            <div className="flex items-center border-b border-slate-100 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => setSidebarTab('chat')}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'chat'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>الدردشة الحية 💬</span>
              </button>

              <button
                onClick={() => setSidebarTab('qa')}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'qa'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>أسئلة ومداخلات ({currentSession?.handRaises?.length || 0})</span>
              </button>
            </div>

            {/* Chat Tab Body */}
            {sidebarTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                
                {/* Chat Messages Scroll Container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-[11px] font-bold text-amber-800 dark:text-amber-300 text-center">
                    📢 تنبيه: اكتب سؤالك بوضوح وسيتم الإجابة عليه أثناء البث مباشرة.
                  </div>

                  {(!currentSession?.chatMessages || currentSession.chatMessages.length === 0) ? (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <MessageSquare className="w-8 h-8 mx-auto stroke-[1.5] text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-bold">لا توجد رسائل بعد. كن أول من يرحب بالمستر والزملاء!</p>
                    </div>
                  ) : (
                    currentSession.chatMessages.map(msg => {
                      const isMe = msg.senderCode === studentCode || (isTeacher && msg.isAdmin);
                      return (
                        <div 
                          key={msg.id}
                          className={`flex flex-col space-y-1 ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                            <span>{msg.senderName}</span>
                            {msg.isAdmin && (
                              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black text-[9px]">
                                المعلم
                              </span>
                            )}
                            <span className="text-[9px] font-mono text-slate-400">
                              {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className={`p-3 rounded-2xl text-xs font-medium max-w-[85%] leading-relaxed ${
                            msg.isAdmin
                              ? 'bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-100 rounded-tr-none'
                              : isMe
                                ? 'bg-slate-900 dark:bg-slate-700 text-white rounded-tr-none'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input Footer */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="اكتب رسالتك أو سؤالك في الشات..."
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isSendingChat}
                    className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-all disabled:opacity-40 shadow-xs"
                  >
                    <Send className="w-4 h-4 rotate-180" />
                  </button>
                </form>

              </div>
            )}

            {/* QA & Hand Raise Queue Tab Body */}
            {sidebarTab === 'qa' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-700 dark:text-blue-300 text-xs font-bold text-center">
                  ✋ قائمة الطلاب الراغبين في التحدث والمداخلة بالمايك
                </div>

                {(!currentSession?.handRaises || currentSession.handRaises.length === 0) ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <Hand className="w-8 h-8 mx-auto stroke-[1.5] text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-bold">لا توجد طلبات مداخلة حالياً.</p>
                  </div>
                ) : (
                  currentSession.handRaises.map((hr, idx) => (
                    <div 
                      key={hr.id || idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm font-black">
                          ✋
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">{hr.studentName}</h5>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold">كود: {hr.studentCode}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        في الانتظار ⏳
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
