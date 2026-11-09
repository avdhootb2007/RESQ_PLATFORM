// ─────────────────────────────────────────────────────────────────────────────
// RESQ Platform · Auth Context
// ─────────────────────────────────────────────────────────────────────────────
// Provides app-wide authentication state, user object, role, and auth methods.
// Wraps the entire app so any component can call `useAuth()`.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  setupRecaptcha,
  sendOtp,
  verifyOtp,
  signOutUser,
  getUserRole,
  type User,
  type ConfirmationResult,
  type ResqRole,
} from '../lib/firebase';

// ── Context Shape ────────────────────────────────────────────────────────────
interface AuthContextType {
  // State
  user: User | null;
  role: ResqRole;
  loading: boolean;
  error: string | null;

  // Google Sign-In
  loginWithGoogle: () => Promise<void>;

  // Phone OTP Sign-In (two-step)
  initRecaptcha: (buttonId: string) => void;
  requestOtp: (phoneNumber: string) => Promise<void>;
  confirmOtp: (code: string) => Promise<void>;

  // Sign Out
  logout: () => Promise<void>;

  // Clear errors
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [role, setRole]               = useState<ResqRole>('citizen');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  // ── Listen to Firebase auth state ──────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRole = await getUserRole(firebaseUser);
          setUser(firebaseUser);
          setRole(userRole);
        } else {
          setUser(null);
          setRole('citizen');
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Failed to determine user role.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ── Google Sign-In ─────────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();
      const userRole = await getUserRole(firebaseUser);
      setUser(firebaseUser);
      setRole(userRole);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked. Please allow popups for this site.');
      } else {
        setError(err.message || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Phone OTP: Step 1 – Initialize reCAPTCHA ──────────────────────────────
  const initRecaptcha = useCallback((buttonId: string) => {
    setupRecaptcha(buttonId);
  }, []);

  // ── Phone OTP: Step 2 – Request OTP ───────────────────────────────────────
  const requestOtp = useCallback(async (phoneNumber: string) => {
    setError(null);
    try {
      const result = await sendOtp(phoneNumber);
      setConfirmation(result);
    } catch (err: any) {
      console.error('OTP send error:', err);
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Use format: +919876543210');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait before retrying.');
      } else {
        setError(err.message || 'Failed to send OTP.');
      }
    }
  }, []);

  // ── Phone OTP: Step 3 – Verify code ───────────────────────────────────────
  const confirmOtp = useCallback(async (code: string) => {
    setError(null);
    setLoading(true);
    try {
      if (!confirmation) throw new Error('No OTP session found. Please request a new code.');
      const firebaseUser = await verifyOtp(confirmation, code);
      const userRole = await getUserRole(firebaseUser);
      setUser(firebaseUser);
      setRole(userRole);
      setConfirmation(null);
    } catch (err: any) {
      console.error('OTP verify error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP code. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP has expired. Please request a new one.');
      } else {
        setError(err.message || 'OTP verification failed.');
      }
    } finally {
      setLoading(false);
    }
  }, [confirmation]);

  // ── Sign Out ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOutUser();
      setUser(null);
      setRole('citizen');
    } catch (err: any) {
      setError(err.message || 'Sign-out failed.');
    }
  }, []);

  // ── Clear error ────────────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        error,
        loginWithGoogle,
        initRecaptcha,
        requestOtp,
        confirmOtp,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() must be used within an <AuthProvider>');
  }
  return ctx;
}

