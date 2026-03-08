// ═══════════════════════════════════════════
// Storage Layer - Firebase Firestore
// ═══════════════════════════════════════════
// סנכרון בזמן אמת בין כל המכשירים!
//
// שלבים להפעלה:
// 1. npm install firebase
// 2. צור פרויקט ב-console.firebase.google.com
// 3. הפעל Firestore Database (test mode)
// 4. העתק את הקונפיגורציה שלך למטה
// 5. שנה את שם הקובץ הזה ל-storage.js
// ═══════════════════════════════════════════

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';

// ⬇️ הדבק כאן את הקונפיגורציה מ-Firebase Console:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
      snapshot.forEach(doc => {
        if (doc.id.startsWith(prefix)) keys.push(doc.id);
      });
      return { keys, prefix };
    } catch (e) {
      console.error('Firebase list error:', e);
      return { keys: [], prefix };
    }
  },

  // ⭐ בונוס: האזנה לשינויים בזמן אמת
  // קרא לזה כדי לקבל עדכונים אוטומטיים:
  // storage.onDataChange('chores-v5', (newData) => { ... })
  onDataChange(key, callback) {
    const docRef = doc(db, COLLECTION, key);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().value);
      }
    });
  }
};

export default storage;
