import React from 'react';

const SAMPLE = {
  name: 'Alex Chen', title: 'Senior Full Stack Engineer', email: 'alex.chen@email.com', phone: '+1 (555) 000-1234', location: 'San Francisco, CA', linkedin: 'linkedin.com/in/alexchen', website: 'github.com/alexc', github: 'github.com/alexc', photo: '',
  summary: 'Passionate engineer with 6+ years building scalable web applications. Led cross-functional teams to deliver high-impact products used by millions of users.',
  experience: [{ role: 'Lead Developer', company: 'TechFlow Solutions', dates: 'Jan 2021 – Present', bullets: ['Migrated legacy monolith to microservices, reducing response time by 40%.', 'Mentored team of 5 junior developers and established CI/CD pipelines.'] }],
  projects: [{ name: 'Nexus AI', link: 'github.com/alexc/nexus', tech_stack: 'React, Node.js', bullets: ['Built an AI code reviewer'] }],
  education: [{ degree: 'B.S. Computer Science', school: 'University of Technology', city: 'San Francisco', cgpa: '3.8 GPA', startMonth: 'Sep', startYear: '2014', endMonth: 'May', endYear: '2018' }],
  skills: { languages: ['JavaScript', 'TypeScript', 'Python'], frontend: ['React'], backend: ['Node.js', 'AWS'], ai_tools: [] },
  certifications: [{ name: 'AWS Certified Solutions Architect', year: '2022' }],
  awards: [{ name: 'Hackathon Winner - AI Track', year: '2021' }],
  languages: [{ name: 'English', level: 'Native' }, { name: 'German', level: 'Professional' }],
  publications: [],
  profiles: []
};

function merge(data) {
  const isDataEmpty = !data.name && !data.title && !data.email && !data.experience?.some(e => e.role) && !data.education?.some(ed => ed.school);
  if (isDataEmpty) return SAMPLE;

  const defaultSkills = { languages: [], frontend: [], backend: [], ai_tools: [] };
  let mergedSkills = defaultSkills;
  
  if (data.skills) {
    if (Array.isArray(data.skills)) {
      mergedSkills = { ...defaultSkills, languages: data.skills }; // fallback
    } else {
      mergedSkills = { ...defaultSkills, ...data.skills };
    }
  }

  return {
    name: data.name || SAMPLE.name,
    title: data.title || SAMPLE.title,
    email: data.email || '',
    phone: data.phone || '',
    location: data.location || '',
    linkedin: data.linkedin || '',
    website: data.website || '',
    github: data.github || '',
    photo: data.photo || '',
    summary: data.summary || '',
    experience: data.experience?.length ? data.experience : [],
    projects: data.projects || [],
    education: data.education?.length ? data.education : [],
    skills: mergedSkills,
    certifications: data.certifications || [],
    awards: data.awards || [],
    languages: data.languages || [],
    publications: data.publications || [],
    profiles: data.profiles || []
  };
}

const EduDate = ({ ed }) => {
  if (ed.year) return <span>{ed.year}</span>;
  if (ed.startMonth || ed.endMonth) return <span>{ed.startMonth} {ed.startYear} - {ed.endMonth} {ed.endYear}</span>;
  return null;
};

const HtmlSummary = ({ html, style }) => (
  <div style={{ ...style, whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: html }} className="resume-html-summary" />
);

/* ─── Individual Template Renderers ─── */

