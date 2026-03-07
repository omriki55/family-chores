# 🏠 משימות המשפחה

אפליקציית משימות משפחתית עם גיימיפיקציה, משקלים, יעדים משפחתיים והחלפת משימות.

## ⚡ התקנה מהירה (10 דקות)

### שלב 1: GitHub

```bash
# צור ריפו חדש ב-github.com/new (שם: family-chores)
# ואז בטרמינל:

cd family-chores
git init
git add .
git commit -m "🏠 family chores app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/family-chores.git
git push -u origin main
```

### שלב 2: Vercel (חינמי)

1. היכנס ל-[vercel.com](https://vercel.com) והתחבר עם GitHub
2. לחץ **"New Project"**
3. בחר את הריפו `family-chores`
4. Vercel יזהה Vite אוטומטית — פשוט לחץ **"Deploy"**
5. תוך דקה תקבל כתובת כמו `family-chores-abc.vercel.app`

### שלב 3: התקנה בטלפון

בכל טלפון (של הילדים וההורים):

**אנדרואיד (Chrome):**
1. פתח את הכתובת ב-Chrome
2. לחץ על ⋮ (שלוש נקודות)
3. לחץ "הוסף למסך הבית"
4. יש אפליקציה! 🎉

**אייפון (Safari):**
1. פתח את הכתובת ב-Safari
2. לחץ על כפתור השיתוף ⬆️
3. לחץ "הוסף למסך הבית"
4. יש אפליקציה! 🎉

## 🔑 סיסמאות ברירת מחדל

| משתמש | סיסמה |
|--------|--------|
| לירון  | 1234   |
| עומרי  | 1234   |
| פלג    | 1111   |
| יהב    | 2222   |
| יהל    | 3333   |

ההורים יכולים לשנות סיסמאות דרך ⚙️ ניהול → 🔒

## 📱 פיצ'רים

- ✅ משימות יומיות עם משקלים (נקודות ואחוזים)
- 🎮 גיימיפיקציה: רמות, XP, streaks, קונפטי
- ⭐ משימות יזומות של הילדים
- 🔄 החלפת משימות בין ילדים
- 🎯 יעדים משפחתיים עם פרסים
- ⏰ תזכורות לפי שעה
- 📷 תמונות הוכחה
- 💰 חישוב כסף אוטומטי (פלג 110₪, יהב 75₪)
- 🔒 כניסה עם סיסמה לכל משתמש
- 🏠 מסך בית חכם

## 🔄 עדכונים

כל שינוי שתעשה בקוד ותעלה ל-GitHub יתעדכן אוטומטית ב-Vercel תוך ~30 שניות.

```bash
# אחרי שינוי בקוד:
git add .
git commit -m "שיפור כלשהו"
git push
# → Vercel מעדכן אוטומטית!
```

## 🔥 שדרוג עתידי: Firebase (סנכרון בזמן אמת)

כרגע המידע שמור בכל טלפון בנפרד (localStorage).
כדי שכל הטלפונים יהיו מסונכרנים:

1. צור פרויקט ב-[Firebase Console](https://console.firebase.google.com)
2. הפעל Firestore Database
3. החלף את הקובץ `src/storage.js` בגרסת Firebase (ראה `src/storage.firebase.js`)
4. הוסף את הקונפיגורציה שלך

## 🛠️ פיתוח מקומי

```bash
npm install
npm run dev
# → http://localhost:5173
```

## 📂 מבנה הפרויקט

```
family-chores/
├── public/
│   ├── icon-192.png      # אייקון PWA
│   └── icon-512.png      # אייקון PWA
├── src/
│   ├── main.jsx          # נקודת כניסה
│   ├── App.jsx           # הקומפוננטה הראשית
│   ├── storage.js        # שכבת אחסון (localStorage)
│   └── storage.firebase.js  # שכבת אחסון (Firebase - עתידי)
├── index.html
├── vite.config.js        # הגדרות Vite + PWA
├── package.json
└── README.md
```
