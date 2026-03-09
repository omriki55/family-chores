import React from "react";
import useVoiceInput from '../../hooks/useVoiceInput.js';

export default function BonusModal({ S, app }) {
  const { bonusModal, setBonusModal, bonusTitle, setBonusTitle, bonusIcon, setBonusIcon, bonusFileRef, bonusPhoto, setBonusPhoto, handleBonusPhoto, submitBonus, isP } = app;
  const voice = useVoiceInput();
  if (!bonusModal || isP) return null;

  return (
    <div style={S.ov} onClick={() => setBonusModal(false)}>
      <div style={S.md} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="הגשת יוזמה">
        <h3 style={S.mt}>⭐ יוזמה</h3>
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          <input style={{...S.inp,marginBottom:0,flex:1}} placeholder="מה עשית?" value={bonusTitle} onChange={e => setBonusTitle(e.target.value)} />
          {voice.supported&&<button className={voice.listening?"mic-pulse":""} onClick={()=>voice.toggle((txt,final)=>{if(final)setBonusTitle(txt);})} style={{...S.micBtn,background:voice.listening?"#ef4444":"#6366f115",color:voice.listening?"#fff":"#6366f1"}}>{voice.listening?"⏹️":"🎙️"}</button>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 8 }}>
          {["⭐", "💪", "🧹", "🍳", "🌟", "🎨", "📖", "🏃", "🛠️", "❤️", "🤝", "🌈"].map(em => (
            <button key={em} onClick={() => setBonusIcon(em)}
              style={{ width: 32, height: 32, fontSize: 16, background: bonusIcon === em ? "#8b5cf620" : "var(--barBg)", border: bonusIcon === em ? "2px solid #8b5cf6" : "1px solid var(--border)", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{em}</button>
          ))}
        </div>
        <input ref={bonusFileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleBonusPhoto} />
        {bonusPhoto ? <div style={{ position: "relative", marginBottom: 8 }}>
          <img src={bonusPhoto} alt="" style={{ width: "100%", borderRadius: 8, maxHeight: 140, objectFit: "cover" }} />
          <button onClick={() => setBonusPhoto(null)} style={{ position: "absolute", top: 4, left: 4, background: "#ef4444", border: "none", borderRadius: 6, color: "#fff", fontSize: 10, width: 20, height: 20, cursor: "pointer" }}>✕</button>
        </div> : <button onClick={() => bonusFileRef.current?.click()} style={{ width: "100%", padding: 8, background: "var(--barBg)", border: "1px dashed #334155", borderRadius: 8, color: "var(--textSec)", fontSize: 11, cursor: "pointer", marginBottom: 8 }}>📷 תמונה</button>}
        <button onClick={submitBonus} style={{ width: "100%", padding: 10, background: "linear-gradient(135deg,#7c3aed,#8b5cf6)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 4 }}>⭐ שלח</button>
        <button onClick={() => setBonusModal(false)} style={S.mc}>ביטול</button>
      </div>
    </div>
  );
}
