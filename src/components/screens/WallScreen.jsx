import { useState } from 'react';
import { FAMILY, CH } from '../../constants.js';
import { getToday } from '../../utils.js';
import useVoiceInput from '../../hooks/useVoiceInput.js';

export default function WallScreen({ S, app }) {
  const {
    user, isP, tasks, completions, cKey, isTaskForChild,
    wallText, setWallText, wallTo, setWallTo,
    sendWallMessage, sendNudge, getWallMessages, toggleReaction,
    setPhotoModal,
  } = app;

  const voice = useVoiceInput();
  const [wallMode, setWallMode] = useState('messages');

  // ── Photo feed from completions ──
  const getPhotoFeed = () => {
    const photos = [];
    Object.entries(completions).forEach(([key, comp]) => {
      if (!comp?.photo) return;
      const parts = key.split('_');
      // key format: wk_taskId_childId_day
      const childId = parts[parts.length - 2];
      const taskId = parts.slice(1, -2).join('_');
      const task = tasks.find(t => t.id === taskId);
      photos.push({
        id: key,
        photo: comp.photo,
        childId,
        task,
        approved: comp.approved,
        ts: comp.ts || 0,
      });
    });
    return photos.sort((a, b) => b.ts - a.ts);
  };

  return (
    <>
      {/* Mode toggle */}
      <div style={{display:'flex',gap:4,marginBottom:10,justifyContent:'center'}}>
        <button onClick={()=>setWallMode('messages')}
          style={{padding:'6px 14px',borderRadius:8,fontSize:11,fontWeight:700,cursor:'pointer',
            background:wallMode==='messages'?'#6366f1':'var(--barBg)',
            color:wallMode==='messages'?'#fff':'var(--textTer)',
            border:wallMode==='messages'?'none':'1px solid var(--border)'}}>
          💬 הודעות
        </button>
        <button onClick={()=>setWallMode('photos')}
          style={{padding:'6px 14px',borderRadius:8,fontSize:11,fontWeight:700,cursor:'pointer',
            background:wallMode==='photos'?'#6366f1':'var(--barBg)',
            color:wallMode==='photos'?'#fff':'var(--textTer)',
            border:wallMode==='photos'?'none':'1px solid var(--border)'}}>
          📸 תמונות
        </button>
      </div>

      {wallMode==='messages'&&<>
        <h2 style={S.st}>💬 קיר משפחתי</h2>
        {/* Compose area */}
        <div style={{background:"var(--card)",borderRadius:12,padding:10,marginBottom:10,border:"1px solid var(--border)"}}>
          {isP&&<div style={{display:"flex",gap:4,marginBottom:6,flexWrap:"wrap"}}>
            <button onClick={()=>setWallTo("wall")} style={{padding:"4px 8px",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",background:wallTo==="wall"?"#6366f120":"var(--inputBg)",border:wallTo==="wall"?"2px solid #6366f1":"1px solid var(--border)",color:wallTo==="wall"?"#6366f1":"var(--textTer)"}}>👨‍👩‍👧‍👦 כולם</button>
            {CH.map(c=><button key={c} onClick={()=>setWallTo(c)} style={{padding:"4px 8px",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",background:wallTo===c?FAMILY[c].color+"20":"var(--inputBg)",border:wallTo===c?`2px solid ${FAMILY[c].color}`:"1px solid var(--border)",color:wallTo===c?FAMILY[c].color:"var(--textTer)"}}>{FAMILY[c].name}</button>)}
          </div>}
          <div style={{display:"flex",gap:6}}>
            <input style={{...S.inp,marginBottom:0,flex:1}} placeholder={isP?"כתוב/י הודעה...":"כתוב/י להורים..."} value={wallText} onChange={e=>setWallText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendWallMessage(wallText,isP?wallTo:"wall");}}/>
            {voice.supported&&<button className={voice.listening?"mic-pulse":""} onClick={()=>voice.toggle((txt,final)=>{if(final)setWallText(prev=>prev?prev+" "+txt:txt);})} style={{...S.micBtn,background:voice.listening?"#ef4444":"#6366f115",color:voice.listening?"#fff":"#6366f1"}}>{voice.listening?"⏹️":"🎙️"}</button>}
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
      </>}

      {wallMode==='photos'&&<>
        <h2 style={S.st}>📸 גלריית תמונות</h2>
        {(()=>{
          const photos = getPhotoFeed();
          if(photos.length===0) return(
            <div style={{textAlign:'center',padding:30}}>
              <div style={{fontSize:36}}>📸</div>
              <div style={{color:'var(--textSec)',fontSize:12,marginTop:4}}>עדיין אין תמונות. סמנו משימות עם תמונה!</div>
            </div>
          );
          return(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4}}>
              {photos.map(p=>(
                <div key={p.id} onClick={()=>setPhotoModal({view:p.photo})}
                  style={{position:'relative',cursor:'pointer',borderRadius:10,overflow:'hidden',aspectRatio:'1',background:'var(--barBg)'}}>
                  <img src={p.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                  {/* Overlay */}
                  <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.6))',
                    padding:'16px 6px 4px',display:'flex',alignItems:'center',gap:4}}>
                    {p.childId&&FAMILY[p.childId]&&(
                      <span style={{fontSize:9,fontWeight:700,color:'#fff'}}>{FAMILY[p.childId].name}</span>
                    )}
                    {p.task&&<span style={{fontSize:10}}>{p.task.icon}</span>}
                  </div>
                  {p.approved&&(
                    <div style={{position:'absolute',top:4,left:4,fontSize:12,background:'rgba(255,255,255,0.9)',borderRadius:4,padding:'1px 3px'}}>✅</div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </>}
    </>
  );
}
