// ═══════════════════════════════════════════
// Firebase App Initialization (shared module)
// ═══════════════════════════════════════════
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Enable offline persistence (data available when no internet)
try {
  enableIndexedDbPersistence(db);
} catch (e) {
  if (e.code === 'failed-precondition') {
    console.warn('Firestore persistence: multiple tabs open');
  } else if (e.code === 'unimplemented') {
    console.warn('Firestore persistence: browser not supported');
  }
}
