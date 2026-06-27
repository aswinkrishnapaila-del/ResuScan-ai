import React, { useState, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  UploadCloud, Sparkles, Filter, Download, Loader2, FileText,
  ExternalLink, AlertCircle, CheckCircle2, X, Briefcase, ChevronRight, Target, BookOpen
} from 'lucide-react';
import CandidateCard from '../components/CandidateCard';
import DetailedReport from './DetailedReport';

import { API_BASE } from '../config';

export default function ScanSession({ clearTrigger, setActiveTab }) {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzingJd, setIsAnalyzingJd] = useState(false);
  const [jdResults, setJdResults] = useState(null);
  const [jdError, setJdError] = useState(null);

  const [files, setFiles] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [sortOrder, setSortOrder] = useState('score_desc');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const candidatesListRef = useRef(null);

  const handleClearAll = () => {
    setJobDescription('');
    setJdResults(null);
    setJdError(null);
    setFiles([]);
    setResults(null);
    setScanError(null);
    setSelectedCandidate(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  React.useEffect(() => {
    if (clearTrigger > 0) handleClearAll();
  }, [clearTrigger]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f =>
      f.name.toLowerCase().endsWith('.pdf') || f.name.toLowerCase().endsWith('.docx')
    );
    if (droppedFiles.length === 0) { alert('Please drop PDF or DOCX files only.'); return; }
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      return [...prev, ...droppedFiles.filter(f => !existing.has(f.name))];
    });
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      return [...prev, ...selectedFiles.filter(f => !existing.has(f.name))];
    });
  };

  const removeFile = (index) => setFiles(files.filter((_, i) => i !== index));

  const analyzeJd = async () => {
    if (!jobDescription || jobDescription.trim().length < 10) {
      setJdError('Please provide a valid Job Description (at least 10 characters).');
      return;
    }
    setJdError(null);
    setJdResults(null);
    setIsAnalyzingJd(true);
    try {
      const response = await axios.post(`${API_BASE}/analyze-jd`, { job_description: jobDescription });
      setJdResults(response.data);
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Unknown error';
      setJdError(`Failed to analyze Job Description: ${msg}. Make sure the backend is running.`);
    } finally {
      setIsAnalyzingJd(false);
    }
  };

  const runScan = async () => {
    if (files.length === 0) { setScanError('Please upload at least one resume (PDF or DOCX).'); return; }
    setScanError(null);
    setIsScanning(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await axios.post(`${API_BASE}/analyze-resumes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
      });
      const resultsData = response.data.results;
      if (!resultsData || resultsData.length === 0) {
        setScanError('No results returned from the server.');
      } else {
        setResults(resultsData);
        // Store all skills found across scanned resumes for Job Matching
        const allSkills = [...new Set(resultsData.flatMap(r => r.skills_found || []))];
        if (allSkills.length > 0) {
          localStorage.setItem('scanned_resume_skills', JSON.stringify(allSkills));
          localStorage.setItem('scanned_resume_title', resultsData[0]?.filename || '');
        }
      }
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Connection refused';
      if (msg.includes('Network Error') || msg.includes('ECONNREFUSED') || msg.includes('Connection')) {
        setScanError('Cannot connect to the backend server. Please start it first.');
      } else {
        setScanError(`Scan failed: ${msg}`);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!results || results.length === 0 || !candidatesListRef.current) return;
    try {
      const canvas = await html2canvas(candidatesListRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2 + 100] });
      pdf.setFontSize(18);
      pdf.text('ATS Scan Summary Report', 20, 30);
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);
      pdf.text(`Total Candidates: ${results.length}`, 20, 55);
      pdf.addImage(imgData, 'PNG', 0, 70, canvas.width / 2, canvas.height / 2);
      pdf.save(`ATS_Scan_Results_${new Date().getTime()}.pdf`);
    } catch (error) { alert('Failed to export PDF results.'); }
  };

  const handleFindJobs = () => {
    if (setActiveTab) setActiveTab('matching');
  };

  const sortedResults = results ? [...results].sort((a, b) => {
    if (sortOrder === 'score_desc') return b.score - a.score;
    if (sortOrder === 'score_asc') return a.score - b.score;
    if (sortOrder === 'exp_desc') return b.experience - a.experience;
    return 0;
  }) : null;

  if (selectedCandidate) {
    return <DetailedReport candidate={selectedCandidate} onBack={() => setSelectedCandidate(null)} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── JD Analyzer ── */}
      <div className="grid-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={18} color="var(--primary)" /> Analyze Job Description</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>Paste any JD — AI will give role-specific improvement tips, certifications & job links.</p>
            </div>
          </div>
          <textarea
            className="form-input"
            placeholder="Paste the full Job Description here..."
            value={jobDescription}
            onChange={e => { setJobDescription(e.target.value); setJdError(null); }}
            style={{ height: '220px', flex: 1, marginBottom: '1rem', resize: 'vertical' }}
          />
          {jdError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '0.75rem', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
              <AlertCircle size={16} /> {jdError}
            </div>
          )}
          <button className="btn btn-primary" onClick={analyzeJd} disabled={isAnalyzingJd}>
            {isAnalyzingJd ? <><Loader2 className="spin" size={18} /> Analyzing JD...</> : 'Analyze Job Description'}
          </button>
        </div>

        {/* JD Results */}
        <div className="card" style={{ backgroundColor: 'var(--bg-color)', overflowY: 'auto', maxHeight: 520 }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}><Target size={18} color="var(--primary)" /> JD Analysis Results</h3>
          {isAnalyzingJd ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Loader2 size={36} className="spin" style={{ marginBottom: '1rem' }} />
              <p>AI is reading the job description...</p>
            </div>
          ) : jdResults ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Role Info */}
              {(jdResults.role_title || jdResults.experience_level) && (
                <div style={{ padding: '12px 16px', background: 'var(--secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  {jdResults.role_title && <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', marginBottom: 4 }}>{jdResults.role_title}</p>}
                  {jdResults.experience_level && <span className="badge badge-primary">{jdResults.experience_level}</span>}
                </div>
              )}

              {/* Key Skills Required */}
              {jdResults.key_skills_required?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Skills Required by This JD</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {jdResults.key_skills_required.map((sk, i) => (
                      <span key={i} style={{ padding: '4px 10px', background: '#fef3c7', color: '#92400e', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>{sk}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Improvement Suggestions */}
              {jdResults.suggestions?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={14} /> How to Improve Your Profile for This Role</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {jdResults.suggestions.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                        <ChevronRight size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills to Learn */}
              {jdResults.skills_to_learn?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><BookOpen size={14} /> Skills to Learn for This Role</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {jdResults.skills_to_learn.map((sk, i) => (
                      <span key={i} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.08)', color: '#dc2626', borderRadius: 20, fontSize: '0.78rem', fontWeight: 500 }}>{sk}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps to Get Started */}
              {jdResults.how_to_start?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#7c3aed', fontWeight: 700, marginBottom: 8 }}>Steps to Get Started</h4>
                  <ol style={{ paddingLeft: '1.4rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {jdResults.how_to_start.map((s, i) => (
                      <li key={i} style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Certifications */}
              {jdResults.certifications?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 700, marginBottom: 8 }}>Recommended Certifications</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {jdResults.certifications.map((cert, i) => (
                      <div key={i} style={{ padding: '8px 12px', backgroundColor: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{cert.name}</span>
                        <a href={cert.url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          View <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Jobs */}
              {jdResults.similar_jobs?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 700, marginBottom: 8 }}>Live Job Listings</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {jdResults.similar_jobs.map((job, i) => (
                      <div key={i} style={{ padding: '10px 12px', backgroundColor: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{job.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{job.company}</div>
                        </div>
                        <a href={job.url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          Apply <ExternalLink size={13} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>
              <FileText size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>Paste a Job Description and click "Analyze" to see role-specific AI insights here.</p>
            </div>
          )}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

      {/* ── Resume Scanner ── */}
      <div className="grid-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Target size={18} color="var(--primary)" /> ATS Resume Scanner</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Upload PDF or DOCX resumes for AI-powered ATS analysis.
              </p>
            </div>
            <span className="badge badge-primary">{files.length} Uploaded</span>
          </div>

          <div
            className="upload-zone"
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            style={{
              border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border-color)'}`,
              borderRadius: 12, padding: '2rem',
              textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDragging ? 'var(--secondary)' : 'var(--bg-color)',
              cursor: 'pointer', marginBottom: '1rem',
              transition: 'all 0.2s ease'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={40} color={isDragging ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: '1rem', transition: 'all 0.2s' }} />
            <h4 style={{ marginBottom: '0.5rem' }}>Drag & Drop resumes here</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Supports <strong>PDF</strong> and <strong>DOCX</strong> — text must be selectable (not scanned image)
            </p>
            <button className="btn btn-outline" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              Browse Files
            </button>
            <input type="file" multiple accept=".pdf,.docx" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileSelect} />
          </div>

          {files.length > 0 && (
            <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: '1rem', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.5rem' }}>
              {files.map((f, idx) => (
                <div key={idx} className="flex-between" style={{ padding: '4px 6px', fontSize: '0.875rem', borderRadius: 4 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    📄 {f.name}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6 }}>({(f.size / 1024).toFixed(0)} KB)</span>
                  </span>
                  <button onClick={() => removeFile(idx)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', flexShrink: 0 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {scanError && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '0.75rem', padding: '10px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, lineHeight: 1.5 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} /> {scanError}
            </div>
          )}

          <button className="btn btn-primary" onClick={runScan} disabled={isScanning || files.length === 0}>
            {isScanning ? <><Loader2 className="spin" size={18} /> Analyzing Resumes...</> : `Scan ${files.length > 0 ? files.length : ''} Resume${files.length !== 1 ? 's' : ''} with AI`}
          </button>
          {isScanning && (
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              ⏳ This may take 10-30 seconds per resume. Please wait...
            </p>
          )}

          {results && results.length > 0 && (
            <button
              className="btn btn-outline"
              onClick={handleFindJobs}
              style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              <Briefcase size={16} /> Find Matching Jobs from This Resume
            </button>
          )}
        </div>

        {/* Ranked Candidates */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card-bg)', maxHeight: 560, overflow: 'hidden' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
            <div>
              <h3>Ranked Candidates</h3>
              <p style={{ fontSize: '0.85rem' }}>AI ATS scores — click a card for full analysis</p>
            </div>
            <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
              <button className="btn btn-outline" style={{ padding: 8 }} onClick={() => setShowFilter(!showFilter)}>
                <Filter size={18} />
              </button>
              {showFilter && (
                <div style={{ position: 'absolute', top: '100%', right: '40px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.5rem', zIndex: 10, minWidth: 150, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                  {[['score_desc', 'Highest Score'], ['score_asc', 'Lowest Score'], ['exp_desc', 'Most Experience']].map(([val, label]) => (
                    <div key={val} style={{ padding: '6px 10px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: sortOrder === val ? 'bold' : 'normal', borderRadius: 4, background: sortOrder === val ? 'var(--secondary)' : 'transparent' }} onClick={() => { setSortOrder(val); setShowFilter(false); }}>{label}</div>
                  ))}
                </div>
              )}
              <button className="btn btn-outline" style={{ padding: 8 }} onClick={handleDownloadPDF} disabled={!results || results.length === 0}>
                <Download size={18} />
              </button>
            </div>
          </div>

          <div ref={candidatesListRef} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: 4 }}>
            {sortedResults ? (
              sortedResults.length > 0 ? (
                sortedResults.map((cand, idx) => (
                  <div key={idx}>
                    {cand.error && !cand.score ? (
                      <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.06)', border: '1px solid var(--danger)', borderRadius: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', fontWeight: 600, marginBottom: 4 }}>
                          <AlertCircle size={16} /> {cand.filename}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cand.error}</p>
                      </div>
                    ) : (
                      <CandidateCard candidate={cand} onClick={() => setSelectedCandidate(cand)} />
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
                  <AlertCircle size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>No candidates could be processed.</p>
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>
                <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Upload resumes and click "Scan" to see ATS scores here.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>The AI will analyze each resume and rank candidates by score.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
