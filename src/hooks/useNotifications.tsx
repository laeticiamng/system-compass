import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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

  // Add deadline notification with i18n
  const addDeadlineNotification = useCallback((title: string, daysRemaining: number, actionUrl?: string) => {
    const priority = daysRemaining <= 1 ? 'high' : daysRemaining <= 3 ? 'medium' : 'low';
    
    let message: string;
    if (daysRemaining === 0) {
      message = t('notifications.deadlineToday', "C'est aujourd'hui !");
    } else if (daysRemaining === 1) {
      message = t('notifications.deadlineTomorrow', "C'est demain !");
    } else {
      message = t('notifications.deadlineInDays', { count: daysRemaining, defaultValue: `Dans ${daysRemaining} jours` });
    }

    return addNotification({
      type: 'deadline',
      title,
      message,
      priority,
      actionUrl,
    });
  }, [addNotification, t]);

  // Add reminder notification with i18n
  const addReminderNotification = useCallback((title: string, message: string, actionUrl?: string) => {
    return addNotification({
      type: 'reminder',
      title,
      message,
      priority: 'medium',
      actionUrl,
    });
  }, [addNotification]);

  // Add achievement notification with i18n
  const addAchievementNotification = useCallback((achievementKey: string, achievementName?: string) => {
    const title = t('notifications.achievementUnlocked', 'Succès débloqué !');
    const message = achievementName || t(`achievements.${achievementKey}`, achievementKey);
    
    return addNotification({
      type: 'achievement',
      title,
      message,
      priority: 'low',
    });
  }, [addNotification, t]);

  // Add info notification
  const addInfoNotification = useCallback((title: string, message: string, actionUrl?: string) => {
    return addNotification({
      type: 'info',
      title,
      message,
      priority: 'low',
      actionUrl,
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

  // Get notifications by type
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get high priority notifications
  const getHighPriorityNotifications = useCallback(() => {
    return notifications.filter(n => n.priority === 'high' && !n.read);
  }, [notifications]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    addDeadlineNotification,
    addReminderNotification,
    addAchievementNotification,
    addInfoNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    getNotificationsByType,
    getHighPriorityNotifications,
  };
}
