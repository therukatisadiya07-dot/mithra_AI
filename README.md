# Shiftwise — Student Part-Time Job Marketplace

> **Project Name:** Mithra_AI  
> **Application Name:** Shiftwise  
> **Primary Market:** India  
> **Currency:** Indian Rupees (₹)  
> **Platform:** Google AI Studio Build  

Shiftwise is a full-stack web application connecting verified employers across India with students (aged 18 and above) for flexible, skill-building part-time jobs. The platform features strict role-based access control (Student, Employer, Super Admin), mutual offer confirmation, joining date scheduling, single-portfolio constraints, and demonstration-only fee workflows.

---

## 🌟 Key Capabilities & Workflows

1. **Student Journey (7 Steps):**
   - Age 18+ confirmation and account creation (Email/Password or Demo OTP).
   - Profile completion (college, degree, skills, informal work experience, availability).
   - **2-Year Free Tier:** Student job browsing and applying are 100% free for the first two years from the registration timestamp.
   - Proposed ₹500 quarterly maintenance subscription beginning upon the 2nd anniversary (clearly labeled **DEMO — NO REAL PAYMENT REQUIRED**).
   - Rule-based smart job matching with clear match explanations.
   - Mutual offer confirmation: student can actively **Confirm** or **Decline** extended job offers.
   - Joining date schedule viewing and instructions.

2. **Employer Journey (8 Steps):**
   - Business account registration with owner contact and establishment details.
   - Verification document submission (GSTIN, PAN, Udyam MSME, or Shop Act Trade License).
   - **Mandatory Super Admin Review:** Unapproved employers cannot create a portfolio or post jobs.
   - **Single Portfolio Rule:** Each approved employer is restricted to exactly **ONE** portfolio.
   - **₹100 Portfolio Demo Fee:** Simulated UPI/QR payment unlocks the portfolio.
   - Job management (technical/non-technical, online/offline/hybrid, Indian Rupee compensation).
   - Candidate review: Accept or Reject student profiles.
   - **₹100 Placement Demo Fee:** Unlocks **ONLY** after both student confirms AND joining date is recorded.
   - Vacancy decrement & automated **Vacancy Filled Reminders** prompting employers to close filled openings.

3. **Super Admin Console:**
   - Protected access for designated email: `therukatisadiya07@gmail.com`.
   - Employer verification desk (Approve, Reject with mandatory reason, Request Info, Remote & Physical verification flags).
   - Student accounts overview & 2-year subscription timeline monitoring.
   - Job announcements moderation (Close, Remove, Reopen).
   - Portfolios inspection (strictly verifying 1-portfolio compliance).
   - **Demonstration Payments Ledger:** Categorized breakdown of ₹100 portfolio fees, ₹100 placement fees, and student subscription records (strictly marked as simulated).
   - Trust & Safety investigation desk for user reports.
   - Immutable chronological audit trail.

---

## 🛠️ Technology Stack & Architecture

- **Frontend:** React 19 (TypeScript), Tailwind CSS v4, Lucide React icons, Motion animations.
- **Backend:** Node.js Express server (`server.ts`) with custom REST router (`/api/*`).
- **Dev Integration:** Vite 8 middleware mounted in Express dev mode (`npm run dev` running `tsx server.ts`).
- **Data Persistence:** Persistent JSON database (`data/shiftwise-db.json`) with atomic write buffers and transaction logs.
- **Security:** Native Node.js `crypto` (scrypt password hashing with unique random salts, HMAC-SHA256 session tokens, server-side role validation).

---

## 🚀 Getting Started & Local Development

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Variables Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration values:
```env
PORT=3000
SUPER_ADMIN_EMAIL="therukatisadiya07@gmail.com"
SUPER_ADMIN_PASSWORD="ShiftwiseAdminSecure2026!"
AUTH_SECRET="shiftwise-mithra-ai-secret-key-replace-in-production"
DEMO_PAYMENTS_ENABLED="true"
```

### 3. Start Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔐 Super Admin Initial Account

- **Designated Email:** `therukatisadiya07@gmail.com`
- **Initial Password:** Configured via `SUPER_ADMIN_PASSWORD` (default in seed: `ShiftwiseAdminSecure2026!`)
- **Access Route:** Click the **Super Admin Portal Access** link in the website footer or select **Super Admin** from the **Demo Personas** dropdown on the navigation bar.

---

## 🧪 Quick Demo Personas

For immediate testing inside Google AI Studio, use the **Demo Personas** menu on the top navigation bar:
1. **Student:** `aarav.sharma@example.com` / `Student123!` (Aarav Sharma — 2-Year Free Tier Active)
2. **Approved Employer:** `hr@codecrafters.in` / `Employer123!` (CodeCrafters Technologies — Approved with 1 active portfolio)
3. **Pending Employer:** `rajesh@quicklogistics.in` / `Employer123!` (QuickLogistics — Pending Super Admin Review)
4. **Super Admin:** `therukatisadiya07@gmail.com` / `ShiftwiseAdminSecure2026!`

---

## ⚠️ Prototype Demonstration Disclosure

| Feature | Current Status | Production Requirements |
| :--- | :--- | :--- |
| **₹100 Portfolio Fee** | **Demonstration Only** (Simulated QR screen) | Connect to Razorpay/Cashfree/UPI Gateway with webhooks |
| **₹100 Placement Fee** | **Demonstration Only** (Generated post-confirmation) | Server-side verified escrow or payment intent |
| **₹500 Subscription** | **Demonstration Only** (2-year countdown active) | Recurring mandate / e-NACH integration |
| **Student Phone OTP** | **Demonstration Only** (Code `123456`) | SMS Gateway (e.g. MSG91, Twilio) integration |
| **Document Uploads** | **Simulated Validation** (Client format check) | Private cloud bucket (e.g. GCS, S3) with signed URLs |

---

## ⚖️ Legal & Governance Note

All agreements (Student Agreement `v1.0-IN-2026` and Employer Agreement `v1.0-IN-2026`), including the proposed marketplace liability disclaimer clause regarding student discontinuation/leave, represent draft contracts for architectural demonstration. Prior to a commercial public launch in India, qualified legal counsel must review the documentation against the Indian Contract Act 1872, the Consumer Protection Act 2019, the Digital Personal Data Protection Act (DPDP), and relevant state labor rules.
