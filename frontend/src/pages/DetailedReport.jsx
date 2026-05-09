import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Briefcase, 
  Sparkles, 
  FileText,
  AlertCircle,
  Clock,
  BookOpen,
  Award,
  Layers
} from 'lucide-react';

export default function DetailedReport({ candidate, onBack }) {
  const reportRef = useRef(null);
  const { 
    candidate_name, 
    score, 
    grade,
    score_breakdown = { formatting: 0, skills: 0, experience: 0, education: 0 },
    experience, 
    skills_found = [], 
    parsed_text,
    improvements_needed = [],
    errors = [],
    reasoning = "No detailed reasoning provided."
  } = candidate;

  // Render a simple circle chart
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const handleDownload = async () => {
    if (!reportRef.current) return;
    
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      const safeName = candidate_name.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`ATS_Report_${safeName}.pdf`);
    } catch (error) {
      console.error("Export error:", error);
      alert(`Export failed: ${error.message}`);
    }
  };

  return (
    <div ref={reportRef} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', background: 'var(--card-bg)' }}>
      {/* Header */}
      <div className="flex-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={onBack} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {candidate_name}
              {score >= 80 && <span className="badge badge-success">Top Match</span>}
              <span className={`badge ${score >= 90 ? 'badge-success' : score >= 75 ? 'badge-primary' : 'badge-warning'}`}>Grade {grade}</span>
            </h2>
            <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>
              {experience} Years Relevant Experience • ATS Audit Results
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={handleDownload}>Export JSON</button>
          <button className="btn btn-primary" onClick={handleDownload}><Download size={18} /> Download Report</button>
        </div>
      </div>

      <div className="grid-2">
        {/* Overall Match */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '350px' }}>
          <h3>Overall ATS Score</h3>
          
          <div style={{ position: 'relative', width: '160px', height: '160px', margin: '2rem 0' }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={radius} fill="transparent" stroke="var(--secondary)" strokeWidth="12" />
              <circle 
                cx="80" cy="80" r={radius} 
                fill="transparent" 
                stroke={score >= 85 ? "var(--success)" : score >= 60 ? "var(--primary)" : "var(--danger)"} 
                strokeWidth="12" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" 
                transform="rotate(-90 80 80)"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--text-main)' }}>{score}</h1>
              <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)' }}>out of 100</p>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', maxWidth: '85%', lineHeight: '1.5', color: 'var(--text-main)', fontStyle: 'italic' }}>
            "{reasoning}"
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Audit Breakdown</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>How the resume performed across core evaluation metrics.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={14} /> Formatting & Look</span>
                <span style={{ fontWeight: 600 }}>{score_breakdown.formatting}/20</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(score_breakdown.formatting / 20) * 100}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Award size={14} /> Skill Density</span>
                <span style={{ fontWeight: 600 }}>{score_breakdown.skills}/30</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(score_breakdown.skills / 30) * 100}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={14} /> Impact & Metrics</span>
                <span style={{ fontWeight: 600 }}>{score_breakdown.experience}/30</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(score_breakdown.experience / 30) * 100}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={14} /> Education & Credentials</span>
                <span style={{ fontWeight: 600 }}>{score_breakdown.education}/20</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(score_breakdown.education / 20) * 100}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Identified Errors */}
        <div className="card" style={{ borderTop: errors.length > 0 ? '4px solid var(--danger)' : '4px solid var(--success)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
            <AlertCircle size={20} color={errors.length > 0 ? "var(--danger)" : "var(--success)"} />
            Resume Errors & Weaknesses
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {errors.length > 0 ? (
              errors.map((error, idx) => (
                <div key={idx} style={{ padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
                  <div style={{ color: error.severity === 'high' ? 'var(--danger)' : 'var(--warning)', marginTop: '2px' }}>
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>{error.category.replace('_', ' ')}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{error.message}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <CheckCircle size={32} color="var(--success)" style={{ opacity: 0.5, marginBottom: '10px' }} />
                <p style={{ fontSize: '0.9rem' }}>No critical errors found! Your resume structure is solid.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Plan */}
        <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
            <Sparkles size={20} color="var(--primary)" />
            Action Plan for Improvement
          </h3>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {improvements_needed.map((imp, idx) => (
              <li key={idx} style={{ fontWeight: 500 }}>{imp}</li>
            ))}
            {improvements_needed.length === 0 && <li>Continue maintaining this high standard!</li>}
          </ul>
          
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--secondary)', borderRadius: '8px', border: '1px dashed var(--primary)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
              💡 Pro Tip:
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>
              Target roles with "High Match" skills first to maximize your interview conversion rate.
            </p>
          </div>
        </div>
      </div>

      {/* Skills & Original Text */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Extracted Skills</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {skills_found.map((skill, idx) => (
              <span key={idx} className="badge badge-primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <FileText size={20} /> Parsed Content Preview
          </h3>
          <div style={{ backgroundColor: 'var(--bg-color)', borderRadius: '8px', padding: '1rem', fontSize: '0.75rem', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
            {parsed_text}
          </div>
        </div>
      </div>
    </div>
  );
}