function Minimalist({ d, accent }) {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', background: '#fff', padding: '2.5rem', minHeight: 900 }}>
      <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: '1rem', marginBottom: '1.2rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: accent, fontWeight: 700, letterSpacing: -0.5 }}>{d.name}</h1>
        <p style={{ fontSize: '1rem', color: '#475569', margin: '4px 0 10px', fontWeight: 500 }}>{d.title}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
          {[d.location && `📍 ${d.location}`, d.email && `✉ ${d.email}`, d.phone && `📞 ${d.phone}`, d.linkedin && `🔗 ${d.linkedin}`, d.github && `💻 ${d.github}`, ...d.profiles.map(p => `${p.platform}: ${p.url}`)].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      {d.summary && <><SectionTitle accent={accent} label="SUMMARY" /><HtmlSummary html={d.summary} style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#334155', marginBottom: '1.2rem' }} /></>}
      
      <SectionTitle accent={accent} label="EXPERIENCE" />
      {d.experience.map((e, i) => <ExpEntry key={i} e={e} accent={accent} />)}
      
      {d.projects.length > 0 && d.projects[0].name && (
        <><SectionTitle accent={accent} label="PROJECTS" />
        {d.projects.map((p, i) => <ProjEntry key={i} p={p} accent={accent} />)}</>
      )}

      <SectionTitle accent={accent} label="EDUCATION" />
      {d.education.map((ed, i) => <EduEntry key={i} ed={ed} accent={accent} />)}
      
      {(d.certifications.length > 0 && d.certifications[0].name) && (
        <><SectionTitle accent={accent} label="CERTIFICATIONS" />{d.certifications.map((c, i) => <div key={i} style={{fontSize:'0.85rem', marginBottom:4}}><b>{c.name}</b> {c.year && <span style={{color:'#64748b'}}>({c.year})</span>}</div>)}</>
      )}
      {(d.awards.length > 0 && d.awards[0].name) && (
        <><SectionTitle accent={accent} label="AWARDS" />{d.awards.map((a, i) => <div key={i} style={{fontSize:'0.85rem', marginBottom:4}}><b>{a.name}</b> {a.year && <span style={{color:'#64748b'}}>({a.year})</span>}</div>)}</>
      )}
      
      {d.publications.length > 0 && d.publications[0].title && (
        <><SectionTitle accent={accent} label="PUBLICATIONS" />{d.publications.map((p, i) => <div key={i} style={{fontSize:'0.85rem', marginBottom:4}}><b>{p.title}</b> {p.year && <span style={{color:'#64748b'}}>({p.year})</span>} {p.link && <a href={p.link} style={{color:accent}}>[Link]</a>}</div>)}</>
      )}

      {(d.languages.length > 0 && d.languages[0].name) && (
        <><SectionTitle accent={accent} label="LANGUAGES" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {d.languages.map((l, i) => <div key={i} style={{fontSize:'0.85rem'}}><b>{l.name}</b> <span style={{color:'#64748b'}}>({l.level})</span></div>)}
        </div></>
      )}

      <SectionTitle accent={accent} label="SKILLS" />
      <SkillsRenderer skills={d.skills} accent={accent} />
    </div>
  );
}

function Executive({ d, accent }) {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1e293b', background: '#fff', padding: '2.5rem', minHeight: 900 }}>
      <div style={{ textAlign: 'center', borderBottom: `2px solid ${accent}`, paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', color: accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{d.name}</h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b', margin: '4px 0' }}>{d.title}</p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1.2rem', fontSize: '0.78rem', color: '#64748b', marginTop: 8 }}>
          {[d.email, d.phone, d.location, d.linkedin, d.github, ...d.profiles.map(p=>`${p.platform}: ${p.url}`)].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      {d.summary && <><SectionTitle accent={accent} label="PROFESSIONAL SUMMARY" center /><HtmlSummary html={d.summary} style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#374151', marginBottom: '1.5rem' }} /></>}
      
      <SectionTitle accent={accent} label="EXPERIENCE" />
      {d.experience.map((e, i) => <ExpEntry key={i} e={e} accent={accent} />)}
      
      {d.projects.length > 0 && d.projects[0].name && (
        <><SectionTitle accent={accent} label="PROJECTS" />
        {d.projects.map((p, i) => <ProjEntry key={i} p={p} accent={accent} />)}</>
      )}

      <SectionTitle accent={accent} label="EDUCATION" />
      {d.education.map((ed, i) => <EduEntry key={i} ed={ed} accent={accent} />)}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {(d.certifications.length > 0 && d.certifications[0].name) && (
          <div><SectionTitle accent={accent} label="CERTIFICATIONS" />{d.certifications.map((c, i) => <div key={i} style={{fontSize:'0.8rem', marginBottom:4}}>• <b>{c.name}</b> {c.year}</div>)}</div>
        )}
        {(d.awards.length > 0 && d.awards[0].name) && (
          <div><SectionTitle accent={accent} label="AWARDS" />{d.awards.map((a, i) => <div key={i} style={{fontSize:'0.8rem', marginBottom:4}}>• <b>{a.name}</b> {a.year}</div>)}</div>
        )}
      </div>
      
      {d.publications.length > 0 && d.publications[0].title && (
        <><SectionTitle accent={accent} label="PUBLICATIONS" />{d.publications.map((p, i) => <div key={i} style={{fontSize:'0.8rem', marginBottom:4}}>• <b>{p.title}</b> {p.year} {p.link}</div>)}</>
      )}

      <SectionTitle accent={accent} label="SKILLS" />
      <SkillsRenderer skills={d.skills} accent={accent} />
      
      {(d.languages.length > 0 && d.languages[0].name) && (
        <div style={{marginTop:'1.2rem'}}><SectionTitle accent={accent} label="LANGUAGES" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          {d.languages.map((l, i) => <div key={i} style={{fontSize:'0.85rem'}}><b>{l.name}</b>: {l.level}</div>)}
        </div></div>
      )}
    </div>
  );
}

function Modern({ d, accent }) {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', background: '#fff', minHeight: 900 }}>
      <div style={{ background: `linear-gradient(135deg, ${accent}, #818cf8)`, padding: '2rem 2.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {d.photo && <img src={d.photo} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.5)' }} />}
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 700 }}>{d.name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', margin: '4px 0 10px' }}>{d.title}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>
            {[d.email, d.phone, d.location, d.linkedin, d.github, ...d.profiles.map(p=>`${p.platform}: ${p.url}`)].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
          </div>
        </div>
      </div>
      <div style={{ padding: '0 2.5rem 2.5rem' }}>
        {d.summary && <><SectionTitle accent={accent} label="SUMMARY" /><HtmlSummary html={d.summary} style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#334155', marginBottom: '1.2rem' }} /></>}
        
        <SectionTitle accent={accent} label="EXPERIENCE" />
        {d.experience.map((e, i) => <ExpEntry key={i} e={e} accent={accent} />)}
        
        {d.projects.length > 0 && d.projects[0].name && (
          <><SectionTitle accent={accent} label="PROJECTS" />
          {d.projects.map((p, i) => <ProjEntry key={i} p={p} accent={accent} />)}</>
        )}

        <SectionTitle accent={accent} label="EDUCATION" />
        {d.education.map((ed, i) => <EduEntry key={i} ed={ed} accent={accent} />)}
        
        {(d.certifications.length > 0 && d.certifications[0].name) && (
          <><SectionTitle accent={accent} label="CERTIFICATIONS & AWARDS" />
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem'}}>
            <div>{d.certifications.map((c, i) => <div key={i} style={{fontSize:'0.85rem'}}>★ {c.name} ({c.year})</div>)}</div>
            <div>{d.awards.map((a, i) => <div key={i} style={{fontSize:'0.85rem'}}>🏆 {a.name} ({a.year})</div>)}</div>
          </div></>
        )}
        
        {d.publications.length > 0 && d.publications[0].title && (
          <><SectionTitle accent={accent} label="PUBLICATIONS" />{d.publications.map((p, i) => <div key={i} style={{fontSize:'0.85rem'}}>★ {p.title}</div>)}</>
        )}

        <SectionTitle accent={accent} label="SKILLS" />
        <SkillsRenderer skills={d.skills} accent={accent} />

        {(d.languages.length > 0 && d.languages[0].name) && (
          <><SectionTitle accent={accent} label="LANGUAGES" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {d.languages.map((l, i) => <div key={i} style={{fontSize:'0.85rem'}}><b>{l.name}</b> ({l.level})</div>)}
          </div></>
        )}
      </div>
    </div>
  );
}

function Creative({ d, accent }) {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', background: '#fff', display: 'flex', minHeight: 900 }}>
      <div style={{ width: '35%', background: accent, padding: '2rem 1.5rem', color: '#fff' }}>
        {d.photo ? (
          <img src={d.photo} alt="Profile" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1.5rem', display: 'block', border: '4px solid rgba(255,255,255,0.2)' }} />
        ) : (
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, margin: '0 auto 1.5rem' }}>{d.name.charAt(0)}</div>
        )}
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>{d.name}</h1>
        <p style={{ fontSize: '0.8rem', textAlign: 'center', opacity: 0.85, marginBottom: '1.5rem' }}>{d.title}</p>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>CONTACT</p>
          {[d.email, d.phone, d.location, d.linkedin, d.github, ...d.profiles.map(p=>`${p.platform}: ${p.url}`)].filter(Boolean).map((v, i) => <p key={i} style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: 4, wordBreak: 'break-all' }}>{v}</p>)}
        </div>
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>SKILLS</p>
          <SkillsRenderer skills={d.skills} accent="transparent" dark />
        </div>
        {(d.languages.length > 0 && d.languages[0].name) && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>LANGUAGES</p>
            {d.languages.map((l, i) => <div key={i} style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: 4 }}><b>{l.name}</b> — {l.level}</div>)}
          </div>
        )}
      </div>
      <div style={{ flex: 1, padding: '2rem 1.5rem' }}>
        {d.summary && <><p style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase', color: accent, marginBottom: 6 }}>ABOUT</p><HtmlSummary html={d.summary} style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem', color: '#334155' }} /></>}
        <p style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase', color: accent, marginBottom: 10 }}>EXPERIENCE</p>
        {d.experience.map((e, i) => <ExpEntry key={i} e={e} accent={accent} />)}
        
        {d.projects.length > 0 && d.projects[0].name && (
          <><p style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase', color: accent, marginTop: 16, marginBottom: 10 }}>PROJECTS</p>
          {d.projects.map((p, i) => <ProjEntry key={i} p={p} accent={accent} />)}</>
        )}

        <p style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase', color: accent, marginTop: 16, marginBottom: 10 }}>EDUCATION</p>
        {d.education.map((ed, i) => <EduEntry key={i} ed={ed} accent={accent} />)}
        
        {(d.certifications.length > 0 && d.certifications[0].name) && (
          <><p style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase', color: accent, marginTop: 16, marginBottom: 10 }}>CERTIFICATIONS</p>
          {d.certifications.map((c, i) => <p key={i} style={{fontSize:'0.8rem'}}>• {c.name} {c.year}</p>)}</>
        )}
        {(d.awards.length > 0 && d.awards[0].name) && (
          <><p style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase', color: accent, marginTop: 16, marginBottom: 10 }}>AWARDS</p>
          {d.awards.map((a, i) => <p key={i} style={{fontSize:'0.8rem'}}>• {a.name} {a.year}</p>)}</>
        )}
      </div>
    </div>
  );
}

