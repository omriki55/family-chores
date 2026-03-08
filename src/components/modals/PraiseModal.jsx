import React from "react";
import { FAMILY } from "../../constants.js";

export default function PraiseModal({ S, app }) {
  const { praiseModal, setPraiseModal, praiseText, setPraiseText, praiseStar, setPraiseStar, submitPraise, approve, tasks } = app;
  if (!praiseModal) return null;

  return (
    <div style={S.ov} onClick={() => setPraiseModal(null)}>
      <div style={S.md} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="שליחת שבח">
        <h3 style={S.mt}>{praiseStar || "👍"} שבח ל{FAMILY[praiseModal.childId]?.name}</h3>
        <p style={{ color: "var(--textTer)", fontSize: 11, textAlign: "center", margin: "0 0 10px" }}>
          {tasks.find(t => t.id === praiseModal.taskId)?.icon} {tasks.find(t => t.id === praiseModal.taskId)?.title}
        </p>
        <input style={S.inp} placeholder="כתוב/י מילה טובה..." value={praiseText} onChange={e => setPraiseText(e.target.value)} />
        <div style={{ display: "flex", gap: 6, marginBottom: 10, justifyContent: "center" }}>
          {["⭐", "🌟", "💪", "🏆", "❤️", "👏"].map(s => (
            <button key={s} onClick={() => setPraiseStar(praiseStar === s ? null : s)}
              style={{ width: 36, height: 36, fontSize: 18, background: praiseStar === s ? "#f59e0b20" : "var(--barBg)", border: praiseStar === s ? "2px solid #f59e0b" : "1px solid var(--border)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{s}</button>
          ))}
        </div>
        <button onClick={submitPraise}
          style={{ width: "100%", padding: 10, background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 5 }}>
          ✅ אשר{praiseText.trim() ? " ושלח" : ""}
        </button>
        <button onClick={() => { approve(praiseModal.taskId, praiseModal.childId, praiseModal.day); setPraiseModal(null); }}
          style={{ width: "100%", padding: 7, background: "var(--inputBg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--textTer)", fontSize: 10, cursor: "pointer", marginBottom: 5 }}>
          אשר בלי הודעה
        </button>
        <button onClick={() => setPraiseModal(null)} style={S.mc}>ביטול</button>
      </div>
    </div>
  );
}
