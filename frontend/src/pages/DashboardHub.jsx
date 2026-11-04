import React from 'react';
import { useUser } from '../context/UserContext';
import { FileText, Briefcase, ArrowRight, Lightbulb, ShieldCheck, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    id: 'resumes',
    title: 'ATS Resume Scanner',
    desc: 'AI reads every line — scores it, finds gaps, and provides actionable improvements.',
    icon: ShieldCheck,
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    stat: 'PDF, DOCX & images',
  },
  {
    id: 'builder',
    title: 'AI Resume Builder',
    desc: 'Create ATS-friendly resumes with professional templates and instant AI bullet rewrites.',
    icon: FileText,
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
    stat: '14 templates',
  },
  {
    id: 'matching',
    title: 'Job Matching',
    desc: 'AI-suggested roles matched to your detected skills with direct LinkedIn & Naukri search links.',
    icon: Briefcase,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    stat: 'LinkedIn & Naukri',
  },
  {
    id: 'interview',
    title: 'Interview Prep',
    desc: 'Practice technical & behavioral questions, take timed MCQ mock tests, and get real-time feedback.',
    icon: GraduationCap,
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    stat: 'Mock tests included',
  },
];

const stats = [
  { label: 'Resume Templates', value: '14', icon: FileText,      color: 'text-emerald-500' },
  { label: 'Interview Topics',  value: '4',  icon: GraduationCap, color: 'text-violet-500'  },
  { label: 'Company Types',     value: '6',  icon: Briefcase,     color: 'text-blue-500'    },
  { label: 'Input Formats',     value: '4',  icon: ShieldCheck,   color: 'text-amber-500'   },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

export default function DashboardHub({ setActiveTab }) {
  const { profile } = useUser();
  const firstName = (typeof profile?.full_name === 'string') ? profile.full_name.split(' ')[0] : '';

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Hero — clean solid indigo, high contrast, no gradients */}
      <div className="rounded-2xl bg-indigo-600 p-6 md:p-8 text-white shadow-sm">
        <p className="text-sm font-medium text-indigo-200 mb-1">Welcome back</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {firstName ? (
            <>Hello, <span className="text-indigo-100">{firstName}</span>!</>
          ) : (
            <>Welcome to ResuScan</>
          )}
        </h1>
        <p className="text-sm md:text-base text-indigo-100 max-w-xl">
          Evaluate your resume with real AI analysis, practice targeted interview questions, and discover matching opportunities.
        </p>
        <div className="mt-5 flex gap-3 flex-wrap">
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-white text-indigo-700 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-50 transition-colors shadow-sm"
            onClick={() => setActiveTab('resumes')}
          >
            <ShieldCheck size={16} /> Scan Your Resume <ArrowRight size={16} />
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 text-white border border-indigo-500 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-800 transition-colors"
            onClick={() => setActiveTab('interview')}
          >
            <GraduationCap size={16} /> Practice Interviews
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex flex-col items-center text-center p-4 dark:bg-slate-800">
            <div className={`mb-2 ${color}`}>
              <Icon size={22} />
            </div>
            <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div>
        <p className="section-label mb-4">Core Tools</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="card group cursor-pointer border-slate-200 dark:border-slate-700/60 dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all"
                onClick={() => setActiveTab(feat.id)}
              >
                {/* Flat icon box — no gradients */}
                <div className={`mb-4 h-11 w-11 rounded-xl ${feat.iconBg} flex items-center justify-center`}>
                  <Icon size={22} className={feat.iconColor} />
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{feat.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{feat.desc}</p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{feat.stat}</span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                    Open <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pro tip */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/10 p-4 flex items-start gap-3">
        <Lightbulb size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Pro Tip</p>
          <p className="text-sm text-amber-700 dark:text-amber-500 mt-0.5">
            Scan your resume first — AI will detect your skills and automatically personalize Interview Prep and Job Matching.
          </p>
        </div>
      </div>

    </div>
  );
}
