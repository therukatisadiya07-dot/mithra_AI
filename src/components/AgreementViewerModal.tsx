/**
 * Agreement Viewer Modal
 * Allows students and employers to inspect active legal agreements,
 * subscription timeline terms, liability disclaimers, and version metadata.
 */

import React from 'react';
import { FileText, ShieldCheck, X } from 'lucide-react';
import { STUDENT_AGREEMENT, EMPLOYER_AGREEMENT } from '../data/agreements';

interface AgreementViewerModalProps {
  role: 'student' | 'employer';
  isOpen: boolean;
  onClose: () => void;
  acceptedAt?: string;
  version?: string;
}

export const AgreementViewerModal: React.FC<AgreementViewerModalProps> = ({
  role,
  isOpen,
  onClose,
  acceptedAt,
  version,
}) => {
  if (!isOpen) return null;

  const doc = role === 'student' ? STUDENT_AGREEMENT : EMPLOYER_AGREEMENT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF9F5] border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{doc.title}</h3>
              <p className="text-xs text-slate-500">
                Version: <span className="font-mono font-semibold text-purple-700">{version || doc.version}</span> • Effective: {doc.effectiveDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acceptance Stamp if available */}
        {acceptedAt && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 my-3 flex items-center gap-2 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              You actively accepted this agreement version on{' '}
              <strong className="font-semibold">{new Date(acceptedAt).toLocaleString()}</strong>.
            </span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-2 py-3 space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 font-medium text-purple-900">
            {doc.summary}
          </div>

          {doc.sections.map((section, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <h4 className="font-bold text-slate-900 mb-1.5 text-[13px]">{section.title}</h4>
              <p className="text-slate-600">{section.content}</p>
            </div>
          ))}

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
            <strong>Legal Note:</strong> This document represents a proposed contractual draft structured under applicable Indian contract and consumer protection standards. Review by qualified Indian legal counsel is required prior to production public launch.
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Close Agreement
          </button>
        </div>
      </div>
    </div>
  );
};
