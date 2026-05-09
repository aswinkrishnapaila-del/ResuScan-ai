import React, { useState, useEffect } from 'react';
import { FileText, Edit, Trash2 } from 'lucide-react';

export default function DraftsHub({ setActiveTab, setLoadedDraft }) {
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('resumeDrafts');
    if (saved) {
      try {
        setDrafts(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading drafts", e);
      }
    }
  }, []);

  const handleDelete = (id) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem('resumeDrafts', JSON.stringify(updated));
  };

  const handleEdit = (draft) => {
    setLoadedDraft(draft);
    setActiveTab('builder');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1rem' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Your Drafts</h2>
      <p style={{ marginBottom: '2rem' }}>Pick up right where you left off. Select a saved draft to continue editing.</p>

      {drafts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--card-bg)', borderRadius: 12, border: '1px dashed var(--border-color)' }}>
          <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Drafts Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't saved any resume drafts. Head to the Resume Builder to create one.</p>
          <button className="btn btn-primary" onClick={() => setActiveTab('builder')}>Go to Resume Builder</button>
        </div>
      ) : (
        <div className="grid-3" style={{ gap: '1.5rem' }}>
          {drafts.map(draft => (
            <div key={draft.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: 'var(--sidebar-hover)', padding: '1.5rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <FileText size={48} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{draft.formData?.name || 'Untitled Resume'}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Role: {draft.formData?.title || 'Not specified'}<br/>
                Template: {draft.selectedTemplate}<br/>
                Saved: {new Date(draft.timestamp).toLocaleDateString()}
              </p>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleEdit(draft)}>
                  <Edit size={16} /> Edit
                </button>
                <button className="btn btn-outline" style={{ padding: '8px 12px', color: 'var(--danger)', borderColor: 'var(--border-color)' }} onClick={() => handleDelete(draft.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
