import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
        body: JSON.stringify({ profile_data: { scanned_skills: skills, skills: skills } })
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('[Job Matching] Error:', err);
      setError('AI backend could not be reached. Showing skill-based suggestions instead.');
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
        id: 1, title: `${s1} Developer`, company: 'TechCorp Solutions', location: 'Remote, India', type: 'Full-time', salary: '8-15 LPA',
        tags: skills.slice(0, 3).length ? skills.slice(0, 3) : [s1, s2, s3],
        linkedinUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(s1 + ' Developer')}&location=India`,
        naukriUrl: `https://www.naukri.com/${s1.toLowerCase().replace(/[^a-z0-9]/g, '-')}-developer-jobs`
      },
      {
        id: 2, title: 'Full Stack Engineer', company: 'Innovation Labs', location: 'Bangalore, India', type: 'Full-time', salary: '12-22 LPA',
        tags: [s2, s3, 'Node.js'],
        linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Engineer&location=India',
        naukriUrl: 'https://www.naukri.com/full-stack-developer-jobs'
      },
      {
        id: 3, title: 'Software Engineer', company: 'Various', location: 'Hybrid, India', type: 'Full-time', salary: '6-12 LPA',
        tags: skills.slice(0, 3).length ? skills.slice(0, 3) : ['Git', 'JavaScript', 'Problem Solving'],
        linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=Software+Engineer&location=India',
        naukriUrl: 'https://www.naukri.com/software-engineer-jobs'
      },
    ];
  };

  useEffect(() => {
    // Read skills from scanned resume in localStorage
    const stored = localStorage.getItem('scanned_resume_skills');
    const skills = stored ? JSON.parse(stored) : [];
    setScannedSkills(skills);
    fetchJobs(skills);
  }, []);

  const handleRefresh = () => {
    const stored = localStorage.getItem('scanned_resume_skills');
    const skills = stored ? JSON.parse(stored) : scannedSkills;
    fetchJobs(skills);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ paddingBottom: '3rem' }}
    >
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={28} color="var(--primary)" />
            AI Job Matching
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>
            Job opportunities matched from your scanned resume. Click Apply to view live listings.
          </p>
          {scannedSkills.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Matching based on:</span>
              {scannedSkills.slice(0, 8).map(s => (
                <span key={s} style={{ padding: '2px 10px', background: 'var(--secondary)', color: 'var(--primary)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 500 }}>{s}</span>
              ))}
              {scannedSkills.length > 8 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{scannedSkills.length - 8} more</span>}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(245,158,11,0.08)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)', marginTop: 4 }}>
              <AlertCircle size={14} color="var(--warning)" />
              <p style={{ fontSize: '0.82rem', color: 'var(--warning)', margin: 0 }}>
                💡 Tip: Go to <strong>Resumes</strong> tab and scan your resume first to get personalized job matches!
              </p>
            </div>
          )}
        </div>
        <button
          className="btn btn-outline"
          onClick={handleRefresh}
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', flexShrink: 0 }}
        >
          {isLoading ? <Loader2 size={18} className="spin" /> : <RefreshCw size={18} />}
          {isLoading ? 'Finding Jobs...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger)', borderRadius: 10, marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--danger)' }}>
          ⚠️ {error}
        </div>
      )}

      {isLoading && !hasLoaded ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Loader2 size={40} className="spin" style={{ marginBottom: '1rem' }} />
          <p>AI is finding the best jobs for you based on your resume skills...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map(job => (
            <div
              key={job.id}
              className="card"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s ease', border: '1px solid var(--border-color)', gap: '1rem' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,40,204,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
                <div style={{ width: 52, height: 52, backgroundColor: 'var(--secondary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                  <Briefcase size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>{job.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{job.company}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {job.location} • {job.type}</span>
                    {job.salary && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={13} /> {job.salary}</span>}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(job.tags || []).map((tag, idx) => (
                      <span key={idx} className="badge" style={{ backgroundColor: 'var(--secondary)', color: 'var(--primary)', fontSize: '0.72rem' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                <a
                  href={job.linkedinUrl || job.searchUrl || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title)}&location=India`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.82rem', textDecoration: 'none' }}
                  onClick={e => e.stopPropagation()}
                >
                  LinkedIn <ExternalLink size={13} />
                </a>
                <a
                  href={job.naukriUrl || `https://www.naukri.com/${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-jobs`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.82rem', textDecoration: 'none' }}
                  onClick={e => e.stopPropagation()}
                >
                  Naukri <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}

          {jobs.length === 0 && !isLoading && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Briefcase size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No jobs found. Try scanning a resume first, then refresh.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
