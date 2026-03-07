import { useState, useEffect, useCallback, useRef } from "react";
import storage from "./storage.js";

const DAYS=["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
const DS=["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];
const DEFAULT_PINS={liron:"1234",omri:"1234",peleg:"1111",yahav:"2222",yahel:"3333"};
const FAMILY={
  liron:{name:"לירון",role:"parent",emoji:"👨",color:"#6366f1",weeklyPay:0},
  omri:{name:"עומרי",role:"parent",emoji:"👩",color:"#ec4899",weeklyPay:0},
  peleg:{name:"פלג",role:"child",emoji:"🧒",weeklyPay:110,color:"#f59e0b"},
  yahav:{name:"יהב",role:"child",emoji:"👦",weeklyPay:75,color:"#10b981"},
  yahel:{name:"יהל",role:"child",emoji:"👧",weeklyPay:0,color:"#8b5cf6"},
};
const CH=["peleg","yahav","yahel"];
const LEVELS=[
  {name:"מתחיל",emoji:"🌱",min:0},{name:"חרוץ",emoji:"💪",min:100},{name:"מסודר",emoji:"📋",min:250},
  {name:"אחראי",emoji:"🎯",min:500},{name:"כוכב",emoji:"⭐",min:800},{name:"גיבור",emoji:"🦸",min:1200},
  {name:"מקצוען",emoji:"🏅",min:1700},{name:"מאסטר",emoji:"🎓",min:2300},{name:"מומחה",emoji:"💎",min:3000},
  {name:"אלוף",emoji:"🏆",min:4000},{name:"נינג'ה",emoji:"🥷",min:5200},{name:"סופר-סטאר",emoji:"🌟",min:6500},
  {name:"מלך/מלכה",emoji:"👑",min:8000},{name:"אגדה",emoji:"🐉",min:10000},{name:"אלוף העולם",emoji:"🌍",min:13000},
];
const REMINDERS=[
  {id:"morning",label:"בוקר",time:"07:30",emoji:"🌅"},
  {id:"afternoon",label:"צהריים",time:"14:00",emoji:"☀️"},
  {id:"evening",label:"ערב",time:"18:00",emoji:"🌆"},
  {id:"night",label:"לילה",time:"20:30",emoji:"🌙"},
];
const SUGGESTED=[
  {title:"העמסת מדיח",icon:"🍽️",weight:10,cat:"מטבח"},{title:"פינוי מדיח",icon:"🫧",weight:8,cat:"מטבח"},
  {title:"הורדת זבל",icon:"🗑️",weight:7,cat:"ניקיון"},{title:"סידור החדר",icon:"🛏️",weight:10,cat:"חדר"},
  {title:"שאיבת אבק",icon:"🧹",weight:8,cat:"ניקיון"},{title:"שטיפת רצפה",icon:"🧽",weight:9,cat:"ניקיון"},
  {title:"ניקוי שולחן",icon:"🪑",weight:5,cat:"מטבח"},{title:"ניקוי משטחי מטבח",icon:"✨",weight:6,cat:"מטבח"},
  {title:"קיפול כביסה",icon:"👕",weight:8,cat:"כביסה"},{title:"העמסת כביסה",icon:"🧺",weight:6,cat:"כביסה"},
  {title:"תליית כביסה",icon:"👔",weight:7,cat:"כביסה"},{title:"סידור ארון",icon:"🗄️",weight:6,cat:"חדר"},
  {title:"הכנת שיעורים",icon:"📚",weight:12,cat:"לימודים"},{title:"תרגול קריאה",icon:"📖",weight:8,cat:"לימודים"},
  {title:"תרגול מוזיקה",icon:"🎵",weight:7,cat:"לימודים"},{title:"טיפול בחיות",icon:"🐕",weight:8,cat:"אחר"},
  {title:"השקיית צמחים",icon:"🪴",weight:4,cat:"אחר"},{title:"הכנת ארוחת בוקר",icon:"🍳",weight:7,cat:"מטבח"},
  {title:"הכנת סנדוויץ׳",icon:"🥪",weight:6,cat:"מטבח"},{title:"ניקוי אמבטיה",icon:"🚿",weight:9,cat:"ניקיון"},
  {title:"סידור נעליים",icon:"👟",weight:3,cat:"ניקיון"},{title:"מיחזור",icon:"♻️",weight:5,cat:"ניקיון"},
  {title:"סידור צעצועים",icon:"🧸",weight:5,cat:"חדר"},{title:"הצעת מיטה",icon:"🛌",weight:4,cat:"חדר"},
  {title:"עזרה בבישול",icon:"🥘",weight:9,cat:"מטבח"},{title:"שטיפת כלים ביד",icon:"🫗",weight:7,cat:"מטבח"},
  {title:"הכנת תיק",icon:"🎒",weight:5,cat:"לימודים"},{title:"עזרה בגינה",icon:"🌿",weight:8,cat:"אחר"},
];
const PENALTIES=[
  {id:"p1",title:"קללות",icon:"🤬",xp:5},
  {id:"p2",title:"אלימות",icon:"👊",xp:15},
  {id:"p3",title:"אי פינוי כלים",icon:"🍽️",xp:10},
  {id:"p4",title:"אי פינוי בגדים",icon:"👕",xp:10},
  {id:"p5",title:"התגרות בהורים/אחים",icon:"😤",xp:10},
];
const DEFAULT_BADGES=[
  {id:"b1",title:"יום ראשון!",emoji:"🎉",condition:"chores_completed",value:1,desc:"סיימת משימה ראשונה!"},
  {id:"b2",title:"שבוע מושלם",emoji:"🌟",condition:"streak_days",value:7,desc:"7 ימי רצף!"},
  {id:"b3",title:"סופר סטריק",emoji:"🔥",condition:"streak_days",value:30,desc:"30 ימים רצופים!"},
  {id:"b4",title:"מאה משימות",emoji:"💯",condition:"chores_completed",value:100,desc:"100 משימות!"},
  {id:"b5",title:"חמש מאות",emoji:"🚀",condition:"chores_completed",value:500,desc:"500 משימות!!"},
  {id:"b6",title:"עשיר",emoji:"💰",condition:"total_xp_earned",value:1000,desc:"צברת 1000 נקודות"},
  {id:"b7",title:"המנקה הגדול",emoji:"🧹",condition:"chores_completed",value:50,desc:"50 משימות!"},
  {id:"b8",title:"שף מתחיל",emoji:"👨‍🍳",condition:"chores_completed",value:20,desc:"20 משימות!"},
  {id:"b9",title:"ירוק",emoji:"🌿",condition:"chores_completed",value:10,desc:"10 משימות!"},
  {id:"b10",title:"תלמיד חכם",emoji:"📚",condition:"chores_completed",value:30,desc:"30 משימות!"},
];
const EXAM_BONUSES=[{min:100,bonus:100,label:"ציון 100!"},{min:90,bonus:50,label:"ציון 90+"}];
const INIT_TASKS=[
  {id:"t1",title:"העמסת מדיח",icon:"🍽️",weight:12,assignedTo:["peleg","yahav","yahel"],bonus:false,type:"shared"},
  {id:"t2",title:"פינוי מדיח",icon:"🫧",weight:10,assignedTo:["peleg","yahav","yahel"],bonus:false,type:"shared"},
  {id:"t3",title:"הורדת זבל",icon:"🗑️",weight:8,assignedTo:["peleg","yahav"],bonus:false,type:"shared"},
  {id:"t4",title:"סידור החדר",icon:"🛏️",weight:12,assignedTo:["peleg","yahav","yahel"],bonus:false,type:"personal"},
  {id:"t5",title:"הכנת שיעורים",icon:"📚",weight:15,assignedTo:["peleg","yahav","yahel"],bonus:false,type:"personal"},
  {id:"t6",title:"ניקוי שולחן",icon:"🪑",weight:6,assignedTo:["peleg","yahav","yahel"],bonus:false,type:"shared"},
  {id:"t7",title:"קיפול כביסה",icon:"👕",weight:10,assignedTo:["peleg","yahav"],bonus:false,type:"shared"},
  {id:"t8",title:"שאיבת אבק",icon:"🧹",weight:9,assignedTo:["peleg","yahav"],bonus:false,type:"shared"},
  {id:"t9",title:"טיפול בחיות",icon:"🐕",weight:8,assignedTo:["yahel"],bonus:false,type:"personal"},
  {id:"t10",title:"הצעת מיטה",icon:"🛌",weight:5,assignedTo:["peleg","yahav","yahel"],bonus:false,type:"personal"},
  {id:"t11",title:"סידור נעליים",icon:"👟",weight:5,assignedTo:["peleg","yahav","yahel"],bonus:false,type:"personal"},
];
const DEFAULT_GOALS=[
  {id:"g1",title:"שבוע מושלם",emoji:"🏆",desc:"כל הילדים מעל 90%",target:90,reward:"פיצה משפחתית 🍕",active:true},
  {id:"g2",title:"אפס החמצות",emoji:"💯",desc:"אף משימה לא פוספסה ביום",target:100,reward:"סרט ביחד 🎬",active:true},
];

const getWk=()=>{const n=new Date(),s=new Date(n.getFullYear(),0,1);return`${n.getFullYear()}-W${Math.ceil((n-s)/604800000)}`;};
const getToday=()=>new Date().getDay();
const getHour=()=>new Date().getHours();
const getTimeStr=()=>{const n=new Date();return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`;};

// Confetti component
function Confetti({show}){
  if(!show)return null;
  const particles=Array.from({length:30},(_,i)=>({
    id:i,left:Math.random()*100,delay:Math.random()*0.5,dur:1+Math.random()*1.5,
    color:["#f59e0b","#10b981","#6366f1","#ec4899","#8b5cf6","#ef4444"][i%6],
    char:["🎉","⭐","✨","💫","🌟","🎊"][i%6],
  }));
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:2000,overflow:"hidden"}}>
      {particles.map(p=>(
        <div key={p.id} style={{
          position:"absolute",left:`${p.left}%`,top:-20,fontSize:16+Math.random()*12,
          animation:`confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
        }}>{p.char}</div>
      ))}
      <style>{`@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(105vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  );
}

// Level up animation
function LevelUp({show,level}){
  if(!show||!level)return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2001}}>
      <div style={{textAlign:"center",animation:"levelPop 0.5s ease"}}>
        <div style={{fontSize:72,marginBottom:8,animation:"levelBounce 1s ease infinite"}}>{level.emoji}</div>
        <div style={{fontSize:24,fontWeight:800,color:"#f59e0b",marginBottom:4}}>עלית רמה!</div>
        <div style={{fontSize:18,color:"#1e293b"}}>{level.name}</div>
      </div>
      <style>{`@keyframes levelPop{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}}@keyframes levelBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  );
}

