/**
 * Shiftwise Landing Page
 * Welcoming, professional, cream-white background with lavender and soft pink accents.
 * Aligns with Section 3 requirements.
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  GraduationCap,
  Building2,
  Clock,
  Shield,
  Sparkles,
  Search,
  IndianRupee,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Job } from '../types';
import { apiClient } from '../lib/apiClient';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onSelectJob: (job: Job) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectJob }) => {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getJobs()
      .then((res) => {
        setFeaturedJobs(res.jobs.slice(0, 4));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* SECTION B: HERO */}
      <section className="relative pt-8 sm:pt-14 pb-8 overflow-hidden">
        {/* Subtle decorative background shapes in restrained lavender & soft pink */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none -z-10">
          <div className="absolute top-4 left-1/4 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute top-12 right-1/4 w-72 h-72 bg-pink-100/40 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center">
          {/* Market Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span>Mithra_AI • Student Part-Time Opportunities Across India</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
            Your Skills. Your Time.{' '}
            <span className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Opportunity.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Shiftwise helps college students discover flexible, vetted part-time opportunities and helps verified employers connect with motivated talent.
          </p>

          {/* Two prominent action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-10">
            <button
              onClick={() => onNavigate('find_jobs')}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
            >
              <Search className="w-4 h-4" />
              <span>Find Part-Time Jobs</span>
            </button>
            <button
              onClick={() => onNavigate('for_employers')}
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
            >
              <Building2 className="w-4 h-4 text-purple-700" />
              <span>Hire Students</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 pt-2 border-t border-slate-200/60 max-w-3xl mx-auto">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Super Admin Employer Verification</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span>2-Year Free Student Browsing</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-4 h-4 text-pink-600" />
              <span>Technical & Non-Technical Roles</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            Transparent Workflows
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
            How Shiftwise Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            A structured, mutually confirmed process designed to protect students and employers alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Journey Card */}
          <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs hover:border-purple-200 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">For Students</h3>
                <span className="text-xs text-purple-700 font-semibold">100% Free for First 2 Years</span>
              </div>
            </div>

            <ol className="space-y-4 text-xs text-slate-600">
              {[
                { step: '1', title: 'Create an Account', desc: 'Confirm you are 18+ and register via phone OTP or email.' },
                { step: '2', title: 'Complete Your Profile', desc: 'Add skills, college, availability, and relevant experience.' },
                { step: '3', title: 'Discover Suitable Jobs', desc: 'Explore online, offline, tech, or non-tech roles.' },
                { step: '4', title: 'Apply for an Opportunity', desc: 'Submit a free application with zero upfront payment.' },
                { step: '5', title: 'Receive Employer Decision', desc: 'Track your review status directly in your dashboard.' },
                { step: '6', title: 'Confirm the Offer', desc: 'Active mutual confirmation required if you accept.' },
                { step: '7', title: 'Record Joining Details', desc: 'Receive your scheduled start date and reporting steps.' },
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800">{item.title}: </span>
                    <span>{item.desc}</span>
                  </div>
                </li>
              ))}
            </ol>

            <button
              onClick={() => onNavigate('register_role')}
              className="mt-6 w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold rounded-xl text-xs transition-colors text-center"
            >
              Register as Student →
            </button>
          </div>

          {/* Employer Journey Card */}
          <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs hover:border-pink-200 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">For Employers</h3>
                <span className="text-xs text-pink-700 font-semibold">Strict 1-Portfolio & Verification Policy</span>
              </div>
            </div>

            <ol className="space-y-3.5 text-xs text-slate-600">
              {[
                { step: '1', title: 'Register Business Account', desc: 'Provide owner contact & company details.' },
                { step: '2', title: 'Submit Verification Documents', desc: 'Upload GSTIN, PAN, or local trade license.' },
                { step: '3', title: 'Await Super Admin Approval', desc: 'Platform oversight team verifies legitimacy.' },
                { step: '4', title: 'Initialize 1 Portfolio (₹100 Demo)', desc: 'Complete simulated fee to unlock your single portfolio.' },
                { step: '5', title: 'Publish Job Announcements', desc: 'List flexible hours, salary, and requirements.' },
                { step: '6', title: 'Review Student Applicants', desc: 'Evaluate college backgrounds, skills & experience.' },
                { step: '7', title: 'Extend Offer or Reject', desc: 'Candidate must actively confirm your offer.' },
                { step: '8', title: 'Schedule Joining & Placement Demo', desc: 'Record start date and review vacancy closure reminders.' },
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800">{item.title}: </span>
                    <span>{item.desc}</span>
                  </div>
                </li>
              ))}
            </ol>

            <button
              onClick={() => onNavigate('for_employers')}
              className="mt-6 w-full py-2.5 px-4 bg-pink-50 hover:bg-pink-100 text-pink-800 font-semibold rounded-xl text-xs transition-colors text-center"
            >
              View Employer Guidelines →
            </button>
          </div>
        </div>
      </section>

      {/* SECTION D: WHY SHIFTWISE? */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-br from-white via-purple-50/40 to-pink-50/30 border border-[#EFECE6] rounded-3xl p-8 sm:p-12 shadow-xs">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Platform Pillars</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              Why Students & Employers Choose Shiftwise
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Balanced, ethical marketplace built specifically for the realities of Indian college life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Truly Flexible Opportunities</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Roles configured around study hours — evening shifts, weekends, and remote deliverables with study break flexibility.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center mb-3">
                <Briefcase className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Technical & Non-Technical</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                From React and Python development to cafe guest coordination, content creation, tutoring, and customer operations.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Super Admin Verification</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every business must submit verification documentation and address details before publishing job announcements.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Transparent Status Tracking</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track exact timestamps: submitted, reviewed, offered, confirmed, and scheduled with an audit trail.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <IndianRupee className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Clear Indian Rupee Rates</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clear compensation listed on every card with specified basis (hourly, weekly, monthly, or fixed).
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Student Safety First</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero fees to apply. Dedicated reporting system for suspicious postings, non-payment, or misleading terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT FEATURED JOBS SECTION */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Opportunities</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore active verified listings accepting student applications.</p>
          </div>
          <button
            onClick={() => onNavigate('find_jobs')}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-white border border-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="bg-white border border-[#EFECE6] hover:border-purple-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
                        {job.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-0.5">{job.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{job.businessName}</span>
                        {job.employerVerified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-slate-900">
                        ₹{job.salary.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-400 capitalize">per {job.salaryBasis}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.requiredSkills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{job.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 mt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="capitalize">{job.workMode}</span>
                    <span>•</span>
                    <span>{job.workingHours}</span>
                  </div>
                  <span className="text-purple-700 font-semibold hover:underline flex items-center gap-1 text-[11px]">
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Ready to find flexible student work?
          </h2>
          <p className="text-purple-200 text-xs sm:text-sm max-w-lg mx-auto mb-6">
            Join Shiftwise today with 2 years of completely free job browsing and direct applications.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('register_role')}
              className="w-full sm:w-auto px-7 py-3 bg-white hover:bg-slate-100 text-purple-950 font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Register for Free (Students)
            </button>
            <button
              onClick={() => onNavigate('for_employers')}
              className="w-full sm:w-auto px-7 py-3 bg-purple-800/80 hover:bg-purple-800 text-white border border-purple-400/40 font-semibold rounded-xl text-xs transition-all"
            >
              Post a Job (Employers)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
