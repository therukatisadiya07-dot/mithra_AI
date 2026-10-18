/**
 * Shiftwise Authentication & Registration Views
 * Implements strict role separation, input validation, agreement acceptance,
 * and protected Super Admin login.
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  Phone,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  Shield,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import { STUDENT_AGREEMENT_VERSION, EMPLOYER_AGREEMENT_VERSION } from '../data/agreements';

interface AuthViewProps {
  onNavigate: (view: string) => void;
  onOpenAgreement: (role: 'student' | 'employer') => void;
}

// 1. ROLE SELECTION
export const RoleSelectView: React.FC<AuthViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
          Get Started with Shiftwise
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-3">Choose Your Account Type</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select how you intend to use the Shiftwise student part-time marketplace.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Student Card */}
        <div
          onClick={() => onNavigate('register_student')}
          className="bg-white border-2 border-[#EFECE6] hover:border-purple-400 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
              I am a Student
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Find flexible technical & non-technical part-time roles around your class schedules. 100% free for 2 full years. Must be 18+ years old.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
            <span>Register as Student</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Employer Card */}
        <div
          onClick={() => onNavigate('register_employer')}
          className="bg-white border-2 border-[#EFECE6] hover:border-pink-400 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 group-hover:text-pink-700 transition-colors">
              I am an Employer / Owner
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Hire verified college talent for your business. Requires business verification and Super Admin approval before portfolio creation.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-pink-700">
            <span>Register Business</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <div className="text-center mt-8 text-xs text-slate-500">
        Already have an account?{' '}
        <button onClick={() => onNavigate('login')} className="font-bold text-purple-700 hover:underline">
          Log In here
        </button>
      </div>
    </div>
  );
};

