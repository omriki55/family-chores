export default function XPBarChart({ data, FAMILY, CH }) {
  const max = Math.max(1, ...Object.values(data));
  const W = 280, H = 130, pad = 30;
  const barW = Math.min(36, (W - pad * 2) / CH.length / 1.4);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto"}}>
      {/* Y-axis grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = 10 + (1 - r) * (H - 35);
        return <line key={r} x1={pad - 4} y1={y} x2={W - 10} y2={y} stroke="#e2e8f0" strokeWidth={0.5}/>;
      })}
      {CH.map((cid, i) => {
        const val = data[cid] || 0;
        const barH = max > 0 ? (val / max) * (H - 35) : 0;
        const x = pad + i * (W - pad * 2) / CH.length + (W - pad * 2) / CH.length / 2 - barW / 2;
        const y = H - 20 - barH;
        const col = FAMILY[cid]?.color || '#6366f1';
        return (
          <g key={cid}>
            <defs><linearGradient id={`xpg_${cid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={col} stopOpacity={0.9}/>
              <stop offset="100%" stopColor={col} stopOpacity={0.5}/>
            </linearGradient></defs>
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill={`url(#xpg_${cid})`}/>
            {val > 0 && <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={10} fill={col} fontWeight={700}>{val}</text>}
            <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="#94a3b8" fontWeight={600}>
              {FAMILY[cid]?.name?.slice(0, 5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
