/**
 * Shiftwise Job Discovery & Applications View
 * Features rich search, multi-faceted filtering, rule-based recommendations,
 * and comprehensive detail views before application submission.
 */

import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  IndianRupee,
  Briefcase,
  Sparkles,
  AlertCircle,
  Share2,
  ShieldAlert,
  X,
  Send,
  Building2,
  Check,
} from 'lucide-react';
import { Job, JobApplication } from '../types';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

interface FindJobsPageProps {
  onNavigate: (view: string) => void;
  onOpenSafetyReport: (jobId?: string, jobTitle?: string, employerId?: string, employerName?: string) => void;
  selectedJobInitial?: Job | null;
}

export const FindJobsPage: React.FC<FindJobsPageProps> = ({
  onNavigate,
  onOpenSafetyReport,
  selectedJobInitial,
}) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendations, setRecommendations] = useState<{ job: Job; score: number; matchReason: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [technicalFilter, setTechnicalFilter] = useState<'all' | 'true' | 'false'>('all');
  const [workModeFilter, setWorkModeFilter] = useState<'all' | 'online' | 'offline' | 'hybrid'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Selected job for detail modal
  const [activeJob, setActiveJob] = useState<Job | null>(selectedJobInitial || null);
  const [coverNote, setCoverNote] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Existing student applications to prevent duplicate attempts visually
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (technicalFilter !== 'all') params.technical = technicalFilter;
      if (workModeFilter !== 'all') params.mode = workModeFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (sortBy) params.sort = sortBy;

      const res = await apiClient.getJobs(params);
      setJobs(res.jobs || []);

      // If student is logged in, fetch smart match recommendations and active applications
      if (user?.role === 'student') {
        try {
          const matchRes = await apiClient.getRecommendations();
          setRecommendations(matchRes.recommendations || []);
          const appRes = await apiClient.getStudentApplications();
          setMyApplications(appRes.applications || []);
        } catch (e) {
          console.warn('Could not load student matches:', e);
        }
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, technicalFilter, workModeFilter, categoryFilter, sortBy]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onNavigate('login');
      return;
    }

    if (user.role !== 'student') {
      setApplyError('Only registered student accounts can apply for jobs.');
      return;
    }

    if (!activeJob) return;

    setIsApplying(true);
    setApplyError(null);

    try {
      await apiClient.applyToJob(activeJob.id, coverNote);
      setApplySuccess(true);
      // Refresh my applications
      const appRes = await apiClient.getStudentApplications();
      setMyApplications(appRes.applications || []);
    } catch (err: any) {
      setApplyError(err.message || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  const isAlreadyApplied = (jobId: string) => {
    return myApplications.some(
      (a) => a.jobId === jobId && !['withdrawn', 'closed', 'rejected', 'student_declined'].includes(a.status)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Part-Time Jobs</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Flexible, verified opportunities across India for college students (18+) with transparent pay rates.
        </p>
      </div>

      {/* STUDENT SMART RECOMMENDATIONS BANNER (RULE-BASED MATCHING) */}
      {user?.role === 'student' && recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 via-pink-50/50 to-white border border-purple-200/80 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <h2 className="text-sm font-bold text-slate-900">Recommended For You</h2>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
              Matched to your profile
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.slice(0, 3).map(({ job, matchReason }) => (
              <div
                key={job.id}
                onClick={() => {
                  setActiveJob(job);
                  setApplySuccess(false);
                  setApplyError(null);
                }}
                className="bg-white border border-purple-100/80 hover:border-purple-300 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">{job.category}</div>
                  <h3 className="font-bold text-slate-900 mt-0.5 text-sm">{job.title}</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">{job.businessName}</p>

                  <div className="bg-purple-50/70 text-purple-900 p-2 rounded-xl mt-2 text-[10px] font-medium leading-relaxed">
                    💡 {matchReason}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                  <span className="font-bold text-slate-900">
                    ₹{job.salary.toLocaleString('en-IN')}/{job.salaryBasis}
                  </span>
                  <span className="text-purple-700 font-semibold hover:underline">View & Apply →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white border border-[#EFECE6] rounded-2xl p-4 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by job title, skills (e.g. React, Writing, Barista), or employer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Work Mode</label>
            <select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value as any)}
              className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              <option value="all">All Modes</option>
              <option value="online">Online / Remote</option>
              <option value="offline">Offline / Location-based</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Domain</label>
            <select
              value={technicalFilter}
              onChange={(e) => setTechnicalFilter(e.target.value as any)}
              className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              <option value="all">All Domains</option>
              <option value="true">Technical Only</option>
              <option value="false">Non-Technical Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              <option value="all">All Categories</option>
              <option value="Software & Web Development">Software & Web</option>
              <option value="Data & AI Operations">Data & AI</option>
              <option value="Hospitality & Customer Service">Hospitality & Food</option>
              <option value="Media & Marketing">Media & Marketing</option>
              <option value="Tutoring & Content">Tutoring & Content</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              <option value="newest">Recently Published</option>
              <option value="salary_high">Highest Compensation</option>
              <option value="salary_low">Lowest Compensation</option>
            </select>
          </div>
        </div>
      </div>

      {/* JOBS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{jobs.length}</strong> opportunities
          </span>
          {(search || technicalFilter !== 'all' || workModeFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setTechnicalFilter('all');
                setWorkModeFilter('all');
                setCategoryFilter('all');
              }}
              className="text-purple-700 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-52 bg-white border border-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#EFECE6] rounded-3xl p-6">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No matching jobs found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria, clearing domain filters, or checking back soon as verified employers post new openings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => {
              const applied = isAlreadyApplied(job.id);
              return (
                <div
                  key={job.id}
                  onClick={() => {
                    setActiveJob(job);
                    setApplySuccess(false);
                    setApplyError(null);
                  }}
                  className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                    applied ? 'border-purple-300 bg-purple-50/20' : 'border-[#EFECE6] hover:border-purple-300'
                  }`}
                >
                  <div>
                    {/* Header: Category & Compensation */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                        {job.category}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">
                          ₹{job.salary.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 block -mt-1 capitalize">
                          /{job.salaryBasis}
                        </span>
                      </div>
                    </div>

                    {/* Title & Employer */}
                    <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600">
                      <span className="font-medium text-slate-700 truncate">{job.businessName}</span>
                      {job.employerVerified && (
                        <span className="shrink-0 flex items-center gap-0.5 text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verified
                        </span>
                      )}
                    </div>

                    {/* Description preview */}
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium capitalize">
                        {job.workMode}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {job.workingHours}
                      </span>
                      {job.isTechnical ? (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
                          Technical
                        </span>
                      ) : (
                        <span className="text-[10px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-md font-medium">
                          Non-Tech
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {job.vacancies} vacancy{job.vacancies > 1 ? 'ies' : ''} left
                    </span>
                    {applied ? (
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Applied
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-purple-700 hover:underline">
                        Details & Apply →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPREHENSIVE JOB DETAILS MODAL */}
      {activeJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF9F5] border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveJob(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="pr-8 mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  {activeJob.category}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 capitalize">{activeJob.workMode}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">{activeJob.title}</h2>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="font-semibold text-slate-800">{activeJob.businessName}</span>
                {activeJob.employerVerified && (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Business
                  </span>
                )}
              </div>
            </div>

            {/* Compensation & Key Conditions Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">Compensation</span>
                <span className="font-extrabold text-sm text-slate-900">
                  ₹{activeJob.salary.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 block capitalize">per {activeJob.salaryBasis}</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">Commitment</span>
                <span className="font-bold text-slate-800">{activeJob.workingHours}</span>
                <span className="text-[10px] text-slate-500 block truncate">{activeJob.expectedDays}</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">Location</span>
                <span className="font-bold text-slate-800 truncate block">{activeJob.location}</span>
                <span className="text-[10px] text-slate-500 block capitalize">{activeJob.workMode}</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">Vacancies</span>
                <span className="font-bold text-slate-800">{activeJob.vacancies} open</span>
                <span className="text-[10px] text-slate-500 block">Initial: {activeJob.initialVacancies}</span>
              </div>
            </div>

            {/* Body Information */}
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed mb-6">
              <div>
                <h4 className="font-bold text-slate-900 mb-1 text-sm">Role Description</h4>
                <p className="text-slate-600 whitespace-pre-line">{activeJob.description}</p>
              </div>

              {activeJob.responsibilities && activeJob.responsibilities.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 text-sm">Key Responsibilities</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {activeJob.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-900 mb-1 text-sm">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activeJob.requiredSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-purple-100 text-purple-900 px-2.5 py-1 rounded-lg font-medium text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {activeJob.eligibility && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 text-sm">Eligibility Criteria</h4>
                  <p className="text-slate-600">{activeJob.eligibility}</p>
                </div>
              )}

              {activeJob.joiningRequirements && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <h4 className="font-bold text-slate-900 mb-0.5">Joining / Equipment Requirements</h4>
                  <p className="text-slate-600">{activeJob.joiningRequirements}</p>
                </div>
              )}

              {activeJob.importantConditions && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                  <h4 className="font-bold mb-0.5">Special Conditions</h4>
                  <p className="text-[11px] leading-relaxed">{activeJob.importantConditions}</p>
                </div>
              )}
            </div>

            {/* Application Section */}
            <div className="pt-4 border-t border-slate-200">
              {applySuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-900 text-sm">Application Submitted!</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Your profile was submitted with status "Submitted". The employer will review your details. You can track progress in your dashboard.
                  </p>
                  <button
                    onClick={() => {
                      setActiveJob(null);
                      onNavigate('student_dashboard');
                    }}
                    className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                  >
                    Go to Applications Dashboard →
                  </button>
                </div>
              ) : isAlreadyApplied(activeJob.id) ? (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-700" />
                    <span className="font-semibold text-purple-900">
                      You already have an active application for this role.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveJob(null);
                      onNavigate('student_dashboard');
                    }}
                    className="text-purple-700 font-bold hover:underline"
                  >
                    View Status →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-3">
                  {applyError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{applyError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Short Cover Note for Employer (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Highlight why you are interested and your weekly availability..."
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenSafetyReport(
                          activeJob.id,
                          activeJob.title,
                          activeJob.employerId,
                          activeJob.businessName
                        )
                      }
                      className="text-[11px] text-slate-400 hover:text-red-600 flex items-center gap-1 font-medium transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Report suspicious job
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveJob(null)}
                        className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        disabled={isApplying}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isApplying ? (
                          'Submitting...'
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" /> Apply for Free (₹0)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
