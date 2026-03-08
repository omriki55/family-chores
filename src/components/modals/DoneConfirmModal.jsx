import React from "react";

export default function DoneConfirmModal({ S, app }) {
  const { doneConfirm, setDoneConfirm, fileRef, handlePhoto, markDone, tasks } = app;
  if (!doneConfirm) return null;

  return (
    <div style={S.ov} onClick={() => setDoneConfirm(null)}>
      <div style={S.md} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="אישור ביצוע">
        <h3 style={S.mt}>✅ סיום משימה</h3>
        <p style={{ color: "var(--textTer)", fontSize: 12, textAlign: "center", margin: "0 0 12px" }}>רוצה להוסיף תמונה?</p>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
          onChange={e => { handlePhoto(e, doneConfirm.taskId, doneConfirm.childId, doneConfirm.day); setDoneConfirm(null); }} />
        <button onClick={() => fileRef.current?.click()}
          style={{ width: "100%", padding: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 6 }}>
          📸 כן, לצלם!
        </button>
        {!(tasks.find(t => t.id === doneConfirm.taskId)?.requirePhoto) && <button onClick={() => { markDone(doneConfirm.taskId, doneConfirm.childId, doneConfirm.day, null, doneConfirm.timerBonus); setDoneConfirm(null); }}
          style={{ width: "100%", padding: 10, background: "#10b981", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 6 }}>
          ✅ בלי תמונה
        </button>}
        <button onClick={() => setDoneConfirm(null)} style={S.mc}>ביטול</button>
      </div>
    </div>
  );
}
