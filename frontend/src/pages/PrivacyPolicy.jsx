import React from 'react';
import { Shield, Eye, Database, Trash2, Globe, Mail, Lock, AlertCircle } from 'lucide-react';

function Section({ icon: Icon, title, children, color = 'indigo' }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${color}-50 dark:bg-${color}-900/20`}>
          <Icon size={17} className={`text-${color}-600 dark:text-${color}-400`} />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2 pl-12">
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Shield size={22} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
            <p className="text-xs text-slate-400 mt-0.5">Last updated: 21 October 2026</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          ResuScan AI ("we", "our", "us") is committed to protecting your privacy. This policy explains
          what data we collect, why we collect it, how it is stored, and your rights regarding that data.
          We comply with applicable Indian IT laws including the{' '}
          <strong>Information Technology Act 2000</strong>, the{' '}
          <strong>Digital Personal Data Protection Act 2023 (DPDPA)</strong>, and best practices
          aligned with GDPR principles for international users.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm space-y-8">

        <Section icon={Database} title="1. What Data We Collect">
          <p><strong className="text-slate-800 dark:text-slate-200">Profile information (optional):</strong> Name, email address, professional headline, career summary, skills, and social profile URLs — entered voluntarily in your profile.</p>
          <p><strong className="text-slate-800 dark:text-slate-200">Resume files (transient only):</strong> When you upload a resume for scanning, the file is read in-memory during analysis and <strong>never stored on our servers</strong>. We do not retain your resume text after the session ends.</p>
          <p><strong className="text-slate-800 dark:text-slate-200">Usage data:</strong> We may collect anonymised, aggregated usage statistics (e.g., number of scans, feature usage) to improve the product. No personally identifiable information (PII) is linked to analytics.</p>
          <p><strong className="text-slate-800 dark:text-slate-200">No tracking pixels, no Facebook/Google Analytics, no ad tracking.</strong></p>
        </Section>

        <Section icon={Eye} title="2. How We Use Your Data">
          <ul className="list-disc list-inside space-y-1">
            <li>To provide AI-powered resume scanning, scoring, and job matching</li>
            <li>To save and display your career profile across sessions</li>
            <li>To improve product features using aggregated, anonymised analytics</li>
            <li>To send transactional emails if you request them (e.g., account notifications)</li>
          </ul>
          <p className="mt-2">We do <strong>not</strong> sell, rent, or trade your personal data to any third party.</p>
        </Section>

        <Section icon={Globe} title="3. Third-Party Services">
          <p>We use the following third-party services to operate ResuScan AI:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li><strong className="text-slate-800 dark:text-slate-200">Supabase</strong> – Database and authentication provider (servers in the EU/US). <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">Privacy Policy</a></li>
            <li><strong className="text-slate-800 dark:text-slate-200">Groq AI</strong> – AI inference for resume analysis. Resume text is sent to Groq's API for processing. Groq does not train on API data. <a href="https://groq.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">Privacy Policy</a></li>
            <li><strong className="text-slate-800 dark:text-slate-200">Vercel / Railway</strong> – Hosting provider. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">Privacy Policy</a></li>
            <li><strong className="text-slate-800 dark:text-slate-200">Google Fonts</strong> – Font delivery (Inter, Outfit). Google may log font requests; no personal data is transmitted.</li>
          </ul>
        </Section>

        <Section icon={Lock} title="4. Data Security">
          <p>All data in transit is encrypted via HTTPS/TLS. Supabase database access is protected by row-level security policies and API key authentication. We do not store resume files at rest.</p>
        </Section>

        <Section icon={Trash2} title="5. Your Rights (DPDPA 2023 / GDPR)">
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-slate-800 dark:text-slate-200">Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Correction:</strong> Update inaccurate profile data directly in the Profile page</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Deletion:</strong> Request deletion of your profile data at any time</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Portability:</strong> Request your data in a machine-readable format</li>
            <li><strong className="text-slate-800 dark:text-slate-200">Withdraw consent:</strong> Stop using the service and request data deletion</li>
          </ul>
          <p className="mt-2">To exercise any right, email: <a href="mailto:privacy@resuscan.ai" className="text-indigo-600 dark:text-indigo-400 underline">privacy@resuscan.ai</a></p>
        </Section>

        <Section icon={AlertCircle} title="6. Cookies">
          <p>We use only strictly necessary session cookies required for the application to function (e.g., authentication state). We do <strong>not</strong> use advertising cookies, cross-site tracking cookies, or third-party marketing pixels. See our <button onClick={() => onBack && onBack('cookies')} className="text-indigo-600 dark:text-indigo-400 underline">Cookie Policy</button> for details.</p>
        </Section>

        <Section icon={Mail} title="7. Contact">
          <p>Registered in India. For privacy enquiries: <a href="mailto:privacy@resuscan.ai" className="text-indigo-600 dark:text-indigo-400 underline">privacy@resuscan.ai</a></p>
          <p>We will respond to data subject requests within <strong>30 days</strong> as required under DPDPA 2023.</p>
        </Section>
      </div>
    </div>
  );
}
