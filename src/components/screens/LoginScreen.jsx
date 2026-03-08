import { useState } from 'react';
import { FAMILY, CH, FAMILY_NAME } from '../../constants.js';

const _dynConfig=(()=>{try{return JSON.parse(localStorage.getItem('family-chores_family-config')||'{}');}catch{return {};}})();
const DISPLAY_NAME=_dynConfig.familyName||FAMILY_NAME||'המשפחה שלנו';
const FAMILY_CODE=_dynConfig.familyId||null;

export default function LoginScreen({S,getLevel,setPinScreen,setPinInput,setPinError,onReset}){
  const[showCode,setShowCode]=useState(false);
  const[dark,setDark]=useState(()=>localStorage.getItem('family-chores-dark')==='1');
  const toggleDark=()=>{const nd=!dark;setDark(nd);document.documentElement.setAttribute('data-theme',nd?'dark':'light');localStorage.setItem('family-chores-dark',nd?'1':'0');};
  const copyCode=()=>{if(!FAMILY_CODE)return;navigator.clipboard?.writeText(FAMILY_CODE).then(()=>{}).catch(()=>{});};
  return(
    <div style={S.lw}><div style={S.lc}>
      <div style={{fontSize:44,marginBottom:4}}>🏠</div>
      <h1 style={{fontSize:20,fontWeight:800,color:"var(--text)",margin:"0 0 2px"}}>{DISPLAY_NAME}</h1>
      <p style={{fontSize:11,color:"var(--textSec)",margin:"0 0 18px"}}>משימות • גיימיפיקציה • יעדים משפחתיים</p>
      <div style={S.ug}>{Object.entries(FAMILY).map(([id,m])=>{
        const lvl=CH.includes(id)?getLevel(id):null;
        return(
          <button key={id} onClick={()=>{setPinScreen(id);setPinInput("");setPinError(false);}}
            style={{...S.ub,borderColor:m.color+"40",background:`linear-gradient(135deg,${m.color}10,${m.color}05)`,position:"relative"}}>
            <span style={{fontSize:13,fontWeight:700,color:m.color}}>{m.name}</span>
            {lvl&&<span style={{fontSize:9,color:"var(--textSec)"}}>{lvl.emoji} {lvl.name}</span>}
            <span style={{fontSize:9,color:"var(--textTer)"}}>{m.role==="parent"?"🔑 הורה":m.weeklyPay>0?`${m.weeklyPay}₪`:""}</span>
          </button>
        );})}</div>
      {FAMILY_CODE&&(
        <div style={{marginTop:14,textAlign:'center'}}>
          <button onClick={()=>setShowCode(!showCode)}
            style={{background:'none',border:'none',fontSize:10,color:'#6366f1',cursor:'pointer',fontWeight:600}}>
            {showCode?'🙈 הסתר קוד שיתוף':'🔗 קוד שיתוף למשפחה'}
          </button>
          {showCode&&(
            <div style={{marginTop:8,background:'#f0fdf4',border:'1.5px solid #86efac',borderRadius:12,padding:'10px 14px'}}>
              <div style={{fontSize:10,color:'#16a34a',marginBottom:4,fontWeight:600}}>שתפו קוד זה כדי לצרף מכשיר נוסף:</div>
              <div onClick={copyCode}
                style={{fontSize:22,fontWeight:800,letterSpacing:6,color:'#1e293b',fontFamily:'monospace',
                  cursor:'pointer',background:'#fff',borderRadius:8,padding:'6px 12px',border:'1px solid #e2e8f0',
                  display:'inline-block'}}>
                {FAMILY_CODE}
              </div>
              <div style={{fontSize:9,color:'#94a3b8',marginTop:4}}>לחצו להעתקה</div>
            </div>
          )}
        </div>
      )}
      <div style={{marginTop:12,display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
        <button onClick={toggleDark} style={{background:'none',border:'none',fontSize:14,cursor:'pointer',padding:4}} aria-label="מצב כהה/בהיר">{dark?'☀️':'🌙'}</button>
        <span style={{fontSize:9,color:"var(--textQuat)"}}>🔒 כניסה מאובטחת</span>
        {onReset&&<button onClick={onReset} style={{background:'none',border:'none',fontSize:9,color:'#94a3b8',cursor:'pointer',textDecoration:'underline'}}>⚙️ הגדר מחדש</button>}
      </div>
    </div></div>
  );
}
