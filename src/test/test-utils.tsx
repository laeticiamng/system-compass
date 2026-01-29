import { ReactElement, ReactNode } from 'react';
import { 
  render, 
  RenderOptions,
  screen,
  waitFor,
  renderHook
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { vi } from 'vitest';

// Initialize i18n for tests
i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['translation'],
  defaultNS: 'translation',
  resources: {
    en: {
      translation: {
        // Auth
        'auth.login': 'Login',
        'auth.signup': 'Sign Up',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.displayName': 'Display Name',
        'auth.displayNamePlaceholder': 'How do you want to be called?',
        'auth.loginButton': 'Sign In',
        'auth.signupButton': 'Sign Up',
        'auth.subtitle': 'Access your account',
        'auth.errors.invalidEmail': 'Invalid email',
        'auth.errors.passwordTooShort': 'Password must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 number',
        'auth.errors.nameRequired': 'Display name is required',
        'auth.errors.invalidCredentials': 'Invalid email or password',
        'auth.errors.alreadyRegistered': 'An account already exists with this email',
        'auth.errors.generic': 'An error occurred',
        // Dashboard
        'dashboard.title': 'Dashboard',
        'dashboard.welcome': 'Welcome',
        'dashboard.progress': 'Progress',
        'dashboard.recentActivity': 'Recent Activity',
        // Exit Keys
        'exitKeys.title': 'Exit Keys',
        'exitKeys.description': 'Personalized strategies for your situation',
        'exitKeys.difficulty.accessible': 'Accessible',
        'exitKeys.difficulty.exigeant': 'Demanding',
        'exitKeys.difficulty.expert': 'Expert',
        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.submit': 'Submit',
        'common.back': 'Back',
        'common.next': 'Next',
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

// Mock user for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    display_name: 'Test User',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
};

// Mock session
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser,
};

// Mock auth context
export const mockAuthContext = {
  user: null as typeof mockUser | null,
  session: null as typeof mockSession | null,
  loading: false,
  signUp: vi.fn().mockResolvedValue({ error: null }),
  signIn: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue(undefined),
};

// Mock subscription context
export const mockSubscriptionContext = {
  tier: 'free' as const,
  subscribed: false,
  subscriptionEnd: null,
  loading: false,
  error: null,
  checkSubscription: vi.fn(),
  createCheckout: vi.fn(),
  openCustomerPortal: vi.fn(),
  canAccessPremium: false,
  canAccessPro: false,
};

// Create query client for tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllProvidersProps {
  children: ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>{children}</BrowserRouter>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';
// Override render with our custom render that includes providers
export { customRender as render };
// Explicit named exports for commonly used utilities
export { screen, waitFor, renderHook };
export { i18n };
