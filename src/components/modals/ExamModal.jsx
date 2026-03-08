import React from "react";
import { FAMILY, CH } from "../../constants.js";

export default function ExamModal({ S, app }) {
  const { examModal, setExamModal, examScore, setExamScore, addExam, isP } = app;
  if (!examModal || !isP) return null;

  return (
    <div style={S.ov} onClick={() => { setExamModal(null); setExamScore(""); }}>
      <div style={S.md} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="הוספת ציון מבחן">
        <h3 style={S.mt}>📝 דיווח ציון מבחן</h3>
        {examModal === true ? (
          <>{/* Select child */}
            <p style={{ color: "var(--textTer)", fontSize: 11, textAlign: "center", margin: "0 0 10px" }}>בחר/י ילד/ה:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {CH.map(c => <button key={c} onClick={() => setExamModal({ childId: c })}
                style={{ padding: 12, background: "var(--barBg)", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, color: FAMILY[c].color }}>{FAMILY[c].name}</span>
              </button>)}
            </div>
          </>
        ) : (
          <>{/* Enter score */}
            <p style={{ color: "var(--textTer)", fontSize: 11, textAlign: "center", margin: "0 0 10px" }}>ציון של {FAMILY[examModal.childId]?.name}:</p>
            <input style={{ ...S.inp, textAlign: "center", fontSize: 24, fontWeight: 800 }} type="number" min="0" max="100" placeholder="0-100"
              value={examScore} onChange={e => setExamScore(e.target.value.slice(0, 3))} />
            {examScore && parseInt(examScore) >= 90 && (
              <div style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", borderRadius: 10, padding: 10, marginBottom: 8, textAlign: "center", border: "1px solid #10b98140" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#10b981" }}>💰 בונוס: {parseInt(examScore) >= 100 ? 100 : 50}₪</div>
              </div>
            )}
            <button onClick={() => addExam(examModal.childId, examScore)}
              style={{ width: "100%", padding: 10, background: "linear-gradient(135deg,#4f46e5,#6366f1)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 5 }}>📝 שלח</button>
          </>
        )}
        <button onClick={() => { setExamModal(null); setExamScore(""); }} style={{ ...S.mc, marginTop: 8 }}>ביטול</button>
      </div>
    </div>
  );
}
