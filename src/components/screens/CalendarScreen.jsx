import { HDate, HebrewCalendar, flags } from '@hebcal/core';
import { FAMILY, CH, DAYS, DS } from '../../constants.js';
import { dateKey } from '../../utils.js';

export default function CalendarScreen({ S, app }) {
  const {
    isP, tasks, completions, isTaskForChild,
    calYear, calMonth, calPrev, calNext,
    calSelDate, setCalSelDate,
    eventsForDate, getMonthHolidays, getTasksForDate,
    deleteCalEvent, setCalEventModal,
  } = app;

  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
  const firstDay=new Date(calYear,calMonth,1).getDay();
  const today=new Date();const todayKey=dateKey(today.getFullYear(),today.getMonth(),today.getDate());
  const holidays=getMonthHolidays(calYear,calMonth);
  const hd15=new HDate(new Date(calYear,calMonth,15));
  const hebMonthName=hd15.renderGematriya().split(' ').slice(1).join(' ');
  const GREG_MONTHS=["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

  return (
    <>
      <div style={{fontSize:15,fontWeight:800,textAlign:"center",marginBottom:8}}>📅 לוח שנה</div>
      {/* Month nav */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,background:"#fff",borderRadius:12,padding:"8px 12px",border:"1px solid var(--border)"}}>
        <button onClick={calNext} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#6366f1",fontWeight:700}}>›</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{hebMonthName}</div>
          <div style={{fontSize:10,color:"var(--textTer)"}}>{GREG_MONTHS[calMonth]} {calYear}</div>
        </div>
        <button onClick={calPrev} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"#6366f1",fontWeight:700}}>‹</button>
      </div>
      {/* Day headers */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:2}}>
        {DS.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,fontWeight:700,color:i===6?"#f59e0b":"var(--textTer)",padding:"3px 0"}}>{d}</div>)}
      </div>
      {/* Calendar grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:8}}>
        {Array.from({length:firstDay},(_,i)=><div key={"e"+i}/>)}
        {Array.from({length:daysInMonth},(_,i)=>{
          const day=i+1;const dk=dateKey(calYear,calMonth,day);const dow=new Date(calYear,calMonth,day).getDay();
          const isToday=dk===todayKey;const isSel=dk===calSelDate;const isSat=dow===6;
          const hols=holidays[dk]||[];const evs=eventsForDate(dk);
          let hd;try{hd=new HDate(new Date(calYear,calMonth,day));}catch{hd=null;}
          const hebDay=hd?hd.getDate():"";
          const childDots=CH.filter(cid=>tasks.some(t=>isTaskForChild(t,cid,dow)&&!t.bonus));
          return(
            <button key={day} onClick={()=>setCalSelDate(isSel?null:dk)}
              style={{minHeight:44,padding:"2px 1px",background:isSel?"#6366f130":isToday?"#6366f110":hols.length>0?"#ede9fe":isSat?"#fef3c720":"#fff",
                border:isSel?"2px solid #6366f1":isToday?"2px solid #6366f160":"1px solid var(--border)",borderRadius:6,cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:0,position:"relative"}}>
              <div style={{fontSize:12,fontWeight:isToday?800:600,color:isToday?"#6366f1":isSat?"#f59e0b":"var(--text)"}}>{day}</div>
              {hebDay&&<div style={{fontSize:6,color:"var(--textSec)",lineHeight:1,marginTop:-1}}>{hebDay}</div>}
              {childDots.length>0&&<div style={{display:"flex",gap:1,marginTop:1}}>
                {childDots.map(c=><span key={c} style={{width:4,height:4,borderRadius:2,background:FAMILY[c].color}}/>)}
              </div>}
              {hols.length>0&&<div style={{fontSize:5,lineHeight:1}}>✡️</div>}
              {evs.length>0&&<div style={{position:"absolute",top:1,left:1,width:5,height:5,borderRadius:3,background:"#ec4899"}}/>}
            </button>
          );
        })}
      </div>
      {/* Selected day detail */}
      {calSelDate&&(()=>{
        const d=new Date(calSelDate);const dow=d.getDay();
        let hd2;try{hd2=new HDate(d);}catch{hd2=null;}
        const hebFull=hd2?hd2.renderGematriya():"";
        const hols=holidays[calSelDate]||[];const evs=eventsForDate(calSelDate);
        const dayTasks=getTasksForDate(calSelDate);
        return(
          <div style={{background:"#fff",borderRadius:12,padding:12,border:"1px solid var(--border)",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"var(--text)"}}>{DAYS[dow]} {d.getDate()}/{d.getMonth()+1}</div>
                {hebFull&&<div style={{fontSize:10,color:"#6366f1"}}>{hebFull}</div>}
              </div>
              <button onClick={()=>setCalSelDate(null)} style={{background:"none",border:"none",fontSize:14,cursor:"pointer",color:"var(--textSec)"}}>✕</button>
            </div>
            {hols.map((h,i)=><div key={i} style={{fontSize:11,color:"#7c3aed",fontWeight:600,marginBottom:4}}>✡️ {h.title}</div>)}
            {/* Tasks per child */}
            {CH.map(cid=>{const ct=dayTasks[cid];if(!ct||ct.length===0)return null;
              return(<div key={cid} style={{marginBottom:6}}>
                <div style={{fontSize:10,fontWeight:700,color:FAMILY[cid].color,marginBottom:2}}>{FAMILY[cid].emoji} {FAMILY[cid].name}</div>
                {ct.map(t=><div key={t.id} style={{fontSize:10,color:"var(--textQuat)",display:"flex",alignItems:"center",gap:4,marginBottom:1}}>
                  <span>{t.completion?.approved?"✅":t.completion?.done?"⏳":"○"}</span>
                  <span>{t.icon} {t.title}</span>
                </div>)}
              </div>);
            })}
            {/* Custom events */}
            {evs.length>0&&<div style={{borderTop:"1px solid var(--border)",paddingTop:6,marginTop:4}}>
              {evs.map(ev=><div key={ev.id} style={{fontSize:10,display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                <span>{ev.icon}</span><span style={{fontWeight:600}}>{ev.title}</span>
                {ev.recurring&&<span style={{fontSize:7,color:"var(--textSec)"}}>🔁</span>}
                {isP&&<button onClick={()=>deleteCalEvent(ev.id)} style={{marginRight:"auto",marginLeft:0,background:"none",border:"none",fontSize:10,color:"#ef4444",cursor:"pointer"}}>🗑</button>}
              </div>)}
            </div>}
            {/* Add event button */}
            {isP&&<button onClick={()=>setCalEventModal({date:calSelDate})}
              style={{width:"100%",padding:6,background:"#6366f110",border:"1px dashed #6366f140",borderRadius:8,color:"#6366f1",fontSize:10,fontWeight:600,cursor:"pointer",marginTop:6}}>
              + הוסף אירוע
            </button>}
          </div>
        );
      })()}
    </>
  );
}
