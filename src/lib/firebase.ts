// ─────────────────────────────────────────────────────────────────────────────
// RESQ Platform · Firebase Configuration & Initialization
// ─────────────────────────────────────────────────────────────────────────────
// Initializes Firebase Auth (Google + Phone OTP) and Firestore.
// All Firebase env vars should be set in .env (see .env.example).
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type ConfirmationResult,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

// ── Firebase Project Config (from environment variables) ─────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// ── Initialize Firebase (singleton-safe) ─────────────────────────────────────
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db   = getFirestore(app);

// ── Auth Providers ───────────────────────────────────────────────────────────
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ── Google Sign-In ───────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(result.user);
  return result.user;
}

// ── Phone OTP Sign-In ────────────────────────────────────────────────────────
let appVerifier: RecaptchaVerifier | null = null;

/**
 * Sets up the invisible reCAPTCHA verifier on the given button element.
 * Must be called once before `sendOtp()`.
 */
export function setupRecaptcha(buttonId: string) {
  if (appVerifier) return; // already set up
  appVerifier = new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved – will proceed with sendOtp
    },
  });
}

/**
 * Sends an OTP to the given phone number (E.164 format, e.g. "+919876543210").
 * Returns a ConfirmationResult to verify the code later.
 */
export async function sendOtp(phoneNumber: string): Promise<ConfirmationResult> {
  if (!appVerifier) {
    throw new Error('RecaptchaVerifier not initialized. Call setupRecaptcha() first.');
  }
  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  return confirmation;
}

/**
 * Verifies the 6-digit OTP code the user received.
 */
export async function verifyOtp(confirmationResult: ConfirmationResult, code: string) {
  const result = await confirmationResult.confirm(code);
  await ensureUserProfile(result.user);
  return result.user;
}

// ── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOutUser() {
  await firebaseSignOut(auth);
}

// ── User Profile Bootstrap ───────────────────────────────────────────────────
/**
 * On first sign-in, creates a Firestore user profile doc at /users/{uid}
 * with a default role of "citizen". Subsequent logins skip creation.
 */
async function ensureUserProfile(user: User) {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email ?? null,
      phone: user.phoneNumber ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      role: 'citizen',                  // default role for new users
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  } else {
    // Update last login
    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
  }
}

// ── Custom Claims Helper ─────────────────────────────────────────────────────
export type ResqRole = 'citizen' | 'authority' | 'admin';

/**
 * Reads the user's role from their Firebase ID token custom claims.
 * Falls back to 'citizen' when no claim is set yet.
 */
export async function getUserRole(user: User): Promise<ResqRole> {
  const tokenResult = await user.getIdTokenResult(/* forceRefresh */ true);
  return (tokenResult.claims.role as ResqRole) ?? 'citizen';
}

// ── Re-exports for convenience ───────────────────────────────────────────────
export { onAuthStateChanged };
export type { User, ConfirmationResult };

