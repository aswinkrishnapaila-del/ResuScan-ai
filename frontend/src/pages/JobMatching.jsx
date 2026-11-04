import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, ExternalLink, Loader2, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { API_BASE } from '../config';

export default function JobMatching() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [scannedSkills, setScannedSkills] = useState([]);

  const fetchJobs = async (skills = []) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/job-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_data: { scanned_skills: skills, skills } }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Could not reach AI backend. Showing skill-based suggestions.');
      setJobs(getFallbackJobs(skills));
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  };

  const getFallbackJobs = (skills = []) => {
    const s1 = skills[0] || 'Software';
    const s2 = skills[1] || 'React';
    const s3 = skills[2] || 'Python';
    return [
      {
        id: 1, title: `${s1} Developer`, company: 'TechCorp Solutions', location: 'Remote, India', type: 'Full-time', salary: '8–15 LPA',
        tags: skills.slice(0, 3).length ? skills.slice(0, 3) : [s1, s2, s3],
        linkedinUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(s1 + ' Developer')}&location=India`,
        naukriUrl: `https://www.naukri.com/${s1.toLowerCase().replace(/[^a-z0-9]/g, '-')}-developer-jobs`,
      },
      {
        id: 2, title: 'Full Stack Engineer', company: 'Innovation Labs', location: 'Bangalore, India', type: 'Full-time', salary: '12–22 LPA',
        tags: [s2, s3, 'Node.js'],
        linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Engineer&location=India',
        naukriUrl: 'https://www.naukri.com/full-stack-developer-jobs',
      },
      {
        id: 3, title: 'Software Engineer', company: 'Various Tech', location: 'Hybrid, India', type: 'Full-time', salary: '6–12 LPA',
        tags: skills.slice(0, 3).length ? skills.slice(0, 3) : ['Git', 'JavaScript', 'Problem Solving'],
        linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=Software+Engineer&location=India',
        naukriUrl: 'https://www.naukri.com/software-engineer-jobs',
      },
    ];
  };

  useEffect(() => {
    let skills = [];
    try {
      const stored = localStorage.getItem('scanned_resume_skills');
      if (stored) skills = JSON.parse(stored);
    } catch {}
    setScannedSkills(skills);
    fetchJobs(skills);
  }, []);

  const handleRefresh = () => {
    let skills = scannedSkills;
    try {
      const stored = localStorage.getItem('scanned_resume_skills');
      if (stored) skills = JSON.parse(stored);
    } catch {}
    fetchJobs(skills);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white mb-1">
            <Sparkles size={22} className="text-indigo-500" /> AI Job Matching
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Job opportunities matched from your scanned resume. Click Apply to view live listings.
          </p>
          {scannedSkills.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">Matching based on:</span>
              {scannedSkills.slice(0, 8).map(s => (
                <span key={s} className="badge badge-primary text-[11px]">{s}</span>
              ))}
              {scannedSkills.length > 8 && (
                <span className="text-xs text-slate-400">+{scannedSkills.length - 8} more</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 px-3 py-2 w-fit">
              <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Scan your resume in the <strong>Resumes</strong> tab first for personalized matches.
              </p>
            </div>
          )}
        </div>
        <button
          className="btn btn-outline gap-2 flex-shrink-0"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
          {isLoading ? 'Finding…' : 'Refresh'}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 p-3 text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <AlertCircle size={15} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && !hasLoaded ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <Loader2 size={36} className="spin text-indigo-500" />
          <p className="text-sm">AI is finding the best jobs for your skills…</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div
              key={job.id}
              className="card dark:bg-slate-800 flex items-center gap-4 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all"
            >
              {/* Logo placeholder */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                <Briefcase size={22} className="text-indigo-600 dark:text-indigo-400" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{job.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-3 flex-wrap mt-0.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{job.company}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location} · {job.type}</span>
                  {job.salary && <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary}</span>}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(job.tags || []).map((tag, idx) => (
                    <span key={idx} className="badge badge-primary text-[11px]">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Apply buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <a
                  href={job.linkedinUrl || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title)}&location=India`}
                  target="_blank" rel="noreferrer"
                  className="btn btn-primary text-xs px-3 py-1.5 gap-1 no-underline"
                  onClick={e => e.stopPropagation()}
                >
                  LinkedIn <ExternalLink size={11} />
                </a>
                <a
                  href={job.naukriUrl || `https://www.naukri.com/${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-jobs`}
                  target="_blank" rel="noreferrer"
                  className="btn btn-outline text-xs px-3 py-1.5 gap-1 no-underline"
                  onClick={e => e.stopPropagation()}
                >
                  Naukri <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}

          {jobs.length === 0 && !isLoading && (
            <div className="card dark:bg-slate-800 text-center py-12">
              <Briefcase size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400">No jobs found. Scan a resume first, then refresh.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
