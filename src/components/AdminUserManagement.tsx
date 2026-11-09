// ─────────────────────────────────────────────────────────────────────────────
// RESQ Platform · Admin User Role Management Panel
// ─────────────────────────────────────────────────────────────────────────────
// Allows admin users to search users and assign roles (citizen/authority/admin).
// Uses the setUserRole Cloud Function.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { ResqRole } from '../lib/firebase';
import {
  Users,
  Shield,
  Search,
  Loader2,
  Check,
  AlertCircle,
  UserCog,
  Phone,
  Mail,
} from 'lucide-react';

interface UserRecord {
  uid: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  role: ResqRole;
  photoURL: string | null;
  createdAt: any;
  lastLoginAt: any;
}

const ROLE_CONFIG: Record<ResqRole, { label: string; emoji: string; color: string; description: string }> = {
  citizen:   { label: 'Citizen',   emoji: '🛡️', color: 'bg-blue-100 text-blue-800 border-blue-200',    description: 'Public safety access' },
  authority: { label: 'Authority', emoji: '⚡', color: 'bg-amber-100 text-amber-800 border-amber-200',  description: 'First responder operations' },
  admin:     { label: 'Admin',     emoji: '👑', color: 'bg-red-100 text-red-800 border-red-200',        description: 'Full system control' },
};

export function AdminUserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]                 = useState<UserRecord[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserRecord[]>([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [loadingUsers, setLoadingUsers]   = useState(true);
  const [updatingUid, setUpdatingUid]     = useState<string | null>(null);
  const [successMsg, setSuccessMsg]       = useState<string | null>(null);
  const [errorMsg, setErrorMsg]           = useState<string | null>(null);

  // ── Fetch users from Firestore ─────────────────────────────────────────────
  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({
          uid: doc.id,
          ...doc.data(),
        })) as UserRecord[];
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setErrorMsg('Failed to load user directory.');
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  // ── Filter users on search ─────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter(u =>
        (u.displayName?.toLowerCase().includes(q)) ||
        (u.email?.toLowerCase().includes(q)) ||
        (u.phone?.includes(q)) ||
        (u.uid.toLowerCase().includes(q)) ||
        (u.role.includes(q))
      )
    );
  }, [searchQuery, users]);

  // ── Assign role via Cloud Function ─────────────────────────────────────────
  const handleSetRole = async (targetUid: string, newRole: ResqRole) => {
    // Prevent self-demotion
    if (targetUid === currentUser?.uid && newRole !== 'admin') {
      setErrorMsg('Cannot change your own admin role. Ask another admin.');
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    setUpdatingUid(targetUid);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const functions = getFunctions();
      const setUserRole = httpsCallable(functions, 'setUserRole');
      await setUserRole({ targetUid, role: newRole });

      // Update local state
      setUsers(prev =>
        prev.map(u => u.uid === targetUid ? { ...u, role: newRole } : u)
      );

      const targetUser = users.find(u => u.uid === targetUid);
      setSuccessMsg(
        `${targetUser?.displayName || targetUser?.email || targetUid} → ${ROLE_CONFIG[newRole].emoji} ${ROLE_CONFIG[newRole].label}`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Error setting role:', err);
      setErrorMsg(err.message || 'Failed to update user role.');
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setUpdatingUid(null);
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
                Assign Citizen, Authority, or Admin roles via Firebase Custom Claims
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            {users.length} registered users
          </div>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
      </div>

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
            const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.citizen;
            const isUpdating = updatingUid === u.uid;
            const isSelf = u.uid === currentUser?.uid;

            return (
              <div
                key={u.uid}
                className={`bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelf ? 'ring-1 ring-slate-300' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  {u.photoURL ? (
                    <img src={u.photoURL} alt="" className="w-9 h-9 rounded-full ring-2 ring-slate-200 shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-slate-500" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {u.displayName || 'Unnamed User'}
                      </span>
                      {isSelf && (
                        <span className="text-[9px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
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
                      UID: {u.uid}
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
                        onClick={() => !isActive && handleSetRole(u.uid, r)}
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

