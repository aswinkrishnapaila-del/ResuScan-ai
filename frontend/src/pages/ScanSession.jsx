import React, { useState, useRef } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import {
  UploadCloud, Sparkles, Download, Loader2, FileText,
  AlertCircle, CheckCircle2, X, TrendingUp, ShieldCheck,
  Lightbulb, Award, Brain, AlertTriangle, Star, Zap,
  CheckCircle, BarChart2, ArrowRight, Wand2, Image,
} from 'lucide-react';
import { API_BASE } from '../config';

/* ── Score Ring ───────────────────────────────────────────────── */
function ScoreRing({ score, size = 140 }) {
  const r = size / 2 - 14;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444';
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
function ScoreBar({ label, value, max, icon: Icon, color = '#6366f1' }) {
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
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ── Skill Chip ───────────────────────────────────────────────── */
function Chip({ label, color = '#6366f1', bg = 'rgba(99,102,241,0.1)' }) {
  return (
    <span className="chip text-[11px]" style={{ color, background: bg, borderColor: `${color}33` }}>
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
          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
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

  const handleDownloadPDF = () => {
    if (!improved?.improved_text) return;
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const text = improved.improved_text;
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(33, 37, 41);
      doc.text('AI Improved Resume', margin, 45);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text('ATS-OPTIMIZED & ENHANCED', margin, 60);
      doc.setDrawColor(220, 224, 230);
      doc.setLineWidth(1);
      doc.line(margin, 70, margin + pageWidth, 70);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);

      const lines = doc.splitTextToSize(text, pageWidth);
      let y = 90;
      const lineHeight = 14;
      lines.forEach((line) => {
        if (y + lineHeight > pageHeight - margin) { doc.addPage(); y = margin; }
        const trimmed = line.trim();
        const isHeader = (trimmed.toUpperCase() === trimmed && trimmed.length > 3 && trimmed.length < 40 && !trimmed.startsWith('•') && !trimmed.startsWith('-')) || trimmed.endsWith(':');
        if (isHeader) {
          y += 6;
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(99, 102, 241);
          doc.text(trimmed, margin, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40, 40, 40);
        } else {
          doc.text(line, margin, y);
        }
        y += lineHeight;
      });
      doc.save('improved_resume.pdf');
    } catch (err) {
      alert('Could not generate PDF: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-3xl max-h-[85vh] overflow-y-auto dark:bg-slate-800 animate-fade-in" onClick={e => e.stopPropagation()}>
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
              <p className="font-semibold text-slate-900 dark:text-white mb-1">AI-Powered Resume Rewrite</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Our AI will rewrite your resume with stronger action verbs, quantified impact, and ATS-optimized keywords.
              </p>
            </div>
            <button className="btn btn-primary px-8" onClick={handleImprove}>
              <Sparkles size={16} /> Improve My Resume
            </button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-10 space-y-3">
            <Loader2 size={36} className="spin mx-auto text-indigo-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">AI is rewriting your resume… usually 15–30 seconds.</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 p-4 text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={16} className="inline mr-2" />{error}
          </div>
        )}

        {improved && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500" />
                <span className="font-semibold text-slate-900 dark:text-white">Resume Improved!</span>
              </div>
              <button className="btn btn-primary text-xs gap-1.5" onClick={handleDownloadPDF}>
                <Download size={14} /> Download PDF
              </button>
            </div>
            {improved.changes_made?.length > 0 && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/10 p-4">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wide">Changes Made</p>
                <ul className="space-y-1">
                  {improved.changes_made.map((c, i) => (
                    <li key={i} className="text-sm text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                      <CheckCircle size={12} className="flex-shrink-0 mt-1 text-emerald-500" />{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Improved Resume</p>
              <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{improved.improved_text}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Scan Result Panel ────────────────────────────────────────── */
function ScanResultPanel({ result, onReset }) {
  const [tab, setTab] = useState('overview');
  const [showImproveModal, setShowImproveModal] = useState(false);

  const {
    filename, ats_score = 0, grade = 'N/A', verdict = '',
    score_breakdown = {}, strong_skills = [], critical_missing_skills = [],
    improvements = [], interview_tips = [], errors = [],
    parsed_skills = [], experience_years = 0, parsed_text = '',
  } = result;

  const sb = score_breakdown;

  return (
    <>
      <div className="space-y-5 animate-fade-in">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate max-w-[260px]">{filename}</span>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline text-xs gap-1.5" onClick={() => setShowImproveModal(true)}>
              <Wand2 size={13} /> AI Improve
            </button>
            <button className="btn btn-ghost text-xs gap-1.5" onClick={onReset}>
              <X size={13} /> New Scan
            </button>
          </div>
        </div>

        {/* Score hero */}
        <div className="card dark:bg-slate-800 flex flex-col md:flex-row items-center md:items-start gap-6 p-6">
          <div className="flex-shrink-0">
            <ScoreRing score={ats_score} size={150} />
          </div>
          <div className="flex-1 min-w-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 flex-wrap">
              <span className={`badge text-sm font-bold ${ats_score >= 80 ? 'badge-success' : ats_score >= 60 ? 'badge-primary' : ats_score >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                Grade {grade}
              </span>
              {experience_years > 0 && (
                <span className="badge badge-primary text-xs">{experience_years} yr{experience_years !== 1 ? 's' : ''} exp</span>
              )}
            </div>
            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{verdict}</p>
            <div className="grid grid-cols-2 gap-3">
              {sb.formatting !== undefined && <ScoreBar label="Formatting" value={sb.formatting} max={20} icon={Star} color="#6366f1" />}
              {sb.skills     !== undefined && <ScoreBar label="Skills"     value={sb.skills}     max={30} icon={Zap}  color="#22c55e" />}
              {sb.impact     !== undefined && <ScoreBar label="Impact"     value={sb.impact}     max={30} icon={TrendingUp} color="#f59e0b" />}
              {sb.education  !== undefined && <ScoreBar label="Education"  value={sb.education}  max={20} icon={Award} color="#06b6d4" />}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card dark:bg-slate-800 p-0 overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto px-4 pt-1 gap-1 bg-slate-50 dark:bg-slate-900/50">
            <TabBtn active={tab === 'overview'}     onClick={() => setTab('overview')}     icon={BarChart2}  >Overview</TabBtn>
            <TabBtn active={tab === 'skills'}       onClick={() => setTab('skills')}       icon={Zap}        >Skills</TabBtn>
            <TabBtn active={tab === 'improvements'} onClick={() => setTab('improvements')} icon={TrendingUp} >Improvements</TabBtn>
            <TabBtn active={tab === 'tips'}         onClick={() => setTab('tips')}         icon={Lightbulb}  >Interview Tips</TabBtn>
            <TabBtn active={tab === 'errors'}       onClick={() => setTab('errors')}       icon={AlertCircle}>Issues</TabBtn>
          </div>

          <div className="p-5">
            {tab === 'overview' && (
              <div className="space-y-4">
                {strong_skills.length > 0 && (
                  <div>
                    <p className="section-label mb-2">Detected Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {strong_skills.map((s, i) => <Chip key={i} label={s} />)}
                    </div>
                  </div>
                )}
                {critical_missing_skills.length > 0 && (
                  <div>
                    <p className="section-label mb-2">Missing Critical Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {critical_missing_skills.map((s, i) => <Chip key={i} label={s} color="#ef4444" bg="rgba(239,68,68,0.08)" />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'skills' && (
              <div className="space-y-4">
                {parsed_skills.length > 0 && (
                  <div>
                    <p className="section-label mb-2">All Parsed Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {parsed_skills.map((s, i) => <Chip key={i} label={s} color="#6366f1" bg="rgba(99,102,241,0.08)" />)}
                    </div>
                  </div>
                )}
                {critical_missing_skills.length > 0 && (
                  <div>
                    <p className="section-label mb-2">Skills to Add</p>
                    <div className="flex flex-wrap gap-2">
                      {critical_missing_skills.map((s, i) => <Chip key={i} label={s} color="#ef4444" bg="rgba(239,68,68,0.08)" />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'improvements' && (
              <div className="space-y-3">
                {improvements.length > 0 ? improvements.map((imp, i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 items-start">
                    <ArrowRight size={14} className="flex-shrink-0 mt-0.5 text-indigo-500" />
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{imp}</p>
                  </div>
                )) : (
                  <div className="text-center py-8 text-emerald-500">
                    <CheckCircle2 size={36} className="mx-auto mb-2 opacity-70" />
                    <p className="font-semibold">No major improvements needed!</p>
                  </div>
                )}
              </div>
            )}

            {tab === 'tips' && (
              <div className="space-y-3">
                {interview_tips.length > 0 ? interview_tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10 p-4 items-start">
                    <Lightbulb size={14} className="flex-shrink-0 mt-0.5 text-blue-500" />
                    <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{tip}</p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 text-center py-6">No interview tips generated.</p>
                )}
              </div>
            )}

            {tab === 'errors' && (
              <div className="space-y-3">
                {errors.length > 0 ? errors.map((err, i) => {
                  const sevColor = err.severity === 'critical' ? '#ef4444' : err.severity === 'high' ? '#f97316' : '#f59e0b';
                  const sevBg = err.severity === 'critical'
                    ? 'border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/10'
                    : err.severity === 'high'
                    ? 'border-orange-200 bg-orange-50 dark:border-orange-800/40 dark:bg-orange-900/10'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50';
                  return (
                    <div key={i} className={`flex gap-3 rounded-xl border p-4 items-start ${sevBg}`}>
                      <AlertTriangle size={14} style={{ color: sevColor }} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: sevColor }}>{err.severity}</span>
                          <span className="text-[10px] text-slate-400 capitalize">{err.category?.replace(/_/g, ' ')}</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{err.message}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-emerald-500">
                    <CheckCircle2 size={36} className="mx-auto mb-2 opacity-70" />
                    <p className="font-semibold">No critical issues found — great resume!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showImproveModal && (
        <ImproveModal resumeText={parsed_text} onClose={() => setShowImproveModal(false)} />
      )}
    </>
  );
}

/* ── Main ScanSession Page ────────────────────────────────────── */
export default function ScanSession({ clearTrigger }) {
  const [files, setFiles]       = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError]   = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const ACCEPTED_TYPES = '.pdf,.docx,.jpg,.jpeg,.png';

  const handleClearAll = () => {
    setFiles([]); setScanResult(null); setScanError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  React.useEffect(() => { if (clearTrigger > 0) handleClearAll(); }, [clearTrigger]);

  const addFiles = (newFiles) => {
    const validExts = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];
    const valid = Array.from(newFiles).filter(f => validExts.some(ext => f.name.toLowerCase().endsWith(ext)));
    if (!valid.length) { setScanError('Please upload PDF, DOCX, JPG, or PNG files only.'); return; }
    setScanError(null);
    setFiles([...valid].slice(0, 1));
  };

  const handleScan = async () => {
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

  /* Show result panel after scan */
  if (scanResult) {
    return <ScanResultPanel result={scanResult} onReset={handleClearAll} />;
  }

  /* Upload UI */
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-1.5 mb-2">
          <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">AI-Powered ATS Resume Scanner</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
          Get Your Resume <span className="text-indigo-600 dark:text-indigo-400">AI-Reviewed</span> in Seconds
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Upload your resume — our AI reads every line, scores it, finds gaps, and gives you interview-ready tips.
        </p>
      </div>

      {/* Upload card */}
      <div className="mx-auto max-w-2xl w-full card dark:bg-slate-800 p-6 space-y-4">
        {files.length === 0 && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 px-4 cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50 dark:bg-slate-900/50'
            }`}
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
              isDragging ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
            }`}>
              <UploadCloud size={28} />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">Drop your resume here</p>
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
            <input type="file" accept={ACCEPTED_TYPES} className="hidden" ref={fileInputRef} onChange={e => addFiles(e.target.files)} />
          </div>
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                    {f.name.match(/\.(jpg|jpeg|png)$/i)
                      ? <Image size={15} className="text-indigo-600 dark:text-indigo-400" />
                      : <FileText size={15} className="text-indigo-600 dark:text-indigo-400" />
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
            : <><Sparkles size={18} /> Scan & Analyze My Resume</>
          }
        </button>

        {isScanning && (
          <p className="text-center text-xs text-slate-400">
            Deep AI audit in progress — usually takes 10–30 seconds…
          </p>
        )}
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {[
          { icon: Brain,       color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30', label: 'AI Reads Every Line',  desc: 'Real understanding — not just keywords' },
          { icon: TrendingUp,  color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Actionable Fixes',  desc: 'Bullet-by-bullet rewrites' },
          { icon: Image,       color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Image & Scan OCR',    desc: 'Supports scanned PDFs & images' },
          { icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Resume Validation',  desc: 'Only accepts real resumes' },
        ].map(({ icon: Icon, color, bg, label, desc }) => (
          <div key={label} className="card dark:bg-slate-800 text-center p-4 space-y-2">
            <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
