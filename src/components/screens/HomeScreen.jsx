import { FAMILY, CH, DAYS, DEFAULT_BADGES, DEFAULT_CHALLENGES } from '../../constants.js';
import { getHour, getToday } from '../../utils.js';

export default function HomeScreen({S,app}){
  const{user,isP,tasks,completions,cKey,wk,xp,streaks,goals,challenges,messages,swaps,
    getLevel,getNextLevel,getXpProgress,getWeekStats,getFamilyPct,getTodayPctForChild,
    getActiveReminder,setReminderShown,reminderShown,selDay,
    setScreen,setDoneConfirm,setBonusModal,sendNudge,setPenaltyModal,
    setExamModal,approveSwap,rejectSwap,earnedBadges,
    installReady,handleInstall,setInstallReady,
    setShowSummaryModal,setWeeklySummaryData,getWeekCompletionCount,getLeadingChild,getFamilyStreak,getWeekXpTotal,
    locations,setLocations,save,flash}=app;
  const me=FAMILY[user];const today=getToday();
  const activeReminder=getActiveReminder();

  return(
    <>
      {/* Reminder banner */}
      {activeReminder&&!isP&&(
        <div style={{background:"linear-gradient(135deg,#f59e0b20,#f59e0b10)",border:"1px solid #f59e0b40",borderRadius:12,padding:12,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:22}}>{activeReminder.emoji}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#f59e0b"}}>⏰ תזכורת {activeReminder.label}</div>
            <div style={{fontSize:11,color:"#fbbf24"}}>{tasks.filter(t=>app.isTaskForChild(t,user,today)&&!t.bonus&&!completions[cKey(t.id,user,today)]?.done).length} משימות ממתינות</div>
          </div>
          <button onClick={()=>setReminderShown({...reminderShown,[activeReminder.id+selDay]:true})} style={{background:"none",border:"none",color:"#f59e0b",cursor:"pointer",fontSize:16}}>✕</button>
        </div>
      )}

      {/* Greeting */}
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontSize:16,fontWeight:800,color:"var(--text)"}}>
          {getHour()<12?"☀️ בוקר טוב":getHour()<17?"🌤️ צהריים טובים":getHour()<21?"🌆 ערב טוב":"🌙 לילה טוב"}, {me.name}!
        </div>
        <div style={{fontSize:11,color:"var(--textSec)"}}>יום {DAYS[today]}</div>
      </div>

      {/* PWA install prompt */}
      {installReady&&<div style={{background:"linear-gradient(135deg,#6366f120,#8b5cf620)",border:"1px solid #6366f160",borderRadius:12,padding:12,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:22}}>📲</span>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:"#6366f1"}}>להתקין את האפליקציה?</div>
          <div style={{fontSize:9,color:"var(--textTer)"}}>גישה מהירה מהטלפון</div></div>
        <button onClick={handleInstall} style={{padding:"6px 12px",background:"#6366f1",border:"none",borderRadius:8,color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer"}}>התקן</button>
        <button onClick={()=>setInstallReady(false)} style={{background:"none",border:"none",color:"var(--textSec)",cursor:"pointer",fontSize:14}}>✕</button>
      </div>}

      {/* Notification permission (child) */}
      {!isP&&"Notification" in window&&Notification.permission==="default"&&<div style={{background:"#fff7ed",border:"1px solid #f59e0b40",borderRadius:12,padding:10,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:18}}>🔔</span>
        <div style={{flex:1,fontSize:10,color:"#92400e"}}>אפשר התראות לתזכורות</div>
        <button onClick={()=>Notification.requestPermission()} style={{padding:"4px 10px",background:"#f59e0b",border:"none",borderRadius:6,color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer"}}>אפשר</button>
      </div>}

      {/* מי איפה */}
      {(()=>{
        const LOC_OPTIONS=["🏠 בית","🏫 בית ספר","⚽ חוג","🧒 חבר/ה","🛒 קניות","💼 עבודה","🚗 בדרך","🌙 ישן/ה"];
        const allMembers=[...Object.entries(FAMILY)];
        return(
          <div style={{background:"var(--card)",borderRadius:14,padding:12,marginBottom:10,border:"1px solid var(--border)"}}>
            <div style={{fontSize:12,fontWeight:800,color:"var(--text)",marginBottom:8}}>📍 מי איפה עכשיו?</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {allMembers.map(([id,m])=>{
                const loc=locations[id]||"";
                const canEdit=isP||(id===user);
                return(
                  <div key={id} style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,fontWeight:700,color:m.color,minWidth:50}}>{m.name}</span>
                    {canEdit?(
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",flex:1}}>
                        {LOC_OPTIONS.map(o=>(
                          <button key={o} onClick={()=>{const nl={...locations,[id]:loc===o?"":o};setLocations(nl);save({locations:nl});}}
                            style={{padding:"2px 7px",borderRadius:10,border:`1px solid ${loc===o?m.color:"var(--border)"}`,background:loc===o?m.color+"20":"transparent",color:loc===o?m.color:"var(--textTer)",fontSize:9,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
                            {o}
                          </button>
                        ))}
                      </div>
                    ):(
                      <span style={{fontSize:10,color:loc?"var(--textSec)":"var(--textQuat)"}}>{loc||"—"}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Wall teaser */}
      {!isP&&(()=>{
        const myMsgs=messages.filter(m=>m.to===user||m.to==="wall").sort((a,b)=>b.ts-a.ts);
        const unread=myMsgs.filter(m=>m.from!==user&&(Date.now()-m.ts)<86400000).length;
        if(myMsgs.length===0)return null;
        return(
          <button onClick={()=>setScreen("wall")} style={{width:"100%",background:unread>0?"linear-gradient(135deg,#fef3c7,#fffbeb)":"var(--card)",borderRadius:12,padding:10,marginBottom:10,border:unread>0?"1px solid #f59e0b40":"1px solid var(--border)",cursor:"pointer",textAlign:"right"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:18}}>💬</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>קיר משפחתי{unread>0&&<span style={{color:"#f59e0b"}}> ({unread} חדשות)</span>}</div>
                <div style={{fontSize:10,color:"var(--textSec)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{myMsgs[0]?.text?.slice(0,40)}</div>
              </div>
              <span style={{color:"#6366f1",fontSize:10}}>←</span>
            </div>
          </button>
        );
      })()}

      {/* Child: personal stats card */}
      {!isP&&(()=>{
        const st=getWeekStats(user);const lv=getLevel(user);const nxt=getNextLevel(user);
        const todayTasks=tasks.filter(t=>app.isTaskForChild(t,user,today)&&!t.bonus);
        const todayDone=todayTasks.filter(t=>completions[cKey(t.id,user,today)]?.done).length;
        return(
          <>
            {/* Level & XP card */}
            <div style={{background:`linear-gradient(135deg,${FAMILY[user]?.color||'#6366f1'}15,${FAMILY[user]?.color||'#6366f1'}08)`,borderRadius:14,padding:14,marginBottom:10,border:"1px solid #4f46e540"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{fontSize:36}}>{lv.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:800,color:"var(--text)"}}>{lv.name}</div>
                  <div style={{fontSize:10,color:"#6366f1"}}>{xp[user]||0} XP {nxt?`• עוד ${nxt.min-(xp[user]||0)} ל${nxt.name}`:""}</div>
                  <div style={{height:6,background:"var(--barBg)",borderRadius:4,marginTop:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${getXpProgress(user)}%`,background:"linear-gradient(90deg,#6366f1,#8b5cf6)",borderRadius:4,transition:"width 0.5s"}}/>
                  </div>
                </div>
                {(streaks[user]||0)>0&&<div style={{textAlign:"center",background:"#f59e0b20",borderRadius:10,padding:"6px 10px"}}>
                  <div style={{fontSize:16,fontWeight:800,color:"#f59e0b"}}>🔥{streaks[user]}</div>
                  <div style={{fontSize:8,color:"#fbbf24"}}>רצף</div>
                </div>}
              </div>
            </div>

            {/* Streak at risk warning */}
            {(streaks[user]||0)>0&&todayDone<todayTasks.length&&todayTasks.length>0&&(
              <div style={{background:"linear-gradient(135deg,#fef3c7,#fffbeb)",border:"1px solid #f59e0b60",borderRadius:12,padding:10,marginBottom:10,textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#f59e0b"}}>🔥 עוד {todayTasks.length-todayDone} משימ{todayTasks.length-todayDone===1?"ה":"ות"} לשמור על הרצף!</div>
                <div style={{fontSize:10,color:"#fbbf24"}}>רצף נוכחי: {streaks[user]} ימים</div>
              </div>
            )}

            {/* Today progress */}
            <div style={{background:"var(--card)",borderRadius:14,padding:14,marginBottom:10,border:"1px solid var(--border)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>📋 היום</span>
                <span style={{fontSize:12,fontWeight:700,color:todayDone===todayTasks.length?"#10b981":"var(--textTer)"}}>{todayDone}/{todayTasks.length}</span>
              </div>
              <div style={{height:8,background:"var(--barBg)",borderRadius:6,overflow:"hidden",marginBottom:8}}>
                <div style={{height:"100%",width:`${todayTasks.length>0?Math.round((todayDone/todayTasks.length)*100):0}%`,background:todayDone===todayTasks.length?"linear-gradient(90deg,#10b981,#059669)":"linear-gradient(90deg,#f59e0b,#f97316)",borderRadius:6,transition:"width 0.5s"}}/>
              </div>
              {todayTasks.filter(t=>!completions[cKey(t.id,user,today)]?.done).slice(0,4).map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid var(--border)"}}>
                  <span style={{fontSize:14}}>{t.icon}</span>
                  <span style={{fontSize:12,color:"var(--textQuat)",flex:1}}>{t.title}</span>
                  <button onClick={()=>setDoneConfirm({taskId:t.id,childId:user,day:today})} style={{...S.doneBtn,width:28,height:28,fontSize:13,borderRadius:7}}>✓</button>
                </div>
              ))}
              {todayDone===todayTasks.length&&todayTasks.length>0&&(
                <div style={{textAlign:"center",padding:8}}><span style={{fontSize:13,color:"#10b981",fontWeight:700}}>🎉 כל המשימות בוצעו!</span></div>
              )}
              <button onClick={()=>setScreen("tasks")} style={{width:"100%",marginTop:6,padding:8,background:"#6366f120",border:"1px solid #6366f140",borderRadius:10,color:"#6366f1",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                צפה בכל המשימות →
              </button>
            </div>

            {/* Money card */}
            {me.weeklyPay>0&&(
              <div style={{background:"linear-gradient(135deg,#ecfdf5,#d1fae5)",borderRadius:14,padding:14,marginBottom:10,border:"1px solid #10b98140"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:12,color:"#059669"}}>💰 הרווחת השבוע</div>
                    <div style={{fontSize:24,fontWeight:800,color:"var(--text)"}}>{st.earned}₪ <span style={{fontSize:12,color:"#059669"}}>/ {me.weeklyPay}₪</span></div>
                  </div>
                  <div style={{fontSize:28,fontWeight:800,color:"#10b981"}}>{st.pct}%</div>
                </div>
              </div>
            )}

            {/* Badges preview */}
            {(()=>{const myBadges=earnedBadges[user]||[];if(myBadges.length===0)return null;return(
              <div style={{background:"var(--card)",borderRadius:14,padding:12,marginBottom:10,border:"1px solid #f59e0b40"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>🏅 תגים</span>
                  <button onClick={()=>setScreen("badges")} style={{background:"none",border:"none",color:"#6366f1",fontSize:10,cursor:"pointer"}}>צפה בכולם →</button>
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {myBadges.slice(0,6).map(b=>{const badge=DEFAULT_BADGES.find(x=>x.id===(b.id||b));return badge?<span key={b.id||b} title={badge.title} style={{fontSize:20}}>{badge.emoji}</span>:null;})}
                </div>
              </div>
            );})()}
          </>
        );
      })()}

      {/* Parent: overview */}
      {isP&&(
        <>
          {CH.map(cid=>{const m=FAMILY[cid];const lv=getLevel(cid);const st=getWeekStats(cid);
            const todayPct=getTodayPctForChild(cid);
            return(
              <div key={cid} style={{background:"var(--card)",borderRadius:12,padding:12,marginBottom:8,border:"1px solid var(--border)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:13,fontWeight:700,color:m.color}}>{m.name}</span>
                      <span style={{fontSize:10}}>{lv.emoji}</span>
                      {(streaks[cid]||0)>0&&<span style={{fontSize:9,color:"#f59e0b"}}>🔥{streaks[cid]}</span>}
                    </div>
                    <div style={{fontSize:10,color:"var(--textTer)"}}>היום: {todayPct}% • שבוע: {st.pct}% {m.weeklyPay>0?`• ${st.earned}₪`:""}  </div>
                  </div>
                  <button onClick={()=>sendNudge(cid)} style={{width:30,height:30,background:"#6366f115",border:"1px solid #6366f130",borderRadius:8,color:"#6366f1",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginLeft:4}}>👋</button>
                  <button onClick={()=>setPenaltyModal({childId:cid})} style={{width:30,height:30,background:"#ef444415",border:"1px solid #ef444430",borderRadius:8,color:"#ef4444",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginLeft:4}}>⚠️</button>
                  <div style={{width:36,height:36,borderRadius:18,border:`3px solid ${todayPct===100?"#10b981":todayPct>50?m.color:"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"var(--text)"}}>{todayPct}%</div>
                </div>
              </div>
            );
          })}
          <button onClick={()=>setExamModal(true)} style={{width:"100%",padding:10,background:"linear-gradient(135deg,#6366f120,#6366f110)",border:"1px solid #6366f140",borderRadius:12,color:"#6366f1",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10}}>📝 דיווח ציון מבחן</button>
          {(()=>{let cnt=0;tasks.forEach(t=>t.assignedTo.forEach(c=>{for(let d=0;d<7;d++){if(completions[cKey(t.id,c,d)]?.done&&!completions[cKey(t.id,c,d)]?.approved)cnt++;}}));
            return cnt>0&&<button onClick={()=>setScreen("approve")} style={{width:"100%",padding:10,background:"linear-gradient(135deg,#f59e0b20,#f59e0b10)",border:"1px solid #f59e0b40",borderRadius:12,color:"#f59e0b",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10}}>✅ {cnt} ממתינים לאישור →</button>;
          })()}
          {swaps.filter(s=>s.status==="pending").length>0&&(
            <div style={{background:"var(--card)",borderRadius:12,padding:12,marginBottom:10,border:"1px solid #8b5cf640"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#7c3aed",marginBottom:6}}>🔄 בקשות החלפה</div>
              {swaps.filter(s=>s.status==="pending").map(s=>{const t=tasks.find(x=>x.id===s.taskId);return(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 0",borderBottom:"1px solid var(--border)"}}>
                  <span style={{fontSize:12}}>{t?.icon}</span>
                  <span style={{fontSize:11,color:"var(--textQuat)",flex:1}}>{FAMILY[s.from]?.name} → {FAMILY[s.to]?.name}: {t?.title}</span>
                  <button onClick={()=>approveSwap(s.id)} style={S.okBtn}>✓</button>
                  <button onClick={()=>rejectSwap(s.id)} style={S.noBtn}>✕</button>
                </div>
              );})}
            </div>
          )}
        </>
      )}

      {/* Family Goal */}
      <div style={{background:"linear-gradient(135deg,#ede9fe,#ddd6fe)",borderRadius:14,padding:14,border:"1px solid #4f46e580",marginBottom:10}}>
        <div style={{fontSize:13,fontWeight:800,color:"var(--text)",marginBottom:8}}>🎯 יעד משפחתי</div>
        {goals.filter(g=>g.active).map(g=>{
          const fp=getFamilyPct();const achieved=fp>=g.target;
          return(
            <div key={g.id} style={{background:"rgba(99,102,241,0.06)",borderRadius:10,padding:10,marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{fontSize:16}}>{g.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{g.title}</div>
                  <div style={{fontSize:10,color:"#6366f1"}}>{g.desc}</div>
                </div>
                {achieved&&<span style={{fontSize:11,color:"#10b981",fontWeight:700}}>✅ הושג!</span>}
              </div>
              <div style={{height:6,background:"rgba(0,0,0,0.08)",borderRadius:4,overflow:"hidden",marginBottom:4}}>
                <div style={{height:"100%",width:`${Math.min(100,Math.round((fp/g.target)*100))}%`,background:achieved?"#10b981":"#f59e0b",borderRadius:4,transition:"width 0.5s"}}/>
              </div>
              <div style={{fontSize:10,color:"#7c3aed"}}>🎁 פרס: {g.reward} • {fp}%/{g.target}%</div>
            </div>
          );
        })}
      </div>

      {/* Weekly Challenges */}
      {(()=>{const wkCh=challenges.filter(c=>c.week===wk);if(!wkCh.length)return null;
        return<div style={{background:"linear-gradient(135deg,#fef3c7,#fefce8)",borderRadius:14,padding:14,border:"1px solid #f59e0b80",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:800,color:"var(--text)",marginBottom:8}}>🏆 אתגרי השבוע</div>
          {wkCh.map(ch=>{const done=ch.type==="family"?Object.keys(ch.completedBy||{}).length>=CH.length
            :CH.filter(c=>(ch.completedBy||{})[c]).length;
            const total=ch.type==="family"?1:CH.length;
            const pct=ch.type==="family"?(done?100:0):Math.round((done/total)*100);
            return<div key={ch.id} style={{background:"rgba(245,158,11,0.06)",borderRadius:10,padding:10,marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{fontSize:16}}>{ch.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--text)"}}>{ch.title}</div>
                  <div style={{fontSize:10,color:"#92400e"}}>{ch.desc}</div>
                </div>
                {pct===100&&<span style={{fontSize:11,color:"#10b981",fontWeight:700}}>✅</span>}
                <span style={{fontSize:9,color:"#7c3aed",fontWeight:700}}>+{ch.xpReward}XP</span>
              </div>
              <div style={{height:6,background:"rgba(0,0,0,0.08)",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#10b981":"#f59e0b",borderRadius:4,transition:"width 0.5s"}}/>
              </div>
              {ch.type==="individual"&&<div style={{fontSize:9,color:"var(--textSec)",marginTop:3}}>
                {CH.map(c=><span key={c} style={{marginLeft:6}}>{FAMILY[c]?.emoji} {(ch.completedBy||{})[c]?"✅":"⏳"}</span>)}
              </div>}
            </div>;})}
        </div>;
      })()}
    </>
  );
}
