// ═══════════════════════════════════════════
// Storage Layer - swap this file for Firebase
// ═══════════════════════════════════════════
// Current: localStorage (offline, per-device)
// Future:  Firebase Firestore (realtime sync)
// ═══════════════════════════════════════════

const PREFIX = 'family-chores_';

const storage = {
  async get(key) {
    try {
      const val = localStorage.getItem(PREFIX + key);
      if (val === null) return null;
      return { key, value: val };
    } catch {
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, value);
      return { key, value };
    } catch {
      return null;
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: true };
    } catch {
      return null;
    }
  },

  async list(prefix = '') {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(PREFIX + prefix)) {
          keys.push(k.slice(PREFIX.length));
        }
      }
      return { keys, prefix };
    } catch {
      return { keys: [], prefix };
    }
  }
};

export default storage;
