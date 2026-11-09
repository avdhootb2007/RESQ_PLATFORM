// ─────────────────────────────────────────────────────────────────────────────
// RESQ Platform · Firebase Cloud Functions (Admin SDK)
// ─────────────────────────────────────────────────────────────────────────────
// Deploy these to Firebase Cloud Functions to manage custom claims (roles).
//
// Usage:
//   cd functions
//   npm install
//   npx firebase deploy --only functions
//
// ─────────────────────────────────────────────────────────────────────────────

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// ── Valid roles for RESQ Platform ────────────────────────────────────────────
const VALID_ROLES = ['citizen', 'authority', 'admin'] as const;
type ResqRole = typeof VALID_ROLES[number];

// ─────────────────────────────────────────────────────────────────────────────
// setUserRole — Callable Cloud Function
// ─────────────────────────────────────────────────────────────────────────────
// Only users with the "admin" custom claim can invoke this function.
//
// Input:  { targetUid: string, role: 'citizen' | 'authority' | 'admin' }
// Output: { success: true, message: '...' }
// ─────────────────────────────────────────────────────────────────────────────
export const setUserRole = functions.https.onCall(async (data, context) => {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be signed in to set user roles.'
    );
  }

  // ── Admin-only guard ───────────────────────────────────────────────────────
  const callerRole = context.auth.token.role as string | undefined;
  if (callerRole !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only administrators can assign user roles.'
    );
  }

  // ── Validate input ────────────────────────────────────────────────────────
  const { targetUid, role } = data;

  if (!targetUid || typeof targetUid !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'targetUid (string) is required.'
    );
  }

  if (!role || !VALID_ROLES.includes(role as ResqRole)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `role must be one of: ${VALID_ROLES.join(', ')}`
    );
  }

  // ── Set custom claim ──────────────────────────────────────────────────────
  try {
    await admin.auth().setCustomUserClaims(targetUid, { role });

    // Also update the Firestore user profile for consistency
    await admin.firestore().doc(`users/${targetUid}`).set(
      { role, roleUpdatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

    return {
      success: true,
      message: `User ${targetUid} has been assigned the "${role}" role.`,
    };
  } catch (error: any) {
    console.error('Error setting custom claims:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to set role: ${error.message}`
    );
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// onUserCreated — Auth Trigger
// ─────────────────────────────────────────────────────────────────────────────
// When a new user signs up, automatically assign the "citizen" role claim
// and create their Firestore profile if it doesn't already exist.
// ─────────────────────────────────────────────────────────────────────────────
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    // Set default custom claims
    await admin.auth().setCustomUserClaims(user.uid, { role: 'citizen' });

    // Ensure Firestore profile exists
    const userRef = admin.firestore().doc(`users/${user.uid}`);
    const snap = await userRef.get();

    if (!snap.exists) {
      await userRef.set({
        uid: user.uid,
        email: user.email ?? null,
        phone: user.phoneNumber ?? null,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        role: 'citizen',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    console.log(`New user ${user.uid} assigned default "citizen" role.`);
  } catch (error) {
    console.error('Error in onUserCreated trigger:', error);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// bootstrapAdmin — HTTP Function (one-time use)
// ─────────────────────────────────────────────────────────────────────────────
// Call this once to promote the first user to admin. Pass the user's UID
// as a query parameter:  GET /bootstrapAdmin?uid=XXXXX&secret=YOUR_SECRET
//
// Set the BOOTSTRAP_SECRET in your Firebase environment:
//   firebase functions:config:set resq.bootstrap_secret="your-strong-secret"
//
// DELETE THIS FUNCTION after bootstrapping your first admin.
// ─────────────────────────────────────────────────────────────────────────────
export const bootstrapAdmin = functions.https.onRequest(async (req, res) => {
  const { uid, secret } = req.query;
  const expectedSecret = functions.config().resq?.bootstrap_secret;

  if (!expectedSecret || secret !== expectedSecret) {
    res.status(403).json({ error: 'Invalid or missing bootstrap secret.' });
    return;
  }

  if (!uid || typeof uid !== 'string') {
    res.status(400).json({ error: 'uid query parameter is required.' });
    return;
  }

  try {
    await admin.auth().setCustomUserClaims(uid as string, { role: 'admin' });
    await admin.firestore().doc(`users/${uid}`).set(
      { role: 'admin', roleUpdatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

    res.json({
      success: true,
      message: `User ${uid} is now an admin. DELETE this function after use!`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