function Tech({ d, accent }) {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', background: '#fff', minHeight: 900 }}>
      <div style={{ background: accent, padding: '2rem 2.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {d.photo && <img src={d.photo} alt="Profile" style={{ width: 90, height: 90, borderRadius: 8, objectFit: 'cover', border: '2px solid #10b981' }} />}
        <div>
          <h1 style={{ fontSize: '2.2rem', color: '#fff', fontWeight: 700, fontFamily: 'monospace' }}>{d.name}</h1>
          <p style={{ color: '#10b981', fontSize: '1.1rem', margin: '4px 0 10px', fontFamily: 'monospace' }}>$ {d.title}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
            {[d.email, d.phone, d.location, d.github, ...d.profiles.map(p=>`${p.platform}: ${p.url}`)].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
          </div>
        </div>
      </div>
      <div style={{ padding: '1.5rem 2.5rem 2.5rem' }}>
        {d.summary && <div style={{ borderLeft: `3px solid #10b981`, paddingLeft: 12, margin: '0 0 1.5rem' }}><HtmlSummary html={d.summary} style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#334155' }} /></div>}
        <SectionTitle accent="#10b981" label="EXPERIENCE" />
        {d.experience.map((e, i) => <ExpEntry key={i} e={e} accent="#10b981" />)}
        
        {d.projects.length > 0 && d.projects[0].name && (
          <><SectionTitle accent="#10b981" label="PROJECTS" />
          {d.projects.map((p, i) => <ProjEntry key={i} p={p} accent="#10b981" />)}</>
        )}

        <SectionTitle accent="#10b981" label="EDUCATION" />
        {d.education.map((ed, i) => <EduEntry key={i} ed={ed} accent="#10b981" />)}
        
        {(d.certifications[0]?.name || d.awards[0]?.name) && (
          <><SectionTitle accent="#10b981" label="ACHIEVEMENTS" />
          <div style={{fontSize:'0.85rem', fontFamily:'monospace'}}>
            {d.certifications.map((c, i) => <div key={i}>&gt; {c.name} [{c.year}]</div>)}
            {d.awards.map((a, i) => <div key={i}>&gt; {a.name} [{a.year}]</div>)}
          </div></>
        )}

        <SectionTitle accent="#10b981" label="TECH STACK" />
        <SkillsRenderer skills={d.skills} accent={accent} dark />
      </div>
    </div>
  );
}

function Sidebar({ d, accent }) {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', background: '#fff', display: 'flex', minHeight: 900 }}>
      <div style={{ width: '32%', background: accent, padding: '2rem 1.2rem', color: '#fff' }}>
        {d.photo ? (
          <img src={d.photo} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', display: 'block' }} />
        ) : (
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, margin: '0 auto 1rem' }}>{d.name.charAt(0)}</div>
        )}
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', marginBottom: 2 }}>{d.name}</h1>
        <p style={{ fontSize: '0.8rem', textAlign: 'center', opacity: 0.8, marginBottom: '1.5rem' }}>{d.title}</p>
        {[['📧', d.email], ['📞', d.phone], ['📍', d.location], ['🔗', d.linkedin], ['💻', d.github], ...d.profiles.map(p=>['👤', p.url])].filter(([, v]) => v).map(([icon, v], i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: '0.75rem', opacity: 0.85, wordBreak: 'break-all' }}><span>{icon}</span><span>{v}</span></div>
        ))}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '1rem', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>SKILLS</p>
          <SkillsRenderer skills={d.skills} accent="transparent" dark />
        </div>
      </div>
      <div style={{ flex: 1, padding: '2rem 1.5rem' }}>
        {d.summary && <HtmlSummary html={d.summary} style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#334155', marginBottom: '1.5rem' }} />}
        
        <SectionTitle accent={accent} label="EXPERIENCE" />
        {d.experience.map((e, i) => <ExpEntry key={i} e={e} accent={accent} />)}
        
        {d.projects.length > 0 && d.projects[0].name && (
          <><SectionTitle accent={accent} label="PROJECTS" />
          {d.projects.map((p, i) => <ProjEntry key={i} p={p} accent={accent} />)}</>
        )}

        <SectionTitle accent={accent} label="EDUCATION" />
        {d.education.map((ed, i) => <EduEntry key={i} ed={ed} accent={accent} />)}
        
        {(d.languages.length > 0 && d.languages[0].name) && (
          <><SectionTitle accent={accent} label="LANGUAGES" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
            {d.languages.map((l, i) => <div key={i} style={{fontSize:'0.85rem'}}><b>{l.name}</b> ({l.level})</div>)}
          </div></>
        )}
        
        {(d.certifications[0]?.name || d.awards[0]?.name) && <SectionTitle accent={accent} label="HONORS & CERTIFICATIONS" />}
        {d.certifications.map((c, i) => <p key={i} style={{fontSize:'0.8rem', marginBottom:2}}>• {c.name} <span style={{color:'#64748b'}}>({c.year})</span></p>)}
        {d.awards.map((a, i) => <p key={i} style={{fontSize:'0.8rem', marginBottom:2}}>• {a.name} <span style={{color:'#64748b'}}>({a.year})</span></p>)}
      </div>
    </div>
  );
}

