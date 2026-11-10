// ─────────────────────────────────────────────────────────────────────────────
// RESQ Platform · Login Page (Supabase Auth)
// ─────────────────────────────────────────────────────────────────────────────
// Supports Email/Password (Sign In & Sign Up), Google OAuth, and Phone OTP
// via Supabase Auth. Automatically redirects to / once authenticated.
// When Supabase env vars are missing, displays setup instructions and offers
// a Local Demo Mode so the platform works immediately without crashing.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ResqRole } from '../lib/supabase';
import {
  Shield,
  Phone,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  Database,
  Play,
} from 'lucide-react';

type LoginStep = 'choose' | 'email-signin' | 'email-signup' | 'phone-enter' | 'phone-verify';

export function LoginPage() {
  const {
    user,
    isConfigured,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    requestOtp,
    confirmOtp,
    enterDemoMode,
    loading,
    error,
    notice,
    clearError,
    clearNotice,
  } = useAuth();

  const [step, setStep]               = useState<LoginStep>('choose');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [fullName, setFullName]       = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [otpCode, setOtpCode]         = useState('');
  const [sendingOtp, setSendingOtp]   = useState(false);

  // Redirect immediately if already signed in
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) return;
    await loginWithEmail(email.trim(), password);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) return;
    await registerWithEmail(email.trim(), password, fullName);
  };

  const handleSendOtp = async () => {
    if (phoneNumber.trim().length < 10) return;
    setSendingOtp(true);
    clearError();
    try {
      const ok = await requestOtp(phoneNumber.trim());
      if (ok) {
        setStep('phone-verify');
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    clearError();
    await confirmOtp(otpCode);
  };

  const switchStep = (next: LoginStep) => {
    clearError();
    clearNotice();
    setStep(next);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 -z-10" />
      <div
        className="fixed inset-0 opacity-[0.03] -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="w-full max-w-md space-y-4">
        {/* ── Header Branding ──────────────────────────────────────────── */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">RESQ Platform</h1>
          <p className="text-sm text-slate-500 mt-1">National Emergency Response System · Supabase Backend</p>
        </div>

        {/* ── Supabase Setup Warning + Local Demo Fallback (when .env missing) ─ */}
        {!isConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-start gap-2.5">
              <Database className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              <div className="space-y-1 text-xs text-amber-900">
                <div className="font-bold">Supabase Credentials Not Configured Yet</div>
                <p className="text-amber-800 leading-relaxed">
                  Add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> and{' '}
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_ANON_KEY</code> to a{' '}
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> file (see{' '}
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.example</code>) and run{' '}
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">supabase/schema.sql</code>.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/80 space-y-2">
              <div className="text-[11px] font-mono uppercase font-bold text-amber-800 flex items-center gap-1.5">
                <Play className="w-3 h-3" />
                Quick Local Demo Mode (No Backend Needed):
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { role: 'citizen', label: '🛡️ Citizen' },
                    { role: 'authority', label: '⚡ Authority' },
                    { role: 'admin', label: '👑 Admin' },
                  ] as Array<{ role: ResqRole; label: string }>
                ).map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => enterDemoMode(item.role)}
                    className="py-2 px-2 bg-white hover:bg-amber-100/70 border border-amber-300 rounded-lg text-xs font-bold text-slate-900 transition-colors shadow-xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Login Card ───────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-b border-red-100 px-5 py-3 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 flex-1">{error}</p>
              <button onClick={clearError} className="text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Success / Info Notice */}
          {notice && (
            <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-3 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-800 flex-1">{notice}</p>
              <button onClick={clearNotice} className="text-emerald-500 hover:text-emerald-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-5">
            {/* ── Step: Choose Login Method ──────────────────────────────── */}
            {step === 'choose' && (
              <>
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-slate-900">Sign in to continue</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Powered by Supabase Auth · Email, Google OAuth, or Phone OTP
                  </p>
                </div>

                {/* Email Sign-In Button */}
                <button
                  onClick={() => switchStep('email-signin')}
                  disabled={loading || !isConfigured}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  Sign in with Email & Password
                </button>

                {/* Google Sign-In Button */}
                <button
                  onClick={loginWithGoogle}
                  disabled={loading || !isConfigured}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-slate-400 font-medium uppercase tracking-wider">or</span>
                  </div>
                </div>

                {/* Phone OTP Button */}
                <button
                  onClick={() => switchStep('phone-enter')}
                  disabled={loading || !isConfigured}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-200/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Phone className="w-4 h-4" />
                  Sign in with Phone OTP
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => switchStep('email-signup')}
                    disabled={loading || !isConfigured}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium underline underline-offset-2 disabled:opacity-50"
                  >
                    New to RESQ? Create an account
                  </button>
                </div>
              </>
            )}

            {/* ── Step: Email & Password Sign-In ────────────────────────── */}
            {step === 'email-signin' && (
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <button
                    type="button"
                    onClick={() => switchStep('choose')}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 mb-4"
                  >
                    ← Back to login options
                  </button>
                  <h2 className="text-lg font-semibold text-slate-900">Email Sign In</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your registered email and password
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim() || password.length < 6}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => switchStep('email-signup')}
                    className="text-xs text-slate-500 hover:text-slate-900 font-medium"
                  >
                    Need an account? Sign up
                  </button>
                </div>
              </form>
            )}

            {/* ── Step: Email & Password Sign-Up ────────────────────────── */}
            {step === 'email-signup' && (
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div>
                  <button
                    type="button"
                    onClick={() => switchStep('choose')}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 mb-4"
                  >
                    ← Back to login options
                  </button>
                  <h2 className="text-lg font-semibold text-slate-900">Create RESQ Account</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Register a new account with Citizen access
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Aarav Sharma"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password (min 6 chars)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim() || password.length < 6}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => switchStep('email-signin')}
                    className="text-xs text-slate-500 hover:text-slate-900 font-medium"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            )}

            {/* ── Step: Enter Phone Number ──────────────────────────────── */}
            {step === 'phone-enter' && (
              <>
                <div>
                  <button
                    onClick={() => switchStep('choose')}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 mb-4"
                  >
                    ← Back to login options
                  </button>
                  <h2 className="text-lg font-semibold text-slate-900">Phone Verification</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your phone number with country code (e.g., +919876543210)
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={handleSendOtp}
                    disabled={sendingOtp || phoneNumber.length < 10}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* ── Step: Verify OTP Code ─────────────────────────────────── */}
            {step === 'phone-verify' && (
              <>
                <div>
                  <button
                    onClick={() => { switchStep('phone-enter'); setOtpCode(''); }}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 mb-4"
                  >
                    ← Change phone number
                  </button>
                  <h2 className="text-lg font-semibold text-slate-900">Enter Verification Code</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <p className="text-xs text-slate-500">
                      OTP sent to <strong className="text-slate-900">{phoneNumber}</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      6-Digit Code
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-center tracking-[0.5em] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otpCode.length !== 6}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="w-full text-xs text-slate-500 hover:text-slate-700 font-medium py-2"
                  >
                    {sendingOtp ? 'Resending...' : "Didn't receive it? Resend OTP"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Role info footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              New users are assigned the <strong className="text-slate-600">Citizen</strong> role by default.
              Contact your administrator for <strong className="text-slate-600">Authority</strong> or{' '}
              <strong className="text-slate-600">Admin</strong> access.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 mt-4 font-mono">
          RESQ Platform · National Emergency Response System v2.4.1
        </p>
      </div>
    </div>
  );
}
