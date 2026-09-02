import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import { User, Link as LinkIcon, FileText, Code, Save, Loader2, CheckCircle2 } from 'lucide-react';

function FormSection({ icon: Icon, title, children }) {
  return (
    <div className="card dark:bg-surface-800 space-y-5">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/40">
          <Icon size={16} className="text-primary" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      {hint && <p className="text-[10px] text-slate-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

export default function ProfileBuilder() {
  const { profile, refreshProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profileId, setProfileId] = useState(null);

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

  const handleSave = async () => {
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
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto pb-8 space-y-5"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Your Career Profile</h2>
        <p className="text-sm text-slate-400">Complete your profile to unlock tailored resume suggestions and job matching.</p>
      </div>

      {/* Basic Info */}
      <FormSection icon={User} title="Basic Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name">
            <input type="text" name="full_name" className="form-input" placeholder="Alex Chen" value={formData.full_name} onChange={handleChange} />
          </Field>
          <Field label="Professional Headline">
            <input type="text" name="headline" className="form-input" placeholder="Senior Full Stack Engineer" value={formData.headline} onChange={handleChange} />
          </Field>
          <Field label="Email Address" >
            <input type="email" name="email" className="form-input" placeholder="alex@example.com" value={formData.email} onChange={handleChange} />
          </Field>
        </div>
      </FormSection>

      {/* Social Links */}
      <FormSection icon={LinkIcon} title="Social & Portfolio Links">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Personal Website">
            <input type="text" name="website" className="form-input" placeholder="https://alexc.dev" value={formData.website} onChange={handleChange} />
          </Field>
          <Field label="GitHub">
            <input type="text" name="github" className="form-input" placeholder="github.com/alexc" value={formData.github} onChange={handleChange} />
          </Field>
          <Field label="LinkedIn">
            <input type="text" name="linkedin" className="form-input sm:col-span-2" placeholder="linkedin.com/in/alexc" value={formData.linkedin} onChange={handleChange} />
          </Field>
        </div>
      </FormSection>

      {/* Summary */}
      <FormSection icon={FileText} title="Professional Summary">
        <Field label="Summary" hint="A brief overview of your career and key achievements">
          <textarea
            name="summary" className="form-input" rows={4}
            placeholder="Results-driven Full Stack Engineer with 4+ years building scalable products..."
            value={formData.summary} onChange={handleChange}
          />
        </Field>
      </FormSection>

      {/* Skills */}
      <FormSection icon={Code} title="Skills & Expertise">
        <Field label="Skills" hint="Comma-separated — e.g. React, Node.js, Python, AWS">
          <input
            type="text" name="skills" className="form-input"
            placeholder="React, Node.js, Python, AWS, Docker..."
            value={formData.skills} onChange={handleChange}
          />
          {formData.skills && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {formData.skills.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                <span key={i} className="chip bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-400 border-primary-200 dark:border-primary-700 text-[10px]">
                  {s}
                </span>
              ))}
            </div>
          )}
        </Field>
      </FormSection>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-2">
        {success && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={16} /> Saved successfully!
          </span>
        )}
        <button className="btn btn-primary px-6" onClick={handleSave} disabled={loading}>
          {loading ? <><Loader2 size={16} className="spin" /> Saving…</> : <><Save size={16} /> Save Profile</>}
        </button>
      </div>
    </motion.div>
  );
}
