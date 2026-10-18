/**
 * Shiftwise Employer Dashboard
 * Implements Sections 8, 10, 11, 12, 13, 14, 15, 16:
 * - Approval gate (unapproved employers cannot create a portfolio)
 * - ₹100 demo portfolio creation fee
 * - Strictly ONE portfolio per employer
 * - Job management (create, publish, close, remove)
 * - Applicant review (Accept/Reject)
 * - Joining date recording & ₹100 demo placement fee (ONLY after both confirm & date recorded)
 * - Mark joined & vacancy reminders
 */

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  CreditCard,
  Edit,
  Trash2,
  Eye,
  XCircle,
  FileText,
  AlertCircle,
  Sparkles,
  Layers,
  Send,
  X,
  Check,
} from 'lucide-react';
import { EmployerProfile, Portfolio, Job, JobApplication, DemoPayment } from '../types';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { DemoQrModal } from '../components/DemoQrModal';

interface EmployerDashboardProps {
  onNavigate: (view: string) => void;
  onOpenAgreement: (role: 'student' | 'employer') => void;
  onOpenSafetyReport: (jobId?: string, jobTitle?: string) => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({
  onNavigate,
  onOpenAgreement,
  onOpenSafetyReport,
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applicants' | 'placements' | 'portfolio' | 'agreement'>('overview');

  // Modal States
  const [showPortfolioFeeModal, setShowPortfolioFeeModal] = useState(false);
  const [showPlacementFeeModal, setShowPlacementFeeModal] = useState(false);
  const [selectedPlacementApp, setSelectedPlacementApp] = useState<JobApplication | null>(null);

  // Portfolio Creation State
  const [showCreatePortfolioForm, setShowCreatePortfolioForm] = useState(false);
  const [portfolioDesc, setPortfolioDesc] = useState('');
  const [portfolioLocation, setPortfolioLocation] = useState('');
  const [portfolioEmail, setPortfolioEmail] = useState('');
  const [portfolioPhone, setPortfolioPhone] = useState('');
  const [portfolioWebsite, setPortfolioWebsite] = useState('');
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  // Job Creation / Edit Modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    category: 'Software & Web Development',
    description: '',
    isTechnical: true,
    requiredSkills: '',
    responsibilities: '',
    salary: 10000,
    salaryBasis: 'monthly',
    workingHours: '15 hours/week',
    expectedDays: 'Monday to Friday',
    workMode: 'online',
    location: '',
    eligibility: 'College students 18+',
    vacancies: 2,
    duration: '3 months',
    joiningRequirements: '',
    importantConditions: '',
  });
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [jobFormError, setJobFormError] = useState<string | null>(null);

  // Record Joining Date Modal
  const [recordDateApp, setRecordDateApp] = useState<JobApplication | null>(null);
  const [joiningDateInput, setJoiningDateInput] = useState('');
  const [joiningInstructionsInput, setJoiningInstructionsInput] = useState('');
  const [isSavingJoiningDate, setIsSavingJoiningDate] = useState(false);

  // Candidate Profile Inspection Modal
  const [viewCandidateApp, setViewCandidateApp] = useState<JobApplication | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const pRes = await apiClient.getEmployerProfile();
      setProfile(pRes.profile);
      setPortfolio(pRes.portfolio || null);

      if (pRes.portfolio) {
        const jRes = await apiClient.getEmployerJobs();
        setJobs(jRes.jobs || []);
      }

