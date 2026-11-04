import React, { useState } from 'react';
import {
  LayoutDashboard, FileText, User, Settings,
  HelpCircle, Archive, Sun, Moon, Briefcase, X,
  ShieldCheck, Menu, GraduationCap, Scale, Shield, Cookie,
  RefreshCw,
} from 'lucide-react';
import ScanSession    from './pages/ScanSession';
import ResumeBuilder  from './pages/ResumeBuilder';
import DashboardHub   from './pages/DashboardHub';
import ProfileBuilder from './pages/ProfileBuilder';
import JobMatching    from './pages/JobMatching';
import DraftsHub      from './pages/DraftsHub';
import InterviewPrep  from './pages/InterviewPrep';
import PrivacyPolicy  from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import CookiePolicy   from './pages/CookiePolicy';
import RefundPolicy   from './pages/RefundPolicy';
import ErrorPage      from './pages/ErrorPage';
import CookieConsent  from './components/CookieConsent';
import { UserProvider, useUser } from './context/UserContext';
import { getCookie, setCookie } from './utils/cookieUtils';
import './index.css';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'resumes',    label: 'ATS Scanner',     icon: ShieldCheck },
  { id: 'builder',    label: 'Resume Builder',  icon: Settings },
  { id: 'profile',    label: 'Profile',         icon: User },
  { id: 'drafts',     label: 'Drafts',          icon: Archive },
  { id: 'matching',   label: 'Job Matching',    icon: Briefcase },
  { id: 'interview',  label: 'Interview Prep',  icon: GraduationCap },
];

const LEGAL_NAV = [
  { id: 'privacy',  label: 'Privacy Policy',  icon: Shield },
  { id: 'terms',    label: 'Terms & Conditions', icon: Scale },
  { id: 'cookies',  label: 'Cookie Policy',   icon: Cookie },
  { id: 'refund',   label: 'Refund Policy',   icon: RefreshCw },
];

const PAGE_META = {
  dashboard:  { title: 'Dashboard',            subtitle: 'Career intelligence at a glance' },
  resumes:    { title: 'ATS Resume Scanner',   subtitle: 'AI-powered resume analysis & interview prep' },
  builder:    { title: 'Resume Builder',       subtitle: 'Create ATS-friendly resumes with AI' },
  profile:    { title: 'Profile',              subtitle: 'Manage your career profile' },
  drafts:     { title: 'Drafts',               subtitle: 'Your saved resume drafts' },
  matching:   { title: 'Job Matching',         subtitle: 'Find roles that match your skills' },
  interview:  { title: 'Interview Prep',       subtitle: 'Practice questions & mock tests for your dream role' },
  privacy:    { title: 'Privacy Policy',       subtitle: 'How we handle your data' },
  terms:      { title: 'Terms & Conditions',   subtitle: 'Rules for using ResuScan AI' },
  cookies:    { title: 'Cookie Policy',        subtitle: 'How we use cookies and storage' },
  refund:     { title: 'Refund Policy',        subtitle: 'Payment and refund information' },
};

