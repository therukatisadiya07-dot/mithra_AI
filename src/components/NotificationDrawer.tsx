/**
 * Shiftwise Notification Center Drawer
 */

import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Clock, X, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { Notification } from '../types';
import { apiClient } from '../lib/apiClient';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (url: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-[#FAF9F5] h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-700" />
            <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {notifications.filter((n) => !n.isRead).length} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-10 text-xs text-slate-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.isRead;
              const isReminder = notif.type === 'vacancy_reminder';
              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition-all text-xs relative ${
                    isUnread
                      ? isReminder
                        ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                        : 'bg-purple-50/70 border-purple-200 shadow-sm'
                      : 'bg-white border-slate-200/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      {isReminder && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      <span>{notif.title}</span>
                    </div>
                    {isUnread && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        title="Mark as read"
                        className="text-purple-600 hover:text-purple-800 p-0.5 rounded-full"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">{notif.message}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                    {notif.relatedUrl && onNavigate && (
                      <button
                        onClick={() => {
                          onNavigate(notif.relatedUrl!);
                          onClose();
                        }}
                        className="text-purple-700 hover:underline font-semibold"
                      >
                        View details →
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
