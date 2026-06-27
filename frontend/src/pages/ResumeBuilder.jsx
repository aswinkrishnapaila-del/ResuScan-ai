import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, ChevronRight, ChevronLeft, Download, Plus, Trash2, Upload, Sparkles, Loader2, MapPin, X } from 'lucide-react';
import TemplateGallery, { TEMPLATES } from '../components/TemplateGallery';
import ResumePreview from '../components/ResumePreview';
import { API_BASE } from '../config';

const ACCENT_OPTIONS = ['#1e293b', '#3b28cc', '#2563eb', '#0891b2', '#16a34a', '#9333ea', '#dc2626', '#92400e'];

const STEPS = [
  { num: 1, label: 'Template' },
  { num: 2, label: 'Personal Info' },
  { num: 3, label: 'Experience' },
  { num: 4, label: 'Final Polish' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 5 - i);

/* ── Country Codes (All Countries) ── */
const COUNTRY_CODES = [
  { code: '+91', country: 'India' }, { code: '+1', country: 'USA/Canada' }, { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' }, { code: '+49', country: 'Germany' }, { code: '+33', country: 'France' },
  { code: '+81', country: 'Japan' }, { code: '+82', country: 'South Korea' }, { code: '+86', country: 'China' },
  { code: '+7', country: 'Russia' }, { code: '+55', country: 'Brazil' }, { code: '+52', country: 'Mexico' },
  { code: '+27', country: 'South Africa' }, { code: '+20', country: 'Egypt' }, { code: '+234', country: 'Nigeria' },
  { code: '+254', country: 'Kenya' }, { code: '+92', country: 'Pakistan' }, { code: '+880', country: 'Bangladesh' },
  { code: '+94', country: 'Sri Lanka' }, { code: '+977', country: 'Nepal' }, { code: '+975', country: 'Bhutan' },
  { code: '+60', country: 'Malaysia' }, { code: '+65', country: 'Singapore' }, { code: '+66', country: 'Thailand' },
  { code: '+84', country: 'Vietnam' }, { code: '+62', country: 'Indonesia' }, { code: '+63', country: 'Philippines' },
  { code: '+971', country: 'UAE' }, { code: '+966', country: 'Saudi Arabia' }, { code: '+974', country: 'Qatar' },
  { code: '+965', country: 'Kuwait' }, { code: '+973', country: 'Bahrain' }, { code: '+968', country: 'Oman' },
  { code: '+972', country: 'Israel' }, { code: '+90', country: 'Turkey' }, { code: '+98', country: 'Iran' },
  { code: '+964', country: 'Iraq' }, { code: '+39', country: 'Italy' }, { code: '+34', country: 'Spain' },
  { code: '+31', country: 'Netherlands' }, { code: '+32', country: 'Belgium' }, { code: '+46', country: 'Sweden' },
  { code: '+47', country: 'Norway' }, { code: '+45', country: 'Denmark' }, { code: '+358', country: 'Finland' },
  { code: '+48', country: 'Poland' }, { code: '+380', country: 'Ukraine' }, { code: '+36', country: 'Hungary' },
  { code: '+420', country: 'Czech Republic' }, { code: '+40', country: 'Romania' }, { code: '+30', country: 'Greece' },
  { code: '+351', country: 'Portugal' }, { code: '+41', country: 'Switzerland' }, { code: '+43', country: 'Austria' },
  { code: '+64', country: 'New Zealand' }, { code: '+54', country: 'Argentina' }, { code: '+56', country: 'Chile' },
  { code: '+57', country: 'Colombia' }, { code: '+51', country: 'Peru' }, { code: '+58', country: 'Venezuela' },
  { code: '+53', country: 'Cuba' }, { code: '+1-876', country: 'Jamaica' }, { code: '+509', country: 'Haiti' },
  { code: '+212', country: 'Morocco' }, { code: '+216', country: 'Tunisia' }, { code: '+213', country: 'Algeria' },
  { code: '+218', country: 'Libya' }, { code: '+251', country: 'Ethiopia' }, { code: '+233', country: 'Ghana' },
  { code: '+255', country: 'Tanzania' }, { code: '+256', country: 'Uganda' }, { code: '+260', country: 'Zambia' },
  { code: '+263', country: 'Zimbabwe' }, { code: '+267', country: 'Botswana' }, { code: '+250', country: 'Rwanda' },
  { code: '+961', country: 'Lebanon' }, { code: '+962', country: 'Jordan' }, { code: '+93', country: 'Afghanistan' },
  { code: '+95', country: 'Myanmar' }, { code: '+856', country: 'Laos' }, { code: '+855', country: 'Cambodia' },
  { code: '+850', country: 'North Korea' }, { code: '+886', country: 'Taiwan' }, { code: '+852', country: 'Hong Kong' },
  { code: '+853', country: 'Macau' }, { code: '+976', country: 'Mongolia' }, { code: '+996', country: 'Kyrgyzstan' },
  { code: '+998', country: 'Uzbekistan' }, { code: '+992', country: 'Tajikistan' }, { code: '+993', country: 'Turkmenistan' },
  { code: '+994', country: 'Azerbaijan' }, { code: '+995', country: 'Georgia' }, { code: '+374', country: 'Armenia' },
  { code: '+375', country: 'Belarus' }, { code: '+370', country: 'Lithuania' }, { code: '+371', country: 'Latvia' },
  { code: '+372', country: 'Estonia' }, { code: '+421', country: 'Slovakia' }, { code: '+386', country: 'Slovenia' },
  { code: '+385', country: 'Croatia' }, { code: '+387', country: 'Bosnia' }, { code: '+381', country: 'Serbia' },
  { code: '+382', country: 'Montenegro' }, { code: '+389', country: 'North Macedonia' }, { code: '+355', country: 'Albania' },
  { code: '+359', country: 'Bulgaria' }, { code: '+353', country: 'Ireland' }, { code: '+354', country: 'Iceland' },
  { code: '+356', country: 'Malta' }, { code: '+357', country: 'Cyprus' }, { code: '+352', country: 'Luxembourg' },
  { code: '+423', country: 'Liechtenstein' }, { code: '+376', country: 'Andorra' }, { code: '+378', country: 'San Marino' },
  { code: '+1-246', country: 'Barbados' }, { code: '+1-268', country: 'Antigua' }, { code: '+1-784', country: 'St. Vincent' },
  { code: '+670', country: 'Timor-Leste' }, { code: '+675', country: 'Papua New Guinea' }, { code: '+679', country: 'Fiji' },
  { code: '+685', country: 'Samoa' }, { code: '+676', country: 'Tonga' }, { code: '+678', country: 'Vanuatu' },
];

/* ── Professional Title Options ── */
const JOB_TITLES = [
  'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer', 'Frontend Developer',
  'Backend Developer', 'Mobile Developer', 'iOS Developer', 'Android Developer',
  'React Developer', 'Node.js Developer', 'Python Developer', 'Java Developer',
  'DevOps Engineer', 'Site Reliability Engineer (SRE)', 'Cloud Engineer', 'Platform Engineer',
  'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'AI/ML Engineer',
  'Data Engineer', 'Business Intelligence Analyst', 'Research Scientist',
  'Product Manager', 'Senior Product Manager', 'Technical Product Manager',
  'UX Designer', 'UI/UX Designer', 'Product Designer', 'Graphic Designer',
  'UX Researcher', 'Interaction Designer', 'Visual Designer',
  'QA Engineer', 'Test Automation Engineer', 'Manual Tester',
  'Cybersecurity Analyst', 'Security Engineer', 'Penetration Tester', 'SOC Analyst',
  'Network Engineer', 'System Administrator', 'IT Support Engineer', 'IT Manager',
  'Solutions Architect', 'Enterprise Architect', 'Technical Architect',
  'Engineering Manager', 'VP of Engineering', 'CTO', 'Chief Engineer',
  'Project Manager', 'Scrum Master', 'Agile Coach', 'Technical Lead',
  'Blockchain Developer', 'Smart Contract Developer', 'Web3 Developer',
  'Game Developer', 'Unity Developer', 'Unreal Engine Developer',
  'Embedded Systems Engineer', 'Firmware Engineer', 'Hardware Engineer',
  'Robotics Engineer', 'Automation Engineer', 'Control Systems Engineer',
  'Business Analyst', 'Financial Analyst', 'Marketing Analyst',
  'Content Writer', 'Technical Writer', 'Documentation Specialist',
  'Digital Marketing Manager', 'SEO Specialist', 'Growth Hacker',
  'Sales Engineer', 'Pre-Sales Consultant', 'Solution Consultant',
  'Customer Success Manager', 'Account Executive', 'Business Development Manager',
  'HR Manager', 'Talent Acquisition Specialist', 'People Operations Manager',
  'Operations Manager', 'Supply Chain Manager', 'Logistics Manager',
  'Finance Manager', 'Accountant', 'Financial Controller',
  'Intern', 'Software Engineering Intern', 'Data Science Intern', 'Research Intern',
  'Fresher / Entry Level Developer', 'Graduate Trainee', 'Associate Engineer',
];

/* ── Phone Input with Country Code Dropdown ── */
function PhoneInput({ value, onChange }) {
  // Parse a combined phone string like "+91 9876543210" into code + number
  const parsePhone = (v) => {
    if (!v) return { code: '+91', number: '' };
    // Try longest match first to handle codes like +1-246 before +1
    const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    for (const c of sorted) {
      if (v.startsWith(c.code)) {
        return { code: c.code, number: v.slice(c.code.length).trim() };
      }
    }
    return { code: '+91', number: v };
  };

  const [code, setCode] = useState(() => parsePhone(value).code);
  const [number, setNumber] = useState(() => parsePhone(value).number);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const prevValue = useRef(value);

  // Sync internal state when parent value changes (e.g. draft loaded)
  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value;
      const parsed = parsePhone(value);
      setCode(parsed.code);
      setNumber(parsed.number);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCodeSelect = (c) => {
    setCode(c);
    setSearch('');
    setOpen(false);
    onChange(`${c} ${number}`.trim());
  };

  const handleNumberChange = (e) => {
    setNumber(e.target.value);
    onChange(`${code} ${e.target.value}`.trim());
  };

  const filtered = search
    ? COUNTRY_CODES.filter(c => c.country.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search))
    : COUNTRY_CODES;

  return (
    <div style={{ display: 'flex', gap: 8 }} ref={ref}>
      {/* Code Selector */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            height: 42, padding: '0 12px', border: '1px solid var(--border-color)',
            borderRadius: 8, background: 'var(--card-bg)', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            color: 'var(--text-main)'
          }}
        >
          {code} ▾
        </button>
        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, zIndex: 1000,
            background: 'var(--card-bg)', border: '1px solid var(--border-color)',
            borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            width: 230, maxHeight: 250, display: 'flex', flexDirection: 'column', marginTop: 2
          }}>
            <input
              className="form-input"
              style={{ margin: 6, width: 'calc(100% - 12px)', boxSizing: 'border-box' }}
              placeholder="Search country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filtered.map((c, i) => (
                <div
                  key={i}
                  onMouseDown={() => handleCodeSelect(c.code)}
                  style={{
                    padding: '8px 12px', cursor: 'pointer', fontSize: '0.82rem',
                    display: 'flex', justifyContent: 'space-between',
                    background: c.code === code ? 'var(--secondary)' : 'transparent',
                    color: c.code === code ? 'var(--primary)' : 'var(--text-main)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = c.code === code ? 'var(--secondary)' : 'transparent'}
                >
                  <span>{c.country}</span>
                  <span style={{ fontWeight: 600 }}>{c.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Number field */}
      <input
        className="form-input"
        style={{ flex: 1 }}
        type="tel"
        value={number}
        onChange={handleNumberChange}
        placeholder="Phone number"
      />
    </div>
  );
}

