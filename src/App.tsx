/**
 * Shiftwise - Student Part-Time Job Marketplace
 * Project: Mithra_AI
 * Main Application Component
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './views/LandingPage';
import { FindJobsPage } from './views/FindJobsPage';
import { HowItWorksPage } from './views/HowItWorksPage';
import { ForEmployersPage } from './views/ForEmployersPage';
import { LegalSafetyPage } from './views/LegalSafetyPage';
import {
  RoleSelectView,
  StudentRegisterView,
  EmployerRegisterView,
  LoginView,
  AdminLoginView,
} from './views/AuthViews';
import { StudentDashboard } from './views/StudentDashboard';
import { EmployerDashboard } from './views/EmployerDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SafetyReportModal } from './components/SafetyReportModal';
import { AgreementViewerModal } from './components/AgreementViewerModal';
import { Job } from './types';

function MainApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Global Modals
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [safetyReportOpen, setSafetyReportOpen] = useState(false);
  const [safetyTarget, setSafetyTarget] = useState<{
    jobId?: string;
    jobTitle?: string;
    employerId?: string;
    employerName?: string;
  }>({});

  const [agreementModal, setAgreementModal] = useState<{
    isOpen: boolean;
    role: 'student' | 'employer';
  }>({
    isOpen: false,
    role: 'student',
  });

  const handleOpenSafetyReport = (
    jobId?: string,
    jobTitle?: string,
    employerId?: string,
    employerName?: string
  ) => {
    setSafetyTarget({ jobId, jobTitle, employerId, employerName });
    setSafetyReportOpen(true);
  };

  const handleOpenAgreement = (role: 'student' | 'employer') => {
    setAgreementModal({ isOpen: true, role });
  };

  const handleSelectJobFromLanding = (job: Job) => {
    setSelectedJob(job);
    setCurrentView('find_jobs');
  };

  // Render view based on state & role
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <LandingPage
            onNavigate={setCurrentView}
            onSelectJob={handleSelectJobFromLanding}
          />
        );

      case 'find_jobs':
        return (
          <FindJobsPage
            onNavigate={setCurrentView}
            onOpenSafetyReport={handleOpenSafetyReport}
            selectedJobInitial={selectedJob}
          />
        );

      case 'how_it_works':
        return (
          <HowItWorksPage
            onNavigate={setCurrentView}
            onOpenAgreement={handleOpenAgreement}
          />
        );

      case 'for_employers':
        return (
          <ForEmployersPage
            onNavigate={setCurrentView}
            onOpenAgreement={handleOpenAgreement}
          />
        );

      case 'legal_safety':
        return (
          <LegalSafetyPage
            onOpenSafetyReport={() => handleOpenSafetyReport()}
            onOpenAgreement={handleOpenAgreement}
          />
        );

      case 'register_role':
        return (
          <RoleSelectView
            onNavigate={setCurrentView}
            onOpenAgreement={handleOpenAgreement}
          />
        );

      case 'register_student':
        return (
          <StudentRegisterView
            onNavigate={setCurrentView}
            onOpenAgreement={handleOpenAgreement}
          />
        );

      case 'register_employer':
        return (
          <EmployerRegisterView
            onNavigate={setCurrentView}
            onOpenAgreement={handleOpenAgreement}
          />
        );

      case 'login':
        return (
          <LoginView
            onNavigate={setCurrentView}
            onOpenAgreement={handleOpenAgreement}
          />
        );

      case 'admin_login':
        return (
          <AdminLoginView
            onNavigate={setCurrentView}
            onOpenAgreement={handleOpenAgreement}
          />
        );

      case 'student_dashboard':
        if (!user) {
          return (
            <LoginView
              onNavigate={setCurrentView}
              onOpenAgreement={handleOpenAgreement}
            />
          );
        }
        return (
          <StudentDashboard
            onNavigate={setCurrentView}
            onOpenSafetyReport={handleOpenSafetyReport}
            onOpenAgreement={handleOpenAgreement}
          />
        );

      case 'employer_dashboard':
        if (!user) {
          return (
            <LoginView
              onNavigate={setCurrentView}
              onOpenAgreement={handleOpenAgreement}
            />
          );
        }
        return (
          <EmployerDashboard
            onNavigate={setCurrentView}
            onOpenAgreement={handleOpenAgreement}
            onOpenSafetyReport={handleOpenSafetyReport}
          />
        );

      case 'admin_dashboard':
        if (!user || user.role !== 'admin') {
          return (
            <AdminLoginView
              onNavigate={setCurrentView}
              onOpenAgreement={handleOpenAgreement}
            />
          );
        }
        return <AdminDashboard />;

      default:
        return (
          <LandingPage
            onNavigate={setCurrentView}
            onSelectJob={handleSelectJobFromLanding}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onOpenSafetyReport={() => handleOpenSafetyReport()}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {renderView()}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={setCurrentView}
        onOpenSafetyReport={() => handleOpenSafetyReport()}
        onOpenAgreement={handleOpenAgreement}
      />

      {/* Slide-in Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        onNavigate={(url) => {
          if (url.includes('student')) setCurrentView('student_dashboard');
          else if (url.includes('employer')) setCurrentView('employer_dashboard');
          else if (url.includes('admin')) setCurrentView('admin_dashboard');
        }}
      />

      {/* Safety Report Modal */}
      <SafetyReportModal
        isOpen={safetyReportOpen}
        onClose={() => setSafetyReportOpen(false)}
        targetJobId={safetyTarget.jobId}
        targetJobTitle={safetyTarget.jobTitle}
        targetEmployerId={safetyTarget.employerId}
        targetEmployerName={safetyTarget.employerName}
      />

      {/* Agreement Viewer Modal */}
      <AgreementViewerModal
        isOpen={agreementModal.isOpen}
        role={agreementModal.role}
        onClose={() => setAgreementModal({ ...agreementModal, isOpen: false })}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
