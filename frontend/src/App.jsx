import React, { useState } from 'react';
import {
  LayoutDashboard, FileText, User, Settings,
  HelpCircle, Archive, Sun, Moon, Briefcase, X,
  ShieldCheck, Menu,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ScanSession    from './pages/ScanSession';
import ResumeBuilder  from './pages/ResumeBuilder';
import DashboardHub   from './pages/DashboardHub';
import ProfileBuilder from './pages/ProfileBuilder';
import JobMatching    from './pages/JobMatching';
import DraftsHub      from './pages/DraftsHub';
import { UserProvider, useUser } from './context/UserContext';
import './index.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'resumes',   label: 'ATS Scanner',    icon: ShieldCheck },
  { id: 'builder',   label: 'Resume Builder', icon: Settings },
  { id: 'profile',   label: 'Profile',        icon: User },
  { id: 'drafts',    label: 'Drafts',         icon: Archive },
  { id: 'matching',  label: 'Job Matching',   icon: Briefcase },
];

const PAGE_META = {
  dashboard: { title: 'Dashboard',       subtitle: 'Career intelligence at a glance' },
  resumes:   { title: 'ATS Resume Scanner', subtitle: 'AI-powered resume analysis & interview prep' },
  builder:   { title: 'Resume Builder',  subtitle: 'Create ATS-friendly resumes with AI' },
  profile:   { title: 'Profile',         subtitle: 'Manage your career profile' },
  drafts:    { title: 'Drafts',          subtitle: 'Your saved resume drafts' },
  matching:  { title: 'Job Matching',    subtitle: 'Find roles that match your skills' },
};

function Sidebar({ activeTab, setActiveTab, isDark, toggleDark, profile, loading, isOpen }) {
  const initials = loading ? '…'
    : profile?.full_name
      ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : 'AC';

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-slate-200 dark:border-slate-700/60 bg-white dark:bg-surface-900 z-20 transition-all duration-300 overflow-hidden whitespace-nowrap ${
        isOpen ? 'w-64 lg:w-72 opacity-100' : 'w-0 opacity-0 border-r-0'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 shadow-glow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C5.47 2 4.96 2.21 4.59 2.59C4.21 2.96 4 3.47 4 4V20C4 20.53 4.21 21.04 4.59 21.41C4.96 21.79 5.47 22 6 22H18C18.53 22 19.04 21.79 19.41 21.41C19.79 21.04 20 20.53 20 20V8L14 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 13H15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 17H13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="18" cy="18" r="4" fill="#a78bfa"/>
            <path d="M16.5 18L17.5 19L19.5 17" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">
            ResuScan <span className="text-primary italic">AI</span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">Career Intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="section-label px-3 mb-2">Main Menu</p>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`nav-item w-full text-left ${activeTab === id ? 'active' : ''}`}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* User + Theme */}
      <div className="border-t border-slate-100 dark:border-slate-700/60 p-3 space-y-2">
        <button
          onClick={toggleDark}
          className="btn btn-ghost w-full justify-start text-xs"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <div
          className="flex items-center gap-3 rounded-xl p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          onClick={() => setActiveTab('profile')}
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white text-xs font-bold shadow">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {loading ? 'Loading…' : (profile?.full_name || 'Alex Mercer')}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {loading ? '…' : (profile?.headline || 'Pro Plan')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  const items = NAV_ITEMS.slice(0, 5);
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 pb-safe">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex flex-col items-center gap-0.5 px-2 py-2.5 flex-1 text-[10px] font-medium transition-colors ${
            activeTab === id
              ? 'text-primary dark:text-primary-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 1.75} />
          <span>{label.split(' ')[0]}</span>
        </button>
      ))}
    </nav>
  );
}

function InfoModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg animate-fade-in dark:bg-surface-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">How ResuScan AI Works</h2>
          <button onClick={onClose} className="btn btn-ghost p-1.5"><X size={18} /></button>
        </div>
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {[
            ['🤖 Intelligent Analysis', 'Groq AI reads your resume like a human recruiter — checking formatting, skill density, and quantifiable impact.'],
            ['🔒 Privacy First', 'We do NOT permanently store your resume data. Analysis is real-time; results stay in your browser.'],
            ['📋 Actionable Feedback', 'Instead of just a score, we give specific fixes and interview tips tailored to your resume.'],
            ['✍️ Resume Builder', 'Build stunning, ATS-optimised resumes with AI-powered bullet rewrites and summary refinement.'],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-3">
              <span className="text-base">{title.split(' ')[0]}</span>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">{title.slice(3)}</p>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary w-full mt-6" onClick={onClose}>Got it!</button>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clearTrigger, setClearTrigger]   = useState(0);
  const [loadedDraft, setLoadedDraft]     = useState(null);
  const [isDark, setIsDark]               = useState(false);
  const [showInfo, setShowInfo]           = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { profile, loading } = useUser();

  const toggleDark = () => {
    setIsDark(v => !v);
    document.documentElement.classList.toggle('dark');
  };

  const meta = PAGE_META[activeTab] || { title: activeTab, subtitle: '' };

  return (
    <div className={`flex min-h-screen w-full ${isDark ? 'dark' : ''}`}>
      <Sidebar
        activeTab={activeTab} setActiveTab={setActiveTab}
        isDark={isDark} toggleDark={toggleDark}
        profile={profile} loading={loading}
        isOpen={isSidebarOpen}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-slate-50 dark:bg-surface-950">
        {/* Top header */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700/60 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md px-4 md:px-6 py-3.5">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">
              {meta.title}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block mt-0.5">{meta.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="btn btn-ghost p-2 hidden md:flex" onClick={() => setIsSidebarOpen(v => !v)} title="Toggle Sidebar">
              <Menu size={17} />
            </button>
            <button className="btn btn-ghost p-2 hidden md:flex" onClick={toggleDark} title="Toggle theme">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button className="btn btn-ghost p-2" onClick={() => setShowInfo(true)} title="About">
              <HelpCircle size={17} />
            </button>
            {activeTab === 'resumes' && (
              <button
                className="btn btn-outline text-xs px-3 py-2"
                onClick={() => setClearTrigger(t => t + 1)}
              >
                Clear
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="w-full"
            >
              {activeTab === 'dashboard' && <DashboardHub setActiveTab={setActiveTab} />}
              {activeTab === 'profile'   && <ProfileBuilder />}
              {activeTab === 'resumes'   && <ScanSession clearTrigger={clearTrigger} setActiveTab={setActiveTab} />}
              {activeTab === 'builder'   && <ResumeBuilder loadedDraft={loadedDraft} setLoadedDraft={setLoadedDraft} />}
              {activeTab === 'drafts'    && <DraftsHub setActiveTab={setActiveTab} setLoadedDraft={setLoadedDraft} />}
              {activeTab === 'matching'  && <JobMatching />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Info modal */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
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
