/**
 * Student Offer Decision Modal
 * Implements Step 6 in the workflow: Student reviews offer and confirms or declines.
 */

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Calendar, IndianRupee, Clock, MapPin, X } from 'lucide-react';
import { JobApplication } from '../types';
import { apiClient } from '../lib/apiClient';

interface StudentOfferModalProps {
  application: JobApplication;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentOfferModal: React.FC<StudentOfferModalProps> = ({
  application,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    setError(null);
    try {
      await apiClient.confirmOffer(application.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to confirm offer.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    setError(null);
    try {
      await apiClient.declineOffer(application.id, declineReason);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to decline offer.');
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF9F5] border border-purple-200/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Job Offer Received!</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {application.employerBusinessName} has accepted your application for {application.jobTitle}.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 mb-5 text-xs space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Position:</span>
            <span className="font-bold text-slate-800">{application.jobTitle}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Employer:</span>
            <span className="font-semibold text-slate-800">{application.employerBusinessName}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-slate-500">Offer Extended On:</span>
            <span className="text-slate-700">
              {application.employerDecisionAt
                ? new Date(application.employerDecisionAt).toLocaleDateString()
                : 'Recent'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <strong>Next Step:</strong> If you confirm, the employer will schedule your official joining date. If you decline, this offer will be withdrawn and the employer may consider other candidates.
          </div>
        </div>

        {!showDeclineReason ? (
          <div className="space-y-2.5">
            <button
              onClick={handleConfirm}
              disabled={isConfirming || isDeclining}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl shadow transition-all active:scale-[0.99] disabled:opacity-50 text-xs"
            >
              {isConfirming ? (
                'Confirming Offer...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yes, I Confirm & Accept this Offer</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowDeclineReason(true)}
              disabled={isConfirming || isDeclining}
              className="w-full flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition-all text-xs"
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>Decline Offer</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for declining (optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Schedule clash with upcoming exams"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeclineReason(false)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={isDeclining}
                className="flex-1 px-3 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow disabled:opacity-50"
              >
                {isDeclining ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
