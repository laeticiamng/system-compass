/**
 * Auth domain — currently a thin re-export of the existing `useAuth` hook.
 * A dedicated Zustand store will replace the React Context in a follow-up
 * sprint once all consumers are surveyed.
 */
export { useAuth, AuthProvider } from '@/hooks/useAuth';
