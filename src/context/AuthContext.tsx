/**
 * Shiftwise Authentication Context
 * Manages active user session, role status, notifications, and demo account switching.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, StudentProfile, EmployerProfile, Portfolio, Notification } from '../types';
import { apiClient } from '../lib/apiClient';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | EmployerProfile | null;
  portfolio: Portfolio | null;
  isLoading: boolean;
  unreadCount: number;
  login: (email: string, password: string) => Promise<void>;
  quickLoginDemo: (role: 'student' | 'employer' | 'admin') => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | EmployerProfile | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchCurrentUser = async () => {
    const token = apiClient.getToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setPortfolio(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiClient.getMe();
      setUser(res.user);
      setProfile(res.profile || null);
      setPortfolio(res.portfolio || null);

      // Fetch notifications
      const notifRes = await apiClient.getNotifications();
      const unread = notifRes.notifications.filter((n: Notification) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn('Session verification failed, logging out:', err);
      apiClient.removeToken();
      setUser(null);
      setProfile(null);
      setPortfolio(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.login(email, password);
      setUser(res.user);
      setProfile(res.profile);
      await fetchCurrentUser();
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginDemo = async (role: 'student' | 'employer' | 'admin') => {
    setIsLoading(true);
    try {
      let email = 'aarav.sharma@example.com';
      let password = 'Student123!';

      if (role === 'employer') {
        email = 'hr@codecrafters.in';
        password = 'Employer123!';
      } else if (role === 'admin') {
        email = 'therukatisadiya07@gmail.com';
        password = 'ShiftwiseAdminSecure2026!';
      }

      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.removeToken();
    setUser(null);
    setProfile(null);
    setPortfolio(null);
    setUnreadCount(0);
  };

  const refreshUserData = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        portfolio,
        isLoading,
        unreadCount,
        login,
        quickLoginDemo,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