function Sidebar({ activeTab, setActiveTab, isDark, toggleDark, profile, loading, isOpen }) {
  const initials = loading ? '…'
    : (typeof profile?.full_name === 'string' && profile.full_name.trim())
      ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : '?';

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 z-20 transition-all duration-300 overflow-hidden whitespace-nowrap ${
        isOpen ? 'w-64 lg:w-72 opacity-100' : 'w-0 opacity-0 border-r-0'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
            ResuScan <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">Career Intelligence</p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Main menu">
        <p className="section-label px-3 mb-2">Main Menu</p>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`nav-${id}`}
            onClick={() => setActiveTab(id)}
            aria-current={activeTab === id ? 'page' : undefined}
            className={`nav-item w-full text-left ${activeTab === id ? 'active' : ''}`}
          >
            <Icon size={18} className="flex-shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}

        {/* Legal section */}
        <div className="pt-4">
          <p className="section-label px-3 mb-2">Legal</p>
          {LEGAL_NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`nav-item w-full text-left ${activeTab === id ? 'active' : ''}`}
            >
              <Icon size={16} className="flex-shrink-0 opacity-70" aria-hidden="true" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* User + Theme */}
      <div className="border-t border-slate-100 dark:border-slate-800 p-3 space-y-2">
        <button
          onClick={toggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="btn btn-ghost w-full justify-start text-xs"
        >
          {isDark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <div
          className="flex items-center gap-3 rounded-xl p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          role="button"
          tabIndex={0}
          aria-label="Go to profile"
          onClick={() => setActiveTab('profile')}
          onKeyDown={e => e.key === 'Enter' && setActiveTab('profile')}
        >
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold shadow"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {loading ? 'Loading…' : (profile?.full_name || 'Guest User')}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {loading ? '…' : (profile?.headline || 'No profile yet')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  const items = NAV_ITEMS.slice(0, 6);
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pb-safe"
      aria-label="Mobile navigation"
    >
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          id={`bottom-nav-${id}`}
          onClick={() => setActiveTab(id)}
          aria-current={activeTab === id ? 'page' : undefined}
          aria-label={label}
          className={`flex flex-col items-center gap-0.5 px-2 py-2.5 flex-1 text-[10px] font-medium transition-colors ${
            activeTab === id
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 1.75} aria-hidden="true" />
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
      role="dialog"
      aria-modal="true"
      aria-label="How ResuScan AI works"
    >
      <div
        className="card w-full max-w-lg animate-fade-in dark:bg-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">How ResuScan AI Works</h2>
          <button onClick={onClose} className="btn btn-ghost p-1.5" aria-label="Close dialog">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {[
            ['🤖 Intelligent Analysis', 'Groq AI reads your resume like a human recruiter — checking formatting, skill density, and quantifiable impact.'],
            ['📷 Image & OCR Support', 'Upload scanned PDFs or images of resumes — our OCR engine extracts text automatically.'],
            ['🔒 Privacy First', 'We do NOT permanently store your resume data. Analysis is real-time; results stay in your browser.'],
            ['📋 Actionable Feedback', 'Instead of just a score, we give specific fixes and interview tips tailored to your resume.'],
            ['✍️ Resume Improvement', 'AI fixes grammar, boosts impact, and makes your resume professional — download the improved version.'],
            ['🎓 Interview Prep', 'Practice with AI-generated questions, mock tests, and detailed explanations for your dream role.'],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-3">
              <span className="text-base" aria-hidden="true">{title.split(' ')[0]}</span>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">{title.slice(3)}</p>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 space-y-1">
          <p>⚠️ AI analysis is for guidance only — not professional career advice.</p>
          <p>📧 Business contact: <a href="mailto:hello@resuscan.ai" className="text-indigo-600 dark:text-indigo-400 underline">hello@resuscan.ai</a></p>
        </div>
        <button className="btn btn-primary w-full mt-5" onClick={onClose} id="info-modal-close-btn">
          Got it!
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clearTrigger, setClearTrigger]   = useState(0);
  const [loadedDraft, setLoadedDraft]     = useState(null);
  const [isDark, setIsDark]               = useState(() => {
    const cookieTheme = getCookie('resuscan_theme');
    if (cookieTheme) return cookieTheme === 'dark';
    try {
      return localStorage.getItem('resuscan_theme') === 'dark';
    } catch {
      return false;
    }
  });
  const [showInfo, setShowInfo]           = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { profile, loading } = useUser();

  const toggleDark = () => {
    setIsDark(v => {
      const next = !v;
      setCookie('resuscan_theme', next ? 'dark' : 'light', 365);
      try { localStorage.setItem('resuscan_theme', next ? 'dark' : 'light'); } catch {}
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

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
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950">
        {/* Top header */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 md:px-6 py-3.5">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">
              {meta.title}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block mt-0.5">{meta.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              className="btn btn-ghost p-2 hidden md:flex"
              onClick={() => setIsSidebarOpen(v => !v)}
              aria-label="Toggle sidebar"
              id="toggle-sidebar-btn"
            >
              <Menu size={17} aria-hidden="true" />
            </button>
            <button
              className="btn btn-ghost p-2 hidden md:flex"
              onClick={toggleDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              id="toggle-theme-btn"
            >
              {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
            </button>
            <button
              className="btn btn-ghost p-2"
              onClick={() => setShowInfo(true)}
              aria-label="About ResuScan AI"
              id="show-info-btn"
            >
              <HelpCircle size={17} aria-hidden="true" />
            </button>
            {activeTab === 'resumes' && (
              <button
                className="btn btn-outline text-xs px-3 py-2"
                onClick={() => setClearTrigger(t => t + 1)}
                id="clear-scan-btn"
                aria-label="Clear resume scan"
              >
                Clear
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 px-4 md:px-6 lg:px-8 py-6 pb-28 md:pb-12 max-w-7xl w-full mx-auto">
          <div key={activeTab} className="w-full">
            {activeTab === 'dashboard' && <DashboardHub setActiveTab={setActiveTab} />}
            {activeTab === 'profile'   && <ProfileBuilder />}
            {activeTab === 'resumes'   && <ScanSession clearTrigger={clearTrigger} setActiveTab={setActiveTab} />}
            {activeTab === 'builder'   && <ResumeBuilder loadedDraft={loadedDraft} setLoadedDraft={setLoadedDraft} />}
            {activeTab === 'drafts'    && <DraftsHub setActiveTab={setActiveTab} setLoadedDraft={setLoadedDraft} />}
            {activeTab === 'matching'  && <JobMatching />}
            {activeTab === 'interview' && <InterviewPrep />}
            {activeTab === 'privacy'   && <PrivacyPolicy onBack={setActiveTab} />}
            {activeTab === 'terms'     && <TermsConditions />}
            {activeTab === 'cookies'   && <CookiePolicy />}
            {activeTab === 'refund'    && <RefundPolicy />}
            {!['dashboard','profile','resumes','builder','drafts','matching','interview','privacy','terms','cookies','refund'].includes(activeTab) && (
              <ErrorPage
                code={404}
                title="Section Not Found"
                message={`The section "${activeTab}" could not be located.`}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            )}
          </div>
        </div>

        {/* Footer with legal links */}
        <footer className="hidden md:block border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4" role="contentinfo">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} ResuScan AI · Registered in India · AI analysis is for guidance only, not professional career advice.
            </p>
            <nav aria-label="Legal links" className="flex flex-wrap items-center gap-4">
              {LEGAL_NAV.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                >
                  {label}
                </button>
              ))}
              <a
                href="mailto:hello@resuscan.ai"
                className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
              >
                Contact
              </a>
            </nav>
          </div>
        </footer>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Info modal */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      {/* Cookie consent banner */}
      <CookieConsent onViewPolicy={setActiveTab} />
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
