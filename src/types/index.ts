/**
 * Shiftwise Data Models and TypeScript Types
 * Project: Mithra_AI
 */

export type UserRole = 'student' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  fullName: string;
  isAgeConfirmed: boolean; // Must be >= 18 years
  passwordHash: string;
  salt: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  ageConfirmed: boolean;
  collegeName: string;
  collegeIdNumber: string;
  educationLevel: string; // e.g., 'Undergraduate', 'Postgraduate', 'Diploma'
  course: string; // e.g., 'B.Tech Computer Science', 'B.Com', 'BBA', 'BA English'
  yearOfStudy: string; // e.g., '1st Year', '2nd Year', '3rd Year', '4th Year'
  generalLocation: string; // e.g., 'Bengaluru, Karnataka', 'South Delhi', 'Pune, Maharashtra'
  skills: string[];
  interests: string[];
  preferredJobTypes: string[]; // e.g., 'Content Writing', 'Web Development', 'Customer Support', 'Graphic Design'
  preferredWorkMode: 'online' | 'offline' | 'either';
  availability: string; // e.g., '15-20 hours/week', 'Evenings & Weekends', 'Weekdays 4pm-8pm'
  relevantExperience: string; // Can be informal or short-term
  achievements?: string;
  certifications?: string;
  portfolioUrl?: string;
  preferredWorkingHours?: string;
  preferredSalaryRange?: string;
  collegeIdDocName?: string;
  agreementAccepted: boolean;
  agreementVersion: string;
  agreementAcceptedAt: string;
  registrationTimestamp: string;
  subscriptionStatus: 'free_period' | 'approaching' | 'due_demo' | 'simulated_active';
  simulatedSubscriptionRenewalDate?: string;
}

export type EmployerVerificationStatus = 'pending' | 'approved' | 'rejected' | 'info_requested' | 'in_progress';

export interface EmployerProfile {
  id: string;
  userId: string;
  ownerFullName: string;
  email: string;
  phone: string;
  businessName: string;
  businessCategory: string; // e.g., 'Technology & Software', 'Retail & Local Commerce', 'Education & Tutoring', 'Cafes & Hospitality', 'Digital Media & Marketing'
  businessAddress: string;
  workLocation: string;
  businessDescription: string;
  businessContactEmail: string;
  businessContactPhone: string;
  verificationStatus: EmployerVerificationStatus;
  remoteVerificationStatus: 'pending' | 'verified';
  physicalVerificationStatus: 'pending' | 'verified' | 'not_required';
  verificationDocType: string; // 'GSTIN' | 'PAN' | 'Udyam/MSME' | 'Trade License' | 'Shop Act'
  verificationDocNumber: string;
  verificationDocName?: string;
  addressProofType?: string;
  adminReviewNotes?: string;
  adminDecisionAt?: string;
  adminReviewedBy?: string;
  rejectionReason?: string;
  infoRequestedReason?: string;
  agreementAccepted: boolean;
  agreementVersion: string;
  agreementAcceptedAt: string;
  portfolioCreated: boolean;
  createdAt: string;
}

export interface Portfolio {
  id: string;
  employerId: string;
  businessName: string;
  businessCategory: string;
  businessDescription: string;
  businessLocation: string;
  publicContactEmail: string;
  publicContactPhone: string;
  websiteUrl?: string;
  status: 'active' | 'suspended';
  creationFeePaidDemo: boolean;
  demoPaymentRef?: string;
  createdAt: string;
  updatedAt: string;
}

export type SalaryBasis = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'fixed';
export type JobWorkMode = 'online' | 'offline' | 'hybrid';
export type JobStatus = 'draft' | 'published' | 'filled' | 'closed' | 'removed';

export interface Job {
  id: string;
  portfolioId: string;
  employerId: string;
  businessName: string;
  businessCategory: string;
  title: string;
  category: string;
  description: string;
  isTechnical: boolean;
  requiredSkills: string[];
  responsibilities: string[];
  salary: number;
  salaryBasis: SalaryBasis;
  workingHours: string; // e.g. '3 hours/day', '15 hours/week'
  expectedDays: string; // e.g. 'Monday to Friday', 'Weekends only'
  workMode: JobWorkMode;
  location: string;
  eligibility: string;
  vacancies: number;
  initialVacancies: number;
  duration?: string; // e.g. '3 months', 'Ongoing part-time'
  deadline?: string;
  joiningRequirements?: string;
  importantConditions?: string;
  status: JobStatus;
  employerVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'accepted_awaiting_student_confirmation'
  | 'rejected'
  | 'student_confirmed'
  | 'student_declined'
  | 'joining_date_recorded'
  | 'joined'
  | 'withdrawn'
  | 'closed';

export interface ApplicationTimelineEvent {
  status: ApplicationStatus;
  timestamp: string;
  note?: string;
  actorRole: 'student' | 'employer' | 'admin' | 'system';
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  portfolioId: string;
  employerId: string;
  employerBusinessName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentCollege: string;
  studentCourse: string;
  studentYear: string;
  studentSkills: string[];
  studentExperience: string;
  coverNote?: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  withdrawReason?: string;
  employerDecisionAt?: string;
  studentDecisionAt?: string;
  joiningDate?: string;
  joiningInstructions?: string;
  joiningStatusMarkedAt?: string;
  placementFeeRecordId?: string;
  timeline: ApplicationTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface PlacementRecord {
  id: string;
  applicationId: string;
  jobId: string;
  employerId: string;
  studentId: string;
  studentName: string;
  jobTitle: string;
  agreedSalary: number;
  salaryBasis: SalaryBasis;
  joiningDate: string;
  status: 'confirmed' | 'joined' | 'cancelled';
  feeStatus: 'pending_demo' | 'demo_completed' | 'exempt';
  demoPaymentRef?: string;
  createdAt: string;
  updatedAt: string;
}

export type DemoPaymentPurpose =
  | 'employer_portfolio_fee'
  | 'employer_placement_fee'
  | 'student_subscription_fee';

export type DemoPaymentStatus = 'demo_initiated' | 'demo_completed' | 'demo_cancelled';

export interface DemoPayment {
  id: string;
  employerId?: string;
  studentId?: string;
  payerName: string;
  purpose: DemoPaymentPurpose;
  purposeLabel: string;
  amount: number;
  currency: 'INR';
  demoStatus: DemoPaymentStatus;
  demoReference: string;
  isDemo: true;
  relatedEntityId?: string; // portfolioId or applicationId or studentId
  paymentPolicyVersion: string;
  notes: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert' | 'vacancy_reminder';
  relatedUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export type SafetyReportCategory =
  | 'suspicious_job'
  | 'misleading_salary'
  | 'employer_impersonation'
  | 'harassment'
  | 'unsafe_conditions'
  | 'non_payment'
  | 'inappropriate_info_request'
  | 'other';

export type SafetyReportStatus = 'pending' | 'under_investigation' | 'resolved' | 'dismissed';

export interface SafetyReport {
  id: string;
  reporterUserId: string;
  reporterRole: UserRole;
  reporterName: string;
  reporterEmail: string;
  category: SafetyReportCategory;
  subjectTitle: string;
  description: string;
  reportedJobId?: string;
  reportedJobTitle?: string;
  reportedEmployerId?: string;
  reportedEmployerName?: string;
  evidenceNotes?: string;
  status: SafetyReportStatus;
  adminNotes?: string;
  actionTaken?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ip?: string;
  timestamp: string;
}

export interface AgreementDocument {
  version: string;
  role: 'student' | 'employer';
  title: string;
  effectiveDate: string;
  summary: string;
  sections: { title: string; content: string }[];
}
