import S from '../../styles.js';
import { FAMILY } from '../../constants.js';

export default function PinScreen({pinScreen,pinInput,setPinInput,pinError,setPinError,setPinScreen,verifyPin}){
  const m=FAMILY[pinScreen];
  return(
    <div style={S.lw}><div style={{...S.lc,maxWidth:320}}>
      <button onClick={()=>{setPinScreen(null);setPinInput("");setPinError(false);}} style={{background:"none",border:"none",color:"var(--textTer)",fontSize:13,cursor:"pointer",marginBottom:6}}>← חזרה</button>
      <div style={{fontSize:18,fontWeight:800,color:m.color,marginBottom:2}}>{m.name}</div>
      <div style={{fontSize:12,color:"var(--textSec)",marginBottom:16}}>סיסמה (4 ספרות)</div>
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
            background:n===null?"transparent":"var(--barBg)",color:n===null?"transparent":"var(--text)",...(n===null?{visibility:"hidden"}:{})}}>{n}</button>
        ))}
      </div>
    </div></div>
  );
}
