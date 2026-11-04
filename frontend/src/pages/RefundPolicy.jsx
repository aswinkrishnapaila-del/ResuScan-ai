import React from 'react';
import { RefreshCw, AlertCircle, CheckCircle2, Mail, Clock } from 'lucide-react';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
          <Icon size={17} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2 pl-12">
        {children}
      </div>
    </div>
  );
}

export default function RefundPolicy() {
  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-8">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <RefreshCw size={22} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Refund Policy</h1>
            <p className="text-xs text-slate-400 mt-0.5">Last updated: 21 October 2026</p>
          </div>
        </div>
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 p-4">
          <p className="text-sm text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            ResuScan AI is currently free to use. No payment is required for any core feature.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm space-y-8">

        <Section icon={RefreshCw} title="Current Pricing">
          <p>As of the date of this policy, ResuScan AI is a <strong>free service</strong>. We do not charge for:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Resume scanning and ATS scoring</li>
            <li>AI-powered resume improvement</li>
            <li>Job matching suggestions</li>
            <li>Interview preparation</li>
            <li>Profile storage</li>
          </ul>
        </Section>

        <Section icon={AlertCircle} title="Future Paid Features">
          <p>If we introduce paid features or subscriptions in the future, this policy will be updated. For any paid tier, we intend to offer:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>A <strong>7-day full refund</strong> for annual plans if you are unsatisfied</li>
            <li>A <strong>3-day full refund</strong> for monthly plans from the date of first charge</li>
            <li>No refunds for usage already consumed beyond a reasonable threshold</li>
          </ul>
        </Section>

        <Section icon={Clock} title="Requesting a Refund (Future)">
          <p>To request a refund (when applicable):</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Email <a href="mailto:billing@resuscan.ai" className="text-emerald-600 dark:text-emerald-400 underline">billing@resuscan.ai</a> within the refund window</li>
            <li>Include your registered email address and order/transaction ID</li>
            <li>Briefly describe your reason for requesting a refund</li>
          </ol>
          <p className="mt-2">We will process approved refunds within <strong>5–10 business days</strong> via the original payment method.</p>
        </Section>

        <Section icon={Mail} title="Contact">
          <p>For billing questions: <a href="mailto:billing@resuscan.ai" className="text-emerald-600 dark:text-emerald-400 underline">billing@resuscan.ai</a></p>
          <p>This policy is governed by Indian consumer protection law including the Consumer Protection Act 2019.</p>
        </Section>

      </div>
    </div>
  );
}
