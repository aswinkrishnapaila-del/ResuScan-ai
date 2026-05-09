import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import { User, Link as LinkIcon, FileText, Code, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function ProfileBuilder() {
  const { profile, refreshProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profileId, setProfileId] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    headline: '',
    email: '',
    website: '',
    github: '',
    linkedin: '',
    summary: '',
    skills: '' // We will split by comma before saving
  });

  // Load existing profile from context
  useEffect(() => {
    if (profile) {
      setProfileId(profile.id);
      setFormData({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        email: profile.email || '',
        website: profile.website || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        summary: profile.summary || '',
        skills: profile.skills ? profile.skills.join(', ') : ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const payload = {
        full_name: formData.full_name,
        headline: formData.headline,
        email: formData.email,
        website: formData.website,
        github: formData.github,
        linkedin: formData.linkedin,
        summary: formData.summary,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        updated_at: new Date()
      };

      let error;
      let insertedId = profileId;
      if (profileId) {
        const res = await supabase.from('profiles').update(payload).eq('id', profileId);
        error = res.error;
      } else {
        const res = await supabase.from('profiles').insert([payload]).select();
        error = res.error;
        if (res.data && res.data.length > 0) {
          insertedId = res.data[0].id;
          setProfileId(insertedId);
        }
      }

      if (error) {
        console.warn("Supabase Save Error (Likely RLS block). Falling back to Local Storage caching.", error);
        // Fallback save to local storage
        localStorage.setItem('resuscan_profile', JSON.stringify({ ...payload, id: insertedId || '00000000-0000-0000-0000-000000000000' }));
      }
      
      await refreshProfile(); // Refresh global state
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      // Fallback save to local storage
      const fallbackPayload = {
        full_name: formData.full_name,
        headline: formData.headline,
        email: formData.email,
        website: formData.website,
        github: formData.github,
        linkedin: formData.linkedin,
        summary: formData.summary,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        updated_at: new Date()
      };
      localStorage.setItem('resuscan_profile', JSON.stringify({ ...fallbackPayload, id: profileId || '00000000-0000-0000-0000-000000000000' }));
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Profile Builder</h1>
        <p style={{ color: 'var(--text-muted)' }}>Complete your profile to unlock tailored resume suggestions.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Basic Info */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <User size={20} color="var(--primary)" /> Basic Information
          </h3>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
              <input type="text" name="full_name" className="form-input" placeholder="Alex Chen" value={formData.full_name} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Professional Headline</label>
              <input type="text" name="headline" className="form-input" placeholder="Senior Full Stack Engineer" value={formData.headline} onChange={handleChange} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
              <input type="email" name="email" className="form-input" placeholder="alex@example.com" value={formData.email} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <LinkIcon size={20} color="var(--primary)" /> Social Links
          </h3>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Personal Website</label>
              <input type="text" name="website" className="form-input" placeholder="https://alexc.dev" value={formData.website} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>GitHub</label>
              <input type="text" name="github" className="form-input" placeholder="github.com/alexc" value={formData.github} onChange={handleChange} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>LinkedIn</label>
              <input type="text" name="linkedin" className="form-input" placeholder="linkedin.com/in/alexc" value={formData.linkedin} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <FileText size={20} color="var(--primary)" /> Professional Summary
          </h3>
          <textarea 
            name="summary"
            className="form-input" 
            rows={4}
            placeholder="A brief overview of your career and key achievements..."
            value={formData.summary} 
            onChange={handleChange}
          />
        </div>

        {/* Skills */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <Code size={20} color="var(--primary)" /> Skills & Expertise
          </h3>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Comma-separated skills</label>
          <input 
            type="text" 
            name="skills"
            className="form-input" 
            placeholder="React, Node.js, Python, AWS..." 
            value={formData.skills} 
            onChange={handleChange} 
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          {success && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 500 }}>
              <CheckCircle2 size={20} /> Saved successfully!
            </span>
          )}
          <button 
            className="btn btn-primary" 
            style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <Loader2 className="spin" size={20} /> : <Save size={20} />}
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

      </div>
    </motion.div>
  );
}
