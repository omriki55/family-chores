import { FAMILY, GROCERY_CATEGORIES } from '../../constants.js';
import useVoiceInput from '../../hooks/useVoiceInput.js';

export default function GroceryScreen({ S, app }) {
  const {
    groceries, groceryInput, setGroceryInput, groceryCat, setGroceryCat,
    groceryRecurring, setGroceryRecurring,
    addGroceryItem, toggleGroceryBought, deleteGroceryItem, clearBoughtGroceries,
  } = app;
  const voice = useVoiceInput();

  return (
    <>
      <h2 style={S.st}>🛒 רשימת קניות</h2>
      <div style={{background:"var(--card)",borderRadius:12,padding:10,marginBottom:10,border:"1px solid var(--border)"}}>
        <div style={{display:"flex",gap:6,marginBottom:6}}>
          <input style={{...S.inp,marginBottom:0,flex:1}} placeholder="מוצר חדש..." value={groceryInput}
            onChange={e=>setGroceryInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addGroceryItem();}}/>
          {voice.supported&&<button className={voice.listening?"mic-pulse":""} onClick={()=>voice.toggle((txt,final)=>{if(final)setGroceryInput(txt);})} style={{...S.micBtn,background:voice.listening?"#ef4444":"#6366f115",color:voice.listening?"#fff":"#6366f1"}}>{voice.listening?"⏹️":"🎙️"}</button>}
          <button onClick={addGroceryItem}
            style={{padding:"8px 14px",background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>+ הוסף</button>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:4}}>
          {GROCERY_CATEGORIES.map(c=><button key={c.id} onClick={()=>setGroceryCat(c.id)}
            style={{...S.chip,...(groceryCat===c.id?{borderColor:"#10b981",background:"#10b98115",color:"#10b981"}:{})}}>{c.emoji} {c.name}</button>)}
        </div>
        <button onClick={()=>setGroceryRecurring(!groceryRecurring)}
          style={{padding:"4px 8px",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",
            background:groceryRecurring?"#6366f120":"var(--inputBg)",border:groceryRecurring?"2px solid #6366f1":"1px solid var(--border)",
            color:groceryRecurring?"#6366f1":"var(--textTer)"}}>🔁 מוצר קבוע</button>
      </div>
      {GROCERY_CATEGORIES.filter(cat=>groceries.some(g=>g.category===cat.id)).map(cat=><div key={cat.id} style={{marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:700,color:"var(--text)",marginBottom:4}}>{cat.emoji} {cat.name}</div>
        {groceries.filter(g=>g.category===cat.id).sort((a,b)=>a.bought-b.bought||b.ts-a.ts).map(g=><div key={g.id}
          style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:g.bought?"var(--inputBg)":"#fff",borderRadius:8,marginBottom:2,border:"1px solid var(--border)"}}>
          <button onClick={()=>toggleGroceryBought(g.id)}
            style={{width:22,height:22,borderRadius:6,border:g.bought?"2px solid #10b981":"2px solid #cbd5e1",
              background:g.bought?"#10b981":"transparent",color:"#fff",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {g.bought?"✓":""}</button>
          <span style={{flex:1,fontSize:12,color:g.bought?"#94a3b8":"var(--text)",textDecoration:g.bought?"line-through":"none"}}>{g.title}</span>
          {g.recurring&&<span style={{fontSize:8,color:"#6366f1"}}>🔁</span>}
          <span style={{fontSize:8,color:"#cbd5e1"}}>{FAMILY[g.addedBy]?.name}</span>
          <button onClick={()=>deleteGroceryItem(g.id)} style={{background:"none",border:"none",color:"#ef4444",fontSize:11,cursor:"pointer"}}>🗑</button>
        </div>)}
      </div>)}
      {groceries.length===0&&<div style={{textAlign:"center",padding:30}}><div style={{fontSize:36}}>🛒</div><div style={{color:"var(--textSec)",fontSize:12,marginTop:4}}>הרשימה ריקה</div></div>}
      {groceries.some(g=>g.bought)&&<button onClick={clearBoughtGroceries}
        style={{width:"100%",padding:10,background:"#ef444420",border:"1px solid #ef444440",borderRadius:12,color:"#ef4444",fontSize:12,fontWeight:700,cursor:"pointer",marginTop:8}}>
        🧹 נקה פריטים שנקנו</button>}
      <div style={{textAlign:"center",marginTop:8,fontSize:10,color:"var(--textSec)"}}>{groceries.filter(g=>!g.bought).length} פריטים • {groceries.filter(g=>g.bought).length} נקנו</div>
    </>
  );
}
