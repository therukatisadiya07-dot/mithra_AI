/**
 * Shiftwise Client API Helper
 * Project: Mithra_AI
 */

import {
  User,
  StudentProfile,
  EmployerProfile,
  Portfolio,
  Job,
  JobApplication,
  DemoPayment,
  Notification,
  SafetyReport,
  AuditLog,
} from '../types';

const TOKEN_KEY = 'shiftwise_auth_token';

export const apiClient = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'A network or server error occurred. Please try again.');
    }

    return data as T;
  },

  // Auth
  async login(email: string, password: string) {
    const res = await this.request<{
      token: string;
      user: User;
      profile: StudentProfile | EmployerProfile | null;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) this.setToken(res.token);
    return res;
  },

  async registerStudent(payload: any) {
    const res = await this.request<{
      token: string;
      user: User;
      profile: StudentProfile;
    }>('/auth/register-student', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) this.setToken(res.token);
    return res;
  },

  async registerEmployer(payload: any) {
    const res = await this.request<{
      token: string;
      user: User;
      profile: EmployerProfile;
    }>('/auth/register-employer', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) this.setToken(res.token);
    return res;
  },

  async requestStudentOtp(phone: string) {
    return this.request<{ success: boolean; demoCode: string; notice: string }>('/auth/student-otp-simulate', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  async verifyStudentOtp(phone: string, otp: string) {
    const res = await this.request<{
      verified: boolean;
      needsRegistration: boolean;
      token?: string;
      user?: User;
      profile?: StudentProfile;
    }>('/auth/student-otp-verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
    if (res.token) this.setToken(res.token);
    return res;
  },

  async getMe() {
    return this.request<{
      user: User;
      profile: StudentProfile | EmployerProfile | null;
      portfolio?: Portfolio | null;
    }>('/auth/me');
  },

  // Jobs
  async getJobs(params?: Record<string, string | number | boolean>) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ jobs: Job[]; total: number }>(`/jobs${qStr}`);
  },

  async getJob(id: string) {
    return this.request<{ job: Job; portfolio?: Portfolio }>(`/jobs/${id}`);
  },

  async getRecommendations() {
    return this.request<{ recommendations: { job: Job; score: number; matchReason: string }[] }>(
      '/jobs/recommendations/match'
    );
  },

  // Student Actions
  async getStudentProfile() {
    return this.request<{
      profile: StudentProfile;
      subscriptionTimeline: any;
    }>('/student/profile');
  },

  async updateStudentProfile(profileData: Partial<StudentProfile>) {
    return this.request<{ message: string; profile: StudentProfile }>('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async getStudentApplications() {
    return this.request<{ applications: JobApplication[] }>('/student/applications');
  },

  async applyToJob(jobId: string, coverNote?: string) {
    return this.request<{ message: string; application: JobApplication }>('/student/apply', {
      method: 'POST',
      body: JSON.stringify({ jobId, coverNote }),
    });
  },

  async confirmOffer(appId: string) {
    return this.request<{ message: string; application: JobApplication }>(`/student/applications/${appId}/confirm`, {
      method: 'POST',
    });
  },

  async declineOffer(appId: string, reason?: string) {
    return this.request<{ message: string; application: JobApplication }>(`/student/applications/${appId}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async withdrawApplication(appId: string, reason?: string) {
    return this.request<{ message: string; application: JobApplication }>(`/student/applications/${appId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async simulateSubscriptionDemo() {
    return this.request<{ message: string; paymentRecord: DemoPayment }>('/student/simulate-subscription-demo', {
      method: 'POST',
    });
  },

  // Employer Actions
  async getEmployerProfile() {
    return this.request<{ profile: EmployerProfile; portfolio?: Portfolio }>('/employer/profile');
  },

  async simulatePortfolioDemoPayment() {
    return this.request<{ message: string; demoPayment: DemoPayment }>('/employer/create-portfolio-demo-payment', {
      method: 'POST',
    });
  },

  async createPortfolio(payload: any) {
    return this.request<{ message: string; portfolio: Portfolio }>('/employer/portfolio', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updatePortfolio(payload: any) {
    return this.request<{ message: string; portfolio: Portfolio }>('/employer/portfolio', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async getEmployerJobs() {
    return this.request<{ jobs: Job[] }>('/employer/jobs');
  },

  async createJob(jobData: any) {
    return this.request<{ message: string; job: Job }>('/employer/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  async updateJob(id: string, jobData: any) {
    return this.request<{ message: string; job: Job }>(`/employer/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  },

  async setJobStatus(id: string, status: 'closed' | 'removed' | 'published') {
    return this.request<{ message: string; job: Job }>(`/employer/jobs/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async getEmployerApplications() {
    return this.request<{ applications: JobApplication[] }>('/employer/applications');
  },

  async decideApplication(appId: string, decision: 'accept' | 'reject', reason?: string) {
    return this.request<{ message: string; application: JobApplication }>(`/employer/applications/${appId}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, reason }),
    });
  },

  async recordJoiningDate(appId: string, joiningDate: string, joiningInstructions?: string) {
    return this.request<{ message: string; application: JobApplication }>(
      `/employer/applications/${appId}/record-joining-date`,
      {
        method: 'POST',
        body: JSON.stringify({ joiningDate, joiningInstructions }),
      }
    );
  },

  async simulatePlacementFeeDemo(appId: string) {
    return this.request<{ message: string; demoPayment: DemoPayment }>(
      `/employer/applications/${appId}/placement-fee-demo`,
      {
        method: 'POST',
      }
    );
  },

  async markStudentJoined(appId: string) {
    return this.request<{
      message: string;
      application: JobApplication;
      remainingVacancies: number;
      vacancyReminderTriggered: boolean;
    }>(`/employer/applications/${appId}/mark-joined`, {
      method: 'POST',
    });
  },

  // Admin Actions
  async getAdminMetrics() {
    return this.request<any>('/admin/metrics');
  },

  async getAdminEmployers() {
    return this.request<{ employers: EmployerProfile[] }>('/admin/employers');
  },

  async decideEmployerVerification(
    employerId: string,
    payload: {
      decision: 'approve' | 'reject' | 'request_info' | 'in_progress';
      reason?: string;
      notes?: string;
      remoteVerification?: 'pending' | 'verified';
      physicalVerification?: 'pending' | 'verified' | 'not_required';
    }
  ) {
    return this.request<{ message: string; profile: EmployerProfile }>(`/admin/employers/${employerId}/decision`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAdminStudents() {
    return this.request<{ students: StudentProfile[] }>('/admin/students');
  },

  async getAdminJobs() {
    return this.request<{ jobs: Job[] }>('/admin/jobs');
  },

  async moderateJob(jobId: string, action: 'close' | 'remove' | 'reopen', reason?: string) {
    return this.request<{ message: string; job: Job }>(`/admin/jobs/${jobId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
  },

  async getAdminPortfolios() {
    return this.request<{ portfolios: Portfolio[] }>('/admin/portfolios');
  },

  async getAdminApplications() {
    return this.request<{ applications: JobApplication[] }>('/admin/applications');
  },

  async getAdminPayments() {
    return this.request<{ payments: DemoPayment[]; summary: any }>('/admin/payments');
  },

  async getAdminSafetyReports() {
    return this.request<{ reports: SafetyReport[] }>('/admin/safety-reports');
  },

  async updateSafetyReport(reportId: string, payload: any) {
    return this.request<{ message: string; report: SafetyReport }>(`/admin/safety-reports/${reportId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAdminAuditLogs() {
    return this.request<{ logs: AuditLog[] }>('/admin/audit-logs');
  },

  // Common
  async getNotifications() {
    return this.request<{ notifications: Notification[] }>('/notifications');
  },

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' });
  },

  async markAllNotificationsRead() {
    return this.request<{ success: boolean }>('/notifications/read-all', { method: 'POST' });
  },

  async submitSafetyReport(payload: Partial<SafetyReport>) {
    return this.request<{ message: string; report: SafetyReport }>('/safety-reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAgreement(role: 'student' | 'employer') {
    return this.request<{ agreement: any }>(`/agreements/${role}`);
  },
};
