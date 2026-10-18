/**
 * Shiftwise Safety, Terms & Legal Guidelines Page
 */

import React from 'react';
import { Shield, ShieldAlert, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface LegalSafetyPageProps {
  onOpenSafetyReport: () => void;
  onOpenAgreement: (role: 'student' | 'employer') => void;
}

export const LegalSafetyPage: React.FC<LegalSafetyPageProps> = ({
  onOpenSafetyReport,
  onOpenAgreement,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
          Trust, Safety & Governance
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-3">Safety & Legal Guidelines</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Shiftwise (Mithra_AI) is committed to providing a safe, verified marketplace for Indian students and employers.
        </p>
      </div>

      {/* Safety Alert Action Box */}
      <div className="bg-red-50 border border-red-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-950">Notice a Suspicious Job or Employer?</h3>
            <p className="text-xs text-red-800 mt-1 max-w-xl">
              If any employer requests money upfront, behaves inappropriately, or offers misleading terms, report them immediately. Reports go straight to the Super Admin investigation desk.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSafetyReport}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs shadow shrink-0"
        >
          Submit Safety Report
        </button>
      </div>

      {/* 5 Core Safety Rules for Students */}
      <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">5 Student Safety Principles</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h4 className="font-bold text-slate-900 mb-1">1. Never Pay Upfront Fees</h4>
            <p className="leading-relaxed">
              No genuine employer on Shiftwise will ever ask you to pay for "registration", "equipment deposits", or "mandatory training kits".
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h4 className="font-bold text-slate-900 mb-1">2. Mutual Confirmation Protects You</h4>
            <p className="leading-relaxed">
              You are never forced into an offer. You must actively confirm an extended offer before any joining date is scheduled.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h4 className="font-bold text-slate-900 mb-1">3. Vetted Physical Workplaces</h4>
            <p className="leading-relaxed">
              For in-person jobs, verify that the workplace is a legitimate commercial establishment. Shiftwise verifies business addresses during employer onboarding.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h4 className="font-bold text-slate-900 mb-1">4. Protect Sensitive PII</h4>
            <p className="leading-relaxed">
              Do not share bank OTPs, Aadhaar numbers, or personal payment credentials with anyone. Shiftwise never asks for banking passwords.
            </p>
          </div>
        </div>
      </div>

      {/* Legal Agreements Access */}
      <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-3">Active Legal Agreements (Draft v1.0)</h3>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          Both students and employers must actively review and accept the respective legal agreements before completing account registration. You can inspect the complete terms below.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => onOpenAgreement('student')}
            className="flex-1 p-4 bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200 rounded-2xl text-left transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-purple-700" />
              <span className="font-bold text-slate-900 text-xs">Student Registration Agreement</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Covers 2-year free browsing, proposed ₹500 subscription policy, and student code of conduct.
            </p>
          </button>

          <button
            onClick={() => onOpenAgreement('employer')}
            className="flex-1 p-4 bg-pink-50/70 hover:bg-pink-100/70 border border-pink-200 rounded-2xl text-left transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-pink-700" />
              <span className="font-bold text-slate-900 text-xs">Employer Terms & Agreement</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Covers business verification, single portfolio constraint, demo fees, and draft discontinuation clause.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
