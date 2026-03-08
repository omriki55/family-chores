import { FAMILY, CH } from '../../constants.js';
import { getToday } from '../../utils.js';

export default function WallScreen({ S, app }) {
  const {
    user, isP, tasks, completions, cKey, isTaskForChild,
    wallText, setWallText, wallTo, setWallTo,
    sendWallMessage, sendNudge, getWallMessages, toggleReaction,
    setPhotoModal,
  } = app;

  return (
    <>
      <h2 style={S.st}>💬 קיר משפחתי</h2>
      {/* Compose area */}
      <div style={{background:"var(--card)",borderRadius:12,padding:10,marginBottom:10,border:"1px solid var(--border)"}}>
        {isP&&<div style={{display:"flex",gap:4,marginBottom:6,flexWrap:"wrap"}}>
          <button onClick={()=>setWallTo("wall")} style={{padding:"4px 8px",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",background:wallTo==="wall"?"#6366f120":"var(--inputBg)",border:wallTo==="wall"?"2px solid #6366f1":"1px solid var(--border)",color:wallTo==="wall"?"#6366f1":"var(--textTer)"}}>👨‍👩‍👧‍👦 כולם</button>
          {CH.map(c=><button key={c} onClick={()=>setWallTo(c)} style={{padding:"4px 8px",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",background:wallTo===c?FAMILY[c].color+"20":"var(--inputBg)",border:wallTo===c?`2px solid ${FAMILY[c].color}`:"1px solid var(--border)",color:wallTo===c?FAMILY[c].color:"var(--textTer)"}}>{FAMILY[c].name}</button>)}
        </div>}
        <div style={{display:"flex",gap:6}}>
          <input style={{...S.inp,marginBottom:0,flex:1}} placeholder={isP?"כתוב/י הודעה...":"כתוב/י להורים..."} value={wallText} onChange={e=>setWallText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendWallMessage(wallText,isP?wallTo:"wall");}}/>
          <button onClick={()=>sendWallMessage(wallText,isP?wallTo:"wall")} style={{padding:"8px 14px",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>שלח</button>
        </div>
      </div>
      {/* Nudge buttons - parent only */}
      {isP&&(()=>{const nudgeBtns=CH.map(c=>{
        const pending=tasks.filter(t=>isTaskForChild(t,c,getToday())&&!t.bonus&&!completions[cKey(t.id,c,getToday())]?.done).length;
        if(pending===0)return null;
        return<button key={c} onClick={()=>sendNudge(c)} style={{flex:1,padding:"6px 4px",background:FAMILY[c].color+"10",border:`1px solid ${FAMILY[c].color}40`,borderRadius:8,cursor:"pointer",textAlign:"center"}}>
          <div style={{fontSize:10,fontWeight:700,color:FAMILY[c].color}}>👋 {FAMILY[c].name}</div>
          <div style={{fontSize:8,color:"var(--textSec)"}}>{pending} משימות</div>
        </button>;
      }).filter(Boolean);
      return nudgeBtns.length>0?<div style={{display:"flex",gap:4,marginBottom:10}}>{nudgeBtns}</div>:null;})()}
      {/* Message feed */}
      {(()=>{const wm=getWallMessages();
        if(wm.length===0)return<div style={{textAlign:"center",padding:30}}><div style={{fontSize:36}}>💬</div><div style={{color:"var(--textSec)",fontSize:12,marginTop:4}}>עדיין אין הודעות. כתבו משהו!</div></div>;
        return wm.map(msg=>{
          const from=msg.from==="system"?null:FAMILY[msg.from];
          const isSystem=msg.type==="system";const isNudge=msg.type==="nudge";
          const isNew=(Date.now()-msg.ts)<86400000;
          const task=msg.taskId?tasks.find(t=>t.id===msg.taskId):null;
          const timeStr=new Date(msg.ts).toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"});
          const dayAgo=Math.floor((Date.now()-msg.ts)/86400000);
          const dateStr=dayAgo===0?"היום":dayAgo===1?"אתמול":new Date(msg.ts).toLocaleDateString("he-IL",{weekday:"short",day:"numeric",month:"short"});
          return(
            <div key={msg.id} style={{background:isSystem?"linear-gradient(135deg,#ede9fe,#ddd6fe)":isNudge?"linear-gradient(135deg,#fef3c7,#fffbeb)":"var(--card)",borderRadius:10,padding:10,marginBottom:4,border:isSystem?"1px solid #8b5cf640":isNudge?"1px solid #f59e0b40":isNew?"1px solid #6366f130":"1px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                {msg.star&&<span style={{fontSize:18}}>{msg.star}</span>}
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:from?.color||"#8b5cf6",fontWeight:700}}>
                    {isSystem?"🤖 מערכת":from?.name||""}
                    {msg.to!=="wall"&&FAMILY[msg.to]&&msg.to!==user&&<span style={{color:"var(--textSec)",fontWeight:400}}> → {FAMILY[msg.to]?.name}</span>}
                  </div>
                  <div style={{fontSize:12,color:"var(--text)",marginTop:2}}>{msg.text}</div>
                  {task&&<div style={{fontSize:9,color:"var(--textSec)",marginTop:2}}>{task.icon} {task.title}</div>}
                  <div style={{fontSize:8,color:"#cbd5e1",marginTop:2}}>{dateStr} {timeStr}</div>
                </div>
              </div>
              {/* Reactions */}
              <div style={{display:"flex",gap:3,marginTop:6,flexWrap:"wrap"}}>
                {["👏","❤️","🔥","⭐","💪"].map(emoji=>{
                  const reactors=(msg.reactions||{})[emoji]||[];const iReacted=reactors.includes(user);
                  return<button key={emoji} onClick={()=>toggleReaction(msg.id,emoji)} style={{padding:"2px 6px",borderRadius:12,fontSize:11,background:iReacted?"#6366f115":"var(--inputBg)",border:iReacted?"1px solid #6366f150":"1px solid var(--border)",cursor:"pointer",display:"flex",alignItems:"center",gap:2}}>
                    {emoji}{reactors.length>0&&<span style={{fontSize:9,color:"var(--textTer)",fontWeight:600}}>{reactors.length}</span>}
                  </button>;
                })}
              </div>
            </div>
          );
        });
      })()}
    </>
  );
}
