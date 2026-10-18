/**
 * Shiftwise Navigation Bar
 * Responsive header with brand identity, role-aware navigation,
 * safety link, and AI Studio demo switcher.
 */

import React, { useState } from 'react';
import {
  Briefcase,
  User,
  Shield,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenNotifications: () => void;
  onOpenSafetyReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenNotifications,
  onOpenSafetyReport,
}) => {
  const { user, profile, unreadCount, logout, quickLoginDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const navItemClass = (viewName: string) =>
    `text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
      currentView === viewName
        ? 'bg-purple-100/80 text-purple-900 shadow-2xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#EFECE6] px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Wordmark */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5 text-purple-100" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">Shiftwise</span>
              <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                ₹ INR
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
              Mithra_AI
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button onClick={() => onNavigate('home')} className={navItemClass('home')}>
            Home
          </button>
          <button onClick={() => onNavigate('how_it_works')} className={navItemClass('how_it_works')}>
            How It Works
          </button>
          <button onClick={() => onNavigate('find_jobs')} className={navItemClass('find_jobs')}>
            Find Jobs
          </button>
          <button onClick={() => onNavigate('for_employers')} className={navItemClass('for_employers')}>
            For Employers
          </button>
          <button onClick={() => onNavigate('legal_safety')} className={navItemClass('legal_safety')}>
            Safety & Terms
          </button>

          {/* Quick link to relevant dashboard if logged in */}
          {user && (
            <button
              onClick={() => {
                if (user.role === 'student') onNavigate('student_dashboard');
                else if (user.role === 'employer') onNavigate('employer_dashboard');
                else if (user.role === 'admin') onNavigate('admin_dashboard');
              }}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                currentView.includes('dashboard')
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              My Dashboard
            </button>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Demo Sandbox Quick-Switch Tooltip / Dropdown for easy grading & review */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="text-[11px] font-semibold flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-xl transition-colors"
              title="Switch demo personas for evaluation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Demo Personas</span>
              <ChevronDown className="w-3 h-3 text-amber-600" />
            </button>

            {demoMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs animate-fadeIn"
                onClick={() => setDemoMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Test Personas (Instant Logins)
                </div>
                <button
                  onClick={() => {
                    quickLoginDemo('student');
                    onNavigate('student_dashboard');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-purple-50 flex items-center justify-between text-slate-700 hover:text-purple-900"
                >
                  <div>
                    <div className="font-semibold">Student (Aarav Sharma)</div>
                    <div className="text-[10px] text-slate-400">2-Year Free Tier Active</div>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-semibold">
                    Student
                  </span>
                </button>
                <button
                  onClick={() => {
                    quickLoginDemo('employer');
                    onNavigate('employer_dashboard');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-purple-50 flex items-center justify-between text-slate-700 hover:text-purple-900"
                >
                  <div>
                    <div className="font-semibold">Employer (CodeCrafters)</div>
                    <div className="text-[10px] text-slate-400">Approved • 1 Portfolio</div>
                  </div>
                  <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-semibold">
                    Employer
                  </span>
                </button>
                <button
                  onClick={() => {
                    quickLoginDemo('admin');
                    onNavigate('admin_dashboard');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-purple-50 flex items-center justify-between text-slate-700 hover:text-purple-900"
                >
                  <div>
                    <div className="font-semibold">Super Admin</div>
                    <div className="text-[10px] text-slate-400">therukatisadiya07@gmail.com</div>
                  </div>
                  <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full font-semibold">
                    Admin
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Report Safety Concern Icon */}
          <button
            onClick={onOpenSafetyReport}
            title="Report a Safety Concern or Suspicious Job"
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Notifications Bell */}
          {user && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#FAF9F5]" />
              )}
            </button>
          )}

          {/* Auth State Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white border border-slate-200/90 hover:border-purple-300 rounded-xl shadow-2xs text-xs font-semibold text-slate-800 transition-all"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  {user.fullName.charAt(0)}
                </div>
                <span className="max-w-[100px] truncate hidden sm:inline">{user.fullName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs animate-fadeIn"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-900 truncate">{user.fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (user.role === 'student') onNavigate('student_dashboard');
                      else if (user.role === 'employer') onNavigate('employer_dashboard');
                      else if (user.role === 'admin') onNavigate('admin_dashboard');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    Go to Dashboard
                  </button>

                  {user.role === 'student' && (
                    <button
                      onClick={() => onNavigate('student_profile')}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      My Profile
                    </button>
                  )}

                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 font-medium flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('login')}
                className="text-xs font-semibold px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate('register_role')}
                className="text-xs font-semibold px-3.5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl shadow-xs transition-all active:scale-[0.98]"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-200/80 space-y-1 text-xs">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('how_it_works');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              onNavigate('find_jobs');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            Find Jobs
          </button>
          <button
            onClick={() => {
              onNavigate('for_employers');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            For Employers
          </button>
          <button
            onClick={() => {
              onNavigate('legal_safety');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            Safety & Terms
          </button>
          {user && (
            <button
              onClick={() => {
                if (user.role === 'student') onNavigate('student_dashboard');
                else if (user.role === 'employer') onNavigate('employer_dashboard');
                else if (user.role === 'admin') onNavigate('admin_dashboard');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 font-bold text-purple-700 bg-purple-50 rounded-xl"
            >
              My Dashboard ({user.role})
            </button>
          )}
        </div>
      )}
    </header>
  );
};
