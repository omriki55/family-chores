import React from "react";
import { FAMILY, PENALTIES } from "../../constants.js";

export default function PenaltyModal({ S, app }) {
  const { penaltyModal, setPenaltyModal, addPenalty } = app;
  if (!penaltyModal) return null;

  return (
    <div style={S.ov} onClick={() => setPenaltyModal(null)}>
      <div style={S.md} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="הפחתת נקודות">
        <h3 style={S.mt}>⚠️ הורדת נקודות - {FAMILY[penaltyModal.childId]?.name}</h3>
        <p style={{ color: "var(--textTer)", fontSize: 11, textAlign: "center", margin: "0 0 10px" }}>בחר/י סיבה:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {PENALTIES.map(p => (
            <button key={p.id} onClick={() => addPenalty(penaltyModal.childId, p.id)}
              style={{ padding: 12, background: "#fff5f5", border: "1px solid #ef444430", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "right" }}>
              <span style={{ fontSize: 22 }}>{p.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{p.title}</div>
                <div style={{ fontSize: 10, color: "#ef4444" }}>-{p.xp} XP</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => setPenaltyModal(null)} style={{ ...S.mc, marginTop: 8 }}>ביטול</button>
      </div>
    </div>
  );
}
