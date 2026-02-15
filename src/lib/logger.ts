/**
 * Production-safe logger utility.
 * In development: all log levels are shown.
 * In production: only errors are shown; warn/info/debug are suppressed.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  error(message: string, ...args: unknown[]) {
    console.error(`[Error] ${message}`, ...args);
  },

  warn(message: string, ...args: unknown[]) {
    if (isDev) {
      console.warn(`[Warn] ${message}`, ...args);
    }
  },

  info(message: string, ...args: unknown[]) {
    if (isDev) {
      console.info(`[Info] ${message}`, ...args);
    }
  },

  debug(message: string, ...args: unknown[]) {
    if (isDev) {
      console.debug(`[Debug] ${message}`, ...args);
    }
  },
};
