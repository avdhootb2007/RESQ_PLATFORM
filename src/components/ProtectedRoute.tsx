// ─────────────────────────────────────────────────────────────────────────────
// RESQ Platform · Role-Based Route Guard
// ─────────────────────────────────────────────────────────────────────────────
// Wraps protected content and redirects unauthenticated users to /login.
// Optionally restricts by role(s).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';
import type { ResqRole } from '../lib/firebase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Which roles are allowed access. If omitted, any authenticated user passes. */
  allowedRoles?: ResqRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  // ── Still resolving auth state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Verifying credentials…</p>
      </div>
    );
  }

  // ── Not authenticated → redirect to login ──────────────────────────────────
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ── Authenticated but role not permitted ────────────────────────────────────
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6">
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center max-w-md shadow-sm">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-600 mb-1">
            Your current role: <strong className="font-mono text-slate-900 uppercase">{role}</strong>
          </p>
          <p className="text-xs text-slate-500">
            This section requires{' '}
            <strong className="text-slate-700">
              {allowedRoles.map(r => r.toUpperCase()).join(' or ')}
            </strong>{' '}
            privileges. Contact your system administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  // ── Authorized ──────────────────────────────────────────────────────────────
  return <>{children}</>;
}

