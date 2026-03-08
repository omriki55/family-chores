// ═══════════════════════════════════════════
// Auth Layer — Google Auth + Family Code
// ═══════════════════════════════════════════
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase.js';

let auth;
let googleProvider;

try {
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (e) {
  console.warn('Auth init skipped (Firebase not configured):', e.message);
}

/**
 * Sign in with Google — returns user object or null
 */
export async function signInWithGoogle() {
  if (!auth || !googleProvider) { console.warn('Auth not available'); return null; }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (e) {
    console.error('Google sign-in error:', e);
    return null;
  }
}

/**
 * Sign out
 */
export async function signOut() {
  if (!auth) return;
  try { await fbSignOut(auth); } catch (e) { console.error('Sign-out error:', e); }
}

/**
 * Listen for auth state changes
 * @param {Function} callback - called with user object or null
 * @returns {Function} unsubscribe
 */
export function onAuthChange(callback) {
  if (!auth) { callback(null); return () => {}; }
  return onAuthStateChanged(auth, callback);
}

/**
 * Generate a 6-character family code
 */
export function generateFamilyCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export { auth };
