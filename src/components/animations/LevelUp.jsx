export default function LevelUp({show,level}){
  if(!show||!level)return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2001}}>
      <div style={{textAlign:"center",animation:"levelPop 0.5s ease"}}>
        <div style={{fontSize:72,marginBottom:8,animation:"levelBounce 1s ease infinite"}}>{level.emoji}</div>
        <div style={{fontSize:24,fontWeight:800,color:"#f59e0b",marginBottom:4}}>עלית רמה!</div>
        <div style={{fontSize:18,color:"var(--text)"}}>{level.name}</div>
      </div>
      <style>{`@keyframes levelPop{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}}@keyframes levelBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  );
}
