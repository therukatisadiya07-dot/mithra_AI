/**
 * Shiftwise - How It Works Page
 * Detailed explanation of the 7-step student workflow and 8-step employer workflow,
 * mutual confirmation rules, and demo payment models.
 */

import React from 'react';
import {
  GraduationCap,
  Building2,
  CheckCircle,
  Clock,
  Shield,
  CreditCard,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (view: string) => void;
  onOpenAgreement: (role: 'student' | 'employer') => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate, onOpenAgreement }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
          Clear & Structured
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
          How Shiftwise Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Shiftwise provides a transparent, accountable pipeline connecting Indian college students (18+) with verified employers for flexible part-time engagements.
        </p>
      </div>

      {/* Demo Disclosure Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-bold text-sm">Demonstration-Only Environment Notice</h3>
          <p className="leading-relaxed">
            Shiftwise is currently operating in prototype mode under Mithra_AI. All payment checkpoints (the ₹100 employer portfolio fee, the ₹100 candidate placement fee, and the ₹500 student quarterly subscription) are simulated workflows. No real bank accounts or UPI payment gateways are connected.
          </p>
        </div>
      </div>

      {/* Section 1: The Student Journey */}
      <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">The Student Workflow (7 Steps)</h2>
            <p className="text-xs text-purple-700 font-semibold">
              Free job browsing and applications for the first two years
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          {[
            {
              step: 'Step 1: Account Creation',
              title: 'Confirm Age & Register',
              desc: 'Confirm you are 18 years of age or older. Sign up via email & password or simulated phone OTP. Actively accept the Shiftwise Student Agreement.',
            },
            {
              step: 'Step 2: Profile Completion',
              title: 'Highlight Your Potential',
              desc: 'Add your college, course, year, technical/non-technical skills, and weekly availability. Informal experience (e.g. 2 months at a local store) is valued.',
            },
            {
              step: 'Step 3: Discover Flexible Roles',
              title: 'Explore Online & Offline Jobs',
              desc: 'Filter opportunities by domain, working hours, and location. Review rule-based match recommendations based on your profile skills.',
            },
            {
              step: 'Step 4: Submit Application',
              title: 'Zero Fees to Apply',
              desc: 'Submit your application with an optional note to the employer. Your application enters status "Submitted" with a recorded timestamp.',
            },
            {
              step: 'Step 5: Employer Decision',
              title: 'Track Review Progress',
              desc: 'The employer reviews your profile. If they reject, you are notified. If they accept, the application moves to "Accepted — Awaiting Student Confirmation".',
            },
            {
              step: 'Step 6: Mutual Confirmation',
              title: 'You Decide Whether to Accept',
              desc: 'You have full autonomy. If you confirm the offer, the status becomes "Student Confirmed". If you decline, the employer can review others.',
            },
            {
              step: 'Step 7: Joining Details & Start',
              title: 'Schedule Your First Day',
              desc: 'The employer records your official joining date and instructions. Once you start, you are marked as "Joined".',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
                {item.step}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
              <p className="leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
          <button
            onClick={() => onOpenAgreement('student')}
            className="text-xs text-purple-700 font-semibold hover:underline"
          >
            Review Student Agreement Draft (v1.0) →
          </button>
          <button
            onClick={() => onNavigate('register_role')}
            className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Register as a Student
          </button>
        </div>
      </div>

      {/* Section 2: The Employer Journey */}
      <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">The Employer Workflow (8 Steps)</h2>
            <p className="text-xs text-pink-700 font-semibold">
              Super Admin approval & strict single-portfolio limit
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          {[
            {
              step: 'Step 1: Account Registration',
              title: 'Owner & Business Details',
              desc: 'Enter your business name, workplace address, owner contact, and accept the Employer Agreement.',
            },
            {
              step: 'Step 2: Verification Submission',
              title: 'Legitimacy Documents',
              desc: 'Submit GSTIN, PAN, Udyam MSME, or local Municipal Trade License / Shop Act documents.',
            },
            {
              step: 'Step 3: Super Admin Review',
              title: 'Vetting & Approval',
              desc: 'Super Admin checks submitted credentials, verifies addresses remotely or physically, and approves the account.',
            },
            {
              step: 'Step 4: Single Portfolio Creation',
              title: 'One Portfolio Policy (₹100 Demo)',
              desc: 'Each approved business can create exactly ONE portfolio. Simulating the ₹100 demo activation fee unlocks portfolio setup.',
            },
            {
              step: 'Step 5: Publish Opportunities',
              title: 'Specify Clear Compensation',
              desc: 'Publish part-time roles detailing exact hourly or monthly rates, expected working days, and vacancies.',
            },
            {
              step: 'Step 6: Review Candidates',
              title: 'Direct Application Inbox',
              desc: 'Inspect applicant degrees, skills, and availability. Mark decisions as Accept or Reject with clear audit timestamps.',
            },
            {
              step: 'Step 7: Mutual Confirmation & Joining Date',
              title: 'Lock In Placement',
              desc: 'Once the student confirms the offer, record their official reporting date and reporting instructions.',
            },
            {
              step: 'Step 8: ₹100 Placement Demo Fee & Vacancy Update',
              title: 'Vacancy Closure Reminders',
              desc: 'The ₹100 placement demo fee unlocks only after mutual confirmation and joining date recording. When a student joins, vacancy reminders prompt closing filled posts.',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wider block mb-1">
                {item.step}
              </span>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
              <p className="leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
          <button
            onClick={() => onOpenAgreement('employer')}
            className="text-xs text-pink-700 font-semibold hover:underline"
          >
            Review Employer Agreement Draft (v1.0) →
          </button>
          <button
            onClick={() => onNavigate('for_employers')}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Register as an Employer
          </button>
        </div>
      </div>
    </div>
  );
};