function Bold({ d, accent }) {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', background: '#fff', padding: '2.5rem', minHeight: 900 }}>
      <div style={{ borderLeft: `5px solid ${accent}`, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: accent, lineHeight: 1, letterSpacing: -1 }}>{d.name.toUpperCase()}</h1>
        <p style={{ fontSize: '1.1rem', color: '#475569', fontWeight: 500, marginTop: 6 }}>{d.title}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#64748b', marginTop: 8 }}>
          {[d.email, d.phone, d.location, d.linkedin, d.github, ...d.profiles.map(p=>p.url)].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      {d.summary && <div style={{ borderLeft: `2px solid #e2e8f0`, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}><HtmlSummary html={d.summary} style={{ fontSize: '0.87rem', lineHeight: 1.6, color: '#334155' }} /></div>}
      <SectionTitle accent={accent} label="EXPERIENCE" />
      {d.experience.map((e, i) => <ExpEntry key={i} e={e} accent={accent} />)}
      
      {d.projects.length > 0 && d.projects[0].name && (
        <><SectionTitle accent={accent} label="PROJECTS" />
        {d.projects.map((p, i) => <ProjEntry key={i} p={p} accent={accent} />)}</>
      )}

      <SectionTitle accent={accent} label="EDUCATION" />
      {d.education.map((ed, i) => <EduEntry key={i} ed={ed} accent={accent} />)}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {(d.certifications[0]?.name) && <div><SectionTitle accent={accent} label="CERTIFICATIONS" />{d.certifications.map((c, i) => <p key={i} style={{fontSize:'0.8rem', fontWeight:600}}>{c.name} ({c.year})</p>)}</div>}
        {(d.awards[0]?.name) && <div><SectionTitle accent={accent} label="AWARDS" />{d.awards.map((a, i) => <p key={i} style={{fontSize:'0.8rem', fontWeight:600}}>{a.name} ({a.year})</p>)}</div>}
      </div>

      <SectionTitle accent={accent} label="SKILLS" />
      <SkillsRenderer skills={d.skills} accent={accent} />
    </div>
  );
}

function Elegant({ d, accent }) {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1e293b', background: '#fefce8', padding: '2.5rem', minHeight: 900 }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <p style={{ color: accent, fontSize: '0.7rem', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>— Curriculum Vitae —</p>
        <h1 style={{ fontSize: '2.2rem', color: accent, fontWeight: 700, letterSpacing: 1 }}>{d.name}</h1>
        <p style={{ fontSize: '0.95rem', color: '#78716c', fontStyle: 'italic', margin: '4px 0 10px' }}>{d.title}</p>
        <div style={{ width: 60, height: 2, background: accent, margin: '0 auto 10px' }} />
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: '#78716c' }}>
          {[d.email, d.phone, d.location, d.linkedin, d.github, ...d.profiles.map(p=>p.url)].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      {d.summary && <div style={{ padding: '0 2rem', marginBottom: '1.5rem', textAlign: 'center', fontStyle: 'italic', color: '#57534e' }}><HtmlSummary html={d.summary} style={{ fontSize: '0.87rem', lineHeight: 1.7 }} /></div>}
      
      <SectionTitle accent={accent} label="EXPERIENCE" elegant />
      {d.experience.map((e, i) => <ExpEntry key={i} e={e} accent={accent} />)}
      
      {d.projects.length > 0 && d.projects[0].name && (
        <><SectionTitle accent={accent} label="PROJECTS" elegant />
        {d.projects.map((p, i) => <ProjEntry key={i} p={p} accent={accent} />)}</>
      )}

      <SectionTitle accent={accent} label="EDUCATION" elegant />
      {d.education.map((ed, i) => <EduEntry key={i} ed={ed} accent={accent} />)}
      
      {(d.certifications[0]?.name || d.awards[0]?.name) && <SectionTitle accent={accent} label="ACCOLADES" elegant />}
      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#57534e' }}>
        {d.certifications.map((c, i) => <p key={i} style={{marginBottom:4}}>{c.name} ({c.year})</p>)}
        {d.awards.map((a, i) => <p key={i} style={{marginBottom:4}}>{a.name} ({a.year})</p>)}
      </div>

      <SectionTitle accent={accent} label="SKILLS" elegant />
      <SkillsRenderer skills={d.skills} accent={accent} />
    </div>
  );
}

