import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { LessonView } from './views/LessonView';
import { ExamView } from './views/ExamView';
import { WalletView } from './views/WalletView';
import { GamificationView } from './views/GamificationView';
import { ParentView } from './views/ParentView';
import { AdminDashboard } from './views/AdminDashboard';
import { AIChatbot } from './components/AIChatbot';
import { WhatsAppModal } from './components/WhatsAppModal';
import { NotificationBanner } from './components/NotificationBanner';
import { LoginView } from './views/LoginView';

// Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-2xl font-black">⚠️</div>
          <h2 className="text-xl font-bold">حدث خطأ غير متوقع في الواجهة</h2>
          <p className="text-xs text-slate-400 max-w-md">{this.state.error?.message || 'يرجى إعادة تحميل الصفحة أو التأكد من إدخال البيانات بشكل صحيح.'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-accent px-6 py-2 rounded-xl text-xs font-bold"
          >
            إعادة تحميل الصفحة 🔄
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const MainContent = () => {
  const { isAuthenticated, userRole } = useApp();
  const [currentTab, setCurrentTab] = useState(userRole === 'parent' ? 'parent-view' : 'home');
  const [selectedLessonId, setSelectedLessonId] = useState('');

  React.useEffect(() => {
    if (userRole === 'parent' && currentTab !== 'parent-view') {
      setCurrentTab('parent-view');
    }
  }, [userRole, currentTab]);

  // Handle direct course opening after login from landing showcase
  React.useEffect(() => {
    if (isAuthenticated) {
      const pendingCourse = localStorage.getItem('elm_target_course');
      if (pendingCourse) {
        setSelectedLessonId(pendingCourse);
        setCurrentTab('lesson-detail');
        localStorage.removeItem('elm_target_course');
      }
    }
  }, [isAuthenticated]);

  // Forced Login Entry Screen if not authenticated
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* In-App Notification Popup for Students */}
      <NotificationBanner />

      {/* Top Header Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Workspace View */}
      <main className="flex-1 container pt-6">
        
        {currentTab === 'home' && (
          <HomeView 
            setCurrentTab={setCurrentTab} 
            setSelectedLessonId={setSelectedLessonId} 
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
          <AdminDashboard />
        )}

      </main>

      {/* Persistent AI Smart Assistant Chatbot Widget */}
      <AIChatbot />

      {/* WhatsApp Official Report Delivery Modal */}
      <WhatsAppModal />

      {/* Unified Footer */}
      <Footer setCurrentTab={setCurrentTab} />

    </div>
  );
};

export const App = () => {
  return (
    <ErrorBoundary>
      <MainContent />
    </ErrorBoundary>
  );
};

export default App;
