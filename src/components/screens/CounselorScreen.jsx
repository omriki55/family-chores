import { useState, useRef, useEffect } from 'react';
import { FAMILY } from '../../constants.js';

const COUNSELOR_NAME = "מיכל";
const COUNSELOR_EMOJI = "🌸";

const RESPONSES = [
  {
    keywords: ["התנגדות","לא רוצה","סירוב","לא עושה","מסרב","מסרבת","לא מוכן","לא מוכנה"],
    text: "התנגדות לחובות ביתיות היא חלק טבעי לגמרי מהחיים עם ילדים 💙\n\nכמה גישות שעוזרות:\n• נסי להבין מה מאחורי ההתנגדות — האם המשימה קשה? משעממת? הילד/ה עייף/ה?\n• הפכי את זה לאתגר — \"נראה אם אפשר לסיים לפני הטיימר!\"\n• עבדו ביחד לפעמים — חיבור פיזי עוזר מאד\n• ציינו את הקטן ביותר — \"כל כך שמחתי שהנחת את הצלחת\"\n\nזכרי: עקביות חשובה יותר משלמות 🌟",
  },
  {
    keywords: ["עקביות","לשכוח","שוכח","שוכחת","מוסח","מוסחת","לא זוכר","לא זוכרת"],
    text: "עקביות היא אחד האתגרים הגדולים ביותר בהורות 🌺 וזה בסדר גמור!\n\nמה שעוזר:\n• קבעי שעה קבועה ביום לבדיקת משימות — הפכי את זה לשגרה\n• השתמשי בתזכורות האפליקציה — היא תשלח התראות לילדים\n• אחרי יום קשה — אל תוותרי, חזרי בעדינות למחרת\n\nזכרי: כל יום חדש הוא התחלה חדשה 💪",
  },
  {
    keywords: ["פרס","תגמול","מוטיבציה","ממריץ","כסף","תשלום","שכר","XP","נקודות"],
    text: "מצוין שאת חושבת על תגמולים! 🌟 הם עובדים הכי טוב כשהם:\n\n• **צפויים ועקביים** — הילד/ה יודעים בדיוק מה מצפה להם\n• **קרובים בזמן** — תגמול שבועי עדיף על חודשי\n• **מגוונים** — לא רק כסף! XP, תגים, הכרה משפחתית\n• **פרופורציוניים** — משימה קשה = XP גבוה יותר\n\nהאפליקציה בנויה בדיוק על העיקרים האלה 💙",
  },
  {
    keywords: ["קנס","עונש","הפחתה","ריב","כעס","רוגז","מתחרפן","מתחרפנת"],
    text: "אני שומעת שיש מתח 😔 זה קשה.\n\nקנסות עובדים הכי טוב כאשר:\n• משתמשים בהם בנדירות — הם מאבדים עוצמה אם שכיחים מדי\n• מסבירים בנחת את הסיבה לפני ואחרי\n• מצמידים לתיקון — \"הפחתתי XP, ועכשיו תני לי לראות אותך עושה את זה\"\n\nהכי חשוב — הקשר ביניכם. לפעמים שיחה עדיפה על קנס 💙",
  },
  {
    keywords: ["אחים","אחיות","קנאה","לא שווה","לא הוגן","השוואה","השווה"],
    text: "יחסי אחים וחובות ביתיות — שילוב מאתגר! 😄\n\nכמה עצות:\n• ודאי שהמשימות מותאמות לגיל — אל תשווי בין ילדים שונים\n• הדגישי הצלחות אישיות ולא השוואות\n• צרי אתגרי צוות שבהם כולם מרוויחים יחד\n• כשיש ריב — הכירי ברגש לפני הפתרון\n\nהאפליקציה מאפשרת אתגרים משפחתיים שמקדמים שיתוף פעולה 🌟",
  },
  {
    keywords: ["ייאוש","מוותרת","מוותר","אין כוח","לא עובד","כישלון","תקווה","לא מסתדר"],
    text: "אני כאן 💙 ורוצה שתדעי — העובדה שאת כאן, שואלת, מחפשת דרכים — זה כבר הצלחה ענקית.\n\nהורות היא מרתון, לא ספרינט. יהיו ימים קשים, ויהיו פריצות דרך מפתיעות.\n\nתסתכלי לא על יום אחד, אלא על השבוע כולו — האם יש שיפור כלשהו? גם קטן?\n\nאת לא לבד 🌺 המשיכי. את עושה עבודה חשובה מאד.",
  },
  {
    keywords: ["להתחיל","חדש","לאן","איך","מתחילה","מתחיל","מה לעשות","איפה"],
    text: "ברוכה הבאה! 🎉 כמה צעדים ראשונים מומלצים:\n\n**1.** הכניסי 3-5 משימות בסיסיות (לא יותר מדי בהתחלה)\n**2.** קבעי שיחת משפחה — הסבירי לילדים איך זה עובד\n**3.** התחילי עם ציפיות קטנות — הצלחה קטנה עדיפה על כישלון גדול\n**4.** תגמלי על ניסיון, לא רק על הצלחה\n\nאחרי שבוע-שבועיים תוכלי לגבש ולהוסיף. את מוכנה? 💪",
  },
  {
    keywords: ["מחמאה","לשבח","חיזוק","להגיד","מה לומר","שבח"],
    text: "מחמאה אפקטיבית היא אמנות 🌟\n\n• **ספציפית** — לא \"כל הכבוד\" אלא \"כל הכבוד שסדרת את הצעצועים לפני שביקשתי!\"\n• **על המאמץ** — לא \"את חכמה\" אלא \"רואים כמה השתדלת\"\n• **בזמן אמת** — מחמאה מיידית עדיפה על מאוחרת\n• **בפומבי** — שבחי בפני אחרים, גם בוואל המשפחתי!\n\nהשתמשי בפיצ'ר 'שבח' באפליקציה — זה נשמר ומופיע לילד/ה 💙",
  },
  {
    keywords: ["הרגל","שגרה","רוטינה","יומי","קבוע","כל יום"],
    text: "יצירת הרגלים דורשת סבלנות 🌱 המחקר מדבר על 21-66 ימים לגיבוש הרגל חדש!\n\nמה עוזר:\n• **עוגן** — קשרי את המשימה לדבר קיים ('אחרי ארוחת ערב = סידור שולחן')\n• **שעה קבועה** — כמה שיותר עקביים\n• **הסטריק** — ה-🔥 באפליקציה הוא כלי עוצמתי מאד!\n• **גמישות** — אם יום נפל, אל תוותרי על היום הבא\n\nשבוע ראשון הכי קשה. שני הרבה יותר קל 💪",
  },
  {
    keywords: ["גיל","קטן","גדול","בן","בת","כמה","מתאים","מותאם"],
    text: "התאמת משימות לגיל היא מפתח 🔑\n\n**גיל 4-6:** ליקוט צעצועים, הנחת כביסה בסל, הגדת שולחן עם עזרה\n**גיל 7-9:** סידור חדר, ניגוב אבק, הכנת כריך בסיסי\n**גיל 10-12:** כביסה בסיסית, בישול פשוט, ניקוי חדר אמבטיה\n**גיל 13+:** משימות אחריות — קניות, ניהול כביסה, טיפול באחים\n\nזכרי — הצלחה קטנה בגיל הנכון בונה ביטחון עצמי 💙",
  },
  {
    keywords: ["טלפון","מסך","מחשב","משחקים","נינטנדו","זמן מסך"],
    text: "זמן מסך כנגד חובות ביתיות — נושא חם! 📱\n\nכמה גישות:\n• זמן מסך כתגמול — לא עונש — 'אחרי שתסיים, תוכל לשחק'\n• הגדירי זמן מסך ב-screen time settings — ועמדי על זה בעקביות\n• הפכי את האפליקציה לחלק מהשגרה לפני הזמן החופשי\n• אל תשתמשי בזמן מסך כהגנה — תני להם לפעמים לבחור\n\nהגבול הכי אפקטיבי הוא הגבול שאת מוכנה לשמור עליו 🌟",
  },
];

