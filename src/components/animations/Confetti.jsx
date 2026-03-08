export default function Confetti({show}){
  if(!show)return null;
  const particles=Array.from({length:30},(_,i)=>({
    id:i,left:Math.random()*100,delay:Math.random()*0.5,dur:1+Math.random()*1.5,
    color:["#f59e0b","#10b981","#6366f1","#ec4899","#8b5cf6","#ef4444"][i%6],
    char:["🎉","⭐","✨","💫","🌟","🎊"][i%6],
  }));
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:2000,overflow:"hidden"}}>
      {particles.map(p=>(
        <div key={p.id} style={{
          position:"absolute",left:`${p.left}%`,top:-20,fontSize:16+Math.random()*12,
          animation:`confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
        }}>{p.char}</div>
      ))}
      <style>{`@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(105vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  );
}
