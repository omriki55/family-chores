import { FAMILY, DAYS } from '../../constants.js';

export default function ApproveScreen({ S, app }) {
  const {
    tasks, completions, cKey,
    approveWithPraise, reject, deleteTask,
    setPhotoModal,
  } = app;

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
      {pend.length===0?<div style={{textAlign:"center",padding:"30px"}}><div style={{fontSize:36}}>🎉</div><div style={{color:"var(--textSec)",fontSize:12,marginTop:4}}>אין ממתינים</div></div>
      :pend.map((p,i)=>(
        <div key={i} style={{background:"var(--card)",borderRadius:10,padding:10,marginBottom:5,border:`1px solid ${p.t.bonus?"#8b5cf630":"#f59e0b25"}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:14}}>{p.t.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{p.t.title}{p.t.bonus?" ⭐":""}</div>
              <div style={{fontSize:9,color:"var(--textSec)"}}>{FAMILY[p.c].name} • {DAYS[p.d]} • {p.t.weight}נק׳</div>
            </div>
            {p.comp.photo&&<button onClick={()=>setPhotoModal({view:p.comp.photo})} style={S.vBtn}>🖼</button>}
          </div>
          <div style={{display:"flex",gap:5}}>
            <button onClick={()=>approveWithPraise(p.t.id,p.c,p.d)} style={S.bOk}>✅ אשר</button>
            <button onClick={()=>{reject(p.t.id,p.c,p.d);if(p.t.bonus)deleteTask(p.t.id);}} style={S.bNo}>❌</button>
          </div>
        </div>
      ))}
    </>
  );
}
