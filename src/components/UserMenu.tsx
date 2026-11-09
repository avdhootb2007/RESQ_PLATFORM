// ─────────────────────────────────────────────────────────────────────────────
// RESQ Platform · User Menu (Header Component)
// ─────────────────────────────────────────────────────────────────────────────
// Shows the authenticated user's avatar, name, role badge, and sign-out button.
// Designed to be placed in the EnterpriseHeader.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, ChevronDown, Shield, User, Phone } from 'lucide-react';

const ROLE_BADGES: Record<string, { label: string; color: string }> = {
  citizen:   { label: 'Citizen',   color: 'bg-blue-100 text-blue-700'    },
  authority: { label: 'Authority', color: 'bg-amber-100 text-amber-700'  },
  admin:     { label: 'Admin',     color: 'bg-red-100 text-red-700'      },
};

export function UserMenu() {
  const { user, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const badge = ROLE_BADGES[role] ?? ROLE_BADGES.citizen;
  const displayName = user.displayName || user.email || user.phoneNumber || 'User';
  const isPhoneUser = !!user.phoneNumber && !user.email;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        {/* Avatar */}
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            className="w-7 h-7 rounded-full ring-2 ring-slate-200"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
            {isPhoneUser ? (
              <Phone className="w-3.5 h-3.5 text-slate-600" />
            ) : (
              <User className="w-3.5 h-3.5 text-slate-600" />
            )}
          </div>
        )}

        {/* Name + Role (desktop) */}
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
            {displayName}
          </span>
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md leading-none ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
            {user.email && (
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            )}
            {user.phoneNumber && (
              <p className="text-xs text-slate-500">{user.phoneNumber}</p>
            )}
            <div className="mt-2 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-slate-400" />
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${badge.color}`}>
                {badge.label}
              </span>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={async () => {
                setOpen(false);
                await logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