function Compact({ d, accent }) {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#1e293b', background: '#fff', padding: '1.8rem', minHeight: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${accent}`, paddingBottom: '0.8rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {d.photo && <img src={d.photo} alt="Profile" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />}
          <div>
            <h1 style={{ fontSize: '1.7rem', color: accent, fontWeight: 700 }}>{d.name}</h1>
            <p style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>{d.title}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.6 }}>
          {[d.email, d.phone, d.location, d.github].filter(Boolean).map((v, i) => <p key={i}>{v}</p>)}
        </div>
      </div>
      {d.summary && <div style={{ marginBottom: '1rem' }}><HtmlSummary html={d.summary} style={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#334155' }} /></div>}
      
      <SectionTitle accent={accent} label="EXPERIENCE" compact />
      {d.experience.map((e, i) => <ExpEntry key={i} e={e} accent={accent} compact />)}
      
      {d.projects.length > 0 && d.projects[0].name && (
        <><SectionTitle accent={accent} label="PROJECTS" compact />
        {d.projects.map((p, i) => <ProjEntry key={i} p={p} accent={accent} compact />)}</>
      )}

      <SectionTitle accent={accent} label="EDUCATION" compact />
      {d.education.map((ed, i) => <EduEntry key={i} ed={ed} accent={accent} />)}
      
      {(d.certifications[0]?.name || d.awards[0]?.name) && <SectionTitle accent={accent} label="CERTIFICATIONS & AWARDS" compact />}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.78rem' }}>
        {d.certifications.map((c, i) => <span key={i}>• {c.name}</span>)}
        {d.awards.map((a, i) => <span key={i}>• {a.name}</span>)}
      </div>

      <SectionTitle accent={accent} label="SKILLS" compact />
      <SkillsRenderer skills={d.skills} accent={accent} />
    </div>
  );
}

