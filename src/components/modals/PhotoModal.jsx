import React from "react";

export default function PhotoModal({ S, app }) {
  const { photoModal, setPhotoModal, fileRef, handlePhoto, markDone } = app;
  if (!photoModal) return null;

  return (
    <div style={S.ov} onClick={() => setPhotoModal(null)}>
      <div style={S.md} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="צפייה בתמונה">
        {photoModal.view ? <>
          <img src={photoModal.view} alt="" style={{ width: "100%", borderRadius: 10, marginBottom: 10, maxHeight: 240, objectFit: "cover" }} />
          <button onClick={() => setPhotoModal(null)} style={S.mc}>סגור</button>
        </> : <>
          <h3 style={S.mt}>📷 הוכחה</h3>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
            onChange={e => { handlePhoto(e, photoModal.taskId, photoModal.childId, photoModal.day); setPhotoModal(null); }} />
          <button onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 5 }}>📸 צלם</button>
          <button onClick={() => { markDone(photoModal.taskId, photoModal.childId, photoModal.day, null); setPhotoModal(null); }} style={{ width: "100%", padding: 7, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--textSec)", fontSize: 10, cursor: "pointer", marginBottom: 5 }}>דלג</button>
          <button onClick={() => setPhotoModal(null)} style={S.mc}>ביטול</button>
        </>}
      </div>
    </div>
  );
}
