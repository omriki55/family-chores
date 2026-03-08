import React from "react";
import { FAMILY, CH } from "../../constants.js";

export default function WeeklySummaryModal({ S, app }) {
  const { showSummaryModal, setShowSummaryModal, weeklySummaryData } = app;
  if (!showSummaryModal || !weeklySummaryData) return null;

  return (
    <div style={S.ov} onClick={() => setShowSummaryModal(false)}>
      <div style={{ ...S.md, maxWidth: 340 }} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="סיכום שבועי">
        <h3 style={S.mt}>📊 סיכום שבועי</h3>
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 4 }}>{weeklySummaryData.completionPct >= 80 ? "🏆" : weeklySummaryData.completionPct >= 50 ? "👍" : "💪"}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: weeklySummaryData.completionPct >= 80 ? "#10b981" : "#f59e0b", textAlign: "center" }}>{weeklySummaryData.completionPct}%</div>
        <div style={{ fontSize: 11, color: "var(--textTer)", textAlign: "center", marginBottom: 12 }}>השלמה משפחתית</div>
        {CH.map(cid => { const cd = weeklySummaryData.perChild.find(p => p.cid === cid); if (!cd) return null;
          return <div key={cid} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: 16 }}>{FAMILY[cid]?.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: FAMILY[cid]?.color }}>{FAMILY[cid]?.name}</div>
              <div style={{ fontSize: 9, color: "var(--textSec)" }}>{cd.pct}% • {cd.earned}₪</div>
            </div>
            <div style={{ width: 50, height: 6, background: "var(--barBg)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${cd.pct}%`, background: FAMILY[cid]?.color, borderRadius: 3 }} />
            </div>
          </div>; })}
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 12, padding: 10, background: "var(--inputBg)", borderRadius: 10 }}>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 800, color: "#6366f1" }}>{weeklySummaryData.totalXp}</div><div style={{ fontSize: 8, color: "var(--textSec)" }}>XP</div></div>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 800, color: "#f59e0b" }}>🔥 {weeklySummaryData.familyStreak}</div><div style={{ fontSize: 8, color: "var(--textSec)" }}>רצף</div></div>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 14 }}>{FAMILY[weeklySummaryData.leading]?.emoji}</div><div style={{ fontSize: 8, color: "var(--textSec)" }}>מוביל/ה</div></div>
        </div>
        <button onClick={() => setShowSummaryModal(false)} style={{ ...S.mc, marginTop: 10 }}>סגור</button>
      </div>
    </div>
  );
}
