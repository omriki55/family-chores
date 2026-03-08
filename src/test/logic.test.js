import { describe, it, expect } from 'vitest';
import { isTaskForChild, getLevel, getNextLevel, getXpProgress, getNewBadges } from '../logic.js';

// ── Test data ──
const LEVELS = [
  { min: 0, name: "מתחיל", emoji: "🌱" },
  { min: 50, name: "חרוץ", emoji: "⭐" },
  { min: 150, name: "מומחה", emoji: "🏆" },
  { min: 300, name: "אלוף", emoji: "👑" },
];

const BADGES = [
  { id: "streak3", condition: "streak_days", value: 3, title: "סטריק 3", emoji: "🔥" },
  { id: "done10", condition: "chores_completed", value: 10, title: "10 משימות", emoji: "✅" },
  { id: "xp100", condition: "total_xp_earned", value: 100, title: "100 XP", emoji: "💯" },
];

// ═══════════════════════════════════════════
// isTaskForChild
// ═══════════════════════════════════════════
describe('isTaskForChild', () => {
  const personalTask = { id: 't1', assignedTo: ['peleg', 'yahav'], type: 'personal', bonus: false };
  const sharedTask = { id: 't2', assignedTo: ['peleg', 'yahav'], type: 'shared', bonus: false };
  const bonusTask = { id: 't3', assignedTo: ['peleg'], bonus: true };

  it('returns true for assigned personal task', () => {
    expect(isTaskForChild(personalTask, 'peleg', 0)).toBe(true);
    expect(isTaskForChild(personalTask, 'yahav', 0)).toBe(true);
  });

  it('returns false for unassigned child', () => {
    expect(isTaskForChild(personalTask, 'yahel', 0)).toBe(false);
  });

  it('rotates shared tasks based on day', () => {
    // assignedTo: ['peleg','yahav'] → day 0 → peleg, day 1 → yahav
    expect(isTaskForChild(sharedTask, 'peleg', 0)).toBe(true);
    expect(isTaskForChild(sharedTask, 'yahav', 0)).toBe(false);
    expect(isTaskForChild(sharedTask, 'yahav', 1)).toBe(true);
    expect(isTaskForChild(sharedTask, 'peleg', 1)).toBe(false);
  });

  it('always returns true for bonus tasks', () => {
    expect(isTaskForChild(bonusTask, 'peleg', 0)).toBe(true);
    expect(isTaskForChild(bonusTask, 'peleg', 5)).toBe(true);
  });

  it('returns false for bonus task if child not assigned', () => {
    expect(isTaskForChild(bonusTask, 'yahav', 0)).toBe(false);
  });

  // ── activeDays tests ──
  it('respects activeDays — task only on specific days', () => {
    const dayTask = { ...personalTask, activeDays: [0, 2, 4] }; // Sun, Tue, Thu
    expect(isTaskForChild(dayTask, 'peleg', 0)).toBe(true);  // Sunday
    expect(isTaskForChild(dayTask, 'peleg', 1)).toBe(false); // Monday
    expect(isTaskForChild(dayTask, 'peleg', 2)).toBe(true);  // Tuesday
    expect(isTaskForChild(dayTask, 'peleg', 3)).toBe(false); // Wednesday
    expect(isTaskForChild(dayTask, 'peleg', 4)).toBe(true);  // Thursday
  });

  it('activeDays null means every day', () => {
    const everyDayTask = { ...personalTask, activeDays: null };
    for (let d = 0; d < 7; d++) {
      expect(isTaskForChild(everyDayTask, 'peleg', d)).toBe(true);
    }
  });

  it('activeDays checks before shared rotation', () => {
    const dayShared = { ...sharedTask, activeDays: [1, 3] }; // Mon, Wed only
    expect(isTaskForChild(dayShared, 'peleg', 0)).toBe(false); // Sunday - not active
    expect(isTaskForChild(dayShared, 'peleg', 1)).toBe(false); // Monday - active, day%2=1 → yahav
    expect(isTaskForChild(dayShared, 'yahav', 1)).toBe(true);  // Monday - active, day%2=1 → yahav
  });
});

// ═══════════════════════════════════════════
// getLevel / getNextLevel / getXpProgress
// ═══════════════════════════════════════════
describe('getLevel', () => {
  it('returns first level for 0 XP', () => {
    expect(getLevel(0, LEVELS).name).toBe("מתחיל");
  });

  it('returns correct level for exact boundary', () => {
    expect(getLevel(50, LEVELS).name).toBe("חרוץ");
    expect(getLevel(150, LEVELS).name).toBe("מומחה");
    expect(getLevel(300, LEVELS).name).toBe("אלוף");
  });

  it('returns correct level for mid-range', () => {
    expect(getLevel(25, LEVELS).name).toBe("מתחיל");
    expect(getLevel(100, LEVELS).name).toBe("חרוץ");
    expect(getLevel(200, LEVELS).name).toBe("מומחה");
    expect(getLevel(500, LEVELS).name).toBe("אלוף");
  });
});

describe('getNextLevel', () => {
  it('returns next level for 0 XP', () => {
    expect(getNextLevel(0, LEVELS).name).toBe("חרוץ");
  });

  it('returns null when at max level', () => {
    expect(getNextLevel(300, LEVELS)).toBeNull();
    expect(getNextLevel(999, LEVELS)).toBeNull();
  });
});

describe('getXpProgress', () => {
  it('returns 0 at level start', () => {
    expect(getXpProgress(0, LEVELS)).toBe(0);
    expect(getXpProgress(50, LEVELS)).toBe(0);
  });

  it('returns 50 at midpoint', () => {
    // Level 0→50 (range 50), midpoint at 25
    expect(getXpProgress(25, LEVELS)).toBe(50);
  });

  it('returns 100 at max level', () => {
    expect(getXpProgress(300, LEVELS)).toBe(100);
    expect(getXpProgress(999, LEVELS)).toBe(100);
  });
});

// ═══════════════════════════════════════════
// getNewBadges
// ═══════════════════════════════════════════
describe('getNewBadges', () => {
  it('returns empty array when no badges earned', () => {
    const result = getNewBadges('peleg', { peleg: 0 }, { peleg: 0 }, { peleg: 0 }, [], BADGES);
    expect(result).toHaveLength(0);
  });

  it('detects streak badge', () => {
    const result = getNewBadges('peleg', { peleg: 3 }, { peleg: 0 }, { peleg: 0 }, [], BADGES);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('streak3');
  });

  it('detects multiple badges at once', () => {
    const result = getNewBadges('peleg', { peleg: 5 }, { peleg: 200 }, { peleg: 15 }, [], BADGES);
    expect(result).toHaveLength(3);
  });

  it('does not re-earn already earned badges', () => {
    const alreadyEarned = [{ id: 'streak3', ts: 1000 }];
    const result = getNewBadges('peleg', { peleg: 5 }, { peleg: 0 }, { peleg: 0 }, alreadyEarned, BADGES);
    expect(result).toHaveLength(0);
  });
});
