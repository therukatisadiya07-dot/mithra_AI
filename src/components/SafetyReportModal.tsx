/**
 * Shiftwise Safety & Concern Reporting Modal
 * Accessible across student and employer portals.
 * Submits directly to the protected Super Admin dashboard.
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { SafetyReportCategory } from '../types';
import { apiClient } from '../lib/apiClient';

interface SafetyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetJobId?: string;
  targetJobTitle?: string;
  targetEmployerId?: string;
  targetEmployerName?: string;
}

export const SafetyReportModal: React.FC<SafetyReportModalProps> = ({
  isOpen,
  onClose,
  targetJobId,
  targetJobTitle,
  targetEmployerId,
  targetEmployerName,
}) => {
  const [category, setCategory] = useState<SafetyReportCategory>('suspicious_job');
  const [subjectTitle, setSubjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectTitle.trim() || !description.trim()) {
      setError('Please provide both a subject title and a description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.submitSafetyReport({
        category,
        subjectTitle: subjectTitle.trim(),
        description: description.trim(),
        reportedJobId: targetJobId,
        reportedJobTitle: targetJobTitle,
        reportedEmployerId: targetEmployerId,
        reportedEmployerName: targetEmployerName,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setSubjectTitle('');
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF9F5] border border-red-200/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/50"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Report a Safety Concern</h3>
                <p className="text-xs text-slate-500">
                  Your report is strictly confidential and reviewed directly by Super Admin.
                </p>
              </div>
            </div>

            {targetJobTitle && (
              <div className="bg-purple-50/70 border border-purple-200/60 rounded-xl p-3 mb-4 text-xs text-purple-900">
                <span className="font-semibold">Associated Job:</span> {targetJobTitle}
                {targetEmployerName && ` (${targetEmployerName})`}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SafetyReportCategory)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="suspicious_job">Suspicious or Fake Job Posting</option>
                  <option value="misleading_salary">Misleading Salary or Compensation Terms</option>
                  <option value="employer_impersonation">Employer Impersonation or False Identity</option>
                  <option value="harassment">Harassment or Unprofessional Communication</option>
                  <option value="unsafe_conditions">Unsafe Physical Workplace Conditions</option>
                  <option value="non_payment">Payment Default / Unpaid Wages Complaint</option>
                  <option value="inappropriate_info_request">Inappropriate Request for Bank / Sensitive PII</option>
                  <option value="other">Other Concern</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brief Subject Summary *</label>
                <input
                  type="text"
                  placeholder="e.g., Employer asked for security deposit during interview"
                  value={subjectTitle}
                  onChange={(e) => setSubjectTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  placeholder="Provide specific details, dates, messages, or context to help our moderation team investigate..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Submitting Report...' : 'Submit Confidential Report'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Report Successfully Submitted</h4>
            <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto">
              Thank you for keeping Shiftwise safe. Our Trust & Safety administrators have received your report and will review it immediately.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
