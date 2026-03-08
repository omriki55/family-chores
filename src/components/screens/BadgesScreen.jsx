import { FAMILY, DEFAULT_BADGES, PENALTIES } from '../../constants.js';
import { t } from '../../i18n/index.js';

export default function BadgesScreen({ S, app }) {
  const { user, earnedBadges, penalties } = app;

  const myBadges = earnedBadges[user] || [];

  return (
    <>
      <h2 style={S.st}>{t("badges.title")}</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {DEFAULT_BADGES.map(badge=>{const earned=myBadges.some(b=>b.id===badge.id);return(
          <div key={badge.id} style={{background:earned?"linear-gradient(135deg,#fef3c7,#fffbeb)":"var(--inputBg)",borderRadius:12,padding:12,textAlign:"center",
            border:earned?"2px solid #f59e0b":"1px solid var(--border)",opacity:earned?1:0.5}}>
            <div style={{fontSize:28}}>{earned?badge.emoji:"❓"}</div>
            <div style={{fontSize:10,fontWeight:700,color:earned?"#1e293b":"var(--textSec)",marginTop:4}}>{earned?badge.title:"???"}</div>
            {earned&&<div style={{fontSize:8,color:"#f59e0b",marginTop:2}}>{badge.desc}</div>}
          </div>);
        })}
      </div>
      <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"var(--textSec)"}}>{t("badges.unlocked",{count:myBadges.length,total:DEFAULT_BADGES.length})}</div>
      <button onClick={()=>app.setScreen("gallery")} style={{width:"100%",marginTop:10,padding:10,background:"linear-gradient(135deg,#6366f120,#8b5cf620)",border:"1px solid #6366f140",borderRadius:12,color:"#6366f1",fontSize:12,fontWeight:700,cursor:"pointer"}}>
        {t("badges.gallery")}
      </button>
      {(()=>{const myPens=(penalties||[]).filter(p=>p.childId===user).sort((a,b)=>b.ts-a.ts).slice(0,10);
        if(!myPens.length)return null;
        return<>
          <h3 style={{...S.st,marginTop:16}}>{t("badges.penaltyHistory")}</h3>
          {myPens.map((p,i)=>{const pen=PENALTIES.find(x=>x.id===p.penaltyId);return(
            <div key={i} style={{background:"#fff",borderRadius:10,padding:10,marginBottom:5,border:"1px solid #fecaca",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>{pen?.emoji||"⚠️"}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:"#dc2626"}}>{pen?.label||t("badges.penalty")}</div>
                <div style={{fontSize:9,color:"var(--textSec)"}}>{new Date(p.ts).toLocaleDateString("he-IL")}</div>
              </div>
              <span style={{fontSize:12,fontWeight:800,color:"#dc2626"}}>-{pen?.xp||0} XP</span>
            </div>);
          })}</>;
      })()}
    </>
  );
}
