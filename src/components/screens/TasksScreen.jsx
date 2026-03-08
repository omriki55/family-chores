import { useState, useCallback } from 'react';
import { FAMILY, CH, DAYS, DS } from '../../constants.js';
import { getToday } from '../../utils.js';

export default function TasksScreen({ S, app }) {
  const {
    user, isP, tasks, completions, selDay, setSelDay,
    cKey, isTaskForChild,
    setDoneConfirm, setSwapModal, setPhotoModal,
    approveWithPraise, reject, deleteTask,
  } = app;

  const today = getToday();

  // ── Swipe state ──
  const [swipeState, setSwipeState] = useState({});
  const [swipeHintShown, setSwipeHintShown] = useState(()=>!!localStorage.getItem('family-swipe-hint'));

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

  const onTouchEnd = useCallback((key, action) => {
    const st = swipeState[key];
    if (!st) return;
    // RTL: physical right swipe = positive deltaX = "done"
    if (st.deltaX > 80 && action) {
      action();
      if (!swipeHintShown) {
        setSwipeHintShown(true);
        localStorage.setItem('family-swipe-hint', '1');
      }
    }
    setSwipeState(s => { const n = {...s}; delete n[key]; return n; });
  }, [swipeState, swipeHintShown]);

  return (
    <>
      <div style={S.dayRow}>
        {DAYS.map((d,i)=><button key={i} onClick={()=>setSelDay(i)}
          style={{...S.dayBtn,...(i===selDay?S.dayAct:{}),...(i===today&&i!==selDay?{borderColor:"#6366f160"}:{})}}>
          <span style={{fontSize:12,fontWeight:700}}>{DS[i]}</span><span style={{fontSize:7}}>{d}</span>
        </button>)}
      </div>

      {/* Swipe hint */}
      {!swipeHintShown && !isP && (
        <div style={{textAlign:'center',padding:'6px 10px',background:'#ede9fe',borderRadius:8,marginBottom:8,fontSize:10,color:'#6366f1',fontWeight:600}}>
          👆 החלק ימינה לסמן משימה כבוצעה
        </div>
      )}

      {(isP?CH:[user]).filter(c=>FAMILY[c]).map(cid=>{
        const m=FAMILY[cid];const dt=tasks.filter(t=>isTaskForChild(t,cid,selDay)&&!t.bonus);
        const bt=tasks.filter(t=>isTaskForChild(t,cid,selDay)&&t.bonus);
        const dw=dt.reduce((s,t)=>s+t.weight,0);if(dt.length===0&&bt.length===0)return null;
        const dc=dt.filter(t=>completions[cKey(t.id,cid,selDay)]?.done).length;
        return(
          <div key={cid} style={{marginBottom:14}}>
            <div style={S.secH}><span style={{fontSize:13,fontWeight:700,color:m.color}}>{m.name}</span><span style={S.bdg}>{dc}/{dt.length}</span></div>
            {dt.sort((a,b)=>b.weight-a.weight).map(task=>{
              const k=cKey(task.id,cid,selDay);const comp=completions[k];const done=comp?.done;const appd=comp?.approved;
              const wpct=dw>0?Math.round((task.weight/dw)*100):0;
              const swKey=`${task.id}_${cid}_${selDay}`;
              const sw=swipeState[swKey];
              const deltaX=sw?.deltaX||0;
              const canSwipe=!done&&!isP&&cid===user;
              const swipePct=Math.min(1,Math.abs(deltaX)/80);

              return(
                <div key={task.id} style={{position:'relative',overflow:'hidden',borderRadius:10,marginBottom:3}}>
                  {/* Swipe background */}
                  {canSwipe&&deltaX>20&&(
                    <div style={{position:'absolute',inset:0,background:`rgba(16,185,129,${0.1+swipePct*0.3})`,
                      display:'flex',alignItems:'center',justifyContent:'flex-start',paddingRight:16,borderRadius:10,zIndex:0}}>
                      <span style={{fontSize:20,opacity:swipePct}}>✅</span>
                    </div>
                  )}
                  <div
                    onTouchStart={canSwipe?(e)=>onTouchStart(swKey,e):undefined}
                    onTouchMove={canSwipe?(e)=>onTouchMove(swKey,e):undefined}
                    onTouchEnd={canSwipe?()=>onTouchEnd(swKey,()=>setDoneConfirm({taskId:task.id,childId:cid,day:selDay})):undefined}
                    style={{...S.tc,...(appd?S.tA:done?S.tD:{}),
                      transform:canSwipe&&deltaX>0?`translateX(${Math.min(deltaX,120)}px)`:'none',
                      transition:deltaX===0?'transform 0.2s ease':'none',
                      position:'relative',zIndex:1}}>
                    <div style={S.tr}>
                      <span style={{fontSize:18}}>{task.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
                          <span style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{task.title}</span>
                          <span style={S.wt}>{task.weight}נק׳ {wpct}%</span>
                          {task.type==="shared"&&<span style={{fontSize:7,fontWeight:700,color:"#8b5cf6",background:"#8b5cf615",padding:"1px 5px",borderRadius:5}}>📋 תורנות</span>}
                        </div>
                        <div style={{fontSize:9,marginTop:1}}>
                          {appd?<span style={{color:"#10b981"}}>✅ {FAMILY[comp.approvedBy]?.name}</span>
                            :done?<span style={{color:"#f59e0b"}}>⏳</span>
                            :<span style={{color:"var(--textQuat)"}}>טרם בוצע</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:3,alignItems:"center",flexShrink:0}}>
                        {!done&&!isP&&cid===user&&<>
                          <button onClick={()=>setDoneConfirm({taskId:task.id,childId:cid,day:selDay})} style={S.doneBtn}>✓</button>
                          {/* Swap button */}
                          <button onClick={()=>setSwapModal({taskId:task.id,from:cid})} style={{width:28,height:28,background:"#8b5cf620",border:"1px solid #8b5cf640",borderRadius:7,color:"#7c3aed",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🔄</button>
                        </>}
                        {done&&comp?.photo&&<button onClick={()=>setPhotoModal({view:comp.photo})} style={S.vBtn}>🖼</button>}
                        {done&&!appd&&isP&&<><button onClick={()=>approveWithPraise(task.id,cid,selDay)} style={S.okBtn}>✓</button><button onClick={()=>reject(task.id,cid,selDay)} style={S.noBtn}>✕</button></>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {bt.filter(t=>{for(let d=0;d<7;d++)if(completions[cKey(t.id,cid,d)])return true;return false;}).map(t=>{
              const k=cKey(t.id,cid,selDay);const c=completions[k];if(!c)return null;
              return(
                <div key={t.id} style={{...S.tc,borderColor:"#8b5cf630"}}>
                  <div style={S.tr}>
                    <span style={{fontSize:16}}>{t.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{t.title} <span style={{fontSize:9,color:"#7c3aed"}}>⭐</span></div>
                      <div style={{fontSize:9}}>{c.approved?<span style={{color:"#10b981"}}>✅ בונוס</span>:<span style={{color:"#f59e0b"}}>⏳</span>}</div>
                    </div>
                    {c.photo&&<button onClick={()=>setPhotoModal({view:c.photo})} style={S.vBtn}>🖼</button>}
                    {c.done&&!c.approved&&isP&&<><button onClick={()=>approveWithPraise(t.id,cid,selDay)} style={S.okBtn}>✓</button><button onClick={()=>{reject(t.id,cid,selDay);deleteTask(t.id);}} style={S.noBtn}>✕</button></>}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
