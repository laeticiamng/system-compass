import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  type: 'deadline' | 'reminder' | 'achievement' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

const STORAGE_KEY = 'pyramid_notifications';
const MAX_NOTIFICATIONS = 50;

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })));
      } catch (e) {
        console.error('Failed to parse notifications');
        setNotifications([]);
      }
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = useCallback((notifs: Notification[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
  }, []);

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      saveNotifications(updated);
      return updated;
    });

    return newNotification.id;
  }, [saveNotifications]);

  // Add deadline notification
  const addDeadlineNotification = useCallback((title: string, daysRemaining: number, actionUrl?: string) => {
    const priority = daysRemaining <= 1 ? 'high' : daysRemaining <= 3 ? 'medium' : 'low';
    const message = daysRemaining === 0 
      ? "C'est aujourd'hui !" 
      : daysRemaining === 1 
        ? "C'est demain !"
        : `Dans ${daysRemaining} jours`;

    return addNotification({
      type: 'deadline',
      title,
      message,
      priority,
      actionUrl,
    });
  }, [addNotification]);

  // Add achievement notification
  const addAchievementNotification = useCallback((title: string, message: string) => {
    return addNotification({
      type: 'achievement',
      title,
      message,
      priority: 'low',
    });
  }, [addNotification]);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Clear notification
  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    addDeadlineNotification,
    addAchievementNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };
}
