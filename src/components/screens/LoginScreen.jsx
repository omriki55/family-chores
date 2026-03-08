import { FAMILY, CH, FAMILY_NAME } from '../../constants.js';

const _dynName=(()=>{try{const s=localStorage.getItem('family-chores_family-config');return s?JSON.parse(s).familyName:null;}catch{return null;}})();
const DISPLAY_NAME=_dynName||FAMILY_NAME||'המשפחה שלנו';

export default function LoginScreen({S,getLevel,setPinScreen,setPinInput,setPinError,onReset}){
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
      <div style={{marginTop:12,display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
        <span style={{fontSize:9,color:"var(--textQuat)"}}>🔒 כניסה מאובטחת</span>
        {onReset&&<button onClick={onReset} style={{background:'none',border:'none',fontSize:9,color:'#94a3b8',cursor:'pointer',textDecoration:'underline'}}>⚙️ הגדר מחדש</button>}
      </div>
    </div></div>
  );
}