// 2. STUDENT REGISTRATION FORM
export const StudentRegisterView: React.FC<AuthViewProps> = ({ onNavigate, onOpenAgreement }) => {
  const { refreshUserData } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    ageConfirmed: false,
    collegeName: '',
    collegeIdNumber: '',
    educationLevel: 'Undergraduate',
    course: 'B.Tech Computer Science',
    yearOfStudy: '2nd Year',
    generalLocation: 'Bengaluru, Karnataka',
    skills: 'React, Content Writing, Communication',
    interests: 'Web Development, Startups',
    preferredJobTypes: 'Frontend Assistant, Social Media',
    preferredWorkMode: 'either',
    availability: '15 hours/week (evenings)',
    relevantExperience: 'Assisted college tech festival and local shop website.',
    achievements: '',
    certifications: '',
    portfolioUrl: '',
    preferredWorkingHours: 'Evenings & Weekends',
    preferredSalaryRange: '₹8,000 - ₹12,000/month',
    agreementAccepted: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ageConfirmed) {
      setError('You must confirm that you are at least 18 years of age.');
      return;
    }
    if (!formData.agreementAccepted) {
      setError('You must read and actively accept the Student Agreement to register.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map((s) => s.trim()).filter(Boolean),
        preferredJobTypes: formData.preferredJobTypes.split(',').map((s) => s.trim()).filter(Boolean),
      };

      await apiClient.registerStudent(payload);
      await refreshUserData();
      onNavigate('student_dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Student Account Registration</h2>
            <p className="text-xs text-purple-700 font-medium">Free for 2 full years • Ages 18+ only</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="aarav@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Indian Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Set Account Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
          </div>

          {/* College Information */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs mb-3">Academic & College Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">College or University Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delhi Technological University"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">College Student ID / Roll No. *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DTU/2024/CS/1042"
                  value={formData.collegeIdNumber}
                  onChange={(e) => setFormData({ ...formData, collegeIdNumber: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Degree Level *</label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="Undergraduate">Undergraduate (UG)</option>
                  <option value="Postgraduate">Postgraduate (PG)</option>
                  <option value="Diploma">Diploma / Vocational</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course / Major *</label>
                <input
                  type="text"
                  required
                  placeholder="B.Tech, BBA, B.Com"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Year of Study *</label>
                <select
                  value={formData.yearOfStudy}
                  onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills & Preferences */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs mb-3">Skills, Preferences & Availability</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Skills (comma separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, Python, Canva, POS Billing"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">General Location (City, State) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru, Karnataka or South Delhi"
                  value={formData.generalLocation}
                  onChange={(e) => setFormData({ ...formData, generalLocation: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Work Mode *</label>
                <select
                  value={formData.preferredWorkMode}
                  onChange={(e) => setFormData({ ...formData, preferredWorkMode: e.target.value as any })}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="either">Either Online or In-Person (Flexible)</option>
                  <option value="online">Online / Remote Only</option>
                  <option value="offline">In-Person / Offline Only</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Weekly Availability *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15 hours/week (evenings & weekends)"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Relevant Experience (Short-term or informal is welcome) *
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. 'I worked at a local cafe for 2 months assisting billing' or 'Built the website for our college robotics society'."
                value={formData.relevantExperience}
                onChange={(e) => setFormData({ ...formData, relevantExperience: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800 resize-none"
              />
            </div>
          </div>

          {/* Age and Agreement Checkboxes */}
          <div className="pt-3 border-t border-slate-100 space-y-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.ageConfirmed}
                onChange={(e) => setFormData({ ...formData, ageConfirmed: e.target.checked })}
                className="mt-0.5 rounded text-purple-700 focus:ring-purple-400"
              />
              <span className="text-[11px] text-slate-700 leading-tight">
                <strong>Age Confirmation:</strong> I confirm that I am at least 18 years of age and currently enrolled in or recently graduated from a recognized educational institution.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.agreementAccepted}
                onChange={(e) => setFormData({ ...formData, agreementAccepted: e.target.checked })}
                className="mt-0.5 rounded text-purple-700 focus:ring-purple-400"
              />
              <span className="text-[11px] text-slate-700 leading-tight">
                I have read and accept the{' '}
                <button
                  type="button"
                  onClick={() => onOpenAgreement('student')}
                  className="text-purple-700 font-bold hover:underline"
                >
                  Shiftwise Student Agreement ({STUDENT_AGREEMENT_VERSION})
                </button>
                , including the 2-year free access period and proposed quarterly maintenance policy.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold rounded-xl text-xs shadow-md transition-all disabled:opacity-50 mt-4"
          >
            {isSubmitting ? 'Creating Student Account...' : 'Complete Registration & Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 3. EMPLOYER REGISTRATION FORM
export const EmployerRegisterView: React.FC<AuthViewProps> = ({ onNavigate, onOpenAgreement }) => {
  const { refreshUserData } = useAuth();
  const [formData, setFormData] = useState({
    ownerFullName: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    businessCategory: 'Technology & Software',
    businessAddress: '',
    workLocation: 'Online / Remote & Bengaluru Office',
    businessDescription: '',
    businessContactEmail: '',
    businessContactPhone: '',
    verificationDocType: 'GSTIN',
    verificationDocNumber: '',
    agreementAccepted: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreementAccepted) {
      setError('You must read and accept the Employer Agreement to proceed.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.registerEmployer(formData);
      await refreshUserData();
      setSubmittedSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-8 shadow-xs">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Application Submitted!</h2>
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 my-4 text-xs font-semibold">
            "Your application is pending Super Admin review."
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our governance team verifies business documentation to ensure platform legitimacy. You will be notified once your business is verified.
          </p>
          <button
            onClick={() => onNavigate('employer_dashboard')}
            className="mt-6 w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Go to Employer Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Employer & Owner Registration</h2>
            <p className="text-xs text-pink-700 font-medium">Business verification required before portfolio creation</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Owner Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Owner / Manager Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram Malhotra"
                value={formData.ownerFullName}
                onChange={(e) => setFormData({ ...formData, ownerFullName: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Account Email *</label>
              <input
                type="email"
                required
                placeholder="hr@company.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Contact Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 98220 11223"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
              />
            </div>
          </div>

          {/* Business Details */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs mb-3">Company & Establishment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business / Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CodeCrafters Technologies LLP"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Category *</label>
                <select
                  value={formData.businessCategory}
                  onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="Technology & Software">Technology & Software</option>
                  <option value="Cafes & Hospitality">Cafes & Hospitality</option>
                  <option value="Retail & Local Commerce">Retail & Local Commerce</option>
                  <option value="Education & Tutoring">Education & Tutoring</option>
                  <option value="Digital Media & Marketing">Digital Media & Marketing</option>
                  <option value="Other Commercial Establishment">Other Commercial Establishment</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block font-semibold text-slate-700 mb-1">Registered Business Address *</label>
              <input
                type="text"
                required
                placeholder="Building, Street, Area, City, State, PIN"
                value={formData.businessAddress}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
              />
            </div>

            <div className="mt-3">
              <label className="block font-semibold text-slate-700 mb-1">Brief Business Description *</label>
              <textarea
                rows={2}
                required
                placeholder="What does your company or establishment do?"
                value={formData.businessDescription}
                onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800 resize-none"
              />
            </div>
          </div>

          {/* Verification Documents */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs mb-3">Verification Credentials for Super Admin</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Identifier Type *</label>
                <select
                  value={formData.verificationDocType}
                  onChange={(e) => setFormData({ ...formData, verificationDocType: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="GSTIN">GSTIN (Goods & Services Tax No.)</option>
                  <option value="PAN">Company PAN Card</option>
                  <option value="Udyam/MSME">Udyam / MSME Certificate No.</option>
                  <option value="Trade License / Shop Act">Municipal Trade License / Shop Act</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  value={formData.verificationDocNumber}
                  onChange={(e) => setFormData({ ...formData, verificationDocNumber: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-3 border-t border-slate-100 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.agreementAccepted}
                onChange={(e) => setFormData({ ...formData, agreementAccepted: e.target.checked })}
                className="mt-0.5 rounded text-pink-700 focus:ring-pink-400"
              />
              <span className="text-[11px] text-slate-700 leading-tight">
                I have read and actively accept the{' '}
                <button
                  type="button"
                  onClick={() => onOpenAgreement('employer')}
                  className="text-pink-700 font-bold hover:underline"
                >
                  Shiftwise Employer Agreement ({EMPLOYER_AGREEMENT_VERSION})
                </button>
                , including the single-portfolio rule, mandatory Super Admin approval, and proposed discontinuation clause for legal review.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-pink-700 to-purple-800 hover:from-pink-800 hover:to-purple-900 text-white font-semibold rounded-xl text-xs shadow-md transition-all disabled:opacity-50 mt-4"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Employer Application for Admin Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 4. GENERAL LOGIN VIEW (Students & Employers)
export const LoginView: React.FC<AuthViewProps> = ({ onNavigate }) => {
  const { login, refreshUserData } = useAuth();
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      await refreshUserData();
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.requestStudentOtp(phone);
      setOtpSentNotice(res.notice);
      setOtp(res.demoCode);
    } catch (err: any) {
      setError(err.message || 'Failed to generate OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.verifyStudentOtp(phone, otp);
      if (res.needsRegistration) {
        onNavigate('register_student');
      } else {
        await refreshUserData();
        onNavigate('student_dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">Log in to your Shiftwise account</p>

          {/* Mode Switcher */}
          <div className="flex bg-[#FAF9F5] p-1 rounded-xl mt-4 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'password' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'otp' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Student Phone OTP
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {authMode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">10-Digit Indian Phone Number</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                  className="px-3 bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold rounded-xl text-[11px] shrink-0"
                >
                  Send OTP
                </button>
              </div>
            </div>

            {otpSentNotice && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-2.5 text-[11px] leading-relaxed">
                {otpSentNotice}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Enter Verification Code</label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-slate-300 rounded-xl p-2.5 text-slate-800 font-mono tracking-widest text-center text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !otp}
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP & Log In'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('register_role')}
            className="font-bold text-purple-700 hover:underline"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. PROTECTED SUPER ADMIN LOGIN (SECTION 18)
export const AdminLoginView: React.FC<AuthViewProps> = ({ onNavigate }) => {
  const { login, refreshUserData } = useAuth();
  const [email, setEmail] = useState('therukatisadiya07@gmail.com');
  const [password, setPassword] = useState('ShiftwiseAdminSecure2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      await refreshUserData();
      onNavigate('admin_dashboard');
    } catch (err: any) {
      setError(err.message || 'Super Admin authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-purple-900/60 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-purple-700/50">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Shiftwise Super Admin Portal</h2>
          <p className="text-xs text-slate-400 mt-1">
            Protected Governance & Platform Moderation Console
          </p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Designated Admin Identifier
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-[11px]"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              Protected by server-side role validation
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Administrative Secret</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs shadow-lg transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Verifying Admin Authorization...' : 'Access Admin Console'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Shiftwise Governance • Mithra_AI v1.0
        </div>
      </div>
    </div>
  );
};