function Academic({ d, accent }) {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1e293b', background: '#fff', padding: '2.5rem', minHeight: 900 }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 1 }}>{d.name}</h1>
        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0 8px' }}>{d.title}</p>
        <div style={{ borderTop: `1px solid ${accent}`, borderBottom: `1px solid ${accent}`, padding: '4px 0', display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.78rem', color: '#64748b', margin: '0 2rem' }}>
          {[d.email, d.phone, d.location, d.website, d.github, ...d.profiles.map(p=>p.url)].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      {d.summary && <><SectionTitle accent={accent} label="RESEARCH INTERESTS" /><HtmlSummary html={d.summary} style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#334155', marginBottom: '1.2rem' }} /></>}
      
      <SectionTitle accent={accent} label="ACADEMIC EXPERIENCE" />
      {d.experience.map((e, i) => <ExpEntry key={i} e={e} accent={accent} />)}
      
      <SectionTitle accent={accent} label="EDUCATION" />
      {d.education.map((ed, i) => <EduEntry key={i} ed={ed} accent={accent} />)}
      
      {d.publications.length > 0 && d.publications[0].title && (
        <><SectionTitle accent={accent} label="PUBLICATIONS" />{d.publications.map((p, i) => <div key={i} style={{fontSize:'0.85rem', marginBottom:4}}>• <b>{p.title}</b> {p.year && `(${p.year})`} {p.link && <a href={p.link} style={{color:accent}}>[Link]</a>}</div>)}</>
      )}

      {(d.certifications[0]?.name || d.awards[0]?.name) && <SectionTitle accent={accent} label="HONORS & AWARDS" />}
      {d.awards.map((a, i) => <p key={i} style={{fontSize:'0.85rem', marginBottom:4}}><b>{a.name}</b> — {a.year}</p>)}
      {d.certifications.map((c, i) => <p key={i} style={{fontSize:'0.85rem', marginBottom:4}}><b>{c.name}</b> — {c.year}</p>)}

      <SectionTitle accent={accent} label="SKILLS & COMPETENCIES" />
      <SkillsRenderer skills={d.skills} accent={accent} />
    </div>
  );
}

function Professional({ d, accent }) {
  const initials = (d.name || '').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#1e293b', background: '#fff', minHeight: 1100, display: 'flex', flexDirection: 'column' }}>
      {/* Header - High Fidelity */}
      <div style={{ background: '#374151', padding: '2.5rem 3rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '2.5rem', borderBottom: `4px solid ${accent}` }}>
        <div style={{ border: '2px solid rgba(255,255,255,0.6)', padding: '1rem', minWidth: '85px', height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '1px' }}>
          {initials || 'AK'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', lineHeight: 1.1, marginBottom: '0.6rem' }}>{d.name}</h1>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, display: 'flex', flexWrap: 'wrap', gap: '1.2rem', fontWeight: 500, letterSpacing: '0.5px' }}>
             {d.location && <span>{d.location}</span>}
             {d.email && <span>{d.email}</span>}
             {d.phone && <span>{d.phone}</span>}
          </div>
        </div>
      </div>

      <div style={{ padding: '3rem', flex: 1 }}>
        {d.summary && (
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.6rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Professional Summary</p>
            </div>
            <HtmlSummary html={d.summary} style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#334155', textAlign: 'justify' }} />
          </div>
        )}

        <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.6rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Key Skills</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {Object.values(d.skills).flat().map(s => <span key={s} style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', background: '#f8fafc', padding: '6px 14px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{s}</span>)}
            </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.6rem', marginBottom: '1.2rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Experience</p>
            </div>
            {d.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: '1.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#111827', fontWeight: 800 }}>{e.role}</strong>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{e.dates}</span>
                </div>
                <p style={{ fontSize: '0.95rem', color: accent, fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{e.company}</p>
                <ul style={{ paddingLeft: '1.4rem', margin: 0 }}>
                  {e.bullets.map((b, bi) => <li key={bi} style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, marginBottom: '6px' }}>{b}</li>)}
                </ul>
              </div>
            ))}
        </div>
        
        {d.projects.length > 0 && d.projects[0].name && (
          <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.6rem', marginBottom: '1.2rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Projects</p>
              </div>
              {d.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: '1.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#111827', fontWeight: 800 }}>{p.name}</strong>
                  </div>
                  {p.tech_stack && <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '10px' }}>{p.tech_stack}</p>}
                  <ul style={{ paddingLeft: '1.4rem', margin: 0 }}>
                    {p.bullets.map((b, bi) => <li key={bi} style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, marginBottom: '6px' }}>{b}</li>)}
                  </ul>
                </div>
              ))}
          </div>
        )}

        <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.6rem', marginBottom: '1.2rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Education & Training</p>
            </div>
            {d.education.map((ed, i) => (
              <div key={i} style={{ marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '1.05rem', color: '#111827', fontWeight: 700 }}>{ed.degree}</strong>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}><EduDate ed={ed} /></span>
                </div>
                <p style={{ fontSize: '0.95rem', color: accent, fontWeight: 600 }}>{ed.school} {ed.city && `- ${ed.city}`}</p>
                {ed.cgpa && <p style={{ fontSize: '0.85rem', color: '#64748b' }}>CGPA: {ed.cgpa}</p>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Shared Sub-components ─── */
function SectionTitle({ accent, label, center, elegant, compact }) {
  if (elegant) return (
    <div style={{ textAlign: 'center', margin: '1.2rem 0 0.8rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
        <div style={{ flex: 1, height: 1, background: accent, opacity: 0.4 }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: accent }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: accent, opacity: 0.4 }} />
      </div>
    </div>
  );
  return (
    <div style={{ borderBottom: compact ? `1px solid ${accent}` : `2px solid ${accent}`, marginBottom: compact ? '0.5rem' : '0.8rem', marginTop: compact ? '0.8rem' : '1.2rem', paddingBottom: 3 }}>
      <h3 style={{ fontSize: compact ? '0.75rem' : '0.85rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: accent, textAlign: center ? 'center' : 'left' }}>{label}</h3>
    </div>
  );
}

function ExpEntry({ e, accent, compact }) {
  return (
    <div style={{ marginBottom: compact ? '0.7rem' : '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <strong style={{ fontSize: compact ? '0.82rem' : '0.9rem' }}>{e.role}</strong>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{e.dates}</span>
      </div>
      <p style={{ fontSize: '0.8rem', color: accent, fontWeight: 600, marginBottom: 4 }}>{e.company}</p>
      <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
        {e.bullets.map((b, i) => <li key={i} style={{ fontSize: compact ? '0.78rem' : '0.82rem', color: '#334155', lineHeight: 1.5, marginBottom: 3 }}>{b}</li>)}
      </ul>
    </div>
  );
}

function ProjEntry({ p, accent, compact }) {
  return (
    <div style={{ marginBottom: compact ? '0.7rem' : '1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <strong style={{ fontSize: compact ? '0.82rem' : '0.9rem' }}>{p.name}</strong>
        {p.link && <a href={p.link} style={{ fontSize: '0.75rem', color: accent, textDecoration: 'none' }}>Link</a>}
      </div>
      {p.tech_stack && <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>{p.tech_stack}</p>}
      <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
        {p.bullets.map((b, i) => <li key={i} style={{ fontSize: compact ? '0.78rem' : '0.82rem', color: '#334155', lineHeight: 1.5, marginBottom: 3 }}>{b}</li>)}
      </ul>
    </div>
  );
}

function EduEntry({ ed, accent }) {
  return (
    <div style={{ marginBottom: '0.8rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <strong style={{ fontSize: '0.88rem' }}>{ed.degree}</strong>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}><EduDate ed={ed} /></span>
      </div>
      <p style={{ fontSize: '0.8rem', color: accent }}>{ed.school} {ed.city && `- ${ed.city}`}</p>
      {ed.cgpa && <p style={{ fontSize: '0.75rem', color: '#64748b' }}>CGPA / Score: {ed.cgpa}</p>}
    </div>
  );
}

function SkillPill({ s, accent, dark }) {
  if (dark) {
    return <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 3, padding: '3px 8px', fontSize: '0.72rem', color: '#fff' }}>{s}</div>;
  }
  return <span style={{ padding: '4px 10px', background: `${accent}18`, color: accent, borderRadius: 20, fontSize: '0.75rem', fontWeight: 500 }}>{s}</span>;
}

function SkillsRenderer({ skills, accent, dark }) {
  const categories = [
    { key: 'languages', label: 'Languages' },
    { key: 'frontend', label: 'Frontend' },
    { key: 'backend', label: 'Backend & Cloud' },
    { key: 'ai_tools', label: 'AI & Tools' }
  ];
  
  const hasCategorized = categories.some(c => skills[c.key] && skills[c.key].length > 0);
  
  if (!hasCategorized) {
    // Fallback if somehow it's an array or empty
    const flatSkills = Array.isArray(skills) ? skills : Object.values(skills).flat();
    return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{flatSkills.map(s => <SkillPill key={s} s={s} accent={accent} dark={dark} />)}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {categories.map(c => {
        if (!skills[c.key] || skills[c.key].length === 0) return null;
        return (
          <div key={c.key}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: dark ? 'rgba(255,255,255,0.7)' : '#64748b', marginBottom: 4, textTransform: 'uppercase' }}>{c.label}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills[c.key].map(s => <SkillPill key={s} s={s} accent={accent} dark={dark} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}


/* ─── Main Export ─── */
const RENDERERS = { minimalist: Minimalist, executive: Executive, modern: Modern, creative: Creative, tech: Tech, sidebar: Sidebar, bold: Bold, elegant: Elegant, compact: Compact, academic: Academic, professional: Professional };

const ACCENT_MAP = {
  minimalist: '#1e293b', executive: '#1e3a5f', modern: '#3b28cc', compact: '#374151', academic: '#1f2937',
  creative: '#6366f1', tech: '#0f172a', sidebar: '#0891b2', bold: '#dc2626', elegant: '#92400e', professional: '#334155',
};

export default function ResumePreview({ templateId, formData, accentColor }) {
  const d = merge(formData || {});
  const Renderer = RENDERERS[templateId] || Minimalist;
  const accent = accentColor || ACCENT_MAP[templateId] || '#1e293b';
  return <Renderer d={d} accent={accent} />;
}
