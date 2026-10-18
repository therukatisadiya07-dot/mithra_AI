/**
 * Shiftwise Database & Persistent Storage Layer
 * Manages atomic persistence in data/shiftwise-db.json
 * Seeded with realistic Indian part-time job marketplace data.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  User,
  StudentProfile,
  EmployerProfile,
  Portfolio,
  Job,
  JobApplication,
  PlacementRecord,
  DemoPayment,
  Notification,
  SafetyReport,
  AuditLog,
} from '../types';
import { hashPassword } from './auth';
import { STUDENT_AGREEMENT_VERSION, EMPLOYER_AGREEMENT_VERSION } from '../data/agreements';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'shiftwise-db.json');

export interface DatabaseSchema {
  users: User[];
  studentProfiles: StudentProfile[];
  employerProfiles: EmployerProfile[];
  portfolios: Portfolio[];
  jobs: Job[];
  applications: JobApplication[];
  placements: PlacementRecord[];
  demoPayments: DemoPayment[];
  notifications: Notification[];
  safetyReports: SafetyReport[];
  auditLogs: AuditLog[];
}

let dbInstance: DatabaseSchema | null = null;

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialDatabase(): DatabaseSchema {
  // Passwords hashed using scrypt
  const adminAuth = hashPassword(process.env.SUPER_ADMIN_PASSWORD || 'ShiftwiseAdminSecure2026!');
  const student1Auth = hashPassword('Student123!');
  const student2Auth = hashPassword('Student123!');
  const employer1Auth = hashPassword('Employer123!');
  const employer2Auth = hashPassword('Employer123!');
  const employer3Auth = hashPassword('Employer123!');

  const now = new Date('2026-10-18T09:00:00Z');
  const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const past15Days = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();
  const past5Days = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const past2Days = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

  // Super Admin
  const adminUser: User = {
    id: 'usr_admin_001',
    email: process.env.SUPER_ADMIN_EMAIL || 'therukatisadiya07@gmail.com',
    fullName: 'Therukati Sadiya (Super Admin)',
    role: 'admin',
    isAgeConfirmed: true,
    passwordHash: adminAuth.hash,
    salt: adminAuth.salt,
    status: 'active',
    createdAt: past30Days,
    updatedAt: past30Days,
  };

  // Student 1: Aarav Sharma
  const student1User: User = {
    id: 'usr_std_001',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    fullName: 'Aarav Sharma',
    role: 'student',
    isAgeConfirmed: true,
    passwordHash: student1Auth.hash,
    salt: student1Auth.salt,
    status: 'active',
    createdAt: past15Days,
    updatedAt: past15Days,
  };

  const student1Profile: StudentProfile = {
    id: 'prf_std_001',
    userId: 'usr_std_001',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    ageConfirmed: true,
    collegeName: 'Delhi Technological University (DTU)',
    collegeIdNumber: 'DTU/2024/CS/1042',
    educationLevel: 'Undergraduate',
    course: 'B.Tech Computer Science & Engineering',
    yearOfStudy: '3rd Year',
    generalLocation: 'New Delhi, Delhi NCR',
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS', 'Problem Solving'],
    interests: ['Web Development', 'EdTech Solutions', 'Open Source'],
    preferredJobTypes: ['Frontend Developer', 'Python Tutor', 'Technical Documentation'],
    preferredWorkMode: 'either',
    availability: '15-20 hours/week (evenings & weekends)',
    relevantExperience: 'Built internal portal for college robotics club; worked 2 months assisting local web agency.',
    achievements: 'Hackathon finalist at Smart India Hackathon 2025; Top 5% in Coding Club leaderboard.',
    certifications: 'Meta Front-End Developer Professional Certificate',
    portfolioUrl: 'https://aaravsharma.dev.preview',
    preferredWorkingHours: '3-4 hours per weekday evening',
    preferredSalaryRange: '₹8,000 - ₹15,000 / month',
    collegeIdDocName: 'dtu_id_verified_card.pdf',
    agreementAccepted: true,
    agreementVersion: STUDENT_AGREEMENT_VERSION,
    agreementAcceptedAt: past15Days,
    registrationTimestamp: past15Days,
    subscriptionStatus: 'free_period',
  };

  // Student 2: Priya Nair
  const student2User: User = {
    id: 'usr_std_002',
    email: 'priya.nair@example.com',
    phone: '+91 91234 56789',
    fullName: 'Priya Nair',
    role: 'student',
    isAgeConfirmed: true,
    passwordHash: student2Auth.hash,
    salt: student2Auth.salt,
    status: 'active',
    createdAt: past5Days,
    updatedAt: past5Days,
  };

  const student2Profile: StudentProfile = {
    id: 'prf_std_002',
    userId: 'usr_std_002',
    fullName: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+91 91234 56789',
    ageConfirmed: true,
    collegeName: 'Christ University',
    collegeIdNumber: 'CU/BBA/2024/8891',
    educationLevel: 'Undergraduate',
    course: 'Bachelor of Business Administration (BBA)',
    yearOfStudy: '2nd Year',
    generalLocation: 'Bengaluru, Karnataka',
    skills: ['Content Writing', 'Canva Design', 'Social Media Marketing', 'Customer Communication', 'English & Hindi'],
    interests: ['Brand Storytelling', 'Community Management', 'Hospitality PR'],
    preferredJobTypes: ['Social Media Assistant', 'Content Creator', 'Event Coordinator'],
    preferredWorkMode: 'online',
    availability: '10-15 hours/week flexible',
    relevantExperience: 'Managed Instagram page for college management fest growing reach by 300%.',
    achievements: 'Best Speaker at Inter-College Debate 2025.',
    agreementAccepted: true,
    agreementVersion: STUDENT_AGREEMENT_VERSION,
    agreementAcceptedAt: past5Days,
    registrationTimestamp: past5Days,
    subscriptionStatus: 'free_period',
  };

  // Employer 1 (Approved): Tech Innovators India
  const employer1User: User = {
    id: 'usr_emp_001',
    email: 'hr@codecrafters.in',
    phone: '+91 98220 11223',
    fullName: 'Vikram Malhotra',
    role: 'employer',
    isAgeConfirmed: true,
    passwordHash: employer1Auth.hash,
    salt: employer1Auth.salt,
    status: 'active',
    createdAt: past30Days,
    updatedAt: past30Days,
  };

  const employer1Profile: EmployerProfile = {
    id: 'prf_emp_001',
    userId: 'usr_emp_001',
    ownerFullName: 'Vikram Malhotra',
    email: 'hr@codecrafters.in',
    phone: '+91 98220 11223',
    businessName: 'CodeCrafters Technologies LLP',
    businessCategory: 'Technology & Software',
    businessAddress: 'Sector 5, HSR Layout, Bengaluru, Karnataka 560102',
    workLocation: 'Bengaluru / Remote',
    businessDescription: 'SaaS development studio building productivity tools for micro-enterprises and startups.',
    businessContactEmail: 'contact@codecrafters.in',
    businessContactPhone: '+91 98220 11223',
    verificationStatus: 'approved',
    remoteVerificationStatus: 'verified',
    physicalVerificationStatus: 'verified',
    verificationDocType: 'GSTIN',
    verificationDocNumber: '29ABCDE1234F1Z5',
    verificationDocName: 'gst_certificate_codecrafters.pdf',
    adminReviewNotes: 'Verified against GST Portal and verified local business address in HSR Layout.',
    adminDecisionAt: past25Days(),
    adminReviewedBy: 'usr_admin_001',
    agreementAccepted: true,
    agreementVersion: EMPLOYER_AGREEMENT_VERSION,
    agreementAcceptedAt: past30Days,
    portfolioCreated: true,
    createdAt: past30Days,
  };

  function past25Days() {
    return new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString();
  }

  const portfolio1: Portfolio = {
    id: 'port_001',
    employerId: 'usr_emp_001',
    businessName: 'CodeCrafters Technologies LLP',
    businessCategory: 'Technology & Software',
    businessDescription: 'SaaS development studio building productivity tools for micro-enterprises. Passionate about mentoring student engineers through real-world product sprints.',
    businessLocation: 'Bengaluru, Karnataka (Online / Hybrid)',
    publicContactEmail: 'contact@codecrafters.in',
    publicContactPhone: '+91 98220 11223',
    websiteUrl: 'https://codecrafters.in',
    status: 'active',
    creationFeePaidDemo: true,
    demoPaymentRef: 'DEMO-PORT-100-884192',
    createdAt: past25Days(),
    updatedAt: past25Days(),
  };

  // Employer 2 (Approved): Chai & Conversations Cafe
  const employer2User: User = {
    id: 'usr_emp_002',
    email: 'ananya@chaiconversations.com',
    phone: '+91 94230 44556',
    fullName: 'Ananya Deshmukh',
    role: 'employer',
    isAgeConfirmed: true,
    passwordHash: employer2Auth.hash,
    salt: employer2Auth.salt,
    status: 'active',
    createdAt: past20Days(),
    updatedAt: past20Days(),
  };

  function past20Days() {
    return new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString();
  }

  const employer2Profile: EmployerProfile = {
    id: 'prf_emp_002',
    userId: 'usr_emp_002',
    ownerFullName: 'Ananya Deshmukh',
    email: 'ananya@chaiconversations.com',
    phone: '+91 94230 44556',
    businessName: 'Chai & Conversations Artisanal Cafe',
    businessCategory: 'Cafes & Hospitality',
    businessAddress: 'Lane 7, Koregaon Park, Pune, Maharashtra 411001',
    workLocation: 'Pune, Maharashtra (In-Person)',
    businessDescription: 'Popular literary-themed cafe and youth community hub in Koregaon Park offering artisanal teas and student study spaces.',
    businessContactEmail: 'contact@chaiconversations.com',
    businessContactPhone: '+91 94230 44556',
    verificationStatus: 'approved',
    remoteVerificationStatus: 'verified',
    physicalVerificationStatus: 'verified',
    verificationDocType: 'Trade License / Shop Act',
    verificationDocNumber: 'PMC/SHOP/2023/55412',
    verificationDocName: 'shop_act_license_pune.pdf',
    adminReviewNotes: 'Verified local license and cafe presence.',
    adminDecisionAt: past15Days,
    adminReviewedBy: 'usr_admin_001',
    agreementAccepted: true,
    agreementVersion: EMPLOYER_AGREEMENT_VERSION,
    agreementAcceptedAt: past20Days(),
    portfolioCreated: true,
    createdAt: past20Days(),
  };

  const portfolio2: Portfolio = {
    id: 'port_002',
    employerId: 'usr_emp_002',
    businessName: 'Chai & Conversations Artisanal Cafe',
    businessCategory: 'Cafes & Hospitality',
    businessDescription: 'Artisanal cafe welcoming college students for flexible weekend and evening shifts in customer handling, barista assistance, and community events.',
    businessLocation: 'Koregaon Park, Pune, Maharashtra',
    publicContactEmail: 'contact@chaiconversations.com',
    publicContactPhone: '+91 94230 44556',
    websiteUrl: 'https://chaiconversations.example.com',
    status: 'active',
    creationFeePaidDemo: true,
    demoPaymentRef: 'DEMO-PORT-100-339102',
    createdAt: past15Days,
    updatedAt: past15Days,
  };

  // Employer 3 (PENDING Super Admin approval to demonstrate the review workflow):
  const employer3User: User = {
    id: 'usr_emp_003',
    email: 'rajesh@quicklogistics.in',
    phone: '+91 97654 32190',
    fullName: 'Rajesh Kulkarni',
    role: 'employer',
    isAgeConfirmed: true,
    passwordHash: employer3Auth.hash,
    salt: employer3Auth.salt,
    status: 'pending',
    createdAt: past2Days,
    updatedAt: past2Days,
  };

  const employer3Profile: EmployerProfile = {
    id: 'prf_emp_003',
    userId: 'usr_emp_003',
    ownerFullName: 'Rajesh Kulkarni',
    email: 'rajesh@quicklogistics.in',
    phone: '+91 97654 32190',
    businessName: 'QuickLogistics Fulfillment Services',
    businessCategory: 'Retail & Local Commerce',
    businessAddress: 'Plot 42, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093',
    workLocation: 'Andheri East, Mumbai',
    businessDescription: 'B2B fulfillment and inventory sorting center providing part-time evening data entry and dispatch coordination.',
    businessContactEmail: 'admin@quicklogistics.in',
    businessContactPhone: '+91 97654 32190',
    verificationStatus: 'pending',
    remoteVerificationStatus: 'pending',
    physicalVerificationStatus: 'pending',
    verificationDocType: 'Udyam/MSME Registration',
    verificationDocNumber: 'UDYAM-MH-12-0049219',
    verificationDocName: 'udyam_msme_quicklogistics.pdf',
    agreementAccepted: true,
    agreementVersion: EMPLOYER_AGREEMENT_VERSION,
    agreementAcceptedAt: past2Days,
    portfolioCreated: false,
    createdAt: past2Days,
  };

  // Seed Jobs
  const job1: Job = {
    id: 'job_001',
    portfolioId: 'port_001',
    employerId: 'usr_emp_001',
    businessName: 'CodeCrafters Technologies LLP',
    businessCategory: 'Technology & Software',
    title: 'Junior React & TypeScript Assistant',
    category: 'Software & Web Development',
    description: 'We are seeking a proactive student developer to assist in building reusable UI components and bug fixes for our SaaS dashboard. Flexible schedule that easily accommodates college lectures.',
    isTechnical: true,
    requiredSkills: ['React', 'TypeScript', 'CSS/Tailwind', 'Git Basics'],
    responsibilities: [
      'Implement clean responsive UI screens based on Figma specs',
      'Fix styling issues and perform front-end unit testing',
      'Collaborate with senior mentor engineers on weekly check-ins'
    ],
    salary: 12000,
    salaryBasis: 'monthly',
    workingHours: '15 hours/week (approx 3 hours/day)',
    expectedDays: 'Monday to Friday (Flexible hours)',
    workMode: 'online',
    location: 'Remote / All India',
    eligibility: 'Open to college students 18+ with knowledge of modern React & JavaScript.',
    vacancies: 2,
    initialVacancies: 2,
    duration: '3 to 6 months',
    deadline: '2026-11-15',
    joiningRequirements: 'Laptop with reliable internet connection and GitHub account.',
    importantConditions: 'Weekly progress demo required. Flexible timings around exam weeks provided.',
    status: 'published',
    employerVerified: true,
    createdAt: past15Days,
    updatedAt: past15Days,
  };

  const job2: Job = {
    id: 'job_002',
    portfolioId: 'port_001',
    employerId: 'usr_emp_001',
    businessName: 'CodeCrafters Technologies LLP',
    businessCategory: 'Technology & Software',
    title: 'Python Data Annotation & QA Assistant',
    category: 'Data & AI Operations',
    description: 'Assist our data engineering team with reviewing, tagging, and verifying text datasets and writing basic Python evaluation scripts.',
    isTechnical: true,
    requiredSkills: ['Python', 'Attention to Detail', 'Basic Data Handling'],
    responsibilities: [
      'Annotate and categorize customer intent queries',
      'Run verification scripts in Python to flag format discrepancies',
      'Document quality feedback for machine learning datasets'
    ],
    salary: 300,
    salaryBasis: 'hourly',
    workingHours: '10-12 hours/week',
    expectedDays: 'Flexible 2-3 hours on selected days',
    workMode: 'online',
    location: 'Remote / All India',
    eligibility: 'Students with basic Python fundamentals.',
    vacancies: 3,
    initialVacancies: 3,
    duration: 'Ongoing Part-Time',
    status: 'published',
    employerVerified: true,
    createdAt: past10Days(),
    updatedAt: past10Days(),
  };

  function past10Days() {
    return new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
  }

  const job3: Job = {
    id: 'job_003',
    portfolioId: 'port_002',
    employerId: 'usr_emp_002',
    businessName: 'Chai & Conversations Artisanal Cafe',
    businessCategory: 'Cafes & Hospitality',
    title: 'Weekend Evening Cafe Barista & Guest Coordinator',
    category: 'Hospitality & Customer Service',
    description: 'Energetic students wanted for weekend evening shifts (Friday to Sunday 5:00 PM - 9:30 PM). Warm work environment, free cafe beverages, and hourly student wage.',
    isTechnical: false,
    requiredSkills: ['Customer Service', 'Polite Communication', 'Basic Billing / POS', 'Punctuality'],
    responsibilities: [
      'Greet guests and assist with artisanal tea order selection',
      'Manage digital UPI billing register accurately',
      'Coordinate seating and maintain clean, welcoming study ambiance',
      'Assist during weekend acoustic music & book club sessions'
    ],
    salary: 200,
    salaryBasis: 'hourly',
    workingHours: '12-14 hours/weekend (Friday - Sunday)',
    expectedDays: 'Friday, Saturday & Sunday Evenings',
    workMode: 'offline',
    location: 'Koregaon Park, Pune, Maharashtra',
    eligibility: 'Must be 18+ and residing within commuting distance in Pune.',
    vacancies: 2,
    initialVacancies: 3,
    duration: '4 months (renewable)',
    joiningRequirements: 'Comfortable interacting with guests; food safety hygiene adherence.',
    status: 'published',
    employerVerified: true,
    createdAt: past10Days(),
    updatedAt: past10Days(),
  };

  const job4: Job = {
    id: 'job_004',
    portfolioId: 'port_002',
    employerId: 'usr_emp_002',
    businessName: 'Chai & Conversations Artisanal Cafe',
    businessCategory: 'Cafes & Hospitality',
    title: 'Social Media & Event Reels Creator',
    category: 'Media & Marketing',
    description: 'Create engaging short video reels (Instagram/YouTube Shorts) highlighting cafe drinks, student study corners, and community poetry evenings.',
    isTechnical: false,
    requiredSkills: ['Reel Creation', 'Canva / CapCut', 'Storytelling', 'Photography'],
    responsibilities: [
      'Capture 4-5 high-quality aesthetic video snippets weekly',
      'Edit snappy reels with trending audio and subtitles',
      'Engage with student followers in comments'
    ],
    salary: 7500,
    salaryBasis: 'monthly',
    workingHours: '8-10 hours/week',
    expectedDays: 'Flexible (hybrid visit to cafe twice a week)',
    workMode: 'hybrid',
    location: 'Pune, Maharashtra',
    eligibility: 'Creative students with active social media taste and personal portfolio/sample reels.',
    vacancies: 1,
    initialVacancies: 1,
    status: 'published',
    employerVerified: true,
    createdAt: past5Days,
    updatedAt: past5Days,
  };

  // Applications demonstrating the full workflow
  // Application 1: Priya Nair applied to Social Media & Reels Creator -> Status: accepted_awaiting_student_confirmation!
  const app1: JobApplication = {
    id: 'app_001',
    jobId: 'job_004',
    jobTitle: 'Social Media & Event Reels Creator',
    portfolioId: 'port_002',
    employerId: 'usr_emp_002',
    employerBusinessName: 'Chai & Conversations Artisanal Cafe',
    studentId: 'usr_std_002',
    studentName: 'Priya Nair',
    studentEmail: 'priya.nair@example.com',
    studentPhone: '+91 91234 56789',
    studentCollege: 'Christ University',
    studentCourse: 'Bachelor of Business Administration (BBA)',
    studentYear: '2nd Year',
    studentSkills: ['Content Writing', 'Canva Design', 'Social Media Marketing', 'Customer Communication'],
    studentExperience: 'Managed Instagram page for college management fest growing reach by 300%.',
    coverNote: 'I love your literary cafe ambiance and have curated aesthetic reels for youth events with over 50k views. I can shoot twice a week at Koregaon Park!',
    status: 'accepted_awaiting_student_confirmation',
    employerDecisionAt: past2Days,
    timeline: [
      {
        status: 'submitted',
        timestamp: past5Days,
        note: 'Application submitted by Priya Nair.',
        actorRole: 'student',
      },
      {
        status: 'under_review',
        timestamp: past3Days(),
        note: 'Application reviewed by Ananya Deshmukh.',
        actorRole: 'employer',
      },
      {
        status: 'accepted_awaiting_student_confirmation',
        timestamp: past2Days,
        note: 'Employer accepted application and extended offer! Awaiting student confirmation.',
        actorRole: 'employer',
      },
    ],
    createdAt: past5Days,
    updatedAt: past2Days,
  };

  function past3Days() {
    return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  }

  // Application 2: Aarav Sharma applied to React & TypeScript Assistant -> Status: submitted
  const app2: JobApplication = {
    id: 'app_002',
    jobId: 'job_001',
    jobTitle: 'Junior React & TypeScript Assistant',
    portfolioId: 'port_001',
    employerId: 'usr_emp_001',
    employerBusinessName: 'CodeCrafters Technologies LLP',
    studentId: 'usr_std_001',
    studentName: 'Aarav Sharma',
    studentEmail: 'aarav.sharma@example.com',
    studentPhone: '+91 98765 43210',
    studentCollege: 'Delhi Technological University (DTU)',
    studentCourse: 'B.Tech Computer Science & Engineering',
    studentYear: '3rd Year',
    studentSkills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
    studentExperience: 'Built internal portal for college robotics club; worked 2 months assisting local web agency.',
    coverNote: 'Proficient with modern React 19, TypeScript interfaces, and Tailwind CSS. Excited to contribute 15 hours/week during evenings.',
    status: 'submitted',
    timeline: [
      {
        status: 'submitted',
        timestamp: past2Days,
        note: 'Application submitted by Aarav Sharma.',
        actorRole: 'student',
      },
    ],
    createdAt: past2Days,
    updatedAt: past2Days,
  };

  // Demo Payments
  const demoPay1: DemoPayment = {
    id: 'dpay_001',
    employerId: 'usr_emp_001',
    payerName: 'Vikram Malhotra (CodeCrafters Technologies)',
    purpose: 'employer_portfolio_fee',
    purposeLabel: 'One-Time Employer Portfolio Activation Demo Fee',
    amount: 100,
    currency: 'INR',
    demoStatus: 'demo_completed',
    demoReference: 'DEMO-PORT-100-884192',
    isDemo: true,
    relatedEntityId: 'port_001',
    paymentPolicyVersion: 'v1.0-DEMO',
    notes: 'Simulated demonstration portfolio creation fee. No real money deducted.',
    createdAt: past25Days(),
  };

  const demoPay2: DemoPayment = {
    id: 'dpay_002',
    employerId: 'usr_emp_002',
    payerName: 'Ananya Deshmukh (Chai & Conversations)',
    purpose: 'employer_portfolio_fee',
    purposeLabel: 'One-Time Employer Portfolio Activation Demo Fee',
    amount: 100,
    currency: 'INR',
    demoStatus: 'demo_completed',
    demoReference: 'DEMO-PORT-100-339102',
    isDemo: true,
    relatedEntityId: 'port_002',
    paymentPolicyVersion: 'v1.0-DEMO',
    notes: 'Simulated demonstration portfolio creation fee. No real money deducted.',
    createdAt: past15Days,
  };

  // Notifications
  const notif1: Notification = {
    id: 'notif_001',
    recipientUserId: 'usr_std_002',
    title: 'Job Offer Received! 🌟',
    message: 'Chai & Conversations Artisanal Cafe accepted your application for "Social Media & Event Reels Creator". Please confirm or decline the offer.',
    type: 'success',
    isRead: false,
    createdAt: past2Days,
  };

  const notif2: Notification = {
    id: 'notif_002',
    recipientUserId: 'usr_emp_001',
    title: 'New Student Application',
    message: 'Aarav Sharma applied for "Junior React & TypeScript Assistant".',
    type: 'info',
    isRead: true,
    createdAt: past2Days,
  };

  // Safety Report sample for admin review
  const report1: SafetyReport = {
    id: 'rep_001',
    reporterUserId: 'usr_std_001',
    reporterRole: 'student',
    reporterName: 'Aarav Sharma',
    reporterEmail: 'aarav.sharma@example.com',
    category: 'misleading_salary',
    subjectTitle: 'Discrepancy in posted work hours',
    description: 'Saw an external posting claiming to be affiliated with Shiftwise requiring 40+ hours without minimum student rate. Submitting preemptive report.',
    status: 'resolved',
    adminNotes: 'Confirmed external scam entity. IP flagged and security advisory published.',
    actionTaken: 'Flagged on external watchlist and verified no active listings exist on Shiftwise.',
    resolvedAt: past5Days,
    resolvedBy: 'usr_admin_001',
    createdAt: past10Days(),
    updatedAt: past5Days,
  };

  // Audit Logs
  const auditLogs: AuditLog[] = [
    {
      id: 'aud_001',
      actorId: 'usr_admin_001',
      actorEmail: 'therukatisadiya07@gmail.com',
      actorRole: 'admin',
      action: 'APPROVE_EMPLOYER',
      targetType: 'EmployerProfile',
      targetId: 'prf_emp_001',
      details: 'Approved CodeCrafters Technologies LLP following GSTIN verification.',
      timestamp: past25Days(),
    },
    {
      id: 'aud_002',
      actorId: 'usr_emp_001',
      actorEmail: 'hr@codecrafters.in',
      actorRole: 'employer',
      action: 'CREATE_PORTFOLIO_DEMO_PAID',
      targetType: 'Portfolio',
      targetId: 'port_001',
      details: 'Completed simulated ₹100 portfolio fee (Ref: DEMO-PORT-100-884192) and initialized portfolio.',
      timestamp: past25Days(),
    },
    {
      id: 'aud_003',
      actorId: 'usr_admin_001',
      actorEmail: 'therukatisadiya07@gmail.com',
      actorRole: 'admin',
      action: 'APPROVE_EMPLOYER',
      targetType: 'EmployerProfile',
      targetId: 'prf_emp_002',
      details: 'Approved Chai & Conversations Artisanal Cafe following Pune Shop Act verification.',
      timestamp: past15Days,
    },
    {
      id: 'aud_004',
      actorId: 'usr_emp_002',
      actorEmail: 'ananya@chaiconversations.com',
      actorRole: 'employer',
      action: 'ACCEPT_APPLICATION',
      targetType: 'JobApplication',
      targetId: 'app_001',
      details: 'Extended offer to Priya Nair for Social Media Reels Creator. Status set to accepted_awaiting_student_confirmation.',
      timestamp: past2Days,
    },
  ];

  return {
    users: [adminUser, student1User, student2User, employer1User, employer2User, employer3User],
    studentProfiles: [student1Profile, student2Profile],
    employerProfiles: [employer1Profile, employer2Profile, employer3Profile],
    portfolios: [portfolio1, portfolio2],
    jobs: [job1, job2, job3, job4],
    applications: [app1, app2],
    placements: [],
    demoPayments: [demoPay1, demoPay2],
    notifications: [notif1, notif2],
    safetyReports: [report1],
    auditLogs: auditLogs,
  };
}

export function loadDatabase(): DatabaseSchema {
  if (dbInstance) return dbInstance;
  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbInstance = JSON.parse(raw);
      // Ensure admin email is up to date with config
      const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'therukatisadiya07@gmail.com';
      const existingAdmin = dbInstance?.users.find((u) => u.role === 'admin');
      if (existingAdmin && existingAdmin.email !== adminEmail) {
        existingAdmin.email = adminEmail;
        saveDatabase();
      }
      return dbInstance as DatabaseSchema;
    } catch (err) {
      console.error('Failed to parse existing DB file, reinitializing default:', err);
    }
  }

  dbInstance = getInitialDatabase();
  saveDatabase();
  return dbInstance;
}

export function saveDatabase(): void {
  if (!dbInstance) return;
  ensureDataDir();
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(dbInstance, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

export function logAuditEvent(
  actor: { id: string; email: string; role: string },
  action: string,
  targetType: string,
  targetId: string,
  details: string,
  ip?: string
): void {
  const db = loadDatabase();
  const log: AuditLog = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action,
    targetType,
    targetId,
    details,
    ip,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(log);
  // Keep audit log bounded to latest 500 records
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase();
}

export function createNotification(
  recipientUserId: string,
  title: string,
  message: string,
  type: Notification['type'],
  relatedUrl?: string
): void {
  const db = loadDatabase();
  const notif: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    recipientUserId,
    title,
    message,
    type,
    relatedUrl,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.unshift(notif);
  saveDatabase();
}
