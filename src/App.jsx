import { useState, useEffect, useCallback, useRef } from "react";
import { HDate, HebrewCalendar, flags } from '@hebcal/core';
import storage from "./storage.js";
import S from "./styles.js";
import { FAMILY, CH, DAYS, DS, DEFAULT_PINS, LEVELS, REMINDERS, PENALTIES, DEFAULT_BADGES, EXAM_BONUSES,
  INIT_TASKS, DEFAULT_GOALS, GROCERY_CATEGORIES, DEFAULT_CHALLENGES } from "./constants.js";
import { compressImage, getWk, getToday, getHour, getTimeStr, dateKey, getWkForDate } from "./utils.js";
// Animations
import Confetti from "./components/animations/Confetti.jsx";
import LevelUp from "./components/animations/LevelUp.jsx";
import BadgeEarned from "./components/animations/BadgeEarned.jsx";
// Screens
import LoginScreen from "./components/screens/LoginScreen.jsx";
import PinScreen from "./components/screens/PinScreen.jsx";
import HomeScreen from "./components/screens/HomeScreen.jsx";
import WallScreen from "./components/screens/WallScreen.jsx";
import CalendarScreen from "./components/screens/CalendarScreen.jsx";
import GroceryScreen from "./components/screens/GroceryScreen.jsx";
import TasksScreen from "./components/screens/TasksScreen.jsx";
import BadgesScreen from "./components/screens/BadgesScreen.jsx";
import DashboardScreen from "./components/screens/DashboardScreen.jsx";
import ApproveScreen from "./components/screens/ApproveScreen.jsx";
import ManageScreen from "./components/screens/ManageScreen.jsx";
import CounselorScreen from "./components/screens/CounselorScreen.jsx";
// Modals
import SwapModal from "./components/modals/SwapModal.jsx";
import BonusModal from "./components/modals/BonusModal.jsx";
import PhotoModal from "./components/modals/PhotoModal.jsx";
import DoneConfirmModal from "./components/modals/DoneConfirmModal.jsx";
import PenaltyModal from "./components/modals/PenaltyModal.jsx";
import CalEventModal from "./components/modals/CalEventModal.jsx";
import ExamModal from "./components/modals/ExamModal.jsx";
import PraiseModal from "./components/modals/PraiseModal.jsx";
import WeeklySummaryModal from "./components/modals/WeeklySummaryModal.jsx";

