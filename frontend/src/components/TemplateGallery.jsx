import React, { useState } from 'react';

export const TEMPLATES = [
  { id: 'minimalist', name: 'Minimalist', desc: 'Clean, high-contrast layout optimized for parsers.', type: 'ATS-Friendly', color: '#1e293b' },
  { id: 'executive', name: 'Executive', desc: 'Traditional format preferred by top-tier institutions.', type: 'ATS-Friendly', color: '#1e3a5f' },
  { id: 'modern', name: 'Modern', desc: 'Contemporary design with a subtle colored header.', type: 'ATS-Friendly', color: '#3b28cc' },
  { id: 'compact', name: 'Compact', desc: 'Maximizes information density on a single page.', type: 'ATS-Friendly', color: '#374151' },
  { id: 'academic', name: 'Academic', desc: 'Formal academic CV format for research roles.', type: 'ATS-Friendly', color: '#1f2937' },
  { id: 'professional', name: 'Professional', desc: 'Premium dark header with initials box and clean section lines.', type: 'Design-Forward', color: '#334155' },
  { id: 'creative', name: 'Creative', desc: 'Two-column layout with visual flair for design roles.', type: 'Design-Forward', color: '#6366f1' },
  { id: 'tech', name: 'Tech', desc: 'Dark header with bold accents for engineering roles.', type: 'Design-Forward', color: '#0f172a' },
  { id: 'sidebar', name: 'Sidebar', desc: 'Colored left sidebar with icon-based sections.', type: 'Design-Forward', color: '#0891b2' },
  { id: 'bold', name: 'Bold', desc: 'Large name treatment and strong typographic hierarchy.', type: 'Design-Forward', color: '#dc2626' },
  { id: 'elegant', name: 'Elegant', desc: 'Refined spacing with gold accent lines and serif feel.', type: 'Design-Forward', color: '#92400e' },
];

