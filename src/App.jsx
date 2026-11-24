import React, { useState, Component } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppModal } from './components/WhatsAppModal';
import { AIChatbot } from './components/AIChatbot';
import { LoginView } from './views/LoginView';
import { HomeView } from './views/HomeView';
import { LessonView } from './views/LessonView';
import { ExamView } from './views/ExamView';
import { WalletView } from './views/WalletView';
import { GamificationView } from './views/GamificationView';
import { AdminView } from './views/AdminView';
import { ParentView } from './views/ParentView';
import { LiveView } from './views/LiveView';
import { NotificationBanner } from './components/NotificationBanner';
import { initSecurityShield } from './utils/securityShield';

initSecurityShield();

// Error Boundary to prevent crashes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Platform Error Catch:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl font-black">
            💻
          </div>
          <h2 className="text-2xl font-black text-white">منصة منصة عِلم التعليمية - حدث تنبيه بسيط</h2>
          <p className="text-xs text-slate-400 max-w-md">
            تم استعادة المنصة تلقائياً. اضغط على الزر أدناه لإعادة تنشيط الصفحة والمتابعة بنجاح!
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="btn-accent text-xs font-black px-6 py-3 rounded-xl shadow-lg"
          >
            إعادة تحميل المنصة الآن 🚀
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const MainContent = () => {
  const { 
    isAuthenticated, 
    isDemoMode,
    logoutUser,
    userRole,
    currentTab,
    setCurrentTab,
    selectedLessonId,
    setSelectedLessonId,
    selectedLiveId,
    setSelectedLiveId,
    goBack
  } = useApp();

  // Check URL params for direct live link entry (?live=...)
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const liveParam = params.get('live');
      if (liveParam) {
        setSelectedLiveId(liveParam);
        setCurrentTab('live');
      }
    } catch (e) {
      console.error('URL param parse error:', e);
    }
  }, []);

  React.useEffect(() => {
    if (userRole === 'parent' && currentTab !== 'parent-view') {
      setCurrentTab('parent-view');
    }
  }, [userRole, currentTab]);

  // Dynamic per-route SEO title, description, canonical & robots
  React.useEffect(() => {
    const seoMap = {
      home: {
        title: 'منصة عِلم التعليمية | دروس أونلاين، بث مباشر تفاعلي، وامتحانات إلكترونية',
        desc: 'منصة عِلم التعليمية — أفضل منصة تعليمية متكاملة في مصر للطلاب والمدرسين: حصص مسجلة، بث مباشر، امتحانات فورية، ومساعد ذكاء اصطناعي.',
        robots: 'index, follow'
      },
      lessons: {
        title: 'الحصص والدروس المسجلة | منصة عِلم التعليمية',
        desc: 'تصفح الحصص والمحاضرات المسجلة والملخصات لجميع الصفوف الدراسية على منصة عِلم.',
        robots: 'index, follow'
      },
      'lesson-detail': {
        title: 'مشاهدة الحصة | منصة عِلم التعليمية',
        desc: 'مشاهدة الحصة التعليمية مع الأسئلة التفاعلية ومساعد الذكاء الاصطناعي على منصة عِلم.',
        robots: 'index, follow'
      },
      exams: {
        title: 'الامتحانات الإلكترونية | منصة عِلم التعليمية',
        desc: 'اختبارات إلكترونية تفاعلية بتصحيح فوري وشرح الإجابات على منصة عِلم التعليمية.',
        robots: 'index, follow'
      },
      live: {
        title: 'البث المباشر التفاعلي | منصة عِلم التعليمية',
        desc: 'قاعة البث المباشر التفاعلية بنظام Google Meet مع السبورة التفاعلية والدردشة الحية.',
        robots: 'index, follow'
      },
      leaderboard: {
        title: 'لوحة الشرف وأوائل الطلاب | منصة عِلم التعليمية',
        desc: 'قائمة أوائل الطلاب المتفوقين ونقاط التميز على منصة عِلم التعليمية.',
        robots: 'index, follow'
      },
      wallet: {
        title: 'المحفظة والاشتراكات | منصة عِلم التعليمية',
        desc: 'إدارة رصيد المحفظة وتفعيل أكواد الشحن والاشتراكات الشهرية والسنوية.',
        robots: 'noindex, nofollow'
      },
      'parent-view': {
        title: 'بوابة متابعة ولي الأمر | منصة عِلم التعليمية',
        desc: 'متابعة حضور الطالب ودرجات الامتحانات وتفاصيل الاشتراكات.',
        robots: 'noindex, nofollow'
      },
      admin: {
        title: 'لوحة إدارة المعلم | منصة عِلم التعليمية',
        desc: 'لوحة تحكم المعلم لإدارة الحصص، البث المباشر، الطلاب، والمدفوعات.',
        robots: 'noindex, nofollow'
      }
    };

    const info = seoMap[currentTab] || seoMap.home;
    document.title = info.title;
    const setMeta = (selector, attr, val) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', 'content', info.desc);
    setMeta('meta[name="robots"]', 'content', info.robots);
    setMeta('meta[property="og:title"]', 'content', info.title);
    setMeta('meta[property="og:description"]', 'content', info.desc);
    setMeta('link[rel="canonical"]', 'href', window.location.origin + window.location.pathname);
  }, [currentTab]);

  // Forced Login Entry Screen if not authenticated
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* In-App Notification Popup for Students */}
      <NotificationBanner 
        setCurrentTab={setCurrentTab} 
        setSelectedLiveId={setSelectedLiveId} 
      />

      {/* Top Header Navigation */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        setSelectedLiveId={setSelectedLiveId} 
        setSelectedLessonId={setSelectedLessonId} 
      />

      {/* Interactive Visitor / Teacher Demo Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-l from-amber-500 via-orange-500 to-amber-500 text-slate-950 px-4 py-2 text-xs sm:text-sm font-black shadow-md">
          <div className="container flex flex-wrap items-center justify-between gap-2">
            <span>👀 أنت تتصفح الآن <strong>وضع المعاينة التفاعلية الحية</strong> — جرّب الحصص، المجلدات، البث المباشر، الامتحانات، المحفظة، والمساعد الذكي بنفسك!</span>
            <button
              onClick={logoutUser}
              className="bg-slate-950 text-amber-300 hover:bg-slate-900 px-3.5 py-1.5 rounded-xl text-xs font-black transition shadow"
            >
              تسجيل الدخول / إنشاء حساب حقيقي 🚀
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace View */}
      <main className="flex-1 container pt-6">
        
        {currentTab === 'home' && (
          <HomeView 
            setCurrentTab={setCurrentTab} 
            setSelectedLessonId={setSelectedLessonId}
            setSelectedLiveId={setSelectedLiveId}
          />
        )}

        {currentTab === 'live' && (
          <LiveView
            selectedLiveId={selectedLiveId}
            onBack={goBack}
            onSelectLive={(id) => setSelectedLiveId(id)}
          />
        )}

        {(currentTab === 'lessons' || currentTab === 'lesson-detail') && (
          <LessonView 
            lessonId={selectedLessonId} 
            setCurrentTab={setCurrentTab} 
            setSelectedLessonId={setSelectedLessonId} 
          />
        )}

        {currentTab === 'exams' && (
          <ExamView setCurrentTab={setCurrentTab} />
        )}

        {currentTab === 'wallet' && (
          <WalletView />
        )}

        {currentTab === 'leaderboard' && (
          <GamificationView />
        )}

        {currentTab === 'parent-view' && (
          <ParentView />
        )}

        {currentTab === 'admin' && (
          <AdminView 
            setCurrentTab={setCurrentTab} 
            setSelectedLessonId={setSelectedLessonId} 
            setSelectedLiveId={setSelectedLiveId}
          />
        )}

      </main>

      {/* Interactive WhatsApp Modal */}
      <WhatsAppModal />

      {/* AI Assistant Chatbot */}
      <AIChatbot />

      {/* Footer Section */}
      <Footer setCurrentTab={setCurrentTab} />

    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
