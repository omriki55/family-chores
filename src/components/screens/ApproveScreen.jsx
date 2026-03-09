import { useState, useCallback } from 'react';
import { FAMILY, DAYS } from '../../constants.js';

export default function ApproveScreen({ S, app }) {
  const {
    tasks, completions, cKey,
    approve, reject, deleteTask,
    setPhotoModal,
  } = app;

  // ── Swipe state ──
  const [swipeState, setSwipeState] = useState({});

  const onTouchStart = useCallback((key, e) => {
    setSwipeState(s => ({...s, [key]: { startX: e.touches[0].clientX, deltaX: 0 }}));
  }, []);

  const onTouchMove = useCallback((key, e) => {
    setSwipeState(s => {
      const st = s[key];
      if (!st) return s;
      const deltaX = e.touches[0].clientX - st.startX;
      return {...s, [key]: {...st, deltaX}};
    });
  }, []);

  const onTouchEnd = useCallback((key, onRight, onLeft) => {
    const st = swipeState[key];
    if (!st) { setSwipeState(s => { const n = {...s}; delete n[key]; return n; }); return; }
    // RTL: right swipe (deltaX > 0) = approve, left swipe (deltaX < 0) = reject
    if (st.deltaX > 80 && onRight) onRight();
    else if (st.deltaX < -80 && onLeft) onLeft();
    setSwipeState(s => { const n = {...s}; delete n[key]; return n; });
  }, [swipeState]);

  const pend=[];
  tasks.forEach(t=>t.assignedTo.forEach(c=>{
    for(let d=0;d<7;d++){
      const k=cKey(t.id,c,d);
      if(completions[k]?.done&&!completions[k]?.approved)
        pend.push({t,c,d,comp:completions[k]});
    }
  }));

  return (
    <>
      <h2 style={S.st}>✅ אישורים ({pend.length})</h2>
      <div style={{textAlign:'center',marginBottom:8,fontSize:9,color:'var(--textSec)'}}>
        👆 החלק ימינה לאשר, שמאלה לדחות
      </div>
      {pend.length===0?<div style={{textAlign:"center",padding:"30px"}}><div style={{fontSize:36}}>🎉</div><div style={{color:"var(--textSec)",fontSize:12,marginTop:4}}>אין ממתינים</div></div>
      :pend.map((p,i)=>{
        const swKey=`approve_${p.t.id}_${p.c}_${p.d}`;
        const sw=swipeState[swKey];
        const deltaX=sw?.deltaX||0;
        const swipePct=Math.min(1,Math.abs(deltaX)/80);
        const isRight=deltaX>20;
        const isLeft=deltaX<-20;

        return(
          <div key={i} style={{position:'relative',overflow:'hidden',borderRadius:10,marginBottom:5}}>
            {/* Swipe backgrounds */}
            {isRight&&(
              <div style={{position:'absolute',inset:0,background:`rgba(16,185,129,${0.1+swipePct*0.4})`,
                display:'flex',alignItems:'center',justifyContent:'flex-start',paddingRight:16,borderRadius:10}}>
                <span style={{fontSize:22,opacity:swipePct}}>✅</span>
              </div>
            )}
            {isLeft&&(
              <div style={{position:'absolute',inset:0,background:`rgba(239,68,68,${0.1+swipePct*0.4})`,
                display:'flex',alignItems:'center',justifyContent:'flex-end',paddingLeft:16,borderRadius:10}}>
                <span style={{fontSize:22,opacity:swipePct}}>❌</span>
              </div>
            )}
            <div
              onTouchStart={(e)=>onTouchStart(swKey,e)}
              onTouchMove={(e)=>onTouchMove(swKey,e)}
              onTouchEnd={()=>onTouchEnd(swKey,
                ()=>approve(p.t.id,p.c,p.d),
                ()=>{reject(p.t.id,p.c,p.d);if(p.t.bonus)deleteTask(p.t.id);}
              )}
              style={{background:"var(--card)",borderRadius:10,padding:10,border:`1px solid ${p.t.bonus?"#8b5cf630":"#f59e0b25"}`,
                transform:`translateX(${deltaX}px)`,
                transition:deltaX===0?'transform 0.2s ease':'none',
                position:'relative',zIndex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:14}}>{p.t.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{p.t.title}{p.t.bonus?" ⭐":""}</div>
                  <div style={{fontSize:9,color:"var(--textSec)"}}>{FAMILY[p.c].name} • {DAYS[p.d]} • {p.t.weight}נק׳</div>
                </div>
                {p.comp.photo&&<button onClick={()=>setPhotoModal({view:p.comp.photo})} style={S.vBtn}>🖼</button>}
              </div>
              <div style={{display:"flex",gap:5}}>
                <button onClick={()=>approve(p.t.id,p.c,p.d)} style={S.bOk}>✅ אשר</button>
                <button onClick={()=>{reject(p.t.id,p.c,p.d);if(p.t.bonus)deleteTask(p.t.id);}} style={S.bNo}>❌</button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
