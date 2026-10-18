/**
 * Shiftwise Footer Component
 * Outlines legal disclosures, navigation links, and prototype demo status.
 */

import React from 'react';
import { Briefcase, Shield, Heart, FileText, AlertTriangle } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenSafetyReport: () => void;
  onOpenAgreement: (role: 'student' | 'employer') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenSafetyReport,
  onOpenAgreement,
}) => {
  return (
    <footer className="bg-white border-t border-[#EFECE6] pt-12 pb-8 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Prototype Demo Banner */}
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Prototype Demonstration Model:</span> Shiftwise does not process real monetary transactions in this release. All fees (₹100 portfolio, ₹100 placement, ₹500 student subscription) are simulated workflows.
            </div>
          </div>
          <span className="font-mono text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-1 rounded-lg shrink-0">
            Mithra_AI • India
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs">
                S
              </div>
              <span className="font-extrabold text-base text-slate-900">Shiftwise</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs">
              Connecting motivated students (18+) across India with verified part-time employers for flexible, skill-building opportunities.
            </p>
            <div className="text-[11px] text-slate-400">
              Project <strong className="text-slate-700">Mithra_AI</strong> • Operating in Indian Rupees (₹)
            </div>
          </div>

          {/* Col 2: For Students */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">For Students</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('find_jobs')} className="hover:text-purple-700 transition-colors">
                  Browse Flexible Jobs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('register_role')} className="hover:text-purple-700 transition-colors">
                  Student Registration (2-Year Free Tier)
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAgreement('student')} className="hover:text-purple-700 transition-colors flex items-center gap-1">
                  <FileText className="w-3 h-3 text-purple-600" /> Student Agreement (v1.0)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how_it_works')} className="hover:text-purple-700 transition-colors">
                  Student Application Workflow
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: For Employers */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">For Employers</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('for_employers')} className="hover:text-purple-700 transition-colors">
                  Employer Verification Process
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('register_role')} className="hover:text-purple-700 transition-colors">
                  Register Business Account
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAgreement('employer')} className="hover:text-purple-700 transition-colors flex items-center gap-1">
                  <FileText className="w-3 h-3 text-purple-600" /> Employer Agreement (v1.0)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how_it_works')} className="hover:text-purple-700 transition-colors">
                  Portfolio & Placement Fee Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust, Safety & Legal */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Trust & Safety</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenSafetyReport}
                  className="hover:text-red-600 transition-colors text-red-600 font-medium flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" /> Report a Concern or Suspicious Job
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal_safety')} className="hover:text-purple-700 transition-colors">
                  Safety Guidelines & Conduct Rules
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal_safety')} className="hover:text-purple-700 transition-colors">
                  Terms & Conditions (Draft)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin_login')} className="hover:text-slate-900 transition-colors text-[11px] text-slate-400">
                  Super Admin Portal Access
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <p>© 2026 Shiftwise (Mithra_AI). Built for Indian students and verified local employers.</p>
          <p className="text-[10px]">
            Legal disclaimer: Draft terms and agreements subject to review under Indian contract law prior to production deployment.
          </p>
        </div>
      </div>
    </footer>
  );
};
