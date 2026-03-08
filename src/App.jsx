import { useState, useEffect, useCallback, useRef } from "react";
import { HDate, HebrewCalendar, flags } from '@hebcal/core';
import storage from "./storage.firebase.js";
import { migrateToFirestore } from "./migration.js";
import S from "./styles.js";
import { FAMILY, CH, FAMILY_NAME, DAYS, DS, DEFAULT_PINS, LEVELS, REMINDERS, PENALTIES, DEFAULT_BADGES, EXAM_BONUSES,
  INIT_TASKS, DEFAULT_GOALS, GROCERY_CATEGORIES, DEFAULT_CHALLENGES, RECURRENCE_PRESETS } from "./constants.js";
import { t, setLanguage, getLang, isRTL } from "./i18n/index.js";
import { compressImage, getWk, getToday, getHour, getTimeStr, dateKey, getWkForDate } from "./utils.js";
import { isTaskForChild as _isTaskForChild, isRecurringTask, getLevel as _getLevel, getNextLevel as _getNextLevel, getXpProgress as _getXpProgress, getNewBadges } from "./logic.js";
import { signInWithGoogle, signOut as authSignOut, onAuthChange, generateFamilyCode } from "./auth.js";
// Animations
import Confetti from "./components/animations/Confetti.jsx";
import LevelUp from "./components/animations/LevelUp.jsx";
import BadgeEarned from "./components/animations/BadgeEarned.jsx";
// Screens
import OnboardingScreen from "./components/screens/OnboardingScreen.jsx";
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
import ProfileScreen from "./components/screens/ProfileScreen.jsx";
import GalleryScreen from "./components/screens/GalleryScreen.jsx";
import MealScreen from "./components/screens/MealScreen.jsx";
import RewardsScreen from "./components/screens/RewardsScreen.jsx";
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
import TimerModal from "./components/modals/TimerModal.jsx";

// Set Firestore collection path based on family code (before component renders)
(()=>{try{const fc=JSON.parse(localStorage.getItem('family-chores_family-config')||'{}');
  if(fc.familyId)storage.setCollection(`families/${fc.familyId}/data`);}catch{}})();

