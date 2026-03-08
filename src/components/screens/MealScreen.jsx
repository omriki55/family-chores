import { useState } from 'react';
import { FAMILY } from '../../constants.js';

const DAYS_HE = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const SLOTS = [{id:'breakfast',label:'🌅 בוקר'},{id:'lunch',label:'☀️ צהריים'},{id:'dinner',label:'🌙 ערב'}];

const DEFAULT_RECIPES = [
  {id:'r1',title:'פסטה ברוטב עגבניות',icon:'🍝',time:25,servings:4,ingredients:['פסטה 500g','רוטב עגבניות','שום 3 שיניים','שמן זית','בזיליקום']},
  {id:'r2',title:'שניצל עוף',icon:'🍗',time:30,servings:4,ingredients:['חזה עוף 1kg','פירורי לחם','ביצים 2','שמן לטיגון','מלח ופלפל']},
  {id:'r3',title:'אורז עם ירקות',icon:'🍚',time:20,servings:4,ingredients:['אורז 2 כוסות','גזר 2','פלפל 1','בצל 1','שמן זית','מלח']},
  {id:'r4',title:'סלט ירקות',icon:'🥗',time:10,servings:4,ingredients:['עגבניות 3','מלפפון 2','פלפל 1','בצל סגול','שמן זית','לימון','מלח']},
  {id:'r5',title:'ביצים מקושקשות',icon:'🍳',time:10,servings:2,ingredients:['ביצים 4','חמאה','מלח','פלפל']},
  {id:'r6',title:'פיתה עם חומוס',icon:'🫓',time:5,servings:2,ingredients:['פיתה 4','חומוס מוכן','עגבניה 1','מלפפון 1']},
  {id:'r7',title:'מרק עוף',icon:'🍲',time:60,servings:6,ingredients:['עוף שלם 1','גזר 3','סלרי 2','בצל 1','פטרוזיליה','מלח','פלפל']},
  {id:'r8',title:'שקשוקה',icon:'🥚',time:20,servings:3,ingredients:['ביצים 5','עגבניות מרוסקות','פלפל אדום','בצל 1','שום 2 שיניים','פפריקה','כמון']},
  {id:'r9',title:'פלאפל ופיתה',icon:'🧆',time:30,servings:4,ingredients:['פלאפל קפוא/טרי','פיתות 4','טחינה','חסה','עגבניה','חמוצים']},
  {id:'r10',title:'לחמנייה עם גבינה',icon:'🥪',time:5,servings:2,ingredients:['לחמניות 4','גבינה צהובה','חמאה','עגבניה']},
  {id:'r11',title:'דג בתנור',icon:'🐟',time:35,servings:4,ingredients:['פילה דג 4','לימון 2','שום 4 שיניים','שמן זית','פטרוזיליה','מלח']},
  {id:'r12',title:'תפוחי אדמה אפויים',icon:'🥔',time:50,servings:4,ingredients:['תפוחי אדמה גדולים 4','שמן זית','מלח גס','רוזמרין']},
  {id:'r13',title:'גרנולה ויוגורט',icon:'🥣',time:5,servings:2,ingredients:['יוגורט 2 כוסות','גרנולה','דבש','פירות עונתיים']},
  {id:'r14',title:'טוסט גבינה',icon:'🍞',time:8,servings:2,ingredients:['לחם 4 פרוסות','גבינה צהובה','חמאה']},
  {id:'r15',title:'עוגיות שוקולד',icon:'🍪',time:30,servings:24,ingredients:['קמח 2 כוסות','שוקולד צ\'יפס','ביצה 1','חמאה 100g','סוכר','וניל']},
];

