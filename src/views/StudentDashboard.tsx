/**
 * Shiftwise Student Dashboard
 * Complete portal with Profile management, Application Tracker,
 * Offer Confirmations, Joining Schedule, and 2-Year Subscription Timeline.
 */

import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Clock,
  Briefcase,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  DollarSign,
  ChevronRight,
  XCircle,
  HelpCircle,
  Edit3,
  Save,
  X,
  CreditCard,
  MapPin,
  Check,
} from 'lucide-react';
import { JobApplication, StudentProfile, Job } from '../types';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { StudentOfferModal } from '../components/StudentOfferModal';

interface StudentDashboardProps {
  onNavigate: (view: string) => void;
  onOpenSafetyReport: (jobId?: string, jobTitle?: string, employerId?: string, employerName?: string) => void;
  onOpenAgreement: (role: 'student' | 'employer') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onOpenSafetyReport,
  onOpenAgreement,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'profile' | 'subscription' | 'agreements'>('overview');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [recommendations, setRecommendations] = useState<{ job: Job; score: number; matchReason: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected application for offer confirmation modal
  const [offerApp, setOfferApp] = useState<JobApplication | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editSkills, setEditSkills] = useState('');
  const [editAvailability, setEditAvailability] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editAchievements, setEditAchievements] = useState('');
  const [editPortfolio, setEditPortfolio] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Demo Subscription Simulation State
  const [isSimulatingSub, setIsSimulatingSub] = useState(false);
  const [subMsg, setSubMsg] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const pRes = await apiClient.getStudentProfile();
      setProfile(pRes.profile);
      setTimeline(pRes.subscriptionTimeline);

      // Populate edit states
      if (pRes.profile) {
        setEditSkills((pRes.profile.skills || []).join(', '));
        setEditAvailability(pRes.profile.availability || '');
        setEditExperience(pRes.profile.relevantExperience || '');
        setEditAchievements(pRes.profile.achievements || '');
        setEditPortfolio(pRes.profile.portfolioUrl || '');
      }

      const aRes = await apiClient.getStudentApplications();
      setApplications(aRes.applications || []);

      const rRes = await apiClient.getRecommendations();
      setRecommendations(rRes.recommendations || []);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSaving(true);
    setProfileMsg(null);
    try {
      const res = await apiClient.updateStudentProfile({
        skills: editSkills.split(',').map((s) => s.trim()).filter(Boolean),
        availability: editAvailability.trim(),
        relevantExperience: editExperience.trim(),
        achievements: editAchievements.trim(),
        portfolioUrl: editPortfolio.trim(),
      });
      setProfile(res.profile);
      setIsEditingProfile(false);
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleWithdraw = async (appId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await apiClient.withdrawApplication(appId, 'Withdrawn by student from dashboard');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to withdraw application.');
    }
  };

  const handleSimulateSubscription = async () => {
    setIsSimulatingSub(true);
    setSubMsg(null);
    try {
      const res = await apiClient.simulateSubscriptionDemo();
      setSubMsg(`Demo simulation successful! Ref: ${res.paymentRecord.demoReference}`);
      await loadData();
    } catch (err: any) {
      setSubMsg(err.message || 'Simulation failed.');
    } finally {
      setIsSimulatingSub(false);
    }
  };

  const pendingConfirmationApps = applications.filter(
    (a) => a.status === 'accepted_awaiting_student_confirmation'
  );

  const upcomingJoiningApps = applications.filter(
    (a) => ['joining_date_recorded', 'student_confirmed'].includes(a.status) && a.joiningDate
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Student Top Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-800/80 text-purple-200 text-xs font-semibold mb-2 border border-purple-600/50">
              <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
              <span>Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile?.fullName || user?.fullName || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 mt-1">
              {profile?.collegeName} • {profile?.course} ({profile?.yearOfStudy})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('find_jobs')}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-purple-950 font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Browse Jobs
            </button>
            <button
              onClick={() => onOpenSafetyReport()}
              className="px-4 py-2.5 bg-purple-800/80 hover:bg-purple-800 text-white font-medium rounded-xl text-xs border border-purple-500/40"
            >
              Report Concern
            </button>
          </div>
        </div>
      </div>

      {/* PENDING CONFIRMATIONS ALERT BANNER (STEP 6) */}
      {pendingConfirmationApps.length > 0 && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-sm animate-pulse-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Action Required: {pendingConfirmationApps.length} Job Offer(s) Awaiting Your Confirmation!
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {pendingConfirmationApps[0].employerBusinessName} has offered you the role of "{pendingConfirmationApps[0].jobTitle}".
              </p>
            </div>
          </div>

          <button
            onClick={() => setOfferApp(pendingConfirmationApps[0])}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
          >
            Review & Confirm Offer →
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto text-xs">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'applications', label: `My Applications (${applications.length})` },
          { key: 'profile', label: 'My Profile' },
          { key: 'subscription', label: '2-Year Free Subscription' },
          { key: 'agreements', label: 'My Agreement' },
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
        <div className="space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Total Applications
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {applications.length}
              </span>
              <span className="text-[10px] text-slate-500">Free applications</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Offers Received
              </span>
              <span className="text-2xl font-black text-purple-700 mt-1 block">
                {applications.filter((a) => ['accepted_awaiting_student_confirmation', 'student_confirmed', 'joining_date_recorded', 'joined'].includes(a.status)).length}
              </span>
              <span className="text-[10px] text-slate-500">Employer accepted</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Active Placements
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {applications.filter((a) => ['joining_date_recorded', 'joined'].includes(a.status)).length}
              </span>
              <span className="text-[10px] text-slate-500">Confirmed & joined</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EFECE6] shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Free Tier Days Left
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {timeline?.daysRemainingInFreePeriod || 730}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">100% Free Period</span>
            </div>
          </div>

          {/* Upcoming Joining Dates */}
          {upcomingJoiningApps.length > 0 && (
            <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-purple-700" />
                <h3 className="font-bold text-slate-900 text-sm">Upcoming Scheduled Joining Dates</h3>
              </div>
              <div className="space-y-3">
                {upcomingJoiningApps.map((app) => (
                  <div
                    key={app.id}
                    className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{app.jobTitle}</h4>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Employer: <strong className="text-slate-800">{app.employerBusinessName}</strong>
                      </p>
                      {app.joiningInstructions && (
                        <p className="text-purple-900 bg-white/70 p-2 rounded-xl mt-2 text-[11px] border border-purple-100">
                          <strong>Reporting Instructions:</strong> {app.joiningInstructions}
                        </p>
                      )}
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Joining Date</span>
                      <span className="text-sm font-extrabold text-purple-800">
                        {app.joiningDate ? new Date(app.joiningDate).toLocaleDateString() : 'Scheduled'}
                      </span>
                      <span className="inline-block mt-1 text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                        Status: {app.status === 'joined' ? 'Joined' : 'Joining Scheduled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Opportunities Preview */}
          <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <h3 className="font-bold text-slate-900 text-sm">Recommended Jobs for Your Skills</h3>
              </div>
              <button
                onClick={() => onNavigate('find_jobs')}
                className="text-xs text-purple-700 font-semibold hover:underline"
              >
                Browse All Jobs →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.slice(0, 4).map(({ job, matchReason }) => (
                <div
                  key={job.id}
                  onClick={() => onNavigate('find_jobs')}
                  className="bg-[#FAF9F5] hover:bg-white border border-slate-200/80 hover:border-purple-300 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                        {job.category}
                      </span>
                      <h4 className="font-bold text-slate-900 mt-0.5">{job.title}</h4>
                      <p className="text-slate-500 text-[11px]">{job.businessName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900">
                        ₹{job.salary.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-1 capitalize">
                        /{job.salaryBasis}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 text-purple-900 p-2 rounded-xl mt-3 text-[10px] border border-slate-100">
                    💡 {matchReason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS WITH INTERACTIVE STATUS & TIMELINES */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Your Job Applications</h3>
            <button
              onClick={() => onNavigate('find_jobs')}
              className="text-xs font-semibold text-purple-700 hover:underline"
            >
              + Apply to More Jobs
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#EFECE6] rounded-3xl p-6">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">No applications submitted yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explore our catalog of student-friendly part-time jobs and submit your first application for free.
              </p>
              <button
                onClick={() => onNavigate('find_jobs')}
                className="mt-4 px-5 py-2 bg-purple-700 text-white rounded-xl text-xs font-semibold hover:bg-purple-800"
              >
                Find Jobs Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const isAwaitingConfirmation = app.status === 'accepted_awaiting_student_confirmation';
                return (
                  <div
                    key={app.id}
                    className={`bg-white border rounded-3xl p-6 shadow-xs transition-all ${
                      isAwaitingConfirmation ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-[#EFECE6]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                        <h4 className="text-lg font-bold text-slate-900 mt-0.5">{app.jobTitle}</h4>
                        <p className="text-xs text-slate-600">
                          Employer: <strong className="text-slate-800">{app.employerBusinessName}</strong>
                        </p>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {app.status === 'submitted' && (
                          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold">
                            Submitted • Under Review
                          </span>
                        )}
                        {app.status === 'accepted_awaiting_student_confirmation' && (
                          <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold flex items-center gap-1 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Offer Extended — Confirm Now
                          </span>
                        )}
                        {app.status === 'student_confirmed' && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
                            Offer Confirmed by You
                          </span>
                        )}
                        {app.status === 'joining_date_recorded' && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> Joining Date Scheduled
                          </span>
                        )}
                        {app.status === 'joined' && (
                          <span className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Joined Successfully
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                            Application Not Selected
                          </span>
                        )}
                        {app.status === 'withdrawn' && (
                          <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-semibold">
                            Withdrawn
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Offer Confirmation Action Panel */}
                    {isAwaitingConfirmation && (
                      <div className="my-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <strong className="text-emerald-950 block text-sm">
                            Congratulations! The employer accepted your application.
                          </strong>
                          <span className="text-emerald-800 text-[11px]">
                            Review the position and confirm whether you would like to proceed to start date scheduling.
                          </span>
                        </div>
                        <button
                          onClick={() => setOfferApp(app)}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all shrink-0"
                        >
                          Confirm or Decline Offer
                        </button>
                      </div>
                    )}

                    {/* Scheduled Joining Date Info */}
                    {app.joiningDate && (
                      <div className="my-3 bg-purple-50/70 border border-purple-200 rounded-xl p-3 text-xs">
                        <span className="font-bold text-purple-950">Official Reporting Date:</span>{' '}
                        <span className="text-purple-800 font-semibold">{app.joiningDate}</span>
                        {app.joiningInstructions && (
                          <p className="mt-1 text-slate-600 text-[11px]">
                            <strong>Instructions:</strong> {app.joiningInstructions}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Application Timeline Audit */}
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Application Progression Timeline
                      </span>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {app.timeline.map((event, idx) => (
                          <div
                            key={idx}
                            className="bg-[#FAF9F5] border border-slate-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                            <span className="font-semibold text-slate-800 capitalize">
                              {event.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({new Date(event.timestamp).toLocaleDateString()})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom options: Withdraw */}
                    {!['withdrawn', 'joined', 'closed'].includes(app.status) && (
                      <div className="mt-4 pt-2 flex justify-end">
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          className="text-[11px] text-slate-400 hover:text-red-600 font-medium transition-colors"
                        >
                          Withdraw application
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY PROFILE VIEW & EDIT */}
      {activeTab === 'profile' && profile && (
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Student Profile</h3>
              <p className="text-xs text-slate-500">
                Registered on {new Date(profile.registrationTimestamp).toLocaleDateString()}
              </p>
            </div>
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold rounded-xl transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>

          {profileMsg && (
            <div className="bg-purple-50 border border-purple-200 text-purple-900 text-xs rounded-xl p-3 mb-6">
              {profileMsg}
            </div>
          )}

          {!isEditingProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Legal Name</span>
                  <span className="font-bold text-slate-900 text-sm">{profile.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                  <span className="font-semibold text-slate-800">{profile.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                  <span className="font-semibold text-slate-800">{profile.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">General Location</span>
                  <span className="text-slate-800">{profile.generalLocation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Age Confirmation (18+)</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified 18 or above
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">College / Institution</span>
                  <span className="font-bold text-slate-900">{profile.collegeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Course & Year</span>
                  <span className="text-slate-800">
                    {profile.course} • {profile.yearOfStudy} ({profile.educationLevel})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">College ID / Roll No.</span>
                  <span className="font-mono text-slate-700">{profile.collegeIdNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Weekly Availability</span>
                  <span className="text-slate-800">{profile.availability}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Preferred Work Mode</span>
                  <span className="text-slate-800 capitalize">{profile.preferredWorkMode}</span>
                </div>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-slate-100 space-y-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills?.map((skill, i) => (
                      <span key={i} className="bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                    Relevant Work or Project Experience
                  </span>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-slate-700">
                    {profile.relevantExperience || 'None entered'}
                  </p>
                </div>

                {profile.achievements && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                      Achievements & Recognitions
                    </span>
                    <p className="text-slate-700">{profile.achievements}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Weekly Availability</label>
                <input
                  type="text"
                  value={editAvailability}
                  onChange={(e) => setEditAvailability(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relevant Experience</label>
                <textarea
                  rows={3}
                  value={editExperience}
                  onChange={(e) => setEditExperience(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Achievements & Certifications</label>
                <input
                  type="text"
                  value={editAchievements}
                  onChange={(e) => setEditAchievements(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Portfolio or GitHub URL</label>
                <input
                  type="url"
                  value={editPortfolio}
                  onChange={(e) => setEditPortfolio(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl shadow-xs"
                >
                  {editSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 4: 2-YEAR FREE SUBSCRIPTION TIMELINE (SECTION 6) */}
      {activeTab === 'subscription' && (
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Student Subscription Policy & Timeline</h3>
              <p className="text-xs text-purple-700 font-semibold">
                Section 6 Implementation: 2-Year Free Tier Active
              </p>
            </div>
          </div>

          {/* Timeline calculation display */}
          <div className="bg-[#FAF9F5] border border-purple-200/70 rounded-2xl p-5 text-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium">Your Registration Date & Time:</span>
              <span className="font-mono font-bold text-slate-800">
                {profile?.registrationTimestamp
                  ? new Date(profile.registrationTimestamp).toLocaleString()
                  : 'Recent'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium">Initial 2-Year Free Access Ends On:</span>
              <span className="font-mono font-bold text-purple-800">
                {timeline?.twoYearFreeEndsOn
                  ? new Date(timeline.twoYearFreeEndsOn).toLocaleDateString()
                  : '2 Years After Registration'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium">Days Remaining in Free Access:</span>
              <span className="font-extrabold text-emerald-700 text-sm">
                {timeline?.daysRemainingInFreePeriod} days remaining
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-slate-500 font-medium">Proposed Post-2-Year Policy:</span>
              <span className="font-semibold text-slate-800">
                ₹500 every 3 months (Quarterly Maintenance)
              </span>
            </div>
          </div>

          {/* Clear Demonstration Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">DEMO — NO REAL PAYMENT REQUIRED</strong>
              <span>
                Shiftwise does not collect real subscription payments. Your account will never be charged.
                Below you may simulate how a future renewal record would be registered.
              </span>
            </div>
          </div>

          {subMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3">
              {subMsg}
            </div>
          )}

          {/* Simulated Subscription Payment Button */}
          <div className="pt-2">
            <button
              onClick={handleSimulateSubscription}
              disabled={isSimulatingSub}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>
                {isSimulatingSub ? 'Simulating Record...' : 'Simulate Demo Subscription Renewal (₹500 Demo)'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: MY AGREEMENTS */}
      {activeTab === 'agreements' && profile && (
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Your Accepted Agreement</h3>
              <p className="text-xs text-slate-500">
                Accepted Version: <strong className="font-mono text-purple-700">{profile.agreementVersion}</strong>
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold">Agreement Status:</span>
              <span className="font-bold">Actively Accepted</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Timestamp of Acceptance:</span>
              <span className="font-mono">{new Date(profile.agreementAcceptedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Account Identifier:</span>
              <span className="font-mono">{profile.userId}</span>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed pt-2">
            You can review the full text of the student agreement, code of conduct, and legal draft terms at any time:
          </p>

          <button
            onClick={() => onOpenAgreement('student')}
            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Read Complete Student Agreement →
          </button>
        </div>
      )}

      {/* OFFER DECISION MODAL */}
      {offerApp && (
        <StudentOfferModal
          application={offerApp}
          isOpen={Boolean(offerApp)}
          onClose={() => setOfferApp(null)}
          onSuccess={() => {
            setOfferApp(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
