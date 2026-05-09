import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, ChevronRight, ChevronLeft, Download, Settings, Plus, Trash2, Upload, Sparkles, Bold, Italic, List, Undo, Redo, Search, Loader2 } from 'lucide-react';
import TemplateGallery, { TEMPLATES } from '../components/TemplateGallery';
import ResumePreview from '../components/ResumePreview';

const ACCENT_OPTIONS = ['#1e293b', '#3b28cc', '#2563eb', '#0891b2', '#16a34a', '#9333ea', '#dc2626', '#92400e'];

const STEPS = [
  { num: 1, label: 'Template' },
  { num: 2, label: 'Personal Info' },
  { num: 3, label: 'Experience' },
  { num: 4, label: 'Final Polish' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 5 - i);

export default function ResumeBuilder({ loadedDraft, setLoadedDraft }) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('minimalist');
  const [accentColor, setAccentColor] = useState('');
  
  const [isRefining, setIsRefining] = useState(false);
  const [improvingIdx, setImprovingIdx] = useState(null);

  const [formData, setFormData] = useState({
    name: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', github: '',
    photo: '', summary: '',
    experience: [{ role: '', company: '', dates: '', bullets: [''] }],
    projects: [],
    education: [{ degree: '', school: '', startMonth: '', startYear: '', endMonth: '', endYear: '', city: '', cgpa: '' }],
    skills: { languages: [], frontend: [], backend: [], ai_tools: [] }, skillInput: { category: 'languages', text: '' },
    certifications: [],
    awards: [],
    languages: [],
    publications: [],
    profiles: []
  });

  const editorRef = useRef(null);
  const resumeRef = useRef(null);

  // Load Draft
  useEffect(() => {
    if (loadedDraft) {
      const fd = { ...loadedDraft.formData };
      // Migrate old array skills to categorized
      if (Array.isArray(fd.skills)) {
        fd.skills = { languages: fd.skills, frontend: [], backend: [], ai_tools: [] };
      }
      setFormData(fd);
      setSelectedTemplate(loadedDraft.selectedTemplate);
      if (loadedDraft.accentColor) setAccentColor(loadedDraft.accentColor);
      setStep(loadedDraft.step || 2);
    }
  }, [loadedDraft]);

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateField('photo', reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --- Array Updaters ---
  const updateArrayItem = (arrayName, idx, field, value) => {
    const arr = [...formData[arrayName]];
    arr[idx] = { ...arr[idx], [field]: value };
    updateField(arrayName, arr);
  };
  const addArrayItem = (arrayName, emptyObj) => updateField(arrayName, [...formData[arrayName], emptyObj]);
  const removeArrayItem = (arrayName, idx) => updateField(arrayName, formData[arrayName].filter((_, i) => i !== idx));

  // --- Bullets ---
  const updateBullet = (arrayName, itemIdx, bulletIdx, value) => {
    const arr = [...formData[arrayName]];
    const bullets = [...arr[itemIdx].bullets];
    bullets[bulletIdx] = value;
    arr[itemIdx] = { ...arr[itemIdx], bullets };
    updateField(arrayName, arr);
  };
  const addBullet = (arrayName, itemIdx) => {
    const arr = [...formData[arrayName]];
    arr[itemIdx].bullets = [...arr[itemIdx].bullets, ''];
    updateField(arrayName, arr);
  };
  const removeBullet = (arrayName, itemIdx, bulletIdx) => {
    const arr = [...formData[arrayName]];
    arr[itemIdx].bullets = arr[itemIdx].bullets.filter((_, i) => i !== bulletIdx);
    updateField(arrayName, arr);
  };

  // --- Skills ---
  const addSkill = () => {
    const { category, text } = formData.skillInput;
    const val = text.trim();
    if (val && !formData.skills[category].includes(val)) {
      updateField('skills', { ...formData.skills, [category]: [...formData.skills[category], val] });
    }
    updateField('skillInput', { ...formData.skillInput, text: '' });
  };
  const removeSkill = (category, s) => {
    updateField('skills', { ...formData.skills, [category]: formData.skills[category].filter(sk => sk !== s) });
  };

  // --- AI Functions ---
  const handleRefineWithAI = async () => {
    if (!formData.summary || formData.summary.trim().length < 10) {
      alert('Please enter a professional summary first (at least 10 characters).');
      return;
    }
    setIsRefining(true);
    try {
      const response = await fetch('http://localhost:8000/api/refine-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: formData.summary })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error ${response.status}`);
      }
      const data = await response.json();
      if (data.refined_summary && data.refined_summary !== formData.summary) {
        updateField('summary', data.refined_summary);
      } else {
        alert('AI returned the same text. Try adding more details to your summary.');
      }
    } catch (error) {
      console.error('Refine error:', error);
      alert(`AI Refine failed: ${error.message}. Make sure the backend is running at localhost:8000`);
    } finally {
      setIsRefining(false);
    }
  };

  const handleImproveBullet = async (arrayName, itemIdx, bulletIdx, text) => {
    if (!text || text.trim().length < 3) {
      alert('Please enter some text in the bullet point first.');
      return;
    }
    const key = `${arrayName}-${itemIdx}-${bulletIdx}`;
    setImprovingIdx(key);
    try {
      const response = await fetch('http://localhost:8000/api/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context: 'Resume bullet point' })
      });
      if (!response.ok) throw new Error(`Server error ${response.status}`);
      const data = await response.json();
      updateBullet(arrayName, itemIdx, bulletIdx, data.improved_text);
    } catch (error) {
      console.error('Improve bullet error:', error);
      alert(`AI Improve failed: ${error.message}`);
    } finally {
      setImprovingIdx(null);
    }
  };
  
  const handleImproveAchievement = async (arrayName, idx, text) => {
      if (!text || text.trim().length < 3) return;
      const key = `${arrayName}-${idx}`;
      setImprovingIdx(key);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/improve-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, context: "Achievement or Certification" })
        });
        if (!response.ok) throw new Error('Server error');
        const data = await response.json();
        updateArrayItem(arrayName, idx, 'name', data.improved_text);
      } catch (error) {
        alert(`AI Improve failed: ${error.message}`);
      } finally {
        setImprovingIdx(null);
      }
  };

  const handlePrint = () => {
    const resumeEl = resumeRef.current;
    if (!resumeEl) return;
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    printWindow.document.write(`
      <!DOCTYPE html><html><head>
      <title>Resume - ${formData.name || 'My Resume'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: white; font-family: Inter, sans-serif; }
        @page { margin: 0.5cm; }
        ul { padding-left: 1.2rem; }
        li { line-height: 1.6; }
        p { line-height: 1.6; }
        div { box-sizing: border-box; }
        pre, textarea { white-space: pre-wrap; }
      </style>
      </head><body>
      ${resumeEl.innerHTML}
      <script>window.onload=function(){window.print();window.close();}<\/script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const [zoom, setZoom] = useState(0.85);

  const saveDraft = () => {
    const drafts = JSON.parse(localStorage.getItem('resumeDrafts') || '[]');
    const currentDraftId = loadedDraft?.id || Date.now().toString();
    const newDraft = { id: currentDraftId, timestamp: Date.now(), formData, selectedTemplate, accentColor, step };
    const existingIdx = drafts.findIndex(d => d.id === currentDraftId);
    if (existingIdx >= 0) drafts[existingIdx] = newDraft;
    else drafts.push(newDraft);
    localStorage.setItem('resumeDrafts', JSON.stringify(drafts));
    setLoadedDraft(newDraft);
    alert('Draft saved successfully!');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Wizard Header */}
      <div className="wizard-header">
        {STEPS.map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className={`wizard-step ${step === s.num ? 'active' : step > s.num ? 'completed' : ''}`}>
              <div className="wizard-step-circle" onClick={() => step > s.num && setStep(s.num)} style={{ cursor: step > s.num ? 'pointer' : 'default' }}>
                {step > s.num ? <CheckCircle2 size={16} /> : s.num}
              </div>
              <span className="wizard-step-label" style={{ position: 'absolute', top: 40, whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && <div className="wizard-connector" style={{ backgroundColor: step > s.num ? 'var(--primary)' : '#e2e8f0' }} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && <TemplateGallery selected={selectedTemplate} onSelect={setSelectedTemplate} onNext={() => setStep(2)} />}

      {/* ── STEP 2: Personal Info ── */}
      {step === 2 && (
        <div className="builder-split-layout">
          <div className="builder-form-panel">
            <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>Personal Information</h2>
            
            <div className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {formData.photo ? <img src={formData.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Upload size={24} color="var(--primary)" />}
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: 4 }}>Profile Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={formData.name} onChange={e => updateField('name', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" value={formData.email} onChange={e => updateField('email', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Mobile Number</label><input className="form-input" value={formData.phone} onChange={e => updateField('phone', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Location / City</label><input className="form-input" value={formData.location} onChange={e => updateField('location', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">LinkedIn Profile</label><input className="form-input" value={formData.linkedin} onChange={e => updateField('linkedin', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">GitHub Profile</label><input className="form-input" value={formData.github} onChange={e => updateField('github', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Professional Title</label><input className="form-input" value={formData.title} onChange={e => updateField('title', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Portfolio Website</label><input className="form-input" value={formData.website} onChange={e => updateField('website', e.target.value)} /></div>
            </div>

            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)' }}>Profiles</h4>
            {formData.profiles.map((prof, pIdx) => (
              <div key={pIdx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="form-input" placeholder="Platform (e.g. LeetCode)" value={prof.platform} onChange={e => updateArrayItem('profiles', pIdx, 'platform', e.target.value)} style={{ flex: 1 }} />
                <input className="form-input" placeholder="URL" value={prof.url} onChange={e => updateArrayItem('profiles', pIdx, 'url', e.target.value)} style={{ flex: 2 }} />
                <button onClick={() => removeArrayItem('profiles', pIdx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
              </div>
            ))}
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', marginBottom: '1.5rem', width: '100%' }} onClick={() => addArrayItem('profiles', { platform: '', url: '' })}><Plus size={14}/> Add Profile</button>


            <div className="form-group">
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>Professional Summary</label>
                <button
                  className="btn"
                  style={{
                    padding: '5px 12px', fontSize: '0.78rem',
                    background: isRefining ? 'var(--secondary)' : 'linear-gradient(135deg, #3b28cc, #6c63ff)',
                    color: 'white', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5,
                    boxShadow: '0 2px 8px rgba(59,40,204,0.3)'
                  }}
                  onClick={handleRefineWithAI}
                  disabled={isRefining}
                >
                  {isRefining ? <Loader2 size={13} className="spin" /> : <Sparkles size={13} />}
                  {isRefining ? 'Refining...' : '✨ Refine with AI'}
                </button>
              </div>
              <textarea className="form-input" style={{ minHeight: 150, resize: 'vertical' }} value={formData.summary} onChange={e => updateField('summary', e.target.value)} placeholder="Write your professional summary here... The AI will rewrite it professionally when you click Refine with AI" />
            </div>

            <div className="builder-nav-row">
              <button className="btn btn-outline" onClick={() => setStep(1)}><ChevronLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Next: Experience <ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="builder-preview-panel">
            <div className="preview-scroll-area">
              <div style={{ transform: 'scale(0.6)', transformOrigin: 'top center', width: '167%', marginLeft: '-33.5%' }}>
                <ResumePreview templateId={selectedTemplate} formData={formData} accentColor={accentColor} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Experience & Skills ── */}
      {step === 3 && (
        <div className="builder-split-layout">
          <div className="builder-form-panel">
            <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>Experience & Credentials</h2>

            {/* Work Experience */}
            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>Work Experience</h4>
            {formData.experience.map((exp, expIdx) => (
              <div key={expIdx} className="card" style={{ marginBottom: '1rem', position: 'relative' }}>
                <button onClick={() => removeArrayItem('experience', expIdx)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                <div className="grid-2" style={{ gap: '0.8rem', marginBottom: '0.8rem' }}>
                  <div><label className="form-label">Role / Title</label><input className="form-input" value={exp.role} onChange={e => updateArrayItem('experience', expIdx, 'role', e.target.value)} /></div>
                  <div><label className="form-label">Company Name</label><input className="form-input" value={exp.company} onChange={e => updateArrayItem('experience', expIdx, 'company', e.target.value)} /></div>
                </div>
                <div style={{ marginBottom: '0.8rem' }}><label className="form-label">Duration</label><input className="form-input" placeholder="e.g. July 2023 - Present" value={exp.dates} onChange={e => updateArrayItem('experience', expIdx, 'dates', e.target.value)} /></div>
                
                <label className="form-label">Key Responsibilities / Bullets</label>
                {exp.bullets.map((b, bIdx) => {
                  const key = `experience-${expIdx}-${bIdx}`;
                  return (
                  <div key={bIdx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <textarea className="form-input" style={{ minHeight: '60px', width: '100%', resize: 'vertical' }} value={b} onChange={e => updateBullet('experience', expIdx, bIdx, e.target.value)} />
                      <button className="btn" style={{ fontSize: '0.7rem', padding: '2px 8px', marginTop: 4, background: 'var(--secondary)', color: 'var(--primary)' }} onClick={() => handleImproveBullet('experience', expIdx, bIdx, b)} disabled={improvingIdx === key}>
                        {improvingIdx === key ? 'Improving...' : <><Sparkles size={12}/> Improve with AI</>}
                      </button>
                    </div>
                    <button onClick={() => removeBullet('experience', expIdx, bIdx)} style={{ background: 'none', border: 'none', color: '#ef4444', marginTop: 8 }}><Trash2 size={16} /></button>
                  </div>
                )})}
                <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => addBullet('experience', expIdx)}><Plus size={14} /> Add Bullet Point</button>
              </div>
            ))}
            <button className="btn btn-outline" style={{ marginBottom: '1.5rem', width: '100%' }} onClick={() => addArrayItem('experience', { role: '', company: '', dates: '', bullets: [''] })}><Plus size={16} /> Add New Experience</button>

            {/* Projects */}
            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>Projects</h4>
            {formData.projects.map((proj, pIdx) => (
              <div key={pIdx} className="card" style={{ marginBottom: '1rem', position: 'relative' }}>
                <button onClick={() => removeArrayItem('projects', pIdx)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                <div className="grid-2" style={{ gap: '0.8rem', marginBottom: '0.8rem' }}>
                  <div><label className="form-label">Project Name</label><input className="form-input" value={proj.name} onChange={e => updateArrayItem('projects', pIdx, 'name', e.target.value)} /></div>
                  <div><label className="form-label">Project Link</label><input className="form-input" value={proj.link} onChange={e => updateArrayItem('projects', pIdx, 'link', e.target.value)} /></div>
                </div>
                <div style={{ marginBottom: '0.8rem' }}><label className="form-label">Tech Stack</label><input className="form-input" value={proj.tech_stack} onChange={e => updateArrayItem('projects', pIdx, 'tech_stack', e.target.value)} /></div>
                
                <label className="form-label">Project Details / Bullets</label>
                {proj.bullets.map((b, bIdx) => {
                  const key = `projects-${pIdx}-${bIdx}`;
                  return (
                  <div key={bIdx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <textarea className="form-input" style={{ minHeight: '60px', width: '100%', resize: 'vertical' }} value={b} onChange={e => updateBullet('projects', pIdx, bIdx, e.target.value)} />
                      <button className="btn" style={{ fontSize: '0.7rem', padding: '2px 8px', marginTop: 4, background: 'var(--secondary)', color: 'var(--primary)' }} onClick={() => handleImproveBullet('projects', pIdx, bIdx, b)} disabled={improvingIdx === key}>
                        {improvingIdx === key ? 'Improving...' : <><Sparkles size={12}/> Improve with AI</>}
                      </button>
                    </div>
                    <button onClick={() => removeBullet('projects', pIdx, bIdx)} style={{ background: 'none', border: 'none', color: '#ef4444', marginTop: 8 }}><Trash2 size={16} /></button>
                  </div>
                )})}
                <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => addBullet('projects', pIdx)}><Plus size={14} /> Add Bullet Point</button>
              </div>
            ))}
            <button className="btn btn-outline" style={{ marginBottom: '1.5rem', width: '100%' }} onClick={() => addArrayItem('projects', { name: '', link: '', tech_stack: '', bullets: [''] })}><Plus size={16} /> Add New Project</button>

            {/* Education */}
            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>Education</h4>
            {formData.education.map((ed, edIdx) => (
              <div key={edIdx} className="card" style={{ marginBottom: '1rem', position: 'relative' }}>
                <button onClick={() => removeArrayItem('education', edIdx)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                <div className="grid-2" style={{ gap: '0.8rem', marginBottom: '0.8rem' }}>
                  <div><label className="form-label">College / School Name</label><input className="form-input" value={ed.school} onChange={e => updateArrayItem('education', edIdx, 'school', e.target.value)} /></div>
                  <div><label className="form-label">Degree</label><input className="form-input" value={ed.degree} onChange={e => updateArrayItem('education', edIdx, 'degree', e.target.value)} /></div>
                </div>
                <div className="grid-2" style={{ gap: '0.8rem', marginBottom: '0.8rem' }}>
                  <div><label className="form-label">CGPA / Score</label><input className="form-input" value={ed.cgpa} onChange={e => updateArrayItem('education', edIdx, 'cgpa', e.target.value)} /></div>
                  <div><label className="form-label">City</label><input className="form-input" value={ed.city} onChange={e => updateArrayItem('education', edIdx, 'city', e.target.value)} /></div>
                </div>
                <div className="grid-2" style={{ gap: '0.8rem' }}>
                  <div>
                    <label className="form-label">Start Date</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select className="form-input" value={ed.startMonth} onChange={e => updateArrayItem('education', edIdx, 'startMonth', e.target.value)}><option value="">Month</option>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                      <select className="form-input" value={ed.startYear} onChange={e => updateArrayItem('education', edIdx, 'startYear', e.target.value)}><option value="">Year</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">End Date</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select className="form-input" value={ed.endMonth} onChange={e => updateArrayItem('education', edIdx, 'endMonth', e.target.value)}><option value="">Month</option>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                      <select className="form-input" value={ed.endYear} onChange={e => updateArrayItem('education', edIdx, 'endYear', e.target.value)}><option value="">Year</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn btn-outline" style={{ marginBottom: '1.5rem', width: '100%' }} onClick={() => addArrayItem('education', { degree: '', school: '', startMonth: '', startYear: '', endMonth: '', endYear: '', city: '', cgpa: '' })}><Plus size={16} /> Add Education</button>

            {/* Achievements & Certifications */}
            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>Achievements & Certifications</h4>
            {formData.awards.map((aw, aIdx) => {
              const key = `awards-${aIdx}`;
              return (
              <div key={aIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" placeholder="Achievement/Cert Name" value={aw.name} onChange={e => updateArrayItem('awards', aIdx, 'name', e.target.value)} style={{ flex: 2 }} />
                  <input className="form-input" placeholder="Year" value={aw.year} onChange={e => updateArrayItem('awards', aIdx, 'year', e.target.value)} style={{ flex: 1 }} />
                  <button onClick={() => removeArrayItem('awards', aIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16}/></button>
                </div>
                <button className="btn" style={{ alignSelf: 'flex-start', fontSize: '0.7rem', padding: '2px 8px', background: 'var(--secondary)', color: 'var(--primary)' }} onClick={() => handleImproveAchievement('awards', aIdx, aw.name)} disabled={improvingIdx === key}>
                  {improvingIdx === key ? 'Improving...' : <><Sparkles size={12}/> Improve with AI</>}
                </button>
              </div>
            )})}
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', width: '100%', marginBottom: '1.5rem' }} onClick={() => addArrayItem('awards', { name: '', year: '' })}><Plus size={14}/> Add Achievement/Certification</button>

            {/* Publications */}
            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>Publications (Optional)</h4>
            {formData.publications.map((pub, pIdx) => (
              <div key={pIdx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="form-input" placeholder="Title" value={pub.title} onChange={e => updateArrayItem('publications', pIdx, 'title', e.target.value)} style={{ flex: 2 }} />
                <input className="form-input" placeholder="Link" value={pub.link} onChange={e => updateArrayItem('publications', pIdx, 'link', e.target.value)} style={{ flex: 1 }} />
                <button onClick={() => removeArrayItem('publications', pIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16}/></button>
              </div>
            ))}
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', width: '100%', marginBottom: '1.5rem' }} onClick={() => addArrayItem('publications', { title: '', link: '', year: '' })}><Plus size={14}/> Add Publication</button>


            {/* Technical Skills */}
            <h4 style={{ margin: '0.5rem 0 0.8rem', fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>Technical Skills</h4>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <select className="form-input" value={formData.skillInput.category} onChange={e => updateField('skillInput', { ...formData.skillInput, category: e.target.value })} style={{ flex: 1 }}>
                <option value="languages">Languages</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend & Cloud</option>
                <option value="ai_tools">AI & Tools</option>
              </select>
              <input className="form-input" placeholder="Type a skill and press Add..." value={formData.skillInput.text} onChange={e => updateField('skillInput', { ...formData.skillInput, text: e.target.value })} onKeyDown={e => e.key === 'Enter' && addSkill()} style={{ flex: 2 }} />
              <button className="btn btn-primary" onClick={addSkill}>Add</button>
            </div>
            
            {['languages', 'frontend', 'backend', 'ai_tools'].map(category => (
              formData.skills[category] && formData.skills[category].length > 0 && (
                <div key={category} style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{category.replace('_', ' ')}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {formData.skills[category].map(s => (
                      <span key={s} style={{ padding: '4px 12px', background: 'var(--secondary)', color: 'var(--primary)', borderRadius: 20, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {s} <span onClick={() => removeSkill(category, s)} style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '1rem', lineHeight: 1 }}>×</span>
                      </span>
                    ))}
                  </div>
                </div>
              )
            ))}

            <div className="builder-nav-row" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(2)}><ChevronLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>Next: Final Polish <ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="builder-preview-panel">
            <div className="preview-scroll-area">
              <div style={{ transform: 'scale(0.6)', transformOrigin: 'top center', width: '167%', marginLeft: '-33.5%' }}>
                <ResumePreview templateId={selectedTemplate} formData={formData} accentColor={accentColor} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: Final Polish ── */}
      {step === 4 && (
        <div style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>Final Polish</h2>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Change template or accent color, then export your resume.</p>

          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1.6fr', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

              {/* Template Picker */}
              <div className="card">
                <h4 style={{ fontSize: '0.92rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>🎨 Change Template</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {TEMPLATES.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      style={{
                        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                        border: selectedTemplate === t.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: selectedTemplate === t.id ? 'var(--secondary)' : 'var(--card-bg)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <p style={{ fontWeight: 600, fontSize: '0.82rem', color: selectedTemplate === t.id ? 'var(--primary)' : 'var(--text-main)' }}>{t.name}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.type}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="card">
                <h4 style={{ fontSize: '0.92rem', marginBottom: '1rem' }}>🎨 Accent Color</h4>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {ACCENT_OPTIONS.map(c => (
                    <div key={c} onClick={() => setAccentColor(c)} style={{ width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer', border: accentColor === c ? '3px solid white' : '2px solid transparent', boxShadow: accentColor === c ? `0 0 0 2px ${c}` : 'none', transition: 'all 0.2s' }} />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <button className="btn btn-outline" style={{ padding: 12 }} onClick={saveDraft}>💾 Save Draft</button>
                <button className="btn btn-outline" style={{ padding: 12 }} onClick={handlePrint}>🖨️ Print</button>
              </div>

              <button className="btn btn-primary" style={{ padding: 14, width: '100%', fontSize: '0.95rem' }} onClick={async () => {
                  try {
                    const exportData = { ...formData };
                    delete exportData.skillInput;
                    const response = await fetch('http://127.0.0.1:8000/api/generate-resume', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(exportData)
                    });
                    if (!response.ok) throw new Error(`Server error ${response.status}`);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${(formData.name || 'resume').replace(/\s+/g, '_').toLowerCase()}_resume.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    if (window.confirm(`PDF export failed. Use browser print instead?`)) handlePrint();
                  }
                }}>
                <Download size={16} /> Export PDF
              </button>

              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setStep(3)}><ChevronLeft size={16} /> Back to Experience</button>
            </div>

            {/* Live Preview with zoom */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', background: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: 1, textTransform: 'uppercase' }}>Live Preview — {TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button className="btn" style={{ padding: '4px 10px', minWidth: 28, fontSize: '0.85rem' }} onClick={() => setZoom(p => Math.max(0.3, p - 0.05))}>-</button>
                  <span style={{ fontSize: '0.8rem', minWidth: 38, textAlign: 'center', fontWeight: 600 }}>{Math.round(zoom * 100)}%</span>
                  <button className="btn" style={{ padding: '4px 10px', minWidth: 28, fontSize: '0.85rem' }} onClick={() => setZoom(p => Math.min(1.2, p + 0.05))}>+</button>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '1rem', background: '#e8eaf0' }}>
                <div style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  width: `${(1 / zoom) * 100}%`,
                  marginLeft: `${-((1 / zoom) - 1) * 50}%`,
                  background: 'white',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                  transition: 'transform 0.2s ease'
                }}>
                  <div ref={resumeRef}>
                    <ResumePreview templateId={selectedTemplate} formData={formData} accentColor={accentColor} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
