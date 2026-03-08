import { useState, useRef, useEffect } from 'react';
import { FAMILY } from '../../constants.js';

const COUNSELOR_NAME = "מיכאל";
const COUNSELOR_EMOJI = "🧑‍💼";

/* ── Offline fallback keyword responses ── */
const RESPONSES = [
  {
    keywords: ["התנגדות","לא רוצה","סירוב","לא עושה","מסרב","מסרבת","לא מוכן","לא מוכנה"],
    text: "התנגדות לחובות ביתיות היא חלק טבעי לגמרי מהחיים עם ילדים 💙\n\nכמה גישות שעוזרות:\n• נסו להבין מה מאחורי ההתנגדות — האם המשימה קשה? משעממת? הילד/ה עייף/ה?\n• הפכו את זה לאתגר — \"נראה אם אפשר לסיים לפני הטיימר!\"\n• עבדו ביחד לפעמים — חיבור פיזי עוזר מאד\n• ציינו את הקטן ביותר — \"כל כך שמחתי שהנחת את הצלחת\"\n\nעקביות חשובה יותר משלמות 🌟",
  },
  {
    keywords: ["עקביות","לשכוח","שוכח","שוכחת","מוסח","מוסחת","לא זוכר","לא זוכרת"],
    text: "עקביות היא אחד האתגרים הגדולים ביותר בהורות 💙 וזה בסדר גמור!\n\nמה שעוזר:\n• קבעו שעה קבועה ביום לבדיקת משימות — הפכו את זה לשגרה\n• השתמשו בתזכורות האפליקציה — היא תשלח התראות לילדים\n• אחרי יום קשה — אל תוותרו, חזרו בעדינות למחרת\n\nכל יום חדש הוא התחלה חדשה 💪",
  },
  {
    keywords: ["פרס","תגמול","מוטיבציה","ממריץ","כסף","תשלום","שכר","XP","נקודות"],
    text: "מצוין שאתם חושבים על תגמולים! 🌟 הם עובדים הכי טוב כשהם:\n\n• **צפויים ועקביים** — הילד/ה יודעים בדיוק מה מצפה להם\n• **קרובים בזמן** — תגמול שבועי עדיף על חודשי\n• **מגוונים** — לא רק כסף! XP, תגים, הכרה משפחתית\n• **פרופורציוניים** — משימה קשה = XP גבוה יותר\n\nהאפליקציה בנויה בדיוק על העיקרים האלה 💙",
  },
  {
    keywords: ["קנס","עונש","הפחתה","ריב","כעס","רוגז","מתחרפן","מתחרפנת"],
    text: "נשמע שיש מתח 😔 זה קשה.\n\nקנסות עובדים הכי טוב כאשר:\n• משתמשים בהם בנדירות — הם מאבדים עוצמה אם שכיחים מדי\n• מסבירים בנחת את הסיבה לפני ואחרי\n• מצמידים לתיקון — \"הפחתתי XP, ועכשיו תראו לי שאתם עושים את זה\"\n\nהכי חשוב — הקשר ביניכם. לפעמים שיחה עדיפה על קנס 💙",
  },
  {
    keywords: ["אחים","אחיות","קנאה","לא שווה","לא הוגן","השוואה","השווה"],
    text: "יחסי אחים וחובות ביתיות — שילוב מאתגר! 😄\n\nכמה עצות:\n• ודאו שהמשימות מותאמות לגיל — אל תשוו בין ילדים שונים\n• הדגישו הצלחות אישיות ולא השוואות\n• צרו אתגרי צוות שבהם כולם מרוויחים יחד\n• כשיש ריב — הכירו ברגש לפני הפתרון\n\nהאפליקציה מאפשרת אתגרים משפחתיים שמקדמים שיתוף פעולה 🌟",
  },
  {
    keywords: ["ייאוש","מוותרת","מוותר","אין כוח","לא עובד","כישלון","תקווה","לא מסתדר"],
    text: "💙 העובדה שאתם כאן, שואלים, מחפשים דרכים — זה כבר הצלחה ענקית.\n\nהורות היא מרתון, לא ספרינט. יהיו ימים קשים, ויהיו פריצות דרך מפתיעות.\n\nתסתכלו לא על יום אחד, אלא על השבוע כולו — האם יש שיפור כלשהו? גם קטן?\n\nאתם לא לבד 🌟 המשיכו. אתם עושים עבודה חשובה מאד.",
  },
  {
    keywords: ["להתחיל","חדש","לאן","איך","מתחילה","מתחיל","מה לעשות","איפה","onboarding"],
    text: "ברוכים הבאים! 🎉 כמה צעדים ראשונים מומלצים:\n\n**1.** הכניסו 3-5 משימות בסיסיות (לא יותר מדי בהתחלה)\n**2.** קבעו שיחת משפחה — הסבירו לילדים איך זה עובד\n**3.** התחילו עם ציפיות קטנות — הצלחה קטנה עדיפה על כישלון גדול\n**4.** תגמלו על ניסיון, לא רק על הצלחה\n\nאחרי שבוע-שבועיים תוכלו לגבש ולהוסיף. מוכנים? 💪",
  },
  {
    keywords: ["מחמאה","לשבח","חיזוק","להגיד","מה לומר","שבח"],
    text: "מחמאה אפקטיבית היא אמנות 🌟\n\n• **ספציפית** — לא \"כל הכבוד\" אלא \"כל הכבוד שסדרת את הצעצועים לפני שביקשתי!\"\n• **על המאמץ** — לא \"את חכמה\" אלא \"רואים כמה השתדלת\"\n• **בזמן אמת** — מחמאה מיידית עדיפה על מאוחרת\n• **בפומבי** — שבחו בפני אחרים, גם בקיר המשפחתי!\n\nהשתמשו בפיצ'ר 'שבח' באפליקציה — זה נשמר ומופיע לילד/ה 💙",
  },
  {
    keywords: ["הרגל","שגרה","רוטינה","יומי","קבוע","כל יום"],
    text: "יצירת הרגלים דורשת סבלנות 🌱 המחקר מדבר על 21-66 ימים לגיבוש הרגל חדש!\n\nמה עוזר:\n• **עוגן** — קשרו את המשימה לדבר קיים ('אחרי ארוחת ערב = סידור שולחן')\n• **שעה קבועה** — כמה שיותר עקביים\n• **הסטריק** — ה-🔥 באפליקציה הוא כלי עוצמתי מאד!\n• **גמישות** — אם יום נפל, אל תוותרו על היום הבא\n\nשבוע ראשון הכי קשה. שני הרבה יותר קל 💪",
  },
  {
    keywords: ["גיל","קטן","גדול","בן","בת","כמה","מתאים","מותאם"],
    text: "התאמת משימות לגיל היא מפתח 🔑\n\n**גיל 4-6:** ליקוט צעצועים, הנחת כביסה בסל, הגדת שולחן עם עזרה\n**גיל 7-9:** סידור חדר, ניגוב אבק, הכנת כריך בסיסי\n**גיל 10-12:** כביסה בסיסית, בישול פשוט, ניקוי חדר אמבטיה\n**גיל 13+:** משימות אחריות — קניות, ניהול כביסה, טיפול באחים\n\nהצלחה קטנה בגיל הנכון בונה ביטחון עצמי 💙",
  },
  {
    keywords: ["טלפון","מסך","מחשב","משחקים","נינטנדו","זמן מסך"],
    text: "זמן מסך כנגד חובות ביתיות — נושא חם! 📱\n\nכמה גישות:\n• זמן מסך כתגמול — לא עונש — 'אחרי שתסיים, תוכל לשחק'\n• הגדירו זמן מסך ב-screen time settings — ועמדו על זה בעקביות\n• הפכו את האפליקציה לחלק מהשגרה לפני הזמן החופשי\n\nהגבול הכי אפקטיבי הוא הגבול שאתם מוכנים לשמור עליו 🌟",
  },
];