export default function App(){
  const[user,setUser]=useState(null);
  const[screen,setScreen]=useState("login");
  const[pinScreen,setPinScreen]=useState(null);
  const[pinInput,setPinInput]=useState("");
  const[pinError,setPinError]=useState(false);
  const[pins,setPins]=useState(DEFAULT_PINS);
  const[tasks,setTasks]=useState(INIT_TASKS);
  const[completions,setCompletions]=useState({});
  const[selDay,setSelDay]=useState(getToday());
  const[toast,setToast]=useState(null);
  const[photoModal,setPhotoModal]=useState(null);
  const[manageSub,setManageSub]=useState("tasks");
  const[editTask,setEditTask]=useState(null);
  const[weightEdit,setWeightEdit]=useState(null);
  const[newTask,setNewTask]=useState({title:"",icon:"✨",weight:5,assignedTo:[],type:"personal",requirePhoto:false});
  const[notifChild,setNotifChild]=useState(null);
  const[bonusModal,setBonusModal]=useState(false);
  const[bonusTitle,setBonusTitle]=useState("");
  const[bonusIcon,setBonusIcon]=useState("⭐");
  const[bonusPhoto,setBonusPhoto]=useState(null);
  const[changePinUser,setChangePinUser]=useState(null);
  const[newPinVal,setNewPinVal]=useState("");
  const[xp,setXp]=useState({peleg:0,yahav:0,yahel:0});
  const[streaks,setStreaks]=useState({peleg:0,yahav:0,yahel:0});
  const[showConfetti,setShowConfetti]=useState(false);
  const[levelUpInfo,setLevelUpInfo]=useState(null);
  const[goals,setGoals]=useState(DEFAULT_GOALS);
  const[swaps,setSwaps]=useState([]);
  const[swapModal,setSwapModal]=useState(null);
  const[activeReminders,setActiveReminders]=useState(["evening"]);
  const[reminderShown,setReminderShown]=useState({});
  const[doneConfirm,setDoneConfirm]=useState(null);
  const[messages,setMessages]=useState([]);
  const[praiseModal,setPraiseModal]=useState(null);
  const[praiseText,setPraiseText]=useState("");
  const[praiseStar,setPraiseStar]=useState("⭐");
  const[penalties,setPenalties]=useState([]);
  const[penaltyModal,setPenaltyModal]=useState(null);
  const[earnedBadges,setEarnedBadges]=useState({peleg:[],yahav:[],yahel:[]});
  const[badgeNotification,setBadgeNotification]=useState(null);
  const[totalXpEarned,setTotalXpEarned]=useState({peleg:0,yahav:0,yahel:0});
  const[approvedCount,setApprovedCount]=useState({peleg:0,yahav:0,yahel:0});
  const[exams,setExams]=useState([]);
  const[examModal,setExamModal]=useState(null);
  const[examScore,setExamScore]=useState("");
  const[wallText,setWallText]=useState("");
  const[wallTo,setWallTo]=useState("wall");
  const[calYear,setCalYear]=useState(new Date().getFullYear());
  const[calMonth,setCalMonth]=useState(new Date().getMonth());
  const[calSelDate,setCalSelDate]=useState(null);
  const[calEvents,setCalEvents]=useState([]);
  const[calEventModal,setCalEventModal]=useState(false);
  const[calNewEvent,setCalNewEvent]=useState({title:"",icon:"📌",type:"custom",recurring:null,members:[]});
  const[groceries,setGroceries]=useState([]);
  const[groceryInput,setGroceryInput]=useState("");
  const[groceryCat,setGroceryCat]=useState("other");
  const[groceryRecurring,setGroceryRecurring]=useState(false);
  const[showSummaryModal,setShowSummaryModal]=useState(false);
  const[weeklySummaryData,setWeeklySummaryData]=useState(null);
  const[lastSummaryWeek,setLastSummaryWeek]=useState(null);
  const[challenges,setChallenges]=useState([]);
  const[dragIdx,setDragIdx]=useState(null);
  const[dragOverIdx,setDragOverIdx]=useState(null);
  const[auditLog,setAuditLog]=useState([]);
  const[installReady,setInstallReady]=useState(false);
  const deferredPrompt=useRef(null);
  const fileRef=useRef(null);
  const bonusFileRef=useRef(null);
  const wk=getWk();

  // ── Load ──
  useEffect(()=>{(async()=>{try{const s=await storage.get("chores-v5");if(s){const d=JSON.parse(s.value);
    if(d.tasks)setTasks(d.tasks);if(d.completions)setCompletions(d.completions);if(d.pins)setPins(d.pins);
    if(d.xp)setXp(d.xp);if(d.streaks)setStreaks(d.streaks);if(d.goals)setGoals(d.goals);
    if(d.swaps)setSwaps(d.swaps);if(d.activeReminders)setActiveReminders(d.activeReminders);
    if(d.messages)setMessages(d.messages.map(m=>({...m,type:m.type||"praise",reactions:m.reactions||{}})));if(d.penalties)setPenalties(d.penalties);
    if(d.earnedBadges){const migrated={};Object.keys(d.earnedBadges).forEach(cid=>{migrated[cid]=(d.earnedBadges[cid]||[]).map(b=>typeof b==='string'?{id:b,ts:0}:b);});setEarnedBadges(migrated);}if(d.totalXpEarned)setTotalXpEarned(d.totalXpEarned);
    if(d.approvedCount)setApprovedCount(d.approvedCount);if(d.exams)setExams(d.exams);
    if(d.calEvents)setCalEvents(d.calEvents);
    if(d.groceries)setGroceries(d.groceries);
    if(d.auditLog)setAuditLog(d.auditLog);
    if(d.challenges)setChallenges(d.challenges);
    if(d.lastSummaryWeek)setLastSummaryWeek(d.lastSummaryWeek);
  }}catch{}})();},[]);

  useEffect(()=>{if(user&&challenges.filter(c=>c.week===wk).length===0){const nc=initWeeklyChallenges();if(nc)save({challenges:nc});}},[user]);

  useEffect(()=>{if(!user||!isP)return;if(lastSummaryWeek&&lastSummaryWeek!==wk){
    const wc=getWeekCompletionCount();const leading=getLeadingChild();
    const data={completionPct:wc.total>0?Math.round((wc.done/wc.total)*100):0,leading,
      perChild:CH.map(cid=>{const st=getWeekStats(cid);return{cid,...st};}),
      familyStreak:getFamilyStreak(),totalXp:getWeekXpTotal()};
    setWeeklySummaryData(data);setShowSummaryModal(true);setLastSummaryWeek(wk);save({lastSummaryWeek:wk});
  } else if(!lastSummaryWeek){setLastSummaryWeek(wk);save({lastSummaryWeek:wk});}
  },[user]);

  useEffect(()=>{const h=(e)=>{e.preventDefault();deferredPrompt.current=e;setInstallReady(true);};
    window.addEventListener("beforeinstallprompt",h);return()=>window.removeEventListener("beforeinstallprompt",h);},[]);
  useEffect(()=>{const off=()=>flash("📴 אין חיבור — עובד במצב לא מקוון");
    const on=()=>flash("🌐 חזרת לרשת!");
    window.addEventListener("offline",off);window.addEventListener("online",on);
    return()=>{window.removeEventListener("offline",off);window.removeEventListener("online",on);};},[]);
  useEffect(()=>{if(!user||!("Notification" in window))return;
    const iv=setInterval(()=>{if(Notification.permission!=="granted"||!user||FAMILY[user]?.role==="parent")return;
      const h=getHour();const pending=tasks.filter(t=>isTaskForChild(t,user,getToday())&&!t.bonus&&!completions[`${getWk()}_${t.id}_${user}_${getToday()}`]?.done).length;
      if(pending>0&&(h===7||h===14||h===19)){
        try{new Notification("משימות המשפחה",{body:`יש לך ${pending} משימות ממתינות${(streaks[user]||0)>0?" • הסטריק שלך בסכנה! 🔥":""}`,icon:"/icon-192.png"});}catch{}}
    },60000);return()=>clearInterval(iv);},[user,tasks,completions,streaks]);

  // ── Save ──
  const save=useCallback(async(overrides={})=>{try{await storage.set("chores-v5",JSON.stringify({
    tasks:overrides.tasks||tasks,completions:overrides.completions||completions,pins:overrides.pins||pins,
    xp:overrides.xp||xp,streaks:overrides.streaks||streaks,goals:overrides.goals||goals,
    swaps:overrides.swaps||swaps,activeReminders:overrides.activeReminders||activeReminders,
    messages:overrides.messages||messages,penalties:overrides.penalties||penalties,
    earnedBadges:overrides.earnedBadges||earnedBadges,totalXpEarned:overrides.totalXpEarned||totalXpEarned,
    approvedCount:overrides.approvedCount||approvedCount,exams:overrides.exams||exams,
    calEvents:overrides.calEvents||calEvents,groceries:overrides.groceries||groceries,
    auditLog:overrides.auditLog||auditLog,challenges:overrides.challenges||challenges,lastSummaryWeek:overrides.lastSummaryWeek||lastSummaryWeek,
  }));}catch{}},[tasks,completions,pins,xp,streaks,goals,swaps,activeReminders,messages,penalties,earnedBadges,totalXpEarned,approvedCount,exams,calEvents,groceries,auditLog,challenges,lastSummaryWeek]);

  // ── Helpers ──
  const flash=(m)=>{setToast(m);setTimeout(()=>setToast(null),2200);};
  const logAudit=(action,details={})=>{const entry={id:"aud_"+Date.now(),action,by:user,ts:Date.now(),...details};
    const nl=[entry,...auditLog].slice(0,500);setAuditLog(nl);return nl;};
  const cKey=(tid,cid,day)=>`${wk}_${tid}_${cid}_${day}`;
  const isP=user&&FAMILY[user]?.role==="parent";

  const isTaskForChild=(task,cid,day)=>{
    if(!task.assignedTo.includes(cid))return false;
    if(task.bonus)return true;
    if(task.type==="shared"){const kids=task.assignedTo;return kids[(typeof day==="number"?day:new Date(day).getDay())%kids.length]===cid;}
    return true;
  };
  const getChildW=(cid)=>tasks.filter(t=>isTaskForChild(t,cid,selDay)&&!t.bonus).reduce((s,t)=>s+t.weight,0);

  // ── Calendar helpers ──
  const getMonthHolidays=(year,month)=>{
    const evs=HebrewCalendar.calendar({start:new Date(year,month,1),end:new Date(year,month+1,0),il:true,locale:'he'});
    const map={};
    for(const ev of evs){const g=ev.getDate().greg();const k=dateKey(g.getFullYear(),g.getMonth(),g.getDate());
      if(!map[k])map[k]=[];map[k].push({title:ev.render('he'),emoji:ev.getFlags()&flags.LIGHT_CANDLES?'🕯️':'✡️'});}
    return map;
  };
  const getTasksForDate=(dateStr)=>{
    const d=new Date(dateStr),dow=d.getDay(),w=getWkForDate(dateStr),result={};
    CH.forEach(cid=>{const ct=tasks.filter(t=>isTaskForChild(t,cid,dow)&&!t.bonus);
      result[cid]=ct.map(t=>{const k=`${w}_${t.id}_${cid}_${dow}`;return{...t,completion:completions[k]||null};});});
    return result;
  };
  const eventsForDate=(dateStr)=>calEvents.filter(ev=>{
    if(ev.date===dateStr)return true;
    if(ev.recurring==="yearly")return ev.date.slice(5)===dateStr.slice(5);
    if(ev.recurring==="monthly")return ev.date.slice(8)===dateStr.slice(8);
    if(ev.recurring==="weekly")return new Date(ev.date).getDay()===new Date(dateStr).getDay();
    return false;
  });
  const calPrev=()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);setCalSelDate(null);};
  const calNext=()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);setCalSelDate(null);};
  const addCalEvent=()=>{
    if(!calNewEvent.title.trim()){flash("⚠️ חסר שם");return;}
    const ne=[...calEvents,{...calNewEvent,id:"ev_"+Date.now(),date:calEventModal.date,createdBy:user,color:FAMILY[user]?.color||"#6366f1"}];
    const al=logAudit("cal_event_added",{title:calNewEvent.title});
    setCalEvents(ne);save({calEvents:ne,auditLog:al});setCalEventModal(false);
    setCalNewEvent({title:"",icon:"📌",type:"custom",recurring:null,members:[]});flash("📅 נוסף!");
  };
  const deleteCalEvent=(evId)=>{const ne=calEvents.filter(e=>e.id!==evId);const al=logAudit("cal_event_deleted",{evId});setCalEvents(ne);save({calEvents:ne,auditLog:al});flash("🗑️");};

  // ── XP & Levels ──
  const getLevel=(cid)=>{const x=xp[cid]||0;let lv=LEVELS[0];for(const l of LEVELS)if(x>=l.min)lv=l;return lv;};
  const getNextLevel=(cid)=>{const x=xp[cid]||0;for(const l of LEVELS)if(x<l.min)return l;return null;};
  const getXpProgress=(cid)=>{const x=xp[cid]||0;const cur=getLevel(cid);const nxt=getNextLevel(cid);
    if(!nxt)return 100;return Math.round(((x-cur.min)/(nxt.min-cur.min))*100);};

  const addXp=(cid,amount)=>{
    const oldLv=getLevel(cid);
    const newXp={...xp,[cid]:(xp[cid]||0)+amount};
    setXp(newXp);
    const newLv=LEVELS.slice().reverse().find(l=>(newXp[cid]||0)>=l.min);
    if(newLv&&newLv.min>oldLv.min){setLevelUpInfo(newLv);setTimeout(()=>setLevelUpInfo(null),3000);
      const sm=addSystemMessage(`${FAMILY[cid]?.name} עלה/תה לרמה ${newLv.name}! ${newLv.emoji}`,"⬆️");setMessages(sm);}
    return newXp;
  };

  const checkBadges=(cid,cStreaks,cTotalXp,cApprovedCount,cEarnedBadges)=>{
    const earned=cEarnedBadges[cid]||[];const newlyEarned=[];
    for(const badge of DEFAULT_BADGES){if(earned.some(e=>e.id===badge.id))continue;let ok=false;
      if(badge.condition==="streak_days")ok=(cStreaks[cid]||0)>=badge.value;
      else if(badge.condition==="chores_completed")ok=(cApprovedCount[cid]||0)>=badge.value;
      else if(badge.condition==="total_xp_earned")ok=(cTotalXp[cid]||0)>=badge.value;
      if(ok)newlyEarned.push({id:badge.id,ts:Date.now()});}
    if(newlyEarned.length>0){const ub={...cEarnedBadges,[cid]:[...earned,...newlyEarned]};setEarnedBadges(ub);
      const first=DEFAULT_BADGES.find(b=>b.id===newlyEarned[0].id);setBadgeNotification({badge:first,childId:cid});
      setTimeout(()=>setBadgeNotification(null),3000);return ub;}
    return cEarnedBadges;
  };

  const addExam=(childId,score)=>{
    const s=parseInt(score);if(isNaN(s)||s<0||s>100){flash("⚠️ ציון לא תקין");return;}
    const eb=EXAM_BONUSES.find(x=>s>=x.min);
    if(!eb){flash("⚠️ ציון מתחת ל-90, אין בונוס");setExamModal(null);setExamScore("");return;}
    const ne=[...exams,{id:"ex_"+Date.now(),childId,score:s,bonus:eb.bonus,ts:Date.now(),by:user}];setExams(ne);
    const nm=[...messages,{id:"msg_"+Date.now(),from:user,to:childId,text:`📝 ${eb.label} - בונוס ${eb.bonus}₪!`,star:"📝",ts:Date.now()}];
    const al=logAudit("exam_added",{childId,score:s});setMessages(nm);save({exams:ne,messages:nm,auditLog:al});flash(`📝 ${eb.label} - ${eb.bonus}₪ ל${FAMILY[childId]?.name}!`);
    setExamModal(null);setExamScore("");
  };

  const getWeeklyXpData=()=>{const data={};CH.forEach(cid=>{let w=0;
    for(let d=0;d<7;d++){tasks.forEach(t=>{const k=cKey(t.id,cid,d);if(completions[k]?.approved)w+=t.bonus?t.weight*2:t.weight;});}
    data[cid]=w;});return data;};

  // ── Task actions ──
  const markDone=(tid,cid,day,photo)=>{
    const k=cKey(tid,cid,day);
    const nc={...completions,[k]:{done:true,photo:photo||null,approved:false,approvedBy:null,ts:Date.now()}};
    setCompletions(nc);
    const allToday=tasks.filter(t=>isTaskForChild(t,cid,day)&&!t.bonus);
    const allDone=allToday.every(t=>{const kk=t.id===tid?k:cKey(t.id,cid,day);return nc[kk]?.done;});
    if(allDone){setShowConfetti(true);setTimeout(()=>setShowConfetti(false),3000);
      const sm=addSystemMessage(`${FAMILY[cid]?.name} סיים/ה את כל המשימות! 🎉`,"🎉");setMessages(sm);save({completions:nc,messages:sm});flash("✅ בוצע!");return;}
    const al=logAudit("task_done",{taskId:tid,childId:cid});save({completions:nc,auditLog:al});flash("✅ בוצע!");
  };

  const approve=(tid,cid,day)=>{
    const k=cKey(tid,cid,day);if(!completions[k])return;
    const nc={...completions,[k]:{...completions[k],approved:true,approvedBy:user}};
    setCompletions(nc);
    const task=tasks.find(t=>t.id===tid);
    const xpGain=task?(task.bonus?task.weight*2:task.weight):5;
    const newXp=addXp(cid,xpGain);
    const newTotalXp={...totalXpEarned,[cid]:(totalXpEarned[cid]||0)+xpGain};setTotalXpEarned(newTotalXp);
    const newAC={...approvedCount,[cid]:(approvedCount[cid]||0)+1};setApprovedCount(newAC);
    const today=getToday();
    const allToday=tasks.filter(t=>isTaskForChild(t,cid,today)&&!t.bonus);
    const allApproved=allToday.every(t=>{const kk=cKey(t.id,cid,today);return(t.id===tid?nc:completions)[kk]?.approved||nc[kk]?.approved;});
    let newStreaks=streaks;let streakBonusXp=0;
    if(allApproved){const ns=(streaks[cid]||0)+1;newStreaks={...streaks,[cid]:ns};setStreaks(newStreaks);
      if(ns>0&&ns%7===0){streakBonusXp=ns*5;newXp[cid]=(newXp[cid]||0)+streakBonusXp;setXp(newXp);
        newTotalXp[cid]=(newTotalXp[cid]||0)+streakBonusXp;setTotalXpEarned(newTotalXp);}}
    const newBadges=checkBadges(cid,newStreaks,newTotalXp,newAC,earnedBadges);
    const al=logAudit("approved",{taskId:tid,childId:cid,xp:xpGain});
    save({completions:nc,xp:newXp,streaks:newStreaks,totalXpEarned:newTotalXp,approvedCount:newAC,earnedBadges:newBadges,auditLog:al});
    const bm=streakBonusXp>0?` + 🔥${streakBonusXp} בונוס רצף!`:"";
    flash(`👍 +${xpGain}XP!${bm}`);
    setTimeout(()=>checkChallengeCompletion(),100);
  };

  const reject=(tid,cid,day)=>{const k=cKey(tid,cid,day);const nc={...completions};delete nc[k];setCompletions(nc);const al=logAudit("rejected",{taskId:tid,childId:cid});save({completions:nc,auditLog:al});flash("❌ נדחה");};

  // ── Stats ──
  const getWeekStats=(cid)=>{
    const tw=getChildW(cid);let aW=0,dW=0,tW=0,dc=0,ac=0,tc=0,bonusA=0;
    for(let d=0;d<7;d++){tasks.forEach(t=>{if(!isTaskForChild(t,cid,d))return;
      if(t.bonus){const k=cKey(t.id,cid,d);if(completions[k]?.approved)bonusA+=t.weight;return;}
      tW+=t.weight;tc++;const k=cKey(t.id,cid,d);const c=completions[k];
      if(c?.done){dW+=t.weight;dc++;if(c?.approved){aW+=t.weight;ac++;}}});}
    const pay=FAMILY[cid].weeklyPay;const base=tW>0?Math.round((aW/tW)*pay):0;
    const bonus=tW>0?Math.round((bonusA/tW)*pay*0.2):0;
    const earned=Math.min(Math.round(pay*1.2),base+bonus);
    const pct=tW>0?Math.round((aW/tW)*100):0;
    return{tW,aW,dW,earned,pay,pct,dc,ac,tc,bonusA};
  };

  const getFamilyPct=()=>{
    let total=0,approved=0;
    CH.forEach(c=>{const st=getWeekStats(c);total+=st.tc;approved+=st.ac;});
    return total>0?Math.round((approved/total)*100):0;
  };

  const getWeekCompletionCount=()=>{let done=0,total=0;CH.forEach(cid=>{for(let d=0;d<7;d++){
    tasks.forEach(t=>{if(!isTaskForChild(t,cid,d)||t.bonus)return;total++;
    if(completions[cKey(t.id,cid,d)]?.done)done++;});}});return{done,total};};
  const getLeadingChild=()=>{const wd=getWeeklyXpData();return[...CH].sort((a,b)=>(wd[b]||0)-(wd[a]||0))[0];};
  const getFamilyStreak=()=>Math.min(...CH.map(cid=>streaks[cid]||0));
  const getWeekXpTotal=()=>{const wd=getWeeklyXpData();return Object.values(wd).reduce((s,v)=>s+v,0);};
  const getHeatmapData=()=>{const grid=Array.from({length:7},()=>Array(24).fill(0));
    Object.values(completions).forEach(c=>{if(!c?.ts)return;const d=new Date(c.ts);
    grid[d.getDay()][d.getHours()]++;});return grid;};
  const getRecentAchievements=()=>{const list=[];
    CH.forEach(cid=>{(earnedBadges[cid]||[]).forEach(b=>{
      const badge=DEFAULT_BADGES.find(x=>x.id===(b.id||b));
      if(badge)list.push({childId:cid,badge,ts:b.ts||0});});});
    return list.sort((a,b)=>b.ts-a.ts);};

  const getTodayPctForChild=(cid)=>{
    const today=getToday();
    const todayTasks=tasks.filter(t=>isTaskForChild(t,cid,today)&&!t.bonus);
    if(todayTasks.length===0)return 100;
    const done=todayTasks.filter(t=>completions[cKey(t.id,cid,today)]?.done).length;
    return Math.round((done/todayTasks.length)*100);
  };

  const getActiveReminder=()=>{
    const now=getTimeStr();
    for(const r of REMINDERS){
      if(!activeReminders.includes(r.id))continue;
      const[rh,rm]=r.time.split(":").map(Number);
      const[nh,nm]=now.split(":").map(Number);
      if(nh===rh&&Math.abs(nm-rm)<=15&&!reminderShown[r.id+selDay])return r;
    }
    return null;
  };

  // ── Swap ──
  const requestSwap=(taskId,fromChild,toChild)=>{
    const ns=[...swaps,{id:"sw"+Date.now(),taskId,from:fromChild,to:toChild,day:selDay,status:"pending",ts:Date.now()}];
    const al=logAudit("swap_requested",{taskId,from:fromChild,to:toChild});setSwaps(ns);save({swaps:ns,auditLog:al});flash("🔄 בקשת החלפה נשלחה!");
  };
  const approveSwap=(swapId)=>{
    const sw=swaps.find(s=>s.id===swapId);if(!sw)return;
    const nt=tasks.map(t=>{
      if(t.id!==sw.taskId)return t;
      let a=[...t.assignedTo];
      if(!a.includes(sw.to))a.push(sw.to);
      a=a.filter(x=>x!==sw.from);
      return{...t,assignedTo:a};
    });
    const ns=swaps.map(s=>s.id===swapId?{...s,status:"approved"}:s);
    const al=logAudit("swap_approved",{swapId});setTasks(nt);setSwaps(ns);save({tasks:nt,swaps:ns,auditLog:al});flash("🔄 החלפה אושרה!");
  };
  const rejectSwap=(swapId)=>{
    const ns=swaps.map(s=>s.id===swapId?{...s,status:"rejected"}:s);
    const al=logAudit("swap_rejected",{swapId});setSwaps(ns);save({swaps:ns,auditLog:al});flash("❌ החלפה נדחתה");
  };

  // ── Task CRUD ──
  const addNewTask=()=>{if(!newTask.title||newTask.assignedTo.length===0){flash("⚠️ חסרים פרטים");return;}
    const nt=[...tasks,{...newTask,id:"t"+Date.now(),bonus:false,type:newTask.type||"personal"}];setTasks(nt);
    const al=logAudit("task_created",{title:newTask.title});save({tasks:nt,auditLog:al});
    setNewTask({title:"",icon:"✨",weight:5,assignedTo:[],type:"personal",requirePhoto:false});flash("✨ נוספה!");};
  const addSuggested=(s)=>{if(tasks.find(t=>t.title===s.title)){flash("⚠️ קיימת");return;}
    const nt=[...tasks,{id:"t"+Date.now(),title:s.title,icon:s.icon,weight:s.weight,assignedTo:[...CH],bonus:false,type:"personal"}];
    setTasks(nt);save({tasks:nt});flash(`✨ ${s.title} נוספה!`);};
  const deleteTask=(tid)=>{const nt=tasks.filter(t=>t.id!==tid);setTasks(nt);const al=logAudit("task_deleted",{taskId:tid});save({tasks:nt,auditLog:al});flash("🗑️");};
  const updateTask=(tid,u)=>{const nt=tasks.map(t=>t.id===tid?{...t,...u}:t);setTasks(nt);const al=logAudit("task_updated",{taskId:tid});save({tasks:nt,auditLog:al});};
  const changeWeight=(tid,d)=>{const t=tasks.find(x=>x.id===tid);if(t)updateTask(tid,{weight:Math.max(1,t.weight+d)});};
  const reorderTasks=(fromIdx,toIdx)=>{const nonBonus=tasks.filter(t=>!t.bonus);const bonus=tasks.filter(t=>t.bonus);
    const reordered=[...nonBonus];const[moved]=reordered.splice(fromIdx,1);reordered.splice(toIdx,0,moved);
    const nt=[...reordered,...bonus];setTasks(nt);const al=logAudit("task_updated",{detail:"reorder"});save({tasks:nt,auditLog:al});};

  const handlePhoto=async(e,tid,cid,day)=>{const f=e.target.files[0];if(!f)return;
    const compressed=await compressImage(f,600);markDone(tid,cid,day,compressed);};
  const submitBonus=()=>{if(!bonusTitle.trim()){flash("⚠️ תאר/י");return;}
    const id="bonus_"+Date.now();const nt=[...tasks,{id,title:bonusTitle,icon:bonusIcon,weight:5,assignedTo:[user],bonus:true}];
    const k=cKey(id,user,selDay);const nc={...completions,[k]:{done:true,photo:bonusPhoto,approved:false,approvedBy:null,ts:Date.now()}};
    const al=logAudit("bonus_submitted",{title:bonusTitle});setTasks(nt);setCompletions(nc);save({tasks:nt,completions:nc,auditLog:al});setBonusModal(false);setBonusTitle("");setBonusIcon("⭐");setBonusPhoto(null);flash("⭐ נשלח!");};
  const handleBonusPhoto=async(e)=>{const f=e.target.files[0];if(!f)return;
    const compressed=await compressImage(f,600);setBonusPhoto(compressed);};

  const approveWithPraise=(tid,cid,day)=>{setPraiseModal({taskId:tid,childId:cid,day});setPraiseText("");setPraiseStar("⭐");};
  const submitPraise=()=>{if(!praiseModal)return;const{taskId,childId,day}=praiseModal;
    approve(taskId,childId,day);
    if(praiseText.trim()||praiseStar){const nm=[...messages,{id:"msg_"+Date.now(),from:user,to:childId,taskId,text:praiseText.trim(),star:praiseStar,ts:Date.now()}];
      setMessages(nm);save({messages:nm});}
    setPraiseModal(null);setPraiseText("");};

  const addPenalty=(childId,penaltyId)=>{
    const p=PENALTIES.find(x=>x.id===penaltyId);if(!p)return;
    const newXp={...xp,[childId]:Math.max(0,(xp[childId]||0)-p.xp)};setXp(newXp);
    const np=[...penalties,{id:"pen_"+Date.now(),childId,penaltyId,by:user,ts:Date.now()}];
    setPenalties(np);
    const nm=[...messages,{id:"msg_"+Date.now(),from:user,to:childId,text:`⚠️ הופחתו ${p.xp} נקודות - ${p.title}`,star:"⚠️",ts:Date.now()}];
    setMessages(nm);
    const al=logAudit("penalty_added",{childId,penaltyId,xp:p.xp});save({xp:newXp,penalties:np,messages:nm,auditLog:al});flash(`⚠️ -${p.xp}XP`);setPenaltyModal(null);
  };

  // ── Grocery ──
  const addGroceryItem=()=>{if(!groceryInput.trim()){flash("⚠️ חסר שם מוצר");return;}
    const ng=[...groceries,{id:"gr_"+Date.now(),title:groceryInput.trim(),category:groceryCat,bought:false,recurring:groceryRecurring,addedBy:user,ts:Date.now()}];
    setGroceries(ng);save({groceries:ng});setGroceryInput("");setGroceryRecurring(false);flash("🛒 נוסף!");};
  const toggleGroceryBought=(grId)=>{const ng=groceries.map(g=>g.id===grId?{...g,bought:!g.bought}:g);setGroceries(ng);save({groceries:ng});};
  const deleteGroceryItem=(grId)=>{const ng=groceries.filter(g=>g.id!==grId);setGroceries(ng);save({groceries:ng});flash("🗑️");};
  const clearBoughtGroceries=()=>{const recurring=groceries.filter(g=>g.bought&&g.recurring).map(g=>({...g,bought:false,ts:Date.now()}));
    const remaining=groceries.filter(g=>!g.bought);const ng=[...remaining,...recurring];setGroceries(ng);save({groceries:ng});flash("🧹 נוקה!");};
  const handleInstall=async()=>{if(!deferredPrompt.current)return;deferredPrompt.current.prompt();
    await deferredPrompt.current.userChoice;deferredPrompt.current=null;setInstallReady(false);};

  // ── Challenges ──
  const initWeeklyChallenges=()=>{
    const existing=challenges.find(c=>c.week===wk);if(existing)return challenges;
    const picked=DEFAULT_CHALLENGES.sort(()=>Math.random()-0.5).slice(0,3);
    const instances=picked.map(ch=>({...ch,week:wk,completedBy:{},startTs:Date.now()}));
    const nc=[...challenges.filter(c=>c.week!==wk),...instances];setChallenges(nc);return nc;
  };
  const checkChallengeCompletion=()=>{
    const wkChallenges=challenges.filter(c=>c.week===wk);let changed=false;const updated=wkChallenges.map(ch=>{
      if(ch.type==="family"){
        if(Object.keys(ch.completedBy).length>0)return ch;
        let met=false;
        if(ch.condition==="all_above_pct"){met=CH.every(cid=>{const s=getWeekStats(cid);return s.pct>=ch.value;});}
        else if(ch.condition==="all_shared_done"){const shared=tasks.filter(t=>t.type==="shared"&&!t.bonus);
          met=shared.length>0&&shared.every(t=>{for(let d=0;d<7;d++){const assigned=CH.filter(c=>isTaskForChild(t,c,d));
            if(assigned.some(c=>!completions[cKey(t.id,c,d)]?.approved))return false;}return true;});}
        if(met){changed=true;const cb={};CH.forEach(c=>{cb[c]=true;});return{...ch,completedBy:cb};}
      } else {
        const newCB={...ch.completedBy};
        CH.forEach(cid=>{if(newCB[cid])return;let met=false;
          if(ch.condition==="streak_days")met=(streaks[cid]||0)>=ch.value;
          else if(ch.condition==="zero_missed"){let clean=0;for(let d=0;d<7;d++){const dayTasks=tasks.filter(t=>isTaskForChild(t,cid,d)&&!t.bonus);
            if(dayTasks.length>0&&dayTasks.every(t=>completions[cKey(t.id,cid,d)]?.done))clean++;} met=clean>=ch.value;}
          if(met){newCB[cid]=true;changed=true;}
        });
        return{...ch,completedBy:newCB};
      }
      return ch;
    });
    if(changed){const nc=[...challenges.filter(c=>c.week!==wk),...updated];setChallenges(nc);
      updated.forEach(ch=>{const def=DEFAULT_CHALLENGES.find(d=>d.id===ch.id);if(!def)return;
        CH.forEach(cid=>{if(ch.completedBy[cid]&&!challenges.find(c=>c.id===ch.id&&c.week===wk)?.completedBy?.[cid]){
          addXp(cid,def.xpReward);flash(`🏆 ${FAMILY[cid]?.name} השלים/ה אתגר: ${def.title}!`);}});});
      save({challenges:nc});}
  };

  // ── Wall ──
  const sendWallMessage=(text,to="wall")=>{
    if(!text.trim())return;
    const nm=[...messages,{id:"msg_"+Date.now(),from:user,to,text:text.trim(),star:null,ts:Date.now(),type:"free",reactions:{}}];
    setMessages(nm);save({messages:nm});setWallText("");flash("💬 נשלח!");
  };
  const sendNudge=(childId)=>{
    if(messages.some(m=>m.type==="nudge"&&m.to===childId&&(Date.now()-m.ts)<1800000)){flash("⏳ כבר נשלח לאחרונה");return;}
    const pending=tasks.filter(t=>isTaskForChild(t,childId,getToday())&&!t.bonus&&!completions[cKey(t.id,childId,getToday())]?.done).length;
    const nm=[...messages,{id:"msg_"+Date.now(),from:user,to:childId,text:`👋 תזכורת עדינה: יש לך ${pending} משימ${pending===1?"ה":"ות"} להיום`,star:"👋",ts:Date.now(),type:"nudge",reactions:{}}];
    setMessages(nm);save({messages:nm});flash(`👋 נשלח ל${FAMILY[childId]?.name}`);
  };
  const addSystemMessage=(text,star="🎉",curMessages)=>{
    const base=curMessages||messages;
    return[...base,{id:"msg_"+Date.now(),from:"system",to:"wall",text,star,ts:Date.now(),type:"system",reactions:{}}];
  };
  const toggleReaction=(msgId,emoji)=>{
    const nm=messages.map(m=>{if(m.id!==msgId)return m;const reactions={...(m.reactions||{})};
      const users=reactions[emoji]||[];
      if(users.includes(user)){reactions[emoji]=users.filter(u=>u!==user);if(reactions[emoji].length===0)delete reactions[emoji];}
      else{reactions[emoji]=[...users,user];}
      return{...m,reactions};});
    setMessages(nm);save({messages:nm});
  };
  const getWallMessages=()=>messages.filter(m=>m.to==="wall"||m.from===user||m.to===user).sort((a,b)=>b.ts-a.ts).slice(0,50);

  // ── PIN ──
  const verifyPin=(uid,pin)=>{const correct=pins[uid]||DEFAULT_PINS[uid];
    if(pin===correct){setUser(uid);setPinScreen(null);setPinInput("");setPinError(false);setScreen("home");}
    else{setPinError(true);setPinInput("");}};
  const updatePin=(uid,np)=>{if(np.length!==4||!/^\d{4}$/.test(np)){flash("⚠️ 4 ספרות");return;}
    const nPins={...pins,[uid]:np};setPins(nPins);const al=logAudit("pin_changed",{uid});save({pins:nPins,auditLog:al});setChangePinUser(null);setNewPinVal("");flash("🔒 עודכן!");};

  // ── App object (passed to components) ──
  const app={
    user,isP,tasks,completions,cKey,wk,xp,streaks,goals,setGoals,challenges,messages,swaps,
    selDay,setSelDay,screen,setScreen,
    getLevel,getNextLevel,getXpProgress,getWeekStats,getFamilyPct,getTodayPctForChild,
    getActiveReminder,setReminderShown,reminderShown,
    setDoneConfirm,setBonusModal,sendNudge,setPenaltyModal,setExamModal,
    approveSwap,rejectSwap,earnedBadges,penalties,
    installReady,handleInstall,setInstallReady,
    setShowSummaryModal,setWeeklySummaryData,getWeekCompletionCount,getLeadingChild,getFamilyStreak,getWeekXpTotal,
    isTaskForChild,
    // Wall
    wallText,setWallText,wallTo,setWallTo,sendWallMessage,getWallMessages,toggleReaction,
    // Calendar
    calYear,calMonth,calPrev,calNext,calSelDate,setCalSelDate,
    eventsForDate,getMonthHolidays,getTasksForDate,dateKey,deleteCalEvent,setCalEventModal,
    calEventModal,calNewEvent,setCalNewEvent,addCalEvent,
    // Grocery
    groceries,groceryInput,setGroceryInput,groceryCat,setGroceryCat,
    groceryRecurring,setGroceryRecurring,addGroceryItem,toggleGroceryBought,deleteGroceryItem,clearBoughtGroceries,
    // Tasks
    setPhotoModal,approveWithPraise,reject,deleteTask,
    // Manage
    manageSub,setManageSub,editTask,setEditTask,newTask,setNewTask,
    changePinUser,setChangePinUser,newPinVal,setNewPinVal,
    dragIdx,setDragIdx,dragOverIdx,setDragOverIdx,
    updateTask,changeWeight,reorderTasks,addNewTask,addSuggested,updatePin,save,flash,
    activeReminders,setActiveReminders,auditLog,
    // Approve
    // Modals
    swapModal,setSwapModal,requestSwap,
    bonusModal,setBonusModal,bonusTitle,setBonusTitle,bonusIcon,setBonusIcon,
    bonusFileRef,bonusPhoto,setBonusPhoto,handleBonusPhoto,submitBonus,
    photoModal,setPhotoModal,fileRef,handlePhoto,markDone,
    doneConfirm,setDoneConfirm,
    penaltyModal,setPenaltyModal,addPenalty,
    examModal,setExamModal,examScore,setExamScore,addExam,
    praiseModal,setPraiseModal,praiseText,setPraiseText,praiseStar,setPraiseStar,submitPraise,approve,
    showSummaryModal,weeklySummaryData,
    // Dashboard
    exams,getHeatmapData,getRecentAchievements,getWeeklyXpData,
  };

  // ── PIN Screen ──
  if(pinScreen) return <PinScreen pinScreen={pinScreen} pinInput={pinInput} setPinInput={setPinInput}
    pinError={pinError} setPinError={setPinError} setPinScreen={setPinScreen} verifyPin={verifyPin}/>;

  // ── Login Screen ──
  if(screen==="login") return <LoginScreen S={S}
    getLevel={getLevel} setPinScreen={setPinScreen} setPinInput={setPinInput} setPinError={setPinError}/>;

  const me=FAMILY[user];const today=getToday();

  return(
    <div style={S.app} dir="rtl">
      <style>{`
        :root{--card:#ffffff;--text:#1e293b;--border:#e2e8f0;--inputBg:#f8fafc;--barBg:#f1f5f9;--textSec:#94a3b8;--textTer:#64748b;--textQuat:#475569;
          --loginBg:linear-gradient(140deg,#fef9f0,#f0e6ff 40%,#e0f2fe);--appBg:linear-gradient(180deg,#fef9f0,#f0e6ff);
          --shadow:rgba(0,0,0,0.08);--overlay:rgba(0,0,0,0.4);}
        @keyframes screenIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes listIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes cardPop{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
        @keyframes toastSlide{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
      `}</style>
      <Confetti show={showConfetti}/>
      <LevelUp show={!!levelUpInfo} level={levelUpInfo}/>
      <BadgeEarned show={!!badgeNotification} badge={badgeNotification?.badge}/>
      {toast&&<div style={S.toast}>{toast}</div>}

      {/* HEADER */}
      <div style={S.header}>
        <div style={S.hTop}>
          <button onClick={()=>{setScreen("login");setUser(null);}} style={S.backBtn}>🔒</button>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>{me.name} {!isP&&getLevel(user)?.emoji}</div>
            <div style={{fontSize:9,color:"#6366f1"}}>{isP?"מנהל/ת":me.weeklyPay>0?`${me.weeklyPay}₪/שבוע`:getLevel(user)?.name}</div>
          </div>
          {!isP&&<button onClick={()=>setBonusModal(true)} style={S.bonusFab}>⭐ יוזמה</button>}
        </div>
      </div>

      {/* TABS */}
      <div style={S.tabs}>
        {(()=>{const wallUnread=messages.filter(m=>(m.to==="wall"||m.to===user)&&m.from!==user&&(Date.now()-m.ts)<86400000).length;
        return[
          {id:"home",l:"🏠"},{id:"wall",l:"💬",badge:wallUnread},{id:"cal",l:"📅"},{id:"grocery",l:"🛒"},{id:"tasks",l:"📋"},
          ...(!isP?[{id:"badges",l:"🏅"}]:[]),
          ...(isP?[{id:"dash",l:"📊"},{id:"approve",l:"✅"},{id:"manage",l:"⚙️"},{id:"counselor",l:"💡"}]:[]),
        ].map(t=><button key={t.id} onClick={()=>setScreen(t.id)}
          style={{...S.tab,...(screen===t.id?S.tabA:{}),position:"relative"}}>{t.l}{t.badge>0&&<span style={{position:"absolute",top:2,right:2,width:8,height:8,borderRadius:4,background:"#ef4444"}}/>}</button>);})()}
      </div>

      <div style={S.content}>
        {screen==="home"&&<HomeScreen S={S} app={app}/>}
        {screen==="wall"&&<WallScreen S={S} app={app}/>}
        {screen==="cal"&&<CalendarScreen S={S} app={app}/>}
        {screen==="grocery"&&<GroceryScreen S={S} app={app}/>}
        {screen==="tasks"&&<TasksScreen S={S} app={app}/>}
        {screen==="badges"&&!isP&&<BadgesScreen S={S} app={app}/>}
        {screen==="dash"&&isP&&<DashboardScreen S={S} app={app}/>}
        {screen==="approve"&&isP&&<ApproveScreen S={S} app={app}/>}
        {screen==="manage"&&isP&&<ManageScreen S={S} app={app}/>}
        {screen==="counselor"&&isP&&<CounselorScreen S={S} app={app}/>}
      </div>

      <SwapModal S={S} app={app}/>
      <BonusModal S={S} app={app}/>
      <PhotoModal S={S} app={app}/>
      <DoneConfirmModal S={S} app={app}/>
      <PenaltyModal S={S} app={app}/>
      <CalEventModal S={S} app={app}/>
      <ExamModal S={S} app={app}/>
      <PraiseModal S={S} app={app}/>
      <WeeklySummaryModal S={S} app={app}/>
    </div>
  );
}
