export const DAYS=["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
export const DS=["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];

// ── Dynamic family config (loaded from localStorage if onboarding completed) ──
const _fc=(()=>{try{const s=localStorage.getItem('family-chores_family-config');return s?JSON.parse(s):null;}catch{return null;}})();

export const DEFAULT_PINS=_fc?.pins??{liron:"1234",omri:"1234",peleg:"1111",yahav:"2222",yahel:"3333"};
export const FAMILY=_fc?.family??{
  liron:{name:"לירון",role:"parent",emoji:"👨",color:"#6366f1",weeklyPay:0},
  omri:{name:"עומרי",role:"parent",emoji:"👩",color:"#ec4899",weeklyPay:0},
  peleg:{name:"פלג",role:"child",emoji:"🧒",weeklyPay:110,color:"#f59e0b"},
  yahav:{name:"יהב",role:"child",emoji:"👦",weeklyPay:75,color:"#10b981"},
  yahel:{name:"יהל",role:"child",emoji:"👧",weeklyPay:0,color:"#8b5cf6"},
};
export const CH=_fc?.children??["peleg","yahav","yahel"];
export const FAMILY_NAME=_fc?.familyName??null;
export const LEVELS=[
  {name:"מתחיל",emoji:"🌱",min:0},{name:"חרוץ",emoji:"💪",min:100},{name:"מסודר",emoji:"📋",min:250},
  {name:"אחראי",emoji:"🎯",min:500},{name:"כוכב",emoji:"⭐",min:800},{name:"גיבור",emoji:"🦸",min:1200},
  {name:"מקצוען",emoji:"🏅",min:1700},{name:"מאסטר",emoji:"🎓",min:2300},{name:"מומחה",emoji:"💎",min:3000},
  {name:"אלוף",emoji:"🏆",min:4000},{name:"נינג'ה",emoji:"🥷",min:5200},{name:"סופר-סטאר",emoji:"🌟",min:6500},
  {name:"מלך/מלכה",emoji:"👑",min:8000},{name:"אגדה",emoji:"🐉",min:10000},{name:"אלוף העולם",emoji:"🌍",min:13000},
];
export const REMINDERS=[
  {id:"morning",label:"בוקר",time:"07:30",emoji:"🌅"},
  {id:"afternoon",label:"צהריים",time:"14:00",emoji:"☀️"},
  {id:"evening",label:"ערב",time:"18:00",emoji:"🌆"},
  {id:"night",label:"לילה",time:"20:30",emoji:"🌙"},
];
export const SUGGESTED=[
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
export const PENALTIES=[
  {id:"p1",title:"קללות",icon:"🤬",xp:5},
  {id:"p2",title:"אלימות",icon:"👊",xp:15},
  {id:"p3",title:"אי פינוי כלים",icon:"🍽️",xp:10},
  {id:"p4",title:"אי פינוי בגדים",icon:"👕",xp:10},
  {id:"p5",title:"התגרות בהורים/אחים",icon:"😤",xp:10},
];
export const DEFAULT_BADGES=[
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
export const EXAM_BONUSES=[{min:100,bonus:100,label:"ציון 100!"},{min:90,bonus:50,label:"ציון 90+"}];
export const INIT_TASKS=[
  {id:"t1",title:"העמסת מדיח",icon:"🍽️",weight:12,assignedTo:[...CH],bonus:false,type:"shared"},
  {id:"t2",title:"פינוי מדיח",icon:"🫧",weight:10,assignedTo:[...CH],bonus:false,type:"shared"},
  {id:"t3",title:"הורדת זבל",icon:"🗑️",weight:8,assignedTo:[...CH],bonus:false,type:"shared"},
  {id:"t4",title:"סידור החדר",icon:"🛏️",weight:12,assignedTo:[...CH],bonus:false,type:"personal"},
  {id:"t5",title:"הכנת שיעורים",icon:"📚",weight:15,assignedTo:[...CH],bonus:false,type:"personal"},
  {id:"t6",title:"ניקוי שולחן",icon:"🪑",weight:6,assignedTo:[...CH],bonus:false,type:"shared"},
  {id:"t7",title:"קיפול כביסה",icon:"👕",weight:10,assignedTo:[...CH],bonus:false,type:"shared"},
  {id:"t8",title:"שאיבת אבק",icon:"🧹",weight:9,assignedTo:[...CH],bonus:false,type:"shared"},
  {id:"t9",title:"טיפול בחיות",icon:"🐕",weight:8,assignedTo:[...CH],bonus:false,type:"personal"},
  {id:"t10",title:"הצעת מיטה",icon:"🛌",weight:5,assignedTo:[...CH],bonus:false,type:"personal"},
  {id:"t11",title:"סידור נעליים",icon:"👟",weight:5,assignedTo:[...CH],bonus:false,type:"personal"},
];
export const DEFAULT_GOALS=[
  {id:"g1",title:"שבוע מושלם",emoji:"🏆",desc:"כל הילדים מעל 90%",target:90,reward:"פיצה משפחתית 🍕",active:true},
  {id:"g2",title:"אפס החמצות",emoji:"💯",desc:"אף משימה לא פוספסה ביום",target:100,reward:"סרט ביחד 🎬",active:true},
];
export const GROCERY_CATEGORIES=[
  {id:"fruits",name:"פירות וירקות",emoji:"🍎"},{id:"dairy",name:"חלב וגבינות",emoji:"🥛"},
  {id:"meat",name:"בשר ודגים",emoji:"🥩"},{id:"bread",name:"לחם ומאפים",emoji:"🍞"},
  {id:"snacks",name:"חטיפים ומתוקים",emoji:"🍫"},{id:"drinks",name:"שתייה",emoji:"🥤"},
  {id:"cleaning",name:"ניקיון",emoji:"🧹"},{id:"other",name:"אחר",emoji:"📦"},
];
export const DEFAULT_CHALLENGES=[
  {id:"ch1",title:"שבוע סופר!",desc:"כל הילדים מעל 80% השבוע",emoji:"🏆",type:"family",condition:"all_above_pct",value:80,xpReward:50},
  {id:"ch2",title:"5 ימי רצף",desc:"השלם כל המשימות 5 ימים",emoji:"🔥",type:"individual",condition:"streak_days",value:5,xpReward:30},
  {id:"ch3",title:"אפס החמצות",desc:"0 משימות שהוחמצו 3 ימים",emoji:"💯",type:"individual",condition:"zero_missed",value:3,xpReward:25},
  {id:"ch4",title:"כולם ביחד",desc:"כל המשימות המשפחתיות בוצעו",emoji:"👨‍👩‍👧‍👦",type:"family",condition:"all_shared_done",value:1,xpReward:40},
];
export const AUDIT_LABELS={
  task_done:"✅ ביצוע משימה",approved:"👍 אישור",rejected:"❌ דחייה",penalty_added:"⚠️ קנס",
  task_created:"✨ יצירת משימה",task_deleted:"🗑️ מחיקת משימה",task_updated:"✏️ עדכון משימה",pin_changed:"🔒 שינוי PIN",
  bonus_submitted:"⭐ יוזמה",swap_requested:"🔄 בקשת החלפה",swap_approved:"🔄 החלפה אושרה",swap_rejected:"❌ החלפה נדחתה",
  exam_added:"📝 מבחן",cal_event_added:"📅 אירוע חדש",cal_event_deleted:"🗑️ מחיקת אירוע",
};
