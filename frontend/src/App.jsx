import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Settings, 
  HelpCircle,
  Bell,
  Archive,
  Sun,
  Moon,
  Briefcase
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ScanSession from './pages/ScanSession';
import ResumeBuilder from './pages/ResumeBuilder';
import DashboardHub from './pages/DashboardHub';
import ProfileBuilder from './pages/ProfileBuilder';
import JobMatching from './pages/JobMatching';
import DraftsHub from './pages/DraftsHub';
import { UserProvider, useUser } from './context/UserContext';
import './App.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clearTrigger, setClearTrigger] = useState(0);
  const [loadedDraft, setLoadedDraft] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'system', text: 'Gemini 1.5 Flash integrated for faster scans.', bold: 'System Update:' },
    { id: 2, type: 'tip', text: 'Try the new "Refine with AI" feature in Builder!', bold: 'Tip:' }
  ]);

  const handleClearNotifications = () => {
    setNotifications([]);
  };
  const [showInfo, setShowInfo] = useState(false);
  const { profile, loading } = useUser();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getInitials = () => {
    if (loading) return "...";
    if (profile && profile.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    return "AC";
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resumes', label: 'Resumes', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'builder', label: 'Resume Builder', icon: Settings },
    { id: 'drafts', label: 'Drafts', icon: Archive },
    { id: 'matching', label: 'Job Matching', icon: Briefcase },
  ];

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 13H15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M9 17H13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="4" fill="#a78bfa"/>
              <path d="M16.5 18L17.5 19L19.5 17" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="logo-text">
            <h2>ResuScan <span style={{color:'var(--primary)', fontStyle:'italic'}}>AI</span></h2>
            <p>Career Intelligence</p>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map(item => (
            <a 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="user-profile-mini">
          <div className="user-avatar" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: '40px', height: '40px' }}>
            {getInitials()}
          </div>
          <div className="user-info">
            <p>{loading ? "Loading..." : (profile?.full_name || "Alex Mercer")}</p>
            <span>{loading ? "..." : (profile?.headline || "Pro Plan")}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div>
            {activeTab === 'resumes' ? (
              <>
                <h1>New Scan Session</h1>
                <p>Upload resumes and define criteria to rank candidates.</p>
              </>
            ) : (
              <>
                <h1>{navItems.find(i => i.id === activeTab)?.label}</h1>
                <p>Welcome to your ResuScan dashboard.</p>
              </>
            )}
          </div>
          <div className="header-actions">
            {/* Theme Toggle */}
            <button className="btn btn-outline" onClick={toggleDarkMode} title="Toggle Theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button className="btn btn-outline" onClick={() => setShowNotifications(!showNotifications)} title="Notifications">
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--danger)', color: 'white', fontSize: '10px', padding: '2px 5px', borderRadius: '10px', border: '2px solid var(--card-bg)' }}>
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="card animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '10px', width: '300px', zIndex: 100, boxShadow: 'var(--shadow-lg)' }}>
                  <div className="flex-between" style={{ marginBottom: '10px' }}>
                    <h4 style={{ margin: 0 }}>Notifications</h4>
                    {notifications.length > 0 && (
                      <button 
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={handleClearNotifications}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} style={{ fontSize: '0.85rem', padding: '8px', borderRadius: '6px', background: 'var(--secondary)' }}>
                        <b>{n.bold}</b> {n.text}
                      </div>
                    )) : (
                      <p style={{ fontSize: '0.85rem', textAlign: 'center', padding: '10px' }}>No new notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <button className="btn btn-outline" onClick={() => setShowInfo(true)} title="About App">
              <HelpCircle size={20} />
            </button>

            {activeTab === 'resumes' && (
               <button className="btn btn-outline" onClick={() => setClearTrigger(t => t + 1)}>Clear All</button>
            )}
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardHub setActiveTab={setActiveTab} />}
              {activeTab === 'profile' && <ProfileBuilder />}
              {activeTab === 'resumes' && <ScanSession clearTrigger={clearTrigger} setActiveTab={setActiveTab} />}
              {activeTab === 'builder' && <ResumeBuilder loadedDraft={loadedDraft} setLoadedDraft={setLoadedDraft} />}
              {activeTab === 'drafts' && <DraftsHub setActiveTab={setActiveTab} setLoadedDraft={setLoadedDraft} />}
              {activeTab === 'matching' && <JobMatching />}
              {activeTab !== 'dashboard' && activeTab !== 'profile' && activeTab !== 'resumes' && activeTab !== 'builder' && activeTab !== 'matching' && activeTab !== 'drafts' && (
                <div className="card">
                  <p>This view is under construction.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Info Modal */}
        {showInfo && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }} onClick={() => setShowInfo(false)}>
            <div className="card animate-fade-in" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '1.5rem' }}>How ResuScan AI Works</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', color: 'var(--text-main)' }}>
                <p><b>1. Intelligent Analysis:</b> Our app uses Google Gemini AI to read your resume like a human recruiter would. It looks for formatting, skill density, and quantifiable impact.</p>
                <p><b>2. Privacy First:</b> We do NOT store your personal resume data permanently on our servers. Analysis is performed in real-time, and results are only saved locally in your browser (Drafts) or exported by you.</p>
                <p><b>3. Actionable Feedback:</b> Instead of just a score, we provide specific errors and improvement tips to help you pass through ATS filters and catch the eye of recruiters.</p>
                <p><b>4. Resume Builder:</b> Create stunning, professional resumes using industry-vetted templates and AI-powered summary refinement.</p>
              </div>
              <button className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }} onClick={() => setShowInfo(false)}>Got it!</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
