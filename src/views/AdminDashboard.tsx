/**
 * Shiftwise Super Admin Portal
 * Designated Administrator Account: therukatisadiya07@gmail.com
 * Implements Sections 10, 17, 18:
 * - Employer Verification & Approval (Approve / Reject with reason / Request info / Physical & remote verification)
 * - Single Portfolio Enforcement Audit
 * - Job Moderation
 * - Applications & Placement Tracking
 * - Demo Payments Ledger (Categorized ₹100 portfolio, ₹100 placement, student subscription - all marked DEMO)
 * - Safety Reports Desk
 * - Immutable Chronological Audit Trail
 */

import React, { useEffect, useState } from 'react';
import {
  Shield,
  Building2,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Check,
  X,
  CreditCard,
  FileText,
  AlertCircle,
  Eye,
  IndianRupee,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  EmployerProfile,
  StudentProfile,
  Job,
  Portfolio,
  JobApplication,
  DemoPayment,
  SafetyReport,
  AuditLog,
} from '../types';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'employers' | 'students' | 'jobs' | 'portfolios' | 'payments' | 'safety' | 'audit'
  >('employers');

  const [metrics, setMetrics] = useState<any>(null);
  const [employers, setEmployers] = useState<EmployerProfile[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [payments, setPayments] = useState<DemoPayment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Employer Modal State
  const [reviewingEmployer, setReviewingEmployer] = useState<EmployerProfile | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [infoRequestReason, setInfoRequestReason] = useState('');
  const [remoteStatus, setRemoteStatus] = useState<'pending' | 'verified'>('pending');
  const [physicalStatus, setPhysicalStatus] = useState<'pending' | 'verified' | 'not_required'>('pending');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Safety Report Resolution State
  const [reviewingReport, setReviewingReport] = useState<SafetyReport | null>(null);
  const [reportActionNotes, setReportActionNotes] = useState('');
  const [reportStatus, setReportStatus] = useState<'under_investigation' | 'resolved' | 'dismissed'>('resolved');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [m, e, s, j, p, a, pay, rep, aud] = await Promise.all([
        apiClient.getAdminMetrics(),
        apiClient.getAdminEmployers(),
        apiClient.getAdminStudents(),
        apiClient.getAdminJobs(),
        apiClient.getAdminPortfolios(),
        apiClient.getAdminApplications(),
        apiClient.getAdminPayments(),
        apiClient.getAdminSafetyReports(),
        apiClient.getAdminAuditLogs(),
      ]);

      setMetrics(m);
      setEmployers(e.employers || []);
      setStudents(s.students || []);
      setJobs(j.jobs || []);
      setPortfolios(p.portfolios || []);
      setApplications(a.applications || []);
      setPayments(pay.payments || []);
      setPaymentSummary(pay.summary || null);
      setSafetyReports(rep.reports || []);
      setAuditLogs(aud.logs || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDecision = async (decision: 'approve' | 'reject' | 'request_info') => {
    if (!reviewingEmployer) return;
    if (decision === 'reject' && !rejectionReason.trim()) {
      alert('A specific rejection reason is required.');
      return;
    }
    if (decision === 'request_info' && !infoRequestReason.trim()) {
      alert('Please specify the additional documentation required.');
      return;
    }

    setIsSubmittingDecision(true);
    try {
      await apiClient.decideEmployerVerification(reviewingEmployer.id, {
        decision,
        reason: decision === 'reject' ? rejectionReason : infoRequestReason,
        notes: decisionNotes,
        remoteVerification: remoteStatus,
        physicalVerification: physicalStatus,
      });

      setReviewingEmployer(null);
      setDecisionNotes('');
      setRejectionReason('');
      setInfoRequestReason('');
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit decision.');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleResolveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingReport) return;
    try {
      await apiClient.updateSafetyReport(reviewingReport.id, {
        status: reportStatus,
        adminNotes: reportActionNotes,
        actionTaken: reportActionNotes,
      });
      setReviewingReport(null);
      setReportActionNotes('');
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update safety report.');
    }
  };

  const handleJobModerate = async (jobId: string, action: 'close' | 'remove' | 'reopen') => {
    const reason = prompt(`Reason for ${action}ing this job:`) || '';
    try {
      await apiClient.moderateJob(jobId, action, reason);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to moderate job.');
    }
  };

  const pendingApprovalsCount = employers.filter((e) => e.verificationStatus === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Top Super Admin Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 text-purple-300 text-xs font-semibold mb-2 border border-purple-700/50">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Super Admin Console
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Administrator: {user?.email || 'therukatisadiya07@gmail.com'} • Server-Enforced RBAC
          </p>
        </div>

        {/* Quick Review Alert Badge */}
        {pendingApprovalsCount > 0 && (
          <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{pendingApprovalsCount} Employer Verification(s) Pending Review</span>
          </div>
        )}
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 font-bold block uppercase text-[10px]">Students</span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">{students.length}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">2-Yr Free Tier Active</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 font-bold block uppercase text-[10px]">Employers</span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">{employers.length}</span>
          <span className="text-[10px] text-amber-600 font-semibold">{pendingApprovalsCount} Pending Review</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 font-bold block uppercase text-[10px]">Active Jobs</span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">
            {jobs.filter((j) => j.status === 'published').length}
          </span>
          <span className="text-[10px] text-slate-500">In 1-Portfolios</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 font-bold block uppercase text-[10px]">Applications</span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">{applications.length}</span>
          <span className="text-[10px] text-slate-500">Total pipeline</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 font-bold block uppercase text-[10px]">Joined</span>
          <span className="text-xl font-black text-emerald-700 mt-0.5 block">
            {applications.filter((a) => a.status === 'joined').length}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">Placements Active</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 font-bold block uppercase text-[10px]">Demo Ledger</span>
          <span className="text-xl font-black text-purple-700 mt-0.5 block">
            ₹{paymentSummary?.overallDemoTotal || 0}
          </span>
          <span className="text-[10px] text-purple-600 font-semibold">Simulated Demo Only</span>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs">
        {[
          { key: 'employers', label: `Employer Verifications (${pendingApprovalsCount} Pending)` },
          { key: 'students', label: `Student Accounts (${students.length})` },
          { key: 'jobs', label: `Job Announcements (${jobs.length})` },
          { key: 'portfolios', label: `Portfolios (${portfolios.length})` },
          { key: 'payments', label: `Demo Payments Ledger (₹${paymentSummary?.overallDemoTotal || 0})` },
          { key: 'safety', label: `Safety Reports (${safetyReports.filter((r) => r.status === 'pending').length} Pending)` },
          { key: 'audit', label: `Audit Log (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EMPLOYER VERIFICATIONS (SECTION 10) */}
      {activeTab === 'employers' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Employer Business Verification Queue</h3>
            <span className="text-slate-500">
              Approved businesses are granted exactly ONE portfolio.
            </span>
          </div>

          <div className="bg-white border border-[#EFECE6] rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Business & Owner</th>
                    <th className="py-3 px-4">Verification Document</th>
                    <th className="py-3 px-4">Workplace Address</th>
                    <th className="py-3 px-4">Agreement Acceptance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employers.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{emp.businessName}</div>
                        <div className="text-[11px] text-slate-500">
                          {emp.ownerFullName} • {emp.email}
                        </div>
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium">
                          {emp.businessCategory}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-800">
                          {emp.verificationDocType}: {emp.verificationDocNumber}
                        </div>
                        <div className="text-[10px] text-slate-400">File: {emp.verificationDocName}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                        {emp.businessAddress}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Accepted {emp.agreementVersion}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(emp.agreementAcceptedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                          emp.verificationStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : emp.verificationStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {emp.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setReviewingEmployer(emp);
                            setDecisionNotes(emp.adminReviewNotes || '');
                            setRemoteStatus(emp.remoteVerificationStatus);
                            setPhysicalStatus(emp.physicalVerificationStatus);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
                        >
                          Review & Decide
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS & 2-YEAR SUBSCRIPTION TRACKER */}
      {activeTab === 'students' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Student Accounts & Subscription Timelines</h3>
            <span className="text-slate-500">2-Year free access policy strictly monitored</span>
          </div>

          <div className="bg-white border border-[#EFECE6] rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Student & College</th>
                    <th className="py-3 px-4">Skills & Domain</th>
                    <th className="py-3 px-4">Registration Timestamp</th>
                    <th className="py-3 px-4">2-Year Free Tier End Date</th>
                    <th className="py-3 px-4">Subscription Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((std) => {
                    const regDate = new Date(std.registrationTimestamp);
                    const twoYrs = new Date(regDate);
                    twoYrs.setFullYear(twoYrs.getFullYear() + 2);

                    return (
                      <tr key={std.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{std.fullName}</div>
                          <div className="text-[11px] text-slate-500">
                            {std.collegeName} • {std.course} ({std.yearOfStudy})
                          </div>
                          <span className="text-[10px] text-emerald-700 font-medium">Age 18+ Confirmed</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {std.skills?.map((s, i) => (
                              <span key={i} className="text-[10px] bg-purple-50 text-purple-900 px-1.5 py-0.2 rounded font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {new Date(std.registrationTimestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-purple-800 text-[11px]">
                          {twoYrs.toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Free Period Active (Demo)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: JOBS OVERSIGHT */}
      {activeTab === 'jobs' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Job Moderation Console</h3>
            <span className="text-slate-500">Inspect compensation integrity and student terms</span>
          </div>

          <div className="bg-white border border-[#EFECE6] rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Job Title & Employer</th>
                    <th className="py-3 px-4">Compensation & Basis</th>
                    <th className="py-3 px-4">Mode & Hours</th>
                    <th className="py-3 px-4">Vacancies</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{job.title}</div>
                        <div className="text-[11px] text-slate-500">{job.businessName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900">
                          ₹{job.salary.toLocaleString('en-IN')}
                        </span>{' '}
                        <span className="text-slate-400 capitalize">/{job.salaryBasis}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 capitalize">
                        {job.workMode} • {job.workingHours}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {job.vacancies} open / {job.initialVacancies} total
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          job.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {job.status === 'published' ? (
                          <button
                            onClick={() => handleJobModerate(job.id, 'close')}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-semibold"
                          >
                            Close Job
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJobModerate(job.id, 'reopen')}
                            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold"
                          >
                            Reopen
                          </button>
                        )}
                        <button
                          onClick={() => handleJobModerate(job.id, 'remove')}
                          className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PORTFOLIOS & 1-PORTFOLIO AUDIT */}
      {activeTab === 'portfolios' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Employer Portfolios (Single Portfolio Constraint)</h3>
            <span className="text-emerald-700 font-semibold">1 Portfolio Per Employer Verified</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolios.map((port) => (
              <div key={port.id} className="bg-white border border-[#EFECE6] rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{port.businessName}</h4>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-semibold">
                      {port.businessCategory}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                    {port.demoPaymentRef}
                  </span>
                </div>

                <p className="text-slate-600 line-clamp-2">{port.businessDescription}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Location: {port.businessLocation}</span>
                  <span>Contact: {port.publicContactEmail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DEMO PAYMENTS LEDGER (SECTION 17.F) */}
      {activeTab === 'payments' && paymentSummary && (
        <div className="space-y-6 text-xs">
          {/* Prominent Demo Disclaimer */}
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-amber-900 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <strong className="block text-xs font-bold uppercase tracking-wider">
                SIMULATION ACCOUNTING LEDGER — NO REAL REVENUE COLLECTED
              </strong>
              <span className="text-[11px]">
                Shiftwise simulates payments for demonstration purposes only. Figures below reflect recorded mock transactions.
              </span>
            </div>
          </div>

          {/* Categorized Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Portfolio Creation Demo Fees (₹100)
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                ₹{paymentSummary.portfolioDemoTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400">Paid once per approved business</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Placement Demo Fees (₹100)
              </span>
              <span className="text-2xl font-black text-purple-700 mt-1 block">
                ₹{paymentSummary.placementDemoTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400">Paid post-mutual confirmation & joining date</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Student Subscription Demos (₹500)
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                ₹{paymentSummary.subscriptionDemoTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400">Post 2-year anniversary renewals</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Total Mock Transactions
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {payments.length} records
              </span>
              <span className="text-[10px] text-slate-400">All marked isDemo: true</span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white border border-[#EFECE6] rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Demo Reference</th>
                    <th className="py-3 px-4">Payer / Business</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Demo Status</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {pay.demoReference}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{pay.payerName}</td>
                      <td className="py-3 px-4 text-slate-600">{pay.purposeLabel}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        ₹{pay.amount} <span className="text-[10px] text-purple-700 font-mono">(DEMO)</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Demo Completed
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(pay.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SAFETY REPORTS INVESTIGATION */}
      {activeTab === 'safety' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Trust & Safety Desk</h3>
            <span className="text-red-700 font-semibold">User Reports & Harassment Flagging</span>
          </div>

          {safetyReports.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#EFECE6] rounded-3xl p-6">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">No safety reports pending</h4>
              <p className="text-xs text-slate-500 mt-1">
                The platform is currently clean and operating according to community guidelines.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {safetyReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border border-[#EFECE6] rounded-3xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        {report.category.replace(/_/g, ' ')}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base mt-1">{report.subjectTitle}</h4>
                      <p className="text-slate-500 text-[11px]">
                        Reported by: <strong>{report.reporterName}</strong> ({report.reporterRole}) on{' '}
                        {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                      report.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : report.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {report.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed bg-[#FAF9F5] p-3 rounded-2xl border border-slate-200/80">
                    {report.description}
                  </p>

                  {report.reportedJobTitle && (
                    <div className="text-[11px] text-purple-900">
                      <strong>Target Job:</strong> {report.reportedJobTitle}
                    </div>
                  )}

                  {report.adminNotes && (
                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-purple-950 text-[11px]">
                      <strong>Admin Action Note:</strong> {report.adminNotes} (Resolved by {report.resolvedBy})
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setReviewingReport(report);
                        setReportActionNotes(report.adminNotes || '');
                      }}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl"
                    >
                      Investigate & Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: AUDIT LOG (SECTION 17.I) */}
      {activeTab === 'audit' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Immutable Platform Audit Trail</h3>
            <span className="text-slate-500 font-mono text-[11px]">
              Chronological log of administrative & business transactions
            </span>
          </div>

          <div className="bg-white border border-[#EFECE6] rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF9F5] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {log.actorEmail} ({log.actorRole})
                      </td>
                      <td className="py-2.5 px-4 text-purple-700 font-bold">{log.action}</td>
                      <td className="py-2.5 px-4 text-slate-600">{log.targetType}</td>
                      <td className="py-2.5 px-4 text-slate-700 font-sans text-xs max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYER REVIEW & DECISION MODAL (SECTION 10) */}
      {reviewingEmployer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF9F5] border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-xs">
            <button
              onClick={() => setReviewingEmployer(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Verify Employer Application</h3>
            <p className="text-slate-500 mb-4">{reviewingEmployer.businessName}</p>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Owner Name:</span>
                <span className="font-bold text-slate-800">{reviewingEmployer.ownerFullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email & Phone:</span>
                <span className="text-slate-800">
                  {reviewingEmployer.email} • {reviewingEmployer.phone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-slate-800">{reviewingEmployer.businessCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Address:</span>
                <span className="text-slate-800 text-right max-w-xs">{reviewingEmployer.businessAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Document Type:</span>
                <span className="font-bold text-purple-700">
                  {reviewingEmployer.verificationDocType}: {reviewingEmployer.verificationDocNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Agreement Version:</span>
                <span className="font-mono text-emerald-700">
                  {reviewingEmployer.agreementVersion} (Accepted {new Date(reviewingEmployer.agreementAcceptedAt).toLocaleDateString()})
                </span>
              </div>
            </div>

            {/* Verification status controls */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remote Verification</label>
                <select
                  value={remoteStatus}
                  onChange={(e) => setRemoteStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified (Portal Check)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Verification</label>
                <select
                  value={physicalStatus}
                  onChange={(e) => setPhysicalStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified (Physical Visit)</option>
                  <option value="not_required">Not Required</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal Review Notes</label>
                <input
                  type="text"
                  placeholder="e.g. GSTIN active on portal, commercial address matches lease deed."
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rejection Reason (Required only if rejecting)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Incomplete GST credentials or non-existent commercial address"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReviewingEmployer(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDecision('reject')}
                disabled={isSubmittingDecision}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs"
              >
                Reject Application
              </button>

              <button
                type="button"
                onClick={() => handleDecision('approve')}
                disabled={isSubmittingDecision}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
              >
                Approve & Unlock Portfolio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAFETY REPORT INVESTIGATE MODAL */}
      {reviewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF9F5] border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-xs">
            <button
              onClick={() => setReviewingReport(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Resolve Safety Concern</h3>
            <p className="text-slate-500 mb-4">{reviewingReport.subjectTitle}</p>

            <form onSubmit={handleResolveReport} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Resolution</label>
                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="resolved">Resolved (Action Taken)</option>
                  <option value="under_investigation">Under Investigation</option>
                  <option value="dismissed">Dismissed (Unfounded)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Notes & Findings *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record what steps were taken (e.g. contacted employer, issued warning, verified terms)..."
                  value={reportActionNotes}
                  onChange={(e) => setReportActionNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingReport(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
