import { FAMILY, CH, DS, DEFAULT_BADGES } from '../../constants.js';
import XPBarChart from '../charts/XPBarChart.jsx';
import WeeklyProgressChart from '../charts/WeeklyProgressChart.jsx';
import TaskPieChart from '../charts/TaskPieChart.jsx';

export default function DashboardScreen({ S, app }) {
  const {
    tasks, completions, streaks, exams, earnedBadges, cKey, wk,
    getWeekCompletionCount, getLeadingChild, getFamilyStreak, getWeekXpTotal,
    getWeekStats, getHeatmapData, getRecentAchievements, getWeeklyXpData,
    setShowSummaryModal, setWeeklySummaryData, isTaskForChild,
    auditLog,
  } = app;

  const wc=getWeekCompletionCount();const wcPct=wc.total>0?Math.round((wc.done/wc.total)*100):0;
  const leading=getLeadingChild();const famStreak=getFamilyStreak();const weekXp=getWeekXpTotal();
  const heatmap=getHeatmapData();const heatMax=Math.max(1,...heatmap.flat());
  const achievements=getRecentAchievements();
  const xpData=getWeeklyXpData();

  // Daily completion % per child (for line chart)
  const dailyData={};
  CH.forEach(cid=>{dailyData[cid]=[];
    for(let d=0;d<7;d++){const dt=tasks.filter(t=>isTaskForChild(t,cid,d)&&!t.bonus);
      const done=dt.filter(t=>completions[cKey(t.id,cid,d)]?.done).length;
      dailyData[cid].push(dt.length>0?Math.round((done/dt.length)*100):0);}});

  // Task type distribution (for pie chart)
  const pieData=[
    {label:"אישי",value:tasks.filter(t=>!t.bonus&&t.type!=="shared").length,color:"#6366f1"},
    {label:"רוטציה",value:tasks.filter(t=>!t.bonus&&t.type==="shared").length,color:"#10b981"},
    {label:"יוזמות",value:tasks.filter(t=>t.bonus).length,color:"#f59e0b"},
  ];

  // ── PDF Report ──
  const generateWeeklyReport = () => {
    const childStats = CH.map(cid => {
      const st = getWeekStats(cid);
      const m = FAMILY[cid];
      return { cid, name: m.name, emoji: m.emoji, color: m.color, ...st, streak: streaks[cid] || 0, xp: xpData[cid] || 0 };
    });
    const dateStr = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const html = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>דוח שבועי - משימות המשפחה</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;background:#fff;color:#1e293b;padding:24px;max-width:700px;margin:0 auto}
h1{font-size:22px;text-align:center;margin-bottom:4px;color:#6366f1}
.subtitle{text-align:center;color:#94a3b8;font-size:12px;margin-bottom:20px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center}
.card .big{font-size:28px;font-weight:800}
.card .label{font-size:10px;color:#64748b;margin-top:4px}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:right;font-size:12px}
th{background:#f1f5f9;font-weight:700;color:#6366f1}
tr:nth-child(even){background:#fafafa}
.footer{text-align:center;color:#94a3b8;font-size:10px;margin-top:20px;border-top:1px solid #e2e8f0;padding-top:12px}
@media print{body{padding:12px}@page{margin:1cm}}
</style></head><body>
<h1>🏠 דוח שבועי - משימות המשפחה</h1>
<div class="subtitle">📅 ${dateStr}</div>
<div class="grid">
  <div class="card"><div class="big">${wc.done}/${wc.total}</div><div class="label">משימות הושלמו (${wcPct}%)</div></div>
  <div class="card"><div class="big">${weekXp}</div><div class="label">XP שחולקו</div></div>
  <div class="card"><div class="big">${famStreak}</div><div class="label">ימי סטריק משפחתי 🔥</div></div>
  <div class="card"><div class="big">${FAMILY[leading]?.emoji||''}</div><div class="label">מוביל/ה: ${FAMILY[leading]?.name||''}</div></div>
</div>
<h2 style="font-size:16px;margin-bottom:8px">📊 סיכום לפי ילד</h2>
<table>
  <tr><th>ילד/ה</th><th>ביצוע %</th><th>בוצעו</th><th>אושרו</th><th>XP</th><th>סטריק</th>${CH.some(c=>FAMILY[c].weeklyPay>0)?'<th>הרווח</th>':''}</tr>
  ${childStats.map(c=>`<tr>
    <td style="color:${c.color};font-weight:700">${c.emoji} ${c.name}</td>
    <td>${c.pct}%</td>
    <td>${c.dc}/${c.tc}</td>
    <td>${c.ac}</td>
    <td>${c.xp}</td>
    <td>${c.streak} ימים</td>
    ${FAMILY[c.cid].weeklyPay>0?`<td>${c.earned}₪/${FAMILY[c.cid].weeklyPay}₪</td>`:''}
  </tr>`).join('')}
</table>
<div class="footer">🤖 נוצר אוטומטית ע"י אפליקציית משימות המשפחה</div>
</body></html>`;

    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 500);
    }
  };

  // ── Analytics: Day-of-week completions ──
  const dayOfWeekData = (() => {
    const counts = Array(7).fill(0);
    Object.entries(completions).forEach(([key, comp]) => {
      if (!comp?.done) return;
      const parts = key.split('_');
      const day = parseInt(parts[parts.length - 1]);
      if (!isNaN(day) && day >= 0 && day < 7) counts[day]++;
    });
    return counts;
  })();
  const dayMax = Math.max(1, ...dayOfWeekData);

  // ── Analytics: Recent activity (7 days) ──
  const recentActivity = (() => {
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const recent = auditLog ? auditLog.filter(e => e.ts > sevenDaysAgo) : [];
    const types = {};
    recent.forEach(e => {
      types[e.action] = (types[e.action] || 0) + 1;
    });
    return { total: recent.length, types };
  })();

  // ── Analytics: This week vs last week ──
  const weekTrend = (() => {
    const thisWeekPct = wcPct;
    // Estimate last week from audit log
    const twoWeeksAgo = Date.now() - 14 * 86400000;
    const oneWeekAgo = Date.now() - 7 * 86400000;
    const lastWeekApprovals = auditLog ? auditLog.filter(e => e.action === 'approved' && e.ts > twoWeeksAgo && e.ts < oneWeekAgo).length : 0;
    const thisWeekApprovals = auditLog ? auditLog.filter(e => e.action === 'approved' && e.ts > oneWeekAgo).length : 0;
    return { thisWeekPct, lastWeekApprovals, thisWeekApprovals };
  })();

  return (
    <>
      <h2 style={S.st}>📊 דוחות וסטטיסטיקות</h2>
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        <button onClick={()=>{const wc=getWeekCompletionCount();const leading=getLeadingChild();
          setWeeklySummaryData({completionPct:wc.total>0?Math.round((wc.done/wc.total)*100):0,leading,
            perChild:CH.map(cid=>{const st=getWeekStats(cid);return{cid,...st};}),familyStreak:getFamilyStreak(),totalXp:getWeekXpTotal()});
          setShowSummaryModal(true);}}
          style={{flex:1,padding:10,background:"linear-gradient(135deg,#6366f120,#6366f110)",border:"1px solid #6366f140",borderRadius:12,color:"#6366f1",fontSize:12,fontWeight:700,cursor:"pointer"}}>
          📊 סיכום שבועי
        </button>
        <button onClick={generateWeeklyReport}
          style={{flex:1,padding:10,background:"linear-gradient(135deg,#10b98120,#10b98110)",border:"1px solid #10b98140",borderRadius:12,color:"#10b981",fontSize:12,fontWeight:700,cursor:"pointer"}}>
          📄 הורד דוח PDF
        </button>
      </div>

      {/* SummaryCards 2x2 */}
      <div style={S.rpGrid}>
        <div style={{...S.rpCard,background:"linear-gradient(135deg,#ecfdf5,#d1fae5)"}}>
          <div style={S.rpBig}>{wc.done}/{wc.total}</div>
          <div style={{fontSize:16,fontWeight:800,color:"#10b981"}}>{wcPct}%</div>
          <div style={S.rpLabel}>משימות הושלמו השבוע</div>
        </div>
        <div style={{...S.rpCard,background:"linear-gradient(135deg,#fef3c7,#fffbeb)"}}>
          <div style={{fontSize:28}}>{FAMILY[leading]?.emoji}</div>
          <div style={{fontSize:16,fontWeight:800,color:FAMILY[leading]?.color}}>{FAMILY[leading]?.name}</div>
          <div style={S.rpLabel}>הילד/ה המוביל/ה 🏆</div>
        </div>
        <div style={{...S.rpCard,background:"linear-gradient(135deg,#fff7ed,#ffedd5)"}}>
          <div style={S.rpBig}>{famStreak}</div>
          <div style={{fontSize:11,color:"#ea580c",fontWeight:700}}>ימים</div>
          <div style={S.rpLabel}>סטריק משפחתי 🔥</div>
        </div>
        <div style={{...S.rpCard,background:"linear-gradient(135deg,#ede9fe,#ddd6fe)"}}>
          <div style={S.rpBig}>{weekXp}</div>
          <div style={{fontSize:11,color:"#7c3aed",fontWeight:700}}>XP</div>
          <div style={S.rpLabel}>נקודות חולקו השבוע</div>
        </div>
      </div>

      {/* SVG Charts */}
      <div style={S.rpSection}>
        <div style={S.rpSt}>📈 התקדמות שבועית</div>
        <p style={{fontSize:9,color:"var(--textSec)",margin:"0 0 6px"}}>אחוז ביצוע יומי לכל ילד</p>
        <WeeklyProgressChart dailyData={dailyData} DS={DS} FAMILY={FAMILY} CH={CH}/>
      </div>

      <div style={{display:"flex",gap:8}}>
        <div style={{...S.rpSection,flex:1}}>
          <div style={S.rpSt}>🏆 XP השבוע</div>
          <XPBarChart data={xpData} FAMILY={FAMILY} CH={CH}/>
        </div>
        <div style={{...S.rpSection,flex:1}}>
          <div style={S.rpSt}>📋 סוגי משימות</div>
          <TaskPieChart data={pieData}/>
        </div>
      </div>

      {/* ── Analytics Section ── */}
      <div style={S.rpSection}>
        <div style={S.rpSt}>📈 ניתוח שימוש</div>

        {/* Day-of-week bar chart */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:8,textAlign:'center'}}>📅 ימי שיא</div>
          <div style={{display:'flex',gap:4,alignItems:'flex-end',justifyContent:'center',height:80}}>
            {dayOfWeekData.map((count, d) => {
              const pct = count / dayMax;
              return (
                <div key={d} style={{display:'flex',flexDirection:'column',alignItems:'center',flex:1}}>
                  <div style={{fontSize:8,color:'var(--textSec)',marginBottom:2}}>{count}</div>
                  <div style={{width:'100%',maxWidth:30,height:Math.max(4, pct * 60),
                    background:`rgba(99,102,241,${0.3 + pct * 0.7})`,borderRadius:'4px 4px 0 0',transition:'height 0.3s'}}/>
                  <div style={{fontSize:9,color:'var(--textTer)',marginTop:3,fontWeight:600}}>{DS[d]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Week trend */}
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          <div style={{flex:1,background:'var(--barBg)',borderRadius:10,padding:10,textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:800,color:weekTrend.thisWeekApprovals>=weekTrend.lastWeekApprovals?'#10b981':'#f59e0b'}}>
              {weekTrend.thisWeekApprovals>=weekTrend.lastWeekApprovals?'📈':'📉'}
            </div>
            <div style={{fontSize:10,color:'var(--textTer)',marginTop:2}}>
              השבוע: {weekTrend.thisWeekApprovals} אישורים
            </div>
            <div style={{fontSize:9,color:'var(--textSec)'}}>
              שבוע שעבר: {weekTrend.lastWeekApprovals}
            </div>
          </div>
          <div style={{flex:1,background:'var(--barBg)',borderRadius:10,padding:10,textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:800,color:'#6366f1'}}>{recentActivity.total}</div>
            <div style={{fontSize:10,color:'var(--textTer)',marginTop:2}}>פעולות ב-7 ימים</div>
            <div style={{fontSize:9,color:'var(--textSec)'}}>
              {Object.entries(recentActivity.types).slice(0,3).map(([k,v])=>{
                const labels={approved:'אישורים',task_done:'ביצועים',login:'כניסות',penalty_added:'קנסות'};
                return `${labels[k]||k}: ${v}`;
              }).join(' • ')}
            </div>
          </div>
        </div>
      </div>

      {/* CompletionChart */}
      <div style={S.rpSection}>
        <div style={S.rpSt}>📊 ביצוע לפי ילד</div>
        {CH.map(cid=>{const st=getWeekStats(cid);const m=FAMILY[cid];return(
          <div key={cid} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:11,fontWeight:700,color:m.color}}>{m.emoji} {m.name}</span>
              <span style={{fontSize:12,fontWeight:800,color:m.color}}>{st.pct}%</span>
            </div>
            <div style={S.rpBarBg}>
              <div style={{...S.rpBar,width:`${st.pct}%`,background:`linear-gradient(90deg,${m.color},${m.color}cc)`}}/>
            </div>
            <div style={{display:"flex",gap:4,fontSize:9,color:"var(--textTer)"}}>
              <span>בוצעו: {st.dc}</span><span>•</span><span>אושרו: {st.ac}</span><span>•</span><span>חסרים: {st.tc-st.dc}</span>
              {m.weeklyPay>0&&<><span>•</span><span style={{color:"#10b981",fontWeight:700}}>{st.earned}₪/{m.weeklyPay}₪</span></>}
            </div>
          </div>
        );})}
      </div>

      {/* WeeklyHeatmap */}
      <div style={S.rpSection}>
        <div style={S.rpSt}>🗓️ מתי מבוצעות משימות</div>
        <div style={S.rpHeatGrid}>
          {/* Header row */}
          <div/>
          {Array.from({length:24},(_, h)=>
            <div key={h} style={{textAlign:"center",color:"var(--textSec)",fontSize:7,lineHeight:"12px"}}>{h%6===0?h:""}</div>
          )}
          {/* Day rows */}
          {[0,1,2,3,4,5,6].map(day=><div key={day} style={{display:"contents"}}>
            <div style={{fontSize:9,color:"var(--textTer)",display:"flex",alignItems:"center",fontWeight:600}}>{DS[day]}</div>
            {heatmap[day].map((count,h)=>{
              const intensity=count>0?Math.min(1,count/heatMax*1.5):0;
              return<div key={h} style={{...S.rpHeatCell,background:intensity>0?`rgba(99,102,241,${0.15+intensity*0.75})`:"var(--barBg)",
                borderRadius:2}} title={`${DS[day]} ${h}:00 — ${count} משימות`}/>;
            })}
          </div>)}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:6,fontSize:8,color:"var(--textSec)"}}>
          <span>פחות</span>
          {[0,0.25,0.5,0.75,1].map((v,i)=><div key={i} style={{width:10,height:10,borderRadius:2,background:v===0?"var(--barBg)":`rgba(99,102,241,${0.15+v*0.75})`}}/>)}
          <span>יותר</span>
        </div>
      </div>

      {/* StreakStatus */}
      <div style={S.rpSection}>
        <div style={S.rpSt}>🔥 סטריקים</div>
        {CH.map(cid=>{const s=streaks[cid]||0;const m=FAMILY[cid];const pct=Math.min(100,Math.round(s/30*100));return(
          <div key={cid} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:11,fontWeight:700,color:m.color}}>{m.emoji} {m.name}</span>
              <span style={{fontSize:12,fontWeight:800,color:"#f59e0b"}}>{s} ימים</span>
            </div>
            <div style={{position:"relative"}}>
              <div style={S.rpBarBg}>
                <div style={{...S.rpBar,width:`${pct}%`,background:"linear-gradient(90deg,#f59e0b,#ef4444)"}}/>
              </div>
              {/* Milestone markers */}
              <div style={{position:"absolute",top:-2,right:`${100-Math.round(7/30*100)}%`,fontSize:10,transform:"translateX(50%)"}} title="7 ימים">🔥</div>
              <div style={{position:"absolute",top:-2,right:"0%",fontSize:10,transform:"translateX(50%)"}} title="30 ימים">⭐</div>
            </div>
          </div>
        );})}
      </div>

      {/* Recent Achievements */}
      <div style={S.rpSection}>
        <div style={S.rpSt}>🏅 הישגים אחרונים</div>
        {achievements.length===0?<div style={{textAlign:"center",padding:12,color:"var(--textSec)",fontSize:11}}>עדיין אין הישגים</div>
        :achievements.slice(0,10).map((a,i)=>(
          <div key={i} style={S.rpAchieve}>
            <span style={{fontSize:22}}>{a.badge.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--text)"}}>{a.badge.title}</div>
              <div style={{fontSize:9,color:"var(--textTer)"}}>{FAMILY[a.childId]?.name} • {a.badge.desc}</div>
            </div>
            {a.ts>0&&<span style={{fontSize:8,color:"var(--textSec)"}}>{new Date(a.ts).toLocaleDateString("he-IL")}</span>}
          </div>
        ))}
      </div>

      {/* Exam history (retained) */}
      {exams.length>0&&<div style={S.rpSection}>
        <div style={S.rpSt}>📝 היסטוריית מבחנים</div>
        {exams.slice().reverse().slice(0,10).map(ex=>(
          <div key={ex.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #f1f5f9"}}>
            <span style={{fontSize:13,fontWeight:700,color:FAMILY[ex.childId]?.color}}>{FAMILY[ex.childId]?.name}</span>
            <span style={{flex:1,fontSize:11,color:"var(--textTer)"}}>ציון {ex.score}</span>
            <span style={{fontSize:12,fontWeight:700,color:"#10b981"}}>+{ex.bonus}₪</span>
          </div>
        ))}
      </div>}
    </>
  );
}
