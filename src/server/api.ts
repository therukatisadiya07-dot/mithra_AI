/**
 * Shiftwise REST API Router
 * Project: Mithra_AI
 * Full-stack Express router with role-based authorization,
 * input validation, single-portfolio constraint, demo payment rules,
 * mutual-confirmation workflows, and audit logging.
 */

import express, { Request, Response, NextFunction } from 'express';
import {
  loadDatabase,
  saveDatabase,
  logAuditEvent,
  createNotification,
} from './db';
import { hashPassword, verifyPassword, generateToken, verifyToken } from './auth';
import {
  User,
  StudentProfile,
  EmployerProfile,
  Portfolio,
  Job,
  JobApplication,
  PlacementRecord,
  DemoPayment,
  SafetyReport,
} from '../types';
import { STUDENT_AGREEMENT, EMPLOYER_AGREEMENT, STUDENT_AGREEMENT_VERSION, EMPLOYER_AGREEMENT_VERSION } from '../data/agreements';

export const apiRouter = express.Router();

// Middleware: Authenticate Request via Bearer Token
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
  req.user = payload;
  next();
}

export function requireRole(role: string | string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const allowed = Array.isArray(role) ? role.includes(req.user.role) : req.user.role === role;
    if (!allowed) {
      return res.status(403).json({
        error: `Access denied. This action requires ${Array.isArray(role) ? role.join(' or ') : role} privileges.`,
      });
    }
    next();
  };
}

/* ==========================================================================
   AUTHENTICATION ENDPOINTS
   ========================================================================== */

// Student Registration
apiRouter.post('/auth/register-student', (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      ageConfirmed,
      collegeName,
      collegeIdNumber,
      educationLevel,
      course,
      yearOfStudy,
      generalLocation,
      skills,
      interests,
      preferredJobTypes,
      preferredWorkMode,
      availability,
      relevantExperience,
      achievements,
      certifications,
      portfolioUrl,
      preferredWorkingHours,
      preferredSalaryRange,
      agreementAccepted,
    } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ error: 'Full name, email, phone, and password are required.' });
    }

    if (!ageConfirmed) {
      return res.status(400).json({ error: 'You must confirm that you are at least 18 years of age.' });
    }

    if (!agreementAccepted) {
      return res.status(400).json({ error: 'You must read and accept the Student Agreement to continue.' });
    }

    const db = loadDatabase();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    const { hash, salt } = hashPassword(password);
    const userId = `usr_std_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newUser: User = {
      id: userId,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      fullName: fullName.trim(),
      role: 'student',
      isAgeConfirmed: true,
      passwordHash: hash,
      salt: salt,
      status: 'active',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const newProfile: StudentProfile = {
      id: `prf_std_${Date.now()}`,
      userId,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      ageConfirmed: true,
      collegeName: collegeName?.trim() || 'Not specified',
      collegeIdNumber: collegeIdNumber?.trim() || 'N/A',
      educationLevel: educationLevel?.trim() || 'Undergraduate',
      course: course?.trim() || 'General Studies',
      yearOfStudy: yearOfStudy?.trim() || '1st Year',
      generalLocation: generalLocation?.trim() || 'India',
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : [],
      preferredJobTypes: Array.isArray(preferredJobTypes) ? preferredJobTypes : [],
      preferredWorkMode: preferredWorkMode || 'either',
      availability: availability?.trim() || 'Flexible part-time',
      relevantExperience: relevantExperience?.trim() || 'None entered yet',
      achievements: achievements?.trim() || '',
      certifications: certifications?.trim() || '',
      portfolioUrl: portfolioUrl?.trim() || '',
      preferredWorkingHours: preferredWorkingHours?.trim() || '',
      preferredSalaryRange: preferredSalaryRange?.trim() || '',
      agreementAccepted: true,
      agreementVersion: STUDENT_AGREEMENT_VERSION,
      agreementAcceptedAt: nowIso,
      registrationTimestamp: nowIso,
      subscriptionStatus: 'free_period',
    };

    db.users.push(newUser);
    db.studentProfiles.push(newProfile);
    saveDatabase();

    logAuditEvent(
      { id: userId, email: newUser.email, role: 'student' },
      'REGISTER_STUDENT',
      'User',
      userId,
      `Student registered with 2-year free subscription activated until ${new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toDateString()}.`
    );

    createNotification(
      userId,
      'Welcome to Shiftwise! 🎓',
      'Your student profile is active. Enjoy 2 years of free browsing and applications across India.',
      'success'
    );

    const token = generateToken({ userId, role: 'student', email: newUser.email });
    return res.status(201).json({
      message: 'Student account created successfully!',
      token,
      user: {
        id: userId,
        email: newUser.email,
        fullName: newUser.fullName,
        role: 'student',
      },
      profile: newProfile,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to complete student registration.' });
  }
});

// Employer Registration
apiRouter.post('/auth/register-employer', (req: Request, res: Response) => {
  try {
    const {
      ownerFullName,
      email,
      phone,
      password,
      businessName,
      businessCategory,
      businessAddress,
      workLocation,
      businessDescription,
      businessContactEmail,
      businessContactPhone,
      verificationDocType,
      verificationDocNumber,
      verificationDocName,
      agreementAccepted,
    } = req.body;

    if (!ownerFullName || !email || !password || !phone || !businessName) {
      return res.status(400).json({
        error: 'Owner name, email, phone, password, and business name are required.',
      });
    }

    if (!agreementAccepted) {
      return res.status(400).json({
        error: 'You must read and accept the Employer Agreement & Terms to proceed.',
      });
    }

    const db = loadDatabase();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    const { hash, salt } = hashPassword(password);
    const userId = `usr_emp_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newUser: User = {
      id: userId,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      fullName: ownerFullName.trim(),
      role: 'employer',
      isAgeConfirmed: true,
      passwordHash: hash,
      salt: salt,
      status: 'pending', // Pending Super Admin verification
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const newProfile: EmployerProfile = {
      id: `prf_emp_${Date.now()}`,
      userId,
      ownerFullName: ownerFullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      businessName: businessName.trim(),
      businessCategory: businessCategory?.trim() || 'General Business',
      businessAddress: businessAddress?.trim() || 'India',
      workLocation: workLocation?.trim() || 'Online / Hybrid',
      businessDescription: businessDescription?.trim() || '',
      businessContactEmail: businessContactEmail?.trim() || email.trim(),
      businessContactPhone: businessContactPhone?.trim() || phone.trim(),
      verificationStatus: 'pending',
      remoteVerificationStatus: 'pending',
      physicalVerificationStatus: 'pending',
      verificationDocType: verificationDocType?.trim() || 'GSTIN / PAN / Trade License',
      verificationDocNumber: verificationDocNumber?.trim() || 'SUBMITTED_ONLINE',
      verificationDocName: verificationDocName || 'business_verification_doc.pdf',
      agreementAccepted: true,
      agreementVersion: EMPLOYER_AGREEMENT_VERSION,
      agreementAcceptedAt: nowIso,
      portfolioCreated: false,
      createdAt: nowIso,
    };

    db.users.push(newUser);
    db.employerProfiles.push(newProfile);
    saveDatabase();

    logAuditEvent(
      { id: userId, email: newUser.email, role: 'employer' },
      'REGISTER_EMPLOYER',
      'EmployerProfile',
      newProfile.id,
      `Submitted employer application for ${newProfile.businessName}. Awaiting Super Admin review.`
    );

    // Notify Super Admin
    const adminUser = db.users.find((u) => u.role === 'admin');
    if (adminUser) {
      createNotification(
        adminUser.id,
        'New Employer Pending Approval 🏢',
        `${businessName} (${ownerFullName}) submitted verification documents for review.`,
        'info',
        '/admin/employers'
      );
    }

    createNotification(
      userId,
      'Registration Submitted for Review 📋',
      'Your employer profile was received and is currently under Super Admin review. You will be notified once approved.',
      'info'
    );

    const token = generateToken({ userId, role: 'employer', email: newUser.email });
    return res.status(201).json({
      message: 'Employer registered successfully. Your application is pending Super Admin review.',
      token,
      user: {
        id: userId,
        email: newUser.email,
        fullName: newUser.fullName,
        role: 'employer',
        status: 'pending',
      },
      profile: newProfile,
    });
  } catch (err) {
    console.error('Employer registration error:', err);
    return res.status(500).json({ error: 'Failed to complete employer registration.' });
  }
});