function TemplateThumbnail({ template }) {
  const c = template.color;

  if (template.id === 'minimalist') return (
    <div style={{ width: '100%', height: '100%', background: '#fff', padding: '10px 12px', fontFamily: 'sans-serif' }}>
      <div style={{ borderBottom: `2px solid ${c}`, paddingBottom: 6, marginBottom: 8 }}>
        <div style={{ background: c, height: 8, width: '55%', borderRadius: 2, marginBottom: 4 }} />
        <div style={{ background: '#cbd5e1', height: 5, width: '40%', borderRadius: 2 }} />
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {[30, 35, 28].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 4, width: `${w}%`, borderRadius: 2 }} />)}
        </div>
      </div>
      {['65%','80%','70%','60%','75%'].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 4, width: w, borderRadius: 2, marginBottom: 5 }} />)}
      <div style={{ background: c, height: 5, width: '25%', borderRadius: 2, margin: '8px 0 5px' }} />
      {['90%','85%','80%'].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 4, width: w, borderRadius: 2, marginBottom: 4 }} />)}
    </div>
  );

  if (template.id === 'executive') return (
    <div style={{ width: '100%', height: '100%', background: '#fff', padding: '10px 12px' }}>
      <div style={{ textAlign: 'center', borderBottom: `1px solid ${c}`, paddingBottom: 6, marginBottom: 8 }}>
        <div style={{ background: c, height: 8, width: '50%', borderRadius: 2, margin: '0 auto 4px' }} />
        <div style={{ background: '#cbd5e1', height: 4, width: '60%', borderRadius: 2, margin: '0 auto 3px' }} />
        <div style={{ background: '#e2e8f0', height: 4, width: '70%', borderRadius: 2, margin: '0 auto' }} />
      </div>
      {[1,2].map(s => (
        <div key={s} style={{ marginBottom: 8 }}>
          <div style={{ background: c, height: 5, width: '30%', borderRadius: 2, marginBottom: 5 }} />
          {['90%','80%','85%'].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 3, width: w, borderRadius: 2, marginBottom: 3 }} />)}
        </div>
      ))}
    </div>
  );

  if (template.id === 'creative') return (
    <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex' }}>
      <div style={{ width: '35%', background: c, padding: '10px 8px' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', margin: '0 auto 6px' }} />
        {['80%','70%','60%','55%','50%'].map((w, i) => <div key={i} style={{ background: 'rgba(255,255,255,0.4)', height: 4, width: w, borderRadius: 2, marginBottom: 4 }} />)}
      </div>
      <div style={{ flex: 1, padding: '10px 8px' }}>
        <div style={{ background: c, height: 7, width: '70%', borderRadius: 2, marginBottom: 4 }} />
        <div style={{ background: '#e2e8f0', height: 4, width: '50%', borderRadius: 2, marginBottom: 8 }} />
        {['90%','80%','85%','75%','80%'].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 3, width: w, borderRadius: 2, marginBottom: 4 }} />)}
      </div>
    </div>
  );

  if (template.id === 'tech') return (
    <div style={{ width: '100%', height: '100%', background: '#fff' }}>
      <div style={{ background: c, padding: '10px 12px', marginBottom: 8 }}>
        <div style={{ background: 'rgba(255,255,255,0.9)', height: 8, width: '55%', borderRadius: 2, marginBottom: 4 }} />
        <div style={{ background: 'rgba(255,255,255,0.5)', height: 4, width: '40%', borderRadius: 2 }} />
      </div>
      <div style={{ padding: '0 12px' }}>
        {[1,2].map(s => (
          <div key={s} style={{ marginBottom: 7 }}>
            <div style={{ background: '#10b981', height: 4, width: '28%', borderRadius: 2, marginBottom: 4 }} />
            {['90%','80%','85%'].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 3, width: w, borderRadius: 2, marginBottom: 3 }} />)}
          </div>
        ))}
      </div>
    </div>
  );

  if (template.id === 'sidebar') return (
    <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex' }}>
      <div style={{ width: '30%', background: c, padding: '10px 6px' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', margin: '0 auto 8px' }} />
        {['75%','65%','55%','60%','50%','55%'].map((w, i) => <div key={i} style={{ background: 'rgba(255,255,255,0.35)', height: 3, width: w, borderRadius: 2, marginBottom: 5 }} />)}
      </div>
      <div style={{ flex: 1, padding: '10px 8px' }}>
        <div style={{ background: c, height: 7, width: '65%', borderRadius: 2, marginBottom: 3 }} />
        {['90%','80%','85%','70%','75%','80%'].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 3, width: w, borderRadius: 2, marginBottom: 4 }} />)}
      </div>
    </div>
  );

  if (template.id === 'bold') return (
    <div style={{ width: '100%', height: '100%', background: '#fff', padding: '10px 12px' }}>
      <div style={{ borderLeft: `4px solid ${c}`, paddingLeft: 8, marginBottom: 10 }}>
        <div style={{ background: c, height: 12, width: '65%', borderRadius: 2, marginBottom: 4 }} />
        <div style={{ background: '#cbd5e1', height: 5, width: '45%', borderRadius: 2 }} />
      </div>
      {[1,2].map(s => (
        <div key={s} style={{ marginBottom: 8 }}>
          <div style={{ background: c, height: 5, width: '32%', borderRadius: 2, marginBottom: 4 }} />
          {['90%','80%','75%'].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 3, width: w, borderRadius: 2, marginBottom: 3 }} />)}
        </div>
      ))}
    </div>
  );

  if (template.id === 'elegant') return (
    <div style={{ width: '100%', height: '100%', background: '#fefce8', padding: '10px 12px' }}>
      <div style={{ borderBottom: `2px solid ${c}`, textAlign: 'center', paddingBottom: 6, marginBottom: 8 }}>
        <div style={{ background: c, height: 8, width: '55%', borderRadius: 2, margin: '0 auto 4px' }} />
        <div style={{ background: '#d6b896', height: 4, width: '45%', borderRadius: 2, margin: '0 auto' }} />
      </div>
      {[1,2].map(s => (
        <div key={s} style={{ marginBottom: 8 }}>
          <div style={{ background: c, height: 4, width: '30%', borderRadius: 2, marginBottom: 4 }} />
          <div style={{ borderLeft: `2px solid ${c}`, paddingLeft: 6 }}>
            {['85%','75%','80%'].map((w, i) => <div key={i} style={{ background: '#d6b896', height: 3, width: w, borderRadius: 2, marginBottom: 3 }} />)}
          </div>
        </div>
      ))}
    </div>
  );

  if (template.id === 'professional') return (
    <div style={{ width: '100%', height: '100%', background: '#fff' }}>
      <div style={{ background: c, padding: '12px 10px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 22, height: 22, border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 'bold' }}>AK</div>
        <div style={{ flex: 1 }}>
          <div style={{ background: 'rgba(255,255,255,0.9)', height: 6, width: '60%', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ background: 'rgba(255,255,255,0.5)', height: 3, width: '40%', borderRadius: 1 }} />
        </div>
      </div>
      <div style={{ padding: '8px 10px' }}>
        {[1,2].map(s => (
          <div key={s} style={{ marginBottom: 6 }}>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 2, marginBottom: 3 }}>
              <div style={{ background: '#94a3b8', height: 3, width: '25%', borderRadius: 1 }} />
            </div>
            {['90%','85%'].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 2, width: w, borderRadius: 1, marginBottom: 2 }} />)}
          </div>
        ))}
      </div>
    </div>
  );

  if (template.id === 'modern') return (
    <div style={{ width: '100%', height: '100%', background: '#fff' }}>
      <div style={{ background: `linear-gradient(135deg, ${c}, #818cf8)`, padding: '10px 12px', marginBottom: 8 }}>
        <div style={{ background: 'rgba(255,255,255,0.9)', height: 8, width: '55%', borderRadius: 2, marginBottom: 4 }} />
        <div style={{ background: 'rgba(255,255,255,0.6)', height: 4, width: '40%', borderRadius: 2 }} />
      </div>
      <div style={{ padding: '0 12px' }}>
        {[1,2].map(s => (
          <div key={s} style={{ marginBottom: 7 }}>
            <div style={{ background: c, height: 4, width: '28%', borderRadius: 2, marginBottom: 4 }} />
            {['90%','80%','85%'].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 3, width: w, borderRadius: 2, marginBottom: 3 }} />)}
          </div>
        ))}
      </div>
    </div>
  );

  if (template.id === 'compact') return (
    <div style={{ width: '100%', height: '100%', background: '#fff', padding: '8px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${c}`, paddingBottom: 5, marginBottom: 6 }}>
        <div style={{ background: c, height: 7, width: '45%', borderRadius: 2 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
          {[28,32,25].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 3, width: w, borderRadius: 2 }} />)}
        </div>
      </div>
      {[1,2,3].map(s => (
        <div key={s} style={{ marginBottom: 5 }}>
          <div style={{ background: c, height: 4, width: '25%', borderRadius: 2, marginBottom: 3 }} />
          {['95%','88%','92%'].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 3, width: w, borderRadius: 2, marginBottom: 2 }} />)}
        </div>
      ))}
    </div>
  );

  // academic default
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', padding: '10px 12px' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ background: c, height: 8, width: '50%', borderRadius: 2, margin: '0 auto 4px' }} />
        <div style={{ background: '#cbd5e1', height: 4, width: '65%', borderRadius: 2, margin: '0 auto 3px' }} />
        <div style={{ background: '#e2e8f0', height: 3, width: '75%', borderRadius: 2, margin: '0 auto' }} />
      </div>
      <div style={{ borderTop: `1px solid ${c}`, borderBottom: `1px solid ${c}`, padding: '4px 0', marginBottom: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
        {[20, 22, 20].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 4, width: w, borderRadius: 2 }} />)}
      </div>
      {[1, 2].map(s => (
        <div key={s} style={{ marginBottom: 7 }}>
          <div style={{ background: c, height: 4, width: '35%', borderRadius: 2, marginBottom: 4 }} />
          {['90%', '80%', '85%'].map((w, i) => <div key={i} style={{ background: '#e2e8f0', height: 3, width: w, borderRadius: 2, marginBottom: 3 }} />)}
        </div>
      ))}
    </div>
  );
}

