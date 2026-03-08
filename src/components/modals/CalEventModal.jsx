import React from "react";

export default function CalEventModal({ S, app }) {
  const { calEventModal, setCalEventModal, calNewEvent, setCalNewEvent, addCalEvent, isP } = app;
  if (!calEventModal || !isP) return null;

  return (
    <div style={S.ov} onClick={() => setCalEventModal(false)}>
      <div style={S.md} onClick={e => e.stopPropagation()}>
        <h3 style={S.mt}>📅 אירוע חדש — {calEventModal.date}</h3>
        <input style={S.inp} placeholder="שם האירוע..." value={calNewEvent.title}
          onChange={e => setCalNewEvent(p => ({ ...p, title: e.target.value }))} />
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--textTer)", marginBottom: 4 }}>אייקון:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {["📌", "🎂", "📚", "🏫", "👨‍⚕️", "🎵", "⚽", "🎉", "🕯️", "💼", "🛫", "🎭"].map(em => (
            <button key={em} onClick={() => setCalNewEvent(p => ({ ...p, icon: em }))}
              style={{ ...S.chip, ...(calNewEvent.icon === em ? { borderColor: "#6366f1", background: "#6366f115", color: "#6366f1" } : {}) }}>{em}</button>
          ))}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--textTer)", marginBottom: 4 }}>סוג:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {[{ id: "custom", l: "מותאם" }, { id: "birthday", l: "🎂 יום הולדת" }, { id: "class", l: "📚 חוג" }, { id: "meeting", l: "👨‍⚕️ פגישה" }].map(t => (
            <button key={t.id} onClick={() => setCalNewEvent(p => ({ ...p, type: t.id }))}
              style={{ ...S.chip, ...(calNewEvent.type === t.id ? { borderColor: "#6366f1", background: "#6366f115", color: "#6366f1" } : {}) }}>{t.l}</button>
          ))}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--textTer)", marginBottom: 4 }}>חוזר:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {[{ id: null, l: "חד פעמי" }, { id: "weekly", l: "שבועי" }, { id: "monthly", l: "חודשי" }, { id: "yearly", l: "שנתי" }].map(r => (
            <button key={r.id || "none"} onClick={() => setCalNewEvent(p => ({ ...p, recurring: r.id }))}
              style={{ ...S.chip, ...(calNewEvent.recurring === r.id ? { borderColor: "#6366f1", background: "#6366f115", color: "#6366f1" } : {}) }}>{r.l}</button>
          ))}
        </div>
        <button onClick={addCalEvent}
          style={{ width: "100%", padding: 10, background: "linear-gradient(135deg,#4f46e5,#6366f1)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 5 }}>📅 הוסף</button>
        <button onClick={() => setCalEventModal(false)} style={{ ...S.mc, marginTop: 4 }}>ביטול</button>
      </div>
    </div>
  );
}
