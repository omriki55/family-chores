import React from "react";
import { FAMILY, CH } from "../../constants.js";

export default function SwapModal({ S, app }) {
  const { swapModal, setSwapModal, requestSwap } = app;
  if (!swapModal) return null;

  return (
    <div style={S.ov} onClick={() => setSwapModal(null)}>
      <div style={S.md} onClick={e => e.stopPropagation()}>
        <h3 style={S.mt}>🔄 החלף משימה</h3>
        <p style={{ color: "var(--textSec)", fontSize: 11, textAlign: "center", margin: "0 0 10px" }}>בחר/י למי להעביר את המשימה:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {CH.filter(c => c !== swapModal.from).map(c => (
            <button key={c} onClick={() => { requestSwap(swapModal.taskId, swapModal.from, c); setSwapModal(null); }}
              style={{ padding: 12, background: "var(--barBg)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, color: FAMILY[c].color }}>{FAMILY[c].name}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setSwapModal(null)} style={{ ...S.mc, marginTop: 8 }}>ביטול</button>
      </div>
    </div>
  );
}
