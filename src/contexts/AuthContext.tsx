// ─────────────────────────────────────────────────────────────────────────────
// RESQ Platform · Auth Context (Supabase Backend)
// ─────────────────────────────────────────────────────────────────────────────
// Provides app-wide authentication state, normalized user, RBAC role, and
// Supabase auth methods (Email/Password, Google OAuth, Phone OTP).
// When Supabase env vars are not yet configured, allows Local Demo Mode so the
// UI remains functional out of the box without crashing.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  mapSupabaseUser,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  sendOtp,
  verifyOtp,
  signOutUser,
  syncUserProfileAndRole,
  type AuthUser,
  type ResqRole,
} from '../lib/supabase';

const DEMO_ROLE_STORAGE_KEY = 'resq_demo_role';

interface AuthContextType {
  user: AuthUser | null;
  role: ResqRole;
  loading: boolean;
  error: string | null;
  notice: string | null;
  isConfigured: boolean;
  isDemoMode: boolean;

  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, fullName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  requestOtp: (phoneNumber: string) => Promise<boolean>;
  confirmOtp: (code: string) => Promise<void>;
  enterDemoMode: (selectedRole?: ResqRole) => void;
  switchDemoRole: (selectedRole: ResqRole) => void;
  logout: () => Promise<void>;
  clearError: () => void;
  clearNotice: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function makeDemoUser(selectedRole: ResqRole): AuthUser {
  const labels: Record<ResqRole, string> = {
    citizen: 'Demo Citizen',
    authority: 'Demo EOC Commander',
    admin: 'Demo System Admin',
  };
  return {
    id: `demo-${selectedRole}`,
    email: `${selectedRole}@resq.local`,
    phone: null,
    displayName: labels[selectedRole],
    avatarUrl: null,
    isDemo: true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [user, setUser]                 = useState<AuthUser | null>(null);
  const [role, setRole]                 = useState<ResqRole>('citizen');
  const [loading, setLoading]           = useState<boolean>(isSupabaseConfigured);
  const [error, setError]               = useState<string | null>(null);
  const [notice, setNotice]             = useState<string | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  // ── Restore demo session if Supabase isn't configured ──────────────────────
  useEffect(() => {
    if (isSupabaseConfigured) {
      return;
    }
    const savedDemoRole = sessionStorage.getItem(DEMO_ROLE_STORAGE_KEY) as ResqRole | null;
    if (savedDemoRole === 'citizen' || savedDemoRole === 'authority' || savedDemoRole === 'admin') {
      setUser(makeDemoUser(savedDemoRole));
      setRole(savedDemoRole);
    }
    setLoading(false);
  }, []);

  // ── Listen to Supabase Auth state (keep callback synchronous) ──────────────
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data, error: sessionErr }) => {
        if (!active) return;
        if (sessionErr) {
          console.error('Supabase getSession error:', sessionErr);
        }
        const sessionUser = data.session?.user ?? null;
        setSupabaseUser(sessionUser);
        if (!sessionUser) {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to read Supabase session:', err);
        if (active) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSupabaseUser(session?.user ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // ── Sync user profile & role outside onAuthStateChange callback ────────────
  useEffect(() => {
    if (!supabase) return;

    let active = true;

    if (!supabaseUser) {
      setUser(null);
      setRole('citizen');
      setLoading(false);
      return;
    }

    setUser(mapSupabaseUser(supabaseUser));
    syncUserProfileAndRole(supabaseUser)
      .then((resolvedRole) => {
        if (active) {
          setRole(resolvedRole);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [supabaseUser]);

  // ── Email / Password Sign-In ───────────────────────────────────────────────
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const data = await signInWithEmail(email, password);
      if (data.user) {
        setSupabaseUser(data.user);
      }
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      setError(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  }, []);

  // ── Email / Password Sign-Up ───────────────────────────────────────────────
  const registerWithEmail = useCallback(async (email: string, password: string, fullName?: string) => {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const data = await signUpWithEmail(email, password, fullName);
      if (data.session && data.user) {
        setSupabaseUser(data.user);
      } else {
        setNotice('Account created! Check your email inbox to confirm your address, then sign in.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Email sign-up error:', err);
      setError(err.message || 'Could not create account.');
      setLoading(false);
    }
  }, []);

  // ── Google OAuth Sign-In ───────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      // Browser redirects to Google OAuth flow
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Google sign-in failed.');
      setLoading(false);
    }
  }, []);

  // ── Phone OTP: Request code ────────────────────────────────────────────────
  const requestOtp = useCallback(async (phoneNumber: string): Promise<boolean> => {
    setError(null);
    setNotice(null);
    try {
      await sendOtp(phoneNumber);
      setPendingPhone(phoneNumber);
      return true;
    } catch (err: any) {
      console.error('OTP send error:', err);
      setError(err.message || 'Failed to send OTP. Ensure Phone Auth is enabled in Supabase.');
      return false;
    }
  }, []);

  // ── Phone OTP: Verify code ─────────────────────────────────────────────────
  const confirmOtp = useCallback(async (code: string) => {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (!pendingPhone) {
        throw new Error('No active OTP request found. Please request a new code.');
      }
      const data = await verifyOtp(pendingPhone, code);
      if (data.user) {
        setSupabaseUser(data.user);
      }
      setPendingPhone(null);
    } catch (err: any) {
      console.error('OTP verify error:', err);
      setError(err.message || 'Invalid or expired OTP code.');
      setLoading(false);
    }
  }, [pendingPhone]);

  // ── Local Demo Mode (only active when Supabase env vars are missing) ───────
  const enterDemoMode = useCallback((selectedRole: ResqRole = 'citizen') => {
    if (isSupabaseConfigured) return;
    setError(null);
    setNotice(null);
    sessionStorage.setItem(DEMO_ROLE_STORAGE_KEY, selectedRole);
    setUser(makeDemoUser(selectedRole));
    setRole(selectedRole);
    setLoading(false);
  }, []);

  const switchDemoRole = useCallback((selectedRole: ResqRole) => {
    if (isSupabaseConfigured) return;
    sessionStorage.setItem(DEMO_ROLE_STORAGE_KEY, selectedRole);
    setUser(makeDemoUser(selectedRole));
    setRole(selectedRole);
  }, []);

  // ── Sign Out ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setError(null);
    setNotice(null);
    sessionStorage.removeItem(DEMO_ROLE_STORAGE_KEY);
    if (user?.isDemo) {
      setUser(null);
      setRole('citizen');
      return;
    }
    try {
      await signOutUser();
      setSupabaseUser(null);
      setUser(null);
      setRole('citizen');
    } catch (err: any) {
      setError(err.message || 'Sign-out failed.');
    }
  }, [user?.isDemo]);

  const clearError = useCallback(() => setError(null), []);
  const clearNotice = useCallback(() => setNotice(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        error,
        notice,
        isConfigured: isSupabaseConfigured,
        isDemoMode: Boolean(user?.isDemo),
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        requestOtp,
        confirmOtp,
        enterDemoMode,
        switchDemoRole,
        logout,
        clearError,
        clearNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() must be used within an <AuthProvider>');
  }
  return ctx;
}
