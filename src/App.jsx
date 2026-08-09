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
import { NotificationBanner } from './components/NotificationBanner';

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
          <h2 className="text-2xl font-black text-white">منصة الباشمهندس للبرمجة - حدث تنبيه بسيط</h2>
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
  const { isAuthenticated } = useApp();
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedLessonId, setSelectedLessonId] = useState('');

  // Forced Login Entry Screen if not authenticated
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      
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

        {currentTab === 'parent-view' && (
          <ParentView />
        )}

        {currentTab === 'admin' && (
          <AdminView 
            setCurrentTab={setCurrentTab} 
            setSelectedLessonId={setSelectedLessonId} 
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
