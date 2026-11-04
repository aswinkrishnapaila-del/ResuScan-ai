import React from 'react';
import { Cookie, Settings, Shield, Info, ToggleLeft } from 'lucide-react';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
          <Icon size={17} className="text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2 pl-12">
        {children}
      </div>
    </div>
  );
}

export default function CookiePolicy() {
  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-8">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <Cookie size={22} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cookie Policy</h1>
            <p className="text-xs text-slate-400 mt-0.5">Last updated: 21 October 2026</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          This Cookie Policy explains how ResuScan AI uses cookies and similar storage technologies.
          We take a minimal-cookie approach — we only use what is strictly necessary to make the
          application work.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm space-y-8">

        <Section icon={Info} title="What Are Cookies?">
          <p>Cookies are small text files stored in your browser. We also use <strong>localStorage</strong> (browser storage) to save your preferences and draft data locally — this data never leaves your device unless you explicitly save your profile.</p>
        </Section>

        <Section icon={Settings} title="Cookies We Use">
          <div className="overflow-x-auto mt-1">
            <table className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden" role="table">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700">
                  <th className="text-left p-3 font-semibold text-slate-700 dark:text-slate-200" scope="col">Name</th>
                  <th className="text-left p-3 font-semibold text-slate-700 dark:text-slate-200" scope="col">Type</th>
                  <th className="text-left p-3 font-semibold text-slate-700 dark:text-slate-200" scope="col">Purpose</th>
                  <th className="text-left p-3 font-semibold text-slate-700 dark:text-slate-200" scope="col">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                <tr>
                  <td className="p-3 font-mono text-slate-700 dark:text-slate-300">sb-*</td>
                  <td className="p-3"><span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">Necessary</span></td>
                  <td className="p-3">Supabase authentication session token</td>
                  <td className="p-3">Session / 1 week</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-slate-700 dark:text-slate-300">resuscan_profile</td>
                  <td className="p-3"><span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">Necessary</span></td>
                  <td className="p-3">Local profile cache (localStorage, not a cookie)</td>
                  <td className="p-3">Until cleared</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-slate-700 dark:text-slate-300">resuscan_cookie_consent</td>
                  <td className="p-3"><span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">Necessary</span></td>
                  <td className="p-3">Remembers your cookie consent choice</td>
                  <td className="p-3">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3"><strong>We do not use advertising, tracking, or analytics cookies.</strong> No Google Analytics, Facebook Pixel, or third-party marketing trackers are present on this site.</p>
        </Section>

        <Section icon={Shield} title="Do I Need to Consent?">
          <p>Under Indian law (DPDPA 2023) and GDPR principles, strictly necessary cookies do not require your consent as they are essential for the service to function. Since we only use necessary cookies, no cookie banner for consent is legally required — however, we show one for transparency.</p>
        </Section>

        <Section icon={ToggleLeft} title="Managing Cookies">
          <p>You can control cookies through your browser settings:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-slate-800 dark:text-slate-200">Chrome:</strong> Settings → Privacy & Security → Cookies</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Safari:</strong> Preferences → Privacy → Manage Website Data</li>
          </ul>
          <p className="mt-2">Blocking necessary cookies may cause login or profile saving features to stop working correctly.</p>
          <p>To clear your local profile data: Open Browser DevTools → Application → Local Storage → delete <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">resuscan_profile</code>.</p>
        </Section>

      </div>
    </div>
  );
}
