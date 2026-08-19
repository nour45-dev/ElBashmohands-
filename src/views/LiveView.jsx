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
  BellRing,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  PhoneOff,
  Settings
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
    requestJoinLive,
    admitStudentLive,
    admitAllStudentsLive,
    sendLiveHeartbeat,
    student, 
    userRole, 
    adminIdentity,
    currentGrade 
  } = useApp();

  // Find target session or use first available
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

  const studentCode = student?.code || (userRole === 'admin' ? 'ADM-2026' : '3001');
  const studentDisplayName = userRole === 'admin' 
    ? (adminIdentity === 'mr_sayed' ? 'أ / سيد عبد العاطي' : 'م / نور الدين') 
    : (student?.name || 'طالب منصة عِلم');
  const studentPhone = student?.phone || '01002169889';

  const isTeacher = userRole === 'admin';

  // Real-time Join Request status for Student
  const myJoinRequest = currentSession?.joinRequests?.find(r => r.studentCode === studentCode);
  const isAdmitted = isTeacher || (myJoinRequest?.status === 'admitted');
  const isPendingAdmission = !isTeacher && myJoinRequest?.status === 'pending';
  const isRejectedAdmission = !isTeacher && myJoinRequest?.status === 'rejected';

  const [isRequestingJoin, setIsRequestingJoin] = useState(false);

  const handleAskToJoin = async () => {
    setIsRequestingJoin(true);
    await requestJoinLive(currentSession.id);
    await refreshLiveSession(currentSession.id);
    setIsRequestingJoin(false);
  };

  // Pending admission requests for Teacher (Google Meet style)
  const pendingRequests = currentSession?.joinRequests?.filter(r => r.status === 'pending') || [];

  // Actual Real-Time Viewers Count (No fake 342)
  const actualViewersCount = currentSession?.viewersCount || 1;

  // Fast 1.5s Heartbeat & Real-time Live Presence / Admission Polling
  useEffect(() => {
    if (!currentSession?.id) return;
    sendLiveHeartbeat(currentSession.id);
    const interval = setInterval(() => {
      sendLiveHeartbeat(currentSession.id);
      refreshLiveSession(currentSession.id);
    }, 1500);
    return () => clearInterval(interval);
  }, [currentSession?.id]);

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
  const [localStream, setLocalStream] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isUploadingRecording, setIsUploadingRecording] = useState(false);
  const [activeMediaStream, setActiveMediaStream] = useState(null);
  const teacherVideoRef = useRef(null);


  // Load PeerJS once for rock-solid cross-device live streaming
  useEffect(() => {
    if (window.Peer) return;
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const teacherPeerRef = useRef(null);
  const activeStreamRef = useRef(null);

  const startTeacherCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      setActiveMediaStream(stream);
      activeStreamRef.current = stream;
      setLocalStream(true);
      setIsSharingScreen(false);
      setIsCameraOff(false);
      setIsMicMuted(false);
      setTimeout(() => {
        if (teacherVideoRef.current) {
          teacherVideoRef.current.srcObject = stream;
        }
      }, 100);
      setupTeacherPeer(stream);
    } catch (e) {
      alert('يرجى السماح بصلاحيات الكاميرا والمايك في المتصفح لبدء البث المباشر!');
    }
  };

  const startTeacherScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { cursor: "always" }, 
        audio: true 
      });
      setActiveMediaStream(stream);
      activeStreamRef.current = stream;
      setLocalStream(true);
      setIsSharingScreen(true);
      setIsCameraOff(false);
      setTimeout(() => {
        if (teacherVideoRef.current) {
          teacherVideoRef.current.srcObject = stream;
        }
      }, 100);
      setupTeacherPeer(stream);
      stream.getVideoTracks()[0].onended = () => {
        setIsSharingScreen(false);
        setLocalStream(false);
      };
    } catch (e) {
      console.log('Screen share cancelled');
    }
  };

  // Setup Teacher Live Broadcaster Peer
  const setupTeacherPeer = (stream) => {
    if (!window.Peer || !currentSession?.id) return;
    const peerId = `elm_teacher_${currentSession.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    if (teacherPeerRef.current) {
      teacherPeerRef.current.destroy();
    }

    const peer = new window.Peer(peerId);
    teacherPeerRef.current = peer;

    peer.on('open', (id) => {
      console.log('Teacher live broadcast active on Peer ID:', id);
    });

    peer.on('call', (incomingCall) => {
      console.log('Student connecting to live stream...');
      incomingCall.answer(activeStreamRef.current || stream);

      // Listen for incoming student microphone voice
      incomingCall.on('stream', (studentStream) => {
        try {
          if (studentStream && studentStream.getAudioTracks().length > 0) {
            const studentAudio = new Audio();
            studentAudio.srcObject = studentStream;
            studentAudio.play().catch(() => {});
          }
        } catch (err) {
          console.log('Error playing student audio on teacher device:', err);
        }
      });
    });

    peer.on('error', (err) => {
      console.log('Teacher Peer error (handled):', err);
    });
  };

  // Student Video & Audio Receiver State
  const remoteVideoRef = useRef(null);
  const studentPeerRef = useRef(null);
  const studentCallRef = useRef(null);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [isAudioMutedByBrowser, setIsAudioMutedByBrowser] = useState(true);
  const [isStudentMicActive, setIsStudentMicActive] = useState(false);
  const [studentMicStream, setStudentMicStream] = useState(null);

  // Student toggle live microphone to speak to teacher
  const toggleStudentMic = async () => {
    try {
      if (isStudentMicActive && studentMicStream) {
        studentMicStream.getTracks().forEach(t => t.stop());
        setStudentMicStream(null);
        setIsStudentMicActive(false);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStudentMicStream(stream);
        setIsStudentMicActive(true);

        // Replace audio track on WebRTC connection so teacher hears the student
        if (studentCallRef.current?.peerConnection) {
          const senders = studentCallRef.current.peerConnection.getSenders();
          const audioSender = senders.find(s => s.track && s.track.kind === 'audio') || senders[0];
          if (audioSender && stream.getAudioTracks()[0]) {
            audioSender.replaceTrack(stream.getAudioTracks()[0]);
          }
        }
      }
    } catch (e) {
      alert('يرجى السماح بصلاحيات الميكروفون للتحدث مع المعلم في الحصة!');
    }
  };

  // Student PeerJS Receiver Listener
  useEffect(() => {
    if (isTeacher || !isAdmitted || !currentSession?.id) return;

    let studentPeer = null;
    let pollInterval = null;

    const connectStudentToTeacher = () => {
      if (!window.Peer) return;
      const targetTeacherId = `elm_teacher_${currentSession.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      studentPeer = new window.Peer();
      studentPeerRef.current = studentPeer;

      studentPeer.on('open', () => {
        try {
          // Create dummy audio and video tracks to force WebRTC to negotiate BOTH video & audio
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const dst = osc.connect(ctx.createMediaStreamDestination());
          osc.start();
          const dummyAudioTrack = dst.stream.getAudioTracks()[0];
          dummyAudioTrack.enabled = false;

          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 360;
          const ctx2d = canvas.getContext('2d');
          ctx2d.fillStyle = '#181a1b';
          ctx2d.fillRect(0, 0, 640, 360);
          const canvasStream = canvas.captureStream(15);
          const dummyVideoTrack = canvasStream.getVideoTracks()[0];
          dummyVideoTrack.enabled = false;

          const initialStream = studentMicStream || new MediaStream([dummyAudioTrack, dummyVideoTrack]);

          const call = studentPeer.call(targetTeacherId, initialStream);
          studentCallRef.current = call;

          if (call) {
            call.on('stream', (teacherStream) => {
              console.log('Teacher stream received with tracks:', teacherStream.getTracks().map(t => t.kind));
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = teacherStream;
                remoteVideoRef.current.onloadedmetadata = () => {
                  remoteVideoRef.current.play().catch(e => console.log('Autoplay play error', e));
                };
                remoteVideoRef.current.play().catch(() => {});
                setHasRemoteVideo(true);
              }
            });
          }
        } catch (e) {
          console.log('Student call init error:', e);
        }
      });

      studentPeer.on('error', (err) => {
        console.log('Student peer connecting (will retry):', err.type);
      });
    };

    const initTimer = setTimeout(connectStudentToTeacher, 1000);
    pollInterval = setInterval(() => {
      if (!hasRemoteVideo) {
        connectStudentToTeacher();
      }
    }, 4000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(pollInterval);
      if (studentPeer) {
        studentPeer.destroy();
      }
    };
  }, [isTeacher, isAdmitted, currentSession?.id, hasRemoteVideo]);

  const toggleMic = () => {
    if (activeMediaStream) {
      const audioTrack = activeMediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (activeMediaStream) {
      const videoTrack = activeMediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  // In-App Live Broadcast Recording Controller
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingSavedUrl, setRecordingSavedUrl] = useState(currentSession?.recordingUrl || null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const { uploadVideoFile } = useApp();

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecordingSeconds(prev => prev + 1), 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatRecordingDuration = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = activeMediaStream || await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        setIsUploadingRecording(true);
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `live_record_${currentSession.id}.webm`, { type: 'video/webm' });

        try {
          const uploadRes = await uploadVideoFile(file);
          const finalUrl = uploadRes?.url || URL.createObjectURL(blob);
          setRecordingSavedUrl(finalUrl);
          
          // Save recording automatically to live session & lesson archive
          await adminUpdateLiveStatus(currentSession.id, currentSession.status, finalUrl);
          await refreshLiveSession(currentSession.id);
          alert('تم حفظ تسجيل الحصة تلقائياً وإضافته إلى أرشيف الحصص بنجاح! 💾🎉');
        } catch (e) {
          console.error('Auto upload error', e);
        } finally {
          setIsUploadingRecording(false);
        }
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.log('Recording cancelled or not permitted');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const stopLocalStream = () => {
    if (activeMediaStream) {
      activeMediaStream.getTracks().forEach(t => t.stop());
      setActiveMediaStream(null);
    }
    setLocalStream(false);
    setIsSharingScreen(false);
    handleStopRecording();
  };

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
        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          
          {/* Teacher Direct End Stream Button */}
          {isTeacher && currentSession?.status === 'live' && (
            <button
              onClick={async () => {
                if (window.confirm('هل أنت متأكد من إنهاء وإيقاف البث المباشر لجميع الطلاب الآن؟')) {
                  stopLocalStream();
                  await adminUpdateLiveStatus(currentSession.id, 'ended');
                  await refreshLiveSession(currentSession.id);
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md hover:scale-105 animate-pulse"
            >
              <span>⏹️ إنهاء وإيقاف البث فوراً</span>
            </button>
          )}

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
                <span>{actualViewersCount} متواجد الآن</span>
              </div>
            </div>

            {/* Teacher Admission Request Floating Banner (Google Meet Style) */}
            {isTeacher && pendingRequests.length > 0 && (
              <div className="absolute top-16 right-4 left-4 md:left-auto md:w-96 z-50 bg-slate-900/95 backdrop-blur-md border-2 border-blue-500 p-4 rounded-3xl shadow-2xl text-right animate-in slide-in-from-top space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔔</span>
                    <div>
                      <h4 className="text-xs md:text-sm font-black text-white">
                        طلب انضمام جديد ({pendingRequests.length})
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold">يريد طلاب الانضمام إلى حصتك</span>
                    </div>
                  </div>
                  {pendingRequests.length > 1 && (
                    <button
                      onClick={() => admitAllStudentsLive(currentSession.id)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl transition-all"
                    >
                      قبول الكل ✓
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-black text-white">{req.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">كود: {req.studentCode} • {req.requestedAt}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => admitStudentLive(currentSession.id, req.id, true)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-xl shadow-xs"
                        >
                          سماح ✓
                        </button>
                        <button
                          onClick={() => admitStudentLive(currentSession.id, req.id, false)}
                          className="bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-black px-2 py-1 rounded-xl"
                        >
                          رفض ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teacher Hand-Raise Alert Notification */}
            {isTeacher && currentSession?.handRaises && currentSession.handRaises.length > 0 && (
              <div className="absolute top-16 left-4 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-white">
                <span className="text-2xl">✋</span>
                <div>
                  <div className="text-xs font-black">
                    {currentSession.handRaises[currentSession.handRaises.length - 1].studentName} يرفع يده!
                  </div>
                  <div className="text-[10px] font-bold">
                    كود: {currentSession.handRaises[currentSession.handRaises.length - 1].studentCode || 'طالب'} • يريد المشاركة بالصوت
                  </div>
                </div>
              </div>
            )}

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
              
              {/* Student Not Admitted -> Show Google Meet Ask to Join / Waiting Room */}
              {!isAdmitted ? (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 text-white max-w-md animate-in fade-in">
                  {isPendingAdmission ? (
                    <>
                      <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-4xl shadow-2xl animate-pulse">
                        ⏳
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-lg md:text-xl font-black text-amber-400">جاري انتظار موافقة المعلم للدخول...</h3>
                        <p className="text-xs text-slate-300 font-bold leading-relaxed">
                          تم إرسال طلب الانضمام للمستر. ستفتح الحصة والشات فور موافقة المعلم على دخولك.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-bold px-4 py-2 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span>في غرفة الانتظار المباشرة (Waiting Lobby)</span>
                      </div>
                    </>
                  ) : isRejectedAdmission ? (
                    <>
                      <div className="w-20 h-20 rounded-3xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-4xl shadow-2xl">
                        ❌
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-black text-rose-400">تم رفض طلب الدخول</h3>
                        <p className="text-xs text-slate-300 font-bold">يرجى التواصل مع إدارة المنصة أو المستر للسماح لك بالدخول.</p>
                      </div>
                      <button
                        onClick={handleAskToJoin}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all"
                      >
                        إعادة طلب الانضمام 🔄
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-4xl shadow-2xl">
                        👋
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-black">جاهز للانضمام للحصة المباشرة؟</h3>
                        <p className="text-xs text-slate-300 font-bold">
                          المحاضر <span className="text-amber-400 font-black">{currentSession.instructor}</span> متواجد الآن في قاعة البث.
                        </p>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl w-full text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>👤 {studentDisplayName}</span>
                        <span className="font-mono text-amber-400">كود: {studentCode}</span>
                      </div>
                      <button
                        onClick={handleAskToJoin}
                        disabled={isRequestingJoin}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-sm py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                      >
                        <Radio className="w-4 h-4" />
                        <span>{isRequestingJoin ? 'جاري إرسال الطلب...' : 'طلب الانضمام للحصة (Ask to Join) 🚀'}</span>
                      </button>
                    </>
                  )}
                </div>
              ) : (currentSession.streamType === 'google_meet' || (currentSession.streamUrl && currentSession.streamUrl.includes('meet.google.com'))) ? (
                /* ====================================================
                   قاعة Google Meet المباشرة الرسمية المعتمدة
                   ==================================================== */
                <div className="relative w-full h-full min-h-[520px] flex flex-col items-center justify-center p-6 md:p-10 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white space-y-6 animate-in fade-in">
                  <div className="w-24 h-24 rounded-3xl bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center text-5xl shadow-2xl animate-pulse">
                    📹
                  </div>

                  <div className="space-y-2 max-w-lg">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black px-4 py-1.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>قاعة Google Meet المباشرة مفعلة وجاهزة ✓</span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-black text-white">
                      {currentSession.title}
                    </h2>

                    <p className="text-xs text-slate-300 font-bold leading-relaxed">
                      المحاضر: <span className="text-amber-400 font-black">{currentSession.instructor}</span> • اضغط على الزر أدناه للدخول إلى اجتماع Google Meet المباشر والتفاعل بالصوت والصورة بجودة فائقة وبدون أي تقطيع.
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl max-w-md w-full text-xs font-bold text-slate-300 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎓</span>
                      <span>{studentDisplayName}</span>
                    </div>
                    <span className="font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                      كود: {studentCode}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-3 w-full max-w-md">
                    <a
                      href={currentSession.streamUrl && currentSession.streamUrl.startsWith('http') ? currentSession.streamUrl : currentSession.streamUrl ? `https://${currentSession.streamUrl}` : 'https://meet.google.com/new'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-black text-sm py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95"
                    >
                      <Video className="w-5 h-5" />
                      <span>{isTeacher ? 'فتح وبدء قاعة Google Meet كمعلم 👨‍🏫' : 'دخول Google Meet الآن 🚀'}</span>
                    </a>
                  </div>

                  <p className="text-[11px] text-slate-400 font-bold">
                    💡 شات المنصة والأسئلة المباشرة والتصويت متاحين ومسجلين على حسابك تلقائياً.
                  </p>
                </div>
              ) : (currentSession.streamType === 'youtube_live' && currentSession.streamUrl && (currentSession.streamUrl.includes('youtube.com') || currentSession.streamUrl.includes('youtu.be') || currentSession.streamUrl.includes('vimeo.com'))) ? (
                /* External YouTube / Stream if selected */
                <iframe
                  src={formatVideoEmbedUrl(currentSession.streamUrl)}
                  title={currentSession.title}
                  className="w-full h-full object-cover border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              ) : isTeacher ? (
                /* ====================================================
                   استوديو المعلم المباشر بنظام Google Meet المدمج 100%
                   ==================================================== */
                localStream ? (
                  <div className="relative w-full h-full min-h-[520px] flex items-center justify-center bg-[#202124] overflow-hidden rounded-3xl">
                    <video
                      ref={teacherVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-contain"
                    />

                    {/* Teacher Name Tag (Google Meet Style) */}
                    <div className="absolute bottom-20 right-4 z-40 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-white text-xs font-bold">
                      <span>👨‍🏫 {studentDisplayName}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>

                    {/* Google Meet Bottom Floating Action Bar */}
                    <div className="absolute bottom-4 inset-x-4 z-40 flex items-center justify-center">
                      <div className="bg-[#202124]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2.5 shadow-2xl">
                        {/* Mic Button */}
                        <button
                          onClick={toggleMic}
                          title={isMicMuted ? 'تشغيل المايك' : 'كتم المايك'}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                            isMicMuted ? 'bg-rose-600 text-white' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'
                          }`}
                        >
                          {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>

                        {/* Camera Button */}
                        <button
                          onClick={toggleCamera}
                          title={isCameraOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                            isCameraOff ? 'bg-rose-600 text-white' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'
                          }`}
                        >
                          {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </button>

                        {/* Screen Share Button */}
                        <button
                          onClick={isSharingScreen ? stopLocalStream : startTeacherScreen}
                          title={isSharingScreen ? 'إيقاف مشاركة الشاشة' : 'مشاركة الشاشة'}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                            isSharingScreen ? 'bg-blue-600 text-white' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'
                          }`}
                        >
                          <Monitor className="w-5 h-5" />
                        </button>

                        {/* Record Button */}
                        <button
                          onClick={isRecording ? handleStopRecording : handleStartRecording}
                          title={isRecording ? 'إيقاف التسجيل' : 'تسجيل الحصة'}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                            isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-rose-500" />
                        </button>

                        {/* End Call Button */}
                        <button
                          onClick={async () => {
                            if (window.confirm('هل أنت متأكد من إنهاء المكالمة وإيقاف البث لجميع الطلاب؟')) {
                              stopLocalStream();
                              await adminUpdateLiveStatus(currentSession.id, 'ended');
                              await refreshLiveSession(currentSession.id);
                            }
                          }}
                          title="إنهاء المكالمة"
                          className="px-5 h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-lg text-xs font-black"
                        >
                          <PhoneOff className="w-4 h-4" />
                          <span className="hidden sm:inline">إنهاء الحصة</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full min-h-[520px] flex flex-col items-center justify-center p-6 md:p-10 text-center bg-[#202124] text-white space-y-6 animate-in fade-in rounded-3xl">
                    <div className="w-20 h-20 rounded-full bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center text-4xl shadow-2xl">
                      📹
                    </div>

                    <div className="space-y-2 max-w-lg">
                      <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black px-4 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>جاهز لبدء قاعة الحصة المباشرة ✓</span>
                      </div>

                      <h2 className="text-xl md:text-2xl font-black text-white">
                        {currentSession.title}
                      </h2>

                      <p className="text-xs text-slate-300 font-bold leading-relaxed">
                        المحاضر: <span className="text-amber-400 font-black">{currentSession.instructor}</span> • اضغط على الزر أدناه لبدء تشغيل الكاميرا أو مشاركة الشاشة مباشرة داخل المنصة بنظام Google Meet.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                      <button
                        onClick={startTeacherCamera}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs md:text-sm py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                      >
                        <Video className="w-5 h-5" />
                        <span>بدء بث الكاميرا والمايك 📹</span>
                      </button>

                      <button
                        onClick={startTeacherScreen}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs md:text-sm py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                      >
                        <Monitor className="w-5 h-5" />
                        <span>مشاركة الشاشة والشرح 🖥️</span>
                      </button>
                    </div>
                  </div>
                )
              ) : (
                /* ====================================================
                   واجهة الطالب بنظام Google Meet المدمج 100%
                   ==================================================== */
                <div className="relative w-full h-full min-h-[520px] flex items-center justify-center bg-[#202124] overflow-hidden rounded-3xl">
                  {/* Teacher Main Stream / Video */}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-contain ${hasRemoteVideo ? 'block' : 'hidden'}`}
                  />

                  {/* If waiting for teacher to turn on camera */}
                  {!hasRemoteVideo && (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-white space-y-4 max-w-md animate-in fade-in">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-4xl shadow-2xl animate-pulse">
                        👨‍🏫
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-lg md:text-xl font-black text-white">أنت متصل الآن بالحصة المباشرة</h3>
                        <p className="text-xs text-slate-300 font-bold leading-relaxed">
                          المحاضر: <span className="text-amber-400 font-black">{currentSession.instructor}</span> • شاشة وكاميرا المدرس ستظهر أمامك مباشرة فور بدء الشرح.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Student Audio Unmute Button for Mobile */}
                  {isAudioMutedByBrowser && (
                    <div className="absolute top-4 left-4 z-40">
                      <button
                        onClick={() => {
                          if (remoteVideoRef.current) {
                            remoteVideoRef.current.muted = false;
                            remoteVideoRef.current.play().catch(e => {});
                            setIsAudioMutedByBrowser(false);
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-pulse border border-emerald-400"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>تشغيل صوت المستر 🔊</span>
                      </button>
                    </div>
                  )}

                  {/* Teacher Name Tag (Google Meet Style) */}
                  <div className="absolute bottom-20 right-4 z-40 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-white text-xs font-bold">
                    <span>👨‍🏫 {currentSession.instructor}</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>

                  {/* Google Meet Bottom Floating Control Bar for Student */}
                  <div className="absolute bottom-4 inset-x-4 z-40 flex items-center justify-center">
                    <div className="bg-[#202124]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl">
                      {/* Raise Hand Button */}
                      <button
                        onClick={handleHandRaise}
                        title={handRaised ? 'تم إرسال طلبك' : 'رفع اليد'}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                          handRaised ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'
                        }`}
                      >
                        <Hand className="w-5 h-5" />
                      </button>

                      {/* Mic Button for Student (2-Way Speaking) */}
                      <button
                        onClick={toggleStudentMic}
                        title={isStudentMicActive ? 'كتم المايك' : 'تشغيل المايك والتحدث مع المعلم'}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                          isStudentMicActive ? 'bg-emerald-600 text-white animate-pulse shadow-lg' : 'bg-[#3c4043] hover:bg-[#4a4e51] text-white'
                        }`}
                      >
                        {isStudentMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-rose-400" />}
                      </button>

                      {/* Leave Meeting Button */}
                      <button
                        onClick={onBack}
                        title="مغادرة الاجتماع"
                        className="px-5 h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-lg text-xs font-black"
                      >
                        <PhoneOff className="w-4 h-4" />
                        <span>مغادرة</span>
                      </button>
                    </div>
                  </div>
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

            {/* ═══ Bottom Stream Status & Actions Bar ═══ */}
            <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 z-30 flex flex-wrap items-center justify-between gap-3">
              
              {/* Left / Teacher Studio End Stream & Recording Indicator */}
              <div className="flex flex-wrap items-center gap-2">
                {isTeacher && (
                  <button
                    onClick={async () => {
                      if (window.confirm('هل أنت متأكد من إنهاء وإيقاف البث المباشر لجميع الطلاب الآن؟')) {
                        stopLocalStream();
                        await adminUpdateLiveStatus(currentSession.id, 'ended');
                        await refreshLiveSession(currentSession.id);
                      }
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5 hover:scale-105"
                  >
                    <span>⏹️ إنهاء وإيقاف البث لجميع الطلاب</span>
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
                      <span>بدء وفتح قاعة الفيديو (مثل Zoom) الآن 🔴</span>
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
                      const isMsgTeacher = msg.senderRole === 'teacher';
                      return (
                        <div
                          key={msg.id}
                          className={`p-2.5 rounded-2xl text-xs space-y-1 transition-all ${
                            isMsgTeacher 
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
