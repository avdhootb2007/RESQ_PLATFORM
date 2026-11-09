// ─────────────────────────────────────────────────────────────────────────────
// RESQ Platform · Login Page
// ─────────────────────────────────────────────────────────────────────────────
// Full-screen login page with Google Sign-In and Phone OTP.
// Styled to match RESQ's enterprise design language.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  Phone,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';

type LoginStep = 'choose' | 'phone-enter' | 'phone-verify';

export function LoginPage() {
  const {
    loginWithGoogle,
    initRecaptcha,
    requestOtp,
    confirmOtp,
    loading,
    error,
    clearError,
  } = useAuth();

  const [step, setStep]             = useState<LoginStep>('choose');
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [otpCode, setOtpCode]       = useState('');
  const [otpSent, setOtpSent]       = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Initialize invisible reCAPTCHA on mount
  useEffect(() => {
    initRecaptcha('recaptcha-container');
  }, [initRecaptcha]);

  // ── Handle Phone Number Submit ─────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) return;
    setSendingOtp(true);
    clearError();
    try {
      await requestOtp(phoneNumber);
      setOtpSent(true);
      setStep('phone-verify');
    } catch {
      // Error is handled in AuthContext
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Handle OTP Verify ──────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    clearError();
    await confirmOtp(otpCode);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 -z-10" />
      <div className="fixed inset-0 opacity-[0.03] -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="w-full max-w-md">
        {/* ── Header Branding ──────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">RESQ Platform</h1>
          <p className="text-sm text-slate-500 mt-1">National Emergency Response System</p>
        </div>

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

          <div className="p-6 sm:p-8 space-y-6">

            {/* ── Step: Choose Login Method ──────────────────────────────── */}
            {step === 'choose' && (
              <>
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-slate-900">Sign in to continue</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Secure access with Google or Phone OTP verification
                  </p>
                </div>

                {/* Google Sign-In Button */}
                <button
                  onClick={loginWithGoogle}
                  disabled={loading}
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
                  onClick={() => setStep('phone-enter')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  Sign in with Phone OTP
                </button>
              </>
            )}

            {/* ── Step: Enter Phone Number ──────────────────────────────── */}
            {step === 'phone-enter' && (
              <>
                <div>
                  <button
                    onClick={() => { setStep('choose'); clearError(); }}
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
                    id="send-otp-button"
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
                    onClick={() => { setStep('phone-enter'); setOtpCode(''); clearError(); }}
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
                    {sendingOtp ? 'Resending...' : 'Didn\'t receive it? Resend OTP'}
                  </button>
                </div>
              </>
            )}

          </div>

          {/* Role info footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              New users are assigned the <strong className="text-slate-600">Citizen</strong> role by default.
              Contact your administrator for <strong className="text-slate-600">Authority</strong> or <strong className="text-slate-600">Admin</strong> access.
            </p>
          </div>
        </div>

        {/* Invisible reCAPTCHA container (required for Phone auth) */}
        <div id="recaptcha-container" />

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 mt-6 font-mono">
          RESQ Platform · National Emergency Response System v2.4.1
        </p>
      </div>
    </div>
  );
}

