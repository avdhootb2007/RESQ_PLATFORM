// ─────────────────────────────────────────────────────────────────────────────
// RESQ Platform · Admin User Role Management Panel (Supabase Backend)
// ─────────────────────────────────────────────────────────────────────────────
// Allows admin users to search registered users in `public.profiles` and assign
// roles (citizen / authority / admin) via the `set_user_role` Postgres RPC.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchUserDirectory,
  assignUserRole,
  type ProfileRow,
  type ResqRole,
} from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Search,
  Loader2,
  Check,
  AlertCircle,
  UserCog,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';

const ROLE_CONFIG: Record<ResqRole, { label: string; emoji: string; color: string; description: string }> = {
  citizen:   { label: 'Citizen',   emoji: '🛡️', color: 'bg-blue-100 text-blue-800 border-blue-200',    description: 'Public safety access' },
  authority: { label: 'Authority', emoji: '⚡', color: 'bg-amber-100 text-amber-800 border-amber-200',  description: 'First responder operations' },
  admin:     { label: 'Admin',     emoji: '👑', color: 'bg-red-100 text-red-800 border-red-200',        description: 'Full system control' },
};

export function AdminUserManagement() {
  const { user: currentUser, isDemoMode, isConfigured } = useAuth();
  const [users, setUsers]                 = useState<ProfileRow[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ProfileRow[]>([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [loadingUsers, setLoadingUsers]   = useState(true);
  const [updatingId, setUpdatingId]       = useState<string | null>(null);
  const [successMsg, setSuccessMsg]       = useState<string | null>(null);
  const [errorMsg, setErrorMsg]           = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!isConfigured || isDemoMode) {
      setUsers([
        {
          id: 'demo-citizen-001',
          display_name: 'Aarav Sharma (Demo)',
          email: 'citizen@resq.local',
          phone: '+91 98201 12345',
          avatar_url: null,
          role: 'citizen',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        },
        {
          id: 'demo-authority-002',
          display_name: 'Capt. R. Deshmukh (Demo)',
          email: 'authority@resq.local',
          phone: '+91 98201 54321',
          avatar_url: null,
          role: 'authority',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        },
        {
          id: 'demo-admin',
          display_name: 'Demo System Admin',
          email: 'admin@resq.local',
          phone: null,
          avatar_url: null,
          role: 'admin',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        },
      ]);
      setLoadingUsers(false);
      return;
    }

    setLoadingUsers(true);
    setErrorMsg(null);
    try {
      const data = await fetchUserDirectory();
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching Supabase profiles:', err);
      setErrorMsg(err.message || 'Failed to load user directory from Supabase.');
    } finally {
      setLoadingUsers(false);
    }
  }, [isConfigured, isDemoMode]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter((u) =>
        (u.display_name?.toLowerCase().includes(q)) ||
        (u.email?.toLowerCase().includes(q)) ||
        (u.phone?.includes(q)) ||
        (u.id.toLowerCase().includes(q)) ||
        (u.role.includes(q))
      )
    );
  }, [searchQuery, users]);

  const handleSetRole = async (targetUserId: string, newRole: ResqRole) => {
    if (targetUserId === currentUser?.id && newRole !== 'admin') {
      setErrorMsg('Cannot change your own admin role. Ask another admin.');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    setUpdatingId(targetUserId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isConfigured && !isDemoMode) {
        await assignUserRole(targetUserId, newRole);
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );

      const targetUser = users.find((u) => u.id === targetUserId);
      setSuccessMsg(
        `${targetUser?.display_name || targetUser?.email || targetUserId} → ${ROLE_CONFIG[newRole].emoji} ${ROLE_CONFIG[newRole].label}`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Error setting role via Supabase RPC:', err);
      setErrorMsg(err.message || 'Failed to update user role.');
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <UserCog className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                User Role Management
              </h3>
              <p className="text-xs text-slate-500">
                Assign Citizen, Authority, or Admin roles via Supabase RBAC (`set_user_role` RPC)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              {users.length} registered users
            </div>
            <button
              onClick={loadUsers}
              disabled={loadingUsers}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors"
              title="Refresh user directory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or User ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
      </div>

      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800">
          Previewing sample users in Local Demo Mode. Configure <code className="font-mono">.env</code> and run{' '}
          <code className="font-mono">supabase/schema.sql</code> to manage real Supabase accounts.
        </div>
      )}

      {/* Notifications */}
      {successMsg && (
        <div className="mx-4 mt-3 bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Role updated: {successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 p-3 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* User List */}
      <div className="p-4 sm:p-5 space-y-2">
        {loadingUsers ? (
          <div className="flex items-center justify-center py-8 gap-2 text-sm text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading user directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            {searchQuery ? 'No users match your search.' : 'No registered users found.'}
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isUpdating = updatingId === u.id;
            const isSelf = u.id === currentUser?.id;

            return (
              <div
                key={u.id}
                className={`bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelf ? 'ring-1 ring-slate-300' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full ring-2 ring-slate-200 shrink-0 object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-slate-500" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {u.display_name || 'Unnamed User'}
                      </span>
                      {isSelf && (
                        <span className="text-[9px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                      {u.email && (
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3" /> {u.email}
                        </span>
                      )}
                      {u.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {u.phone}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                      ID: {u.id}
                    </div>
                  </div>
                </div>

                {/* Role Selector */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  {(['citizen', 'authority', 'admin'] as ResqRole[]).map((r) => {
                    const rc = ROLE_CONFIG[r];
                    const isActive = u.role === r;
                    return (
                      <button
                        key={r}
                        onClick={() => !isActive && handleSetRole(u.id, r)}
                        disabled={isUpdating || isActive}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                          isActive
                            ? `${rc.color} font-bold`
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
                        } ${isUpdating ? 'opacity-50 cursor-not-allowed' : isActive ? 'cursor-default' : 'cursor-pointer'}`}
                        title={isActive ? `Current role: ${rc.label}` : `Assign ${rc.label} role`}
                      >
                        {rc.emoji} {rc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