      const aRes = await apiClient.getEmployerApplications();
      setApplications(aRes.applications || []);
    } catch (err) {
      console.error('Failed to load employer dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Portfolio Creation
  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingPortfolio(true);
    setPortfolioError(null);

    try {
      const res = await apiClient.createPortfolio({
        businessDescription: portfolioDesc,
        businessLocation: portfolioLocation,
        publicContactEmail: portfolioEmail,
        publicContactPhone: portfolioPhone,
        websiteUrl: portfolioWebsite,
      });
      setPortfolio(res.portfolio);
      setShowCreatePortfolioForm(false);
      await loadData();
    } catch (err: any) {
      setPortfolioError(err.message || 'Failed to create portfolio.');
    } finally {
      setIsCreatingPortfolio(false);
    }
  };

  // Handle Job Publish
  const handlePublishJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingJob(true);
    setJobFormError(null);

    try {
      const payload = {
        ...jobFormData,
        requiredSkills: jobFormData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        responsibilities: jobFormData.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean),
      };

      await apiClient.createJob(payload);
      setShowJobModal(false);
      await loadData();
    } catch (err: any) {
      setJobFormError(err.message || 'Failed to create job.');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  // Handle Application Accept or Reject (Step 5)
  const handleApplicationDecision = async (appId: string, decision: 'accept' | 'reject') => {
    const reason = decision === 'reject' ? prompt('Reason for rejecting candidate (optional):') || '' : '';
    try {
      await apiClient.decideApplication(appId, decision, reason);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update candidate application.');
    }
  };

  // Handle Save Joining Date
  const handleSaveJoiningDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordDateApp || !joiningDateInput) return;

    setIsSavingJoiningDate(true);
    try {
      await apiClient.recordJoiningDate(recordDateApp.id, joiningDateInput, joiningInstructionsInput);
      setRecordDateApp(null);
      setJoiningDateInput('');
      setJoiningInstructionsInput('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record joining date.');
    } finally {
      setIsSavingJoiningDate(false);
    }
  };

  // Handle Mark Joined
  const handleMarkJoined = async (appId: string) => {
    try {
      const res = await apiClient.markStudentJoined(appId);
      if (res.vacancyReminderTriggered) {
        alert(
          'Student marked as Joined! All vacancies for this job are now filled. Please review and close or remove the announcement.'
        );
      } else {
        alert(`Student marked as Joined! Remaining vacancies: ${res.remainingVacancies}`);
      }
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update joined status.');
    }
  };

  // Handle Job Close / Remove
  const handleJobStatusChange = async (jobId: string, status: 'closed' | 'removed') => {
    if (!window.confirm(`Are you sure you want to mark this job as ${status}?`)) return;
    try {
      await apiClient.setJobStatus(jobId, status);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update job status.');
    }
  };

  // SECTION 10: CHECK APPROVAL GATE
  if (profile?.verificationStatus === 'pending') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-8 sm:p-12 shadow-xs">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Application Under Review</h2>
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 my-5 text-xs font-semibold leading-relaxed">
            "Your application is pending Super Admin review. You will be notified once approved."
          </div>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            To ensure student safety, Shiftwise requires all businesses to be verified by our administrative team before any portfolio or job listings can be published.
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500">
            Submitted Business: <strong className="text-slate-800">{profile.businessName}</strong> ({profile.verificationDocType}: {profile.verificationDocNumber})
          </div>
        </div>
      </div>
    );
  }

  if (profile?.verificationStatus === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-red-200 rounded-3xl p-8 sm:p-12 shadow-xs">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Application Not Approved</h2>
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 my-5 text-xs font-semibold">
            Reason: {profile.rejectionReason || 'Documentation could not be validated.'}
          </div>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Please contact Super Admin at therukatisadiya07@gmail.com with updated business credentials to request a re-review.
          </p>
        </div>
      </div>
    );
  }

  // Calculate Vacancy Reminders
  const jobsNeedingClosure = jobs.filter((j) => j.status === 'published' && j.vacancies <= 0);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Top Employer Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 text-purple-200 text-xs font-semibold mb-2 border border-purple-500/40">
            <Building2 className="w-3.5 h-3.5 text-purple-300" />
            <span>Verified Employer Partner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {profile?.businessName || 'Employer Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Owner: {profile?.ownerFullName} • {profile?.businessCategory} • {profile?.workLocation}
          </p>
        </div>

        {portfolio && (
          <button
            onClick={() => {
              setJobFormData({
                title: '',
                category: 'Software & Web Development',
                description: '',
                isTechnical: true,
                requiredSkills: '',
                responsibilities: '',
                salary: 10000,
                salaryBasis: 'monthly',
                workingHours: '15 hours/week',
                expectedDays: 'Monday to Friday',
                workMode: 'online',
                location: portfolio.businessLocation,
                eligibility: 'College students 18+',
                vacancies: 2,
                duration: '3 months',
                joiningRequirements: '',
                importantConditions: '',
              });
              setShowJobModal(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Post Part-Time Job
          </button>
        )}
      </div>

      {/* VACANCY CLOSURE REMINDER BANNER (SECTION 15) */}
      {jobsNeedingClosure.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-sm">
                Vacancy Filled — Please Review Job Announcement ⚠️
              </h3>
              <p className="text-xs text-amber-900 mt-0.5">
                All vacancies for "{jobsNeedingClosure[0].title}" have been filled by joining students. Please close or remove this announcement to prevent extra student applications.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleJobStatusChange(jobsNeedingClosure[0].id, 'closed')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow transition-all shrink-0"
          >
            Close Filled Job Now
          </button>
        </div>
      )}

      {/* UNINITIALIZED PORTFOLIO SECTION (SECTION 11 & 12) */}
      {!portfolio ? (
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Your Business is Approved!</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
            Super Admin has verified your business credentials. To begin posting jobs, complete the one-time ₹100 demonstrational portfolio activation fee.
          </p>

          <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 max-w-md mx-auto my-6 text-xs text-purple-900">
            <strong>Rule:</strong> Each business is entitled to exactly ONE portfolio. All future part-time listings will be managed within this profile.
          </div>

          {!showCreatePortfolioForm ? (
            <button
              onClick={() => setShowPortfolioFeeModal(true)}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold rounded-2xl text-xs shadow-lg transition-all"
            >
              Proceed to ₹100 Portfolio Demo Fee →
            </button>
          ) : (
            <form onSubmit={handleCreatePortfolio} className="max-w-lg mx-auto text-left space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b">Initialize Your Single Business Portfolio</h3>

              {portfolioError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200">{portfolioError}</div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Public Business Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Introduce your company, products, and youth-friendly environment to students..."
                  value={portfolioDesc}
                  onChange={(e) => setPortfolioDesc(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Public Workplace Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HSR Layout, Bengaluru or Koregaon Park, Pune"
                  value={portfolioLocation}
                  onChange={(e) => setPortfolioLocation(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={portfolioEmail}
                    onChange={(e) => setPortfolioEmail(e.target.value)}
                    placeholder="contact@company.in"
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={portfolioPhone}
                    onChange={(e) => setPortfolioPhone(e.target.value)}
                    placeholder="+91 98220 11223"
                    className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingPortfolio}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow"
              >
                {isCreatingPortfolio ? 'Creating Portfolio...' : 'Complete Portfolio Setup'}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* PORTFOLIO ACTIVE - COMPLETE DASHBOARD */
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto text-xs">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'applicants', label: `Applicants (${applications.length})` },
              { key: 'jobs', label: `My Jobs (${jobs.length})` },
              { key: 'placements', label: 'Placements & ₹100 Demo Fees' },
              { key: 'portfolio', label: 'My Portfolio' },
              { key: 'agreement', label: 'Accepted Agreement' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-purple-100/90 text-purple-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Active Jobs
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {jobs.filter((j) => j.status === 'published').length}
                  </span>
                  <span className="text-[10px] text-slate-500">In 1 Portfolio</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Applicants
                  </span>
                  <span className="text-2xl font-black text-purple-700 mt-1 block">
                    {applications.length}
                  </span>
                  <span className="text-[10px] text-slate-500">Student submissions</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Awaiting Student Confirm
                  </span>
                  <span className="text-2xl font-black text-amber-700 mt-1 block">
                    {applications.filter((a) => a.status === 'accepted_awaiting_student_confirmation').length}
                  </span>
                  <span className="text-[10px] text-slate-500">Offers extended</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Joined Candidates
                  </span>
                  <span className="text-2xl font-black text-emerald-700 mt-1 block">
                    {applications.filter((a) => a.status === 'joined').length}
                  </span>
                  <span className="text-[10px] text-slate-500">Placements completed</span>
                </div>
              </div>

              {/* Action Required: Candidates who Confirmed and need Joining Date scheduled */}
              {applications.filter((a) => a.status === 'student_confirmed').length > 0 && (
                <div className="bg-purple-50/70 border border-purple-200 rounded-3xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-700" />
                    <h3 className="font-bold text-purple-950 text-sm">
                      Students Ready for Joining Schedule!
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {applications
                      .filter((a) => a.status === 'student_confirmed')
                      .map((app) => (
                        <div
                          key={app.id}
                          className="bg-white p-4 rounded-2xl border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{app.studentName}</span>
                            <span className="text-slate-500 text-xs block">
                              Accepted offer for "{app.jobTitle}" • {app.studentCollege}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setRecordDateApp(app);
                              setJoiningDateInput('');
                            }}
                            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-xs"
                          >
                            Set Official Joining Date →
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APPLICANTS INBOX (STEP 5 & 6) */}
          {activeTab === 'applicants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Candidate Applications</h3>
                <span className="text-xs text-slate-500">
                  Total submissions: <strong className="text-slate-800">{applications.length}</strong>
                </span>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-16 bg-white border border-[#EFECE6] rounded-3xl p-6">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-900 text-sm">No applications received yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Ensure your job listings are active. As students apply, their profiles will appear here for review.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white border border-[#EFECE6] rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{app.studentName}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                            {app.studentCourse} ({app.studentYear})
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs">
                          Applied for: <strong className="text-purple-800">{app.jobTitle}</strong> • {app.studentCollege}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {app.studentSkills?.slice(0, 4).map((skill, i) => (
                            <span key={i} className="text-[10px] bg-purple-50 text-purple-900 px-2 py-0.5 rounded-md font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Status and Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
                        {app.status === 'submitted' || app.status === 'under_review' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setViewCandidateApp(app)}
                              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs"
                            >
                              Inspect Profile
                            </button>
                            <button
                              onClick={() => handleApplicationDecision(app.id, 'reject')}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-semibold text-xs"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApplicationDecision(app.id, 'accept')}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
                            >
                              Accept Candidate
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-3 py-1 rounded-full font-semibold bg-slate-100 text-slate-700 capitalize">
                              {app.status.replace(/_/g, ' ')}
                            </span>
                            <button
                              onClick={() => setViewCandidateApp(app)}
                              className="px-3 py-1 text-purple-700 hover:underline font-semibold"
                            >
                              Details
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: JOB MANAGEMENT */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Your Job Announcements</h3>
                  <p className="text-xs text-slate-500">Managed exclusively within your 1 portfolio.</p>
                </div>
                <button
                  onClick={() => setShowJobModal(true)}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Post Job
                </button>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-16 bg-white border border-[#EFECE6] rounded-3xl p-6">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-900 text-sm">No job announcements published yet</h4>
                  <button
                    onClick={() => setShowJobModal(true)}
                    className="mt-4 px-5 py-2 bg-purple-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Create First Part-Time Job
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white border border-[#EFECE6] rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                            {job.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            job.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base mt-1">{job.title}</h4>
                        <div className="flex items-center gap-3 text-slate-500 text-xs mt-1">
                          <span className="font-bold text-slate-800">
                            ₹{job.salary.toLocaleString('en-IN')}/{job.salaryBasis}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{job.workMode}</span>
                          <span>•</span>
                          <span>{job.workingHours}</span>
                          <span>•</span>
                          <span className="font-semibold text-purple-800">
                            {job.vacancies} vacancy(ies) left
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {job.status === 'published' && (
                          <button
                            onClick={() => handleJobStatusChange(job.id, 'closed')}
                            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs"
                          >
                            Close Job
                          </button>
                        )}
                        <button
                          onClick={() => handleJobStatusChange(job.id, 'removed')}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          title="Remove vacancy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PLACEMENT MANAGEMENT & ₹100 DEMO FEES (SECTION 14 STEP 7) */}
          {activeTab === 'placements' && (
            <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Placement Management & ₹100 Demo Placement Fees</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Section 14: The ₹100 placement fee unlocks ONLY after mutual confirmation by both parties AND a joining date has been recorded.
                </p>
              </div>

              {/* Confirmed and scheduled placements list */}
              <div className="space-y-4">
                {applications
                  .filter((a) => ['student_confirmed', 'joining_date_recorded', 'joined'].includes(a.status))
                  .map((app) => {
                    const hasJoiningDate = Boolean(app.joiningDate);
                    const isFeeReady = hasJoiningDate;
                    const isFeePaid = Boolean(app.placementFeeRecordId);

                    return (
                      <div
                        key={app.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-[#FAF9F5] text-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{app.studentName}</h4>
                            <p className="text-slate-600">
                              Position: <strong>{app.jobTitle}</strong> • {app.studentCollege}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                            app.status === 'joined' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {app.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Student Offer Confirm</span>
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed by student
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Scheduled Joining Date</span>
                            {app.joiningDate ? (
                              <span className="font-bold text-slate-900">{app.joiningDate}</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setRecordDateApp(app);
                                  setJoiningDateInput('');
                                }}
                                className="text-purple-700 font-bold hover:underline"
                              >
                                Set Joining Date Now →
                              </button>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">3. Placement ₹100 Fee (Demo)</span>
                            {isFeePaid ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Demo Paid
                              </span>
                            ) : isFeeReady ? (
                              <button
                                onClick={() => {
                                  setSelectedPlacementApp(app);
                                  setShowPlacementFeeModal(true);
                                }}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs"
                              >
                                Simulate ₹100 Placement Demo Fee
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Awaiting Joining Date</span>
                            )}
                          </div>
                        </div>

                        {/* Mark Joined Button */}
                        {app.status === 'joining_date_recorded' && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => handleMarkJoined(app.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                            >
                              Mark Candidate as Joined
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 5: MY PORTFOLIO DETAILS */}
          {activeTab === 'portfolio' && portfolio && (
            <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs text-xs text-slate-700 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{portfolio.businessName}</h3>
                  <p className="text-xs text-slate-500">{portfolio.businessCategory}</p>
                </div>
                <span className="text-[11px] bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full">
                  Single Portfolio (Active)
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Company Description</span>
                <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  {portfolio.businessDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Workplace Location</span>
                  <span className="font-semibold text-slate-800">{portfolio.businessLocation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Public Contact</span>
                  <span className="font-semibold text-slate-800">{portfolio.publicContactEmail}</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 text-[11px]">
                <strong>Portfolio Creation Fee:</strong> Recorded via demo reference{' '}
                <span className="font-mono font-bold">{portfolio.demoPaymentRef}</span>.
              </div>
            </div>
          )}

          {/* TAB 6: ACCEPTED AGREEMENT */}
          {activeTab === 'agreement' && profile && (
            <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs text-xs text-slate-700 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-purple-700" />
                <h3 className="text-lg font-bold text-slate-900">Employer Agreement Record</h3>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold">Agreement Version:</span>
                  <span className="font-mono font-bold">{profile.agreementVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Acceptance Timestamp:</span>
                  <span className="font-mono">{new Date(profile.agreementAcceptedAt).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => onOpenAgreement('employer')}
                className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800"
              >
                Inspect Complete Employer Agreement Text →
              </button>
            </div>
          )}
        </div>
      )}

      {/* PORTFOLIO DEMO FEE MODAL (₹100) */}
      <DemoQrModal
        isOpen={showPortfolioFeeModal}
        onClose={() => setShowPortfolioFeeModal(false)}
        title="Portfolio Activation Fee (Demo)"
        subtitle="Simulate the one-time ₹100 business portfolio fee to unlock job publishing."
        amount={100}
        purposeLabel="One-Time Employer Portfolio Activation"
        onSimulateSuccess={async () => {
          await apiClient.simulatePortfolioDemoPayment();
          setShowPortfolioFeeModal(false);
          setShowCreatePortfolioForm(true);
        }}
      />

      {/* PLACEMENT DEMO FEE MODAL (₹100) */}
      {selectedPlacementApp && (
        <DemoQrModal
          isOpen={showPlacementFeeModal}
          onClose={() => {
            setShowPlacementFeeModal(false);
            setSelectedPlacementApp(null);
          }}
          title="Placement Service Fee (Demo)"
          subtitle={`Simulate the ₹100 placement fee for mutually confirmed candidate ${selectedPlacementApp.studentName}.`}
          amount={100}
          purposeLabel={`Placement Fee for ${selectedPlacementApp.studentName}`}
          onSimulateSuccess={async () => {
            await apiClient.simulatePlacementFeeDemo(selectedPlacementApp.id);
            setShowPlacementFeeModal(false);
            setSelectedPlacementApp(null);
            await loadData();
          }}
        />
      )}

      {/* RECORD JOINING DATE MODAL */}
      {recordDateApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF9F5] border border-purple-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-xs">
            <button
              onClick={() => setRecordDateApp(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Schedule Official Joining Date</h3>
            <p className="text-slate-500 mb-4">
              Candidate: <strong>{recordDateApp.studentName}</strong> for "{recordDateApp.jobTitle}"
            </p>

            <form onSubmit={handleSaveJoiningDate} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Joining Date *</label>
                <input
                  type="date"
                  required
                  value={joiningDateInput}
                  onChange={(e) => setJoiningDateInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reporting Instructions or Office Address
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Report at 10 AM with laptop to Sector 5 office or join Google Meet link."
                  value={joiningInstructionsInput}
                  onChange={(e) => setJoiningInstructionsInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRecordDateApp(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingJoiningDate}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs"
                >
                  {isSavingJoiningDate ? 'Saving...' : 'Lock In Joining Date'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE JOB MODAL */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF9F5] border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-xs">
            <button
              onClick={() => setShowJobModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Create Job Announcement</h3>
            <p className="text-slate-500 mb-5">
              Listed under your single verified portfolio: <strong>{portfolio?.businessName}</strong>
            </p>

            {jobFormError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 mb-4">
                {jobFormError}
              </div>
            )}

            <form onSubmit={handlePublishJob} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Python Tutor / Weekend Barista / React Intern"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={jobFormData.category}
                    onChange={(e) => setJobFormData({ ...jobFormData, category: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Software & Web Development">Software & Web Development</option>
                    <option value="Data & AI Operations">Data & AI Operations</option>
                    <option value="Hospitality & Customer Service">Hospitality & Customer Service</option>
                    <option value="Media & Marketing">Media & Marketing</option>
                    <option value="Tutoring & Content">Tutoring & Content</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the student role, learning environment, and tasks..."
                  value={jobFormData.description}
                  onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Compensation (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={jobFormData.salary}
                    onChange={(e) => setJobFormData({ ...jobFormData, salary: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Basis *</label>
                  <select
                    value={jobFormData.salaryBasis}
                    onChange={(e) => setJobFormData({ ...jobFormData, salaryBasis: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vacancies *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={jobFormData.vacancies}
                    onChange={(e) => setJobFormData({ ...jobFormData, vacancies: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Mode *</label>
                  <select
                    value={jobFormData.workMode}
                    onChange={(e) => setJobFormData({ ...jobFormData, workMode: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="online">Online / Remote</option>
                    <option value="offline">Offline (In-Person)</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Working Hours *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 hrs/week"
                    value={jobFormData.workingHours}
                    onChange={(e) => setJobFormData({ ...jobFormData, workingHours: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Technical Domain</label>
                  <select
                    value={jobFormData.isTechnical ? 'true' : 'false'}
                    onChange={(e) => setJobFormData({ ...jobFormData, isTechnical: e.target.value === 'true' })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="true">Technical Role</option>
                    <option value="false">Non-Technical Role</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Skills (comma separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, TypeScript, Communication"
                  value={jobFormData.requiredSkills}
                  onChange={(e) => setJobFormData({ ...jobFormData, requiredSkills: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingJob}
                  className="px-6 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold rounded-xl shadow"
                >
                  {isSubmittingJob ? 'Publishing...' : 'Publish Job Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANDIDATE DETAIL INSPECT MODAL */}
      {viewCandidateApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF9F5] border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-xs">
            <button
              onClick={() => setViewCandidateApp(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Applicant Profile</h3>
            <p className="text-slate-500 mb-4">
              Application for "{viewCandidateApp.jobTitle}"
            </p>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 mb-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate Name</span>
                <span className="font-bold text-slate-900 text-sm">{viewCandidateApp.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">College & Major</span>
                <span className="text-slate-800">
                  {viewCandidateApp.studentCollege} • {viewCandidateApp.studentCourse} ({viewCandidateApp.studentYear})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Skills</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {viewCandidateApp.studentSkills?.map((s, i) => (
                    <span key={i} className="bg-purple-50 text-purple-900 px-2 py-0.5 rounded text-[11px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {viewCandidateApp.studentExperience && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Relevant Experience</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {viewCandidateApp.studentExperience}
                  </p>
                </div>
              )}
              {viewCandidateApp.coverNote && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Cover Note</span>
                  <p className="text-slate-700 italic">"{viewCandidateApp.coverNote}"</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setViewCandidateApp(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-semibold"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
