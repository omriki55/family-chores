import { useState } from 'react';
import { FAMILY, CH, SUGGESTED, REMINDERS, AUDIT_LABELS } from '../../constants.js';

const CONTEXT_REMINDER_PRESETS = [
  {icon:"⚽",text:"אל תשכח ציוד לכדורגל!"},
  {icon:"🏊",text:"תביא בגד ים ומגבת לשחיה!"},
  {icon:"🎒",text:"בדוק שהתיק מוכן למחר"},
  {icon:"📚",text:"זמן שיעורי בית - התחל עכשיו"},
  {icon:"🎵",text:"אל תשכח כינור/חצוצרה לחוג"},
  {icon:"🦷",text:"זמן צחצוח שיניים!"},
  {icon:"💊",text:"אל תשכח לקחת תרופה"},
  {icon:"🥗",text:"תשתה מים וקח חטיף לדרך"},
];

export default function ManageScreen({ S, app }) {
  const [newContextReminder, setNewContextReminder] = useState({icon:"📌",text:"",day:"ראשון",time:"08:00"});
  const [contextReminders, setContextReminders] = useState(()=>{
    try{return JSON.parse(localStorage.getItem('family-context-reminders')||'[]');}catch{return[];}
  });
  const {
    user, tasks, completions, goals, setGoals,
    activeReminders, setActiveReminders, auditLog,
    manageSub, setManageSub,
    editTask, setEditTask, newTask, setNewTask,
    changePinUser, setChangePinUser, newPinVal, setNewPinVal,
    dragIdx, setDragIdx, dragOverIdx, setDragOverIdx,
    updateTask, deleteTask, changeWeight, reorderTasks, addNewTask, addSuggested,
    updatePin, save, flash,
  } = app;
  const saveContextReminders = (r) => { setContextReminders(r); localStorage.setItem('family-context-reminders', JSON.stringify(r)); };

  return (
    <>
      <div style={{display:"flex",gap:3,marginBottom:12,overflowX:"auto",paddingBottom:2}}>
        {[{id:"tasks",l:"📋"},{id:"add",l:"➕"},{id:"suggest",l:"💡"},{id:"weights",l:"⚖️"},{id:"goals",l:"🎯"},{id:"reminders",l:"⏰"},{id:"pins",l:"🔒"},{id:"log",l:"📜"}].map(t=>(
          <button key={t.id} onClick={()=>setManageSub(t.id)}
            style={{...S.subT,...(manageSub===t.id?{background:"#6366f1",color:"#fff"}:{})}}>{t.l}</button>
        ))}
      </div>

      {manageSub==="tasks"&&tasks.filter(t=>!t.bonus).map((t,idx)=>(
        <div key={t.id} draggable onDragStart={()=>setDragIdx(idx)} onDragOver={e=>{e.preventDefault();setDragOverIdx(idx);}}
          onDrop={()=>{if(dragIdx!==null&&dragIdx!==idx)reorderTasks(dragIdx,idx);setDragIdx(null);setDragOverIdx(null);}}
          onDragEnd={()=>{setDragIdx(null);setDragOverIdx(null);}}
          style={{background:"var(--card)",borderRadius:10,padding:10,marginBottom:5,border:"1px solid var(--border)",
            opacity:dragIdx===idx?0.5:1,borderTop:dragOverIdx===idx&&dragIdx!==null&&dragIdx>idx?"2px solid #6366f1":undefined,
            borderBottom:dragOverIdx===idx&&dragIdx!==null&&dragIdx<idx?"2px solid #6366f1":undefined,cursor:"grab"}}>
          {editTask===t.id?(
            <div>
              <input style={S.inp} value={t.title} onChange={e=>updateTask(t.id,{title:e.target.value})}/>
              <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:10,color:"var(--textSec)"}}>משקל:</span>
                <button onClick={()=>changeWeight(t.id,-1)} style={S.wB}>−</button>
                <span style={{fontSize:14,fontWeight:800,color:"var(--text)"}}>{t.weight}</span>
                <button onClick={()=>changeWeight(t.id,1)} style={S.wB}>+</button>
              </div>
              <div style={{display:"flex",gap:3,marginBottom:6}}>
                {CH.map(c=><button key={c} onClick={()=>{const a=t.assignedTo.includes(c)?t.assignedTo.filter(x=>x!==c):[...t.assignedTo,c];updateTask(t.id,{assignedTo:a});}}
                  style={{...S.chip,...(t.assignedTo.includes(c)?{background:FAMILY[c].color+"20",borderColor:FAMILY[c].color,color:FAMILY[c].color}:{})}}>{FAMILY[c].name}</button>)}
              </div>
              <div style={{display:"flex",gap:4,marginBottom:6}}>
                <button onClick={()=>updateTask(t.id,{requirePhoto:!t.requirePhoto})}
                  style={{...S.chip,...(t.requirePhoto?{borderColor:"#6366f1",background:"#6366f120",color:"#6366f1"}:{})}}>📷 חובה תמונה</button>
              </div>
              <button onClick={()=>{setEditTask(null);save();flash("💾");}} style={{padding:"6px 14px",background:"#10b981",border:"none",borderRadius:7,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>💾</button>
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14,cursor:"grab",color:"var(--textSec)",userSelect:"none"}}>⠿</span>
              <span style={{fontSize:16}}>{t.icon}</span>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{t.title}</div>
                <div style={{fontSize:9,color:"var(--textTer)"}}>{t.weight}נק׳ • {t.assignedTo.map(c=>FAMILY[c]?.name).join(", ")} {t.type==="shared"?"• 📋 רוטציה":""}</div></div>
              <button onClick={()=>setEditTask(t.id)} style={S.eBtn}>✏️</button>
              <button onClick={()=>deleteTask(t.id)} style={S.dBtn}>🗑</button>
            </div>
          )}
        </div>
      ))}

      {manageSub==="add"&&(
        <div style={{background:"var(--card)",borderRadius:12,padding:14,border:"1px solid var(--border)"}}>
          <input style={S.inp} placeholder="שם המשימה" value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})}/>
          <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:10,color:"var(--textSec)"}}>משקל:</span>
            <button onClick={()=>setNewTask({...newTask,weight:Math.max(1,newTask.weight-1)})} style={S.wB}>−</button>
            <span style={{fontSize:14,fontWeight:800,color:"var(--text)"}}>{newTask.weight}</span>
            <button onClick={()=>setNewTask({...newTask,weight:newTask.weight+1})} style={S.wB}>+</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:8}}>
            {["✨","🛏️","🍽️","🫧","🗑️","🧹","👕","🧽","🐕","📚","🚿","🪴","🍳","🥪","👟","♻️","🧸","🛌","🥘","🪟","🌿","🎒"].map(em=>(
              <button key={em} onClick={()=>setNewTask({...newTask,icon:em})}
                style={{width:30,height:30,fontSize:14,background:newTask.icon===em?"#6366f120":"var(--barBg)",border:newTask.icon===em?"2px solid #6366f1":"1px solid var(--border)",borderRadius:7,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{em}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:3,marginBottom:10}}>
            {CH.map(c=><button key={c} onClick={()=>{const a=newTask.assignedTo.includes(c)?newTask.assignedTo.filter(x=>x!==c):[...newTask.assignedTo,c];setNewTask({...newTask,assignedTo:a});}}
              style={{...S.chip,...(newTask.assignedTo.includes(c)?{background:FAMILY[c].color+"20",borderColor:FAMILY[c].color,color:FAMILY[c].color}:{})}}>{FAMILY[c].name}</button>)}
          </div>
          <div style={{display:"flex",gap:4,marginBottom:10}}>
            {[{v:"personal",l:"🏠 אישי"},{v:"shared",l:"📋 משפחתי (רוטציה)"}].map(opt=>(
              <button key={opt.v} onClick={()=>setNewTask({...newTask,type:opt.v})}
                style={{flex:1,padding:"6px 4px",background:newTask.type===opt.v?"#6366f120":"var(--inputBg)",border:newTask.type===opt.v?"2px solid #6366f1":"1px solid var(--border)",borderRadius:8,color:newTask.type===opt.v?"#6366f1":"var(--textTer)",fontSize:10,fontWeight:600,cursor:"pointer"}}>{opt.l}</button>
            ))}
          </div>
          <button onClick={()=>setNewTask({...newTask,requirePhoto:!newTask.requirePhoto})}
            style={{...S.chip,...(newTask.requirePhoto?{borderColor:"#6366f1",background:"#6366f120",color:"#6366f1"}:{}),marginBottom:10}}>📷 חובה תמונה</button>
          <button onClick={addNewTask} style={{width:"100%",padding:10,background:"linear-gradient(135deg,#4f46e5,#6366f1)",border:"none",borderRadius:10,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>✨ הוסף</button>
        </div>
      )}

      {manageSub==="suggest"&&[...new Set(SUGGESTED.map(s=>s.cat))].map(cat=>(
        <div key={cat} style={{marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:"#6366f1",marginBottom:4}}>{cat}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
            {SUGGESTED.filter(s=>s.cat===cat).map((s,i)=>{const ex=tasks.find(t=>t.title===s.title);return(
              <button key={i} onClick={()=>!ex&&addSuggested(s)}
                style={{padding:"5px 8px",borderRadius:8,fontSize:10,fontWeight:600,cursor:ex?"default":"pointer",
                  background:ex?"#10b98120":"var(--card)",border:ex?"1px solid #10b98150":"1px solid var(--border)",
                  color:ex?"#10b981":"#cbd5e1",opacity:ex?0.7:1}}>{s.icon}{s.title}({s.weight}){ex?"✓":""}</button>
            );})}
          </div>
        </div>
      ))}

      {manageSub==="weights"&&CH.map(cid=>{const m=FAMILY[cid];const ct=tasks.filter(t=>t.assignedTo.includes(cid)&&!t.bonus);const tw=ct.reduce((s,t)=>s+t.weight,0);return(
        <div key={cid} style={{background:"var(--card)",borderRadius:10,padding:12,marginBottom:6,border:"1px solid var(--border)"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
            <span style={{fontSize:12,fontWeight:700,color:m.color}}>{m.name}</span>
            <span style={{marginRight:"auto",marginLeft:0,fontSize:10,color:"var(--textTer)"}}>{tw}נק׳</span>
          </div>
          {ct.sort((a,b)=>b.weight-a.weight).map(t=>{const pct=tw>0?Math.round((t.weight/tw)*100):0;return(
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 0",borderBottom:"1px solid var(--border)"}}>
              <span style={{fontSize:11}}>{t.icon}</span>
              <span style={{fontSize:10,color:"var(--textQuat)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</span>
              <button onClick={()=>changeWeight(t.id,-1)} style={S.wBs}>−</button>
              <span style={{fontSize:11,fontWeight:800,color:"var(--text)",minWidth:16,textAlign:"center"}}>{t.weight}</span>
              <button onClick={()=>changeWeight(t.id,1)} style={S.wBs}>+</button>
              <span style={{fontSize:8,fontWeight:700,color:"#6366f1",minWidth:22,textAlign:"center"}}>{pct}%</span>
            </div>
          );})}
        </div>
      );})}

      {manageSub==="goals"&&<>
        <h3 style={S.st}>🎯 יעדים משפחתיים</h3>
        {goals.map((g,i)=>(
          <div key={g.id} style={{background:"var(--card)",borderRadius:10,padding:12,marginBottom:6,border:"1px solid var(--border)"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:18}}>{g.emoji}</span>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{g.title}</div>
                <div style={{fontSize:10,color:"var(--textSec)"}}>{g.desc} • פרס: {g.reward}</div></div>
              <button onClick={()=>{const ng=goals.map(x=>x.id===g.id?{...x,active:!x.active}:x);setGoals(ng);save({goals:ng});}}
                style={{padding:"4px 10px",background:g.active?"#10b98120":"var(--barBg)",border:`1px solid ${g.active?"#10b98150":"var(--border)"}`,borderRadius:7,color:g.active?"#10b981":"var(--textTer)",fontSize:10,cursor:"pointer"}}>{g.active?"פעיל":"כבוי"}</button>
            </div>
          </div>
        ))}
      </>}

      {manageSub==="reminders"&&<>
        <h3 style={S.st}>⏰ תזכורות יומיות</h3>
        <p style={{fontSize:10,color:"var(--textSec)",margin:"0 0 10px"}}>תזכורות מופיעות במסך הבית של הילדים</p>
        {REMINDERS.map(r=>{const active=activeReminders.includes(r.id);return(
          <div key={r.id} style={{background:"var(--card)",borderRadius:10,padding:12,marginBottom:6,border:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{r.emoji}</span>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{r.label}</div>
              <div style={{fontSize:11,color:"var(--textSec)"}}>{r.time}</div></div>
            <button onClick={()=>{const na=active?activeReminders.filter(x=>x!==r.id):[...activeReminders,r.id];setActiveReminders(na);save({activeReminders:na});}}
              style={{padding:"6px 14px",background:active?"#10b981":"var(--barBg)",border:`1px solid ${active?"#10b98150":"var(--border)"}`,borderRadius:8,color:active?"#fff":"var(--textTer)",fontSize:11,fontWeight:700,cursor:"pointer"}}>{active?"✓ פעיל":"כבוי"}</button>
          </div>
        );})}
        <div style={{marginTop:12,padding:12,background:"#eff6ff",borderRadius:10,border:"1px solid #bfdbfe"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#1e40af",marginBottom:6}}>🔔 התראות דפדפן</div>
          <p style={{fontSize:10,color:"var(--textTer)",margin:"0 0 8px"}}>קבלו התראות כשיש משימות ממתינות (עובד כשהדפדפן פתוח)</p>
          <button onClick={async()=>{if(!("Notification"in window)){flash("הדפדפן לא תומך בהתראות");return;}
            const p=await Notification.requestPermission();flash(p==="granted"?"✅ התראות הופעלו!":"❌ ההתראות נחסמו");}}
            style={{padding:"8px 16px",background:typeof Notification!=="undefined"&&Notification.permission==="granted"?"#10b981":"#6366f1",border:"none",borderRadius:8,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>
            {typeof Notification!=="undefined"&&Notification.permission==="granted"?"✅ התראות פעילות":"🔔 אפשר התראות"}
          </button>
        </div>

        {/* Smart contextual reminders */}
        <div style={{marginTop:14}}>
          <div style={{fontSize:13,fontWeight:800,color:"var(--text)",marginBottom:6}}>💡 תזכורות הקשריות</div>
          <p style={{fontSize:10,color:"var(--textSec)",marginBottom:8}}>תזכורות מיוחדות לפי יום — "אל תשכח ציוד לכדורגל"</p>
          {/* Presets */}
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
            {CONTEXT_REMINDER_PRESETS.map((p,i)=>(
              <button key={i} onClick={()=>setNewContextReminder(r=>({...r,icon:p.icon,text:p.text}))}
                style={{padding:"4px 8px",background:"#f0e6ff",border:"1px solid #c4b5fd",borderRadius:8,fontSize:9,color:"#7c3aed",cursor:"pointer",fontWeight:600}}>
                {p.icon} {p.text.slice(0,14)}…
              </button>
            ))}
          </div>
          {/* New reminder form */}
          <div style={{background:"var(--barBg)",borderRadius:10,padding:10,marginBottom:8}}>
            <div style={{display:"flex",gap:6,marginBottom:6}}>
              <input value={newContextReminder.icon} onChange={e=>setNewContextReminder(r=>({...r,icon:e.target.value}))}
                style={{...S.inp,marginBottom:0,width:44,textAlign:"center"}} placeholder="😀"/>
              <input value={newContextReminder.text} onChange={e=>setNewContextReminder(r=>({...r,text:e.target.value}))}
                style={{...S.inp,marginBottom:0,flex:1}} placeholder="טקסט התזכורת"/>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <select value={newContextReminder.day} onChange={e=>setNewContextReminder(r=>({...r,day:e.target.value}))}
                style={{...S.inp,marginBottom:0,flex:1}}>
                {["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"].map(d=><option key={d}>{d}</option>)}
              </select>
              <input type="time" value={newContextReminder.time} onChange={e=>setNewContextReminder(r=>({...r,time:e.target.value}))}
                style={{...S.inp,marginBottom:0,width:80}}/>
              <button onClick={()=>{if(!newContextReminder.text.trim()){flash("⚠️ חסר טקסט");return;}
                saveContextReminders([...contextReminders,{...newContextReminder,id:"cr_"+Date.now()}]);
                setNewContextReminder({icon:"📌",text:"",day:"ראשון",time:"08:00"});flash("✅ נוסף!");}}
                style={{padding:"6px 10px",background:"#6366f1",border:"none",borderRadius:7,color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                + הוסף
              </button>
            </div>
          </div>
          {contextReminders.map(cr=>(
            <div key={cr.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"var(--card)",borderRadius:8,marginBottom:4,border:"1px solid var(--border)"}}>
              <span>{cr.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:"var(--text)",fontWeight:600}}>{cr.text}</div>
                <div style={{fontSize:9,color:"var(--textTer)"}}>יום {cr.day} ב-{cr.time}</div>
              </div>
              <button onClick={()=>saveContextReminders(contextReminders.filter(r=>r.id!==cr.id))}
                style={{background:"none",border:"none",color:"#ef4444",fontSize:13,cursor:"pointer"}}>🗑</button>
            </div>
          ))}
        </div>
      </>}

      {manageSub==="pins"&&Object.entries(FAMILY).map(([id,m])=>(
        <div key={id} style={{background:"var(--card)",borderRadius:10,padding:10,marginBottom:5,border:"1px solid var(--border)"}}>
          {changePinUser===id?(
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,fontWeight:700,color:m.color}}>{m.name}</span>
              <input style={{...S.inp,marginBottom:0,width:70,textAlign:"center",padding:"5px"}} placeholder="4 ספרות" maxLength={4}
                value={newPinVal} onChange={e=>setNewPinVal(e.target.value.replace(/\D/g,"").slice(0,4))} type="tel"/>
              <button onClick={()=>updatePin(id,newPinVal)} style={{background:"#10b981",border:"none",borderRadius:6,color:"#fff",fontSize:10,padding:"5px 10px",cursor:"pointer"}}>💾</button>
              <button onClick={()=>{setChangePinUser(null);setNewPinVal("");}} style={{background:"none",border:"none",color:"var(--textTer)",cursor:"pointer",fontSize:11}}>✕</button>
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:12,fontWeight:700,color:m.color,flex:1}}>{m.name}</span>
              <span style={{fontSize:10,color:"var(--textQuat)",letterSpacing:3}}>••••</span>
              <button onClick={()=>{setChangePinUser(id);setNewPinVal("");}} style={{padding:"4px 8px",background:"#6366f120",border:"1px solid #6366f150",borderRadius:6,color:"#6366f1",fontSize:10,cursor:"pointer"}}>שנה</button>
            </div>
          )}
        </div>
      ))}

      {manageSub==="log"&&<>
        <h3 style={S.st}>📜 יומן פעולות</h3>
        {auditLog.length===0&&<p style={{textAlign:"center",color:"var(--textSec)",fontSize:11}}>אין פעולות עדיין</p>}
        {auditLog.slice(0,100).map(e=>{const labels={task_done:"✅ ביצוע משימה",approved:"👍 אישור",rejected:"❌ דחייה",penalty_added:"⚠️ קנס",
          task_created:"✨ יצירת משימה",task_deleted:"🗑️ מחיקת משימה",task_updated:"✏️ עדכון משימה",pin_changed:"🔒 שינוי PIN",
          bonus_submitted:"⭐ יוזמה",swap_requested:"🔄 בקשת החלפה",swap_approved:"🔄 החלפה אושרה",swap_rejected:"❌ החלפה נדחתה",
          exam_added:"📝 מבחן",cal_event_added:"📅 אירוע חדש",cal_event_deleted:"🗑️ מחיקת אירוע"};
          return<div key={e.id} style={{background:"#fff",borderRadius:8,padding:"8px 10px",marginBottom:3,border:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>{labels[e.action]||e.action}</div>
              <div style={{fontSize:9,color:"var(--textSec)"}}>{FAMILY[e.by]?.name||"מערכת"} • {new Date(e.ts).toLocaleString("he-IL")}
              {e.childId&&e.childId!==e.by?` • ${FAMILY[e.childId]?.name}`:""}
              {e.title?` • ${e.title}`:""}</div>
            </div>
          </div>;})}
      </>}
    </>
  );
}
