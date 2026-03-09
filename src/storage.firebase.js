// ═══════════════════════════════════════════
// Storage Layer - Firebase Firestore
// ═══════════════════════════════════════════
// Same async API as storage.js (localStorage)
// + onDataChange for realtime sync
// + setCollection for family-specific paths
// ═══════════════════════════════════════════

import { db } from './firebase.js';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';

let COLLECTION = 'family-chores';
const LS_PREFIX = 'family-chores_';

const storage = {
  // Set collection path (e.g., 'families/ABC123/data')
  setCollection(path) {
    COLLECTION = path;
  },

  getCollection() {
    return COLLECTION;
  },

  async get(key) {
    try {
      const docRef = doc(db, COLLECTION, key);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        // Fallback: try localStorage
        const ls = localStorage.getItem(LS_PREFIX + key);
        if (ls) return { key, value: ls };
        return null;
      }
      return { key, value: docSnap.data().value };
    } catch (e) {
      console.error('Firebase get error:', e);
      // Fallback: try localStorage when Firestore is unavailable
      try {
        const ls = localStorage.getItem(LS_PREFIX + key);
        if (ls) return { key, value: ls };
      } catch {}
      return null;
    }
  },

  async set(key, value) {
    // Always write to localStorage as backup
    try { localStorage.setItem(LS_PREFIX + key, value); } catch {}
    try {
      const docRef = doc(db, COLLECTION, key);
      await setDoc(docRef, { value, updatedAt: new Date().toISOString() });
      return { key, value };
    } catch (e) {
      console.error('Firebase set error:', e);
      // Return success from localStorage fallback
      return { key, value };
    }
  },

  async delete(key) {
    try {
      const docRef = doc(db, COLLECTION, key);
      await deleteDoc(docRef);
      return { key, deleted: true };
    } catch (e) {
      console.error('Firebase delete error:', e);
      return null;
    }
  },

  async list(prefix = '') {
    try {
      const colRef = collection(db, COLLECTION);
      const snapshot = await getDocs(colRef);
      const keys = [];
      snapshot.forEach(d => {
        if (d.id.startsWith(prefix)) keys.push(d.id);
      });
      return { keys, prefix };
    } catch (e) {
      console.error('Firebase list error:', e);
      return { keys: [], prefix };
    }
  },

  // Check if a collection exists (for "join family" verification)
  async exists(collectionPath, docKey) {
    try {
      const docRef = doc(db, collectionPath, docKey);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (e) {
      console.error('Firebase exists error:', e);
      return false;
    }
  },

  // Realtime listener — returns unsubscribe function
  onDataChange(key, callback) {
    const docRef = doc(db, COLLECTION, key);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().value);
      }
    }, (err) => {
      console.error('Firebase onDataChange error:', err);
    });
  }
};

export default storage;