const QUICK_PROMPTS = [
  "איך להתחיל עם האפליקציה?",
  "איך להגדיר משימות?",
  "מה זה XP ו-levels?",
  "איך עובדת חנות הפרסים?",
  "הילדים מתנגדים למשימות",
  "קשה לי להיות עקבי/ת",
  "איך לשבח נכון?",
  "איך לבנות הרגל?",
  "טיפים ל-onboarding",
  "איך להשתמש בקיר המשפחתי?",
  "הילדים לא מוטיבציוניים",
  "יש ריבים בין אחים",
];

const DEFAULT_RESPONSES = [
  "זו שאלה חשובה 💙 ספרו לי קצת יותר — מה בדיוק קורה? איזה ילד? באיזה גיל? כך אוכל לעזור בצורה יותר ממוקדת.",
  "שומע אתכם 💙 כל משפחה היא עולם בפני עצמו. תוכלו לספר יותר על הסיטואציה?",
  "שאלה מצוינת! 🌟 כדי לעזור בצורה הטובה ביותר — ספרו עוד פרטים. מה גיל הילד/ה? מה המשימה הספציפית?",
  "כאן בשבילכם 💙 בואו נבין יחד את הסיטואציה. מה קורה בדיוק?",
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
  const { user, isOffline } = app;
  const isDark = app.darkMode;
  const me = FAMILY[user] || {};

  // Chat messages for display
  const [history, setHistory] = useState([
    {
      from: 'counselor',
      text: `שלום ${me.name || ''} 👋\n\nאני ${COUNSELOR_NAME}, יועץ הורים AI באפליקציית "משימות המשפחה".\n\nכאן כדי לעזור עם כל אתגר — מהתנגדות ילדים, דרך עקביות, ועד מוטיבציה ו-onboarding.\nאפשר גם לשאול על כל פיצ'ר באפליקציה — XP, levels, badges, streaks, חנות פרסים, ועוד 💙\n\nעל מה נדבר?`,
      ts: Date.now(),
    }
  ]);

  // OpenAI message format for context
  const [apiMessages, setApiMessages] = useState([]);

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [aiError, setAiError] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, typing]);

  // Build family context for system prompt
  const buildFamilyContext = () => {
    const parts = [];
    const kids = Object.entries(FAMILY).filter(([,v]) => v.role === 'child');
    if (kids.length > 0) {
      parts.push(`ילדים במשפחה: ${kids.map(([,v]) => v.name).join(', ')}`);
    }
    if (app.tasks && app.tasks.length > 0) {
      parts.push(`מספר משימות מוגדרות: ${app.tasks.length}`);
    }
    return parts.length > 0 ? parts.join('\n') : '';
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || typing) return;
    setInput('');
    setAiError(false);

    const userMsg = { from: 'user', text: msg, ts: Date.now() };
    setHistory(h => [...h, userMsg]);
    setTyping(true);

    // Add to API messages
    const newApiMessages = [...apiMessages, { role: 'user', content: msg }];
    setApiMessages(newApiMessages);

    // Try AI API first, fall back to keyword matching
    if (!isOffline) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newApiMessages,
            familyContext: buildFamilyContext(),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.reply;
          setTyping(false);
          setHistory(h => [...h, { from: 'counselor', text: reply, ts: Date.now() }]);
          setApiMessages(m => [...m, { role: 'assistant', content: reply }]);
          return;
        }
        // API error — fall through to offline
        setAiError(true);
      } catch (err) {
        // Network error — fall through to offline
        setAiError(true);
      }
    }

    // Offline / error fallback — keyword matching
    setTimeout(() => {
      const response = findResponse(msg);
      setTyping(false);
      setHistory(h => [...h, {
        from: 'counselor',
        text: response + (aiError ? '\n\n_⚡ תשובה מקומית — מיכאל AI לא זמין כרגע_' : '\n\n_📴 מצב לא מקוון — תשובה מקומית_'),
        ts: Date.now()
      }]);
    }, 700 + Math.random() * 400);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  /* ── Theme-aware colors ── */
  const bubbleCounselor = isDark ? 'var(--card)' : '#fff';
  const bubbleCounselorText = 'var(--text)';
  const bubbleCounselorBorder = 'var(--border)';
  const inputBg = 'var(--inputBg)';
  const inputBorder = 'var(--border)';
  const inputColor = 'var(--text)';
  const timeColor = 'var(--textSec)';
  const quickBg = isDark ? 'rgba(139,92,246,0.15)' : '#f3e8ff';
  const quickBorder = isDark ? 'rgba(139,92,246,0.3)' : '#d8b4fe';
  const quickColor = isDark ? '#c4b5fd' : '#7c3aed';
  const borderTopColor = 'var(--border)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: 400 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#60a5fa,#6366f1,#8b5cf6)', borderRadius: 14, padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{COUNSELOR_EMOJI}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{COUNSELOR_NAME}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)' }}>יועץ הורים AI • תמיכה והדרכה</div>
        </div>
        <div style={{ marginRight: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          {isOffline && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', background: 'rgba(251,146,60,0.4)', padding: '3px 8px', borderRadius: 10 }}>📴 לא מקוון</span>}
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: 10 }}>🔒 שיחה פרטית</span>
        </div>
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 6 }}>
        {QUICK_PROMPTS.map((q, i) => (
          <button key={i} onClick={() => send(q)}
            style={{ flexShrink: 0, padding: '5px 10px', background: quickBg, border: `1px solid ${quickBorder}`, borderRadius: 14, fontSize: 10, color: quickColor, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 2px' }}>
        {history.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: msg.from === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start' }}>
            {msg.from === 'counselor' && (
              <div style={{ width: 32, height: 32, borderRadius: 16, background: 'linear-gradient(135deg,#60a5fa,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginTop: 2 }}>{COUNSELOR_EMOJI}</div>
            )}
            <div style={{
              maxWidth: '78%',
              background: msg.from === 'user' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : bubbleCounselor,
              color: msg.from === 'user' ? '#fff' : bubbleCounselorText,
              borderRadius: msg.from === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              padding: '10px 13px',
              fontSize: 12,
              lineHeight: 1.6,
              boxShadow: `0 2px 8px var(--shadow)`,
              border: msg.from === 'counselor' ? `1px solid ${bubbleCounselorBorder}` : 'none',
              direction: 'rtl',
              textAlign: 'right',
            }}>
              {formatText(msg.text)}
              <div style={{ fontSize: 9, color: msg.from === 'user' ? 'rgba(255,255,255,0.6)' : timeColor, marginTop: 4, textAlign: 'left' }}>
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
            <div style={{ width: 32, height: 32, borderRadius: 16, background: 'linear-gradient(135deg,#60a5fa,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{COUNSELOR_EMOJI}</div>
            <div style={{ background: bubbleCounselor, border: `1px solid ${bubbleCounselorBorder}`, borderRadius: '4px 16px 16px 16px', padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: 4, background: '#6366f1', animation: `bounce 1.2s ease ${i*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, padding: '8px 0', borderTop: `1px solid ${borderTopColor}` }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="שאלו אותי הכל..."
          rows={2}
          style={{ flex: 1, padding: '8px 12px', background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 12, color: inputColor, fontSize: 12, outline: 'none', resize: 'none', direction: 'rtl', fontFamily: 'inherit', lineHeight: 1.5 }}
        />
        <button onClick={() => send()}
          disabled={typing}
          style={{ width: 44, height: 44, borderRadius: 12, background: input.trim() && !typing ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : (isDark ? '#334155' : '#e2e8f0'), border: 'none', color: '#fff', fontSize: 18, cursor: input.trim() && !typing ? 'pointer' : 'default', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', opacity: typing ? 0.6 : 1 }}>
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