export default function TemplateGallery({ selected, onSelect, onNext }) {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.type === filter);

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Choose a Template</h2>
          <p style={{ fontSize: '0.9rem' }}>Select a high-fidelity foundation for your professional narrative.</p>
        </div>
        <div className="filter-tabs">
          {['All', 'ATS-Friendly', 'Design-Forward'].map(f => (
            <button
              key={f}
              className={`filter-tab-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'All' ? 'All Templates' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="template-gallery-grid">
        {filtered.map(tpl => (
          <div
            key={tpl.id}
            className={`template-gallery-card ${selected === tpl.id ? 'selected' : ''}`}
            onClick={() => onSelect(tpl.id)}
          >
            <div className="template-thumb-wrap">
              <span className={`badge ${tpl.type === 'ATS-Friendly' ? 'badge-primary' : 'badge-warning'}`}
                style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, fontSize: '0.65rem' }}>
                {tpl.type}
              </span>
              <TemplateThumbnail template={tpl} />
            </div>
            <div style={{ padding: '10px 4px 4px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{tpl.name}</h3>
              <p style={{ fontSize: '0.78rem', marginBottom: 12, lineHeight: 1.4 }}>{tpl.desc}</p>
              <button
                className={`btn ${selected === tpl.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ width: '100%', borderRadius: 24, fontWeight: 600, fontSize: '0.82rem' }}
                onClick={e => { e.stopPropagation(); onSelect(tpl.id); }}
              >
                {selected === tpl.id ? '✓ Selected' : 'Choose template'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
        <button
          className="btn btn-primary"
          style={{ padding: '12px 36px', borderRadius: 24, fontSize: '1rem', fontWeight: 700 }}
          onClick={onNext}
          disabled={!selected}
        >
          Next: Enter Your Info →
        </button>
      </div>
    </div>
  );
}
