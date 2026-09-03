import React from 'react';
import { useUser } from '../context/UserContext';
import { FileText, Briefcase, ArrowRight, Sparkles, TrendingUp, ShieldCheck, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    id: 'resumes',
    title: 'ATS Resume Scanner',
    desc: 'AI reads every line of your resume — scores it, finds gaps, and gives you interview-ready tips to stand out.',
    icon: ShieldCheck,
    gradient: 'from-blue-500 to-indigo-600',
    badge: 'Most Popular',
    badgeColor: 'badge-primary',
    stat: '10–30s scan',
  },
  {
    id: 'builder',
    title: 'AI Resume Builder',
    desc: 'Create stunning, ATS-friendly resumes using professional templates with AI-powered bullet rewrites.',
    icon: FileText,
    gradient: 'from-violet-500 to-purple-600',
    stat: '12+ templates',
  },
  {
    id: 'matching',
    title: 'Job Matching',
    desc: 'Discover the best-fit roles from LinkedIn & Naukri that match your skills and experience level.',
    icon: Briefcase,
    gradient: 'from-emerald-500 to-teal-600',
    stat: 'Real openings',
  },
  {
    id: 'interview',
    title: 'Interview Prep',
    desc: 'Practice with AI-generated questions, take MCQ mock tests, and master technical & HR interviews.',
    icon: GraduationCap,
    gradient: 'from-amber-500 to-orange-600',
    badge: 'New',
    badgeColor: 'badge-warning',
    stat: 'Mock tests included',
  },
];

const stats = [
  { label: 'Avg Scan Time',     value: '~20s', icon: TrendingUp,    color: 'text-blue-500' },
  { label: 'Resume Templates',  value: '12+',  icon: FileText,      color: 'text-emerald-500' },
  { label: 'Checks Per Resume', value: '50+',  icon: ShieldCheck,   color: 'text-amber-500' },
  { label: 'Interview Topics',  value: '4',    icon: GraduationCap, color: 'text-violet-500' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function DashboardHub({ setActiveTab }) {
  const { profile } = useUser();
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

      {/* Hero greeting */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-violet-500 p-6 md:p-8 text-white shadow-glow">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-8 -right-8 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-4 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-medium text-white/70 mb-1">👋 Good to see you back</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, <span className="text-yellow-300">{firstName}</span>!
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-md">
            Optimize your career profile and land your dream job faster with AI-powered analysis.
          </p>
          <div className="mt-5 flex gap-3 flex-wrap">
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all"
              onClick={() => setActiveTab('resumes')}
            >
              <ShieldCheck size={16} /> Scan Your Resume <ArrowRight size={16} />
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all"
              onClick={() => setActiveTab('interview')}
            >
              <GraduationCap size={16} /> Practice Interviews
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex flex-col items-center text-center p-4 dark:bg-surface-800">
            <div className={`mb-2 ${color}`}>
              <Icon size={22} />
            </div>
            <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Feature cards */}
      <div>
        <motion.p variants={item} className="section-label mb-4">Tools</motion.p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                variants={item}
                whileHover={{ y: -4 }}
                className="card group relative cursor-pointer overflow-hidden border-slate-200 dark:border-slate-700/60 dark:bg-surface-800 transition-all hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700"
                onClick={() => setActiveTab(feat.id)}
              >
                {feat.badge && (
                  <span className={`badge ${feat.badgeColor} absolute top-4 right-4 text-[10px]`}>
                    {feat.badge}
                  </span>
                )}

                {/* Icon */}
                <div className={`mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center shadow-md`}>
                  <Icon size={24} color="white" />
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{feat.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{feat.desc}</p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{feat.stat}</span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-primary dark:text-primary-400 group-hover:gap-2 transition-all">
                    Open <ArrowRight size={15} />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick tips banner */}
      <motion.div variants={item} className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/10 p-4 flex items-start gap-3">
        <Sparkles size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">💡 Pro Tip</p>
          <p className="text-sm text-amber-700 dark:text-amber-500 mt-0.5">
            Upload your resume to the ATS Scanner first — the AI will detect your skills and automatically personalize Interview Prep questions and Job Matching for you.
          </p>
        </div>
      </motion.div>

    </motion.div>
  );
}
