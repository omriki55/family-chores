export default function WeeklyProgressChart({ dailyData, DS, FAMILY, CH }) {
  const W = 280, H = 140, padL = 28, padR = 10, padT = 12, padB = 22;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto"}}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => {
        const y = padT + plotH - (v / 100) * plotH;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray={v > 0 && v < 100 ? "3,3" : "none"}/>
            <text x={padL - 4} y={y + 3} textAnchor="end" fontSize={7} fill="#94a3b8">{v}</text>
          </g>
        );
      })}
      {/* Day labels */}
      {DS.slice(0, 7).map((day, i) => {
        const x = padL + (i / 6) * plotW;
        return <text key={i} x={x} y={H - 4} textAnchor="middle" fontSize={8} fill="#94a3b8">{day}</text>;
      })}
      {/* Area + Lines for each child */}
      {CH.map(cid => {
        const pts = (dailyData[cid] || []).map((pct, i) => ({
          x: padL + (i / 6) * plotW,
          y: padT + plotH - (pct / 100) * plotH,
        }));
        if (pts.length === 0) return null;
        const linePoints = pts.map(p => `${p.x},${p.y}`).join(' ');
        const areaPath = `M ${pts[0].x},${padT + plotH} ` + pts.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${pts[pts.length - 1].x},${padT + plotH} Z`;
        const col = FAMILY[cid]?.color || '#6366f1';
        return (
          <g key={cid}>
            <path d={areaPath} fill={col} opacity={0.08}/>
            <polyline points={linePoints} fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill="#fff" stroke={col} strokeWidth={1.5}/>)}
          </g>
        );
      })}
      {/* Legend */}
      {CH.map((cid, i) => (
        <g key={cid}>
          <circle cx={padL + i * 60} cy={6} r={4} fill={FAMILY[cid]?.color || '#6366f1'}/>
          <text x={padL + i * 60 + 7} y={9} fontSize={8} fill="#64748b">{FAMILY[cid]?.name?.slice(0, 5)}</text>
        </g>
      ))}
    </svg>
  );
}
