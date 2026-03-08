import { useState } from 'react';
import { FAMILY, CH, LEVELS, DEFAULT_BADGES } from '../../constants.js';
import { t } from '../../i18n/index.js';

const AVATAR_EMOJIS = ["🧒","👦","👧","👨","👩","🧑","👶","🤴","👸","🦸","🧙","🧝","🧚","🦹","🥷","👨‍🎓","👩‍🎓","🧑‍🚀","👨‍🍳","🧑‍🎤","🧑‍💻","🧑‍🔬","🧑‍🎨","🧑‍🏫","🦊","🐱","🐶","🐼","🐨","🐸","🦁","🐯","🐻","🦄","🐙","🐳","🦋","🐉","🌟","🌈"];

export default function ProfileScreen({ S, app }) {
  const {
    user, isP, tasks, completions, cKey, wk, xp, streaks,
    getLevel, getNextLevel, getXpProgress, getWeekStats,
    earnedBadges, totalXpEarned, approvedCount,
    avatars, setAvatar, profileChild,
    setScreen,
  } = app;

  const cid = profileChild || user;
  const m = FAMILY[cid];
  if (!m) return null;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const lv = getLevel(cid);
  const nxt = getNextLevel(cid);
  const progress = getXpProgress(cid);
  const st = getWeekStats(cid);
  const myBadges = earnedBadges[cid] || [];
  const totalXp = totalXpEarned[cid] || 0;
  const totalApproved = approvedCount[cid] || 0;
  const streak = streaks[cid] || 0;
  const currentAvatar = avatars?.[cid]?.value || m.emoji;

  // Recent completions
  const recentComps = [];
  for (let d = 6; d >= 0; d--) {
    tasks.forEach(t => {
      const k = cKey(t.id, cid, d);
      const c = completions[k];
      if (c?.approved) {
        recentComps.push({ task: t, day: d, ts: c.ts });
      }
    });
  }
  recentComps.sort((a, b) => (b.ts || 0) - (a.ts || 0));

  return (
    <>
      {/* Back button */}
      <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 11, cursor: "pointer", marginBottom: 8, fontWeight: 600 }}>
        {t("profile.back")}
      </button>

      {/* Avatar & Name */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{ fontSize: 64, lineHeight: 1 }}>{currentAvatar}</div>
          {(isP || cid === user) && (
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{ position: "absolute", bottom: -4, right: -4, width: 28, height: 28, background: "#6366f1", border: "2px solid #fff", borderRadius: 14, color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              ✏️
            </button>
          )}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginTop: 4 }}>{m.name}</div>
        <div style={{ fontSize: 12, color: "#6366f1" }}>{lv.emoji} {lv.name}</div>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div style={{ background: "var(--card)", borderRadius: 14, padding: 12, marginBottom: 14, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{t("profile.chooseAvatar")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {AVATAR_EMOJIS.map(em => (
              <button key={em} onClick={() => { setAvatar(cid, { type: "emoji", value: em }); setShowEmojiPicker(false); }}
                style={{ width: 36, height: 36, fontSize: 20, background: currentAvatar === em ? "#6366f120" : "var(--barBg)", border: currentAvatar === em ? "2px solid #6366f1" : "1px solid var(--border)", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {em}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* XP & Level card */}
      <div style={{ background: `linear-gradient(135deg,${m.color}15,${m.color}08)`, borderRadius: 14, padding: 14, marginBottom: 10, border: `1px solid ${m.color}40` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 30 }}>{lv.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{lv.name}</div>
            <div style={{ fontSize: 10, color: "#6366f1" }}>{xp[cid] || 0} XP {nxt ? `• ${t("home.xpMore",{amount:nxt.min-(xp[cid]||0),name:nxt.name})}` : `• ${t("profile.maximum")}`}</div>
          </div>
        </div>
        <div style={{ height: 8, background: "var(--barBg)", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: 4, transition: "width 0.5s" }} />
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
        {[
          { label: t("profile.tasks"), value: totalApproved, icon: "✅", color: "#10b981" },
          { label: t("profile.streak"), value: streak, icon: "🔥", color: "#f59e0b" },
          { label: t("profile.badges"), value: myBadges.length, icon: "🏅", color: "#8b5cf6" },
          { label: t("profile.totalXp"), value: totalXp, icon: "⭐", color: "#6366f1" },
          { label: t("profile.weeklyPct"), value: st.pct + "%", icon: "📊", color: "#0ea5e9" },
          { label: t("profile.level"), value: LEVELS.indexOf(lv) + 1, icon: lv.emoji, color: m.color },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--card)", borderRadius: 10, padding: 10, border: "1px solid var(--border)", textAlign: "center" }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "var(--textSec)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      {myBadges.length > 0 && (
        <div style={{ background: "var(--card)", borderRadius: 14, padding: 12, marginBottom: 14, border: "1px solid #f59e0b40" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{t("profile.earnedBadges",{count:myBadges.length})}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {myBadges.map(b => {
              const badge = DEFAULT_BADGES.find(x => x.id === (b.id || b));
              if (!badge) return null;
              return (
                <div key={b.id || b} style={{ background: "var(--barBg)", borderRadius: 10, padding: "6px 10px", textAlign: "center", minWidth: 60 }}>
                  <div style={{ fontSize: 22 }}>{badge.emoji}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "var(--text)" }}>{badge.title}</div>
                  {b.ts > 0 && <div style={{ fontSize: 8, color: "var(--textTer)" }}>{new Date(b.ts).toLocaleDateString('he-IL')}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div style={{ background: "var(--card)", borderRadius: 14, padding: 12, marginBottom: 14, border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{t("profile.recentActivity")}</div>
        {recentComps.length === 0 && <div style={{ fontSize: 10, color: "var(--textSec)", textAlign: "center", padding: 8 }}>{t("profile.noActivity")}</div>}
        {recentComps.slice(0, 15).map((rc, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 14 }}>{rc.task.icon}</span>
            <span style={{ fontSize: 11, color: "var(--text)", flex: 1 }}>{rc.task.title}</span>
            <span style={{ fontSize: 9, color: "#10b981", fontWeight: 600 }}>+{rc.task.weight}XP</span>
            {rc.ts && <span style={{ fontSize: 8, color: "var(--textTer)" }}>{new Date(rc.ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>}
          </div>
        ))}
      </div>

      {/* Level roadmap */}
      <div style={{ background: "var(--card)", borderRadius: 14, padding: 12, border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{t("profile.levelMap")}</div>
        {LEVELS.map((l, i) => {
          const reached = (xp[cid] || 0) >= l.min;
          const current = lv.min === l.min;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", opacity: reached ? 1 : 0.5 }}>
              <span style={{ fontSize: 16 }}>{l.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: current ? 800 : 400, color: current ? m.color : "var(--text)", flex: 1 }}>{l.name}</span>
              <span style={{ fontSize: 9, color: "var(--textTer)" }}>{l.min} XP</span>
              {reached && <span style={{ fontSize: 10, color: "#10b981" }}>✅</span>}
            </div>
          );
        })}
      </div>
    </>
  );
}
