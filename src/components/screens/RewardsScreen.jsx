import { useState } from 'react';
import { FAMILY, CH } from '../../constants.js';

export default function RewardsScreen({ S, app }) {
  const {
    user, rewards, getSpendableXp, purchaseReward, purchaseHistory,
    getLevel, getXpProgress, totalXpEarned, spentXp,
  } = app;

  const [confirmPurchase, setConfirmPurchase] = useState(null);
  const balance = getSpendableXp(user);
  const level = getLevel(user);
  const progress = getXpProgress(user);
  const m = FAMILY[user];

  return (
    <>
      {/* Balance card */}
      <div style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:16,padding:18,marginBottom:14,color:'#fff',textAlign:'center'}}>
        <div style={{fontSize:11,opacity:0.8,marginBottom:4}}>💰 יתרת הנקודות שלך</div>
        <div style={{fontSize:36,fontWeight:800}}>{balance}</div>
        <div style={{fontSize:10,opacity:0.7,marginTop:2}}>XP זמין לרכישה</div>
        <div style={{marginTop:8,display:'flex',justifyContent:'center',gap:16,fontSize:10,opacity:0.8}}>
          <span>🏆 סה"כ נצבר: {totalXpEarned[user]||0}</span>
          <span>🛍️ הוצאות: {spentXp[user]||0}</span>
        </div>
      </div>

      {/* Rewards grid */}
      <h3 style={{...S.st,fontSize:13}}>🎁 פרסים זמינים</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
        {rewards.filter(r=>r.active).map(r=>{
          const canAfford=balance>=r.cost;
          return(
            <div key={r.id} style={{background:'var(--card)',borderRadius:12,padding:14,border:`1.5px solid ${canAfford?'#10b98140':'var(--border)'}`,
              textAlign:'center',opacity:canAfford?1:0.6,transition:'all 0.2s'}}>
              <div style={{fontSize:28,marginBottom:4}}>{r.icon}</div>
              <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:4}}>{r.title}</div>
              <div style={{fontSize:14,fontWeight:800,color:canAfford?'#10b981':'var(--textSec)',marginBottom:8}}>{r.cost} XP</div>
              <button onClick={()=>{if(canAfford)setConfirmPurchase(r);}}
                disabled={!canAfford}
                style={{width:'100%',padding:'7px 0',background:canAfford?'linear-gradient(135deg,#10b981,#059669)':'var(--barBg)',
                  border:'none',borderRadius:8,color:canAfford?'#fff':'var(--textSec)',fontSize:11,fontWeight:700,
                  cursor:canAfford?'pointer':'not-allowed'}}>
                {canAfford?'🛒 קנה':'💸 אין מספיק'}
              </button>
            </div>
          );
        })}
        {rewards.filter(r=>r.active).length===0&&(
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:30,color:'var(--textSec)',fontSize:12}}>
            <div style={{fontSize:32,marginBottom:8}}>🏪</div>
            אין פרסים זמינים כרגע
          </div>
        )}
      </div>

      {/* Purchase history */}
      <h3 style={{...S.st,fontSize:13}}>🧾 היסטוריית רכישות</h3>
      {purchaseHistory.filter(p=>p.childId===user).length===0?(
        <div style={{textAlign:'center',padding:20,color:'var(--textSec)',fontSize:11}}>
          <div style={{fontSize:28,marginBottom:6}}>🛍️</div>
          עדיין לא רכשת פרסים
        </div>
      ):(
        purchaseHistory.filter(p=>p.childId===user).slice(0,20).map(p=>(
          <div key={p.id} style={{background:'var(--card)',borderRadius:10,padding:10,marginBottom:4,
            border:`1px solid ${p.status==='fulfilled'?'#10b98140':'#f59e0b40'}`,
            display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:18}}>{p.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text)'}}>{p.title}</div>
              <div style={{fontSize:9,color:'var(--textSec)'}}>
                {new Date(p.ts).toLocaleDateString('he-IL')} • {p.cost} XP
              </div>
            </div>
            <span style={{fontSize:9,fontWeight:700,padding:'3px 8px',borderRadius:6,
              background:p.status==='fulfilled'?'#10b98120':'#f59e0b20',
              color:p.status==='fulfilled'?'#10b981':'#f59e0b'}}>
              {p.status==='fulfilled'?'✅ סופק':'⏳ ממתין'}
            </span>
          </div>
        ))
      )}

      {/* Purchase confirmation modal */}
      {confirmPurchase&&(
        <div style={S.ov} onClick={()=>setConfirmPurchase(null)}>
          <div style={S.md} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center',marginBottom:12}}>
              <div style={{fontSize:48,marginBottom:8}}>{confirmPurchase.icon}</div>
              <div style={S.mt}>{confirmPurchase.title}</div>
              <div style={{fontSize:18,fontWeight:800,color:'#6366f1',marginBottom:4}}>{confirmPurchase.cost} XP</div>
              <div style={{fontSize:11,color:'var(--textSec)'}}>יתרה אחרי רכישה: {balance-confirmPurchase.cost} XP</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{purchaseReward(user,confirmPurchase.id);setConfirmPurchase(null);}}
                style={{flex:2,padding:10,background:'linear-gradient(135deg,#10b981,#059669)',border:'none',borderRadius:10,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                🎁 אישור רכישה
              </button>
              <button onClick={()=>setConfirmPurchase(null)}
                style={{flex:1,padding:10,background:'var(--barBg)',border:'1px solid var(--border)',borderRadius:10,color:'var(--textTer)',fontSize:12,cursor:'pointer'}}>
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