function BadgeEarned({show,badge}){
  if(!show||!badge)return null;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2002}}>
    <div style={{textAlign:"center",animation:"levelPop 0.5s ease"}}>
      <div style={{fontSize:72,marginBottom:8,animation:"levelBounce 1s ease infinite"}}>{badge.emoji}</div>
      <div style={{fontSize:20,fontWeight:800,color:"#f59e0b",marginBottom:4}}>תג חדש!</div>
      <div style={{fontSize:16,color:"#e2e8f0"}}>{badge.title}</div>
      <div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>{badge.desc}</div>
    </div>
  </div>);
}

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
  const[newTask,setNewTask]=useState({title:"",icon:"✨",weight:5,assignedTo:[],type:"personal"});
  const[notifChild,setNotifChild]=useState(null);
  const[bonusModal,setBonusModal]=useState(false);
  const[bonusTitle,setBonusTitle]=useState("");
  const[bonusIcon,setBonusIcon]=useState("⭐");
  const[bonusPhoto,setBonusPhoto]=useState(null);
  const[changePinUser,setChangePinUser]=useState(null);
  const[newPinVal,setNewPinVal]=useState("");
  // Gamification
  const[xp,setXp]=useState({peleg:0,yahav:0,yahel:0});
  const[streaks,setStreaks]=useState({peleg:0,yahav:0,yahel:0});
  const[showConfetti,setShowConfetti]=useState(false);
  const[levelUpInfo,setLevelUpInfo]=useState(null);
  // Family goals
  const[goals,setGoals]=useState(DEFAULT_GOALS);
  // Swap requests
  const[swaps,setSwaps]=useState([]);
  const[swapModal,setSwapModal]=useState(null);
  // Reminders
  const[activeReminders,setActiveReminders]=useState(["evening"]);
  const[reminderShown,setReminderShown]=useState({});
  // Done confirmation (photo prompt)
  const[doneConfirm,setDoneConfirm]=useState(null);
  // Praise messages
  const[messages,setMessages]=useState([]);
  const[praiseModal,setPraiseModal]=useState(null);
  const[praiseText,setPraiseText]=useState("");
  const[praiseStar,setPraiseStar]=useState("⭐");
  // Penalties
  const[penalties,setPenalties]=useState([]);
  const[penaltyModal,setPenaltyModal]=useState(null);
  // Badges & Gamification
  const[earnedBadges,setEarnedBadges]=useState({peleg:[],yahav:[],yahel:[]});
  const[badgeNotification,setBadgeNotification]=useState(null);
  const[totalXpEarned,setTotalXpEarned]=useState({peleg:0,yahav:0,yahel:0});
  const[approvedCount,setApprovedCount]=useState({peleg:0,yahav:0,yahel:0});
  // Exams
  const[exams,setExams]=useState([]);
  const[examModal,setExamModal]=useState(null);
  const[examScore,setExamScore]=useState("");

  const fileRef=useRef(null);
  const bonusFileRef=useRef(null);
  const wk=getWk();

  useEffect(()=>{(async()=>{try{const s=await storage.get("chores-v5");if(s){const d=JSON.parse(s.value);
    if(d.tasks)setTasks(d.tasks);if(d.completions)setCompletions(d.completions);if(d.pins)setPins(d.pins);
    if(d.xp)setXp(d.xp);if(d.streaks)setStreaks(d.streaks);if(d.goals)setGoals(d.goals);
    if(d.swaps)setSwaps(d.swaps);if(d.activeReminders)setActiveReminders(d.activeReminders);
    if(d.messages)setMessages(d.messages);if(d.penalties)setPenalties(d.penalties);
    if(d.earnedBadges)setEarnedBadges(d.earnedBadges);if(d.totalXpEarned)setTotalXpEarned(d.totalXpEarned);
    if(d.approvedCount)setApprovedCount(d.approvedCount);if(d.exams)setExams(d.exams);
  }}catch{}})();},[]);

  const save=useCallback(async(overrides={})=>{try{await storage.set("chores-v5",JSON.stringify({
    tasks:overrides.tasks||tasks,completions:overrides.completions||completions,pins:overrides.pins||pins,
    xp:overrides.xp||xp,streaks:overrides.streaks||streaks,goals:overrides.goals||goals,
    swaps:overrides.swaps||swaps,activeReminders:overrides.activeReminders||activeReminders,
    messages:overrides.messages||messages,penalties:overrides.penalties||penalties,
    earnedBadges:overrides.earnedBadges||earnedBadges,totalXpEarned:overrides.totalXpEarned||totalXpEarned,
    approvedCount:overrides.approvedCount||approvedCount,exams:overrides.exams||exams,
  }));}catch{}},[tasks,completions,pins,xp,streaks,goals,swaps,activeReminders,messages,penalties,earnedBadges,totalXpEarned,approvedCount,exams]);

  const flash=(m)=>{setToast(m);setTimeout(()=>setToast(null),2200);};
  const cKey=(tid,cid,day)=>`${wk}_${tid}_${cid}_${day}`;
  const isP=user&&FAMILY[user]?.role==="parent";
  // Rotation: for shared tasks, only one child per day
  const isTaskForChild=(task,cid,day)=>{
    if(!task.assignedTo.includes(cid))return false;
    if(task.bonus)return true;
    if(task.type==="shared"){const kids=task.assignedTo;return kids[(typeof day==="number"?day:new Date(day).getDay())%kids.length]===cid;}
    return true;
  };
  const getChildW=(cid)=>tasks.filter(t=>isTaskForChild(t,cid,selDay)&&!t.bonus).reduce((s,t)=>s+t.weight,0);

  const getLevel=(cid)=>{const x=xp[cid]||0;let lv=LEVELS[0];for(const l of LEVELS)if(x>=l.min)lv=l;return lv;};
  const getNextLevel=(cid)=>{const x=xp[cid]||0;for(const l of LEVELS)if(x<l.min)return l;return null;};
  const getXpProgress=(cid)=>{const x=xp[cid]||0;const cur=getLevel(cid);const nxt=getNextLevel(cid);
    if(!nxt)return 100;return Math.round(((x-cur.min)/(nxt.min-cur.min))*100);};

  const addXp=(cid,amount)=>{
    const oldLv=getLevel(cid);
    const newXp={...xp,[cid]:(xp[cid]||0)+amount};
    setXp(newXp);
    const newLv=LEVELS.slice().reverse().find(l=>(newXp[cid]||0)>=l.min);
    if(newLv&&newLv.min>oldLv.min){setLevelUpInfo(newLv);setTimeout(()=>setLevelUpInfo(null),3000);}
    return newXp;
  };

  const checkBadges=(cid,cStreaks,cTotalXp,cApprovedCount,cEarnedBadges)=>{
    const earned=cEarnedBadges[cid]||[];const newlyEarned=[];
    for(const badge of DEFAULT_BADGES){if(earned.includes(badge.id))continue;let ok=false;
      if(badge.condition==="streak_days")ok=(cStreaks[cid]||0)>=badge.value;
      else if(badge.condition==="chores_completed")ok=(cApprovedCount[cid]||0)>=badge.value;
      else if(badge.condition==="total_xp_earned")ok=(cTotalXp[cid]||0)>=badge.value;
      if(ok)newlyEarned.push(badge.id);}
    if(newlyEarned.length>0){const ub={...cEarnedBadges,[cid]:[...earned,...newlyEarned]};setEarnedBadges(ub);
      const first=DEFAULT_BADGES.find(b=>b.id===newlyEarned[0]);setBadgeNotification({badge:first,childId:cid});
      setTimeout(()=>setBadgeNotification(null),3000);return ub;}
    return cEarnedBadges;
  };

  const addExam=(childId,score)=>{
    const s=parseInt(score);if(isNaN(s)||s<0||s>100){flash("⚠️ ציון לא תקין");return;}
    const eb=EXAM_BONUSES.find(x=>s>=x.min);
    if(!eb){flash("⚠️ ציון מתחת ל-90, אין בונוס");setExamModal(null);setExamScore("");return;}
    const ne=[...exams,{id:"ex_"+Date.now(),childId,score:s,bonus:eb.bonus,ts:Date.now(),by:user}];setExams(ne);
    const nm=[...messages,{id:"msg_"+Date.now(),from:user,to:childId,text:`📝 ${eb.label} - בונוס ${eb.bonus}₪!`,star:"📝",ts:Date.now()}];
    setMessages(nm);save({exams:ne,messages:nm});flash(`📝 ${eb.label} - ${eb.bonus}₪ ל${FAMILY[childId]?.name}!`);
    setExamModal(null);setExamScore("");
  };

  const getWeeklyXpData=()=>{const data={};CH.forEach(cid=>{let w=0;
    for(let d=0;d<7;d++){tasks.forEach(t=>{const k=cKey(t.id,cid,d);if(completions[k]?.approved)w+=t.bonus?t.weight*2:t.weight;});}
    data[cid]=w;});return data;};

  const markDone=(tid,cid,day,photo)=>{
    const k=cKey(tid,cid,day);
    const nc={...completions,[k]:{done:true,photo:photo||null,approved:false,approvedBy:null,ts:Date.now()}};
    setCompletions(nc);
    // Check if all tasks done today
    const allToday=tasks.filter(t=>isTaskForChild(t,cid,day)&&!t.bonus);
    const allDone=allToday.every(t=>{const kk=t.id===tid?k:cKey(t.id,cid,day);return nc[kk]?.done;});
    if(allDone){setShowConfetti(true);setTimeout(()=>setShowConfetti(false),3000);}
    save({completions:nc});flash("✅ בוצע!");
  };

  const approve=(tid,cid,day)=>{
    const k=cKey(tid,cid,day);if(!completions[k])return;
    const nc={...completions,[k]:{...completions[k],approved:true,approvedBy:user}};
    setCompletions(nc);
    const task=tasks.find(t=>t.id===tid);
    const xpGain=task?(task.bonus?task.weight*2:task.weight):5;
    const newXp=addXp(cid,xpGain);
    // Track lifetime XP & approved count
    const newTotalXp={...totalXpEarned,[cid]:(totalXpEarned[cid]||0)+xpGain};setTotalXpEarned(newTotalXp);
    const newAC={...approvedCount,[cid]:(approvedCount[cid]||0)+1};setApprovedCount(newAC);
    // Update streak
    const today=getToday();
    const allToday=tasks.filter(t=>isTaskForChild(t,cid,today)&&!t.bonus);
    const allApproved=allToday.every(t=>{const kk=cKey(t.id,cid,today);return(t.id===tid?nc:completions)[kk]?.approved||nc[kk]?.approved;});
    let newStreaks=streaks;let streakBonusXp=0;
    if(allApproved){const ns=(streaks[cid]||0)+1;newStreaks={...streaks,[cid]:ns};setStreaks(newStreaks);
      if(ns>0&&ns%7===0){streakBonusXp=ns*5;newXp[cid]=(newXp[cid]||0)+streakBonusXp;setXp(newXp);
        newTotalXp[cid]=(newTotalXp[cid]||0)+streakBonusXp;setTotalXpEarned(newTotalXp);}}
    // Check badges
    const newBadges=checkBadges(cid,newStreaks,newTotalXp,newAC,earnedBadges);
    save({completions:nc,xp:newXp,streaks:newStreaks,totalXpEarned:newTotalXp,approvedCount:newAC,earnedBadges:newBadges});
    const bm=streakBonusXp>0?` + 🔥${streakBonusXp} בונוס רצף!`:"";
    flash(`👍 +${xpGain}XP!${bm}`);
  };

  const reject=(tid,cid,day)=>{const k=cKey(tid,cid,day);const nc={...completions};delete nc[k];setCompletions(nc);save({completions:nc});flash("❌ נדחה");};

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

  const getTodayPctForChild=(cid)=>{
    const today=getToday();
    const todayTasks=tasks.filter(t=>isTaskForChild(t,cid,today)&&!t.bonus);
    if(todayTasks.length===0)return 100;
    const done=todayTasks.filter(t=>completions[cKey(t.id,cid,today)]?.done).length;
    return Math.round((done/todayTasks.length)*100);
  };

  // Reminders check
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

  // Swap request
  const requestSwap=(taskId,fromChild,toChild)=>{
    const ns=[...swaps,{id:"sw"+Date.now(),taskId,from:fromChild,to:toChild,day:selDay,status:"pending",ts:Date.now()}];
    setSwaps(ns);save({swaps:ns});flash("🔄 בקשת החלפה נשלחה!");
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
    setTasks(nt);setSwaps(ns);save({tasks:nt,swaps:ns});flash("🔄 החלפה אושרה!");
  };
  const rejectSwap=(swapId)=>{
    const ns=swaps.map(s=>s.id===swapId?{...s,status:"rejected"}:s);
    setSwaps(ns);save({swaps:ns});flash("❌ החלפה נדחתה");
  };

  const addNewTask=()=>{if(!newTask.title||newTask.assignedTo.length===0){flash("⚠️ חסרים פרטים");return;}
    const nt=[...tasks,{...newTask,id:"t"+Date.now(),bonus:false,type:newTask.type||"personal"}];setTasks(nt);save({tasks:nt});
    setNewTask({title:"",icon:"✨",weight:5,assignedTo:[],type:"personal"});flash("✨ נוספה!");};
  const addSuggested=(s)=>{if(tasks.find(t=>t.title===s.title)){flash("⚠️ קיימת");return;}
    const nt=[...tasks,{id:"t"+Date.now(),title:s.title,icon:s.icon,weight:s.weight,assignedTo:[...CH],bonus:false,type:"personal"}];
    setTasks(nt);save({tasks:nt});flash(`✨ ${s.title} נוספה!`);};
  const deleteTask=(tid)=>{const nt=tasks.filter(t=>t.id!==tid);setTasks(nt);save({tasks:nt});flash("🗑️");};
  const updateTask=(tid,u)=>{const nt=tasks.map(t=>t.id===tid?{...t,...u}:t);setTasks(nt);save({tasks:nt});};
  const changeWeight=(tid,d)=>{const t=tasks.find(x=>x.id===tid);if(t)updateTask(tid,{weight:Math.max(1,t.weight+d)});};

  const handlePhoto=(e,tid,cid,day)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
    r.onload=(ev)=>{markDone(tid,cid,day,ev.target.result);};r.readAsDataURL(f);};
  const submitBonus=()=>{if(!bonusTitle.trim()){flash("⚠️ תאר/י");return;}
    const id="bonus_"+Date.now();const nt=[...tasks,{id,title:bonusTitle,icon:bonusIcon,weight:5,assignedTo:[user],bonus:true}];
    const k=cKey(id,user,selDay);const nc={...completions,[k]:{done:true,photo:bonusPhoto,approved:false,approvedBy:null,ts:Date.now()}};
    setTasks(nt);setCompletions(nc);save({tasks:nt,completions:nc});setBonusModal(false);setBonusTitle("");setBonusIcon("⭐");setBonusPhoto(null);flash("⭐ נשלח!");};
  const handleBonusPhoto=(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=(ev)=>setBonusPhoto(ev.target.result);r.readAsDataURL(f);};

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
    save({xp:newXp,penalties:np,messages:nm});flash(`⚠️ -${p.xp}XP`);setPenaltyModal(null);
  };

  const verifyPin=(uid,pin)=>{const correct=pins[uid]||DEFAULT_PINS[uid];
    if(pin===correct){setUser(uid);setPinScreen(null);setPinInput("");setPinError(false);setScreen("home");}
    else{setPinError(true);setPinInput("");}};
  const updatePin=(uid,np)=>{if(np.length!==4||!/^\d{4}$/.test(np)){flash("⚠️ 4 ספרות");return;}
    const nPins={...pins,[uid]:np};setPins(nPins);save({pins:nPins});setChangePinUser(null);setNewPinVal("");flash("🔒 עודכן!");};

  // ── PIN ──
  if(pinScreen){const m=FAMILY[pinScreen];return(
    <div style={S.lw}><div style={{...S.lc,maxWidth:320}}>
      <button onClick={()=>{setPinScreen(null);setPinInput("");setPinError(false);}} style={{background:"none",border:"none",color:"#64748b",fontSize:13,cursor:"pointer",marginBottom:6}}>← חזרה</button>
      <div style={{fontSize:18,fontWeight:800,color:m.color,marginBottom:2}}>{m.name}</div>
      <div style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>סיסמה (4 ספרות)</div>
      <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:16}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:16,height:16,borderRadius:8,border:`2px solid ${pinError?"#ef4444":pinInput.length>i?m.color:"#cbd5e1"}`,background:pinInput.length>i?m.color:"transparent",transition:"all 0.2s"}}/>)}
      </div>
      {pinError&&<div style={{color:"#ef4444",fontSize:12,marginBottom:10,fontWeight:600}}>❌ שגויה</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,maxWidth:220,margin:"0 auto"}}>
        {[1,2,3,4,5,6,7,8,9,null,0,"⌫"].map((n,i)=>(
          <button key={i} disabled={n===null} onClick={()=>{
            if(n==="⌫"){setPinInput(p=>p.slice(0,-1));setPinError(false);}
            else if(typeof n==="number"&&pinInput.length<4){const next=pinInput+n;setPinInput(next);setPinError(false);
              if(next.length===4)setTimeout(()=>verifyPin(pinScreen,next),200);}
          }} style={{width:"100%",height:48,borderRadius:12,border:"none",fontSize:n==="⌫"?18:22,fontWeight:700,cursor:n===null?"default":"pointer",
            background:n===null?"transparent":"#f1f5f9",color:n===null?"transparent":"#1e293b",...(n===null?{visibility:"hidden"}:{})}}>{n}</button>
        ))}
      </div>
    </div></div>
  );}

  // ── LOGIN ──
  if(screen==="login"){return(
    <div style={S.lw}><div style={S.lc}>
      <div style={{fontSize:44,marginBottom:4}}>🏠</div>
      <h1 style={{fontSize:20,fontWeight:800,color:"#1e293b",margin:"0 0 2px"}}>משפחת גונן</h1>
      <p style={{fontSize:11,color:"#94a3b8",margin:"0 0 18px"}}>משימות • גיימיפיקציה • יעדים משפחתיים</p>
      <div style={S.ug}>{Object.entries(FAMILY).map(([id,m])=>{
        const lvl=CH.includes(id)?getLevel(id):null;
        return(
          <button key={id} onClick={()=>{setPinScreen(id);setPinInput("");setPinError(false);}}
            style={{...S.ub,borderColor:m.color+"40",background:`linear-gradient(135deg,${m.color}10,${m.color}05)`,position:"relative"}}>
            <span style={{fontSize:13,fontWeight:700,color:m.color}}>{m.name}</span>
            {lvl&&<span style={{fontSize:9,color:"#94a3b8"}}>{lvl.emoji} {lvl.name}</span>}
            <span style={{fontSize:9,color:"#64748b"}}>{m.role==="parent"?"🔑 הורה":m.weeklyPay>0?`${m.weeklyPay}₪`:""}</span>
          </button>
        );})}</div>
      <div style={{marginTop:12,fontSize:9,color:"#475569"}}>🔒 כניסה מאובטחת</div>
    </div></div>
  );}

  const me=FAMILY[user];const today=getToday();
  const activeReminder=getActiveReminder();

  return(
    <div style={S.app} dir="rtl">
      <Confetti show={showConfetti}/>
      <LevelUp show={!!levelUpInfo} level={levelUpInfo}/>
      <BadgeEarned show={!!badgeNotification} badge={badgeNotification?.badge}/>
      {toast&&<div style={S.toast}>{toast}</div>}

      {/* HEADER */}
      <div style={S.header}>
        <div style={S.hTop}>
          <button onClick={()=>{setScreen("login");setUser(null);}} style={S.backBtn}>🔒</button>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{me.name} {!isP&&getLevel(user)?.emoji}</div>
            <div style={{fontSize:9,color:"#6366f1"}}>{isP?"מנהל/ת":me.weeklyPay>0?`${me.weeklyPay}₪/שבוע`:getLevel(user)?.name}</div>
          </div>
          {!isP&&<button onClick={()=>setBonusModal(true)} style={S.bonusFab}>⭐ יוזמה</button>}
        </div>
      </div>

      {/* TABS */}
      <div style={S.tabs}>
        {[
          {id:"home",l:"🏠"},{id:"tasks",l:"📋"},
          ...(!isP?[{id:"badges",l:"🏅"}]:[]),
          {id:"dash",l:"📊"},
          ...(isP?[{id:"approve",l:"✅"},{id:"manage",l:"⚙️"}]:[]),
        ].map(t=><button key={t.id} onClick={()=>setScreen(t.id)}
          style={{...S.tab,...(screen===t.id?S.tabA:{})}}>{t.l}</button>)}
      </div>

      <div style={S.content}>

      {/* ══ HOME ══ */}
      {screen==="home"&&(
        <>
          {/* Reminder banner */}
          {activeReminder&&!isP&&(
            <div style={{background:"linear-gradient(135deg,#f59e0b20,#f59e0b10)",border:"1px solid #f59e0b40",borderRadius:12,padding:12,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:22}}>{activeReminder.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#f59e0b"}}>⏰ תזכורת {activeReminder.label}</div>
                <div style={{fontSize:11,color:"#fbbf24"}}>{tasks.filter(t=>isTaskForChild(t,user,today)&&!t.bonus&&!completions[cKey(t.id,user,today)]?.done).length} משימות ממתינות</div>
              </div>
              <button onClick={()=>setReminderShown({...reminderShown,[activeReminder.id+selDay]:true})} style={{background:"none",border:"none",color:"#f59e0b",cursor:"pointer",fontSize:16}}>✕</button>
            </div>
          )}

          {/* Greeting */}
          <div style={{textAlign:"center",marginBottom:14}}>
            <div style={{fontSize:16,fontWeight:800,color:"#1e293b"}}>
              {getHour()<12?"☀️ בוקר טוב":getHour()<17?"🌤️ צהריים טובים":getHour()<21?"🌆 ערב טוב":"🌙 לילה טוב"}, {me.name}!
            </div>
            <div style={{fontSize:11,color:"#94a3b8"}}>יום {DAYS[today]}</div>
          </div>

          {/* Praise messages */}
          {!isP&&(()=>{
            const myMsgs=messages.filter(m=>m.to===user).sort((a,b)=>b.ts-a.ts).slice(0,5);
            if(myMsgs.length===0)return null;
            return(
              <div style={{marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:6}}>💬 הודעות מההורים</div>
                {myMsgs.map(msg=>{const task=tasks.find(t=>t.id===msg.taskId);const from=FAMILY[msg.from];
                  const isNew=(Date.now()-msg.ts)<86400000;
                  return(
                    <div key={msg.id} style={{background:isNew?"linear-gradient(135deg,#fef3c7,#fffbeb)":"#ffffff",borderRadius:10,padding:10,marginBottom:4,border:isNew?"1px solid #f59e0b40":"1px solid #e2e8f0",display:"flex",alignItems:"flex-start",gap:8}}>
                      {msg.star&&<span style={{fontSize:20}}>{msg.star}</span>}
                      <div style={{flex:1}}>
                        {msg.text&&<div style={{fontSize:12,color:"#1e293b",fontWeight:600}}>"{msg.text}"</div>}
                        <div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>
                          {from?.name} • {task?.icon} {task?.title}
                          {isNew&&<span style={{color:"#f59e0b",fontWeight:700}}> חדש!</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Child: personal stats card */}
          {!isP&&(()=>{
            const st=getWeekStats(user);const lv=getLevel(user);const nxt=getNextLevel(user);
            const todayTasks=tasks.filter(t=>isTaskForChild(t,user,today)&&!t.bonus);
            const todayDone=todayTasks.filter(t=>completions[cKey(t.id,user,today)]?.done).length;
            return(
              <>
                {/* Level & XP card */}
                <div style={{background:`linear-gradient(135deg,${FAMILY[user]?.color||'#6366f1'}15,${FAMILY[user]?.color||'#6366f1'}08)`,borderRadius:14,padding:14,marginBottom:10,border:"1px solid #4f46e540"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{fontSize:36}}>{lv.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:800,color:"#1e293b"}}>{lv.name}</div>
                      <div style={{fontSize:10,color:"#6366f1"}}>{xp[user]||0} XP {nxt?`• עוד ${nxt.min-(xp[user]||0)} ל${nxt.name}`:""}</div>
                      <div style={{height:6,background:"#f1f5f9",borderRadius:4,marginTop:4,overflow:"hidden"}}>
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
                <div style={{background:"#ffffff",borderRadius:14,padding:14,marginBottom:10,border:"1px solid #e2e8f0"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>📋 היום</span>
                    <span style={{fontSize:12,fontWeight:700,color:todayDone===todayTasks.length?"#10b981":"#64748b"}}>{todayDone}/{todayTasks.length}</span>
                  </div>
                  <div style={{height:8,background:"#f1f5f9",borderRadius:6,overflow:"hidden",marginBottom:8}}>
                    <div style={{height:"100%",width:`${todayTasks.length>0?Math.round((todayDone/todayTasks.length)*100):0}%`,background:todayDone===todayTasks.length?"linear-gradient(90deg,#10b981,#059669)":"linear-gradient(90deg,#f59e0b,#f97316)",borderRadius:6,transition:"width 0.5s"}}/>
                  </div>
                  {/* Pending tasks quick list */}
                  {todayTasks.filter(t=>!completions[cKey(t.id,user,today)]?.done).slice(0,4).map(t=>(
                    <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid #e2e8f0"}}>
                      <span style={{fontSize:14}}>{t.icon}</span>
                      <span style={{fontSize:12,color:"#475569",flex:1}}>{t.title}</span>
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
                        <div style={{fontSize:24,fontWeight:800,color:"#1e293b"}}>{st.earned}₪ <span style={{fontSize:12,color:"#059669"}}>/ {me.weeklyPay}₪</span></div>
                      </div>
                      <div style={{fontSize:28,fontWeight:800,color:"#10b981"}}>{st.pct}%</div>
                    </div>
                  </div>
                )}

                {/* Badges preview */}
                {(()=>{const myBadges=earnedBadges[user]||[];if(myBadges.length===0)return null;return(
                  <div style={{background:"#ffffff",borderRadius:14,padding:12,marginBottom:10,border:"1px solid #f59e0b40"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>🏅 תגים</span>
                      <button onClick={()=>setScreen("badges")} style={{background:"none",border:"none",color:"#6366f1",fontSize:10,cursor:"pointer"}}>צפה בכולם →</button>
                    </div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {myBadges.slice(0,6).map(bid=>{const badge=DEFAULT_BADGES.find(b=>b.id===bid);return badge?<span key={bid} title={badge.title} style={{fontSize:20}}>{badge.emoji}</span>:null;})}
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
                  <div key={cid} style={{background:"#ffffff",borderRadius:12,padding:12,marginBottom:8,border:"1px solid #e2e8f0"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          <span style={{fontSize:13,fontWeight:700,color:m.color}}>{m.name}</span>
                          <span style={{fontSize:10}}>{lv.emoji}</span>
                          {(streaks[cid]||0)>0&&<span style={{fontSize:9,color:"#f59e0b"}}>🔥{streaks[cid]}</span>}
                        </div>
                        <div style={{fontSize:10,color:"#64748b"}}>היום: {todayPct}% • שבוע: {st.pct}% {m.weeklyPay>0?`• ${st.earned}₪`:""}  </div>
                      </div>
                      <button onClick={()=>setPenaltyModal({childId:cid})} style={{width:30,height:30,background:"#ef444415",border:"1px solid #ef444430",borderRadius:8,color:"#ef4444",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginLeft:4}}>⚠️</button>
                      <div style={{width:36,height:36,borderRadius:18,border:`3px solid ${todayPct===100?"#10b981":todayPct>50?m.color:"#e2e8f0"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#1e293b"}}>{todayPct}%</div>
                    </div>
                  </div>
                );
              })}
              {/* Exam report button */}
              <button onClick={()=>setExamModal(true)} style={{width:"100%",padding:10,background:"linear-gradient(135deg,#6366f120,#6366f110)",border:"1px solid #6366f140",borderRadius:12,color:"#6366f1",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10}}>📝 דיווח ציון מבחן</button>
              {/* Pending approvals count */}
              {(()=>{let cnt=0;tasks.forEach(t=>t.assignedTo.forEach(c=>{for(let d=0;d<7;d++){if(completions[cKey(t.id,c,d)]?.done&&!completions[cKey(t.id,c,d)]?.approved)cnt++;}}));
                return cnt>0&&<button onClick={()=>setScreen("approve")} style={{width:"100%",padding:10,background:"linear-gradient(135deg,#f59e0b20,#f59e0b10)",border:"1px solid #f59e0b40",borderRadius:12,color:"#f59e0b",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10}}>✅ {cnt} ממתינים לאישור →</button>;
              })()}
              {/* Swap requests */}
              {swaps.filter(s=>s.status==="pending").length>0&&(
                <div style={{background:"#ffffff",borderRadius:12,padding:12,marginBottom:10,border:"1px solid #8b5cf640"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#7c3aed",marginBottom:6}}>🔄 בקשות החלפה</div>
                  {swaps.filter(s=>s.status==="pending").map(s=>{const t=tasks.find(x=>x.id===s.taskId);return(
                    <div key={s.id} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 0",borderBottom:"1px solid #e2e8f0"}}>
                      <span style={{fontSize:12}}>{t?.icon}</span>
                      <span style={{fontSize:11,color:"#475569",flex:1}}>{FAMILY[s.from]?.name} → {FAMILY[s.to]?.name}: {t?.title}</span>
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
            <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:8}}>🎯 יעד משפחתי</div>
            {goals.filter(g=>g.active).map(g=>{
              const fp=getFamilyPct();const achieved=fp>=g.target;
              return(
                <div key={g.id} style={{background:"rgba(99,102,241,0.06)",borderRadius:10,padding:10,marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <span style={{fontSize:16}}>{g.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{g.title}</div>
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
        </>
      )}

      {/* ══ TASKS ══ */}
      {screen==="tasks"&&(
        <>
          <div style={S.dayRow}>
            {DAYS.map((d,i)=><button key={i} onClick={()=>setSelDay(i)}
              style={{...S.dayBtn,...(i===selDay?S.dayAct:{}),...(i===today&&i!==selDay?{borderColor:"#6366f160"}:{})}}>
              <span style={{fontSize:12,fontWeight:700}}>{DS[i]}</span><span style={{fontSize:7}}>{d}</span>
            </button>)}
          </div>
          {(isP?CH:[user]).filter(c=>FAMILY[c]).map(cid=>{
            const m=FAMILY[cid];const dt=tasks.filter(t=>isTaskForChild(t,cid,selDay)&&!t.bonus);
            const bt=tasks.filter(t=>isTaskForChild(t,cid,selDay)&&t.bonus);
            const dw=dt.reduce((s,t)=>s+t.weight,0);if(dt.length===0&&bt.length===0)return null;
            const dc=dt.filter(t=>completions[cKey(t.id,cid,selDay)]?.done).length;
            return(
              <div key={cid} style={{marginBottom:14}}>
                <div style={S.secH}><span style={{fontSize:13,fontWeight:700,color:m.color}}>{m.name}</span><span style={S.bdg}>{dc}/{dt.length}</span></div>
                {dt.sort((a,b)=>b.weight-a.weight).map(task=>{
                  const k=cKey(task.id,cid,selDay);const comp=completions[k];const done=comp?.done;const appd=comp?.approved;
                  const wpct=dw>0?Math.round((task.weight/dw)*100):0;
                  return(
                    <div key={task.id} style={{...S.tc,...(appd?S.tA:done?S.tD:{})}}>
                      <div style={S.tr}>
                        <span style={{fontSize:18}}>{task.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
                            <span style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{task.title}</span>
                            <span style={S.wt}>{task.weight}נק׳ {wpct}%</span>
                            {task.type==="shared"&&<span style={{fontSize:7,fontWeight:700,color:"#8b5cf6",background:"#8b5cf615",padding:"1px 5px",borderRadius:5}}>📋 תורנות</span>}
                          </div>
                          <div style={{fontSize:9,marginTop:1}}>
                            {appd?<span style={{color:"#10b981"}}>✅ {FAMILY[comp.approvedBy]?.name}</span>
                              :done?<span style={{color:"#f59e0b"}}>⏳</span>
                              :<span style={{color:"#475569"}}>טרם בוצע</span>}
                          </div>
                        </div>
                        <div style={{display:"flex",gap:3,alignItems:"center",flexShrink:0}}>
                          {!done&&!isP&&cid===user&&<>
                            <button onClick={()=>setDoneConfirm({taskId:task.id,childId:cid,day:selDay})} style={S.doneBtn}>✓</button>
                            {/* Swap button */}
                            <button onClick={()=>setSwapModal({taskId:task.id,from:cid})} style={{width:28,height:28,background:"#8b5cf620",border:"1px solid #8b5cf640",borderRadius:7,color:"#7c3aed",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🔄</button>
                          </>}
                          {done&&comp?.photo&&<button onClick={()=>setPhotoModal({view:comp.photo})} style={S.vBtn}>🖼</button>}
                          {done&&!appd&&isP&&<><button onClick={()=>approveWithPraise(task.id,cid,selDay)} style={S.okBtn}>✓</button><button onClick={()=>reject(task.id,cid,selDay)} style={S.noBtn}>✕</button></>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {bt.filter(t=>{for(let d=0;d<7;d++)if(completions[cKey(t.id,cid,d)])return true;return false;}).map(t=>{
                  const k=cKey(t.id,cid,selDay);const c=completions[k];if(!c)return null;
                  return(
                    <div key={t.id} style={{...S.tc,borderColor:"#8b5cf630"}}>
                      <div style={S.tr}>
                        <span style={{fontSize:16}}>{t.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{t.title} <span style={{fontSize:9,color:"#7c3aed"}}>⭐</span></div>
                          <div style={{fontSize:9}}>{c.approved?<span style={{color:"#10b981"}}>✅ בונוס</span>:<span style={{color:"#f59e0b"}}>⏳</span>}</div>
                        </div>
                        {c.photo&&<button onClick={()=>setPhotoModal({view:c.photo})} style={S.vBtn}>🖼</button>}
                        {c.done&&!c.approved&&isP&&<><button onClick={()=>approveWithPraise(t.id,cid,selDay)} style={S.okBtn}>✓</button><button onClick={()=>{reject(t.id,cid,selDay);deleteTask(t.id);}} style={S.noBtn}>✕</button></>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>
      )}

      {/* ══ BADGES ══ */}
      {screen==="badges"&&!isP&&(()=>{const myBadges=earnedBadges[user]||[];return<>
        <h2 style={S.st}>🏅 תגים והישגים</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {DEFAULT_BADGES.map(badge=>{const earned=myBadges.includes(badge.id);return(
            <div key={badge.id} style={{background:earned?"linear-gradient(135deg,#fef3c7,#fffbeb)":"#f8fafc",borderRadius:12,padding:12,textAlign:"center",
              border:earned?"2px solid #f59e0b":"1px solid #e2e8f0",opacity:earned?1:0.5}}>
              <div style={{fontSize:28}}>{earned?badge.emoji:"❓"}</div>
              <div style={{fontSize:10,fontWeight:700,color:earned?"#1e293b":"#94a3b8",marginTop:4}}>{earned?badge.title:"???"}</div>
              {earned&&<div style={{fontSize:8,color:"#f59e0b",marginTop:2}}>{badge.desc}</div>}
            </div>);
          })}
        </div>
        <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"#94a3b8"}}>{myBadges.length}/{DEFAULT_BADGES.length} תגים נפתחו</div>
      </>;})()}

      {/* ══ DASHBOARD ══ */}
      {screen==="dash"&&<>
        <h2 style={S.st}>📊 דשבורד</h2>
        {/* LEADERBOARD */}
        <div style={{background:"linear-gradient(135deg,#fef3c7,#fef9c3)",borderRadius:14,padding:14,marginBottom:12,border:"1px solid #f59e0b40"}}>
          <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:8,textAlign:"center"}}>🏆 לוח תוצאות שבועי</div>
          {(()=>{const wd=getWeeklyXpData();const ranked=[...CH].sort((a,b)=>(wd[b]||0)-(wd[a]||0));
            return ranked.map((cid,idx)=>{const m=FAMILY[cid];const lv=getLevel(cid);return(
              <div key={cid} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",marginBottom:4,
                background:idx===0?"#fff":"#fffbeb80",borderRadius:10,border:idx===0?"2px solid #f59e0b":"1px solid #f59e0b20"}}>
                <span style={{fontSize:18,minWidth:24}}>{idx===0?"👑":idx===1?"🥈":"🥉"}</span>
                <span style={{fontSize:13,fontWeight:700,color:m.color,flex:1}}>{m.name}</span>
                <span style={{fontSize:10,color:"#64748b"}}>{lv.emoji} • 🔥{streaks[cid]||0}</span>
                <span style={{fontSize:14,fontWeight:800,color:"#f59e0b",background:"#f59e0b15",padding:"2px 8px",borderRadius:8}}>{wd[cid]||0} XP</span>
              </div>);});
          })()}
        </div>
        {CH.map(cid=>{const m=FAMILY[cid];const st=getWeekStats(cid);const lv=getLevel(cid);return(
          <div key={cid} style={S.dc}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div><div style={{fontSize:14,fontWeight:800,color:m.color}}>{m.name} {lv.emoji}</div>
                  <div style={{fontSize:9,color:"#64748b"}}>{xp[cid]||0}XP • 🔥{streaks[cid]||0} רצף</div></div>
              </div>
              {m.weeklyPay>0&&<div style={{background:"linear-gradient(135deg,#10b981,#059669)",borderRadius:10,padding:"8px 12px",textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{st.earned}₪</div>
                <div style={{fontSize:7,color:"#d1fae5"}}>מתוך {m.weeklyPay}₪</div>
              </div>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{flex:1,height:6,background:"#f1f5f9",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:4,width:`${st.pct}%`,background:`linear-gradient(90deg,${m.color},${m.color}cc)`,transition:"width 0.5s"}}/>
              </div>
              <span style={{fontSize:11,fontWeight:700,color:"#94a3b8"}}>{st.pct}%</span>
            </div>
            <div style={{display:"flex",gap:4}}>
              {[{n:st.tc,l:"סה״כ",c:"#1e293b"},{n:st.dc,l:"בוצעו",c:"#f59e0b"},{n:st.ac,l:"אושרו",c:"#10b981"},{n:st.tc-st.dc,l:"חסרים",c:"#ef4444"}].map((s,i)=>(
                <div key={i} style={{flex:1,background:"#f1f5f9",borderRadius:7,padding:"5px 2px",textAlign:"center"}}>
                  <div style={{fontSize:13,fontWeight:800,color:s.c}}>{s.n}</div><div style={{fontSize:7,color:"#64748b"}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        );})}
        <div style={{background:"linear-gradient(135deg,#ede9fe,#ddd6fe)",borderRadius:14,padding:14,border:"1px solid #4f46e580"}}>
          <h3 style={{fontSize:13,fontWeight:800,color:"#1e293b",margin:"0 0 8px",textAlign:"center"}}>👨‍👩‍👧‍👦 סיכום</h3>
          <div style={{display:"flex",gap:6}}>
            {(()=>{let te=0,tp=0;CH.forEach(c=>{if(FAMILY[c].weeklyPay>0){te+=getWeekStats(c).earned;tp+=FAMILY[c].weeklyPay;}});
              return[{v:`${te}₪`,l:"הורווח",c:"#10b981"},{v:`${tp}₪`,l:"מקסימום",c:"#6366f1"},{v:`${getFamilyPct()}%`,l:"משפחתי",c:"#f59e0b"}].map((s,i)=>(
                <div key={i} style={{flex:1,background:"rgba(99,102,241,0.08)",borderRadius:10,padding:10,textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:8,color:"#7c3aed"}}>{s.l}</div>
                </div>
              ));
            })()}
          </div>
        </div>
        {/* Exam history */}
        {exams.length>0&&<div style={{background:"#ffffff",borderRadius:14,padding:14,marginTop:12,border:"1px solid #6366f140"}}>
          <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:8}}>📝 היסטוריית מבחנים</div>
          {exams.slice().reverse().slice(0,10).map(ex=>(
            <div key={ex.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #e2e8f0"}}>
              <span style={{fontSize:13,fontWeight:700,color:FAMILY[ex.childId]?.color}}>{FAMILY[ex.childId]?.name}</span>
              <span style={{flex:1,fontSize:11,color:"#64748b"}}>ציון {ex.score}</span>
              <span style={{fontSize:12,fontWeight:700,color:"#10b981"}}>+{ex.bonus}₪</span>
            </div>
          ))}
        </div>}
      </>}

      {/* ══ APPROVE ══ */}
      {screen==="approve"&&isP&&(()=>{
        const pend=[];tasks.forEach(t=>t.assignedTo.forEach(c=>{for(let d=0;d<7;d++){const k=cKey(t.id,c,d);if(completions[k]?.done&&!completions[k]?.approved)pend.push({t,c,d,comp:completions[k]});}}));
        return<>
          <h2 style={S.st}>✅ אישורים ({pend.length})</h2>
          {pend.length===0?<div style={{textAlign:"center",padding:"30px"}}><div style={{fontSize:36}}>🎉</div><div style={{color:"#94a3b8",fontSize:12,marginTop:4}}>אין ממתינים</div></div>
          :pend.map((p,i)=>(
            <div key={i} style={{background:"#ffffff",borderRadius:10,padding:10,marginBottom:5,border:`1px solid ${p.t.bonus?"#8b5cf630":"#f59e0b25"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:14}}>{p.t.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{p.t.title}{p.t.bonus?" ⭐":""}</div>
                  <div style={{fontSize:9,color:"#94a3b8"}}>{FAMILY[p.c].name} • {DAYS[p.d]} • {p.t.weight}נק׳</div>
                </div>
                {p.comp.photo&&<button onClick={()=>setPhotoModal({view:p.comp.photo})} style={S.vBtn}>🖼</button>}
              </div>
              <div style={{display:"flex",gap:5}}>
                <button onClick={()=>approveWithPraise(p.t.id,p.c,p.d)} style={S.bOk}>✅ אשר</button>
                <button onClick={()=>{reject(p.t.id,p.c,p.d);if(p.t.bonus)deleteTask(p.t.id);}} style={S.bNo}>❌</button>
              </div>
            </div>
          ))}
        </>;
      })()}

      {/* ══ MANAGE ══ */}
      {screen==="manage"&&isP&&<>
        <div style={{display:"flex",gap:3,marginBottom:12,overflowX:"auto",paddingBottom:2}}>
          {[{id:"tasks",l:"📋"},{id:"add",l:"➕"},{id:"suggest",l:"💡"},{id:"weights",l:"⚖️"},{id:"goals",l:"🎯"},{id:"reminders",l:"⏰"},{id:"pins",l:"🔒"}].map(t=>(
            <button key={t.id} onClick={()=>setManageSub(t.id)}
              style={{...S.subT,...(manageSub===t.id?{background:"#6366f1",color:"#fff"}:{})}}>{t.l}</button>
          ))}
        </div>

        {manageSub==="tasks"&&tasks.filter(t=>!t.bonus).map(t=>(
          <div key={t.id} style={{background:"#ffffff",borderRadius:10,padding:10,marginBottom:5,border:"1px solid #e2e8f0"}}>
            {editTask===t.id?(
              <div>
                <input style={S.inp} value={t.title} onChange={e=>updateTask(t.id,{title:e.target.value})}/>
                <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:10,color:"#94a3b8"}}>משקל:</span>
                  <button onClick={()=>changeWeight(t.id,-1)} style={S.wB}>−</button>
                  <span style={{fontSize:14,fontWeight:800,color:"#1e293b"}}>{t.weight}</span>
                  <button onClick={()=>changeWeight(t.id,1)} style={S.wB}>+</button>
                </div>
                <div style={{display:"flex",gap:3,marginBottom:6}}>
                  {CH.map(c=><button key={c} onClick={()=>{const a=t.assignedTo.includes(c)?t.assignedTo.filter(x=>x!==c):[...t.assignedTo,c];updateTask(t.id,{assignedTo:a});}}
                    style={{...S.chip,...(t.assignedTo.includes(c)?{background:FAMILY[c].color+"20",borderColor:FAMILY[c].color,color:FAMILY[c].color}:{})}}>{FAMILY[c].name}</button>)}
                </div>
                <button onClick={()=>{setEditTask(null);save();flash("💾");}} style={{padding:"6px 14px",background:"#10b981",border:"none",borderRadius:7,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>💾</button>
              </div>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:16}}>{t.icon}</span>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{t.title}</div>
                  <div style={{fontSize:9,color:"#64748b"}}>{t.weight}נק׳ • {t.assignedTo.map(c=>FAMILY[c]?.name).join(", ")} {t.type==="shared"?"• 📋 רוטציה":""}</div></div>
                <button onClick={()=>setEditTask(t.id)} style={S.eBtn}>✏️</button>
                <button onClick={()=>deleteTask(t.id)} style={S.dBtn}>🗑</button>
              </div>
            )}
          </div>
        ))}

        {manageSub==="add"&&(
          <div style={{background:"#ffffff",borderRadius:12,padding:14,border:"1px solid #e2e8f0"}}>
            <input style={S.inp} placeholder="שם המשימה" value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})}/>
            <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:10,color:"#94a3b8"}}>משקל:</span>
              <button onClick={()=>setNewTask({...newTask,weight:Math.max(1,newTask.weight-1)})} style={S.wB}>−</button>
              <span style={{fontSize:14,fontWeight:800,color:"#1e293b"}}>{newTask.weight}</span>
              <button onClick={()=>setNewTask({...newTask,weight:newTask.weight+1})} style={S.wB}>+</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:8}}>
              {["✨","🛏️","🍽️","🫧","🗑️","🧹","👕","🧽","🐕","📚","🚿","🪴","🍳","🥪","👟","♻️","🧸","🛌","🥘","🪟","🌿","🎒"].map(em=>(
                <button key={em} onClick={()=>setNewTask({...newTask,icon:em})}
                  style={{width:30,height:30,fontSize:14,background:newTask.icon===em?"#6366f120":"#f1f5f9",border:newTask.icon===em?"2px solid #6366f1":"1px solid #e2e8f0",borderRadius:7,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{em}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:3,marginBottom:10}}>
              {CH.map(c=><button key={c} onClick={()=>{const a=newTask.assignedTo.includes(c)?newTask.assignedTo.filter(x=>x!==c):[...newTask.assignedTo,c];setNewTask({...newTask,assignedTo:a});}}
                style={{...S.chip,...(newTask.assignedTo.includes(c)?{background:FAMILY[c].color+"20",borderColor:FAMILY[c].color,color:FAMILY[c].color}:{})}}>{FAMILY[c].name}</button>)}
            </div>
            <div style={{display:"flex",gap:4,marginBottom:10}}>
              {[{v:"personal",l:"🏠 אישי"},{v:"shared",l:"📋 משפחתי (רוטציה)"}].map(opt=>(
                <button key={opt.v} onClick={()=>setNewTask({...newTask,type:opt.v})}
                  style={{flex:1,padding:"6px 4px",background:newTask.type===opt.v?"#6366f120":"#f8fafc",border:newTask.type===opt.v?"2px solid #6366f1":"1px solid #e2e8f0",borderRadius:8,color:newTask.type===opt.v?"#6366f1":"#64748b",fontSize:10,fontWeight:600,cursor:"pointer"}}>{opt.l}</button>
              ))}
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
                    background:ex?"#10b98120":"#ffffff",border:ex?"1px solid #10b98150":"1px solid #e2e8f0",
                    color:ex?"#10b981":"#cbd5e1",opacity:ex?0.7:1}}>{s.icon}{s.title}({s.weight}){ex?"✓":""}</button>
              );})}
            </div>
          </div>
        ))}

        {manageSub==="weights"&&CH.map(cid=>{const m=FAMILY[cid];const ct=tasks.filter(t=>t.assignedTo.includes(cid)&&!t.bonus);const tw=ct.reduce((s,t)=>s+t.weight,0);return(
          <div key={cid} style={{background:"#ffffff",borderRadius:10,padding:12,marginBottom:6,border:"1px solid #e2e8f0"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
              <span style={{fontSize:12,fontWeight:700,color:m.color}}>{m.name}</span>
              <span style={{marginRight:"auto",marginLeft:0,fontSize:10,color:"#64748b"}}>{tw}נק׳</span>
            </div>
            {ct.sort((a,b)=>b.weight-a.weight).map(t=>{const pct=tw>0?Math.round((t.weight/tw)*100):0;return(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 0",borderBottom:"1px solid #e2e8f0"}}>
                <span style={{fontSize:11}}>{t.icon}</span>
                <span style={{fontSize:10,color:"#475569",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</span>
                <button onClick={()=>changeWeight(t.id,-1)} style={S.wBs}>−</button>
                <span style={{fontSize:11,fontWeight:800,color:"#1e293b",minWidth:16,textAlign:"center"}}>{t.weight}</span>
                <button onClick={()=>changeWeight(t.id,1)} style={S.wBs}>+</button>
                <span style={{fontSize:8,fontWeight:700,color:"#6366f1",minWidth:22,textAlign:"center"}}>{pct}%</span>
              </div>
            );})}
          </div>
        );})}

        {manageSub==="goals"&&<>
          <h3 style={S.st}>🎯 יעדים משפחתיים</h3>
          {goals.map((g,i)=>(
            <div key={g.id} style={{background:"#ffffff",borderRadius:10,padding:12,marginBottom:6,border:"1px solid #e2e8f0"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:18}}>{g.emoji}</span>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{g.title}</div>
                  <div style={{fontSize:10,color:"#94a3b8"}}>{g.desc} • פרס: {g.reward}</div></div>
                <button onClick={()=>{const ng=goals.map(x=>x.id===g.id?{...x,active:!x.active}:x);setGoals(ng);save({goals:ng});}}
                  style={{padding:"4px 10px",background:g.active?"#10b98120":"#f1f5f9",border:`1px solid ${g.active?"#10b98150":"#e2e8f0"}`,borderRadius:7,color:g.active?"#10b981":"#64748b",fontSize:10,cursor:"pointer"}}>{g.active?"פעיל":"כבוי"}</button>
              </div>
            </div>
          ))}
        </>}

        {manageSub==="reminders"&&<>
          <h3 style={S.st}>⏰ תזכורות יומיות</h3>
          <p style={{fontSize:10,color:"#94a3b8",margin:"0 0 10px"}}>תזכורות מופיעות במסך הבית של הילדים</p>
          {REMINDERS.map(r=>{const active=activeReminders.includes(r.id);return(
            <div key={r.id} style={{background:"#ffffff",borderRadius:10,padding:12,marginBottom:6,border:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:22}}>{r.emoji}</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{r.label}</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>{r.time}</div></div>
              <button onClick={()=>{const na=active?activeReminders.filter(x=>x!==r.id):[...activeReminders,r.id];setActiveReminders(na);save({activeReminders:na});}}
                style={{padding:"6px 14px",background:active?"#10b981":"#f1f5f9",border:`1px solid ${active?"#10b98150":"#e2e8f0"}`,borderRadius:8,color:active?"#fff":"#64748b",fontSize:11,fontWeight:700,cursor:"pointer"}}>{active?"✓ פעיל":"כבוי"}</button>
            </div>
          );})}
        </>}

        {manageSub==="pins"&&Object.entries(FAMILY).map(([id,m])=>(
          <div key={id} style={{background:"#ffffff",borderRadius:10,padding:10,marginBottom:5,border:"1px solid #e2e8f0"}}>
            {changePinUser===id?(
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:12,fontWeight:700,color:m.color}}>{m.name}</span>
                <input style={{...S.inp,marginBottom:0,width:70,textAlign:"center",padding:"5px"}} placeholder="4 ספרות" maxLength={4}
                  value={newPinVal} onChange={e=>setNewPinVal(e.target.value.replace(/\D/g,"").slice(0,4))} type="tel"/>
                <button onClick={()=>updatePin(id,newPinVal)} style={{background:"#10b981",border:"none",borderRadius:6,color:"#fff",fontSize:10,padding:"5px 10px",cursor:"pointer"}}>💾</button>
                <button onClick={()=>{setChangePinUser(null);setNewPinVal("");}} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:11}}>✕</button>
              </div>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:12,fontWeight:700,color:m.color,flex:1}}>{m.name}</span>
                <span style={{fontSize:10,color:"#475569",letterSpacing:3}}>••••</span>
                <button onClick={()=>{setChangePinUser(id);setNewPinVal("");}} style={{padding:"4px 8px",background:"#6366f120",border:"1px solid #6366f150",borderRadius:6,color:"#6366f1",fontSize:10,cursor:"pointer"}}>שנה</button>
              </div>
            )}
          </div>
        ))}
      </>}

      </div>

      {/* SWAP MODAL */}
      {swapModal&&(
        <div style={S.ov} onClick={()=>setSwapModal(null)}>
          <div style={S.md} onClick={e=>e.stopPropagation()}>
            <h3 style={S.mt}>🔄 החלף משימה</h3>
            <p style={{color:"#94a3b8",fontSize:11,textAlign:"center",margin:"0 0 10px"}}>בחר/י למי להעביר את המשימה:</p>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {CH.filter(c=>c!==swapModal.from).map(c=>(
                <button key={c} onClick={()=>{requestSwap(swapModal.taskId,swapModal.from,c);setSwapModal(null);}}
                  style={{padding:12,background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:10,color:"#1e293b",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontWeight:700,color:FAMILY[c].color}}>{FAMILY[c].name}</span>
                </button>
              ))}
            </div>
            <button onClick={()=>setSwapModal(null)} style={{...S.mc,marginTop:8}}>ביטול</button>
          </div>
        </div>
      )}

      {/* BONUS MODAL */}
      {bonusModal&&!isP&&(
        <div style={S.ov} onClick={()=>setBonusModal(false)}>
          <div style={S.md} onClick={e=>e.stopPropagation()}>
            <h3 style={S.mt}>⭐ יוזמה</h3>
            <input style={S.inp} placeholder="מה עשית?" value={bonusTitle} onChange={e=>setBonusTitle(e.target.value)}/>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:8}}>
              {["⭐","💪","🧹","🍳","🌟","🎨","📖","🏃","🛠️","❤️","🤝","🌈"].map(em=>(
                <button key={em} onClick={()=>setBonusIcon(em)}
                  style={{width:32,height:32,fontSize:16,background:bonusIcon===em?"#8b5cf620":"#f1f5f9",border:bonusIcon===em?"2px solid #8b5cf6":"1px solid #e2e8f0",borderRadius:7,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{em}</button>
              ))}
            </div>
            <input ref={bonusFileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleBonusPhoto}/>
            {bonusPhoto?<div style={{position:"relative",marginBottom:8}}>
              <img src={bonusPhoto} alt="" style={{width:"100%",borderRadius:8,maxHeight:140,objectFit:"cover"}}/>
              <button onClick={()=>setBonusPhoto(null)} style={{position:"absolute",top:4,left:4,background:"#ef4444",border:"none",borderRadius:6,color:"#fff",fontSize:10,width:20,height:20,cursor:"pointer"}}>✕</button>
            </div>:<button onClick={()=>bonusFileRef.current?.click()} style={{width:"100%",padding:8,background:"#f1f5f9",border:"1px dashed #334155",borderRadius:8,color:"#94a3b8",fontSize:11,cursor:"pointer",marginBottom:8}}>📷 תמונה</button>}
            <button onClick={submitBonus} style={{width:"100%",padding:10,background:"linear-gradient(135deg,#7c3aed,#8b5cf6)",border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:4}}>⭐ שלח</button>
            <button onClick={()=>setBonusModal(false)} style={S.mc}>ביטול</button>
          </div>
        </div>
      )}

      {/* PHOTO MODAL */}
      {photoModal&&(
        <div style={S.ov} onClick={()=>setPhotoModal(null)}>
          <div style={S.md} onClick={e=>e.stopPropagation()}>
            {photoModal.view?<>
              <img src={photoModal.view} alt="" style={{width:"100%",borderRadius:10,marginBottom:10,maxHeight:240,objectFit:"cover"}}/>
              <button onClick={()=>setPhotoModal(null)} style={S.mc}>סגור</button>
            </>:<>
              <h3 style={S.mt}>📷 הוכחה</h3>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}}
                onChange={e=>{handlePhoto(e,photoModal.taskId,photoModal.childId,photoModal.day);setPhotoModal(null);}}/>
              <button onClick={()=>fileRef.current?.click()} style={{width:"100%",padding:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:5}}>📸 צלם</button>
              <button onClick={()=>{markDone(photoModal.taskId,photoModal.childId,photoModal.day,null);setPhotoModal(null);}} style={{width:"100%",padding:7,background:"rgba(255,255,255,0.05)",border:"1px solid #e2e8f0",borderRadius:8,color:"#94a3b8",fontSize:10,cursor:"pointer",marginBottom:5}}>דלג</button>
              <button onClick={()=>setPhotoModal(null)} style={S.mc}>ביטול</button>
            </>}
          </div>
        </div>
      )}

      {/* DONE CONFIRM MODAL */}
      {doneConfirm&&(
        <div style={S.ov} onClick={()=>setDoneConfirm(null)}>
          <div style={S.md} onClick={e=>e.stopPropagation()}>
            <h3 style={S.mt}>✅ סיום משימה</h3>
            <p style={{color:"#64748b",fontSize:12,textAlign:"center",margin:"0 0 12px"}}>רוצה להוסיף תמונה?</p>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}}
              onChange={e=>{handlePhoto(e,doneConfirm.taskId,doneConfirm.childId,doneConfirm.day);setDoneConfirm(null);}}/>
            <button onClick={()=>fileRef.current?.click()}
              style={{width:"100%",padding:12,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:6}}>
              📸 כן, לצלם!
            </button>
            <button onClick={()=>{markDone(doneConfirm.taskId,doneConfirm.childId,doneConfirm.day,null);setDoneConfirm(null);}}
              style={{width:"100%",padding:10,background:"#10b981",border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:6}}>
              ✅ בלי תמונה
            </button>
            <button onClick={()=>setDoneConfirm(null)} style={S.mc}>ביטול</button>
          </div>
        </div>
      )}

      {/* PENALTY MODAL */}
      {penaltyModal&&(
        <div style={S.ov} onClick={()=>setPenaltyModal(null)}>
          <div style={S.md} onClick={e=>e.stopPropagation()}>
            <h3 style={S.mt}>⚠️ הורדת נקודות - {FAMILY[penaltyModal.childId]?.name}</h3>
            <p style={{color:"#64748b",fontSize:11,textAlign:"center",margin:"0 0 10px"}}>בחר/י סיבה:</p>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {PENALTIES.map(p=>(
                <button key={p.id} onClick={()=>addPenalty(penaltyModal.childId,p.id)}
                  style={{padding:12,background:"#fff5f5",border:"1px solid #ef444430",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"right"}}>
                  <span style={{fontSize:22}}>{p.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{p.title}</div>
                    <div style={{fontSize:10,color:"#ef4444"}}>-{p.xp} XP</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={()=>setPenaltyModal(null)} style={{...S.mc,marginTop:8}}>ביטול</button>
          </div>
        </div>
      )}

      {/* EXAM MODAL */}
      {examModal&&isP&&(
        <div style={S.ov} onClick={()=>{setExamModal(null);setExamScore("");}}>
          <div style={S.md} onClick={e=>e.stopPropagation()}>
            <h3 style={S.mt}>📝 דיווח ציון מבחן</h3>
            {examModal===true?(
              <>{/* Select child */}
                <p style={{color:"#64748b",fontSize:11,textAlign:"center",margin:"0 0 10px"}}>בחר/י ילד/ה:</p>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {CH.map(c=><button key={c} onClick={()=>setExamModal({childId:c})}
                    style={{padding:12,background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontWeight:700,color:FAMILY[c].color}}>{FAMILY[c].name}</span>
                  </button>)}
                </div>
              </>
            ):(
              <>{/* Enter score */}
                <p style={{color:"#64748b",fontSize:11,textAlign:"center",margin:"0 0 10px"}}>ציון של {FAMILY[examModal.childId]?.name}:</p>
                <input style={{...S.inp,textAlign:"center",fontSize:24,fontWeight:800}} type="number" min="0" max="100" placeholder="0-100"
                  value={examScore} onChange={e=>setExamScore(e.target.value.slice(0,3))}/>
                {examScore&&parseInt(examScore)>=90&&(
                  <div style={{background:"linear-gradient(135deg,#ecfdf5,#d1fae5)",borderRadius:10,padding:10,marginBottom:8,textAlign:"center",border:"1px solid #10b98140"}}>
                    <div style={{fontSize:14,fontWeight:800,color:"#10b981"}}>💰 בונוס: {parseInt(examScore)>=100?100:50}₪</div>
                  </div>
                )}
                <button onClick={()=>addExam(examModal.childId,examScore)}
                  style={{width:"100%",padding:10,background:"linear-gradient(135deg,#4f46e5,#6366f1)",border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:5}}>📝 שלח</button>
              </>
            )}
            <button onClick={()=>{setExamModal(null);setExamScore("");}} style={{...S.mc,marginTop:8}}>ביטול</button>
          </div>
        </div>
      )}

      {/* PRAISE MODAL */}
      {praiseModal&&(
        <div style={S.ov} onClick={()=>setPraiseModal(null)}>
          <div style={S.md} onClick={e=>e.stopPropagation()}>
            <h3 style={S.mt}>{praiseStar||"👍"} שבח ל{FAMILY[praiseModal.childId]?.name}</h3>
            <p style={{color:"#64748b",fontSize:11,textAlign:"center",margin:"0 0 10px"}}>
              {tasks.find(t=>t.id===praiseModal.taskId)?.icon} {tasks.find(t=>t.id===praiseModal.taskId)?.title}
            </p>
            <input style={S.inp} placeholder="כתוב/י מילה טובה..." value={praiseText} onChange={e=>setPraiseText(e.target.value)}/>
            <div style={{display:"flex",gap:6,marginBottom:10,justifyContent:"center"}}>
              {["⭐","🌟","💪","🏆","❤️","👏"].map(s=>(
                <button key={s} onClick={()=>setPraiseStar(praiseStar===s?null:s)}
                  style={{width:36,height:36,fontSize:18,background:praiseStar===s?"#f59e0b20":"#f1f5f9",border:praiseStar===s?"2px solid #f59e0b":"1px solid #e2e8f0",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{s}</button>
              ))}
            </div>
            <button onClick={submitPraise}
              style={{width:"100%",padding:10,background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:5}}>
              ✅ אשר{praiseText.trim()?" ושלח":""}
            </button>
            <button onClick={()=>{approve(praiseModal.taskId,praiseModal.childId,praiseModal.day);setPraiseModal(null);}}
              style={{width:"100%",padding:7,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,color:"#64748b",fontSize:10,cursor:"pointer",marginBottom:5}}>
              אשר בלי הודעה
            </button>
            <button onClick={()=>setPraiseModal(null)} style={S.mc}>ביטול</button>
          </div>
        </div>
      )}
    </div>
  );
}

const S={
  lw:{minHeight:"100vh",background:"linear-gradient(140deg,#fef9f0,#f0e6ff 40%,#e0f2fe)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',Tahoma,sans-serif",direction:"rtl",padding:12},
  lc:{background:"#ffffff",borderRadius:20,padding:"24px 18px",width:"100%",maxWidth:360,textAlign:"center",border:"1px solid #e2e8f0",boxShadow:"0 20px 40px rgba(0,0,0,0.08)"},
  ug:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},
  ub:{background:"#fefefe",border:"2px solid #e2e8f0",borderRadius:14,padding:"12px 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all 0.3s",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"},

  app:{minHeight:"100vh",background:"linear-gradient(180deg,#fef9f0,#f0e6ff)",fontFamily:"'Segoe UI',Tahoma,sans-serif",color:"#1e293b",paddingBottom:28},
  toast:{position:"fixed",top:10,left:"50%",transform:"translateX(-50%)",background:"#ffffff",color:"#1e293b",padding:"7px 16px",borderRadius:10,fontSize:11,fontWeight:600,zIndex:1000,border:"1px solid #e2e8f0",boxShadow:"0 6px 16px rgba(0,0,0,0.1)"},
  header:{background:"linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",padding:"10px 12px 8px",borderRadius:"0 0 16px 16px"},
  hTop:{display:"flex",alignItems:"center",gap:8},
  backBtn:{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:8,width:30,height:30,color:"#fff",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
  bonusFab:{background:"linear-gradient(135deg,#7c3aed,#8b5cf6)",border:"none",borderRadius:8,padding:"5px 10px",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer"},
  dayRow:{display:"flex",gap:2,marginBottom:10,overflowX:"auto"},
  dayBtn:{flex:1,minWidth:36,padding:"5px 2px",background:"#f8fafc",border:"2px solid transparent",borderRadius:8,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:0,transition:"all 0.2s",color:"#64748b"},
  dayAct:{background:"rgba(99,102,241,0.15)",borderColor:"#6366f1",color:"#4338ca"},
  tabs:{display:"flex",gap:1,padding:"6px 8px 0",justifyContent:"center"},
  tab:{padding:"7px 12px",background:"transparent",border:"none",borderBottom:"2px solid transparent",color:"#94a3b8",fontSize:14,cursor:"pointer",borderRadius:"6px 6px 0 0",transition:"all 0.2s"},
  tabA:{color:"#6366f1",borderBottomColor:"#6366f1",background:"rgba(99,102,241,0.08)"},
  subT:{padding:"5px 10px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:8,color:"#64748b",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"},
  content:{padding:"10px 10px 20px"},
  secH:{display:"flex",alignItems:"center",gap:6,marginBottom:5,padding:"0 2px"},
  bdg:{marginRight:"auto",marginLeft:0,fontSize:9,color:"#64748b",fontWeight:600,background:"#f1f5f9",padding:"1px 7px",borderRadius:7},
  st:{fontSize:15,fontWeight:800,color:"#1e293b",margin:"0 0 10px"},

  tc:{background:"#ffffff",borderRadius:10,padding:"8px 10px",marginBottom:3,border:"1px solid #e2e8f0",transition:"all 0.3s",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},
  tD:{borderColor:"#f59e0b40",background:"linear-gradient(135deg,#fffbeb,#fef3c7)"},
  tA:{borderColor:"#10b98140",background:"linear-gradient(135deg,#ecfdf5,#d1fae5)"},
  tr:{display:"flex",alignItems:"center",gap:7},
  wt:{fontSize:8,fontWeight:700,color:"#6366f1",background:"#6366f115",padding:"1px 5px",borderRadius:5},

  wB:{width:26,height:26,background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:6,color:"#1e293b",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
  wBs:{width:18,height:18,background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:4,color:"#1e293b",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},

  doneBtn:{minWidth:34,height:34,background:"#10b981",border:"none",borderRadius:9,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
  camBtn:{minWidth:34,height:34,background:"#6366f1",border:"none",borderRadius:9,color:"#fff",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
  okBtn:{minWidth:28,height:28,background:"#10b981",border:"none",borderRadius:7,color:"#fff",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
  noBtn:{minWidth:28,height:28,background:"#ef4444",border:"none",borderRadius:7,color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
  vBtn:{padding:"3px 5px",background:"rgba(99,102,241,0.1)",border:"1px solid #6366f130",borderRadius:5,color:"#6366f1",fontSize:10,cursor:"pointer"},
  eBtn:{padding:"3px 8px",background:"#6366f110",border:"1px solid #6366f130",borderRadius:6,color:"#6366f1",fontSize:10,cursor:"pointer"},
  dBtn:{padding:"3px 6px",background:"#ef444410",border:"1px solid #ef444430",borderRadius:6,color:"#ef4444",fontSize:10,cursor:"pointer"},
  bOk:{flex:1,padding:8,background:"#10b981",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"},
  bNo:{flex:1,padding:8,background:"#ef4444",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"},

  dc:{background:"#ffffff",borderRadius:12,padding:12,marginBottom:8,border:"1px solid #e2e8f0",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},

  inp:{width:"100%",padding:"8px 10px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,color:"#1e293b",fontSize:12,outline:"none",marginBottom:8,boxSizing:"border-box",direction:"rtl"},
  chip:{padding:"4px 8px",background:"#f8fafc",border:"2px solid #e2e8f0",borderRadius:14,cursor:"pointer",fontSize:10,color:"#64748b",fontWeight:600,transition:"all 0.2s"},

  ov:{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:12},
  md:{background:"#ffffff",borderRadius:16,padding:18,width:"100%",maxWidth:300,border:"1px solid #e2e8f0",direction:"rtl",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 20px 40px rgba(0,0,0,0.12)"},
  mt:{fontSize:14,fontWeight:800,color:"#1e293b",margin:"0 0 8px",textAlign:"center"},
  mc:{width:"100%",padding:6,background:"transparent",border:"none",color:"#94a3b8",fontSize:10,cursor:"pointer"},
};
