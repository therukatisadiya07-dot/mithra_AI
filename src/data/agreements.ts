/**
 * Shiftwise Agreements & Legal Terms
 * Draft agreements subject to legal review under applicable Indian laws.
 */

import { AgreementDocument } from '../types';

export const STUDENT_AGREEMENT_VERSION = 'v1.0-IN-2026';
export const EMPLOYER_AGREEMENT_VERSION = 'v1.0-IN-2026';

export const STUDENT_AGREEMENT: AgreementDocument = {
  version: STUDENT_AGREEMENT_VERSION,
  role: 'student',
  title: 'Shiftwise Student Registration & Platform Use Agreement',
  effectiveDate: 'October 2026',
  summary:
    'This agreement outlines your rights, safety guidelines, age eligibility, and proposed two-year free access terms on Shiftwise (Mithra_AI).',
  sections: [
    {
      title: '1. Eligibility & Age Confirmation',
      content:
        'By registering on Shiftwise, you affirm and warrant that you are at least 18 years of age and currently enrolled in or recently graduated from a recognized higher educational institution in India. Accurate representation of your identity, college enrollment, and skills is required.',
    },
    {
      title: '2. Two-Year Free Access & Subscription Model',
      content:
        'Registration, browsing, and applying to verified student part-time jobs are completely free of charge for the first two (2) calendar years from your registration timestamp. Starting upon the second anniversary of your registration, the proposed platform maintenance subscription is ₹500 every three (3) months. NOTE: In this working prototype, all payment screens are in demonstration mode ("DEMO — NO REAL PAYMENT REQUIRED") and no real funds will ever be deducted.',
    },
    {
      title: '3. Application & Offer Mutual Confirmation',
      content:
        'Submitting an application does not guarantee employment. If an employer extends an offer, you retain full autonomy to confirm or decline the offer. Once confirmed, a mutually agreed joining date is recorded. You agree to communicate professionally and adhere to agreed reporting dates.',
    },
    {
      title: '4. Proposed Platform Limitation of Liability (Draft Clause for Legal Review)',
      content:
        'Shiftwise serves as a discovery and marketplace platform connecting students with prospective employers. Shiftwise is not the direct employer and does not supervise day-to-day work conditions. While Shiftwise mandates business verification for employers, users are urged to exercise personal caution. Shiftwise shall not be liable for student discontinuation, workplace disputes, or unauthorized financial requests outside the platform.',
    },
    {
      title: '5. Student Safety & Code of Conduct',
      content:
        'You have the right to a safe, harassment-free workplace. You must never pay any deposit, registration fee, or security money to any employer. Immediately report any suspicious job listings, inappropriate conduct, or misleading compensation using the built-in Safety & Reporting portal.',
    },
    {
      title: '6. Privacy & Data Protection',
      content:
        'Shiftwise treats your personally identifiable information (PII) with care in accordance with Indian digital privacy practices. Your college ID and private documents are strictly restricted and never published publicly.',
    },
  ],
};

export const EMPLOYER_AGREEMENT: AgreementDocument = {
  version: EMPLOYER_AGREEMENT_VERSION,
  role: 'employer',
  title: 'Shiftwise Employer & Business Partner Terms of Service',
  effectiveDate: 'October 2026',
  summary:
    'Mandatory terms governing business verification, job postings, placement commitments, and platform fee policies.',
  sections: [
    {
      title: '1. Business Verification & Admin Approval',
      content:
        'All employers must submit valid business verification (GSTIN, PAN, Udyam MSME, or Trade License) and address proof. Employer accounts remain in pending state until verified and approved by the Super Admin. Misrepresentation or impersonation will lead to permanent blacklisting and legal referral.',
    },
    {
      title: '2. Single Portfolio Constraint',
      content:
        'Each approved business is entitled to exactly ONE (1) public employer portfolio. An employer cannot create multiple portfolios or bypass limits. All active job announcements must be managed exclusively within this single portfolio.',
    },
    {
      title: '3. Demonstrational Platform Fees',
      content:
        'Shiftwise proposes two employer fees: (a) A one-time ₹100 portfolio activation fee upon account approval, and (b) A ₹100 placement fee per candidate, unlocked only after mutual confirmation by both employer and student, and recording of the joining date. In this current prototype, all payments are simulated demonstrations ("DEMO PAYMENT — ₹100") with no actual financial transactions or banking credentials requested.',
    },
    {
      title: '4. Accurate Job Postings & Student Protection',
      content:
        'All job posts must clearly state compensation, payment basis (hourly/monthly/fixed), working hours, location, and requirements. Employers are strictly prohibited from collecting upfront training fees, deposits, or unpaid trial periods from students.',
    },
    {
      title: '5. Discontinuation & Platform Role (Draft Clause for Legal Review)',
      content:
        'Shiftwise acts solely as an introductory marketplace and does not guarantee student tenure, attendance, or performance. Should a student discontinue employment, request unplanned leave, or fail to report, Shiftwise shall not be held liable for business losses. Employers must handle customary workplace management under standard Indian contract principles.',
    },
    {
      title: '6. Vacancy Management & Reporting',
      content:
        'Employers agree to review and update vacancy counts promptly once a student joins. When all vacancies are filled, employers must close or remove the listing to prevent misleading active applicants.',
    },
  ],
};
