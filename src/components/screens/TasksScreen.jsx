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

  return (
    <>
      <div style={S.dayRow}>
        {DAYS.map((d,i)=><button key={i} onClick={()=>setSelDay(i)}
          style={{...S.dayBtn,...(i===selDay?S.dayAct:{}),...(i===today&&i!==selDay?{borderColor:"#6366f160"}:{})}}>
          <span style={{fontSize:12,fontWeight:700}}>{DS[i]}</span><span style={{fontSize:7}}>{d}</span>
        </button>)}
      </div>
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
              return(
                <div key={task.id} style={{...S.tc,...(appd?S.tA:done?S.tD:{})}}>
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