// Login (All Roles)
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = loadDatabase();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Please verify your credentials.' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password. Please verify your credentials.' });
    }

    const token = generateToken({ userId: user.id, role: user.role, email: user.email });

    // Fetch related profile
    let profile = null;
    if (user.role === 'student') {
      profile = db.studentProfiles.find((p) => p.userId === user.id);
    } else if (user.role === 'employer') {
      profile = db.employerProfiles.find((p) => p.userId === user.id);
    }

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
      profile,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login service encountered an unexpected error.' });
  }
});

// Student OTP Simulation (Explicit Demonstration)
apiRouter.post('/auth/student-otp-simulate', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian phone number.' });
  }
  // Clear demonstrational response with static code for easy testing
  return res.json({
    success: true,
    phone,
    demoCode: '123456',
    isDemonstration: true,
    notice: 'DEMO MODE: External SMS gateway is not yet configured. Use demo OTP "123456" to proceed.',
  });
});

// Student OTP Verify & Login / Quick Sign-In
apiRouter.post('/auth/student-otp-verify', (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (otp !== '123456') {
    return res.status(400).json({ error: 'Invalid OTP code. Please enter demo code 123456.' });
  }

  const db = loadDatabase();
  let user = db.users.find((u) => u.phone === phone && u.role === 'student');

  if (!user) {
    // Return flag to complete profile if not registered
    return res.json({
      verified: true,
      needsRegistration: true,
      phone,
    });
  }

  const token = generateToken({ userId: user.id, role: 'student', email: user.email });
  const profile = db.studentProfiles.find((p) => p.userId === user.id);

  return res.json({
    verified: true,
    needsRegistration: false,
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: 'student',
    },
    profile,
  });
});

// Current User Details
apiRouter.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const user = db.users.find((u) => u.id === req.user?.userId);
  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  let profile: any = null;
  let portfolio: any = null;

  if (user.role === 'student') {
    profile = db.studentProfiles.find((p) => p.userId === user.id);
  } else if (user.role === 'employer') {
    profile = db.employerProfiles.find((p) => p.userId === user.id);
    portfolio = db.portfolios.find((p) => p.employerId === user.id);
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    },
    profile,
    portfolio,
  });
});

/* ==========================================================================
   PUBLIC & DISCOVERY JOB ENDPOINTS
   ========================================================================== */

