import { useState, useRef, useCallback } from 'react';
import { FAMILY, CH, SUGGESTED, REMINDERS, AUDIT_LABELS, DS } from '../../constants.js';

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
    updatePin, save, flash, storage,
    // Rewards
    rewards, addReward, toggleRewardActive, deleteReward,
    purchaseHistory, fulfillPurchase,
    // Templates
    taskTemplates, saveAsTemplate, applyTemplate, deleteTemplate,
  } = app;
  const saveContextReminders = (r) => { setContextReminders(r); localStorage.setItem('family-context-reminders', JSON.stringify(r)); };
  const importFileRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // ── Touch Drag & Drop ──
  const [touchDragIdx, setTouchDragIdx] = useState(null);
  const [touchDragY, setTouchDragY] = useState(0);
  const [touchOverIdx, setTouchOverIdx] = useState(null);
  const itemRefs = useRef([]);
  const touchStartY = useRef(0);
  const touchStartIdx = useRef(null);

  const onTouchStartDrag = useCallback((idx, e) => {
    touchStartIdx.current = idx;
    touchStartY.current = e.touches[0].clientY;
    setTouchDragIdx(idx);
    setTouchDragY(0);
  }, []);

  const onTouchMoveDrag = useCallback((e) => {
    if (touchStartIdx.current === null) return;
    e.preventDefault();
    const y = e.touches[0].clientY;
    const delta = y - touchStartY.current;
    setTouchDragY(delta);
    // Find which item we're over
    const refs = itemRefs.current;
    for (let i = 0; i < refs.length; i++) {
      if (!refs[i]) continue;
      const rect = refs[i].getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom && i !== touchStartIdx.current) {
        setTouchOverIdx(i);
        return;
      }
    }
  }, []);

  const onTouchEndDrag = useCallback(() => {
    const from = touchStartIdx.current;
    const to = touchOverIdx;
    if (from !== null && to !== null && from !== to) {
      reorderTasks(from, to);
    }
    setTouchDragIdx(null);
    setTouchDragY(0);
    setTouchOverIdx(null);
    touchStartIdx.current = null;
  }, [touchOverIdx, reorderTasks]);

  // ── Rewards management ──
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardIcon, setNewRewardIcon] = useState('🎁');
  const [newRewardCost, setNewRewardCost] = useState(50);

  // ── Templates ──
  const [templateName, setTemplateName] = useState('');

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await storage.list();
      const data = {};
      for (const key of result.keys) {
        const item = await storage.get(key);
        if (item) { try { data[key] = JSON.parse(item.value); } catch { data[key] = item.value; } }
      }
      const cr = localStorage.getItem('family-context-reminders');
      if (cr) { try { data['context-reminders'] = JSON.parse(cr); } catch {} }
      const fc = localStorage.getItem('family-chores_family-config');
      if (fc) { try { data['_familyConfig'] = JSON.parse(fc); } catch { data['_familyConfig'] = fc; } }
      const exportObj = { _version: 1, _exportDate: new Date().toISOString(), _app: 'family-chores', ...data };
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `family-chores-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      flash('💾 הגיבוי הורד בהצלחה!');
    } catch (e) { console.error('Export error:', e); flash('❌ שגיאה בייצוא'); }
    setExporting(false);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const d = JSON.parse(text);
      if (d._app !== 'family-chores') { flash('❌ קובץ לא תקין'); setImporting(false); return; }
      if (d._familyConfig) {
        localStorage.setItem('family-chores_family-config', typeof d._familyConfig === 'string' ? d._familyConfig : JSON.stringify(d._familyConfig));
      }
      const skip = ['_version', '_exportDate', '_app', '_familyConfig'];
      for (const [key, value] of Object.entries(d)) {
        if (skip.includes(key)) continue;
        if (key === 'context-reminders') { localStorage.setItem('family-context-reminders', JSON.stringify(value)); continue; }
        await storage.set(key, JSON.stringify(value));
      }
      flash('✅ ייבוא הושלם! טוען מחדש...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) { console.error('Import error:', e); flash('❌ קובץ לא תקין'); }
    setImporting(false);
    e.target.value = '';
  };

  const nonBonusTasks = tasks.filter(t => !t.bonus);

  return (
    <>
      <div style={{display:"flex",gap:3,marginBottom:12,overflowX:"auto",paddingBottom:2}} role="tablist" aria-label="הגדרות">
        {[{id:"tasks",l:"📋",a:"משימות"},{id:"add",l:"➕",a:"הוספה"},{id:"suggest",l:"💡",a:"הצעות"},{id:"weights",l:"⚖️",a:"משקלות"},{id:"goals",l:"🎯",a:"יעדים"},{id:"reminders",l:"⏰",a:"תזכורות"},{id:"templates",l:"📄",a:"תבניות"},{id:"rewards",l:"🎁",a:"פרסים"},{id:"pins",l:"🔒",a:"קודים"},{id:"log",l:"📜",a:"יומן"},{id:"data",l:"💾",a:"גיבוי"}].map(t=>(
          <button key={t.id} onClick={()=>setManageSub(t.id)} role="tab" aria-selected={manageSub===t.id} aria-label={t.a}
            style={{...S.subT,...(manageSub===t.id?{background:"#6366f1",color:"#fff"}:{})}}><span aria-hidden="true">{t.l}</span></button>
        ))}
      </div>

      {manageSub==="tasks"&&(
        <div onTouchMove={onTouchMoveDrag} onTouchEnd={onTouchEndDrag} style={{touchAction:touchDragIdx!==null?'none':'auto'}}>
          {nonBonusTasks.map((t,idx)=>(
          <div key={t.id} ref={el=>itemRefs.current[idx]=el}
            draggable onDragStart={()=>setDragIdx(idx)} onDragOver={e=>{e.preventDefault();setDragOverIdx(idx);}}
            onDrop={()=>{if(dragIdx!==null&&dragIdx!==idx)reorderTasks(dragIdx,idx);setDragIdx(null);setDragOverIdx(null);}}
            onDragEnd={()=>{setDragIdx(null);setDragOverIdx(null);}}
            style={{background:"var(--card)",borderRadius:10,padding:10,marginBottom:5,border:"1px solid var(--border)",
              opacity:dragIdx===idx||touchDragIdx===idx?0.5:1,
              borderTop:(dragOverIdx===idx&&dragIdx!==null&&dragIdx>idx)||(touchOverIdx===idx&&touchDragIdx!==null&&touchDragIdx>idx)?"2px solid #6366f1":undefined,
              borderBottom:(dragOverIdx===idx&&dragIdx!==null&&dragIdx<idx)||(touchOverIdx===idx&&touchDragIdx!==null&&touchDragIdx<idx)?"2px solid #6366f1":undefined,
              cursor:"grab",
              transform:touchDragIdx===idx?`translateY(${touchDragY}px)`:'none',
              zIndex:touchDragIdx===idx?100:1,
              transition:touchDragIdx===idx?'none':'transform 0.15s',
              position:'relative'}}>
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
                <div style={{marginBottom:6}}>
                  <div style={{fontSize:9,color:"var(--textSec)",marginBottom:3}}>ימים פעילים (ריק = כל יום):</div>
                  <div style={{display:"flex",gap:3}}>
                    {DS.map((d,i)=>{const active=t.activeDays?t.activeDays.includes(i):false;return(
                      <button key={i} onClick={()=>{const cur=t.activeDays||[];const nd=active?cur.filter(x=>x!==i):[...cur,i];updateTask(t.id,{activeDays:nd.length===0||nd.length===7?null:nd.sort()});}}
                        style={{width:28,height:28,fontSize:10,fontWeight:700,borderRadius:7,cursor:"pointer",border:active?"2px solid #6366f1":"1px solid var(--border)",background:active?"#6366f120":"var(--barBg)",color:active?"#6366f1":"var(--textTer)"}}>{d}</button>
                    );})}
                  </div>
                </div>
                <button onClick={()=>{setEditTask(null);save();flash("💾");}} style={{padding:"6px 14px",background:"#10b981",border:"none",borderRadius:7,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>💾</button>
              </div>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span onTouchStart={(e)=>onTouchStartDrag(idx,e)}
                  style={{fontSize:14,cursor:"grab",color:"var(--textSec)",userSelect:"none",padding:'6px 4px',touchAction:'none',minWidth:28,textAlign:'center'}}>⠿</span>
                <span style={{fontSize:16}}>{t.icon}</span>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{t.title}</div>
                  <div style={{fontSize:9,color:"var(--textTer)"}}>{t.weight}נק׳ • {t.assignedTo.map(c=>FAMILY[c]?.name).join(", ")} {t.type==="shared"?"• 📋 רוטציה":""}{t.activeDays?` • 📅 ${t.activeDays.map(d=>DS[d]).join(",")}`:""}</div></div>
                <button onClick={()=>setEditTask(t.id)} style={S.eBtn} aria-label={`עריכת ${t.title}`}>✏️</button>
                <button onClick={()=>deleteTask(t.id)} style={S.dBtn} aria-label={`מחיקת ${t.title}`}>🗑</button>
              </div>
            )}
          </div>
        ))}
        </div>
      )}

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
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:"var(--textSec)",marginBottom:4}}>📅 ימים פעילים (ריק = כל יום):</div>
            <div style={{display:"flex",gap:3}}>
              {DS.map((d,i)=>{const active=newTask.activeDays?newTask.activeDays.includes(i):false;return(
                <button key={i} onClick={()=>{const cur=newTask.activeDays||[];const nd=active?cur.filter(x=>x!==i):[...cur,i];setNewTask({...newTask,activeDays:nd.length===0||nd.length===7?null:nd.sort()});}}
                  style={{width:28,height:28,fontSize:10,fontWeight:700,borderRadius:7,cursor:"pointer",border:active?"2px solid #6366f1":"1px solid var(--border)",background:active?"#6366f120":"var(--barBg)",color:active?"#6366f1":"var(--textTer)"}}>{d}</button>
              );})}
            </div>
          </div>
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

      {/* ── Templates Tab ── */}
      {manageSub==="templates"&&<>
        <h3 style={S.st}>📄 תבניות משימות</h3>
        <p style={{fontSize:10,color:"var(--textSec)",margin:"0 0 12px"}}>שמרו תבנית של המשימות הנוכחיות והחילו אותה בעתיד</p>

        {/* Save as template */}
        <div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:12,border:"1px solid var(--border)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--text)",marginBottom:8}}>💾 שמירת תבנית חדשה</div>
          <div style={{display:"flex",gap:6}}>
            <input value={templateName} onChange={e=>setTemplateName(e.target.value)}
              placeholder="שם התבנית (למשל: שבוע רגיל)" style={{...S.inp,marginBottom:0,flex:1}}/>
            <button onClick={()=>{saveAsTemplate(templateName);setTemplateName('');}}
              style={{padding:"8px 14px",background:"#6366f1",border:"none",borderRadius:8,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
              💾 שמור
            </button>
          </div>
          <div style={{fontSize:9,color:"var(--textSec)",marginTop:6}}>
            יישמרו {nonBonusTasks.length} משימות (ללא בונוסים)
          </div>
        </div>

        {/* Template list */}
        {taskTemplates.length===0?(
          <div style={{textAlign:"center",padding:20,color:"var(--textSec)",fontSize:11}}>
            <div style={{fontSize:28,marginBottom:6}}>📄</div>
            אין תבניות שמורות
          </div>
        ):(
          taskTemplates.map(tpl=>(
            <div key={tpl.id} style={{background:"var(--card)",borderRadius:10,padding:12,marginBottom:6,border:"1px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                <span style={{fontSize:16}}>📄</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{tpl.name}</div>
                  <div style={{fontSize:9,color:"var(--textSec)"}}>
                    {tpl.tasks.length} משימות • {new Date(tpl.ts).toLocaleDateString('he-IL')}
                  </div>
                </div>
                <button onClick={()=>deleteTemplate(tpl.id)}
                  style={S.dBtn}>🗑</button>
              </div>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>{if(confirm('להחליף את כל המשימות הנוכחיות?'))applyTemplate(tpl.id,'replace');}}
                  style={{flex:1,padding:"7px 0",background:"#6366f1",border:"none",borderRadius:8,color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer"}}>
                  🔄 החלף הכל
                </button>
                <button onClick={()=>applyTemplate(tpl.id,'merge')}
                  style={{flex:1,padding:"7px 0",background:"#10b981",border:"none",borderRadius:8,color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer"}}>
                  ➕ מזג חדשות
                </button>
              </div>
            </div>
          ))
        )}
      </>}

      {/* ── Rewards Management Tab ── */}
      {manageSub==="rewards"&&<>
        <h3 style={S.st}>🎁 ניהול פרסים</h3>

        {/* Pending purchases */}
        {(()=>{const pending=purchaseHistory.filter(p=>p.status==='pending');
          if(pending.length===0)return null;
          return(
            <div style={{background:"#fef3c7",borderRadius:12,padding:12,marginBottom:12,border:"1px solid #fde047"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#92400e",marginBottom:8}}>⏳ רכישות ממתינות ({pending.length})</div>
              {pending.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #fde04780"}}>
                  <span style={{fontSize:16}}>{p.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#1e293b"}}>{p.title}</div>
                    <div style={{fontSize:9,color:"#92400e"}}>{FAMILY[p.childId]?.name} • {p.cost} XP • {new Date(p.ts).toLocaleDateString('he-IL')}</div>
                  </div>
                  <button onClick={()=>fulfillPurchase(p.id)}
                    style={{padding:"5px 10px",background:"#10b981",border:"none",borderRadius:7,color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer"}}>
                    ✅ סופק
                  </button>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Add reward */}
        <div style={{background:"var(--card)",borderRadius:12,padding:14,marginBottom:12,border:"1px solid var(--border)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--text)",marginBottom:8}}>➕ הוספת פרס חדש</div>
          <div style={{display:"flex",gap:6,marginBottom:6}}>
            <input value={newRewardIcon} onChange={e=>setNewRewardIcon(e.target.value)}
              style={{...S.inp,marginBottom:0,width:44,textAlign:"center"}} placeholder="🎁"/>
            <input value={newRewardTitle} onChange={e=>setNewRewardTitle(e.target.value)}
              style={{...S.inp,marginBottom:0,flex:1}} placeholder="שם הפרס"/>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <span style={{fontSize:10,color:"var(--textSec)"}}>עלות:</span>
            <input type="number" value={newRewardCost} onChange={e=>setNewRewardCost(parseInt(e.target.value)||0)}
              style={{...S.inp,marginBottom:0,width:70,textAlign:"center"}} min="1"/>
            <span style={{fontSize:10,color:"var(--textSec)"}}>XP</span>
            <button onClick={()=>{if(!newRewardTitle.trim()){flash('⚠️ חסר שם');return;}
              addReward(newRewardTitle,newRewardIcon,newRewardCost);setNewRewardTitle('');setNewRewardIcon('🎁');setNewRewardCost(50);}}
              style={{padding:"8px 14px",background:"#6366f1",border:"none",borderRadius:8,color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",marginRight:"auto",marginLeft:0}}>
              ➕ הוסף
            </button>
          </div>
        </div>

        {/* Reward list */}
        {rewards.map(r=>(
          <div key={r.id} style={{background:"var(--card)",borderRadius:10,padding:10,marginBottom:4,border:`1px solid ${r.active?'#10b98140':'var(--border)'}`,
            display:"flex",alignItems:"center",gap:8,opacity:r.active?1:0.6}}>
            <span style={{fontSize:18}}>{r.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{r.title}</div>
              <div style={{fontSize:9,color:"var(--textSec)"}}>{r.cost} XP</div>
            </div>
            <button onClick={()=>toggleRewardActive(r.id)}
              style={{padding:"4px 10px",background:r.active?"#10b98120":"var(--barBg)",border:`1px solid ${r.active?"#10b98150":"var(--border)"}`,borderRadius:7,color:r.active?"#10b981":"var(--textTer)",fontSize:10,cursor:"pointer"}}>
              {r.active?"פעיל":"כבוי"}
            </button>
            <button onClick={()=>deleteReward(r.id)} style={S.dBtn}>🗑</button>
          </div>
        ))}
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

      {manageSub==="data"&&<>
        <h3 style={S.st}>💾 ייצוא/ייבוא נתונים</h3>
        <p style={{fontSize:10,color:"var(--textSec)",margin:"0 0 12px"}}>גבו את כל הנתונים כקובץ JSON, או שחזרו ממכשיר אחר</p>
        <div style={{background:"var(--card)",borderRadius:12,padding:16,marginBottom:10,border:"1px solid var(--border)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:6}}>📤 ייצוא</div>
          <p style={{fontSize:10,color:"var(--textSec)",margin:"0 0 10px"}}>הורד קובץ גיבוי עם כל המשימות, ההשלמות, הנקודות ושאר הנתונים</p>
          <button onClick={handleExport} disabled={exporting}
            style={{width:"100%",padding:12,background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:exporting?"wait":"pointer",opacity:exporting?0.7:1}}>
            {exporting?"⏳ מייצא...":"📥 הורד גיבוי"}
          </button>
        </div>
        <div style={{background:"var(--card)",borderRadius:12,padding:16,marginBottom:10,border:"1px solid var(--border)"}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:6}}>📥 ייבוא</div>
          <p style={{fontSize:10,color:"var(--textSec)",margin:"0 0 10px"}}>שחזר נתונים מקובץ גיבוי — ⚠️ הנתונים הנוכחיים יוחלפו!</p>
          <input ref={importFileRef} type="file" accept=".json" onChange={handleImport} style={{display:"none"}}/>
          <button onClick={()=>{if(confirm('שחזור מגיבוי יחליף את כל הנתונים הנוכחיים. להמשיך?'))importFileRef.current?.click();}} disabled={importing}
            style={{width:"100%",padding:12,background:"linear-gradient(135deg,#f59e0b,#d97706)",border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:importing?"wait":"pointer",opacity:importing?0.7:1}}>
            {importing?"⏳ מייבא...":"📂 בחר קובץ גיבוי"}
          </button>
        </div>
        <div style={{background:"#eff6ff",borderRadius:10,padding:12,border:"1px solid #bfdbfe"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#1e40af",marginBottom:4}}>💡 טיפ</div>
          <p style={{fontSize:10,color:"#1e40af",margin:0}}>מומלץ לגבות לפני שינויים גדולים. הקובץ כולל: משימות, השלמות, ציונים, XP, אירועים, רשימת קניות, הודעות ועוד.</p>
        </div>
      </>}

      {manageSub==="log"&&<>
        <h3 style={S.st}>📜 יומן פעולות</h3>
        {auditLog.length===0&&<p style={{textAlign:"center",color:"var(--textSec)",fontSize:11}}>אין פעולות עדיין</p>}
        {auditLog.slice(0,100).map(e=>{const labels={task_done:"✅ ביצוע משימה",approved:"👍 אישור",rejected:"❌ דחייה",penalty_added:"⚠️ קנס",
          task_created:"✨ יצירת משימה",task_deleted:"🗑️ מחיקת משימה",task_updated:"✏️ עדכון משימה",pin_changed:"🔒 שינוי PIN",
          bonus_submitted:"⭐ יוזמה",swap_requested:"🔄 בקשת החלפה",swap_approved:"🔄 החלפה אושרה",swap_rejected:"❌ החלפה נדחתה",
          exam_added:"📝 מבחן",cal_event_added:"📅 אירוע חדש",cal_event_deleted:"🗑️ מחיקת אירוע",
          reward_purchased:"🎁 רכישת פרס",template_applied:"📄 החלת תבנית",login:"🔑 כניסה"};
          return<div key={e.id} style={{background:"var(--card)",borderRadius:8,padding:"8px 10px",marginBottom:3,border:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8}}>
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
