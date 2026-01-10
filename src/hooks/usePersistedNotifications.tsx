import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PersistedNotification {
  id: string;
  type: 'deadline' | 'reminder' | 'achievement' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

const LOCAL_STORAGE_KEY = 'pyramid_notifications';
const MAX_NOTIFICATIONS = 50;

export function usePersistedNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<PersistedNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notifications from localStorage and optionally from Supabase
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);

      // First load from localStorage for immediate display
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setNotifications(parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          })));
        } catch (e) {
          console.error('Failed to parse notifications from localStorage');
          setNotifications([]);
        }
      }

      // If user is logged in, fetch from Supabase and merge
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(MAX_NOTIFICATIONS);

          if (!error && data) {
            const dbNotifications: PersistedNotification[] = data.map((n) => ({
              id: n.id,
              type: n.type as PersistedNotification['type'],
              title: n.title,
              message: n.message,
              timestamp: new Date(n.created_at),
              read: n.read,
              actionUrl: n.action_url || undefined,
              priority: n.priority as PersistedNotification['priority'],
            }));

            // Merge with localStorage (DB takes precedence)
            const localIds = new Set(dbNotifications.map(n => n.id));
            const localNotifs = notifications.filter(n => !localIds.has(n.id) && !n.id.startsWith('notif-'));
            
            const merged = [...dbNotifications, ...localNotifs].slice(0, MAX_NOTIFICATIONS);
            setNotifications(merged);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          }
        } catch (err) {
          console.error('Error loading notifications from Supabase:', err);
        }
      }

      setLoading(false);
    };

    loadNotifications();
  }, [user]);

  // Save to localStorage
  const saveToLocalStorage = useCallback((notifs: PersistedNotification[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifs));
  }, []);

  // Add notification
  const addNotification = useCallback(async (
    notification: Omit<PersistedNotification, 'id' | 'timestamp' | 'read'>
  ) => {
    const now = new Date();
    const newNotification: PersistedNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now,
      read: false,
    };

    // If user is logged in, persist to DB first
    if (user) {
      try {
        const { data, error } = await supabase
          .from('user_notifications')
          .insert([{
            user_id: user.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            action_url: notification.actionUrl,
          }])
          .select()
          .single();

        if (!error && data) {
          newNotification.id = data.id;
        }
      } catch (err) {
        console.error('Error saving notification to DB:', err);
      }
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      saveToLocalStorage(updated);
      return updated;
    });

    return newNotification.id;
  }, [user, saveToLocalStorage]);

  // Add deadline notification
  const addDeadlineNotification = useCallback((
    title: string, 
    daysRemaining: number, 
    actionUrl?: string
  ) => {
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
  const markAsRead = useCallback(async (id: string) => {
    // Update in DB if user is logged in
    if (user && !id.startsWith('notif-')) {
      try {
        await supabase
          .from('user_notifications')
          .update({ read: true })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error updating notification in DB:', err);
      }
    }

    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveToLocalStorage(updated);
      return updated;
    });
  }, [user, saveToLocalStorage]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    // Update in DB if user is logged in
    if (user) {
      try {
        await supabase
          .from('user_notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false);
      } catch (err) {
        console.error('Error updating notifications in DB:', err);
      }
    }

    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveToLocalStorage(updated);
      return updated;
    });
  }, [user, saveToLocalStorage]);

  // Clear notification
  const clearNotification = useCallback(async (id: string) => {
    // Delete from DB if user is logged in
    if (user && !id.startsWith('notif-')) {
      try {
        await supabase
          .from('user_notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error deleting notification from DB:', err);
      }
    }

    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveToLocalStorage(updated);
      return updated;
    });
  }, [user, saveToLocalStorage]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    // Delete from DB if user is logged in
    if (user) {
      try {
        await supabase
          .from('user_notifications')
          .delete()
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error deleting notifications from DB:', err);
      }
    }

    setNotifications([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, [user]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    addNotification,
    addDeadlineNotification,
    addAchievementNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };
}
