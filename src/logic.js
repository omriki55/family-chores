// ═══════════════════════════════════════════
// Pure logic functions (testable, no React state)
// ═══════════════════════════════════════════

/**
 * Check if a task should appear for a given child on a given day
 * @param {Object} task - { assignedTo, bonus, type, activeDays }
 * @param {string} cid - child id
 * @param {number|string} day - day number (0-6) or date string
 * @returns {boolean}
 */
export function isTaskForChild(task, cid, day, dateStr) {
  if (!task.assignedTo || !task.assignedTo.includes(cid)) return false;
  if (task.bonus) return true;
  if (task.skippedDates && dateStr && task.skippedDates.includes(dateStr)) return false;
  if (task.activeDays) {
    const dn = typeof day === "number" ? day : new Date(day).getDay();
    if (!task.activeDays.includes(dn)) return false;
  }
  if (task.type === "shared") {
    const kids = task.assignedTo;
    return kids[(typeof day === "number" ? day : new Date(day).getDay()) % kids.length] === cid;
  }
  return true;
}

export function isRecurringTask(task) {
  return !task.bonus && Array.isArray(task.activeDays) && task.activeDays.length > 0 && task.activeDays.length < 7;
}

/**
 * Get level for a given XP value
 * @param {number} xpValue
 * @param {Array} levels - sorted by min ascending
 * @returns {Object} level object
 */
export function getLevel(xpValue, levels) {
  let lv = levels[0];
  for (const l of levels) if (xpValue >= l.min) lv = l;
  return lv;
}

/**
 * Get next level for a given XP value
 * @param {number} xpValue
 * @param {Array} levels
 * @returns {Object|null}
 */
export function getNextLevel(xpValue, levels) {
  for (const l of levels) if (xpValue < l.min) return l;
  return null;
}

/**
 * Get XP progress percentage toward next level
 * @param {number} xpValue
 * @param {Array} levels
 * @returns {number} 0-100
 */
export function getXpProgress(xpValue, levels) {
  const cur = getLevel(xpValue, levels);
  const nxt = getNextLevel(xpValue, levels);
  if (!nxt) return 100;
  return Math.round(((xpValue - cur.min) / (nxt.min - cur.min)) * 100);
}

/**
 * Check which badges a child should earn
 * @param {string} cid
 * @param {Object} streaks - { [cid]: number }
 * @param {Object} totalXp - { [cid]: number }
 * @param {Object} approvedCount - { [cid]: number }
 * @param {Array} currentEarned - array of { id, ts }
 * @param {Array} allBadges - DEFAULT_BADGES array
 * @returns {Array} newly earned badge objects [{ id, ts }]
 */
export function getNewBadges(cid, streaks, totalXp, approvedCount, currentEarned, allBadges) {
  const earned = currentEarned || [];
  const newlyEarned = [];
  for (const badge of allBadges) {
    if (earned.some(e => e.id === badge.id)) continue;
    let ok = false;
    if (badge.condition === "streak_days") ok = (streaks[cid] || 0) >= badge.value;
    else if (badge.condition === "chores_completed") ok = (approvedCount[cid] || 0) >= badge.value;
    else if (badge.condition === "total_xp_earned") ok = (totalXp[cid] || 0) >= badge.value;
    if (ok) newlyEarned.push({ id: badge.id, ts: Date.now() });
  }
  return newlyEarned;
}
