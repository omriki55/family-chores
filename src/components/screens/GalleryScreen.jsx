import { useState } from 'react';
import { FAMILY, CH, DEFAULT_BADGES, LEVELS } from '../../constants.js';
import { t } from '../../i18n/index.js';

export default function GalleryScreen({ S, app }) {
  const { tasks, completions, cKey, wk, earnedBadges, totalXpEarned, xp, getLevel, setScreen, avatars } = app;

  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('week');

  // Build timeline items from completions
  const timeline = [];

  // Completed tasks with photos
  Object.entries(completions).forEach(([key, comp]) => {
    if (!comp?.approved) return;
    const parts = key.split('_');
    if (parts.length < 4) return;
    const tid = parts.slice(1, -2).join('_');
    const cid = parts[parts.length - 2];
    if (filter !== 'all' && cid !== filter) return;

    const task = tasks.find(t => t.id === tid);
    if (!task) return;

    timeline.push({
      type: 'task',
      ts: comp.ts || 0,
      task,
      cid,
      photo: comp.photo,
      timerBonus: comp.timerBonus,
    });
  });

  // Badge earned events
  CH.forEach(cid => {
    if (filter !== 'all' && cid !== filter) return;
    (earnedBadges[cid] || []).forEach(b => {
      const badge = DEFAULT_BADGES.find(x => x.id === (b.id || b));
      if (badge) {
        timeline.push({ type: 'badge', ts: b.ts || 0, badge, cid });
      }
    });
  });

  // Sort by time, newest first
  timeline.sort((a, b) => b.ts - a.ts);

  // Time filter
  const now = Date.now();
  const filtered = timeline.filter(item => {
    if (timeRange === 'week') return now - item.ts < 7 * 86400000;
    if (timeRange === 'month') return now - item.ts < 30 * 86400000;
    return true;
  });

  // Stats
  const photoCount = filtered.filter(i => i.type === 'task' && i.photo).length;
  const taskCount = filtered.filter(i => i.type === 'task').length;
  const badgeCount = filtered.filter(i => i.type === 'badge').length;

  return (
    <>
      <button onClick={() => setScreen("badges")} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 11, cursor: "pointer", marginBottom: 8, fontWeight: 600 }}>
        {t("gallery.back")}
      </button>

      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", textAlign: "center", marginBottom: 12 }}>{t("gallery.title")}</div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        <button onClick={() => setFilter('all')}
          style={{ flex: 1, padding: "5px 4px", fontSize: 10, fontWeight: 600, borderRadius: 8, cursor: "pointer",
            border: filter === 'all' ? "2px solid #6366f1" : "1px solid var(--border)", background: filter === 'all' ? "#6366f120" : "var(--barBg)", color: filter === 'all' ? "#6366f1" : "var(--textTer)" }}>
          {t("gallery.all")}
        </button>
        {CH.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{ flex: 1, padding: "5px 4px", fontSize: 10, fontWeight: 600, borderRadius: 8, cursor: "pointer",
              border: filter === c ? `2px solid ${FAMILY[c].color}` : "1px solid var(--border)", background: filter === c ? FAMILY[c].color + "20" : "var(--barBg)", color: filter === c ? FAMILY[c].color : "var(--textTer)" }}>
            {avatars?.[c]?.value || FAMILY[c].emoji}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {[{ id: 'week', l: t("gallery.week") }, { id: 'month', l: t("gallery.month") }, { id: 'all', l: t("gallery.allTime") }].map(r => (
          <button key={r.id} onClick={() => setTimeRange(r.id)}
            style={{ flex: 1, padding: "5px 4px", fontSize: 10, fontWeight: 600, borderRadius: 8, cursor: "pointer",
              border: timeRange === r.id ? "2px solid #f59e0b" : "1px solid var(--border)", background: timeRange === r.id ? "#f59e0b20" : "var(--barBg)", color: timeRange === r.id ? "#f59e0b" : "var(--textTer)" }}>
            {r.l}
          </button>
        ))}
      </div>

      {/* Stats summary */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <div style={{ flex: 1, background: "var(--card)", borderRadius: 10, padding: 8, border: "1px solid var(--border)", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>{taskCount}</div>
          <div style={{ fontSize: 9, color: "var(--textSec)" }}>{t("gallery.tasksCount")}</div>
        </div>
        <div style={{ flex: 1, background: "var(--card)", borderRadius: 10, padding: 8, border: "1px solid var(--border)", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#6366f1" }}>{photoCount}</div>
          <div style={{ fontSize: 9, color: "var(--textSec)" }}>{t("gallery.photosCount")}</div>
        </div>
        <div style={{ flex: 1, background: "var(--card)", borderRadius: 10, padding: 8, border: "1px solid var(--border)", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b" }}>{badgeCount}</div>
          <div style={{ fontSize: 9, color: "var(--textSec)" }}>{t("gallery.badgesCount")}</div>
        </div>
      </div>

      {/* Timeline */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 30, color: "var(--textSec)" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📸</div>
          <div style={{ fontSize: 12 }}>{t("gallery.noActivity")}</div>
        </div>
      )}

      {filtered.slice(0, 50).map((item, i) => {
        const m = FAMILY[item.cid];
        const timeStr = item.ts ? new Date(item.ts).toLocaleString('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

        if (item.type === 'badge') {
          return (
            <div key={`b${i}`} style={{ background: "linear-gradient(135deg,#fef3c7,#fffbeb)", borderRadius: 12, padding: 12, marginBottom: 6, border: "1px solid #f59e0b60", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>{item.badge.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{t("gallery.earned",{name:m?.name,badge:item.badge.title})}</div>
                <div style={{ fontSize: 9, color: "#92400e" }}>{item.badge.desc}</div>
                <div style={{ fontSize: 8, color: "var(--textTer)" }}>{timeStr}</div>
              </div>
            </div>
          );
        }

        return (
          <div key={`t${i}`} style={{ background: "var(--card)", borderRadius: 12, padding: 10, marginBottom: 4, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{item.task.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{item.task.title}</span>
                  {item.timerBonus && <span style={{ fontSize: 8, color: "#0ea5e9", fontWeight: 700, background: "#0ea5e910", padding: "1px 4px", borderRadius: 4 }}>⏱️ בזמן!</span>}
                </div>
                <div style={{ fontSize: 9, color: m?.color || "var(--textSec)" }}>
                  {avatars?.[item.cid]?.value || m?.emoji} {m?.name} • +{item.task.weight}XP • {timeStr}
                </div>
              </div>
            </div>
            {item.photo && (
              <div style={{ marginTop: 6 }}>
                <img src={item.photo} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8 }} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
