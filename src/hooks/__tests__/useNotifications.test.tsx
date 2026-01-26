import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
    removeItem: (key: string) => { delete mockLocalStorage[key]; },
    clear: () => Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]),
  },
  writable: true,
});

// Initialize i18n for testing
i18n.init({
  lng: 'fr',
  resources: {
    fr: {
      translation: {
        'notifications.deadlineToday': "C'est aujourd'hui !",
        'notifications.deadlineTomorrow': "C'est demain !",
        'notifications.deadlineInDays': "Dans {{count}} jours",
        'notifications.achievementUnlocked': 'Succès débloqué !',
      }
    }
  }
});

// Import after mocks
import { useNotifications } from '../useNotifications';

const STORAGE_KEY = 'pyramid_notifications';

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
  };
}

describe('useNotifications', () => {
  beforeEach(() => {
    Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]);
  });

  describe('initialization', () => {
    it('should start with empty notifications', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
    });

    it('should load existing notifications from localStorage', () => {
      const existingNotifications = [
        { id: 'test-1', type: 'info', title: 'Test', message: 'Test message', timestamp: new Date().toISOString(), read: false, priority: 'low' }
      ];
      mockLocalStorage[STORAGE_KEY] = JSON.stringify(existingNotifications);

      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toBe('Test');
    });

    it('should handle corrupted localStorage gracefully', () => {
      mockLocalStorage[STORAGE_KEY] = 'invalid-json';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      expect(result.current.notifications).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('addNotification', () => {
    it('should add new notification', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Test Title',
          message: 'Test Message',
          priority: 'low',
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toBe('Test Title');
    });

    it('should generate unique ID', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addNotification({ type: 'info', title: 'Test 1', message: 'Msg 1', priority: 'low' });
        result.current.addNotification({ type: 'info', title: 'Test 2', message: 'Msg 2', priority: 'low' });
      });

      expect(result.current.notifications[0].id).not.toBe(result.current.notifications[1].id);
    });

    it('should set timestamp automatically', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addNotification({ type: 'info', title: 'Test', message: 'Msg', priority: 'low' });
      });

      expect(result.current.notifications[0].timestamp).toBeInstanceOf(Date);
    });

    it('should set read to false by default', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addNotification({ type: 'info', title: 'Test', message: 'Msg', priority: 'low' });
      });

      expect(result.current.notifications[0].read).toBe(false);
    });

    it('should limit to 50 notifications', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        for (let i = 0; i < 55; i++) {
          result.current.addNotification({ type: 'info', title: `Test ${i}`, message: `Msg ${i}`, priority: 'low' });
        }
      });

      expect(result.current.notifications).toHaveLength(50);
    });

    it('should persist to localStorage', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addNotification({ type: 'info', title: 'Test', message: 'Msg', priority: 'low' });
      });

      const stored = JSON.parse(mockLocalStorage[STORAGE_KEY]);
      expect(stored).toHaveLength(1);
    });
  });

  describe('addDeadlineNotification', () => {
    it('should set high priority for deadline today', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addDeadlineNotification('Task Due', 0);
      });

      expect(result.current.notifications[0].priority).toBe('high');
      expect(result.current.notifications[0].type).toBe('deadline');
    });

    it('should set high priority for deadline tomorrow', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addDeadlineNotification('Task Due', 1);
      });

      expect(result.current.notifications[0].priority).toBe('high');
    });

    it('should set medium priority for deadline in 2-3 days', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addDeadlineNotification('Task Due', 3);
      });

      expect(result.current.notifications[0].priority).toBe('medium');
    });

    it('should set low priority for deadline > 3 days', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addDeadlineNotification('Task Due', 7);
      });

      expect(result.current.notifications[0].priority).toBe('low');
    });

    it('should include actionUrl if provided', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addDeadlineNotification('Task Due', 5, '/tasks/123');
      });

      expect(result.current.notifications[0].actionUrl).toBe('/tasks/123');
    });
  });

  describe('addReminderNotification', () => {
    it('should create reminder type notification', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addReminderNotification('Reminder Title', 'Reminder message');
      });

      expect(result.current.notifications[0].type).toBe('reminder');
      expect(result.current.notifications[0].priority).toBe('medium');
    });
  });

  describe('addAchievementNotification', () => {
    it('should create achievement type notification', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addAchievementNotification('first_login');
      });

      expect(result.current.notifications[0].type).toBe('achievement');
      expect(result.current.notifications[0].priority).toBe('low');
    });
  });

  describe('addInfoNotification', () => {
    it('should create info type notification', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addInfoNotification('Info Title', 'Info message');
      });

      expect(result.current.notifications[0].type).toBe('info');
      expect(result.current.notifications[0].priority).toBe('low');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      let notifId: string;
      act(() => {
        notifId = result.current.addNotification({ type: 'info', title: 'Test', message: 'Msg', priority: 'low' });
      });

      act(() => {
        result.current.markAsRead(notifId);
      });

      expect(result.current.notifications[0].read).toBe(true);
    });

    it('should decrease unread count', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      let notifId: string;
      act(() => {
        notifId = result.current.addNotification({ type: 'info', title: 'Test', message: 'Msg', priority: 'low' });
      });

      expect(result.current.unreadCount).toBe(1);

      act(() => {
        result.current.markAsRead(notifId);
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addNotification({ type: 'info', title: 'Test 1', message: 'Msg 1', priority: 'low' });
        result.current.addNotification({ type: 'info', title: 'Test 2', message: 'Msg 2', priority: 'low' });
      });

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.notifications.every(n => n.read)).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('clearNotification', () => {
    it('should remove specific notification', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      let notifId: string;
      act(() => {
        notifId = result.current.addNotification({ type: 'info', title: 'Test', message: 'Msg', priority: 'low' });
        result.current.addNotification({ type: 'info', title: 'Test 2', message: 'Msg 2', priority: 'low' });
      });

      act(() => {
        result.current.clearNotification(notifId);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toBe('Test 2');
    });
  });

  describe('clearAllNotifications', () => {
    it('should clear all notifications', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addNotification({ type: 'info', title: 'Test 1', message: 'Msg 1', priority: 'low' });
        result.current.addNotification({ type: 'info', title: 'Test 2', message: 'Msg 2', priority: 'low' });
      });

      act(() => {
        result.current.clearAllNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
      expect(mockLocalStorage[STORAGE_KEY]).toBeUndefined();
    });
  });

  describe('getNotificationsByType', () => {
    it('should filter notifications by type', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addNotification({ type: 'info', title: 'Info', message: 'Msg', priority: 'low' });
        result.current.addDeadlineNotification('Deadline', 5);
        result.current.addAchievementNotification('achievement');
      });

      const deadlineNotifs = result.current.getNotificationsByType('deadline');
      expect(deadlineNotifs).toHaveLength(1);
      expect(deadlineNotifs[0].type).toBe('deadline');
    });
  });

  describe('getHighPriorityNotifications', () => {
    it('should return only high priority unread notifications', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      act(() => {
        result.current.addNotification({ type: 'info', title: 'Low', message: 'Msg', priority: 'low' });
        result.current.addDeadlineNotification('Urgent', 0); // high priority
      });

      const highPriority = result.current.getHighPriorityNotifications();
      expect(highPriority).toHaveLength(1);
      expect(highPriority[0].priority).toBe('high');
    });

    it('should exclude read high priority notifications', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

      let notifId: string;
      act(() => {
        notifId = result.current.addDeadlineNotification('Urgent', 0);
      });

      act(() => {
        result.current.markAsRead(notifId);
      });

      const highPriority = result.current.getHighPriorityNotifications();
      expect(highPriority).toHaveLength(0);
    });
  });
});