export default function MealScreen({ S, app }) {
  const { isP, groceries, setGroceries, save, flash } = app;
  const [sub, setSub] = useState('plan');
  const [mealPlan, setMealPlanLocal] = useState(() => {
    try { return JSON.parse(localStorage.getItem('family-meals') || '{}'); } catch { return {}; }
  });
  const [recipes, setRecipesLocal] = useState(() => {
    try { return JSON.parse(localStorage.getItem('family-recipes') || 'null') || DEFAULT_RECIPES; } catch { return DEFAULT_RECIPES; }
  });
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ title: '', icon: '🍽️', time: 20, servings: 4, ingredients: [''] });
  const [selRecipe, setSelRecipe] = useState(null);
  const [pickSlot, setPickSlot] = useState(null); // {day,slot}

  const savePlan = (p) => { setMealPlanLocal(p); localStorage.setItem('family-meals', JSON.stringify(p)); };
  const saveRec = (r) => { setRecipesLocal(r); localStorage.setItem('family-recipes', JSON.stringify(r)); };

  const setMeal = (day, slot, recipeId) => {
    const k = `${day}_${slot}`;
    const np = recipeId ? { ...mealPlan, [k]: recipeId } : { ...mealPlan };
    if (!recipeId) delete np[k];
    savePlan(np);
    setPickSlot(null);
  };

  const getMeal = (day, slot) => {
    const rid = mealPlan[`${day}_${slot}`];
    return rid ? recipes.find(r => r.id === rid) : null;
  };

  const generateGroceryList = () => {
    const needed = {};
    Object.values(mealPlan).forEach(rid => {
      const rec = recipes.find(r => r.id === rid);
      if (rec) rec.ingredients.forEach(ing => { needed[ing] = true; });
    });
    const existing = new Set(groceries.map(g => g.title.toLowerCase()));
    const toAdd = Object.keys(needed).filter(ing => !existing.has(ing.toLowerCase()));
    if (toAdd.length === 0) { flash('✅ כל המצרכים כבר ברשימת הקניות!'); return; }
    const ng = [...groceries, ...toAdd.map(ing => ({
      id: 'gr_' + Date.now() + Math.random(),
      title: ing, category: 'other', bought: false, recurring: false, addedBy: 'meal', ts: Date.now()
    }))];
    setGroceries(ng);
    save({ groceries: ng });
    flash(`🛒 נוספו ${toAdd.length} מצרכים לקניות!`);
  };

  const addRecipe = () => {
    if (!newRecipe.title.trim()) { flash('⚠️ חסר שם מתכון'); return; }
    const r = { ...newRecipe, id: 'r_' + Date.now(), ingredients: newRecipe.ingredients.filter(i => i.trim()) };
    saveRec([...recipes, r]);
    setShowAddRecipe(false);
    setNewRecipe({ title: '', icon: '🍽️', time: 20, servings: 4, ingredients: [''] });
    flash('📖 מתכון נוסף!');
  };

  const deleteRecipe = (rid) => {
    saveRec(recipes.filter(r => r.id !== rid));
    const np = { ...mealPlan };
    Object.keys(np).forEach(k => { if (np[k] === rid) delete np[k]; });
    savePlan(np);
    setSelRecipe(null);
    flash('🗑️');
  };

  const mealCount = Object.keys(mealPlan).length;
  const plannedIngredients = new Set();
  Object.values(mealPlan).forEach(rid => {
    const rec = recipes.find(r => r.id === rid);
    if (rec) rec.ingredients.forEach(i => plannedIngredients.add(i));
  });
  const existingIngredients = new Set(groceries.map(g => g.title.toLowerCase()));
  const missingCount = [...plannedIngredients].filter(i => !existingIngredients.has(i.toLowerCase())).length;

  const ICONS = ['🍝','🍗','🥗','🍳','🫓','🍲','🥚','🧆','🥪','🐟','🥔','🥣','🍞','🍕','🌮','🥙','🍜','🍛','🥘','🍠','🫔','🥞','🧇','🍽️'];

  return (
    <div>
      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
        {[{id:'plan',l:'📅 תפריט שבועי'},{id:'recipes',l:'📖 מתכונים'},{id:'shopping',l:'🛒 לקניות'}].map(t => (
          <button key={t.id} onClick={() => setSub(t.id)} style={{
            padding: '6px 12px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
            background: sub === t.id ? '#6366f1' : 'var(--barBg)', color: sub === t.id ? '#fff' : 'var(--textTer)'
          }}>{t.l}</button>
        ))}
      </div>

      {/* ── תפריט שבועי ── */}
      {sub === 'plan' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--textSec)' }}>{mealCount} ארוחות מתוכננות</span>
            {isP && mealCount > 0 && missingCount > 0 && (
              <button onClick={generateGroceryList} style={{ padding: '5px 10px', background: '#10b981', border: 'none', borderRadius: 8, color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                🛒 הוסף {missingCount} מצרכים חסרים
              </button>
            )}
          </div>
          {DAYS_HE.map((day, di) => (
            <div key={di} style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 8, overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg,#6366f110,#8b5cf610)', padding: '7px 12px', fontWeight: 800, fontSize: 12, color: '#6366f1', borderBottom: '1px solid var(--border)' }}>{day}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                {SLOTS.map(slot => {
                  const meal = getMeal(di, slot.id);
                  return (
                    <button key={slot.id} onClick={() => isP && setPickSlot({ day: di, slot: slot.id })}
                      style={{ padding: '8px 6px', background: meal ? '#f0fdf4' : 'var(--inputBg)', border: 'none', borderRight: '1px solid var(--border)', cursor: isP ? 'pointer' : 'default', textAlign: 'center', minHeight: 60 }}>
                      <div style={{ fontSize: 9, color: 'var(--textTer)', marginBottom: 3 }}>{slot.label}</div>
                      {meal ? (
                        <div>
                          <div style={{ fontSize: 16 }}>{meal.icon}</div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: '#059669', lineHeight: 1.2 }}>{meal.title}</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 16, color: 'var(--border)' }}>{isP ? '+' : '—'}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── מתכונים ── */}
      {sub === 'recipes' && (
        <div>
          {isP && (
            <button onClick={() => setShowAddRecipe(true)} style={{ width: '100%', padding: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>
              + הוסף מתכון
            </button>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {recipes.map(rec => (
              <button key={rec.id} onClick={() => setSelRecipe(rec)}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 8px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 28 }}>{rec.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{rec.title}</div>
                <div style={{ fontSize: 9, color: 'var(--textTer)' }}>⏱ {rec.time} דק' • 🍽 {rec.servings}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── לקניות ── */}
      {sub === 'shopping' && (
        <div>
          <div style={{ background: 'var(--card)', borderRadius: 12, padding: 14, border: '1px solid var(--border)', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>📋 מצרכים נדרשים לשבוע</div>
            {plannedIngredients.size === 0 ? (
              <div style={{ color: 'var(--textSec)', fontSize: 11, textAlign: 'center', padding: '20px 0' }}>תכנן/י ארוחות בטאב "תפריט שבועי" כדי לראות מה צריך לקנות</div>
            ) : (
              [...plannedIngredients].map((ing, i) => {
                const have = existingIngredients.has(ing.toLowerCase());
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, color: have ? 'var(--textTer)' : 'var(--text)', textDecoration: have ? 'line-through' : 'none' }}>{ing}</span>
                    <span style={{ fontSize: 10 }}>{have ? '✅' : '🔴'}</span>
                  </div>
                );
              })
            )}
          </div>
          {isP && missingCount > 0 && (
            <button onClick={generateGroceryList} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              🛒 הוסף {missingCount} חסרים לרשימת הקניות
            </button>
          )}
        </div>
      )}

      {/* Pick recipe for slot */}
      {pickSlot && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', display: 'flex', alignItems: 'flex-end', zIndex: 999 }} onClick={() => setPickSlot(null)}>
          <div style={{ background: 'var(--card)', borderRadius: '20px 20px 0 0', width: '100%', padding: 16, maxHeight: '70vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 10, textAlign: 'center' }}>
              {DAYS_HE[pickSlot.day]} — {SLOTS.find(s => s.id === pickSlot.slot)?.label}
            </div>
            <button onClick={() => setMeal(pickSlot.day, pickSlot.slot, null)}
              style={{ width: '100%', padding: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#ef4444', fontSize: 11, fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}>
              🗑️ הסר ארוחה
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {recipes.map(rec => (
                <button key={rec.id} onClick={() => setMeal(pickSlot.day, pickSlot.slot, rec.id)}
                  style={{ padding: '10px 8px', background: mealPlan[`${pickSlot.day}_${pickSlot.slot}`] === rec.id ? '#ede9fe' : 'var(--barBg)', border: mealPlan[`${pickSlot.day}_${pickSlot.slot}`] === rec.id ? '2px solid #6366f1' : '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 22 }}>{rec.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{rec.title}</div>
                  <div style={{ fontSize: 9, color: 'var(--textTer)' }}>{rec.time} דק'</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recipe detail modal */}
      {selRecipe && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 }} onClick={() => setSelRecipe(null)}>
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: 18, width: '100%', maxWidth: 320, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 48 }}>{selRecipe.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{selRecipe.title}</div>
              <div style={{ fontSize: 10, color: 'var(--textSec)', marginTop: 4 }}>⏱ {selRecipe.time} דק' • 🍽 {selRecipe.servings} מנות</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>🧺 מצרכים:</div>
            {selRecipe.ingredients.map((ing, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--textSec)', padding: '3px 0', borderBottom: '1px solid var(--border)' }}>• {ing}</div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {isP && <button onClick={() => deleteRecipe(selRecipe.id)} style={{ flex: 1, padding: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>🗑️ מחק</button>}
              <button onClick={() => setSelRecipe(null)} style={{ flex: 1, padding: 8, background: 'var(--barBg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 11, cursor: 'pointer' }}>סגור</button>
            </div>
          </div>
        </div>
      )}

      {/* Add recipe modal */}
      {showAddRecipe && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 }} onClick={() => setShowAddRecipe(false)}>
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: 18, width: '100%', maxWidth: 320, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', textAlign: 'center', marginBottom: 12 }}>📖 מתכון חדש</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setNewRecipe(r => ({ ...r, icon: ic }))} style={{ width: 32, height: 32, borderRadius: 8, border: newRecipe.icon === ic ? '2px solid #6366f1' : '1px solid var(--border)', background: newRecipe.icon === ic ? '#ede9fe' : 'var(--barBg)', fontSize: 16, cursor: 'pointer' }}>{ic}</button>
              ))}
            </div>
            <input placeholder="שם המתכון" value={newRecipe.title} onChange={e => setNewRecipe(r => ({ ...r, title: e.target.value }))} style={{ ...S.inp }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'var(--textSec)', marginBottom: 3 }}>⏱ זמן הכנה (דק')</div>
                <input type="number" min="1" max="300" value={newRecipe.time} onChange={e => setNewRecipe(r => ({ ...r, time: +e.target.value }))} style={{ ...S.inp, marginBottom: 0 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: 'var(--textSec)', marginBottom: 3 }}>🍽 מנות</div>
                <input type="number" min="1" max="20" value={newRecipe.servings} onChange={e => setNewRecipe(r => ({ ...r, servings: +e.target.value }))} style={{ ...S.inp, marginBottom: 0 }} />
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>🧺 מצרכים:</div>
            {newRecipe.ingredients.map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                <input placeholder={`מצרך ${i + 1}`} value={ing} onChange={e => {
                  const ni = [...newRecipe.ingredients]; ni[i] = e.target.value;
                  setNewRecipe(r => ({ ...r, ingredients: ni }));
                }} style={{ ...S.inp, marginBottom: 0, flex: 1 }} />
                {i === newRecipe.ingredients.length - 1 ? (
                  <button onClick={() => setNewRecipe(r => ({ ...r, ingredients: [...r.ingredients, ''] }))} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: '#6366f1', color: '#fff', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>+</button>
                ) : (
                  <button onClick={() => setNewRecipe(r => ({ ...r, ingredients: r.ingredients.filter((_, ii) => ii !== i) }))} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: '#fee2e2', color: '#ef4444', fontSize: 14, cursor: 'pointer', flexShrink: 0 }}>×</button>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={addRecipe} style={{ flex: 1, padding: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✅ שמור</button>
              <button onClick={() => setShowAddRecipe(false)} style={{ flex: 1, padding: 8, background: 'var(--barBg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, cursor: 'pointer' }}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
