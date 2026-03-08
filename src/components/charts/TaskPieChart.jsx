export default function TaskPieChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{textAlign:"center",padding:12,color:"#94a3b8",fontSize:11}}>אין משימות</div>;
  const R = 44, cx = 60, cy = 56;
  let startAngle = -Math.PI / 2;
  const slices = data.filter(d => d.value > 0).map(d => {
    const angle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const largeArc = angle > Math.PI ? 1 : 0;
    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    // For single-slice (100%), use two arcs
    let path;
    if (data.filter(d => d.value > 0).length === 1) {
      path = `M ${cx + R} ${cy} A ${R} ${R} 0 1 1 ${cx - R} ${cy} A ${R} ${R} 0 1 1 ${cx + R} ${cy} Z`;
    } else {
      path = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }
    const result = { ...d, path, pct: Math.round((d.value / total) * 100) };
    startAngle = endAngle;
    return result;
  });
  return (
    <svg viewBox="0 0 280 120" style={{width:"100%",height:"auto"}}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} opacity={0.85} stroke="#fff" strokeWidth={1}/>
      ))}
      {/* Center text */}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize={16} fontWeight={800} fill="#1e293b">{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={7} fill="#94a3b8">משימות</text>
      {/* Legend */}
      {slices.map((s, i) => (
        <g key={i}>
          <rect x={140} y={16 + i * 26} width={14} height={14} rx={4} fill={s.color} opacity={0.85}/>
          <text x={158} y={26 + i * 26} fontSize={10} fill="#475569" fontWeight={600}>{s.label}</text>
          <text x={158} y={26 + i * 26 + 11} fontSize={8} fill="#94a3b8">{s.value} ({s.pct}%)</text>
        </g>
      ))}
    </svg>
  );
}
