// ═══════════════════════════════════════════
// Storage Layer - Firebase Firestore
// ═══════════════════════════════════════════
// Same async API as storage.js (localStorage)
// + onDataChange for realtime sync
// ═══════════════════════════════════════════

import { db } from './firebase.js';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';

const COLLECTION = 'family-chores';

const storage = {
  async get(key) {
    try {
      const docRef = doc(db, COLLECTION, key);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return { key, value: docSnap.data().value };
    } catch (e) {
      console.error('Firebase get error:', e);
      return null;
    }
  },

  async set(key, value) {
    try {
      const docRef = doc(db, COLLECTION, key);
      await setDoc(docRef, { value, updatedAt: new Date().toISOString() });
      return { key, value };
    } catch (e) {
      console.error('Firebase set error:', e);
      return null;
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
