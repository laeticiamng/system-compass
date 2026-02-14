/**
 * Centralized localStorage key constants.
 * Prevents typos and makes it easy to find all storage usage.
 */
export const STORAGE_KEYS = {
  // Auth & Session
  AUTH_TOKEN: 'supabase.auth.token',
  SESSION_TIMEOUT: 'session_timeout_warning',

  // User preferences
  APP_LANG: 'app_lang',
  THEME: 'theme',
  COOKIE_CONSENT: 'cookie-consent',

  // Onboarding & Tours
  TOUR_COMPLETED: 'pyramid-compass-tour-completed',
  GAME_TUTORIAL_COMPLETED: 'game_tutorial_completed',
  SIDEBAR_HINT_SEEN: 'sidebar-hint-seen',
  DISCLAIMER_DISMISSED: 'pyramid-disclaimer-dismissed',

  // User data
  USER_PROFILE: 'userProfile',
  LIFE_TRAJECTORY_PROFILE: 'lifeTrajectoryProfile',
  CHALLENGE_PROGRESS: 'challenge-progress',
  NEWSLETTER_SUBSCRIPTIONS: 'newsletter_subscriptions',
  NEWSLETTER_SUBSCRIBERS: 'newsletter_subscribers',
  EVENT_REGISTRATIONS: 'event_registrations',

  // Analytics & Monitoring
  ANALYTICS_SESSION_ID: 'analytics_session_id',
  ANALYTICS_ALERT_SETTINGS: 'analytics_alert_settings',
  SLOW_OPERATIONS: 'slow_operations',
  ERROR_LOGS: 'error_logs',
  OFFLINE_QUEUE_SIZE: 'offline_queue_size',

  // Features
  PUSH_SUBSCRIPTION: 'push_subscription',
  PUSH_NOTIFICATION_PREFS: 'push-notification-prefs',
  PUSH_SUBSCRIBED: 'push-subscribed',
  TRACEOS_NOTIFICATIONS: 'traceos_notifications_enabled',
  RECENT_SEARCHES: 'pyramid_recent_searches',

  // Offline
  OFFLINE_QUEUE: 'offline_queue',

  // Rate limiting prefix
  RATE_LIMIT_PREFIX: 'rate_limit_',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
