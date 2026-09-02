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
    <div className="flex gap-2" ref={ref}>
      {/* Code Selector */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="h-[42px] px-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm flex items-center gap-1.5 whitespace-nowrap hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          {code} ▾
        </button>
        {open && (
          <div className="absolute top-full left-0 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl w-[230px] max-h-[250px] flex flex-col mt-1 overflow-hidden">
            <div className="p-1.5 border-b border-slate-100 dark:border-slate-700">
              <input
                className="form-input w-full text-sm py-1.5 px-2"
                placeholder="Search country..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1 py-1">
              {filtered.map((c, i) => (
                <div
                  key={i}
                  onMouseDown={() => handleCodeSelect(c.code)}
                  className={`px-3 py-2 cursor-pointer text-xs flex justify-between items-center transition-colors ${
                    c.code === code 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="truncate mr-2">{c.country}</span>
                  <span className="font-semibold shrink-0">{c.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Number field */}
      <input
        className="form-input flex-1"
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
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          className={`form-input ${loading ? 'pr-10' : ''}`}
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="e.g. Bangalore, India"
          autoComplete="off"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 size={16} className="animate-spin text-blue-500" />
          </span>
        )}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-[220px] overflow-y-auto mt-1 flex flex-col py-1">
          {suggestions.map((s, i) => (
            <div
              key={i}
              onMouseDown={() => handleSelect(s)}
              className={`px-4 py-2.5 cursor-pointer text-sm flex items-center gap-2 transition-colors ${
                i < suggestions.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''
              } hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300`}
            >
              <MapPin size={14} className="shrink-0 text-blue-500" />
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
  const actualZoom = zoom || 0.55;
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-surface-800 border-b border-slate-200 dark:border-slate-700/60 shrink-0">
        <span className="font-bold text-[10px] tracking-wider uppercase text-slate-500 dark:text-slate-400">
          {label || 'Live Preview'}
        </span>
        {showZoomControls && setZoom && (
          <div className="flex gap-1 items-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md shadow-sm overflow-hidden">
            <button className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 font-medium transition-colors" onClick={() => setZoom(p => Math.max(0.3, p - 0.05))}>−</button>
            <span className="text-[11px] font-bold w-10 text-center text-slate-600 dark:text-slate-300 border-x border-slate-200 dark:border-slate-600 py-1">{Math.round(actualZoom * 100)}%</span>
            <button className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 font-medium transition-colors" onClick={() => setZoom(p => Math.min(1.2, p + 0.05))}>+</button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto bg-slate-200/50 dark:bg-slate-900/50 p-6 flex justify-center items-start">
        <div 
          style={{
            width: `${900 * actualZoom}px`,
            minHeight: `${1164 * actualZoom}px`,
            flexShrink: 0
          }}
        >
          <div 
            className="bg-white shadow-xl rounded-sm shrink-0 border border-slate-200 dark:border-none ring-1 ring-black/5 overflow-hidden"
            style={{
              transform: `scale(${actualZoom})`,
              transformOrigin: 'top left',
              width: '900px',
              minHeight: '1164px',
            }} 
          >
            <ResumePreview templateId={templateId} formData={formData} accentColor={accentColor} />
          </div>
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
      <div className="flex items-center justify-between mb-8 max-w-3xl mx-auto w-full px-4 relative mt-2">
        <div className="absolute top-4 left-10 right-10 h-[2px] bg-slate-200 dark:bg-slate-700/60 -z-10" />
        {STEPS.map((s, idx) => (
          <div key={s.num} className="relative flex flex-col items-center">
            <button
              onClick={() => step > s.num && setStep(s.num)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all shadow-sm ${
                step === s.num
                  ? 'bg-primary text-white ring-4 ring-primary-100 dark:ring-primary-900/40 scale-110'
                  : step > s.num
                  ? 'bg-primary-600 text-white cursor-pointer'
                  : 'bg-white dark:bg-surface-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-default'
              }`}
            >
              {step > s.num ? <CheckCircle2 size={16} /> : s.num}
            </button>
            <span className={`absolute top-11 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider ${step === s.num ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && <TemplateGallery selected={selectedTemplate} onSelect={setSelectedTemplate} onNext={() => setStep(2)} />}

      {/* ── STEP 2: Personal Info ── */}
      {step === 2 && (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto lg:pr-2 pb-10 space-y-6">
            <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Personal Information</h2>

            {/* Photo Upload */}
            <div className="space-y-1.5" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" style={{ marginBottom: 4, display: 'block' }}>Profile Photo (Optional)</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ gap: '1rem' }}>
              <div className="space-y-1.5"><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label><input className="form-input" value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Alex Chen" /></div>
              <div className="space-y-1.5"><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label><input className="form-input" value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder="you@email.com" /></div>
              <div className="space-y-1.5"><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mobile Number</label><PhoneInput value={formData.phone} onChange={val => updateField('phone', val)} /></div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Location / City</label>
                <LocationInput value={formData.location} onChange={val => updateField('location', val)} />
              </div>
              <div className="space-y-1.5"><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">LinkedIn Profile</label><input className="form-input" value={formData.linkedin} onChange={e => updateField('linkedin', e.target.value)} placeholder="linkedin.com/in/yourname" /></div>
              <div className="space-y-1.5"><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">GitHub Profile</label><input className="form-input" value={formData.github} onChange={e => updateField('github', e.target.value)} placeholder="github.com/yourname" /></div>
              <div className="space-y-1.5"><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Professional Title</label><TitleInput value={formData.title} onChange={val => updateField('title', val)} /></div>
              <div className="space-y-1.5"><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Portfolio Website</label><input className="form-input" value={formData.website} onChange={e => updateField('website', e.target.value)} placeholder="yoursite.com" /></div>
            </div>

            <h4 className="mb-4 text-[0.92rem] font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700/60 pb-2">Profiles</h4>
            {formData.profiles.map((prof, pIdx) => (
              <div key={pIdx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="form-input" placeholder="Platform (e.g. LeetCode)" value={prof.platform} onChange={e => updateArrayItem('profiles', pIdx, 'platform', e.target.value)} style={{ flex: 1 }} />
                <input className="form-input" placeholder="URL" value={prof.url} onChange={e => updateArrayItem('profiles', pIdx, 'url', e.target.value)} style={{ flex: 2 }} />
                <button onClick={() => removeArrayItem('profiles', pIdx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            ))}
            <button className="btn btn-outline" style={{ fontSize: '0.8rem', marginBottom: '1.5rem', width: '100%' }} onClick={() => addArrayItem('profiles', { platform: '', url: '' })}><Plus size={14} /> Add Profile</button>

            <div className="space-y-1.5">
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" style={{ margin: 0 }}>Professional Summary</label>
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

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200 dark:border-slate-700/60">
              <button className="btn btn-outline" onClick={() => setStep(1)}><ChevronLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>Next: Experience <ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Side Preview */}
          <div className="hidden lg:flex w-[45%] h-[calc(100vh-180px)] sticky top-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-surface-800 shadow-sm overflow-hidden flex-col">
            <LivePreviewPanel {...sidePreviewProps} label="Live Preview" />
          </div>
        </div>
      )}

      {/* ── STEP 3: Experience & Skills ── */}
      {step === 3 && (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto lg:pr-2 pb-10 space-y-6">
            <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Experience &amp; Credentials</h2>

            {/* Work Experience */}
            <h4 className="mb-4 text-[0.92rem] font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700/60 pb-2">Work Experience</h4>
            {formData.experience.map((exp, expIdx) => (
              <div key={expIdx} className="card mb-4 relative shadow-sm border border-slate-200 dark:border-slate-700/60 p-5">
                <button onClick={() => removeArrayItem('experience', expIdx)} className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-surface-800 p-1 rounded-md"><Trash2 size={16} /></button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Role / Title</label><input className="form-input" value={exp.role} onChange={e => updateArrayItem('experience', expIdx, 'role', e.target.value)} /></div>
                  <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label><input className="form-input" value={exp.company} onChange={e => updateArrayItem('experience', expIdx, 'company', e.target.value)} /></div>
                </div>
                <div style={{ marginBottom: '0.8rem' }}><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Duration</label><input className="form-input" placeholder="e.g. July 2023 – Present" value={exp.dates} onChange={e => updateArrayItem('experience', expIdx, 'dates', e.target.value)} /></div>

                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Key Responsibilities / Bullets</label>
                {exp.bullets.map((b, bIdx) => {
                  const key = `experience-${expIdx}-${bIdx}`;
                  return (
                    <div key={bIdx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <textarea className="form-input w-full min-h-[60px] resize-y py-2 text-sm leading-relaxed" value={b} onChange={e => updateBullet('experience', expIdx, bIdx, e.target.value)} placeholder="• Describe what you did and the impact it had..." />
                        <button className="btn flex items-center gap-1.5 text-[11px] py-1 px-2.5 mt-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 border-none rounded" 
                          onClick={() => handleImproveBullet('experience', expIdx, bIdx, b)} disabled={improvingIdx === key}>
                          {improvingIdx === key ? 'Improving…' : <><Sparkles size={12} /> Improve with AI</>}
                        </button>
                      </div>
                      <button onClick={() => removeBullet('experience', expIdx, bIdx)} className="text-red-400 hover:text-red-600 mt-2.5 p-1 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  );
                })}
                <button className="btn btn-ghost text-xs py-1 px-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mt-1" onClick={() => addBullet('experience', expIdx)}><Plus size={14} /> Add Bullet Point</button>
              </div>
            ))}
            <button className="btn border-dashed border-2 border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 w-full mb-6 py-3" onClick={() => addArrayItem('experience', { role: '', company: '', dates: '', bullets: [''] })}><Plus size={16} /> Add New Experience</button>

            {/* Projects */}
            <h4 className="mb-4 text-[0.92rem] font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700/60 pb-2">Projects</h4>
            {formData.projects.map((proj, pIdx) => (
              <div key={pIdx} className="card mb-4 relative shadow-sm border border-slate-200 dark:border-slate-700/60 p-5">
                <button onClick={() => removeArrayItem('projects', pIdx)} className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-surface-800 p-1 rounded-md"><Trash2 size={16} /></button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Project Name</label><input className="form-input" value={proj.name} onChange={e => updateArrayItem('projects', pIdx, 'name', e.target.value)} /></div>
                  <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Project Link</label><input className="form-input" value={proj.link} onChange={e => updateArrayItem('projects', pIdx, 'link', e.target.value)} /></div>
                </div>
                <div style={{ marginBottom: '0.8rem' }}><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tech Stack</label><input className="form-input" value={proj.tech_stack} onChange={e => updateArrayItem('projects', pIdx, 'tech_stack', e.target.value)} /></div>

                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Project Details / Bullets</label>
                {proj.bullets.map((b, bIdx) => {
                  const key = `projects-${pIdx}-${bIdx}`;
                  return (
                    <div key={bIdx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <textarea className="form-input w-full min-h-[60px] resize-y py-2 text-sm leading-relaxed" value={b} onChange={e => updateBullet('projects', pIdx, bIdx, e.target.value)} placeholder="• Describe what you did and the impact it had..." />
                        <button className="btn flex items-center gap-1.5 text-[11px] py-1 px-2.5 mt-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 border-none rounded" 
                          onClick={() => handleImproveBullet('projects', pIdx, bIdx, b)} disabled={improvingIdx === key}>
                          {improvingIdx === key ? 'Improving…' : <><Sparkles size={12} /> Improve with AI</>}
                        </button>
                      </div>
                      <button onClick={() => removeBullet('projects', pIdx, bIdx)} className="text-red-400 hover:text-red-600 mt-2.5 p-1 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  );
                })}
                <button className="btn btn-ghost text-xs py-1 px-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mt-1" onClick={() => addBullet('projects', pIdx)}><Plus size={14} /> Add Bullet Point</button>
              </div>
            ))}
            <button className="btn border-dashed border-2 border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 w-full mb-6 py-3" onClick={() => addArrayItem('projects', { name: '', link: '', tech_stack: '', bullets: [''] })}><Plus size={16} /> Add New Project</button>

            {/* Education */}
            <h4 className="mb-4 text-[0.92rem] font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700/60 pb-2">Education</h4>
            {formData.education.map((ed, edIdx) => (
              <div key={edIdx} className="card mb-4 relative shadow-sm border border-slate-200 dark:border-slate-700/60 p-5">
                <button onClick={() => removeArrayItem('education', edIdx)} className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-surface-800 p-1 rounded-md"><Trash2 size={16} /></button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">College / School Name</label><input className="form-input" value={ed.school} onChange={e => updateArrayItem('education', edIdx, 'school', e.target.value)} /></div>
                  <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Degree</label><input className="form-input" value={ed.degree} onChange={e => updateArrayItem('education', edIdx, 'degree', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">CGPA / Score</label><input className="form-input" value={ed.cgpa} onChange={e => updateArrayItem('education', edIdx, 'cgpa', e.target.value)} /></div>
                  <div><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">City</label><input className="form-input" value={ed.city} onChange={e => updateArrayItem('education', edIdx, 'city', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ gap: '0.8rem' }}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Start Date</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select className="form-input" value={ed.startMonth} onChange={e => updateArrayItem('education', edIdx, 'startMonth', e.target.value)}><option value="">Month</option>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                      <select className="form-input" value={ed.startYear} onChange={e => updateArrayItem('education', edIdx, 'startYear', e.target.value)}><option value="">Year</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">End Date</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select className="form-input" value={ed.endMonth} onChange={e => updateArrayItem('education', edIdx, 'endMonth', e.target.value)}><option value="">Month</option>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                      <select className="form-input" value={ed.endYear} onChange={e => updateArrayItem('education', edIdx, 'endYear', e.target.value)}><option value="">Year</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn border-dashed border-2 border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 w-full mb-6 py-3" onClick={() => addArrayItem('education', { degree: '', school: '', startMonth: '', startYear: '', endMonth: '', endYear: '', city: '', cgpa: '' })}><Plus size={16} /> Add Education</button>

            {/* Achievements & Certifications */}
            <h4 className="mb-4 text-[0.92rem] font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700/60 pb-2">Achievements &amp; Certifications</h4>
            {formData.awards.map((aw, aIdx) => {
              const key = `awards-${aIdx}`;
              return (
                <div key={aIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" placeholder="Achievement/Cert Name" value={aw.name} onChange={e => updateArrayItem('awards', aIdx, 'name', e.target.value)} style={{ flex: 2 }} />
                    <input className="form-input" placeholder="Year" value={aw.year} onChange={e => updateArrayItem('awards', aIdx, 'year', e.target.value)} style={{ flex: 1 }} />
                    <button onClick={() => removeArrayItem('awards', aIdx)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0 p-2 rounded-md"><Trash2 size={16} /></button>
                  </div>
                  <button className="btn self-start flex items-center gap-1.5 text-[11px] py-1 px-2.5 mt-1 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 border-none rounded" 
                    onClick={() => handleImproveAchievement('awards', aIdx, aw.name)} disabled={improvingIdx === key}>
                    {improvingIdx === key ? 'Improving…' : <><Sparkles size={12} /> Improve with AI</>}
                  </button>
                </div>
              );
            })}
            <button className="btn border-dashed border-2 border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 w-full mb-6 py-3" onClick={() => addArrayItem('awards', { name: '', year: '' })}><Plus size={16} /> Add Achievement/Certification</button>

            {/* Publications */}
            <h4 className="mb-4 text-[0.92rem] font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700/60 pb-2">Publications (Optional)</h4>
            {formData.publications.map((pub, pIdx) => (
              <div key={pIdx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="form-input" placeholder="Title" value={pub.title} onChange={e => updateArrayItem('publications', pIdx, 'title', e.target.value)} style={{ flex: 2 }} />
                <input className="form-input" placeholder="Link" value={pub.link} onChange={e => updateArrayItem('publications', pIdx, 'link', e.target.value)} style={{ flex: 1 }} />
                <button onClick={() => removeArrayItem('publications', pIdx)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0 p-2 rounded-md"><Trash2 size={16} /></button>
              </div>
            ))}
            <button className="btn border-dashed border-2 border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 w-full mb-6 py-3" onClick={() => addArrayItem('publications', { title: '', link: '', year: '' })}><Plus size={16} /> Add Publication</button>

            {/* Technical Skills */}
            <h4 className="mt-2 mb-4 text-[0.92rem] font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700/60 pb-2">Technical Skills</h4>
            <div className="flex gap-2 mb-4">
              <select className="form-input flex-1" value={formData.skillInput.category} onChange={e => updateField('skillInput', { ...formData.skillInput, category: e.target.value })}>
                <option value="languages">Languages</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend &amp; Cloud</option>
                <option value="ai_tools">AI &amp; Tools</option>
              </select>
              <input className="form-input flex-[2]" placeholder="Type a skill and press Add…" value={formData.skillInput.text}
                onChange={e => updateField('skillInput', { ...formData.skillInput, text: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addSkill()} />
              <button className="btn btn-primary" onClick={addSkill}>Add</button>
            </div>
            {['languages', 'frontend', 'backend', 'ai_tools'].map(category => (
              formData.skills[category] && formData.skills[category].length > 0 && (
                <div key={category} style={{ marginBottom: 10 }}>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{category.replace('_', ' ')}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills[category].map(s => (
                      <span key={s} className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium flex items-center gap-1.5 border border-blue-100 dark:border-blue-800/50">
                        {s} <span onClick={() => removeSkill(category, s)} className="cursor-pointer text-slate-400 hover:text-red-500 text-sm leading-none transition-colors">×</span>
                      </span>
                    ))}
                  </div>
                </div>
              )
            ))}

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200 dark:border-slate-700/60" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(2)}><ChevronLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>Next: Final Polish <ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Side Preview */}
          <div className="hidden lg:flex w-[45%] h-[calc(100vh-180px)] sticky top-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-surface-800 shadow-sm overflow-hidden flex-col">
            <LivePreviewPanel {...sidePreviewProps} label="Live Preview" />
          </div>
        </div>
      )}

      {/* ── STEP 4: Final Polish ── */}
      {step === 4 && (
        <div className="mt-4 flex-1 min-h-0">
          <h2 className="text-2xl font-bold mb-1 text-slate-800 dark:text-slate-100">Final Polish</h2>
          <p className="text-sm mb-6 text-slate-500 dark:text-slate-400">Change template or accent color, then export your resume.</p>

          <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1fr_1.6fr] items-start h-[calc(100vh-260px)]">
            <div className="flex flex-col gap-5 overflow-y-auto h-full pr-1">

              {/* Template Picker */}
              <div className="card">
                <h4 className="text-[0.92rem] font-bold mb-4 flex items-center gap-2"><span className="text-lg">🎨</span> Change Template</h4>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map(t => (
                    <div key={t.id} onClick={() => setSelectedTemplate(t.id)} className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${selectedTemplate === t.id ? 'border-primary-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-surface-800 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                      <p className={`font-semibold text-sm ${selectedTemplate === t.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}`}>{t.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.type}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="card">
                <h4 className="text-[0.92rem] font-bold mb-4 flex items-center gap-2"><span className="text-lg">🖌️</span> Accent Color</h4>
                <div className="flex flex-wrap gap-3">
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
              <div className="grid grid-cols-2 gap-3">
                <button className="btn btn-outline" style={{ padding: 12 }} onClick={saveDraft}>💾 Save Draft</button>
                <button className="btn btn-outline" style={{ padding: 12 }} onClick={handlePrint}>🖨️ Print</button>
              </div>

              <button className="btn btn-primary" style={{ padding: 14, width: '100%', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleExportPDF}>
                <Download size={16} /> Export PDF
              </button>

              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setStep(3)}><ChevronLeft size={16} /> Back to Experience</button>
            </div>

            {/* Live Preview with zoom */}
            <div className="h-full min-h-0 flex flex-col border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-surface-800">
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
