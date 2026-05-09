import React from 'react';
import { CheckCircle2, AlertCircle, Star, TrendingUp, Clock } from 'lucide-react';

export default function CandidateCard({ candidate, onClick }) {
  const { candidate_name, score, grade, experience, skills_found = [], reasoning, error } = candidate;

  if (error && !score) {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '1rem', cursor: 'pointer' }} onClick={onClick}>
        <div className="flex-between">
          <div>
            <h4 style={{ color: 'var(--danger)', fontSize: '0.92rem' }}>{candidate.filename}</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: 4 }}>{error}</p>
          </div>
          <AlertCircle color="var(--danger)" size={20} />
        </div>
      </div>
    );
  }

  const getScoreTheme = (s) => {
    if (s >= 85) return { border: '#10b981', bg: 'rgba(16,185,129,0.08)', color: '#10b981', label: 'Excellent' };
    if (s >= 65) return { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', label: 'Good' };
    if (s >= 45) return { border: '#f97316', bg: 'rgba(249,115,22,0.08)', color: '#f97316', label: 'Fair' };
    return { border: '#ef4444', bg: 'rgba(239,68,68,0.08)', color: '#ef4444', label: 'Needs Work' };
  };

  const theme = getScoreTheme(score);
  const initials = (candidate_name || 'UN').substring(0, 2).toUpperCase();

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        borderLeft: `4px solid ${theme.border}`,
        cursor: 'pointer',
        padding: '1.1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        transition: 'all 0.2s ease',
        background: `linear-gradient(to right, ${theme.bg}, transparent)`
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${theme.border}25`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = ''; }}
    >
      <div className="flex-between">
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          {/* Avatar */}
          <div style={{
            width: 44, height: 44,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${theme.border}30, ${theme.border}15)`,
            border: `1.5px solid ${theme.border}50`,
            color: theme.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.9rem', flexShrink: 0
          }}>
            {initials}
          </div>

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem', marginBottom: 2 }}>
              {candidate_name}
              {score >= 85 && <CheckCircle2 size={14} color="#10b981" />}
              {score >= 85 && <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#d1fae5', color: '#065f46', borderRadius: 10, fontWeight: 600 }}>TOP</span>}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {experience} yr{experience !== 1 ? 's' : ''} exp</span>
              {grade && <span style={{ padding: '1px 6px', borderRadius: 8, background: `${theme.border}20`, color: theme.color, fontWeight: 700, fontSize: '0.72rem' }}>Grade: {grade}</span>}
            </p>
          </div>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: theme.color, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>ATS Score</div>
          <div style={{ fontSize: '0.68rem', color: theme.color, fontWeight: 600 }}>{theme.label}</div>
        </div>
      </div>

      {/* Reasoning snippet */}
      {reasoning && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, borderLeft: '2px solid var(--border-color)', paddingLeft: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {reasoning}
        </p>
      )}

      {/* Skills */}
      {skills_found.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {skills_found.slice(0, 5).map((skill, idx) => (
            <span key={idx} style={{ padding: '2px 8px', background: `${theme.border}12`, color: theme.color, borderRadius: 12, fontSize: '0.7rem', fontWeight: 500, border: `1px solid ${theme.border}25` }}>
              {skill}
            </span>
          ))}
          {skills_found.length > 5 && (
            <span style={{ padding: '2px 8px', background: 'var(--secondary)', color: 'var(--text-muted)', borderRadius: 12, fontSize: '0.7rem' }}>
              +{skills_found.length - 5} more
            </span>
          )}
        </div>
      )}

      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: -4 }}>
        Click to view full analysis →
      </div>
    </div>
  );
}
