import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import Auth from '../Auth';

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock functions
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockNavigate = vi.fn();

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: vi.fn(),
  }),
}));

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock analytics
vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackAccountCreated: vi.fn(),
  }),
}));

describe('Auth Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue({ error: null });
    mockSignUp.mockResolvedValue({ error: null });
  });

  describe('Rendering', () => {
    it('renders login form by default', () => {
      render(<Auth />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders toggle between login and signup', () => {
      render(<Auth />);

      // Both buttons should be present
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('shows display name field only in signup mode', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      // Login mode - no display name
      expect(screen.queryByLabelText(/display name/i)).not.toBeInTheDocument();

      // Find and click the signup button
      const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
      const signupToggle = buttons.find((btn) =>
        btn.textContent?.toLowerCase().includes('sign up') ||
        btn.textContent?.toLowerCase().includes('signup')
      );

      if (signupToggle) {
        await user.click(signupToggle);
        // Signup mode - has display name
        expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
      }
    });
  });

  describe('Password Validation - Security Critical', () => {
    it('rejects password shorter than 8 characters', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      // Switch to signup mode
      const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
      const signupToggle = buttons.find((btn) =>
        btn.textContent?.toLowerCase().includes('sign up') ||
        btn.textContent?.toLowerCase().includes('signup')
      );
      if (signupToggle) await user.click(signupToggle);

      // Fill form with short password
      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Short1'); // Only 6 chars

      // Submit - find the submit button
      const allButtons = screen.getAllByRole('button') as HTMLButtonElement[];
      const submitBtn = allButtons.find((btn) =>
        btn.getAttribute('type') === 'submit'
      );
      if (submitBtn) await user.click(submitBtn);

      // signUp should NOT be called with invalid password
      // Wait a bit to ensure the form validation has run
      await waitFor(() => {
        expect(mockSignUp).not.toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('accepts valid password meeting all requirements', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      // Switch to signup mode
      const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
      const signupToggle = buttons.find((btn) =>
        btn.textContent?.toLowerCase().includes('sign up') ||
        btn.textContent?.toLowerCase().includes('signup')
      );
      if (signupToggle) await user.click(signupToggle);

      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'ValidPass1'); // Valid password

      // Submit
      const allButtons = screen.getAllByRole('button') as HTMLButtonElement[];
      const submitBtn = allButtons.find((btn) =>
        btn.getAttribute('type') === 'submit'
      );
      if (submitBtn) await user.click(submitBtn);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          'test@example.com',
          'ValidPass1',
          'Test User'
        );
      });
    });
  });

  describe('Email Validation', () => {
    it('rejects invalid email format', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.type(screen.getByLabelText(/password/i), 'ValidPass1');

      const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
      const submitBtn = buttons.find((btn) =>
        btn.getAttribute('type') === 'submit'
      );
      if (submitBtn) await user.click(submitBtn);

      await waitFor(() => {
        // Should show error or not call signIn
        expect(mockSignIn).not.toHaveBeenCalled();
      });
    });

    it('accepts valid email format', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      await user.type(screen.getByLabelText(/email/i), 'valid@example.com');
      await user.type(screen.getByLabelText(/password/i), 'ValidPass1');

      const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
      const submitBtn = buttons.find((btn) =>
        btn.getAttribute('type') === 'submit'
      );
      if (submitBtn) await user.click(submitBtn);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('valid@example.com', 'ValidPass1');
      });
    });
  });

  describe('Display Name Validation', () => {
    it('requires display name for signup', async () => {
      const user = userEvent.setup();
      render(<Auth />);

      // Switch to signup mode
      const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
      const signupToggle = buttons.find((btn) =>
        btn.textContent?.toLowerCase().includes('sign up') ||
        btn.textContent?.toLowerCase().includes('signup')
      );
      if (signupToggle) await user.click(signupToggle);

      // Leave display name empty
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'ValidPass1');

      const allButtons = screen.getAllByRole('button') as HTMLButtonElement[];
      const submitBtn = allButtons.find((btn) =>
        btn.getAttribute('type') === 'submit'
      );
      if (submitBtn) await user.click(submitBtn);

      await waitFor(() => {
        expect(mockSignUp).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays server error for invalid credentials', async () => {
      mockSignIn.mockResolvedValue({
        error: { message: 'Invalid login credentials' },
      });

      const user = userEvent.setup();
      render(<Auth />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'ValidPass1');

      const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
      const submitBtn = buttons.find((btn) =>
        btn.getAttribute('type') === 'submit'
      );
      if (submitBtn) await user.click(submitBtn);

      await waitFor(() => {
        // Should display error message
        const errorText = screen.queryByText(/invalid|incorrect|error/i);
        expect(errorText).toBeInTheDocument();
      });
    });

    it('displays error for already registered email', async () => {
      mockSignUp.mockResolvedValue({
        error: { message: 'User already registered' },
      });

      const user = userEvent.setup();
      render(<Auth />);

      const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
      const signupToggle = buttons.find((btn) =>
        btn.textContent?.toLowerCase().includes('sign up') ||
        btn.textContent?.toLowerCase().includes('signup')
      );
      if (signupToggle) await user.click(signupToggle);

      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/password/i), 'ValidPass1');

      const allButtons = screen.getAllByRole('button') as HTMLButtonElement[];
      const submitBtn = allButtons.find((btn) =>
        btn.getAttribute('type') === 'submit'
      );
      if (submitBtn) await user.click(submitBtn);

      await waitFor(() => {
        const errorText = screen.queryByText(/already|exist|déjà/i);
        expect(errorText).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has properly labeled form fields', () => {
      render(<Auth />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('uses correct input types', () => {
      render(<Auth />);

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    });
  });

  describe('Security', () => {
    it('does not expose password in DOM', () => {
      render(<Auth />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });
});
