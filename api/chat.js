export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, familyContext } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  const contextLine = familyContext
    ? `\n\nמידע על המשפחה:\n${familyContext}`
    : '';

  const systemPrompt = `אתה מיכאל, יועץ הורים מומחה באפליקציית "משימות המשפחה".

התפקיד שלך:
- לעזור להורים להטמיע שימוש יומי באפליקציה
- להדריך ב-onboarding — איך להתחיל, מה להגדיר, איך להסביר לילדים
- לתת טיפים על: מוטיבציה, עקביות, תגמולים, התנגדות ילדים, הרגלים
- להכיר את הפיצ'רים: משימות, XP, levels, badges, streaks, חנות פרסים, קיר משפחתי, תבניות משימות

סגנון:
- עברית חמה ותומכת
- תשובות קצרות וממוקדות (3-5 נקודות)
- שימוש באימוג'ים 💙
- אל תשתמש במילה "אני" בהתחלת כל משפט
- הפנה לפיצ'רים ספציפיים באפליקציה כשרלוונטי
- תמיד תהיה אמפתי ותומך
- אל תייעץ ייעוץ רפואי או פסיכולוגי — הפנה למומחים כשצריך${contextLine}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI error:', err);
      return res.status(502).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'מצטער, לא הצלחתי לענות כרגע.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
