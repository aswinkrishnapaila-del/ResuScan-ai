import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Link as LinkIcon, FileText, Code, Save, Loader2,
  CheckCircle2, X, ChevronDown, Plus, Sparkles
} from 'lucide-react';

// ─── Comprehensive skill taxonomy ──────────────────────────────────────────────
const ALL_SKILLS = [
  // Programming Languages
  'Python','JavaScript','TypeScript','Java','C++','C#','Go','Rust','PHP','Ruby',
  'Kotlin','Swift','Scala','R','MATLAB','Perl','Dart','Elixir','Haskell','Lua',
  'Shell / Bash','PowerShell','SQL','HTML','CSS',
  // Frontend
  'React','Next.js','Vue.js','Angular','Svelte','Redux','Zustand','React Query',
  'Tailwind CSS','Bootstrap','Material UI','Framer Motion','Vite','Webpack','SASS/SCSS',
  'Figma','UI/UX Design','Storybook','Three.js','D3.js','WebGL',
  // Backend & API
  'Node.js','FastAPI','Flask','Django','Express.js','Spring Boot','NestJS','Laravel',
  'ASP.NET','Rails','GraphQL','REST API','gRPC','WebSockets','Microservices',
  // Databases
  'PostgreSQL','MySQL','MongoDB','Redis','Elasticsearch','Cassandra','SQLite',
  'Firebase','Supabase','DynamoDB','Prisma','SQLAlchemy','Mongoose','Drizzle',
  'BigQuery','Snowflake','dbt',
  // DevOps & Cloud
  'Docker','Kubernetes','Terraform','Ansible','Jenkins','GitHub Actions','GitLab CI',
  'CircleCI','AWS','Google Cloud (GCP)','Azure','Nginx','Linux','Helm','ArgoCD',
  'Prometheus','Grafana','Datadog','New Relic','ELK Stack',
  // AI & ML
  'Machine Learning','Deep Learning','NLP','Computer Vision','TensorFlow','PyTorch',
  'Scikit-learn','Keras','Hugging Face','OpenAI API','LangChain','RAG','LLMs',
  'MLflow','Pandas','NumPy','Matplotlib','Seaborn','Jupyter',
  // Mobile
  'React Native','Flutter','SwiftUI','Jetpack Compose','iOS Development','Android Development',
  // Testing
  'Jest','Pytest','Cypress','Playwright','Selenium','JUnit','Testing Library',
  // Tools & Others
  'Git','GitHub','JIRA','Confluence','Notion','Postman','Insomnia',
  'Stripe API','Twilio API','SendGrid','Cloudflare','Vercel','Netlify',
  'Shopify','WordPress','Linux Administration','Technical Writing','Agile / Scrum',
  'System Design','Data Structures & Algorithms','Cybersecurity','Blockchain',
  'Solidity','Web3','Unity','Unreal Engine','Arduino','Raspberry Pi',
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function FormSection({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
          <Icon size={17} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-[11px] text-slate-400 mb-1.5 leading-relaxed">{hint}</p>}
      {children}
    </div>
  );
}

// ─── Skills Autocomplete Picker ──────────────────────────────────────────────

function SkillsPicker({ value, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = value
    ? value.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const suggestions = ALL_SKILLS.filter(s =>
    s.toLowerCase().includes(query.toLowerCase()) &&
    !selected.map(x => x.toLowerCase()).includes(s.toLowerCase())
  ).slice(0, 8);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addSkill = useCallback((skill) => {
    const next = [...selected, skill].join(', ');
    onChange(next);
    setQuery('');
    setHighlighted(0);
    inputRef.current?.focus();
  }, [selected, onChange]);

  const removeSkill = useCallback((skill) => {
    const next = selected.filter(s => s !== skill).join(', ');
    onChange(next);
  }, [selected, onChange]);

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') setHighlighted(h => Math.min(h + 1, suggestions.length - 1));
    else if (e.key === 'ArrowUp') setHighlighted(h => Math.max(h - 1, 0));
    else if (e.key === 'Enter' && suggestions[highlighted]) {
      e.preventDefault();
      addSkill(suggestions[highlighted]);
    } else if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    else if (e.key === 'Backspace' && !query && selected.length) {
      removeSkill(selected[selected.length - 1]);
    }
  };

  // Add custom skill on comma or Enter when no suggestion matches exactly
  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.endsWith(',')) {
      const skill = val.slice(0, -1).trim();
      if (skill && !selected.map(s => s.toLowerCase()).includes(skill.toLowerCase())) {
        addSkill(skill);
      }
      setQuery('');
    } else {
      setQuery(val);
      setOpen(val.length > 0);
      setHighlighted(0);
    }
  };

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Selected skill tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {selected.map((skill, i) => (
              <motion.span
                key={skill}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1.5"
              >
                {skill}
                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  onClick={() => removeSkill(skill)}
                  className="hover:text-red-500 transition-colors focus:outline-none focus:ring-1 focus:ring-red-300 rounded-full"
                >
                  <X size={12} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Input + dropdown */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/50 transition-all">
          <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            aria-label="Add skills - type to search or enter custom skill"
            aria-expanded={open}
            aria-autocomplete="list"
            role="combobox"
            value={query}
            onChange={handleInputChange}
            onFocus={() => { if (query.length > 0) setOpen(true); }}
            onKeyDown={handleKeyDown}
            placeholder={selected.length ? 'Add more skills...' : 'Type a skill, e.g. React, Python, AWS...'}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none min-w-0"
          />
          <button
            type="button"
            aria-label="Toggle skill suggestions"
            onClick={() => setOpen(v => !v)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {open && suggestions.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
              transition={{ duration: 0.12 }}
              role="listbox"
              aria-label="Skill suggestions"
              className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
              style={{ transformOrigin: 'top' }}
            >
              {suggestions.map((skill, i) => (
                <li
                  key={skill}
                  role="option"
                  aria-selected={i === highlighted}
                  onMouseDown={(e) => { e.preventDefault(); addSkill(skill); }}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    i === highlighted
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Plus size={13} className="text-slate-400 flex-shrink-0" />
                  {skill}
                </li>
              ))}
              {query && !suggestions.find(s => s.toLowerCase() === query.toLowerCase()) && (
                <li
                  role="option"
                  onMouseDown={(e) => { e.preventDefault(); addSkill(query.trim()); }}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm cursor-pointer text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-t border-slate-100 dark:border-slate-700"
                >
                  <Plus size={13} className="flex-shrink-0" />
                  Add "<strong>{query.trim()}</strong>"
                </li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <p className="text-[11px] text-slate-400">
        Type to search from 100+ skills, or enter a custom skill. Press <kbd className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-[10px]">Enter</kbd> or <kbd className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-[10px]">,</kbd> to add.
      </p>
    </div>
  );
}

// ─── ProfileBuilder Page ──────────────────────────────────────────────────────

export default function ProfileBuilder() {
  const { profile, refreshProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [consent, setConsent] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '', headline: '', email: '',
    website: '', github: '', linkedin: '',
    summary: '', skills: '',
  });

  useEffect(() => {
    if (profile) {
      setProfileId(profile.id);
      setFormData({
        full_name: profile.full_name || '',
        headline:  profile.headline  || '',
        email:     profile.email     || '',
        website:   profile.website   || '',
        github:    profile.github    || '',
        linkedin:  profile.linkedin  || '',
        summary:   profile.summary   || '',
        skills:    profile.skills ? profile.skills.join(', ') : '',
      });
    }
  }, [profile]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSkillsChange = val => setFormData(prev => ({ ...prev, skills: val }));

  const handleSave = async () => {
    if (!consent) {
      alert('Please agree to the data consent checkbox before saving your profile.');
      return;
    }
    setLoading(true); setSuccess(false);
    try {
      const payload = {
        full_name: formData.full_name, headline: formData.headline,
        email: formData.email, website: formData.website,
        github: formData.github, linkedin: formData.linkedin,
        summary: formData.summary,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        updated_at: new Date(),
      };
      let error, insertedId = profileId;
      if (profileId) {
        const res = await supabase.from('profiles').update(payload).eq('id', profileId);
        error = res.error;
      } else {
        const res = await supabase.from('profiles').insert([payload]).select();
        error = res.error;
        if (res.data?.length > 0) { insertedId = res.data[0].id; setProfileId(insertedId); }
      }
      if (error) localStorage.setItem('resuscan_profile', JSON.stringify({ ...payload, id: insertedId || '00000000-0000-0000-0000-000000000000' }));
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      const fallback = { ...formData, skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean), updated_at: new Date() };
      localStorage.setItem('resuscan_profile', JSON.stringify({ ...fallback, id: profileId || '00000000-0000-0000-0000-000000000000' }));
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10 space-y-5">
      {/* Page heading */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Career Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complete your profile to unlock tailored resume suggestions and job matching.
        </p>
      </div>

      {/* Basic Info */}
      <FormSection icon={User} title="Basic Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name" required>
            <input
              type="text" name="full_name"
              aria-label="Full name"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50"
              placeholder="Alex Chen"
              value={formData.full_name} onChange={handleChange}
            />
          </Field>
          <Field label="Professional Headline">
            <input
              type="text" name="headline"
              aria-label="Professional headline"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50"
              placeholder="Senior Full Stack Engineer"
              value={formData.headline} onChange={handleChange}
            />
          </Field>
          <Field label="Email Address" required>
            <input
              type="email" name="email"
              aria-label="Email address"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50"
              placeholder="alex@example.com"
              value={formData.email} onChange={handleChange}
            />
          </Field>
        </div>
      </FormSection>

      {/* Social Links */}
      <FormSection icon={LinkIcon} title="Social & Portfolio Links">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Personal Website">
            <input
              type="url" name="website"
              aria-label="Personal website URL"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50"
              placeholder="https://alexc.dev"
              value={formData.website} onChange={handleChange}
            />
          </Field>
          <Field label="GitHub">
            <input
              type="text" name="github"
              aria-label="GitHub profile URL"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50"
              placeholder="github.com/alexc"
              value={formData.github} onChange={handleChange}
            />
          </Field>
          <Field label="LinkedIn">
            <input
              type="text" name="linkedin"
              aria-label="LinkedIn profile URL"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 sm:col-span-2"
              placeholder="linkedin.com/in/alexc"
              value={formData.linkedin} onChange={handleChange}
            />
          </Field>
        </div>
      </FormSection>

      {/* Summary */}
      <FormSection icon={FileText} title="Professional Summary">
        <Field label="Summary" hint="A concise overview of your career, key achievements, and what you bring to roles.">
          <textarea
            name="summary"
            aria-label="Professional summary"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 resize-none"
            rows={4}
            placeholder="Results-driven Full Stack Engineer with 4+ years building scalable products used by 100K+ users..."
            value={formData.summary} onChange={handleChange}
          />
        </Field>
      </FormSection>

      {/* Skills */}
      <FormSection icon={Code} title="Skills & Expertise">
        <Field
          label="Skills"
          hint="Search from our library of 100+ skills or type your own. Your selected skills improve job matching accuracy."
        >
          <SkillsPicker value={formData.skills} onChange={handleSkillsChange} />
        </Field>
      </FormSection>

      {/* Data Consent */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/10 p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            id="profile-consent"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-amber-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            aria-required="true"
          />
          <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            I agree that ResuScan AI may store my profile information (name, email, skills, summary) to provide
            personalised resume and job matching services. I understand I can delete my data at any time.
            See our{' '}
            <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 underline focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded">
              Privacy Policy
            </a>{' '}and{' '}
            <a href="/terms" className="text-indigo-600 dark:text-indigo-400 underline focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded">
              Terms & Conditions
            </a>.
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-1">
        <AnimatePresence>
          {success && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 size={16} />
              Saved successfully!
            </motion.span>
          )}
        </AnimatePresence>
        <button
          id="save-profile-btn"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          onClick={handleSave}
          disabled={loading || !consent}
          aria-label="Save profile"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
            : <><Save size={16} /> Save Profile</>
          }
        </button>
      </div>
    </div>
  );
}
