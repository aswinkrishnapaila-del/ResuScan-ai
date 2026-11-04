import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { getCookie, setCookie } from '../utils/cookieUtils';

const CONSENT_KEY = 'resuscan_cookie_consent';

export default function CookieConsent({ onViewPolicy }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const cookieVal = getCookie(CONSENT_KEY);
    const storageVal = localStorage.getItem(CONSENT_KEY);
    if (!cookieVal && !storageVal) {
      const t = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    const payload = JSON.stringify({ accepted: true, date: new Date().toISOString() });
    setCookie(CONSENT_KEY, 'accepted', 365);
    try { localStorage.setItem(CONSENT_KEY, payload); } catch {}
    setVisible(false);
  };

  const dismiss = () => {
    const payload = JSON.stringify({ accepted: false, date: new Date().toISOString() });
    setCookie(CONSENT_KEY, 'dismissed', 30);
    try { localStorage.setItem(CONSENT_KEY, payload); } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Cookie consent notice"
          aria-live="polite"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 md:bottom-5 left-4 right-4 md:left-auto md:right-5 md:w-[420px] z-50 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl p-5"
        >
          <button
            onClick={dismiss}
            aria-label="Dismiss cookie notice"
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg p-1"
          >
            <X size={15} />
          </button>

          <div className="flex gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/30">
              <Cookie size={18} className="text-amber-600 dark:text-amber-400" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Cookie & Storage Notice</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                We use strictly necessary cookies to manage rate limits and save your preferences securely.
                No third-party ad tracking cookies are used.{' '}
                <button
                  onClick={() => onViewPolicy && onViewPolicy('cookies')}
                  className="text-indigo-600 dark:text-indigo-400 underline focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded"
                  aria-label="View Cookie Policy"
                >
                  Cookie Policy
                </button>
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  id="cookie-accept-btn"
                  onClick={accept}
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                  aria-label="Accept necessary cookies"
                >
                  Accept
                </button>
                <button
                  id="cookie-dismiss-btn"
                  onClick={dismiss}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
                  aria-label="Dismiss cookie notice"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
