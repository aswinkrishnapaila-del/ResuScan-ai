import React, { useState, useEffect } from 'react';
import { FileText, Edit, Trash2, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const item = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function DraftsHub({ setActiveTab, setLoadedDraft }) {
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('resumeDrafts');
      if (saved) setDrafts(JSON.parse(saved));
    } catch {}
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

  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-5">
          <FileText size={40} className="text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Drafts Yet</h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mb-6">
          You haven't saved any resume drafts. Head to the Resume Builder to create your first one.
        </p>
        <button className="btn btn-primary px-6" onClick={() => setActiveTab('builder')}>
          <PlusCircle size={16} /> Go to Resume Builder
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Your Drafts</h2>
        <p className="text-sm text-slate-400">Pick up right where you left off.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drafts.map(draft => (
          <motion.div key={draft.id} variants={item}
            className="card dark:bg-surface-800 flex flex-col hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all"
          >
            <div className="flex items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 h-24 mb-4">
              <FileText size={40} className="text-primary" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 truncate">
              {draft.formData?.name || 'Untitled Resume'}
            </h3>
            <div className="space-y-0.5 text-xs text-slate-400 mb-4">
              <p>Role: <span className="text-slate-600 dark:text-slate-300">{draft.formData?.title || 'Not specified'}</span></p>
              <p>Template: <span className="text-slate-600 dark:text-slate-300">{draft.selectedTemplate}</span></p>
              <p>Saved: <span className="text-slate-600 dark:text-slate-300">{new Date(draft.timestamp).toLocaleDateString()}</span></p>
            </div>

            <div className="flex gap-2 mt-auto">
              <button className="btn btn-primary flex-1 text-xs py-2" onClick={() => handleEdit(draft)}>
                <Edit size={14} /> Edit
              </button>
              <button
                className="btn btn-outline px-3 py-2 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => handleDelete(draft.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
