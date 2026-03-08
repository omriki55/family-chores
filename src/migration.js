// ═══════════════════════════════════════════
// Migration: localStorage → Firestore
// ═══════════════════════════════════════════
// Runs once on first load after Firebase is enabled.
// Reads the monolithic chores-v5 blob + other keys,
// writes each as separate Firestore documents,
// then sets a migration flag so it never runs again.
// ═══════════════════════════════════════════

import storage from './storage.firebase.js';

const STORAGE_KEYS = [
  'tasks','completions','pins','xp','streaks','goals','swaps',
  'activeReminders','messages','penalties','earnedBadges','totalXpEarned',
  'approvedCount','exams','calEvents','groceries','auditLog','challenges',
  'lastSummaryWeek','locations'
];

export async function migrateToFirestore() {
  // Check if already migrated
  if (localStorage.getItem('family-chores_migrated')) return false;

  const PREFIX = 'family-chores_';
  let migrated = false;

  try {
    // 1. Migrate the main chores-v5 blob → split into individual keys
    const blobStr = localStorage.getItem(PREFIX + 'chores-v5');
    if (blobStr) {
      const blob = JSON.parse(blobStr);
      for (const key of STORAGE_KEYS) {
        if (blob[key] !== undefined) {
          await storage.set(key, JSON.stringify(blob[key]));
        }
      }
      migrated = true;
      console.log('Migrated chores-v5 blob → individual Firestore docs');
    }

    // 2. Migrate family-config
    const familyConfig = localStorage.getItem(PREFIX + 'family-config');
    if (familyConfig) {
      await storage.set('family-config', familyConfig);
      console.log('Migrated family-config');
    }

    // 3. Migrate meals & recipes
    const meals = localStorage.getItem('family-meals');
    if (meals) await storage.set('family-meals', meals);
    const recipes = localStorage.getItem('family-recipes');
    if (recipes) await storage.set('family-recipes', recipes);

    // 4. Migrate context reminders
    const reminders = localStorage.getItem('family-context-reminders');
    if (reminders) await storage.set('family-context-reminders', reminders);

    // Mark as migrated
    localStorage.setItem('family-chores_migrated', 'true');
    console.log('Migration complete!');
    return migrated;

  } catch (e) {
    console.error('Migration error:', e);
    return false;
  }
}

export { STORAGE_KEYS };
