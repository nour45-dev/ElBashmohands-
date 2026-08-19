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
    sendLiveChatMessage, 
    submitLivePollVote, 
    sendHandRaiseRequest, 
    student, 
    userRole, 
    adminIdentity,
    currentGrade 
  } = useApp();

  // Find target session or use first available
  const [currentSessionId, setCurrentSessionId] = useState(selectedLiveId || liveSessionsDB[0]?.id || 'live_demo_1');
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

  // Theater mode state
  const [isTheater, setIsTheater] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Floating Watermark coordinates
  const [watermarkPos, setWatermarkPos] = useState({ top: '15%', left: '20%' });

  // Refresh live session every 4 seconds for real-time chat & polls
  useEffect(() => {
    if (!currentSession?.id) return;
    refreshLiveSession(currentSession.id);
    const interval = setInterval(() => {
      refreshLiveSession(currentSession.id);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentSession?.id]);

  // Floating watermark reposition timer
  useEffect(() => {
    const wmInterval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 70 + 10) + '%';
      const randomLeft = Math.floor(Math.random() * 60 + 15) + '%';
      setWatermarkPos({ top: randomTop, left: randomLeft });
    }, 8000);
    return () => clearInterval(wmInterval);
  }, []);

  // Countdown calculation
  useEffect(() => {
    if (currentSession?.status !== 'scheduled') return;
    const targetDate = new Date(currentSession.scheduledAt || Date.now() + 3600000).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor((diff / (1000 * 60 * 60)));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateCountdown();
    const cdInterval = setInterval(updateCountdown, 1000);
    return () => clearInterval(cdInterval);
  }, [currentSession?.scheduledAt, currentSession?.status]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.chatMessages?.length]);

  // Handle Send Chat
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;
    setIsSendingChat(true);
    const res = await sendLiveChatMessage(currentSession.id, chatInput);
    if (res.success) {
      setChatInput('');
    }
    setIsSendingChat(false);
  };

  // Add floating reaction
  const triggerReaction = (emoji) => {
    const id = Date.now() + Math.random();
    setFloatingReactions(prev => [...prev, { id, emoji, x: Math.random() * 60 + 20 }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 2500);
  };

  // Handle Poll Vote
  const handleVotePoll = async (pollId, optIdx) => {
    if (pollVoted || selectedPollOption !== null) return;
    setSelectedPollOption(optIdx);
    setPollVoted(true);
    await submitLivePollVote(currentSession.id, pollId, optIdx);
  };

  // Handle Hand Raise
  const handleHandRaise = async () => {
    if (handRaised) return;
    setHandRaised(true);
    const res = await sendHandRaiseRequest(currentSession.id);
    if (res.success) {
      setHandRaiseSuccessMsg('تم إرسال طلب المداخلة للمعلم بنجاح! سيتم إتاحة المداخلة لك قريباً.');
      setTimeout(() => setHandRaiseSuccessMsg(null), 5000);
    }
  };

  const handleShareLink = () => {
    const url = window.location.origin + `/?live=${currentSession?.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Active Poll
  const activePoll = currentSession?.polls?.find(p => p.isActive);

  // Student details for dynamic watermark
  const studentDisplayName = student?.name || 'طالب منصة عِلم';
  const studentCode = student?.code || '3003';
  const studentPhone = student?.phone || '01002169889';

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* ═══ Top Breadcrumbs & Control Bar ═══ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#162534] p-4 md:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all font-black flex items-center gap-1.5 text-xs shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
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
          <div className="relative bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl aspect-video group">
            
            {/* 1. Live Stream Active Mode */}
            {currentSession?.status === 'live' && (
              <div className="w-full h-full relative">
                <iframe
                  src={formatVideoEmbedUrl(currentSession.streamUrl || 'https://www.youtube.com/watch?v=jfKfPfyJRdk')}
                  title={currentSession.title}
                  className="w-full h-full object-cover border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />

                {/* Floating Anti-Piracy Watermark */}
                <div 
                  style={{ top: watermarkPos.top, left: watermarkPos.left }}
                  className="absolute pointer-events-none z-30 transition-all duration-1000 select-none bg-black/40 backdrop-blur-[2px] border border-white/10 text-white/40 text-[10px] md:text-xs font-mono font-black px-2.5 py-1 rounded-lg"
                >
                  🔒 {studentDisplayName} • {studentCode} • {studentPhone}
                </div>

                {/* Top Live Overlay Badge */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
                  <div className="bg-rose-600/90 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>LIVE</span>
                  </div>
                  <div className="bg-black/60 backdrop-blur-md text-white/90 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-white/10">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentSession.viewersCount || 342} مشاهد</span>
                  </div>
                </div>

                {/* Floating Reaction Animation Emojis */}
                <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                  {floatingReactions.map(r => (
                    <div
                      key={r.id}
                      style={{ left: `${r.x}%` }}
                      className="absolute bottom-6 text-3xl md:text-4xl animate-float-up opacity-90"
                    >
                      {r.emoji}
                    </div>
                  ))}
                </div>

                {/* In-Video Live Poll Overlay Banner (if poll is active and student hasn't voted yet) */}
                {activePoll && (
                  <div className="absolute bottom-4 left-4 right-4 z-40 bg-slate-900/95 backdrop-blur-md border-2 border-amber-500/80 p-4 rounded-2xl shadow-2xl text-right animate-in slide-in-from-bottom space-y-3">
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
                            {/* Vote Percentage Progress Fill */}
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
            )}

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

                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="https://wa.me/201002169889"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-lg"
                  >
                    <span>طلب تذكير على الواتساب 📲</span>
                  </a>
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

          {/* ═══ Fast Interactive Reactions & Hand Raise Bar ═══ */}
          <div className="bg-white dark:bg-[#162534] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
            
            {/* Quick Reactions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 ml-1 hidden sm:inline">تفاعل مع المستر:</span>
              {[
                { emoji: '❤️', label: 'حب' },
                { emoji: '🔥', label: 'حماس' },
                { emoji: '👏', label: 'تسقيف' },
                { emoji: '💡', label: 'فهمت' },
                { emoji: '🙋‍♂️', label: 'سؤال' },
                { emoji: '💯', label: 'عاش' }
              ].map((rec, idx) => (
                <button
                  key={idx}
                  onClick={() => triggerReaction(rec.emoji)}
                  title={rec.label}
                  className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all shadow-2xs"
                >
                  {rec.emoji}
                </button>
              ))}
            </div>

            {/* Student Hand Raise Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleHandRaise}
                disabled={handRaised}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-md ${
                  handRaised 
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-105'
                }`}
              >
                <Hand className={`w-4 h-4 ${handRaised ? 'text-emerald-500' : 'text-slate-950 animate-bounce'}`} />
                <span>{handRaised ? 'تم طلب المداخلة ✋' : 'طلب مداخلة مع المستر'}</span>
              </button>
            </div>

          </div>

          {handRaiseSuccessMsg && (
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 p-3 rounded-2xl text-xs font-black flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{handRaiseSuccessMsg}</span>
            </div>
          )}

          {/* ═══ Session Information & Instructor Card ═══ */}
          <div className="bg-white dark:bg-[#162534] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white text-2xl shadow-md">
                  {currentSession?.instructorId === 'mr_sayed' ? '📖' : '💻'}
                </div>
                <div>
                  <h3 className="font-black text-base md:text-lg text-slate-900 dark:text-white">
                    {currentSession?.instructor}
                  </h3>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {currentSession?.instructorId === 'mr_sayed' ? 'خبير ومُعلم اللغة العربية للثانوية العامة' : 'محاضر البرمجة وعلوم الحاسب'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 block">الصف الدراسي</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{currentSession?.gradeName}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
              <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">موضوع ومحاور الحصة المباشرة:</h4>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                {currentSession?.description}
              </p>
            </div>

          </div>

        </div>

        {/* Right Column / Interactive Sidebar (Live Chat, Q&A, Other Lives) */}
        {!isTheater && (
          <div className="lg:col-span-4 bg-white dark:bg-[#162534] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[640px]">
            
            {/* Sidebar Tabs Switcher */}
            <div className="bg-slate-100 dark:bg-slate-900/80 p-1.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 text-xs font-black">
              <button
                onClick={() => setSidebarTab('chat')}
                className={`flex-1 py-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'chat'
                    ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>الدردشة الحية 💬</span>
              </button>

              <button
                onClick={() => setSidebarTab('archive')}
                className={`flex-1 py-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'archive'
                    ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>كل البثوث ({liveSessionsDB.length})</span>
              </button>
            </div>

            {/* TAB 1: Real-time Live Chat Feed */}
            {sidebarTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                
                {/* Pinned Teacher Announcement if any */}
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-3.5 py-2 flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="truncate">تنبيه: اكتب سؤالك بوضوح وسيتم الإجابة عليه أثناء البث مباشرة.</span>
                </div>

                {/* Messages Scrollable List */}
                <div className="flex-1 p-3.5 space-y-2.5 overflow-y-auto custom-scrollbar">
                  {(!currentSession?.chatMessages || currentSession.chatMessages.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                      <div className="text-3xl">💬</div>
                      <p className="text-xs font-bold">لا توجد رسائل بعد. كن أول من يكتب في الشات!</p>
                    </div>
                  ) : (
                    currentSession.chatMessages.map(msg => {
                      const isTeacher = msg.senderRole === 'teacher';
                      return (
                        <div
                          key={msg.id}
                          className={`p-2.5 rounded-2xl text-xs space-y-1 transition-all ${
                            isTeacher 
                              ? 'bg-amber-500/15 border border-amber-500/30 text-slate-900 dark:text-white' 
                              : 'bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-black flex items-center gap-1 ${isTeacher ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                              {isTeacher && <span>🎓</span>}
                              <span>{msg.senderName}</span>
                              {isTeacher && <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black">المعلم</span>}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp || 'الآن'}</span>
                          </div>
                          <p className="text-xs font-bold leading-relaxed break-words">{msg.text}</p>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Send Input Box */}
                <form onSubmit={handleSendChat} className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="اكتب رسالتك أو سؤالك في الشات..."
                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSendingChat || !chatInput.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md flex-shrink-0"
                  >
                    <Send className="w-4 h-4 rotate-180" />
                  </button>
                </form>

              </div>
            )}

            {/* TAB 2: All Live Sessions & Archive List */}
            {sidebarTab === 'archive' && (
              <div className="flex-1 p-3.5 space-y-3 overflow-y-auto custom-scrollbar">
                <div className="text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  جدول البثوث المباشرة لحسابك:
                </div>

                {liveSessionsDB.map(s => {
                  const isCurrent = s.id === currentSession.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => { setCurrentSessionId(s.id); if (onSelectLive) onSelectLive(s.id); }}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                        isCurrent 
                          ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/20' 
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400">
                          {s.subject}
                        </span>
                        {s.status === 'live' ? (
                          <span className="text-[10px] font-black text-rose-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            <span>مباشر الآن 🔴</span>
                          </span>
                        ) : s.status === 'scheduled' ? (
                          <span className="text-[10px] font-bold text-blue-500">⏳ مجدول</span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-500">📼 مسجل</span>
                        )}
                      </div>

                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                        {s.title}
                      </h4>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>{s.instructor}</span>
                        <span className="font-mono">{new Date(s.scheduledAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
