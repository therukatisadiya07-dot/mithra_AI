/**
 * Shiftwise Demo QR Payment Screen
 * Strictly for demonstration only.
 * Simulates UPI / QR payment workflow without transferring any real money or storing credentials.
 */

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Sparkles, X } from 'lucide-react';

interface DemoQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  amount: number;
  purposeLabel: string;
  beneficiaryName?: string;
  onSimulateSuccess: () => Promise<void>;
}

export const DemoQrModal: React.FC<DemoQrModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  amount,
  purposeLabel,
  beneficiaryName = 'Shiftwise Marketplace (Mithra_AI)',
  onSimulateSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [demoRef, setDemoRef] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      // Simulate realistic network delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await onSimulateSuccess();
      const generatedRef = `DEMO-TXN-${Date.now().toString().slice(-6)}`;
      setDemoRef(generatedRef);
      setIsCompleted(true);
    } catch (err: any) {
      setError(err.message || 'Simulation encountered an unexpected issue.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDone = () => {
    setIsCompleted(false);
    setDemoRef('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF9F5] border border-amber-200/80 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Top Disclaimer Banner */}
        <div className="bg-amber-100/90 text-amber-900 border border-amber-300 rounded-xl px-3 py-2 mb-4 flex items-center gap-2 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>PROTOTYPE DEMONSTRATION — NO REAL MONEY WILL BE TRANSFERRED</span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCompleted ? (
          <div>
            <div className="text-center mb-5">
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            </div>

            {/* Amount Badge */}
            <div className="bg-white border border-purple-100 rounded-2xl p-4 text-center mb-5 shadow-sm">
              <span className="text-xs font-medium uppercase tracking-wider text-purple-700">Amount Due (Demo)</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-0.5">₹{amount}</div>
              <p className="text-xs text-slate-500 mt-1">{purposeLabel}</p>
            </div>

            {/* Simulated QR Box */}
            <div className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-purple-200 rounded-2xl p-5 mb-5 shadow-inner">
              <div className="relative p-2 bg-white rounded-xl shadow-md border border-slate-100">
                {/* SVG QR Code Simulation */}
                <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer corner finders */}
                  <rect x="5" y="5" width="26" height="26" rx="4" stroke="#4C1D95" strokeWidth="4" />
                  <rect x="11" y="11" width="14" height="14" rx="2" fill="#7C3AED" />
                  <rect x="69" y="5" width="26" height="26" rx="4" stroke="#4C1D95" strokeWidth="4" />
                  <rect x="75" y="11" width="14" height="14" rx="2" fill="#7C3AED" />
                  <rect x="5" y="69" width="26" height="26" rx="4" stroke="#4C1D95" strokeWidth="4" />
                  <rect x="11" y="75" width="14" height="14" rx="2" fill="#7C3AED" />

                  {/* Decorative data pixels */}
                  <rect x="37" y="10" width="8" height="8" rx="1" fill="#6B21A8" />
                  <rect x="50" y="10" width="12" height="8" rx="1" fill="#9333EA" />
                  <rect x="37" y="24" width="25" height="7" rx="1" fill="#7E22CE" />
                  <rect x="10" y="37" width="12" height="8" rx="1" fill="#9333EA" />
                  <rect x="28" y="37" width="18" height="8" rx="1" fill="#6B21A8" />
                  <rect x="52" y="37" width="16" height="16" rx="2" fill="#7C3AED" />
                  <rect x="74" y="37" width="16" height="8" rx="1" fill="#9333EA" />
                  <rect x="10" y="50" width="36" height="12" rx="1" fill="#7E22CE" />
                  <rect x="74" y="50" width="16" height="12" rx="1" fill="#6B21A8" />
                  <rect x="37" y="69" width="12" height="26" rx="1" fill="#9333EA" />
                  <rect x="55" y="69" width="14" height="10" rx="1" fill="#7C3AED" />
                  <rect x="55" y="83" width="38" height="12" rx="1" fill="#6B21A8" />

                  {/* Center Demo Badge */}
                  <rect x="35" y="42" width="30" height="16" rx="4" fill="#FAF5FF" stroke="#A855F7" strokeWidth="1.5" />
                  <text x="50" y="53" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#6B21A8">
                    DEMO QR
                  </text>
                </svg>
              </div>

              <span className="text-[11px] text-slate-500 font-mono mt-3">
                Payee: {beneficiaryName}
              </span>
              <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full mt-1">
                Scan with any mock UPI app or click simulate below
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 mb-4">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Mock Simulation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Simulate Demo Payment (₹{amount})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="w-full text-slate-600 hover:text-slate-800 text-xs py-2 text-center"
              >
                Cancel and return
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Demo Payment Recorded</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Simulated demonstration payment completed successfully. This is a prototype record and no real banking transaction occurred.
            </p>

            <div className="bg-white border border-slate-200 rounded-xl p-3 my-5 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Demo Reference:</span>
                <span className="font-mono font-semibold text-slate-700">{demoRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Simulated:</span>
                <span className="font-semibold text-slate-800">₹{amount} (DEMO)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-700 font-semibold">Demo Completed</span>
              </div>
            </div>

            <button
              onClick={handleDone}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all"
            >
              Continue to Dashboard
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
          <span>Shiftwise Mithra_AI v1.0</span>
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-500" /> Demo Sandbox
          </span>
        </div>
      </div>
    </div>
  );
};
