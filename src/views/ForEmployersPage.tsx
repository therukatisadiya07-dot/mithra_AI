/**
 * Shiftwise For Employers Information Page
 * Explains verification rules, single-portfolio limit, ₹100 demo portfolio fee,
 * ₹100 demo placement fee after mutual confirmation and joining date, and vacancy management.
 */

import React from 'react';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  FileCheck,
  Layers,
  BellRing,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ForEmployersPageProps {
  onNavigate: (view: string) => void;
  onOpenAgreement: (role: 'student' | 'employer') => void;
}

export const ForEmployersPage: React.FC<ForEmployersPageProps> = ({
  onNavigate,
  onOpenAgreement,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
          Employer Partner Portal
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-3 tracking-tight">
          Connect with India's Most Motivated College Talent
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
          Post flexible part-time positions, review verified college student profiles, and manage the complete hiring cycle from application to joining.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('register_role')}
            className="px-6 py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold rounded-2xl text-xs shadow-md"
          >
            Register Business Account
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold rounded-2xl text-xs"
          >
            Employer Log In
          </button>
        </div>
      </div>

      {/* 4 Core Employer Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">1. Mandatory Super Admin Verification</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            To safeguard students, all employer accounts must submit proof of business existence (GSTIN, PAN, Udyam MSME, or Shop Act Trade License). Accounts remain pending until reviewed and approved by the Super Admin. Unapproved employers cannot create a portfolio or post jobs.
          </p>
        </div>

        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">2. Strict Single Portfolio Constraint</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Each approved business is entitled to exactly ONE (1) employer portfolio. Employers manage all their active part-time listings within this single profile. System constraints prohibit duplicate portfolios or spam accounts.
          </p>
        </div>

        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">3. Transparent Fee Structure (Demo)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Shiftwise proposes a modest one-time ₹100 portfolio activation fee, and a ₹100 placement fee per successful placement. NOTE: The placement fee appears ONLY after mutual confirmation by both employer and student, and after the official joining date is recorded. In this prototype, all fees are simulated.
          </p>
        </div>

        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <BellRing className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">4. Vacancy Management & Reminders</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            When a student is marked as "Joined", the remaining vacancy count automatically decreases. If all vacancies are filled, Shiftwise prompts the employer with in-dashboard reminders to review and close or remove the announcement to maintain clean marketplace data.
          </p>
        </div>
      </div>

      {/* FAQ & Legal Guidance */}
      <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Employer Legal Notes & Disclaimers</h3>
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong>Proposed Discontinuation Disclaimer:</strong> The employer agreement contains a carefully worded draft clause clarifying that Shiftwise acts as a connection marketplace and is not liable if a student discontinues their engagement or requests emergency leave. Standard employment or contractor practices apply.
          </p>
          <p>
            <strong>Prohibition on Student Charges:</strong> Employers are strictly prohibited from asking students for security deposits, application processing charges, or unpaid trial periods. Any such violations result in immediate termination of the employer account.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenAgreement('employer')}
              className="text-xs font-semibold text-purple-700 hover:underline"
            >
              Read the Full Employer Agreement Draft (v1.0) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
