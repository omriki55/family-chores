export default function BadgeEarned({show,badge}){
  if(!show||!badge)return null;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2002}}>
    <div style={{textAlign:"center",animation:"levelPop 0.5s ease"}}>
      <div style={{fontSize:72,marginBottom:8,animation:"levelBounce 1s ease infinite"}}>{badge.emoji}</div>
      <div style={{fontSize:20,fontWeight:800,color:"#f59e0b",marginBottom:4}}>תג חדש!</div>
      <div style={{fontSize:16,color:"var(--border)"}}>{badge.title}</div>
      <div style={{fontSize:12,color:"var(--textSec)",marginTop:4}}>{badge.desc}</div>
    </div>
  </div>);
}
