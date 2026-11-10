// ─────────────────────────────────────────────────────────────────────────────
// RESQ Platform · Supabase Client, Auth & Role Helpers
// ─────────────────────────────────────────────────────────────────────────────
// Replaces Firebase Auth + Firestore with Supabase Auth + PostgreSQL + RLS.
// Configuration is loaded from VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

export type ResqRole = 'citizen' | 'authority' | 'admin';

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isDemo?: boolean;
}

export interface ProfileRow {
  id: string;
  email: string | null;
  phone: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: ResqRole;
  created_at: string;
  last_login_at: string;
}

// ── Environment Config ───────────────────────────────────────────────────────
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-supabase-anon-key') &&
  !supabaseAnonKey.includes('your-anon-key') &&
  /^https?:\/\//i.test(supabaseUrl);

// Only instantiate SupabaseClient when valid credentials are present so missing
// env vars never throw at import time.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

function requireClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
  }
  return supabase;
}

// ── Normalize Supabase User → App AuthUser ───────────────────────────────────
export function mapSupabaseUser(user: User): AuthUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    displayName:
      (meta.full_name as string | undefined) ||
      (meta.name as string | undefined) ||
      (meta.display_name as string | undefined) ||
      null,
    avatarUrl:
      (meta.avatar_url as string | undefined) ||
      (meta.picture as string | undefined) ||
      null,
    isDemo: false,
  };
}

// ── Email / Password Auth ────────────────────────────────────────────────────
export async function signInWithEmail(email: string, password: string) {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: fullName?.trim() ? { full_name: fullName.trim() } : undefined,
      emailRedirectTo: `${window.location.origin}/`,
    },
  });
  if (error) throw error;
  return data;
}

// ── Google OAuth Sign-In ─────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
  return data;
}

// ── Phone OTP Sign-In ────────────────────────────────────────────────────────
export async function sendOtp(phoneNumber: string) {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithOtp({
    phone: phoneNumber,
  });
  if (error) throw error;
  return data;
}

export async function verifyOtp(phoneNumber: string, token: string) {
  const client = requireClient();
  const { data, error } = await client.auth.verifyOtp({
    phone: phoneNumber,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

// ── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOutUser() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── Profile Bootstrap & Role Lookup ──────────────────────────────────────────
/**
 * Ensures the user has a profile row in `public.profiles` and returns their role.
 * Never throws if the schema hasn't been initialized yet; falls back to 'citizen'.
 */
export async function syncUserProfileAndRole(user: User): Promise<ResqRole> {
  if (!supabase) return 'citizen';

  const mapped = mapSupabaseUser(user);

  try {
    const { data: existing, error: selectErr } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle();

    if (selectErr) {
      console.warn('Could not read profiles table (run supabase/schema.sql if not set up):', selectErr.message);
      return 'citizen';
    }

    if (!existing) {
      const { error: insertErr } = await supabase.from('profiles').insert({
        id: user.id,
        email: mapped.email,
        phone: mapped.phone,
        display_name: mapped.displayName,
        avatar_url: mapped.avatarUrl,
        role: 'citizen',
      });
      if (insertErr) {
        console.warn('Profile insert skipped:', insertErr.message);
      }
      return 'citizen';
    }

    await supabase
      .from('profiles')
      .update({
        email: mapped.email,
        phone: mapped.phone,
        display_name: mapped.displayName,
        avatar_url: mapped.avatarUrl,
        last_login_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    const role = existing.role as ResqRole | undefined;
    return role === 'admin' || role === 'authority' || role === 'citizen' ? role : 'citizen';
  } catch (err) {
    console.warn('Failed to sync profile/role, defaulting to citizen:', err);
    return 'citizen';
  }
}

// ── Admin Directory & Role RPC ───────────────────────────────────────────────
export async function fetchUserDirectory(): Promise<ProfileRow[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('profiles')
    .select('id, email, phone, display_name, avatar_url, role, created_at, last_login_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data ?? []) as ProfileRow[];
}

export async function assignUserRole(targetUserId: string, newRole: ResqRole) {
  const client = requireClient();
  const { data, error } = await client.rpc('set_user_role', {
    target_user_id: targetUserId,
    new_role: newRole,
  });

  if (error) throw error;
  return data;
}