const QUICK_PROMPTS = [
  "הילדים מתנגדים למשימות",
  "קשה לי להיות עקבית",
  "איך להתחיל?",
  "הילדים לא מוטיבציוניים",
  "יש ריבים בין אחים",
  "אני מרגישה ייאוש",
  "איך לשבח נכון?",
  "איך לבנות הרגל?",
];

const DEFAULT_RESPONSES = [
  "זו שאלה חשובה 💙 ספרי לי קצת יותר — מה בדיוק קורה? איזה ילד? באיזה גיל? כך אוכל לעזור לך בצורה יותר ממוקדת.",
  "אני שומעת אותך 🌸 כל משפחה היא עולם בפני עצמו. תוכלי לספר לי יותר על הסיטואציה?",
  "שאלה מצוינת! 🌟 כדי לעזור לך בצורה הטובה ביותר — ספרי לי עוד פרטים. מה גיל הילד/ה? מה המשימה הספציפית?",
  "אני כאן בשבילך 💙 בואי נבין יחד את הסיטואציה. מה קורה בדיוק?",
];

function findResponse(input) {
  const lower = input.toLowerCase();
  for (const r of RESPONSES) {
    if (r.keywords.some(k => lower.includes(k))) return r.text;
  }
  return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
}

function formatText(text) {
  return text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`);
    return <p key={i} style={{margin: '2px 0', lineHeight: 1.5}} dangerouslySetInnerHTML={{__html: bold || '&nbsp;'}} />;
  });
}

export default function CounselorScreen({ S, app }) {
  const { user } = app;
  const me = FAMILY[user] || {};
  const [history, setHistory] = useState([
    {
      from: 'counselor',
      text: `שלום ${me.name || ''} 👋\n\nאני ${COUNSELOR_NAME}, יועצת הורים המתמחה בשילוב כלים דיגיטליים בחיי המשפחה.\n\nאני כאן כדי לעזור לך עם כל אתגר — מהתנגדות ילדים, דרך עקביות, ועד מוטיבציה ועידוד. את לא לבד בזה 💙\n\nעל מה תרצי לדבר?`,
      ts: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, typing]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    const userMsg = { from: 'user', text: msg, ts: Date.now() };
    setHistory(h => [...h, userMsg]);
    setTyping(true);
    setTimeout(() => {
      const response = findResponse(msg);
      setTyping(false);
      setHistory(h => [...h, { from: 'counselor', text: response, ts: Date.now() }]);
    }, 900 + Math.random() * 600);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: 400 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#f0abfc,#c084fc,#818cf8)', borderRadius: 14, padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{COUNSELOR_EMOJI}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{COUNSELOR_NAME}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)' }}>יועצת הורים • תמיכה ועידוד</div>
        </div>
        <div style={{ marginRight: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: 10 }}>🔒 שיחה פרטית</div>
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 6 }}>
        {QUICK_PROMPTS.map((q, i) => (
          <button key={i} onClick={() => send(q)}
            style={{ flexShrink: 0, padding: '5px 10px', background: '#f3e8ff', border: '1px solid #d8b4fe', borderRadius: 14, fontSize: 10, color: '#7c3aed', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 2px' }}>
        {history.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: msg.from === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start' }}>
            {msg.from === 'counselor' && (
              <div style={{ width: 32, height: 32, borderRadius: 16, background: 'linear-gradient(135deg,#f0abfc,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginTop: 2 }}>{COUNSELOR_EMOJI}</div>
            )}
            <div style={{
              maxWidth: '78%',
              background: msg.from === 'user' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#fff',
              color: msg.from === 'user' ? '#fff' : '#1e293b',
              borderRadius: msg.from === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              padding: '10px 13px',
              fontSize: 12,
              lineHeight: 1.6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: msg.from === 'counselor' ? '1px solid #e2e8f0' : 'none',
              direction: 'rtl',
              textAlign: 'right',
            }}>
              {formatText(msg.text)}
              <div style={{ fontSize: 9, color: msg.from === 'user' ? 'rgba(255,255,255,0.6)' : '#94a3b8', marginTop: 4, textAlign: 'left' }}>
                {new Date(msg.ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.from === 'user' && (
              <div style={{ width: 32, height: 32, borderRadius: 16, background: `linear-gradient(135deg,${me.color||'#6366f1'},${me.color||'#8b5cf6'}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 2 }}>
                {(me.name||'?')[0]}
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: 'linear-gradient(135deg,#f0abfc,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{COUNSELOR_EMOJI}</div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px 16px 16px 16px', padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: 4, background: '#a855f7', animation: `bounce 1.2s ease ${i*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, padding: '8px 0', borderTop: '1px solid #e2e8f0' }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="שתפי מה על הלב..."
          rows={2}
          style={{ flex: 1, padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, color: '#1e293b', fontSize: 12, outline: 'none', resize: 'none', direction: 'rtl', fontFamily: 'inherit', lineHeight: 1.5 }}
        />
        <button onClick={() => send()}
          style={{ width: 44, height: 44, borderRadius: 12, background: input.trim() ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#e2e8f0', border: 'none', color: '#fff', fontSize: 18, cursor: input.trim() ? 'pointer' : 'default', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          ➤
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)}
        }
      `}</style>
    </div>
  );
}
