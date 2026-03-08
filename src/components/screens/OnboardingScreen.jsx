import { useState } from 'react';
import { SUGGESTED } from '../../constants.js';

const PARENT_EMOJIS=['👨','👩','🧑','🧔','👴','👵'];
const CHILD_EMOJIS=['🧒','👦','👧','👶','🦁','🐯','🦊','🐧','🦄','🐸'];
const COLORS=['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#06b6d4','#84cc16','#f97316'];
const TASK_CATS=[...new Set(SUGGESTED.map(t=>t.cat))];
const PIN_DEFAULTS=['1234','5678','1111','2222','3333','4444','5555','6666'];
const ALLOWANCE_PRESETS=[0,20,30,50,100,150];

const inp={width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #e2e8f0',background:'#f8fafc',
  fontSize:15,fontFamily:'inherit',outline:'none',textAlign:'right',color:'#1e293b',boxSizing:'border-box'};
const btn=(bg='#6366f1',col='#fff')=>({padding:'11px 22px',borderRadius:12,border:'none',background:bg,color:col,
  fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'});
const chip=(active)=>({padding:'6px 14px',borderRadius:20,border:`1.5px solid ${active?'#6366f1':'#e2e8f0'}`,
  background:active?'#6366f1':'#fff',color:active?'#fff':'#64748b',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'});

export default function OnboardingScreen({onComplete,onJoin,signInWithGoogle}){
  const[step,setStep]=useState(0);
  const[joinMode,setJoinMode]=useState(false);
  const[joinCode,setJoinCode]=useState('');
  const[joinLoading,setJoinLoading]=useState(false);
  const[familyName,setFamilyName]=useState('');
  const[numParents,setNumParents]=useState(1);
  const[parents,setParents]=useState([
    {name:'',emoji:'👨',color:'#6366f1',pin:'1234'},
    {name:'',emoji:'👩',color:'#ec4899',pin:'5678'},
  ]);
  const[children,setChildren]=useState([
    {name:'',emoji:'🧒',color:'#3b82f6',pin:'1111'},
  ]);
  const[selectedTasks,setSelectedTasks]=useState(
    SUGGESTED.filter(t=>['העמסת מדיח','פינוי מדיח','הורדת זבל','סידור החדר','הכנת שיעורים','הצעת מיטה'].includes(t.title))
  );
  const[taskCat,setTaskCat]=useState(TASK_CATS[0]);
  const[allowances,setAllowances]=useState([0]);
  const[emojiPickerFor,setEmojiPickerFor]=useState(null); // {type:'parent'|'child', idx}

  const STEPS=['ברוכים','הורים','ילדים','משימות','דמי כיס'];

  const updateParent=(i,field,val)=>setParents(p=>p.map((x,j)=>j===i?{...x,[field]:val}:x));
  const updateChild=(i,field,val)=>setChildren(c=>c.map((x,j)=>j===i?{...x,[field]:val}:x));
  const addChild=()=>{
    if(children.length>=6)return;
    const idx=children.length;
    setChildren(c=>[...c,{name:'',emoji:CHILD_EMOJIS[idx%CHILD_EMOJIS.length],color:COLORS[(idx+2)%COLORS.length],pin:PIN_DEFAULTS[idx+2]||'0000'}]);
    setAllowances(a=>[...a,0]);
  };
  const removeChild=(i)=>{
    if(children.length<=1)return;
    setChildren(c=>c.filter((_,j)=>j!==i));
    setAllowances(a=>a.filter((_,j)=>j!==i));
  };
  const toggleTask=(t)=>{
    const exists=selectedTasks.find(x=>x.title===t.title);
    setSelectedTasks(exists?selectedTasks.filter(x=>x.title!==t.title):[...selectedTasks,t]);
  };

  const validate=()=>{
    if(step===1){
      const active=parents.slice(0,numParents);
      if(active.some(p=>!p.name.trim())){alert('נא להכניס שם לכל הורה');return false;}
      if(active.some(p=>!/^\d{4}$/.test(p.pin))){alert('קוד PIN חייב להיות 4 ספרות בדיוק');return false;}
    }
    if(step===2){
      if(children.some(c=>!c.name.trim())){alert('נא להכניס שם לכל ילד');return false;}
      if(children.some(c=>!/^\d{4}$/.test(c.pin))){alert('קוד PIN חייב להיות 4 ספרות בדיוק');return false;}
    }
    return true;
  };

  const next=()=>{
    if(!validate())return;
    if(step===2)setAllowances(children.map((_,i)=>allowances[i]??0));
    if(step===4)finish();
    else setStep(s=>s+1);
  };
  const prev=()=>setStep(s=>Math.max(0,s-1));

  const finish=()=>{
    const family={};const childIds=[];const pins={};
    parents.slice(0,numParents).forEach((p,i)=>{
      const id=`parent${i+1}`;
      family[id]={name:p.name.trim(),role:'parent',emoji:p.emoji,color:p.color,weeklyPay:0};
      pins[id]=p.pin;
    });
    children.forEach((c,i)=>{
      const id=`child${i+1}`;
      childIds.push(id);
      family[id]={name:c.name.trim(),role:'child',emoji:c.emoji,color:c.color,weeklyPay:allowances[i]??0};
      pins[id]=c.pin;
    });
    const tasks=selectedTasks.map((t,i)=>({
      id:`t${i+1}`,title:t.title,icon:t.icon,weight:t.weight,
      assignedTo:[...childIds],bonus:false,type:'personal',requirePhoto:false,
    }));
    const initialData={
      tasks,completions:{},pins,
      xp:Object.fromEntries(childIds.map(c=>[c,0])),
      streaks:Object.fromEntries(childIds.map(c=>[c,0])),
      goals:[],swaps:[],activeReminders:['evening'],messages:[],penalties:[],
      earnedBadges:Object.fromEntries(childIds.map(c=>[c,[]])),
      totalXpEarned:Object.fromEntries(childIds.map(c=>[c,0])),
      approvedCount:Object.fromEntries(childIds.map(c=>[c,0])),
      exams:[],calEvents:[],groceries:[],auditLog:[],challenges:[],
      lastSummaryWeek:null,locations:{},
    };
    onComplete({family,children:childIds,pins,familyName:familyName.trim()||'המשפחה שלנו',initialData});
  };

  // ── Shared layout ──
  const wrap={minHeight:'100vh',background:'linear-gradient(140deg,#fef9f0,#f0e6ff 40%,#e0f2fe)',
    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'16px',fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif"};
  const card={background:'#fff',borderRadius:20,padding:'24px 20px',width:'100%',maxWidth:420,
    boxShadow:'0 8px 32px rgba(99,102,241,0.12)',position:'relative',boxSizing:'border-box'};

  // ── Progress bar ──
  const ProgressBar=()=>step>0?(
    <div style={{marginBottom:20}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
        {STEPS.map((s,i)=>(
          <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1}}>
            <div style={{width:24,height:24,borderRadius:12,background:i<step?'#6366f1':i===step?'#6366f1':'#e2e8f0',
              border:i===step?'3px solid #818cf8':'none',display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:10,color:i<=step?'#fff':'#94a3b8',fontWeight:700,transition:'all .3s'}}>
              {i<step?'✓':i+1}
            </div>
          </div>
        ))}
      </div>
      <div style={{height:4,background:'#e2e8f0',borderRadius:2,overflow:'hidden'}}>
        <div style={{height:'100%',background:'linear-gradient(90deg,#6366f1,#8b5cf6)',borderRadius:2,
          width:`${(step/STEPS.length)*100}%`,transition:'width .4s ease'}}/>
      </div>
      <div style={{textAlign:'center',marginTop:6,fontSize:11,color:'#6366f1',fontWeight:600}}>{STEPS[step]}</div>
    </div>
  ):null;

  // ── Emoji picker ──
  const EmojiPicker=({emojis,selected,onSelect})=>(
    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6}}>
      {emojis.map(e=>(
        <button key={e} onClick={()=>onSelect(e)}
          style={{width:34,height:34,borderRadius:10,border:`2px solid ${selected===e?'#6366f1':'#e2e8f0'}`,
            background:selected===e?'#ede9fe':'#f8fafc',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {e}
        </button>
      ))}
    </div>
  );

  // ── Color picker ──
  const ColorPicker=({selected,onSelect})=>(
    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:6}}>
      {COLORS.map(c=>(
        <button key={c} onClick={()=>onSelect(c)}
          style={{width:26,height:26,borderRadius:13,border:`3px solid ${selected===c?'#1e293b':'transparent'}`,
            background:c,cursor:'pointer',outline:'none'}}>
        </button>
      ))}
    </div>
  );

  // ── Join handler ──
  const handleJoin=async()=>{
    const code=joinCode.trim().toUpperCase();
    if(code.length!==6){alert('קוד משפחה חייב להיות 6 תווים');return;}
    setJoinLoading(true);
    try{await onJoin(code);}catch(e){console.error(e);alert('שגיאה בהצטרפות');}
    finally{setJoinLoading(false);}
  };

  // ── Step 0: Welcome ──
  if(step===0)return(
    <div style={wrap}>
      <div style={{...card,textAlign:'center'}}>
        <div style={{fontSize:56,marginBottom:8}}>🏠</div>
        <h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:'0 0 6px'}}>ברוכים הבאים!</h1>
        <p style={{fontSize:13,color:'#64748b',margin:'0 0 6px',lineHeight:1.5}}>אפליקציה לניהול משימות ומעקב<br/>אחר הרגלים בריאים למשפחה שלכם</p>
        <p style={{fontSize:11,color:'#94a3b8',margin:'0 0 22px'}}>⏱️ ההגדרה לוקחת כ-2 דקות</p>
        <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:18,flexWrap:'wrap'}}>
          {['✅ מעקב משימות','🎮 גיימיפיקציה','💰 דמי כיס','📅 לוח שנה'].map(f=>(
            <span key={f} style={{padding:'4px 10px',background:'#ede9fe',borderRadius:20,fontSize:11,color:'#6366f1',fontWeight:600}}>{f}</span>
          ))}
        </div>

        {!joinMode?(
          <>
            <button onClick={next} style={{...btn(),width:'100%',fontSize:15,padding:'13px',marginBottom:10}}>
              🏠 הגדרת משפחה חדשה →
            </button>
            <button onClick={()=>setJoinMode(true)}
              style={{...btn('#f0fdf4','#16a34a'),width:'100%',fontSize:14,padding:'12px',marginBottom:10,border:'1.5px solid #86efac'}}>
              🔗 הצטרפות למשפחה קיימת
            </button>
            {signInWithGoogle&&(
              <button onClick={signInWithGoogle}
                style={{...btn('#fff','#1e293b'),width:'100%',fontSize:13,padding:'11px',border:'1.5px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <span style={{fontSize:18}}>G</span> התחבר עם Google
              </button>
            )}
          </>
        ):(
          <div style={{textAlign:'right'}}>
            <p style={{fontSize:13,color:'#1e293b',fontWeight:700,marginBottom:8,textAlign:'center'}}>🔗 הצטרפות למשפחה קיימת</p>
            <p style={{fontSize:11,color:'#64748b',marginBottom:12,textAlign:'center',lineHeight:1.5}}>
              בקשו מהורה במשפחה את קוד השיתוף בן 6 התווים
            </p>
            <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase().slice(0,6))}
              placeholder="XXXXXX" maxLength={6}
              style={{...inp,textAlign:'center',letterSpacing:6,fontSize:20,fontWeight:700,fontFamily:'monospace',marginBottom:12}}/>
            <button onClick={handleJoin} disabled={joinLoading||joinCode.trim().length!==6}
              style={{...btn('#10b981'),width:'100%',fontSize:14,padding:'12px',marginBottom:8,
                opacity:joinLoading||joinCode.trim().length!==6?0.5:1}}>
              {joinLoading?'⏳ מתחבר...':'✅ הצטרף'}
            </button>
            <button onClick={()=>{setJoinMode(false);setJoinCode('');}}
              style={{...btn('#f1f5f9','#64748b'),width:'100%',fontSize:12,padding:'10px'}}>
              ← חזרה
            </button>
          </div>
        )}

        <p style={{fontSize:10,color:'#94a3b8',marginTop:10}}>🔒 כל הנתונים מסונכרנים בין מכשירי המשפחה</p>
      </div>
    </div>
  );

  // ── Step 1: Parents ──
  if(step===1)return(
    <div style={wrap} dir="rtl">
      <div style={card}>
        <ProgressBar/>
        <h2 style={{fontSize:18,fontWeight:800,color:'#1e293b',margin:'0 0 4px'}}>👨‍👩 מי ההורים?</h2>
        <p style={{fontSize:12,color:'#94a3b8',margin:'0 0 16px'}}>הגדירו מי מנהל את האפליקציה</p>

        {/* Family name */}
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12,color:'#64748b',fontWeight:600,display:'block',marginBottom:4}}>שם המשפחה (אופציונלי)</label>
          <input value={familyName} onChange={e=>setFamilyName(e.target.value)}
            placeholder="לדוגמה: כהן, לוי, הורוביץ..."
            style={inp}/>
        </div>

        {/* Parent count */}
        <div style={{marginBottom:16}}>
          <label style={{fontSize:12,color:'#64748b',fontWeight:600,display:'block',marginBottom:6}}>כמה הורים?</label>
          <div style={{display:'flex',gap:8}}>
            {[1,2].map(n=>(
              <button key={n} onClick={()=>setNumParents(n)}
                style={{...chip(numParents===n),flex:1,padding:'8px'}}>
                {n===1?'הורה אחד':'שני הורים'}
              </button>
            ))}
          </div>
        </div>

        {/* Parents list */}
        {parents.slice(0,numParents).map((p,i)=>(
          <div key={i} style={{background:'#f8fafc',borderRadius:14,padding:'14px',marginBottom:12,
            border:`1.5px solid ${p.color}30`}}>
            <div style={{fontSize:12,fontWeight:700,color:p.color,marginBottom:10}}>
              {p.emoji} הורה {numParents>1?i+1:''}
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:3}}>שם</label>
              <input value={p.name} onChange={e=>updateParent(i,'name',e.target.value)}
                placeholder={i===0?'לדוגמה: אמא, אבא, לירון...':'שם ההורה השני'}
                style={inp}/>
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:3}}>אימוג׳י</label>
              <EmojiPicker emojis={PARENT_EMOJIS} selected={p.emoji} onSelect={e=>updateParent(i,'emoji',e)}/>
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:3}}>צבע</label>
              <ColorPicker selected={p.color} onSelect={c=>updateParent(i,'color',c)}/>
            </div>
            <div>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:3}}>קוד PIN (4 ספרות)</label>
              <input value={p.pin} onChange={e=>updateParent(i,'pin',e.target.value.slice(0,4))}
                type="number" maxLength={4} placeholder="1234"
                style={{...inp,letterSpacing:4,textAlign:'center'}}/>
            </div>
          </div>
        ))}

        <div style={{display:'flex',gap:8,marginTop:4}}>
          {step>0&&<button onClick={prev} style={{...btn('#f1f5f9','#64748b'),flex:1}}>← חזרה</button>}
          <button onClick={next} style={{...btn(),flex:2}}>המשך →</button>
        </div>
      </div>
    </div>
  );

  // ── Step 2: Children ──
  if(step===2)return(
    <div style={wrap} dir="rtl">
      <div style={card}>
        <ProgressBar/>
        <h2 style={{fontSize:18,fontWeight:800,color:'#1e293b',margin:'0 0 4px'}}>👧👦 הילדים שלנו</h2>
        <p style={{fontSize:12,color:'#94a3b8',margin:'0 0 16px'}}>הוסיפו את הילדים שישתתפו ({children.length}/6)</p>

        {children.map((c,i)=>(
          <div key={i} style={{background:'#f8fafc',borderRadius:14,padding:'14px',marginBottom:12,
            border:`1.5px solid ${c.color}40`,position:'relative'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <span style={{fontSize:12,fontWeight:700,color:c.color}}>{c.emoji} ילד {i+1}</span>
              {children.length>1&&(
                <button onClick={()=>removeChild(i)}
                  style={{background:'#fee2e2',border:'none',borderRadius:8,padding:'3px 8px',
                    color:'#ef4444',fontSize:12,cursor:'pointer'}}>✕</button>
              )}
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:3}}>שם</label>
              <input value={c.name} onChange={e=>updateChild(i,'name',e.target.value)}
                placeholder={`שם הילד/ה ${i+1}`} style={inp}/>
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:3}}>אימוג׳י</label>
              <EmojiPicker emojis={CHILD_EMOJIS} selected={c.emoji} onSelect={e=>updateChild(i,'emoji',e)}/>
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:3}}>צבע</label>
              <ColorPicker selected={c.color} onSelect={col=>updateChild(i,'color',col)}/>
            </div>
            <div>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:3}}>קוד PIN (4 ספרות)</label>
              <input value={c.pin} onChange={e=>updateChild(i,'pin',e.target.value.slice(0,4))}
                type="number" maxLength={4} placeholder="1111"
                style={{...inp,letterSpacing:4,textAlign:'center'}}/>
            </div>
          </div>
        ))}

        {children.length<6&&(
          <button onClick={addChild}
            style={{width:'100%',padding:'10px',borderRadius:12,border:'2px dashed #c7d2fe',
              background:'#f5f3ff',color:'#6366f1',fontSize:13,fontWeight:600,cursor:'pointer',marginBottom:12}}>
            + הוסף ילד/ה
          </button>
        )}

        <div style={{display:'flex',gap:8}}>
          <button onClick={prev} style={{...btn('#f1f5f9','#64748b'),flex:1}}>← חזרה</button>
          <button onClick={next} style={{...btn(),flex:2}}>המשך →</button>
        </div>
      </div>
    </div>
  );

  // ── Step 3: Tasks ──
  if(step===3){
    const catTasks=SUGGESTED.filter(t=>t.cat===taskCat);
    return(
      <div style={wrap} dir="rtl">
        <div style={card}>
          <ProgressBar/>
          <h2 style={{fontSize:18,fontWeight:800,color:'#1e293b',margin:'0 0 4px'}}>📋 משימות</h2>
          <p style={{fontSize:12,color:'#94a3b8',margin:'0 0 12px'}}>
            בחרו משימות להתחלה — תוכלו להוסיף/להסיר מאוחר יותר
            <span style={{marginRight:6,fontWeight:700,color:'#6366f1'}}>({selectedTasks.length} נבחרו)</span>
          </p>

          {/* Category tabs */}
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:14}}>
            {TASK_CATS.map(cat=>(
              <button key={cat} onClick={()=>setTaskCat(cat)} style={chip(taskCat===cat)}>{cat}</button>
            ))}
          </div>

          {/* Task list */}
          <div style={{maxHeight:260,overflowY:'auto',marginBottom:14}}>
            {catTasks.map(t=>{
              const sel=selectedTasks.some(x=>x.title===t.title);
              return(
                <div key={t.title} onClick={()=>toggleTask(t)}
                  style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:12,
                    background:sel?'#f0fdf4':'#f8fafc',border:`1.5px solid ${sel?'#86efac':'#e2e8f0'}`,
                    marginBottom:6,cursor:'pointer',transition:'all .15s'}}>
                  <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${sel?'#22c55e':'#cbd5e1'}`,
                    background:sel?'#22c55e':'transparent',display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:12,color:'#fff',flexShrink:0}}>
                    {sel?'✓':''}
                  </div>
                  <span style={{fontSize:16}}>{t.icon}</span>
                  <span style={{fontSize:13,color:'#1e293b',flex:1}}>{t.title}</span>
                  <span style={{fontSize:10,color:'#94a3b8',background:'#f1f5f9',borderRadius:8,padding:'2px 6px'}}>{t.weight}נק׳</span>
                </div>
              );
            })}
          </div>

          <div style={{display:'flex',gap:8}}>
            <button onClick={prev} style={{...btn('#f1f5f9','#64748b'),flex:1}}>← חזרה</button>
            <button onClick={next} style={{...btn(),flex:2}}>המשך →</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 4: Allowances ──
  if(step===4)return(
    <div style={wrap} dir="rtl">
      <div style={card}>
        <ProgressBar/>
        <h2 style={{fontSize:18,fontWeight:800,color:'#1e293b',margin:'0 0 4px'}}>💰 דמי כיס שבועיים</h2>
        <p style={{fontSize:12,color:'#94a3b8',margin:'0 0 16px'}}>הגדירו כמה כל ילד יכול להרוויח בשבוע (ניתן לשנות מאוחר יותר)</p>

        {children.map((c,i)=>(
          <div key={i} style={{background:'#f8fafc',borderRadius:14,padding:'14px',marginBottom:12,
            border:`1.5px solid ${c.color}40`}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <span style={{fontSize:20}}>{c.emoji}</span>
              <span style={{fontSize:14,fontWeight:700,color:'#1e293b'}}>{c.name||`ילד ${i+1}`}</span>
              <span style={{marginRight:'auto',fontSize:16,fontWeight:800,color:c.color}}>
                {allowances[i]??0}₪
              </span>
            </div>
            {/* Presets */}
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
              {ALLOWANCE_PRESETS.map(p=>(
                <button key={p} onClick={()=>setAllowances(a=>a.map((x,j)=>j===i?p:x))}
                  style={{...chip((allowances[i]??0)===p),padding:'5px 10px',fontSize:12}}>
                  {p===0?'ללא':`${p}₪`}
                </button>
              ))}
            </div>
            {/* Custom input */}
            <input type="number" min="0" max="1000"
              value={allowances[i]??0}
              onChange={e=>setAllowances(a=>a.map((x,j)=>j===i?parseInt(e.target.value)||0:x))}
              style={{...inp,textAlign:'center'}}
              placeholder="סכום מותאם אישית"/>
          </div>
        ))}

        <div style={{background:'#fef9c3',border:'1px solid #fde047',borderRadius:12,padding:'10px 12px',marginBottom:14}}>
          <div style={{fontSize:11,color:'#854d0e',lineHeight:1.5}}>
            💡 הסכום הוא <b>מקסימום אפשרי</b> — הילד מרוויח לפי אחוז המשימות שהשלים בשבוע
          </div>
        </div>

        <div style={{display:'flex',gap:8}}>
          <button onClick={prev} style={{...btn('#f1f5f9','#64748b'),flex:1}}>← חזרה</button>
          <button onClick={next} style={{...btn('#22c55e'),flex:2,fontSize:14}}>
            🚀 בואו נתחיל!
          </button>
        </div>
      </div>
    </div>
  );

  return null;
}