// Browse Active Jobs
apiRouter.get('/jobs', (req: Request, res: Response) => {
  const db = loadDatabase();
  let jobs = db.jobs.filter((j) => j.status === 'published');

  const { search, technical, mode, category, minSalary, maxSalary, sort } = req.query;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.businessName.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.requiredSkills.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (technical === 'true') {
    jobs = jobs.filter((j) => j.isTechnical);
  } else if (technical === 'false') {
    jobs = jobs.filter((j) => !j.isTechnical);
  }

  if (mode && typeof mode === 'string' && mode !== 'all') {
    jobs = jobs.filter((j) => j.workMode === mode);
  }

  if (category && typeof category === 'string' && category !== 'all') {
    jobs = jobs.filter((j) => j.category.toLowerCase() === category.toLowerCase());
  }

  if (minSalary && !isNaN(Number(minSalary))) {
    jobs = jobs.filter((j) => j.salary >= Number(minSalary));
  }

  if (maxSalary && !isNaN(Number(maxSalary))) {
    jobs = jobs.filter((j) => j.salary <= Number(maxSalary));
  }

  if (sort === 'salary_high') {
    jobs.sort((a, b) => b.salary - a.salary);
  } else if (sort === 'salary_low') {
    jobs.sort((a, b) => a.salary - b.salary);
  } else {
    // Default newest first
    jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return res.json({ jobs, total: jobs.length });
});

// Single Job Details
apiRouter.get('/jobs/:id', (req: Request, res: Response) => {
  const db = loadDatabase();
  const job = db.jobs.find((j) => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job announcement not found or no longer available.' });
  }
  const portfolio = db.portfolios.find((p) => p.id === job.portfolioId);
  return res.json({ job, portfolio });
});

// Rule-Based Smart Job Recommendations for Student
apiRouter.get('/jobs/recommendations/match', requireAuth, requireRole('student'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const profile = db.studentProfiles.find((p) => p.userId === req.user?.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Student profile not found.' });
  }

  const publishedJobs = db.jobs.filter((j) => j.status === 'published');
  const studentSkills = (profile.skills || []).map((s) => s.toLowerCase());

  const scored = publishedJobs.map((job) => {
    let score = 0;
    const reasons: string[] = [];

    // Match skills
    const matchingSkills = job.requiredSkills.filter((reqSkill) =>
      studentSkills.some((stdSkill) => stdSkill.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(stdSkill))
    );
    if (matchingSkills.length > 0) {
      score += matchingSkills.length * 30;
      reasons.push(`Matches your skills in ${matchingSkills.join(', ')}`);
    }

    // Match work mode preference
    if (profile.preferredWorkMode === 'either' || profile.preferredWorkMode === job.workMode) {
      score += 20;
      reasons.push(`Matches your preferred ${job.workMode} work mode`);
    }

    // Match location if offline
    if (job.workMode === 'offline' && profile.generalLocation) {
      const city = profile.generalLocation.split(',')[0].trim().toLowerCase();
      if (job.location.toLowerCase().includes(city)) {
        score += 25;
        reasons.push(`Located near your city (${job.location})`);
      }
    }

    // Match category in preferred job types
    if (profile.preferredJobTypes.some((pjt) => job.category.toLowerCase().includes(pjt.toLowerCase()) || job.title.toLowerCase().includes(pjt.toLowerCase()))) {
      score += 15;
      reasons.push('Aligns with your specified job interests');
    }

    return {
      job,
      score,
      matchReason: reasons.length > 0 ? reasons.join(' • ') : 'Relevant part-time student opportunity',
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return res.json({ recommendations: scored.slice(0, 6) });
});

/* ==========================================================================
   STUDENT DASHBOARD & APPLICATION WORKFLOW
   ========================================================================== */

// Student Profile & 2-Year Subscription Timeline Calculation
apiRouter.get('/student/profile', requireAuth, requireRole('student'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const profile = db.studentProfiles.find((p) => p.userId === req.user?.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Student profile not found.' });
  }

  // Calculate 2-year subscription timeline carefully
  const regDate = new Date(profile.registrationTimestamp);
  const twoYearsAfter = new Date(regDate);
  twoYearsAfter.setFullYear(twoYearsAfter.getFullYear() + 2);

  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((twoYearsAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  let timelineStatus = 'free_period';
  if (now >= twoYearsAfter) {
    timelineStatus = 'due_demo';
  } else if (daysRemaining <= 60) {
    timelineStatus = 'approaching';
  }

  return res.json({
    profile,
    subscriptionTimeline: {
      registrationDate: profile.registrationTimestamp,
      twoYearFreeEndsOn: twoYearsAfter.toISOString(),
      daysRemainingInFreePeriod: daysRemaining,
      proposedQuarterlyFee: 500,
      currency: 'INR',
      timelineStatus,
      isDemonstrationMode: true,
      demoNotice: 'DEMO — NO REAL PAYMENT REQUIRED: You will not be charged on this prototype.',
    },
  });
});

// Update Student Profile
apiRouter.put('/student/profile', requireAuth, requireRole('student'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const profile = db.studentProfiles.find((p) => p.userId === req.user?.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  const {
    fullName,
    phone,
    collegeName,
    educationLevel,
    course,
    yearOfStudy,
    generalLocation,
    skills,
    interests,
    preferredJobTypes,
    preferredWorkMode,
    availability,
    relevantExperience,
    achievements,
    certifications,
    portfolioUrl,
    preferredWorkingHours,
    preferredSalaryRange,
  } = req.body;

  if (fullName) profile.fullName = fullName.trim();
  if (phone) profile.phone = phone.trim();
  if (collegeName) profile.collegeName = collegeName.trim();
  if (educationLevel) profile.educationLevel = educationLevel;
  if (course) profile.course = course;
  if (yearOfStudy) profile.yearOfStudy = yearOfStudy;
  if (generalLocation) profile.generalLocation = generalLocation.trim();
  if (Array.isArray(skills)) profile.skills = skills;
  if (Array.isArray(interests)) profile.interests = interests;
  if (Array.isArray(preferredJobTypes)) profile.preferredJobTypes = preferredJobTypes;
  if (preferredWorkMode) profile.preferredWorkMode = preferredWorkMode;
  if (availability) profile.availability = availability;
  if (relevantExperience) profile.relevantExperience = relevantExperience;
  if (achievements !== undefined) profile.achievements = achievements;
  if (certifications !== undefined) profile.certifications = certifications;
  if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl;
  if (preferredWorkingHours !== undefined) profile.preferredWorkingHours = preferredWorkingHours;
  if (preferredSalaryRange !== undefined) profile.preferredSalaryRange = preferredSalaryRange;

  saveDatabase();
  return res.json({ message: 'Profile updated successfully.', profile });
});

// Student Applications List
apiRouter.get('/student/applications', requireAuth, requireRole('student'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const applications = db.applications.filter((a) => a.studentId === req.user?.userId);
  applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ applications });
});

// Student Submits Job Application
apiRouter.post('/student/apply', requireAuth, requireRole('student'), (req: AuthRequest, res: Response) => {
  try {
    const { jobId, coverNote } = req.body;
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required.' });
    }

    const db = loadDatabase();
    const job = db.jobs.find((j) => j.id === jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    if (job.status !== 'published') {
      return res.status(400).json({ error: 'This job is no longer accepting applications.' });
    }

    if (job.vacancies <= 0) {
      return res.status(400).json({ error: 'All vacancies for this job have been filled.' });
    }

    // Check for duplicate active application
    const existingActive = db.applications.find(
      (a) =>
        a.jobId === jobId &&
        a.studentId === req.user?.userId &&
        !['withdrawn', 'closed', 'rejected', 'student_declined'].includes(a.status)
    );
    if (existingActive) {
      return res.status(400).json({
        error: 'You already have an active application for this opportunity.',
      });
    }

    const studentProfile = db.studentProfiles.find((p) => p.userId === req.user?.userId);
    if (!studentProfile) {
      return res.status(400).json({ error: 'Please complete your student profile before applying.' });
    }

    const appId = `app_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const application: JobApplication = {
      id: appId,
      jobId: job.id,
      jobTitle: job.title,
      portfolioId: job.portfolioId,
      employerId: job.employerId,
      employerBusinessName: job.businessName,
      studentId: req.user!.userId,
      studentName: studentProfile.fullName,
      studentEmail: studentProfile.email,
      studentPhone: studentProfile.phone,
      studentCollege: studentProfile.collegeName,
      studentCourse: studentProfile.course,
      studentYear: studentProfile.yearOfStudy,
      studentSkills: studentProfile.skills,
      studentExperience: studentProfile.relevantExperience,
      coverNote: coverNote?.trim() || '',
      status: 'submitted',
      timeline: [
        {
          status: 'submitted',
          timestamp: nowIso,
          note: 'Application submitted by student.',
          actorRole: 'student',
        },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    db.applications.push(application);
    saveDatabase();

    logAuditEvent(
      { id: req.user!.userId, email: req.user!.email, role: 'student' },
      'APPLY_JOB',
      'JobApplication',
      appId,
      `Applied for ${job.title} at ${job.businessName}.`
    );

    // Notify Employer
    createNotification(
      job.employerId,
      'New Student Application 📩',
      `${studentProfile.fullName} applied for "${job.title}". Review their profile in your dashboard.`,
      'info',
      '/employer/applications'
    );

    return res.status(201).json({
      message: 'Application submitted successfully! The employer will review your profile.',
      application,
    });
  } catch (err) {
    console.error('Apply job error:', err);
    return res.status(500).json({ error: 'Failed to submit application.' });
  }
});

// Student Confirms Offer (STEP 6 IN WORKFLOW)
apiRouter.post('/student/applications/:id/confirm', requireAuth, requireRole('student'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const app = db.applications.find((a) => a.id === req.params.id && a.studentId === req.user?.userId);
  if (!app) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  if (app.status !== 'accepted_awaiting_student_confirmation') {
    return res.status(400).json({
      error: 'This offer is not in a state awaiting your confirmation.',
    });
  }

  const nowIso = new Date().toISOString();
  app.status = 'student_confirmed';
  app.studentDecisionAt = nowIso;
  app.updatedAt = nowIso;
  app.timeline.push({
    status: 'student_confirmed',
    timestamp: nowIso,
    note: 'Student officially confirmed and accepted the job offer!',
    actorRole: 'student',
  });

  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: 'student' },
    'CONFIRM_OFFER',
    'JobApplication',
    app.id,
    `Student confirmed offer for ${app.jobTitle} with ${app.employerBusinessName}.`
  );

  // Notify employer to record joining date
  createNotification(
    app.employerId,
    'Offer Confirmed by Student! 🎉',
    `${app.studentName} has accepted your job offer for "${app.jobTitle}". Please record their official joining date now.`,
    'success',
    '/employer/applications'
  );

  return res.json({
    message: 'Congratulations! You have confirmed the job offer. The employer will provide joining details.',
    application: app,
  });
});

// Student Declines Offer
apiRouter.post('/student/applications/:id/decline', requireAuth, requireRole('student'), (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  const db = loadDatabase();
  const app = db.applications.find((a) => a.id === req.params.id && a.studentId === req.user?.userId);
  if (!app) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  if (app.status !== 'accepted_awaiting_student_confirmation') {
    return res.status(400).json({ error: 'Offer is not awaiting confirmation.' });
  }

  const nowIso = new Date().toISOString();
  app.status = 'student_declined';
  app.studentDecisionAt = nowIso;
  app.updatedAt = nowIso;
  app.timeline.push({
    status: 'student_declined',
    timestamp: nowIso,
    note: reason ? `Student declined offer: ${reason}` : 'Student declined offer.',
    actorRole: 'student',
  });

  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: 'student' },
    'DECLINE_OFFER',
    'JobApplication',
    app.id,
    `Student declined offer for ${app.jobTitle}.`
  );

  // Notify employer
  createNotification(
    app.employerId,
    'Offer Declined by Candidate',
    `${app.studentName} politely declined the offer for "${app.jobTitle}". You can continue reviewing other candidates.`,
    'warning'
  );

  return res.json({ message: 'You have declined this job offer.', application: app });
});

// Student Withdraws Application
apiRouter.post('/student/applications/:id/withdraw', requireAuth, requireRole('student'), (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  const db = loadDatabase();
  const app = db.applications.find((a) => a.id === req.params.id && a.studentId === req.user?.userId);
  if (!app) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  if (['joined', 'closed', 'withdrawn'].includes(app.status)) {
    return res.status(400).json({ error: 'This application cannot be withdrawn in its current state.' });
  }

  const nowIso = new Date().toISOString();
  app.status = 'withdrawn';
  app.withdrawReason = reason || 'Withdrawn by student';
  app.updatedAt = nowIso;
  app.timeline.push({
    status: 'withdrawn',
    timestamp: nowIso,
    note: `Application withdrawn: ${app.withdrawReason}`,
    actorRole: 'student',
  });

  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: 'student' },
    'WITHDRAW_APPLICATION',
    'JobApplication',
    app.id,
    `Student withdrew application for ${app.jobTitle}.`
  );

  return res.json({ message: 'Application withdrawn successfully.', application: app });
});

// Student Simulates Demonstration Subscription Payment
apiRouter.post('/student/simulate-subscription-demo', requireAuth, requireRole('student'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const profile = db.studentProfiles.find((p) => p.userId === req.user?.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  const nowIso = new Date().toISOString();
  const demoRef = `DEMO-SUB-500-${Math.floor(100000 + Math.random() * 900000)}`;

  const paymentRecord: DemoPayment = {
    id: `dpay_sub_${Date.now()}`,
    studentId: req.user!.userId,
    payerName: profile.fullName,
    purpose: 'student_subscription_fee',
    purposeLabel: 'Quarterly Student Platform Maintenance Demo Subscription',
    amount: 500,
    currency: 'INR',
    demoStatus: 'demo_completed',
    demoReference: demoRef,
    isDemo: true,
    relatedEntityId: profile.id,
    paymentPolicyVersion: 'v1.0-DEMO',
    notes: 'Simulated demo subscription record. No real banking payment occurred.',
    createdAt: nowIso,
  };

  profile.subscriptionStatus = 'simulated_active';
  const renewal = new Date();
  renewal.setMonth(renewal.getMonth() + 3);
  profile.simulatedSubscriptionRenewalDate = renewal.toISOString();

  db.demoPayments.push(paymentRecord);
  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: 'student' },
    'SIMULATE_STUDENT_SUBSCRIPTION_DEMO',
    'DemoPayment',
    paymentRecord.id,
    `Recorded simulated ₹500 student subscription demo payment (Ref: ${demoRef}).`
  );

  return res.json({
    message: 'Demo subscription recorded successfully! (Simulated - no real money transferred)',
    paymentRecord,
  });
});

/* ==========================================================================
   EMPLOYER DASHBOARD, PORTFOLIO & VACANCIES
   ========================================================================== */

// Employer Profile & Verification Status
apiRouter.get('/employer/profile', requireAuth, requireRole('employer'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const profile = db.employerProfiles.find((p) => p.userId === req.user?.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Employer profile not found.' });
  }
  const portfolio = db.portfolios.find((p) => p.employerId === req.user?.userId);
  return res.json({ profile, portfolio });
});

// SECTION 12: ₹100 PORTFOLIO CREATION DEMO PAYMENT
apiRouter.post('/employer/create-portfolio-demo-payment', requireAuth, requireRole('employer'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const profile = db.employerProfiles.find((p) => p.userId === req.user?.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Employer profile not found.' });
  }

  // Employer must be approved first!
  if (profile.verificationStatus !== 'approved') {
    return res.status(403).json({
      error: 'Your business application is still pending Super Admin review. You can only proceed once approved.',
    });
  }

  // Check if portfolio already exists
  const existingPortfolio = db.portfolios.find((p) => p.employerId === req.user?.userId);
  if (existingPortfolio) {
    return res.status(400).json({
      error: 'You already have a portfolio. Manage your job offers from your existing portfolio.',
    });
  }

  // Check if a demo payment record already exists
  const existingPay = db.demoPayments.find(
    (dp) => dp.employerId === req.user?.userId && dp.purpose === 'employer_portfolio_fee'
  );
  if (existingPay) {
    return res.json({
      message: 'Demo payment already recorded.',
      demoPayment: existingPay,
    });
  }

  const nowIso = new Date().toISOString();
  const demoRef = `DEMO-PORT-100-${Math.floor(100000 + Math.random() * 900000)}`;

  const paymentRecord: DemoPayment = {
    id: `dpay_port_${Date.now()}`,
    employerId: req.user!.userId,
    payerName: `${profile.ownerFullName} (${profile.businessName})`,
    purpose: 'employer_portfolio_fee',
    purposeLabel: 'One-Time Portfolio Activation Demo Fee',
    amount: 100,
    currency: 'INR',
    demoStatus: 'demo_completed',
    demoReference: demoRef,
    isDemo: true,
    paymentPolicyVersion: 'v1.0-DEMO',
    notes: 'Simulated demonstration portfolio creation fee. No real money deducted.',
    createdAt: nowIso,
  };

  db.demoPayments.push(paymentRecord);
  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: 'employer' },
    'SIMULATE_PORTFOLIO_FEE_DEMO',
    'DemoPayment',
    paymentRecord.id,
    `Completed simulated ₹100 portfolio fee (Ref: ${demoRef}). Portfolio creation unlocked.`
  );

  return res.json({
    message: 'Demo payment simulated successfully! Portfolio creation is now unlocked.',
    demoPayment: paymentRecord,
  });
});

// SECTION 11: CREATE EMPLOYER PORTFOLIO (ENFORCE EXACTLY ONE PORTFOLIO)
apiRouter.post('/employer/portfolio', requireAuth, requireRole('employer'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const profile = db.employerProfiles.find((p) => p.userId === req.user?.userId);
  if (!profile) {
    return res.status(404).json({ error: 'Employer profile not found.' });
  }

  // 1. MUST BE APPROVED
  if (profile.verificationStatus !== 'approved') {
    return res.status(403).json({
      error: 'Account not yet approved by Super Admin. Portfolio creation is prohibited until approved.',
    });
  }

  // 2. MUST HAVE COMPLETED ₹100 DEMO PAYMENT
  const demoPay = db.demoPayments.find(
    (dp) => dp.employerId === req.user?.userId && dp.purpose === 'employer_portfolio_fee'
  );
  if (!demoPay) {
    return res.status(402).json({
      error: 'Please complete the one-time ₹100 demonstrational portfolio fee before creating your portfolio.',
    });
  }

  // 3. STRICT ONE-PORTFOLIO RULE ENFORCEMENT
  const existingPortfolio = db.portfolios.find((p) => p.employerId === req.user?.userId);
  if (existingPortfolio) {
    return res.status(409).json({
      error: 'You already have a portfolio. Manage your job offers from your existing portfolio.',
    });
  }

  const { businessDescription, businessLocation, publicContactEmail, publicContactPhone, websiteUrl } = req.body;

  const nowIso = new Date().toISOString();
  const portfolioId = `port_${Date.now()}`;

  const newPortfolio: Portfolio = {
    id: portfolioId,
    employerId: req.user!.userId,
    businessName: profile.businessName,
    businessCategory: profile.businessCategory,
    businessDescription: businessDescription?.trim() || profile.businessDescription,
    businessLocation: businessLocation?.trim() || profile.workLocation,
    publicContactEmail: publicContactEmail?.trim() || profile.businessContactEmail,
    publicContactPhone: publicContactPhone?.trim() || profile.businessContactPhone,
    websiteUrl: websiteUrl?.trim() || '',
    status: 'active',
    creationFeePaidDemo: true,
    demoPaymentRef: demoPay.demoReference,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  profile.portfolioCreated = true;
  db.portfolios.push(newPortfolio);
  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: 'employer' },
    'CREATE_PORTFOLIO',
    'Portfolio',
    portfolioId,
    `Created official business portfolio for ${profile.businessName}.`
  );

  createNotification(
    req.user!.userId,
    'Portfolio Live! 🚀',
    'Your employer portfolio has been created. You can now publish student job announcements.',
    'success'
  );

  return res.status(201).json({
    message: 'Portfolio initialized successfully! You can now publish job offers.',
    portfolio: newPortfolio,
  });
});

// Update Portfolio
apiRouter.put('/employer/portfolio', requireAuth, requireRole('employer'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const portfolio = db.portfolios.find((p) => p.employerId === req.user?.userId);
  if (!portfolio) {
    return res.status(404).json({ error: 'Portfolio not found.' });
  }

  const { businessDescription, businessLocation, publicContactEmail, publicContactPhone, websiteUrl } = req.body;
  if (businessDescription) portfolio.businessDescription = businessDescription.trim();
  if (businessLocation) portfolio.businessLocation = businessLocation.trim();
  if (publicContactEmail) portfolio.publicContactEmail = publicContactEmail.trim();
  if (publicContactPhone) portfolio.publicContactPhone = publicContactPhone.trim();
  if (websiteUrl !== undefined) portfolio.websiteUrl = websiteUrl.trim();
  portfolio.updatedAt = new Date().toISOString();

  saveDatabase();
  return res.json({ message: 'Portfolio details updated.', portfolio });
});

// Employer Jobs
apiRouter.get('/employer/jobs', requireAuth, requireRole('employer'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const jobs = db.jobs.filter((j) => j.employerId === req.user?.userId);
  jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ jobs });
});

// Create Job (inside single portfolio)
apiRouter.post('/employer/jobs', requireAuth, requireRole('employer'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const portfolio = db.portfolios.find((p) => p.employerId === req.user?.userId);
  if (!portfolio) {
    return res.status(403).json({ error: 'You must create your business portfolio before publishing jobs.' });
  }

  const {
    title,
    category,
    description,
    isTechnical,
    requiredSkills,
    responsibilities,
    salary,
    salaryBasis,
    workingHours,
    expectedDays,
    workMode,
    location,
    eligibility,
    vacancies,
    duration,
    deadline,
    joiningRequirements,
    importantConditions,
  } = req.body;

  if (!title || !description || !salary || !salaryBasis || !workingHours) {
    return res.status(400).json({
      error: 'Title, description, salary, salary basis, and working hours are required fields.',
    });
  }

  const numVacancies = Math.max(1, Number(vacancies) || 1);
  const jobId = `job_${Date.now()}`;
  const nowIso = new Date().toISOString();

  const newJob: Job = {
    id: jobId,
    portfolioId: portfolio.id,
    employerId: req.user!.userId,
    businessName: portfolio.businessName,
    businessCategory: portfolio.businessCategory,
    title: title.trim(),
    category: category?.trim() || 'General Part-Time',
    description: description.trim(),
    isTechnical: Boolean(isTechnical),
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
    salary: Number(salary),
    salaryBasis: salaryBasis,
    workingHours: workingHours.trim(),
    expectedDays: expectedDays?.trim() || 'Flexible',
    workMode: workMode || 'online',
    location: location?.trim() || portfolio.businessLocation,
    eligibility: eligibility?.trim() || 'Students 18+',
    vacancies: numVacancies,
    initialVacancies: numVacancies,
    duration: duration?.trim() || 'Ongoing part-time',
    deadline: deadline || undefined,
    joiningRequirements: joiningRequirements?.trim() || '',
    importantConditions: importantConditions?.trim() || '',
    status: 'published',
    employerVerified: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  db.jobs.push(newJob);
  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: 'employer' },
    'CREATE_JOB',
    'Job',
    jobId,
    `Published job announcement "${newJob.title}" with ${numVacancies} vacancies.`
  );

  return res.status(201).json({ message: 'Job announcement published successfully!', job: newJob });
});

// Update Job
apiRouter.put('/employer/jobs/:id', requireAuth, requireRole('employer'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const job = db.jobs.find((j) => j.id === req.params.id && j.employerId === req.user?.userId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  const fields = req.body;
  Object.assign(job, fields, { updatedAt: new Date().toISOString() });
  saveDatabase();

  return res.json({ message: 'Job updated successfully.', job });
});

// Close or Remove Job
apiRouter.post('/employer/jobs/:id/status', requireAuth, requireRole('employer'), (req: AuthRequest, res: Response) => {
  const { status } = req.body; // 'closed' or 'removed'
  if (!['closed', 'removed', 'published'].includes(status)) {
    return res.status(400).json({ error: 'Invalid job status.' });
  }

  const db = loadDatabase();
  const job = db.jobs.find((j) => j.id === req.params.id && j.employerId === req.user?.userId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  job.status = status;
  job.updatedAt = new Date().toISOString();
  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: 'employer' },
    'CHANGE_JOB_STATUS',
    'Job',
    job.id,
    `Changed job status to ${status}.`
  );

  return res.json({ message: `Job is now marked as ${status}.`, job });
});

// Employer Applications List
apiRouter.get('/employer/applications', requireAuth, requireRole('employer'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const applications = db.applications.filter((a) => a.employerId === req.user?.userId);
  applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ applications });
});

// STEP 5: Employer Accepts or Rejects Candidate
apiRouter.post('/employer/applications/:id/decision', requireAuth, requireRole('employer'), (req: AuthRequest, res: Response) => {
  const { decision, reason } = req.body; // 'accept' or 'reject'
  if (!['accept', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'Decision must be "accept" or "reject".' });
  }

  const db = loadDatabase();
  const app = db.applications.find((a) => a.id === req.params.id && a.employerId === req.user?.userId);
  if (!app) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  if (app.status !== 'submitted' && app.status !== 'under_review') {
    return res.status(400).json({
      error: `Application is already in status "${app.status}" and cannot be re-decided.`,
    });
  }

  const nowIso = new Date().toISOString();
  app.employerDecisionAt = nowIso;
  app.updatedAt = nowIso;

  if (decision === 'accept') {
    app.status = 'accepted_awaiting_student_confirmation';
    app.timeline.push({
      status: 'accepted_awaiting_student_confirmation',
      timestamp: nowIso,
      note: 'Employer accepted application and offered the position. Awaiting student confirmation.',
      actorRole: 'employer',
    });

    // Notify Student
    createNotification(
      app.studentId,
      'Job Offer Received! 🌟',
      `Congratulations! ${app.employerBusinessName} accepted your application for "${app.jobTitle}". Please review and confirm your offer.`,
      'success',
      '/student/applications'
    );

    logAuditEvent(
      { id: req.user!.userId, email: req.user!.email, role: 'employer' },
      'ACCEPT_APPLICATION',
      'JobApplication',
      app.id,
      `Accepted ${app.studentName} for ${app.jobTitle}. Awaiting student confirmation.`
    );
  } else {
    app.status = 'rejected';
    app.rejectionReason = reason?.trim() || 'Position filled or candidate profile not matched at this time.';
    app.timeline.push({
      status: 'rejected',
      timestamp: nowIso,
      note: `Application declined: ${app.rejectionReason}`,
      actorRole: 'employer',
    });

    // Notify Student
    createNotification(
      app.studentId,
      'Application Update',
      `Your application for "${app.jobTitle}" at ${app.employerBusinessName} was not selected. Keep exploring opportunities!`,
      'info',
      '/student/applications'
    );

    logAuditEvent(
      { id: req.user!.userId, email: req.user!.email, role: 'employer' },
      'REJECT_APPLICATION',
      'JobApplication',
      app.id,
      `Rejected application for ${app.studentName}.`
    );
  }

  saveDatabase();
  return res.json({ message: `Candidate application ${decision}ed successfully.`, application: app });
});

// STEP 6.5: Employer Records Joining Date (After Student Confirmation)
apiRouter.post('/employer/applications/:id/record-joining-date', requireAuth, requireRole('employer'), (req: AuthRequest, res: Response) => {
  const { joiningDate, joiningInstructions } = req.body;
  if (!joiningDate) {
    return res.status(400).json({ error: 'A valid joining date is required.' });
  }

  const db = loadDatabase();
  const app = db.applications.find((a) => a.id === req.params.id && a.employerId === req.user?.userId);
  if (!app) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  // Must already be student_confirmed
  if (app.status !== 'student_confirmed' && app.status !== 'joining_date_recorded') {
    return res.status(400).json({
      error: 'The candidate must confirm the offer before a joining date can be officially recorded.',
    });
  }

  const nowIso = new Date().toISOString();
  app.joiningDate = joiningDate;
  app.joiningInstructions = joiningInstructions?.trim() || '';
  app.status = 'joining_date_recorded';
  app.updatedAt = nowIso;
  app.timeline.push({
    status: 'joining_date_recorded',
    timestamp: nowIso,
    note: `Joining date scheduled for ${joiningDate}. Instructions: ${app.joiningInstructions || 'Standard reporting'}`,
    actorRole: 'employer',
  });

  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: 'employer' },
    'RECORD_JOINING_DATE',
    'JobApplication',
    app.id,
    `Scheduled joining date ${joiningDate} for ${app.studentName}.`
  );

  // Notify student
  createNotification(
    app.studentId,
    'Official Joining Date Scheduled! 📅',
    `Your joining date for "${app.jobTitle}" is set for ${joiningDate}. Check your application for details.`,
    'info',
    '/student/applications'
  );

  return res.json({
    message: 'Joining date recorded! The ₹100 placement fee demo is now unlocked.',
    application: app,
  });
});

// STEP 7: ₹100 PLACEMENT DEMO PAYMENT (ONLY after BOTH confirmed AND joining date recorded!)
apiRouter.post('/employer/applications/:id/placement-fee-demo', requireAuth, requireRole('employer'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const app = db.applications.find((a) => a.id === req.params.id && a.employerId === req.user?.userId);
  if (!app) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  // STRICT BACKEND VERIFICATION: Both confirmed AND joining date recorded!
  if (!app.joiningDate || (app.status !== 'joining_date_recorded' && app.status !== 'joined')) {
    return res.status(403).json({
      error:
        'Placement fee is only generated after both employer and student have mutually confirmed AND an official joining date has been recorded.',
    });
  }

  // Prevent duplicate fee records for the same placement
  const existingPay = db.demoPayments.find(
    (dp) => dp.relatedEntityId === app.id && dp.purpose === 'employer_placement_fee'
  );
  if (existingPay) {
    return res.json({
      message: 'Demo placement fee already recorded for this student placement.',
      demoPayment: existingPay,
    });
  }

  const nowIso = new Date().toISOString();
  const demoRef = `DEMO-PLC-100-${Math.floor(100000 + Math.random() * 900000)}`;

  const paymentRecord: DemoPayment = {
    id: `dpay_plc_${Date.now()}`,
    employerId: req.user!.userId,
    payerName: app.employerBusinessName,
    purpose: 'employer_placement_fee',
    purposeLabel: `Placement Fee Demo for candidate ${app.studentName}`,
    amount: 100,
    currency: 'INR',
    demoStatus: 'demo_completed',
    demoReference: demoRef,
    isDemo: true,
    relatedEntityId: app.id,
    paymentPolicyVersion: 'v1.0-DEMO',
    notes: `Simulated demonstration placement fee for ${app.studentName} on job "${app.jobTitle}".`,
    createdAt: nowIso,
  };

  app.placementFeeRecordId = paymentRecord.id;
  db.demoPayments.push(paymentRecord);
  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: 'employer' },
    'SIMULATE_PLACEMENT_FEE_DEMO',
    'DemoPayment',
    paymentRecord.id,
    `Completed simulated ₹100 placement fee (Ref: ${demoRef}) for ${app.studentName}.`
  );

  return res.json({
    message: 'Placement fee simulated successfully! (Demo mode - no real money transferred)',
    demoPayment: paymentRecord,
  });
});

// SECTION 15: MARK CANDIDATE AS JOINED & TRIGGER VACANCY REMINDER
apiRouter.post('/employer/applications/:id/mark-joined', requireAuth, requireRole('employer'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const app = db.applications.find((a) => a.id === req.params.id && a.employerId === req.user?.userId);
  if (!app) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  if (app.status === 'joined') {
    return res.status(400).json({ error: 'Candidate has already been marked as joined.' });
  }

  const nowIso = new Date().toISOString();
  app.status = 'joined';
  app.joiningStatusMarkedAt = nowIso;
  app.updatedAt = nowIso;
  app.timeline.push({
    status: 'joined',
    timestamp: nowIso,
    note: 'Candidate has officially joined and commenced the part-time engagement.',
    actorRole: 'employer',
  });

  // Vacancy management: Decrement vacancy count by 1
  const job = db.jobs.find((j) => j.id === app.jobId);
  let vacancyReminderTriggered = false;
  let remainingVacancies = 0;

  if (job) {
    if (job.vacancies > 0) {
      job.vacancies -= 1;
    }
    remainingVacancies = job.vacancies;

    if (job.vacancies <= 0) {
      job.status = 'filled';
      vacancyReminderTriggered = true;

      // VACANCY REMINDER NOTIFICATION
      createNotification(
        app.employerId,
        'Vacancy Filled — Please Review Job Announcement ⚠️',
        `All vacancies for "${job.title}" are now filled by joining students. Please review and close or remove this job announcement to prevent extra applications.`,
        'vacancy_reminder',
        '/employer/jobs'
      );
    } else {
      createNotification(
        app.employerId,
        'Student Joined — Vacancy Update',
        `${app.studentName} has joined for "${job.title}". You now have ${remainingVacancies} vacant spot(s) remaining.`,
        'info',
        '/employer/jobs'
      );
    }
  }

  // Notify Student
  createNotification(
    app.studentId,
    'Welcome Onboard! 🎉',
    `You are officially marked as Joined for "${app.jobTitle}". Best wishes on your opportunity!`,
    'success'
  );

  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: 'employer' },
    'MARK_STUDENT_JOINED',
    'JobApplication',
    app.id,
    `Marked ${app.studentName} as joined for ${app.jobTitle}. Remaining vacancies: ${remainingVacancies}.`
  );

  return res.json({
    message: 'Student marked as joined!',
    application: app,
    remainingVacancies,
    vacancyReminderTriggered,
  });
});

/* ==========================================================================
   SUPER ADMIN PORTAL (SECURE & PROTECTED)
   ========================================================================== */

// Admin Summary & Metrics
apiRouter.get('/admin/metrics', requireAuth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();

  const totalStudents = db.users.filter((u) => u.role === 'student').length;
  const totalEmployers = db.users.filter((u) => u.role === 'employer').length;
  const pendingEmployers = db.employerProfiles.filter((e) => e.verificationStatus === 'pending').length;
  const approvedEmployers = db.employerProfiles.filter((e) => e.verificationStatus === 'approved').length;
  const activeJobs = db.jobs.filter((j) => j.status === 'published').length;
  const totalApplications = db.applications.length;
  const joinedPlacements = db.applications.filter((a) => a.status === 'joined').length;

  const demoPayments = db.demoPayments;
  const totalDemoRevenue = demoPayments.reduce((acc, curr) => acc + curr.amount, 0);

  return res.json({
    totalStudents,
    totalEmployers,
    pendingEmployers,
    approvedEmployers,
    activeJobs,
    totalApplications,
    joinedPlacements,
    demoPaymentsCount: demoPayments.length,
    totalDemoSimulatedRevenue: totalDemoRevenue,
    currency: 'INR',
    isDemonstrationOnly: true,
  });
});

// Admin Employers List
apiRouter.get('/admin/employers', requireAuth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  return res.json({ employers: db.employerProfiles });
});

// Admin Employer Approval / Rejection Decision (SECTION 10)
apiRouter.post('/admin/employers/:id/decision', requireAuth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const { decision, reason, notes, remoteVerification, physicalVerification } = req.body; // 'approve', 'reject', 'request_info', 'in_progress'

  if (!['approve', 'reject', 'request_info', 'in_progress'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid decision type.' });
  }

  if (decision === 'reject' && !reason?.trim()) {
    return res.status(400).json({ error: 'A specific reason is required when rejecting an employer application.' });
  }

  const db = loadDatabase();
  const profile = db.employerProfiles.find((p) => p.id === req.params.id);
  if (!profile) {
    return res.status(404).json({ error: 'Employer profile not found.' });
  }

  const user = db.users.find((u) => u.id === profile.userId);
  const nowIso = new Date().toISOString();

  profile.adminDecisionAt = nowIso;
  profile.adminReviewedBy = req.user!.email;
  profile.adminReviewNotes = notes || profile.adminReviewNotes || '';

  if (remoteVerification) profile.remoteVerificationStatus = remoteVerification;
  if (physicalVerification) profile.physicalVerificationStatus = physicalVerification;

  if (decision === 'approve') {
    profile.verificationStatus = 'approved';
    profile.remoteVerificationStatus = 'verified';
    if (user) user.status = 'active';

    createNotification(
      profile.userId,
      'Account Approved by Super Admin! 🌟',
      'Congratulations! Your business verification is approved. You can now complete the ₹100 demo portfolio fee and publish jobs.',
      'success',
      '/employer/dashboard'
    );

    logAuditEvent(
      { id: req.user!.userId, email: req.user!.email, role: 'admin' },
      'APPROVE_EMPLOYER',
      'EmployerProfile',
      profile.id,
      `Approved ${profile.businessName} (${profile.ownerFullName}).`
    );
  } else if (decision === 'reject') {
    profile.verificationStatus = 'rejected';
    profile.rejectionReason = reason.trim();
    if (user) user.status = 'suspended';

    createNotification(
      profile.userId,
      'Application Update: Verification Declined',
      `Your business application was not approved. Reason: ${reason}`,
      'alert'
    );

    logAuditEvent(
      { id: req.user!.userId, email: req.user!.email, role: 'admin' },
      'REJECT_EMPLOYER',
      'EmployerProfile',
      profile.id,
      `Rejected ${profile.businessName}. Reason: ${reason}`
    );
  } else if (decision === 'request_info') {
    profile.verificationStatus = 'info_requested';
    profile.infoRequestedReason = reason?.trim() || 'Additional proof of address/business registration required.';

    createNotification(
      profile.userId,
      'Additional Business Information Required ℹ️',
      `Super Admin requested additional documentation: ${profile.infoRequestedReason}`,
      'warning'
    );

    logAuditEvent(
      { id: req.user!.userId, email: req.user!.email, role: 'admin' },
      'REQUEST_EMPLOYER_INFO',
      'EmployerProfile',
      profile.id,
      `Requested additional documents: ${profile.infoRequestedReason}`
    );
  } else {
    profile.verificationStatus = 'in_progress';
  }

  saveDatabase();
  return res.json({ message: `Employer verification updated to ${profile.verificationStatus}.`, profile });
});

// Admin Students List
apiRouter.get('/admin/students', requireAuth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  return res.json({ students: db.studentProfiles });
});

// Admin All Jobs Oversight
apiRouter.get('/admin/jobs', requireAuth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  return res.json({ jobs: db.jobs });
});

// Admin Restrict or Remove Job
apiRouter.post('/admin/jobs/:id/action', requireAuth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const { action, reason } = req.body; // 'close', 'remove', 'reopen'
  const db = loadDatabase();
  const job = db.jobs.find((j) => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  job.status = action === 'reopen' ? 'published' : (action as any);
  job.updatedAt = new Date().toISOString();
  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: 'admin' },
    'ADMIN_MODERATE_JOB',
    'Job',
    job.id,
    `Admin set job "${job.title}" to ${job.status}. Reason: ${reason || 'Administrative action'}`
  );

  return res.json({ message: `Job status updated to ${job.status}.`, job });
});

// Admin Portfolios Oversight
apiRouter.get('/admin/portfolios', requireAuth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  return res.json({ portfolios: db.portfolios });
});

// Admin Applications & Placements
apiRouter.get('/admin/applications', requireAuth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  return res.json({ applications: db.applications });
});

// Admin Demo Payments Ledger (SECTION 17.F)
apiRouter.get('/admin/payments', requireAuth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const payments = db.demoPayments;

  const portfolioFees = payments.filter((p) => p.purpose === 'employer_portfolio_fee');
  const placementFees = payments.filter((p) => p.purpose === 'employer_placement_fee');
  const subscriptionFees = payments.filter((p) => p.purpose === 'student_subscription_fee');

  return res.json({
    payments,
    summary: {
      portfolioDemoTotal: portfolioFees.reduce((a, b) => a + b.amount, 0),
      placementDemoTotal: placementFees.reduce((a, b) => a + b.amount, 0),
      subscriptionDemoTotal: subscriptionFees.reduce((a, b) => a + b.amount, 0),
      overallDemoTotal: payments.reduce((a, b) => a + b.amount, 0),
      currency: 'INR',
      disclaimer: 'ALL FIGURES ARE DEMONSTRATION ONLY. NO REAL REVENUE WAS COLLECTED.',
    },
  });
});

// Admin Safety Reports Management
apiRouter.get('/admin/safety-reports', requireAuth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  return res.json({ reports: db.safetyReports });
});

apiRouter.post('/admin/safety-reports/:id', requireAuth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const { status, adminNotes, actionTaken } = req.body;
  const db = loadDatabase();
  const report = db.safetyReports.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Safety report not found.' });
  }

  if (status) report.status = status;
  if (adminNotes !== undefined) report.adminNotes = adminNotes;
  if (actionTaken !== undefined) report.actionTaken = actionTaken;
  report.updatedAt = new Date().toISOString();
  if (status === 'resolved') {
    report.resolvedAt = new Date().toISOString();
    report.resolvedBy = req.user!.email;
  }

  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: 'admin' },
    'RESOLVE_SAFETY_REPORT',
    'SafetyReport',
    report.id,
    `Updated safety report status to ${report.status}. Action: ${actionTaken || 'Reviewed'}`
  );

  return res.json({ message: 'Safety report updated successfully.', report });
});

// Admin Audit Trail
apiRouter.get('/admin/audit-logs', requireAuth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  return res.json({ logs: db.auditLogs });
});

/* ==========================================================================
   COMMON UTILITIES: NOTIFICATIONS, SAFETY REPORTING, AGREEMENTS
   ========================================================================== */

// Notifications for current user
apiRouter.get('/notifications', requireAuth, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const notifs = db.notifications.filter((n) => n.recipientUserId === req.user?.userId);
  return res.json({ notifications: notifs });
});

apiRouter.post('/notifications/:id/read', requireAuth, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const notif = db.notifications.find((n) => n.id === req.params.id && n.recipientUserId === req.user?.userId);
  if (notif) {
    notif.isRead = true;
    saveDatabase();
  }
  return res.json({ success: true });
});

apiRouter.post('/notifications/read-all', requireAuth, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  db.notifications.forEach((n) => {
    if (n.recipientUserId === req.user?.userId) {
      n.isRead = true;
    }
  });
  saveDatabase();
  return res.json({ success: true });
});

// Submit Safety Report
apiRouter.post('/safety-reports', requireAuth, (req: AuthRequest, res: Response) => {
  const { category, subjectTitle, description, reportedJobId, reportedJobTitle, reportedEmployerId, reportedEmployerName } = req.body;
  if (!category || !subjectTitle || !description) {
    return res.status(400).json({ error: 'Category, subject, and description are required.' });
  }

  const db = loadDatabase();
  const user = db.users.find((u) => u.id === req.user?.userId);
  const nowIso = new Date().toISOString();

  const report: SafetyReport = {
    id: `rep_${Date.now()}`,
    reporterUserId: req.user!.userId,
    reporterRole: req.user!.role as any,
    reporterName: user?.fullName || 'Anonymous User',
    reporterEmail: req.user!.email,
    category,
    subjectTitle: subjectTitle.trim(),
    description: description.trim(),
    reportedJobId,
    reportedJobTitle,
    reportedEmployerId,
    reportedEmployerName,
    status: 'pending',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  db.safetyReports.push(report);
  saveDatabase();

  logAuditEvent(
    { id: req.user!.userId, email: req.user!.email, role: req.user!.role },
    'SUBMIT_SAFETY_REPORT',
    'SafetyReport',
    report.id,
    `Safety report submitted on "${subjectTitle}" (${category}).`
  );

  // Notify admin
  const adminUser = db.users.find((u) => u.role === 'admin');
  if (adminUser) {
    createNotification(
      adminUser.id,
      'New Safety Report Submitted ⚠️',
      `A user submitted a safety report: "${subjectTitle}". Review promptly in the Admin portal.`,
      'alert',
      '/admin/safety'
    );
  }

  return res.status(201).json({
    message: 'Your safety report has been recorded securely. Our trust & safety team will review it.',
    report,
  });
});

// Legal Agreements
apiRouter.get('/agreements/student', (_req: Request, res: Response) => {
  return res.json({ agreement: STUDENT_AGREEMENT });
});

apiRouter.get('/agreements/employer', (_req: Request, res: Response) => {
  return res.json({ agreement: EMPLOYER_AGREEMENT });
});
