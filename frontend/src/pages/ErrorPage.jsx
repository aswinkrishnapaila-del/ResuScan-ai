import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

export default function ErrorPage({
  code = 500,
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this view.',
  details = null,
  onReset = null,
  onBackToDashboard = null
}) {
  const [showDetails, setShowDetails] = useState(false);

  const handleHardReset = () => {
    try {
      localStorage.removeItem('resuscan_profile');
      localStorage.removeItem('scanned_resume_skills');
      localStorage.removeItem('scanned_resume_title');
    } catch {}
    window.location.reload();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="card dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-lg w-full text-center p-8 space-y-5 shadow-lg">
        {/* Icon Header */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
          {code === 404 ? <AlertTriangle size={32} /> : <ShieldAlert size={32} />}
        </div>

        <div>
          <span className="badge badge-danger text-[11px] mb-2 font-mono">ERROR {code}</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          {onReset && (
            <button
              onClick={onReset}
              className="btn btn-primary text-xs py-2.5 px-4 gap-2"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          )}

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="btn btn-outline text-xs py-2.5 px-4 gap-2"
            >
              <Home size={14} /> Dashboard
            </button>
          )}

          <button
            onClick={handleHardReset}
            className="btn btn-ghost text-xs py-2.5 px-4 text-slate-500 hover:text-slate-800"
          >
            Clear Cache & Reload
          </button>
        </div>

        {/* Expandable Technical Diagnostics */}
        {details && (
          <div className="text-left pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <button
              onClick={() => setShowDetails(v => !v)}
              className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 py-1"
            >
              <span>Technical Diagnostics</span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showDetails && (
              <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-300 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap max-h-48 leading-relaxed">
                {typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
