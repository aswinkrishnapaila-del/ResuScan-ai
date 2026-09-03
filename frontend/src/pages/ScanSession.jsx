import React, { useState, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  UploadCloud, Sparkles, Download, Loader2, FileText,
  AlertCircle, CheckCircle2, X, TrendingUp, ShieldCheck,
  Lightbulb, Award, Brain, AlertTriangle, Star, Zap,
  CheckCircle, BarChart2, ArrowRight, Users, Wand2, Image,
} from 'lucide-react';
import { API_BASE } from '../config';

/* ── Score Ring ───────────────────────────────────────────────── */
function ScoreRing({ score, size = 140 }) {
  const r = size / 2 - 14;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#6c63ff' : score >= 40 ? '#f59e0b' : '#ef4444';
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={12} className="text-slate-200 dark:text-slate-700" />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={12}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-slate-900 dark:text-white leading-none" style={{ fontSize: size > 100 ? '2rem' : '1.3rem' }}>{score}</span>
        <span className="text-[10px] font-bold text-slate-400 mt-0.5">Grade {grade}</span>
      </div>
    </div>
  );
}

/* ── Score Bar ────────────────────────────────────────────────── */
function ScoreBar({ label, value, max, icon: Icon, color = '#6c63ff' }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5 text-xs">
        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          {Icon && <Icon size={12} style={{ color }} />} {label}
        </span>
        <span className="font-bold" style={{ color }}>{value}/{max}</span>
      </div>
      <div className="score-bar-track">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* ── Skill Chip ───────────────────────────────────────────────── */
function Chip({ label, color = '#6c63ff', bg = 'rgba(108,99,255,0.1)' }) {
  return (
    <span
      className="chip text-[11px]"
      style={{ color, background: bg, borderColor: `${color}33` }}
    >
      {label}
    </span>
  );
}

/* ── Tab Button ───────────────────────────────────────────────── */
function TabBtn({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
        active
          ? 'border-primary text-primary dark:text-primary-400 bg-white dark:bg-surface-800'
          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
      }`}
    >
      <Icon size={13} /> {children}
    </button>
  );
}

/* ── Improve Resume Modal ─────────────────────────────────────── */
function ImproveModal({ resumeText, onClose }) {
  const [improved, setImproved] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImprove = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/improve-resume`, {
        resume_text: resumeText,
      }, { timeout: 120000 });
      setImproved(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'AI improvement failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!improved?.improved_text) return;
    const blob = new Blob([improved.improved_text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'improved_resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="card w-full max-w-3xl max-h-[85vh] overflow-y-auto dark:bg-surface-800 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Wand2 size={20} className="text-violet-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Resume Improvement</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost p-1.5"><X size={18} /></button>
        </div>

        {!improved && !isLoading && !error && (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
              <Wand2 size={28} className="text-violet-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Improve Your Resume with AI</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Our AI will fix grammar mistakes, make unprofessional sections professional, and boost impact — without changing your original meaning.
              </p>
            </div>
            <button className="btn btn-primary px-8 py-3 text-sm" onClick={handleImprove}>
              <Sparkles size={16} /> Start AI Improvement
            </button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-10 space-y-3">
            <Loader2 size={36} className="spin mx-auto text-violet-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">AI is improving your resume… This may take 20-40 seconds.</p>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <div className="flex gap-2.5 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-600 dark:text-red-400 items-start">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <button className="btn btn-primary w-full py-2.5" onClick={handleImprove}>
              <Sparkles size={16} /> Try Again
            </button>
          </div>
        )}

        {improved && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Grammar Fixes', value: improved.grammar_fixes || 0, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                { label: 'Tone Improvements', value: improved.tone_improvements || 0, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
                { label: 'Impact Boosts', value: improved.impact_boosts || 0, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl ${s.bg} p-3 text-center`}>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Changes Summary */}
            {improved.changes_summary?.length > 0 && (
              <div className="rounded-xl border border-violet-200 dark:border-violet-800/30 bg-violet-50 dark:bg-violet-900/10 p-4">
                <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-2">✨ Changes Made:</p>
                <ul className="space-y-1.5">
                  {improved.changes_summary.map((change, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle size={12} className="text-violet-500 flex-shrink-0 mt-0.5" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improved Text */}
            <div>
              <p className="section-label mb-2">Improved Resume Text</p>
              <div className="rounded-xl bg-slate-50 dark:bg-surface-950 border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-700 dark:text-slate-300 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {improved.improved_text}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="btn btn-primary flex-1 py-2.5" onClick={handleDownload}>
                <Download size={16} /> Download Improved Resume
              </button>
              <button className="btn btn-outline py-2.5" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Full Result Panel ────────────────────────────────────────── */
function ScanResultPanel({ result, onReset }) {
  const reportRef = useRef(null);
  const [tab, setTab] = useState('overview');
  const [showImproveModal, setShowImproveModal] = useState(false);

  const {
    filename = 'resume', ats_score = 0, grade = 'F', verdict = '',
    score_breakdown = {}, strong_skills = [], critical_missing_skills = [],
    improvements = [], interview_tips = [], errors = [],
    parsed_skills = [], experience_years = 0, parsed_text = '',
  } = result;

  const color = ats_score >= 80 ? '#22c55e' : ats_score >= 60 ? '#6c63ff' : ats_score >= 40 ? '#f59e0b' : '#ef4444';
  const gradeBg = ats_score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
    : ats_score >= 60 ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400'
    : ats_score >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';

  const handleDownload = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#0f172a' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`ATS_Report_${filename.replace(/\.[^/.]+$/, '')}.pdf`);
    } catch { alert('Export failed. Please try again.'); }
  };

  const TABS = [
    { id: 'overview',  label: 'Overview',        icon: BarChart2 },
    { id: 'skills',    label: 'Skills',           icon: Award },
    { id: 'improve',   label: 'Improvements',     icon: TrendingUp },
    { id: 'interview', label: 'Interview Tips',   icon: Brain },
    { id: 'errors',    label: `Issues (${errors.length})`, icon: AlertCircle },
  ];

  return (
    <>
      <div ref={reportRef} className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={20} style={{ color }} />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">ATS Scan Complete</h2>
              <span className={`badge text-[11px] font-bold ${gradeBg}`}>Grade {grade}</span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-sm">{filename}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-outline text-xs px-3 py-2" onClick={onReset}>
              <X size={13} /> New Scan
            </button>
            <button
              className="btn text-xs px-3 py-2 bg-violet-600 text-white hover:bg-violet-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              onClick={() => setShowImproveModal(true)}
            >
              <Wand2 size={13} /> Improve Resume
            </button>
            <button className="btn btn-primary text-xs px-3 py-2" onClick={handleDownload}>
              <Download size={13} /> Download
            </button>
          </div>
        </div>

        {/* Hero row */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
          {/* Score card */}
          <div className="card flex flex-col items-center justify-center gap-2 p-6 min-w-[180px] dark:bg-surface-800">
            <ScoreRing score={ats_score} size={140} />
            <p className="text-xs text-slate-400 font-medium">ATS Match Score</p>
            {experience_years > 0 && (
              <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 text-[10px]">
                ~{experience_years} yrs exp
              </span>
            )}
          </div>

          {/* Breakdown card */}
          <div className="card dark:bg-surface-800 space-y-4 flex flex-col justify-between">
            <div>
              <p className="section-label mb-2">AI Verdict</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "{verdict}"
              </p>
            </div>
            <div className="space-y-3">
              <ScoreBar label="Formatting & Contact" value={score_breakdown.formatting || 0} max={20} icon={FileText}   color="#6c63ff" />
              <ScoreBar label="Skill Density"        value={score_breakdown.skills || 0}     max={30} icon={Award}      color="#22c55e" />
              <ScoreBar label="Impact & Metrics"     value={score_breakdown.impact || 0}     max={30} icon={TrendingUp} color="#f59e0b" />
              <ScoreBar label="Education"            value={score_breakdown.education || 0}  max={20} icon={Star}       color="#06b6d4" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 flex overflow-x-auto gap-0.5 scrollbar-none">
          {TABS.map(t => (
            <TabBtn key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} icon={t.icon}>
              {t.label}
            </TabBtn>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in">

          {/* Overview */}
          {tab === 'overview' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card dark:bg-surface-800">
                <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-bold">Strong Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {strong_skills.length > 0
                    ? strong_skills.map((s, i) => <Chip key={i} label={s} color="#22c55e" bg="rgba(34,197,94,0.1)" />)
                    : <p className="text-xs text-slate-400">No strong skills detected.</p>}
                </div>
              </div>

              <div className="card dark:bg-surface-800">
                <div className="flex items-center gap-2 mb-3 text-red-500">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-bold">Critical Gaps</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {critical_missing_skills.length > 0
                    ? critical_missing_skills.map((s, i) => <Chip key={i} label={s} color="#ef4444" bg="rgba(239,68,68,0.1)" />)
                    : <p className="text-xs text-emerald-500">No critical gaps found!</p>}
                </div>
              </div>

              {parsed_text && (
                <div className="card dark:bg-surface-800 sm:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={15} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Resume Content Preview</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-surface-950 border border-slate-200 dark:border-slate-700 p-4 text-xs text-slate-500 dark:text-slate-400 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {parsed_text}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {tab === 'skills' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card dark:bg-surface-800">
                <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle size={16} />
                  <span className="text-sm font-bold">Skills Found in Resume</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsed_skills.length > 0
                    ? parsed_skills.map((s, i) => <Chip key={i} label={s} color="#22c55e" bg="rgba(34,197,94,0.1)" />)
                    : <p className="text-xs text-slate-400">No skills extracted.</p>}
                </div>
              </div>

              <div className="card dark:bg-surface-800 space-y-4">
                <div className="flex items-center gap-2 text-amber-500">
                  <Zap size={16} />
                  <span className="text-sm font-bold">Skills to Add for ATS Boost</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {critical_missing_skills.map((s, i) => <Chip key={i} label={s} color="#f59e0b" bg="rgba(245,158,11,0.1)" />)}
                </div>
                <div className="rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 p-3 text-xs text-primary-700 dark:text-primary-300 leading-relaxed">
                  <strong>💡 Tip:</strong> Only add skills you genuinely have experience with. Honesty in interviews is critical.
                </div>
              </div>
            </div>
          )}

          {/* Improvements */}
          {tab === 'improve' && (
            <div className="card dark:bg-surface-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  <span className="text-base font-bold text-slate-900 dark:text-white">Actionable Improvement Plan</span>
                </div>
                <button
                  className="btn text-xs px-3 py-1.5 bg-violet-600 text-white hover:bg-violet-700 transition-all"
                  onClick={() => setShowImproveModal(true)}
                >
                  <Wand2 size={12} /> Auto-Fix with AI
                </button>
              </div>
              {improvements.length > 0 ? (
                <div className="space-y-3">
                  {improvements.map((imp, i) => (
                    <div key={i} className="flex gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-surface-900 p-4 items-start">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary text-xs font-bold">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{imp}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-emerald-500">
                  <CheckCircle2 size={36} className="mx-auto mb-2 opacity-70" />
                  <p className="font-semibold">No major improvements needed — excellent resume!</p>
                </div>
              )}
            </div>
          )}

          {/* Interview Tips */}
          {tab === 'interview' && (
            <div className="card dark:bg-surface-800 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Brain size={18} className="text-violet-500" />
                  <span className="text-base font-bold text-slate-900 dark:text-white">How to Stand Out in Your Interview</span>
                </div>
                <p className="text-xs text-slate-400">AI-tailored tips based on your specific resume and experience.</p>
              </div>

              {interview_tips.length > 0 ? (
                <div className="space-y-3">
                  {interview_tips.map((tip, i) => (
                    <div key={i} className="flex gap-3 rounded-xl border border-violet-200 dark:border-violet-800/30 bg-violet-50 dark:bg-violet-900/10 p-4 items-start">
                      <Lightbulb size={15} className="text-violet-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No interview tips generated. Try scanning again.</p>
              )}

              <div className="rounded-xl bg-gradient-to-br from-primary-50 to-violet-50 dark:from-primary-900/20 dark:to-violet-900/20 border border-primary-100 dark:border-primary-800/30 p-4">
                <p className="text-xs font-bold text-primary mb-1">🏆 The Golden Rule</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every interview answer should follow the <strong className="text-slate-800 dark:text-slate-200">STAR method</strong>: Situation → Task → Action → Result. Always close with a number or measurable outcome.
                </p>
              </div>
            </div>
          )}

          {/* Issues */}
          {tab === 'errors' && (
            <div className="card dark:bg-surface-800">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={18} style={{ color: errors.length > 0 ? '#ef4444' : '#22c55e' }} />
                <span className="text-base font-bold text-slate-900 dark:text-white">Resume Issues & Weaknesses</span>
              </div>
              {errors.length > 0 ? (
                <div className="space-y-3">
                  {errors.map((err, i) => {
                    const sevColor = err.severity === 'high' ? '#ef4444' : err.severity === 'medium' ? '#f59e0b' : '#94a3b8';
                    const sevBg    = err.severity === 'high'
                      ? 'border-red-200 bg-red-50 dark:border-red-800/30 dark:bg-red-900/10'
                      : err.severity === 'medium'
                      ? 'border-amber-200 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-900/10'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-surface-900';
                    return (
                      <div key={i} className={`flex gap-3 rounded-xl border p-4 items-start ${sevBg}`}>
                        <AlertTriangle size={14} style={{ color: sevColor }} className="flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: sevColor }}>
                              {err.severity}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {err.category?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{err.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-emerald-500">
                  <CheckCircle2 size={36} className="mx-auto mb-2 opacity-70" />
                  <p className="font-semibold">No critical issues found — great resume!</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Improve Modal */}
      {showImproveModal && (
        <ImproveModal
          resumeText={parsed_text}
          onClose={() => setShowImproveModal(false)}
        />
      )}
    </>
  );
}

/* ── Main ScanSession Page ────────────────────────────────────── */
export default function ScanSession({ clearTrigger, setActiveTab: setParentTab }) {
  const [files, setFiles]               = useState([]);
  const [isScanning, setIsScanning]     = useState(false);
  const [scanResult, setScanResult]     = useState(null);
  const [rankedResults, setRankedResults] = useState(null);
  const [scanError, setScanError]       = useState(null);
  const [isDragging, setIsDragging]     = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [mode, setMode]                 = useState('single');
  const fileInputRef                    = useRef(null);

  const ACCEPTED_TYPES = '.pdf,.docx,.jpg,.jpeg,.png';

  const handleClearAll = () => {
    setFiles([]); setScanResult(null); setRankedResults(null);
    setScanError(null); setSelectedCandidate(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  React.useEffect(() => { if (clearTrigger > 0) handleClearAll(); }, [clearTrigger]);

  const addFiles = (newFiles) => {
    const validExts = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];
    const valid = Array.from(newFiles).filter(
      f => validExts.some(ext => f.name.toLowerCase().endsWith(ext))
    );
    if (!valid.length) { setScanError('Please upload PDF, DOCX, JPG, or PNG files only.'); return; }
    setScanError(null);
    setFiles(prev => {
      const ex = new Set(prev.map(f => f.name));
      return [...prev, ...valid.filter(f => !ex.has(f.name))];
    });
  };

  const runSingleScan = async () => {
    if (!files.length) { setScanError('Please upload a resume file.'); return; }
    setScanError(null); setIsScanning(true); setScanResult(null);
    const fd = new FormData();
    fd.append('file', files[0]);
    try {
      const res = await axios.post(`${API_BASE}/scan`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000,
      });
      setScanResult(res.data);
      const skills = res.data.parsed_skills || res.data.strong_skills || [];
      if (skills.length) {
        localStorage.setItem('scanned_resume_skills', JSON.stringify(skills));
        localStorage.setItem('scanned_resume_title', files[0].name || '');
      }
    } catch (err) {
      setScanError(`Scan failed: ${err.response?.data?.detail || err.message || 'Connection error'}`);
    } finally { setIsScanning(false); }
  };

  const runMultiScan = async () => {
    if (!files.length) { setScanError('Please upload at least one resume.'); return; }
    setScanError(null); setIsScanning(true); setRankedResults(null);
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    try {
      const res = await axios.post(`${API_BASE}/analyze-resumes`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }, timeout: 300000,
      });
      const data = res.data.results || [];
      if (!data.length) { setScanError('No results returned.'); return; }
      setRankedResults(data);
      const allSkills = [...new Set(data.flatMap(r => r.parsed_skills || r.skills_found || []))];
      if (allSkills.length) localStorage.setItem('scanned_resume_skills', JSON.stringify(allSkills));
    } catch (err) {
      setScanError(`Scan failed: ${err.response?.data?.detail || err.message || 'Connection error'}`);
    } finally { setIsScanning(false); }
  };

  const handleScan = () => mode === 'single' ? runSingleScan() : runMultiScan();

  /* ── Candidate detail view ── */
  if (selectedCandidate) {
    const asResult = {
      filename:                selectedCandidate.filename,
      ats_score:               selectedCandidate.ats_score || selectedCandidate.score || 0,
      grade:                   selectedCandidate.grade || 'N/A',
      verdict:                 selectedCandidate.verdict || selectedCandidate.reasoning || '',
      score_breakdown: {
        formatting: selectedCandidate.score_breakdown?.formatting || 0,
        skills:     selectedCandidate.score_breakdown?.skills     || 0,
        impact:     selectedCandidate.score_breakdown?.experience || selectedCandidate.score_breakdown?.impact || 0,
        education:  selectedCandidate.score_breakdown?.education  || 0,
      },
      strong_skills:           selectedCandidate.strong_skills || [],
      critical_missing_skills: selectedCandidate.critical_missing_skills || [],
      improvements:            selectedCandidate.improvements || selectedCandidate.improvements_needed || [],
      interview_tips:          selectedCandidate.interview_tips || [],
      errors:                  selectedCandidate.errors || [],
      parsed_skills:           selectedCandidate.parsed_skills || selectedCandidate.skills_found || [],
      experience_years:        selectedCandidate.experience_years || selectedCandidate.experience || 0,
      parsed_text:             selectedCandidate.parsed_text || '',
    };
    return <ScanResultPanel result={asResult} onReset={() => setSelectedCandidate(null)} />;
  }

  /* ── Single scan result ── */
  if (scanResult) {
    return <ScanResultPanel result={scanResult} onReset={handleClearAll} />;
  }

  /* ── Upload UI ─────────────────────────────────────────────── */
  return (
    <div className="space-y-8">

      {/* Hero */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 dark:border-primary-800/50 bg-primary-50 dark:bg-primary-900/20 px-4 py-1.5 mb-2">
          <ShieldCheck size={14} className="text-primary" />
          <span className="text-xs font-bold text-primary">AI-Powered ATS Resume Scanner</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
          Get Your Resume <span className="text-primary">AI-Reviewed</span> in Seconds
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Upload your resume — our AI reads every line, scores it, finds gaps, and gives you interview-ready tips.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center gap-2">
        {[
          { id: 'single', label: 'Deep Scan (1 Resume)',    icon: Sparkles },
          { id: 'multi',  label: 'Compare Multiple Resumes', icon: Users },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setMode(id); handleClearAll(); }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all border ${
              mode === id
                ? 'bg-primary text-white border-primary shadow-glow-sm'
                : 'bg-white dark:bg-surface-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-300'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Upload card */}
      <div className="mx-auto max-w-2xl w-full card dark:bg-surface-800 p-6 space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 px-4 cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600 bg-slate-50 dark:bg-surface-900'
          }`}
        >
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
            isDragging ? 'bg-primary text-white' : 'bg-primary-100 dark:bg-primary-900/40 text-primary'
          }`}>
            <UploadCloud size={28} />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              {mode === 'single' ? 'Drop your resume here' : 'Drop multiple resumes here'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports <strong>PDF</strong>, <strong>DOCX</strong>, <strong>JPG</strong>, <strong>PNG</strong> · Scanned images & text resumes
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-center gap-1">
              <Image size={10} /> Image-based & scanned resumes are automatically OCR-processed
            </p>
          </div>
          <button
            className="btn btn-outline text-xs px-4 py-2"
            onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            Browse Files
          </button>
          <input
            type="file" multiple={mode === 'multi'} accept={ACCEPTED_TYPES}
            className="hidden" ref={fileInputRef} onChange={e => addFiles(e.target.files)}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/40">
                    {f.name.match(/\.(jpg|jpeg|png)$/i)
                      ? <Image size={15} className="text-primary" />
                      : <FileText size={15} className="text-primary" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{f.name}</p>
                    <p className="text-[10px] text-slate-400">{(f.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                  className="ml-2 flex-shrink-0 p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {scanError && (
          <div className="flex gap-2.5 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-600 dark:text-red-400 items-start">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{scanError}</span>
          </div>
        )}

        {/* CTA */}
        <button
          className="btn btn-primary w-full py-3 text-sm md:text-base font-bold rounded-2xl"
          onClick={handleScan}
          disabled={isScanning || !files.length}
        >
          {isScanning
            ? <><Loader2 size={18} className="spin" /> AI is reading your resume…</>
            : <><Sparkles size={18} /> {mode === 'single' ? 'Scan & Analyze My Resume' : `Rank ${files.length} Resume${files.length !== 1 ? 's' : ''} with AI`}</>
          }
        </button>

        {isScanning && (
          <p className="text-center text-xs text-slate-400">
            ⏳ Deep AI audit in progress — usually takes 10–30 seconds…
          </p>
        )}
      </div>

      {/* Multi-ranked results */}
      {rankedResults && rankedResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-primary" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ranked Results ({rankedResults.length} resumes)
              </h3>
            </div>
            <button className="btn btn-ghost text-xs" onClick={() => { setRankedResults(null); setFiles([]); }}>
              <X size={13} /> Clear
            </button>
          </div>

          <div className="space-y-3">
            {rankedResults.map((r, i) => {
              const s = r.ats_score || r.score || 0;
              const rankColor = i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-600' : 'text-slate-500';
              return (
                <div
                  key={i}
                  onClick={() => setSelectedCandidate(r)}
                  className="card dark:bg-surface-800 flex items-center gap-4 p-4 cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-md transition-all group"
                >
                  <div className={`text-xl font-black flex-shrink-0 w-8 text-center ${rankColor}`}>
                    #{i + 1}
                  </div>
                  <ScoreRing score={s} size={60} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {r.candidate_name || r.filename}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {r.verdict || r.reasoning || 'Click to view full report'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(r.strong_skills || r.skills_found || []).slice(0, 4).map((sk, j) => (
                        <Chip key={j} label={sk} color="#6c63ff" bg="rgba(108,99,255,0.1)" />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`badge text-[10px] font-bold ${
                      s >= 80 ? 'badge-success' : s >= 60 ? 'badge-primary' : s >= 40 ? 'badge-warning' : 'badge-danger'
                    }`}>
                      Grade {r.grade || 'N/A'}
                    </span>
                    <ArrowRight size={15} className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature highlights (only when empty) */}
      {!rankedResults && !scanResult && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {[
            { icon: Brain,       color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30', label: 'AI Reads Every Line',  desc: 'Real understanding — not just keywords' },
            { icon: TrendingUp,  color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Actionable Fixes',  desc: 'Bullet-by-bullet rewrites' },
            { icon: Image,       color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Image & Scan OCR',    desc: 'Supports scanned PDFs & images' },
            { icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Resume Validation',  desc: 'Only accepts real resumes' },
          ].map(({ icon: Icon, color, bg, label, desc }) => (
            <div key={label} className="card dark:bg-surface-800 text-center p-4 space-y-2">
              <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