/* ── Professional Title Input with Datalist ── */
function TitleInput({ value, onChange }) {
  return (
    <div>
      <input
        className="form-input"
        list="job-titles-list"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. Full Stack Developer"
        autoComplete="off"
      />
      <datalist id="job-titles-list">
        {JOB_TITLES.map((t, i) => <option key={i} value={t} />)}
      </datalist>
    </div>
  );
}

function LocationInput({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=8&featuretype=city`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const places = data
        .map(item => {
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || item.display_name.split(',')[0];
          const state = addr.state || '';
          const country = addr.country || '';
          const parts = [city, state, country].filter(Boolean);
          return parts.join(', ');
        })
        .filter(Boolean);
      // Deduplicate
      const unique = [...new Set(places)];
      setSuggestions(unique);
      setShowDropdown(unique.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setShowDropdown(false);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const handleSelect = (place) => {
    onChange(place);
    setSuggestions([]);
    setShowDropdown(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          className="form-input"
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="e.g. Bangalore, India"
          autoComplete="off"
          style={{ paddingRight: loading ? '2.5rem' : undefined }}
        />
        {loading && (
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <Loader2 size={14} className="spin" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          </span>
        )}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
          background: 'var(--card-bg)', border: '1px solid var(--border-color)',
          borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          maxHeight: 220, overflowY: 'auto', marginTop: 2
        }}>
          {suggestions.map((s, i) => (
            <div
              key={i}
              onMouseDown={() => handleSelect(s)}
              style={{
                padding: '9px 14px', cursor: 'pointer', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: 8,
                borderBottom: i < suggestions.length - 1 ? '1px solid var(--border-color)' : 'none',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <MapPin size={13} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Reusable live preview panel ── */
function LivePreviewPanel({ templateId, formData, accentColor, zoom, setZoom, showZoomControls = false, label }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', background: 'var(--card-bg)',
        borderBottom: '1px solid var(--border-color)', flexShrink: 0
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {label || 'Live Preview'}
        </span>
        {showZoomControls && setZoom && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="btn" style={{ padding: '3px 9px', fontSize: '0.8rem' }} onClick={() => setZoom(p => Math.max(0.3, p - 0.05))}>−</button>
            <span style={{ fontSize: '0.78rem', minWidth: 36, textAlign: 'center', fontWeight: 600 }}>{Math.round((zoom || 0.55) * 100)}%</span>
            <button className="btn" style={{ padding: '3px 9px', fontSize: '0.8rem' }} onClick={() => setZoom(p => Math.min(1.2, p + 0.05))}>+</button>
          </div>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#e8eaf0', padding: '12px' }}>
        <div style={{
          transform: `scale(${zoom || 0.55})`,
          transformOrigin: 'top center',
          width: `${Math.round((1 / (zoom || 0.55)) * 100)}%`,
          marginLeft: `${-((1 / (zoom || 0.55)) - 1) * 50}%`,
          background: '#fff',
          boxShadow: '0 2px 16px rgba(0,0,0,0.14)',
          borderRadius: 2,
          minHeight: 900,
        }}>
          <ResumePreview templateId={templateId} formData={formData} accentColor={accentColor} />
        </div>
      </div>
    </div>
  );
}

export default function ResumeBuilder({ loadedDraft, setLoadedDraft }) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('minimalist');
  const [accentColor, setAccentColor] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [improvingIdx, setImprovingIdx] = useState(null);
  const [zoom, setZoom] = useState(0.85);
  const resumeRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '', github: '',
    photo: '', summary: '',
    experience: [{ role: '', company: '', dates: '', bullets: [''] }],
    projects: [],
    education: [{ degree: '', school: '', startMonth: '', startYear: '', endMonth: '', endYear: '', city: '', cgpa: '' }],
    skills: { languages: [], frontend: [], backend: [], ai_tools: [] },
    skillInput: { category: 'languages', text: '' },
    certifications: [],
    awards: [],
    languages: [],
    publications: [],
    profiles: []
  });

  // Load Draft
  useEffect(() => {
    if (loadedDraft) {
      const fd = { ...loadedDraft.formData };
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

  const removePhoto = () => updateField('photo', '');

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
      const response = await fetch(`${API_BASE}/refine-summary`, {
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
      alert(`AI Refine failed: ${error.message}.`);
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
      const response = await fetch(`${API_BASE}/improve-text`, {
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
      const response = await fetch(`${API_BASE}/improve-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context: 'Achievement or Certification' })
      });
      if (!response.ok) throw new Error(`Server error ${response.status}`);
      const data = await response.json();
      if (data.improved_text) {
        updateArrayItem(arrayName, idx, 'name', data.improved_text);
      }
    } catch (error) {
      console.error('AI Improve Achievement failed:', error);
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
      </style>
      </head><body>
      ${resumeEl.innerHTML}
      <script>window.onload=function(){window.print();window.close();}<\/script>
      </body></html>
    `);
    printWindow.document.close();
  };

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

  const handleExportPDF = async () => {
    try {
      const exportData = { ...formData };
      delete exportData.skillInput;
      const response = await fetch(`${API_BASE}/generate-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Server error ${response.status}: ${errText.slice(0, 200)}`);
      }
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('pdf')) {
        throw new Error('Server did not return a valid PDF. Use Print instead.');
      }
      const blob = await response.blob();
      if (blob.size < 100) throw new Error('PDF is empty.');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(formData.name || 'resume').replace(/\s+/g, '_').toLowerCase()}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF export error:', error);
      if (window.confirm(`PDF export failed: ${error.message}\n\nUse browser Print instead?`)) handlePrint();
    }
  };

  /* ── STEP PREVIEW PANEL PROPS ── */
  const sidePreviewProps = { templateId: selectedTemplate, formData, accentColor, zoom: 0.55 };

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
        <div className="builder-split-layout" style={{ flex: 1, minHeight: 0 }}>
          <div className="builder-form-panel" style={{ overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Personal Information</h2>

            {/* Photo Upload */}
            <div className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: formData.photo ? 'transparent' : 'var(--secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', border: '2px solid var(--border-color)', flexShrink: 0,
                position: 'relative'
              }}>
                {formData.photo
                  ? <img src={formData.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Upload size={24} color="var(--primary)" />}
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ marginBottom: 4, display: 'block' }}>Profile Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ fontSize: '0.82rem' }} />
                {formData.photo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>✓ Photo uploaded – shows in preview</span>
                    <button onClick={removePhoto} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Alex Chen" /></div>
              <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder="you@email.com" /></div>
              <div className="form-group"><label className="form-label">Mobile Number</label><PhoneInput value={formData.phone} onChange={val => updateField('phone', val)} /></div>
              <div className="form-group">
                <label className="form-label">Location / City</label>
                <LocationInput value={formData.location} onChange={val => updateField('location', val)} />
              </div>
              <div className="form-group"><label className="form-label">LinkedIn Profile</label><input className="form-input" value={formData.linkedin} onChange={e => updateField('linkedin', e.target.value)} placeholder="linkedin.com/in/yourname" /></div>
              <div className="form-group"><label className="form-label">GitHub Profile</label><input className="form-input" value={formData.github} onChange={e => updateField('github', e.target.value)} placeholder="github.com/yourname" /></div>
              <div className="form-group"><label className="form-label">Professional Title</label><TitleInput value={formData.title} onChange={val => updateField('title', val)} /></div>
              <div className="form-group"><label className="form-label">Portfolio Website</label><input className="form-input" value={formData.website} onChange={e => updateField('website', e.target.value)} placeholder="yoursite.com" /></div>
            </div>

            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.92rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>Profiles</h4>
            {formData.profiles.map((prof, pIdx) => (
              <div key={pIdx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="form-input" placeholder="Platform (e.g. LeetCode)" value={prof.platform} onChange={e => updateArrayItem('profiles', pIdx, 'platform', e.target.value)} style={{ flex: 1 }} />
                <input className="form-input" placeholder="URL" value={prof.url} onChange={e => updateArrayItem('profiles', pIdx, 'url', e.target.value)} style={{ flex: 2 }} />
                <button onClick={() => removeArrayItem('profiles', pIdx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            ))}
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', marginBottom: '1.5rem', width: '100%' }} onClick={() => addArrayItem('profiles', { platform: '', url: '' })}><Plus size={14} /> Add Profile</button>

            <div className="form-group">
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>Professional Summary</label>
                <button
                  className="btn"
                  style={{
                    padding: '5px 12px', fontSize: '0.78rem',
                    background: isRefining ? 'var(--secondary)' : 'linear-gradient(135deg, #3b28cc, #6c63ff)',
                    color: isRefining ? 'var(--primary)' : 'white', borderRadius: 20,
                    display: 'flex', alignItems: 'center', gap: 5,
                    boxShadow: '0 2px 8px rgba(59,40,204,0.25)'
                  }}
                  onClick={handleRefineWithAI}
                  disabled={isRefining}
                >
                  {isRefining ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={13} />}
                  {isRefining ? 'Refining...' : '✨ Refine with AI'}
                </button>
              </div>
              <textarea
                className="form-input"
                style={{ minHeight: 130, resize: 'vertical' }}
                value={formData.summary}
                onChange={e => updateField('summary', e.target.value)}
                placeholder="Write your professional summary here… AI will rewrite it professionally when you click Refine with AI"
              />
            </div>

            <div className="builder-nav-row">
              <button className="btn btn-outline" onClick={() => setStep(1)}><ChevronLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Next: Experience <ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Side Preview */}
          <div className="builder-preview-panel">
            <LivePreviewPanel {...sidePreviewProps} label="Live Preview" />
          </div>
        </div>
      )}

      {/* ── STEP 3: Experience & Skills ── */}
      {step === 3 && (
        <div className="builder-split-layout" style={{ flex: 1, minHeight: 0 }}>
          <div className="builder-form-panel" style={{ overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Experience &amp; Credentials</h2>

            {/* Work Experience */}
            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.92rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>Work Experience</h4>
            {formData.experience.map((exp, expIdx) => (
              <div key={expIdx} className="card" style={{ marginBottom: '1rem', position: 'relative' }}>
                <button onClick={() => removeArrayItem('experience', expIdx)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                <div className="grid-2" style={{ gap: '0.8rem', marginBottom: '0.8rem' }}>
                  <div><label className="form-label">Role / Title</label><input className="form-input" value={exp.role} onChange={e => updateArrayItem('experience', expIdx, 'role', e.target.value)} /></div>
                  <div><label className="form-label">Company Name</label><input className="form-input" value={exp.company} onChange={e => updateArrayItem('experience', expIdx, 'company', e.target.value)} /></div>
                </div>
                <div style={{ marginBottom: '0.8rem' }}><label className="form-label">Duration</label><input className="form-input" placeholder="e.g. July 2023 – Present" value={exp.dates} onChange={e => updateArrayItem('experience', expIdx, 'dates', e.target.value)} /></div>

                <label className="form-label">Key Responsibilities / Bullets</label>
                {exp.bullets.map((b, bIdx) => {
                  const key = `experience-${expIdx}-${bIdx}`;
                  return (
                    <div key={bIdx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <textarea className="form-input" style={{ minHeight: '58px', width: '100%', resize: 'vertical' }} value={b} onChange={e => updateBullet('experience', expIdx, bIdx, e.target.value)} />
                        <button className="btn" style={{ fontSize: '0.7rem', padding: '2px 8px', marginTop: 4, background: 'var(--secondary)', color: 'var(--primary)' }}
                          onClick={() => handleImproveBullet('experience', expIdx, bIdx, b)} disabled={improvingIdx === key}>
                          {improvingIdx === key ? 'Improving…' : <><Sparkles size={12} /> Improve with AI</>}
                        </button>
                      </div>
                      <button onClick={() => removeBullet('experience', expIdx, bIdx)} style={{ background: 'none', border: 'none', color: '#ef4444', marginTop: 8, cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  );
                })}
                <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => addBullet('experience', expIdx)}><Plus size={14} /> Add Bullet Point</button>
              </div>
            ))}
            <button className="btn btn-outline" style={{ marginBottom: '1.5rem', width: '100%' }} onClick={() => addArrayItem('experience', { role: '', company: '', dates: '', bullets: [''] })}><Plus size={16} /> Add New Experience</button>

            {/* Projects */}
            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.92rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>Projects</h4>
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
                        <textarea className="form-input" style={{ minHeight: '58px', width: '100%', resize: 'vertical' }} value={b} onChange={e => updateBullet('projects', pIdx, bIdx, e.target.value)} />
                        <button className="btn" style={{ fontSize: '0.7rem', padding: '2px 8px', marginTop: 4, background: 'var(--secondary)', color: 'var(--primary)' }}
                          onClick={() => handleImproveBullet('projects', pIdx, bIdx, b)} disabled={improvingIdx === key}>
                          {improvingIdx === key ? 'Improving…' : <><Sparkles size={12} /> Improve with AI</>}
                        </button>
                      </div>
                      <button onClick={() => removeBullet('projects', pIdx, bIdx)} style={{ background: 'none', border: 'none', color: '#ef4444', marginTop: 8, cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  );
                })}
                <button className="btn btn-outline" style={{ fontSize: '0.8rem' }} onClick={() => addBullet('projects', pIdx)}><Plus size={14} /> Add Bullet Point</button>
              </div>
            ))}
            <button className="btn btn-outline" style={{ marginBottom: '1.5rem', width: '100%' }} onClick={() => addArrayItem('projects', { name: '', link: '', tech_stack: '', bullets: [''] })}><Plus size={16} /> Add New Project</button>

            {/* Education */}
            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.92rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>Education</h4>
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
            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.92rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>Achievements &amp; Certifications</h4>
            {formData.awards.map((aw, aIdx) => {
              const key = `awards-${aIdx}`;
              return (
                <div key={aIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" placeholder="Achievement/Cert Name" value={aw.name} onChange={e => updateArrayItem('awards', aIdx, 'name', e.target.value)} style={{ flex: 2 }} />
                    <input className="form-input" placeholder="Year" value={aw.year} onChange={e => updateArrayItem('awards', aIdx, 'year', e.target.value)} style={{ flex: 1 }} />
                    <button onClick={() => removeArrayItem('awards', aIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                  </div>
                  <button className="btn" style={{ alignSelf: 'flex-start', fontSize: '0.7rem', padding: '2px 8px', background: 'var(--secondary)', color: 'var(--primary)' }}
                    onClick={() => handleImproveAchievement('awards', aIdx, aw.name)} disabled={improvingIdx === key}>
                    {improvingIdx === key ? 'Improving…' : <><Sparkles size={12} /> Improve with AI</>}
                  </button>
                </div>
              );
            })}
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', width: '100%', marginBottom: '1.5rem' }} onClick={() => addArrayItem('awards', { name: '', year: '' })}><Plus size={14} /> Add Achievement/Certification</button>

            {/* Publications */}
            <h4 style={{ marginBottom: '0.8rem', fontSize: '0.92rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>Publications (Optional)</h4>
            {formData.publications.map((pub, pIdx) => (
              <div key={pIdx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="form-input" placeholder="Title" value={pub.title} onChange={e => updateArrayItem('publications', pIdx, 'title', e.target.value)} style={{ flex: 2 }} />
                <input className="form-input" placeholder="Link" value={pub.link} onChange={e => updateArrayItem('publications', pIdx, 'link', e.target.value)} style={{ flex: 1 }} />
                <button onClick={() => removeArrayItem('publications', pIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
              </div>
            ))}
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', width: '100%', marginBottom: '1.5rem' }} onClick={() => addArrayItem('publications', { title: '', link: '', year: '' })}><Plus size={14} /> Add Publication</button>

            {/* Technical Skills */}
            <h4 style={{ margin: '0.5rem 0 0.8rem', fontSize: '0.92rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>Technical Skills</h4>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <select className="form-input" value={formData.skillInput.category} onChange={e => updateField('skillInput', { ...formData.skillInput, category: e.target.value })} style={{ flex: 1 }}>
                <option value="languages">Languages</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend &amp; Cloud</option>
                <option value="ai_tools">AI &amp; Tools</option>
              </select>
              <input className="form-input" placeholder="Type a skill and press Add…" value={formData.skillInput.text}
                onChange={e => updateField('skillInput', { ...formData.skillInput, text: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addSkill()} style={{ flex: 2 }} />
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

          {/* Side Preview */}
          <div className="builder-preview-panel">
            <LivePreviewPanel {...sidePreviewProps} label="Live Preview" />
          </div>
        </div>
      )}

      {/* ── STEP 4: Final Polish ── */}
      {step === 4 && (
        <div style={{ marginTop: '1rem', flex: 1, minHeight: 0 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Final Polish</h2>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Change template or accent color, then export your resume.</p>

          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1.6fr', alignItems: 'start', height: 'calc(100vh - 260px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', overflowY: 'auto', height: '100%', paddingRight: 4 }}>

              {/* Template Picker */}
              <div className="card">
                <h4 style={{ fontSize: '0.92rem', marginBottom: '1rem' }}>🎨 Change Template</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {TEMPLATES.map(t => (
                    <div key={t.id} onClick={() => setSelectedTemplate(t.id)} style={{
                      padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                      border: selectedTemplate === t.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: selectedTemplate === t.id ? 'var(--secondary)' : 'var(--card-bg)',
                      transition: 'all 0.2s'
                    }}>
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
                    <div key={c} onClick={() => setAccentColor(c)} style={{
                      width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer',
                      border: accentColor === c ? '3px solid white' : '2px solid transparent',
                      boxShadow: accentColor === c ? `0 0 0 2px ${c}` : 'none',
                      transition: 'all 0.2s'
                    }} />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <button className="btn btn-outline" style={{ padding: 12 }} onClick={saveDraft}>💾 Save Draft</button>
                <button className="btn btn-outline" style={{ padding: 12 }} onClick={handlePrint}>🖨️ Print</button>
              </div>

              <button className="btn btn-primary" style={{ padding: 14, width: '100%', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleExportPDF}>
                <Download size={16} /> Export PDF
              </button>

              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setStep(3)}><ChevronLeft size={16} /> Back to Experience</button>
            </div>

            {/* Live Preview with zoom */}
            <div style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: 14, overflow: 'hidden', background: 'var(--card-bg)' }}>
              <LivePreviewPanel
                templateId={selectedTemplate}
                formData={formData}
                accentColor={accentColor}
                zoom={zoom}
                setZoom={setZoom}
                showZoomControls
                label={`Live Preview — ${TEMPLATES.find(t => t.id === selectedTemplate)?.name || ''}`}
              />
              {/* Hidden ref for print */}
              <div ref={resumeRef} style={{ position: 'absolute', left: -9999, top: 0, width: 900 }}>
                <ResumePreview templateId={selectedTemplate} formData={formData} accentColor={accentColor} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