export default function App(){
  const[familyConfigured,setFamilyConfigured]=useState(()=>!!localStorage.getItem('family-chores_family-config'));
  const[googleUser,setGoogleUser]=useState(null);
  const[darkMode,setDarkMode]=useState(()=>localStorage.getItem('family-chores-dark')==='1');
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
  const[newTask,setNewTask]=useState({title:"",icon:"✨",weight:5,assignedTo:[],type:"personal",requirePhoto:false,activeDays:null,recurrence:"daily"});
  const[notifChild,setNotifChild]=useState(null);
  const[bonusModal,setBonusModal]=useState(false);
  const[bonusTitle,setBonusTitle]=useState("");
  const[bonusIcon,setBonusIcon]=useState("⭐");
  const[bonusPhoto,setBonusPhoto]=useState(null);
  const[changePinUser,setChangePinUser]=useState(null);
  const[newPinVal,setNewPinVal]=useState("");
  const[xp,setXp]=useState(()=>Object.fromEntries(CH.map(c=>[c,0])));
  const[streaks,setStreaks]=useState(()=>Object.fromEntries(CH.map(c=>[c,0])));
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
  const[earnedBadges,setEarnedBadges]=useState(()=>Object.fromEntries(CH.map(c=>[c,[]])));
  const[badgeNotification,setBadgeNotification]=useState(null);
  const[totalXpEarned,setTotalXpEarned]=useState(()=>Object.fromEntries(CH.map(c=>[c,0])));
  const[approvedCount,setApprovedCount]=useState(()=>Object.fromEntries(CH.map(c=>[c,0])));
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
  const[locations,setLocations]=useState({});
  const[installReady,setInstallReady]=useState(false);
  const[rewards,setRewards]=useState([
    {id:'rw1',title:'30 דקות מסכים',icon:'📱',cost:50,active:true},
    {id:'rw2',title:'בחירת ארוחת ערב',icon:'🍕',cost:80,active:true},
    {id:'rw3',title:'להישאר ער חצי שעה',icon:'🌙',cost:100,active:true},
  ]);
  const[spentXp,setSpentXp]=useState(()=>Object.fromEntries(CH.map(c=>[c,0])));
  const[purchaseHistory,setPurchaseHistory]=useState([]);
  const[taskTemplates,setTaskTemplates]=useState([]);
  const[customChallenges,setCustomChallenges]=useState([]);
  const[childReminders,setChildReminders]=useState({});
  const[avatars,setAvatars]=useState({});
  const[profileChild,setProfileChild]=useState(null);
  const[activeTimer,setActiveTimer]=useState(null);
  const[soundEnabled,setSoundEnabled]=useState(()=>localStorage.getItem('family-chores-sound')!=='0');
  const[loading,setLoading]=useState(true);
  const[lang,setLang]=useState(getLang);
  const[isOffline,setIsOffline]=useState(!navigator.onLine);
  const[needRefresh,setNeedRefresh]=useState(false);
  const updateSW=useRef(null);
  const deferredPrompt=useRef(null);
  const fileRef=useRef(null);
  const bonusFileRef=useRef(null);
  const wk=getWk();

  // ── Load (granular per-key from Firestore) ──
  useEffect(()=>{(async()=>{try{
    await migrateToFirestore();
    const lk=async(k)=>{const s=await storage.get(k);return s?JSON.parse(s.value):null;};
    const d_tasks=await lk('tasks');if(d_tasks)setTasks(d_tasks);
    const d_comp=await lk('completions');if(d_comp)setCompletions(d_comp);
    const d_pins=await lk('pins');if(d_pins)setPins(d_pins);
    const d_xp=await lk('xp');if(d_xp)setXp(d_xp);
    const d_str=await lk('streaks');if(d_str)setStreaks(d_str);
    const d_goals=await lk('goals');if(d_goals)setGoals(d_goals);
    const d_swaps=await lk('swaps');if(d_swaps)setSwaps(d_swaps);
    const d_ar=await lk('activeReminders');if(d_ar)setActiveReminders(d_ar);
    const d_msg=await lk('messages');if(d_msg)setMessages(d_msg.map(m=>({...m,type:m.type||"praise",reactions:m.reactions||{}})));
    const d_pen=await lk('penalties');if(d_pen)setPenalties(d_pen);
    const d_eb=await lk('earnedBadges');if(d_eb){const migrated={};Object.keys(d_eb).forEach(cid=>{migrated[cid]=(d_eb[cid]||[]).map(b=>typeof b==='string'?{id:b,ts:0}:b);});setEarnedBadges(migrated);}
    const d_txp=await lk('totalXpEarned');if(d_txp)setTotalXpEarned(d_txp);
    const d_ac=await lk('approvedCount');if(d_ac)setApprovedCount(d_ac);
    const d_ex=await lk('exams');if(d_ex)setExams(d_ex);
    const d_ce=await lk('calEvents');if(d_ce)setCalEvents(d_ce);
    const d_gr=await lk('groceries');if(d_gr)setGroceries(d_gr);
    const d_al=await lk('auditLog');if(d_al)setAuditLog(d_al);
    const d_ch=await lk('challenges');if(d_ch)setChallenges(d_ch);
    const d_lsw=await lk('lastSummaryWeek');if(d_lsw)setLastSummaryWeek(d_lsw);
    const d_loc=await lk('locations');if(d_loc)setLocations(d_loc);
    const d_rw=await lk('rewards');if(d_rw)setRewards(d_rw);
    const d_sx=await lk('spentXp');if(d_sx)setSpentXp(d_sx);
    const d_ph=await lk('purchaseHistory');if(d_ph)setPurchaseHistory(d_ph);
    const d_tt=await lk('taskTemplates');if(d_tt)setTaskTemplates(d_tt);
    const d_cc=await lk('customChallenges');if(d_cc)setCustomChallenges(d_cc);
    const d_cr=await lk('childReminders');if(d_cr)setChildReminders(d_cr);
    const d_av=await lk('avatars');if(d_av)setAvatars(d_av);
    setLoading(false);
  }catch(e){console.error('Load error:',e);setLoading(false);}})();},[]);

  // ── Dark mode ──
  useEffect(()=>{document.documentElement.setAttribute('data-theme',darkMode?'dark':'light');
    localStorage.setItem('family-chores-dark',darkMode?'1':'0');},[darkMode]);

  // ── Realtime sync (listen for changes from other devices) ──
  useEffect(()=>{
    if(!storage.onDataChange)return;
    const unsubs=[
      storage.onDataChange('completions',(v)=>{try{setCompletions(JSON.parse(v));}catch{}}),
      storage.onDataChange('tasks',(v)=>{try{setTasks(JSON.parse(v));}catch{}}),
      storage.onDataChange('messages',(v)=>{try{setMessages(JSON.parse(v).map(m=>({...m,type:m.type||"praise",reactions:m.reactions||{}})));}catch{}}),
      storage.onDataChange('locations',(v)=>{try{setLocations(JSON.parse(v));}catch{}}),
      storage.onDataChange('groceries',(v)=>{try{setGroceries(JSON.parse(v));}catch{}}),
      storage.onDataChange('xp',(v)=>{try{setXp(JSON.parse(v));}catch{}}),
      storage.onDataChange('streaks',(v)=>{try{setStreaks(JSON.parse(v));}catch{}}),
    ];
    return()=>unsubs.forEach(u=>u&&u());
  },[]);

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
  useEffect(()=>{const off=()=>{setIsOffline(true);flash(t("app.offlineShort"));};
    const on=()=>{setIsOffline(false);flash(t("app.backOnline"));};
    window.addEventListener("offline",off);window.addEventListener("online",on);
    return()=>{window.removeEventListener("offline",off);window.removeEventListener("online",on);};},[]);
  // ── PWA update detection ──
  useEffect(()=>{if('serviceWorker' in navigator){
    navigator.serviceWorker.ready.then(reg=>{reg.addEventListener('updatefound',()=>{
      const newSW=reg.installing;if(newSW){newSW.addEventListener('statechange',()=>{
        if(newSW.state==='installed'&&navigator.serviceWorker.controller){setNeedRefresh(true);updateSW.current=()=>{newSW.postMessage({type:'SKIP_WAITING'});window.location.reload();};}
      });}
    });});
    let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!refreshing){refreshing=true;window.location.reload();}});
  }},[]);
  useEffect(()=>{if(!user||!("Notification" in window))return;
    // Request notification permission on first login
    if(Notification.permission==="default"){Notification.requestPermission();}
    const notifKey=(id)=>`notif_${id}_${getToday()}`;
    const iv=setInterval(()=>{if(Notification.permission!=="granted"||!user)return;
      const h=getHour();const isChild=FAMILY[user]?.role!=="parent";
      if(isChild){
        const pending=tasks.filter(t=>isTaskForChild(t,user,getToday())&&!t.bonus&&!completions[`${getWk()}_${t.id}_${user}_${getToday()}`]?.done).length;
        if(pending===0)return;
        const streak=streaks[user]||0;
        const morningMsgs=[`☀️ בוקר טוב! יש לך ${pending} משימות להיום`,`🌅 יום חדש, ${pending} משימות מחכות לך!`,`💪 בוא נתחיל! ${pending} משימות ממתינות`];
        const afternoonMsgs=[`🕐 אחה"צ טוב! נשארו ${pending} משימות`,`📋 עוד ${pending} משימות ואתה סיימת!`,`⏰ אל תשכח — ${pending} משימות פתוחות`];
        const eveningMsgs=[`🌙 ערב! עוד ${pending} משימות לסגור`,`⚡ רגע אחרון — ${pending} משימות פתוחות${streak>0?" • הסטריק שלך בסכנה! 🔥":""}`,`🏃 סיום היום: ${pending} משימות ממתינות`];
        let body=null,nKey=null;
        if(h===7&&!sessionStorage.getItem(notifKey('m'))){body=morningMsgs[Math.floor(Math.random()*morningMsgs.length)];nKey='m';}
        else if(h===14&&!sessionStorage.getItem(notifKey('a'))){body=afternoonMsgs[Math.floor(Math.random()*afternoonMsgs.length)];nKey='a';}
        else if(h===19&&!sessionStorage.getItem(notifKey('e'))){body=eveningMsgs[Math.floor(Math.random()*eveningMsgs.length)];nKey='e';}
        if(body){try{new Notification("משימות המשפחה 🏠",{body,icon:"/icon-192.png",dir:"rtl",lang:"he",tag:"chores-"+nKey});sessionStorage.setItem(notifKey(nKey),'1');}catch{}}
        // Per-child custom reminders
        const myRems=childReminders[user]||[];const nowStr=getTimeStr();
        for(const rem of myRems){if(!rem.enabled)continue;
          const rKey=`crem_${rem.id}_${getToday()}`;if(sessionStorage.getItem(rKey))continue;
          const[rh,rm]=rem.time.split(":").map(Number);
          if(h===rh&&Math.abs(new Date().getMinutes()-rm)<=2){
            try{new Notification(`⏰ ${rem.label||"תזכורת"}`,{body:`${pending} משימות ממתינות`,icon:"/icon-192.png",dir:"rtl",lang:"he",tag:"crem-"+rem.id});
              sessionStorage.setItem(rKey,'1');}catch{}}}
      } else {
        // Parent: notify about pending approvals
        const pendingApprove=Object.entries(completions).filter(([,v])=>v?.done&&!v?.approved).length;
        if(pendingApprove>0&&h===20&&!sessionStorage.getItem(notifKey('p'))){
          try{new Notification("משימות המשפחה 🏠",{body:`📋 יש ${pendingApprove} משימות ממתינות לאישור`,icon:"/icon-192.png",dir:"rtl",lang:"he",tag:"chores-approve"});
            sessionStorage.setItem(notifKey('p'),'1');}catch{}}
      }
    },60000);return()=>clearInterval(iv);},[user,tasks,completions,streaks,childReminders]);

  // ── Save (granular per-key to Firestore) ──
  const save=useCallback(async(overrides={})=>{try{
    const ps=Object.entries(overrides).map(([k,v])=>storage.set(k,JSON.stringify(v)));
    await Promise.all(ps);
  }catch(e){console.error('Save error:',e);}},[]);

  // ── Helpers ──
  const flash=(m)=>{setToast(m);setTimeout(()=>setToast(null),2200);};
  const haptic=(ms=50)=>{if(navigator.vibrate)navigator.vibrate(ms);};
  const playSound=useCallback((type)=>{
    if(!soundEnabled)return;try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const osc=ctx.createOscillator();const gain=ctx.createGain();
    osc.connect(gain);gain.connect(ctx.destination);gain.gain.value=0.1;
    if(type==='done'){osc.frequency.value=880;osc.type='sine';osc.start();osc.stop(ctx.currentTime+0.1);}
    else if(type==='levelup'){osc.frequency.value=523;osc.type='sine';osc.start();setTimeout(()=>osc.frequency.value=659,100);setTimeout(()=>osc.frequency.value=784,200);osc.stop(ctx.currentTime+0.35);}
    else if(type==='badge'){osc.frequency.value=1047;osc.type='triangle';osc.start();osc.stop(ctx.currentTime+0.2);}
    }catch{}
  },[soundEnabled]);
  const logAudit=(action,details={})=>{const entry={id:"aud_"+Date.now(),action,by:user,ts:Date.now(),...details};
    const nl=[entry,...auditLog].slice(0,500);setAuditLog(nl);return nl;};
  const cKey=(tid,cid,day)=>`${wk}_${tid}_${cid}_${day}`;
  const isP=user&&FAMILY[user]?.role==="parent";

  const isTaskForChild=(task,cid,day,dateStr)=>_isTaskForChild(task,cid,day,dateStr);
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
  const getLevel=(cid)=>_getLevel(xp[cid]||0, LEVELS);
  const getNextLevel=(cid)=>_getNextLevel(xp[cid]||0, LEVELS);
  const getXpProgress=(cid)=>_getXpProgress(xp[cid]||0, LEVELS);

  const addXp=(cid,amount)=>{
    const oldLv=getLevel(cid);
    const newXp={...xp,[cid]:(xp[cid]||0)+amount};
    setXp(newXp);
    const newLv=LEVELS.slice().reverse().find(l=>(newXp[cid]||0)>=l.min);
    if(newLv&&newLv.min>oldLv.min){setLevelUpInfo(newLv);setTimeout(()=>setLevelUpInfo(null),3000);
      playSound('levelup');haptic(200);
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
      playSound('badge');haptic(150);
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
  const markDone=(tid,cid,day,photo,timerBonus)=>{
    const k=cKey(tid,cid,day);
    const nc={...completions,[k]:{done:true,photo:photo||null,approved:false,approvedBy:null,ts:Date.now(),timerBonus:!!timerBonus}};
    setCompletions(nc);
    const allToday=tasks.filter(t=>isTaskForChild(t,cid,day)&&!t.bonus);
    const allDone=allToday.every(t=>{const kk=t.id===tid?k:cKey(t.id,cid,day);return nc[kk]?.done;});
    if(allDone){setShowConfetti(true);setTimeout(()=>setShowConfetti(false),3000);
      const sm=addSystemMessage(`${FAMILY[cid]?.name} סיים/ה את כל המשימות! 🎉`,"🎉");setMessages(sm);save({completions:nc,messages:sm});flash("✅ בוצע!");return;}
    const al=logAudit("task_done",{taskId:tid,childId:cid});save({completions:nc,auditLog:al});flash("✅ בוצע!");haptic();playSound('done');
  };

  const approve=(tid,cid,day)=>{
    const k=cKey(tid,cid,day);if(!completions[k])return;
    const nc={...completions,[k]:{...completions[k],approved:true,approvedBy:user}};
    setCompletions(nc);
    const task=tasks.find(t=>t.id===tid);
    const baseXp=task?(task.bonus?task.weight*2:task.weight):5;
    const xpGain=nc[k]?.timerBonus?Math.round(baseXp*1.5):baseXp;
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

  // ── Avatars ──
  const setAvatar=(cid,avatar)=>{
    const na={...avatars,[cid]:avatar};setAvatars(na);save({avatars:na});flash("✨ אווטאר עודכן!");
  };

  // ── Per-child reminders ──
  const getNextReminder=(childId)=>{
    const rems=childReminders[childId]||[];
    const now=getTimeStr();const[nh,nm]=now.split(":").map(Number);const nowMin=nh*60+nm;
    let next=null,minDiff=Infinity;
    for(const r of rems){if(!r.enabled)continue;const[rh,rm]=r.time.split(":").map(Number);const rMin=rh*60+rm;
      let diff=rMin-nowMin;if(diff<0)diff+=1440;
      if(diff<minDiff){minDiff=diff;next=r;}}
    return next;
  };
  const addChildReminder=(childId,reminder)=>{
    const cur=childReminders[childId]||[];
    const nc={...childReminders,[childId]:[...cur,{...reminder,id:"rem_"+Date.now(),enabled:true}]};
    setChildReminders(nc);save({childReminders:nc});flash("⏰ תזכורת נוספה!");
  };
  const toggleChildReminder=(childId,remId)=>{
    const cur=childReminders[childId]||[];
    const nc={...childReminders,[childId]:cur.map(r=>r.id===remId?{...r,enabled:!r.enabled}:r)};
    setChildReminders(nc);save({childReminders:nc});
  };
  const deleteChildReminder=(childId,remId)=>{
    const cur=childReminders[childId]||[];
    const nc={...childReminders,[childId]:cur.filter(r=>r.id!==remId)};
    setChildReminders(nc);save({childReminders:nc});flash("🗑️");
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
    setNewTask({title:"",icon:"✨",weight:5,assignedTo:[],type:"personal",requirePhoto:false,activeDays:null,recurrence:"daily"});flash("✨ נוספה!");};
  const addSuggested=(s)=>{if(tasks.find(t=>t.title===s.title)){flash("⚠️ קיימת");return;}
    const nt=[...tasks,{id:"t"+Date.now(),title:s.title,icon:s.icon,weight:s.weight,assignedTo:[...CH],bonus:false,type:"personal"}];
    setTasks(nt);save({tasks:nt});flash(`✨ ${s.title} נוספה!`);};
  const deleteTask=(tid)=>{const nt=tasks.filter(t=>t.id!==tid);setTasks(nt);const al=logAudit("task_deleted",{taskId:tid});save({tasks:nt,auditLog:al});flash("🗑️");};
  const updateTask=(tid,u)=>{const nt=tasks.map(t=>t.id===tid?{...t,...u}:t);setTasks(nt);const al=logAudit("task_updated",{taskId:tid});save({tasks:nt,auditLog:al});};
  const changeWeight=(tid,d)=>{const t=tasks.find(x=>x.id===tid);if(t)updateTask(tid,{weight:Math.max(1,t.weight+d)});};
  const reorderTasks=(fromIdx,toIdx)=>{const nonBonus=tasks.filter(t=>!t.bonus);const bonus=tasks.filter(t=>t.bonus);
    const reordered=[...nonBonus];const[moved]=reordered.splice(fromIdx,1);reordered.splice(toIdx,0,moved);
    const nt=[...reordered,...bonus];setTasks(nt);const al=logAudit("task_updated",{detail:"reorder"});save({tasks:nt,auditLog:al});};
  const skipTaskForDate=(taskId,dateStr)=>{
    const nt=tasks.map(t=>t.id===taskId?{...t,skippedDates:[...(t.skippedDates||[]),dateStr]}:t);
    setTasks(nt);save({tasks:nt});flash("⏭️ דילוג!");};

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

  // ── Rewards Shop ──
  const getSpendableXp=(cid)=>(totalXpEarned[cid]||0)-(spentXp[cid]||0);
  const purchaseReward=(childId,rewardId)=>{
    const reward=rewards.find(r=>r.id===rewardId);
    if(!reward||!reward.active){flash('⚠️ פרס לא זמין');return;}
    if(getSpendableXp(childId)<reward.cost){flash('⚠️ אין מספיק נקודות');return;}
    const ns={...spentXp,[childId]:(spentXp[childId]||0)+reward.cost};setSpentXp(ns);
    const purchase={id:'pur_'+Date.now(),childId,rewardId,title:reward.title,icon:reward.icon,cost:reward.cost,ts:Date.now(),status:'pending'};
    const np=[purchase,...purchaseHistory];setPurchaseHistory(np);
    const al=logAudit('reward_purchased',{childId,rewardId,cost:reward.cost});
    save({spentXp:ns,purchaseHistory:np,auditLog:al});flash(`🎁 ${reward.title} נרכש!`);
  };
  const addReward=(title,icon,cost)=>{
    const nr=[...rewards,{id:'rw_'+Date.now(),title,icon,cost:parseInt(cost)||50,active:true}];
    setRewards(nr);save({rewards:nr});flash('✨ פרס נוסף!');
  };
  const toggleRewardActive=(rewardId)=>{
    const nr=rewards.map(r=>r.id===rewardId?{...r,active:!r.active}:r);
    setRewards(nr);save({rewards:nr});
  };
  const deleteReward=(rewardId)=>{
    const nr=rewards.filter(r=>r.id!==rewardId);setRewards(nr);save({rewards:nr});flash('🗑️');
  };
  const fulfillPurchase=(purchaseId)=>{
    const np=purchaseHistory.map(p=>p.id===purchaseId?{...p,status:'fulfilled'}:p);
    setPurchaseHistory(np);save({purchaseHistory:np});flash('✅ פרס סופק!');
  };

  // ── Task Templates ──
  const saveAsTemplate=(name)=>{
    const template={id:'tpl_'+Date.now(),name:name||'תבנית '+new Date().toLocaleDateString('he-IL'),
      tasks:tasks.filter(t=>!t.bonus).map(t=>({title:t.title,icon:t.icon,weight:t.weight,assignedTo:t.assignedTo,type:t.type,requirePhoto:t.requirePhoto,activeDays:t.activeDays})),
      ts:Date.now()};
    const nt=[...taskTemplates,template];setTaskTemplates(nt);save({taskTemplates:nt});flash('💾 תבנית נשמרה!');
  };
  const applyTemplate=(templateId,mode='replace')=>{
    const tpl=taskTemplates.find(t=>t.id===templateId);if(!tpl)return;
    const newTasks=tpl.tasks.map((t,i)=>({...t,id:'t_tpl_'+Date.now()+'_'+i,bonus:false}));
    const merged=mode==='replace'?[...newTasks,...tasks.filter(t=>t.bonus)]:[...tasks,...newTasks.filter(nt=>!tasks.some(t=>t.title===nt.title))];
    setTasks(merged);const al=logAudit('template_applied',{templateId,mode});
    save({tasks:merged,auditLog:al});flash(mode==='replace'?'📋 תבנית הוחלה!':'📋 משימות מוזגו!');
  };
  const deleteTemplate=(templateId)=>{
    const nt=taskTemplates.filter(t=>t.id!==templateId);setTaskTemplates(nt);save({taskTemplates:nt});flash('🗑️');
  };

  // ── Custom Challenges ──
  const addCustomChallenge=(ch)=>{
    const nc=[...customChallenges,{...ch,id:"cch_"+Date.now()}];
    setCustomChallenges(nc);save({customChallenges:nc});flash("🏆 אתגר נוסף!");
  };
  const deleteCustomChallenge=(chId)=>{
    const nc=customChallenges.filter(c=>c.id!==chId);
    setCustomChallenges(nc);save({customChallenges:nc});flash("🗑️");
  };

  // ── Challenges ──
  const initWeeklyChallenges=()=>{
    const existing=challenges.find(c=>c.week===wk);if(existing)return challenges;
    const pool=[...DEFAULT_CHALLENGES,...customChallenges];
    const picked=pool.sort(()=>Math.random()-0.5).slice(0,3);
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
        else if(ch.condition==="all_same_day"){for(let d=0;d<7;d++){const allDone=CH.every(cid=>{
          const dt=tasks.filter(t=>isTaskForChild(t,cid,d)&&!t.bonus);
          return dt.length>0&&dt.every(t=>completions[cKey(t.id,cid,d)]?.approved);});if(allDone){met=true;break;}}}
        if(met){changed=true;const cb={};CH.forEach(c=>{cb[c]=true;});return{...ch,completedBy:cb};}
      } else {
        const newCB={...ch.completedBy};
        CH.forEach(cid=>{if(newCB[cid])return;let met=false;
          if(ch.condition==="streak_days")met=(streaks[cid]||0)>=ch.value;
          else if(ch.condition==="zero_missed"){let clean=0;for(let d=0;d<7;d++){const dayTasks=tasks.filter(t=>isTaskForChild(t,cid,d)&&!t.bonus);
            if(dayTasks.length>0&&dayTasks.every(t=>completions[cKey(t.id,cid,d)]?.done))clean++;} met=clean>=ch.value;}
          else if(ch.condition==="week_xp"){const wd=getWeeklyXpData();met=(wd[cid]||0)>=ch.value;}
          else if(ch.condition==="week_tasks_done"){let cnt=0;for(let d=0;d<7;d++){tasks.forEach(t=>{if(isTaskForChild(t,cid,d)&&!t.bonus&&completions[cKey(t.id,cid,d)]?.approved)cnt++;});} met=cnt>=ch.value;}
          else if(ch.condition==="bonus_count"){let cnt=0;for(let d=0;d<7;d++){tasks.forEach(t=>{if(t.bonus&&t.assignedTo.includes(cid)&&completions[cKey(t.id,cid,d)]?.approved)cnt++;});} met=cnt>=ch.value;}
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
    if(pin===correct){setUser(uid);setPinScreen(null);setPinInput("");setPinError(false);setScreen("home");
      const al=logAudit('login',{uid});save({auditLog:al});}
    else{setPinError(true);setPinInput("");}};
  const updatePin=(uid,np)=>{if(np.length!==4||!/^\d{4}$/.test(np)){flash("⚠️ 4 ספרות");return;}
    const nPins={...pins,[uid]:np};setPins(nPins);const al=logAudit("pin_changed",{uid});save({pins:nPins,auditLog:al});setChangePinUser(null);setNewPinVal("");flash("🔒 עודכן!");};

  // ── Family code ──
  const familyId=(()=>{try{return JSON.parse(localStorage.getItem('family-chores_family-config')||'{}').familyId||null;}catch{return null;}})();

  // ── App object (passed to components) ──
  const app={
    FAMILY,CH,familyName:FAMILY_NAME,storage,familyId,
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
    // Location status
    locations,setLocations,
    // Dark mode
    darkMode,setDarkMode,
    // PWA
    isOffline,needRefresh,updateSW,
    // Rewards
    rewards,setRewards,spentXp,purchaseHistory,getSpendableXp,
    purchaseReward,addReward,toggleRewardActive,deleteReward,fulfillPurchase,
    // Templates
    taskTemplates,saveAsTemplate,applyTemplate,deleteTemplate,
    totalXpEarned,
    // Recurring
    skipTaskForDate,isRecurringTask,RECURRENCE_PRESETS,
    // Custom Challenges
    customChallenges,addCustomChallenge,deleteCustomChallenge,
    // Child Reminders
    childReminders,getNextReminder,addChildReminder,toggleChildReminder,deleteChildReminder,
    // Profile & Avatars
    avatars,setAvatar,profileChild,setProfileChild,approvedCount,
    // Timer
    activeTimer,setActiveTimer,
    // UX
    soundEnabled,setSoundEnabled:v=>{setSoundEnabled(v);localStorage.setItem('family-chores-sound',v?'1':'0');},
    // i18n
    t,lang,setLang:(l)=>{setLanguage(l);setLang(l);},isRTL,
    // ICS import
    importIcs:(icsText)=>{
      const events=[];const lines=icsText.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n');
      let cur=null;
      for(const line of lines){
        if(line==='BEGIN:VEVENT'){cur={};}
        else if(line==='END:VEVENT'&&cur){
          if(cur.title&&cur.date){events.push({id:'ics_'+Date.now()+Math.random(),title:cur.title,icon:'📅',type:'custom',recurring:null,members:[],date:cur.date,createdBy:user,color:'#6366f1',notes:cur.notes||''});}
          cur=null;
        } else if(cur){
          if(line.startsWith('SUMMARY:'))cur.title=line.slice(8).trim();
          else if(line.startsWith('DTSTART')){const v=line.split(':').pop().trim();if(v.length>=8){const y=v.slice(0,4),m=v.slice(4,6),d=v.slice(6,8);cur.date=`${y}-${m}-${d}`;}}
          else if(line.startsWith('DESCRIPTION:'))cur.notes=line.slice(12).trim();
        }
      }
      if(events.length===0){flash('⚠️ לא נמצאו אירועים בקובץ');return;}
      const ne=[...calEvents,...events.filter(e=>!calEvents.some(c=>c.title===e.title&&c.date===e.date))];
      setCalEvents(ne);save({calEvents:ne});flash(`📅 יובאו ${events.length} אירועים!`);
    },
  };

  // ── Loading screen ──
  if(loading&&familyConfigured) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"var(--loginBg)",gap:16}}>
      <div style={{fontSize:48,animation:"spin 2s linear infinite"}}>🏠</div>
      <div style={{fontSize:14,fontWeight:700,color:"var(--text)",animation:"pulse 1.5s ease-in-out infinite"}}>{t("app.loading")}</div>
    </div>
  );

  // ── Onboarding (first run) ──
  if(!familyConfigured) return <OnboardingScreen onComplete={async(cfg)=>{
    const familyId=cfg.familyId||generateFamilyCode();
    const configStr=JSON.stringify({family:cfg.family,children:cfg.children,pins:cfg.pins,familyName:cfg.familyName,familyId});
    localStorage.setItem('family-chores_family-config',configStr);
    // Set collection path for this family
    storage.setCollection(`families/${familyId}/data`);
    // Save each key individually (granular for Firestore)
    try{
      await storage.set('family-config',configStr);
      const d=cfg.initialData;
      for(const[k,v]of Object.entries(d)){await storage.set(k,JSON.stringify(v));}
    }catch(e){console.error('Onboarding save:',e);}
    window.location.reload();
  }} onJoin={async(familyId)=>{
    // Join existing family: set collection, load config, save locally
    storage.setCollection(`families/${familyId}/data`);
    try{
      const fc=await storage.get('family-config');
      if(!fc){alert('קוד משפחה לא נמצא');return;}
      const config=JSON.parse(fc.value);
      config.familyId=familyId;
      localStorage.setItem('family-chores_family-config',JSON.stringify(config));
      localStorage.setItem('family-chores_migrated','true');
      window.location.reload();
    }catch(e){console.error('Join error:',e);alert('שגיאה בהצטרפות — בדקו את הקוד');}
  }} signInWithGoogle={signInWithGoogle}/>;

  // ── PIN Screen ──
  if(pinScreen) return <PinScreen pinScreen={pinScreen} pinInput={pinInput} setPinInput={setPinInput}
    pinError={pinError} setPinError={setPinError} setPinScreen={setPinScreen} verifyPin={verifyPin}/>;

  // ── Login Screen ──
  const handleReset=()=>{if(confirm('האם לאפס את הגדרות המשפחה? כל הנתונים יימחקו!')){
    localStorage.removeItem('family-chores_family-config');localStorage.removeItem('family-chores_chores-v5');localStorage.removeItem('family-chores_migrated');window.location.reload();}};
  if(screen==="login") return <LoginScreen S={S}
    getLevel={getLevel} setPinScreen={setPinScreen} setPinInput={setPinInput} setPinError={setPinError} onReset={handleReset}/>;

  const me=FAMILY[user];const today=getToday();

  const wallUnread=messages.filter(m=>(m.to==="wall"||m.to===user)&&m.from!==user&&(Date.now()-m.ts)<86400000).length;
  const tabNames={home:t("nav.home"),wall:t("nav.wall"),cal:t("nav.cal"),meal:t("nav.meal"),grocery:t("nav.grocery"),tasks:t("nav.tasks"),badges:t("nav.badges"),rewards:t("nav.rewards"),dash:t("nav.dash"),approve:t("nav.approve"),manage:t("nav.manage"),counselor:t("nav.counselor")};
  const tabList=[
    {id:"home",l:"🏠"},{id:"wall",l:"💬",badge:wallUnread},{id:"cal",l:"📅"},{id:"meal",l:"🍽️"},{id:"grocery",l:"🛒"},{id:"tasks",l:"📋"},
    ...(!isP?[{id:"badges",l:"🏅"},{id:"rewards",l:"🎁"}]:[]),
    ...(isP?[{id:"dash",l:"📊"},{id:"approve",l:"✅"},{id:"manage",l:"⚙️"},{id:"counselor",l:"💡"}]:[]),
  ];

  return(
    <div className="app-shell" style={S.app} dir={isRTL()?"rtl":"ltr"}>
      <style>{`
        *:focus-visible{outline:2px solid #6366f1;outline-offset:2px;border-radius:4px;}
      `}</style>
      <Confetti show={showConfetti}/>
      <LevelUp show={!!levelUpInfo} level={levelUpInfo}/>
      <BadgeEarned show={!!badgeNotification} badge={badgeNotification?.badge}/>
      {toast&&<div style={S.toast} role="status" aria-live="polite">{toast}</div>}

      {/* Offline banner */}
      {isOffline&&<div style={{background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",textAlign:"center",padding:"6px 12px",fontSize:11,fontWeight:700,position:"sticky",top:0,zIndex:1001}}>
        {t("app.offline")}
      </div>}

      {/* Update available banner */}
      {needRefresh&&<div style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",textAlign:"center",padding:"6px 12px",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8,position:"sticky",top:isOffline?28:0,zIndex:1001}}>
        {t("app.newVersion")}
        <button onClick={()=>updateSW.current&&updateSW.current()} style={{background:"#fff",color:"#6366f1",border:"none",borderRadius:6,padding:"3px 10px",fontSize:10,fontWeight:700,cursor:"pointer"}}>{t("app.refresh")}</button>
      </div>}

      {/* HEADER */}
      <div className="app-header" style={S.header}>
        <div style={S.hTop}>
          <button onClick={()=>setDarkMode(d=>!d)} style={{...S.backBtn,fontSize:14}} aria-label={t("app.darkMode")}>{darkMode?'☀️':'🌙'}</button>
          <button onClick={()=>{setScreen("login");setUser(null);}} style={S.backBtn} aria-label={t("app.lock")}>🔒</button>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>{me.name} {!isP&&getLevel(user)?.emoji}</div>
            <div style={{fontSize:9,color:"#6366f1"}}>{isP?t("app.manager"):me.weeklyPay>0?t("app.perWeek",{amount:me.weeklyPay}):getLevel(user)?.name}</div>
          </div>
          {!isP&&<button onClick={()=>setBonusModal(true)} style={S.bonusFab}>{t("app.initiative")}</button>}
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <nav className="app-sidebar">
        {tabList.map(t=>(
          <button key={t.id} onClick={()=>setScreen(t.id)}
            className={`tab-btn${screen===t.id?' active':''}`}
            aria-label={tabNames[t.id]||t.id}>
            <span style={{fontSize:16}}>{t.l}</span>
            <span>{tabNames[t.id]}</span>
            {t.badge>0&&<span className="tab-badge"/>}
          </button>
        ))}
      </nav>

      {/* MOBILE TABS */}
      <div className="mobile-tabs" style={S.tabs} role="tablist" aria-label={t("nav.main")}>
        {tabList.map(t=><button key={t.id} onClick={()=>setScreen(t.id)} role="tab" aria-selected={screen===t.id} aria-label={tabNames[t.id]||t.id}
          style={{...S.tab,...(screen===t.id?S.tabA:{}),position:"relative"}}><span aria-hidden="true">{t.l}</span>{t.badge>0&&<span style={{position:"absolute",top:2,right:2,width:8,height:8,borderRadius:4,background:"#ef4444"}} aria-label={`${t.badge} הודעות חדשות`}/>}</button>)}
      </div>

      <div className="app-content" key={screen} style={{...S.content,animation:'screenIn 0.25s ease-out'}}>
        {screen==="home"&&<HomeScreen S={S} app={app}/>}
        {screen==="wall"&&<WallScreen S={S} app={app}/>}
        {screen==="cal"&&<CalendarScreen S={S} app={app}/>}
        {screen==="grocery"&&<GroceryScreen S={S} app={app}/>}
        {screen==="tasks"&&<TasksScreen S={S} app={app}/>}
        {screen==="badges"&&!isP&&<BadgesScreen S={S} app={app}/>}
        {screen==="rewards"&&!isP&&<RewardsScreen S={S} app={app}/>}
        {screen==="dash"&&isP&&<DashboardScreen S={S} app={app}/>}
        {screen==="approve"&&isP&&<ApproveScreen S={S} app={app}/>}
        {screen==="manage"&&isP&&<ManageScreen S={S} app={app}/>}
        {screen==="counselor"&&isP&&<CounselorScreen S={S} app={app}/>}
        {screen==="meal"&&<MealScreen S={S} app={app}/>}
        {screen==="profile"&&<ProfileScreen S={S} app={app}/>}
        {screen==="gallery"&&<GalleryScreen S={S} app={app}/>}
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
      <TimerModal S={S} app={app}/>
    </div>
  );
}
