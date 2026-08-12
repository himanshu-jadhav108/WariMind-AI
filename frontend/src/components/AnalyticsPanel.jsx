const RISK_STYLE = {
  LOW: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  MEDIUM: 'bg-amber-50 border-amber-200 text-amber-900',
  HIGH: 'bg-orange-50 border-orange-200 text-orange-900',
  CRITICAL: 'bg-red-50 border-red-200 text-red-900',
}

const COMPASS_ARROWS = {
  N: '↑', NE: '↗', E: '→', SE: '↘', S: '↓', SW: '↙', W: '←', NW: '↖', STATIONARY: '•',
}

export default function AnalyticsPanel({ analytics, risk }) {
  const count = analytics?.people_count ?? 0
  const density = analytics?.density_score ?? 0
  const flow = analytics?.flow
  const trend = analytics?.trend
  const riskLevel = risk?.level || 'LOW'
  const riskScore = risk?.score ?? 0

  const riskCardStyle = RISK_STYLE[riskLevel] || RISK_STYLE.LOW

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* People Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Total People Detected
        </div>
        <div className="text-3xl font-bold text-slate-900 tracking-tight">{count}</div>
        <div className="text-xs text-slate-400 mt-0.5">Across monitored route</div>
      </div>

      {/* Density Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Crowd Density
        </div>
        <div className="text-3xl font-bold text-slate-900 tracking-tight">
          {typeof density === 'number' ? density.toFixed(0) : density} <span className="text-sm font-normal text-slate-500">/ 100</span>
        </div>
        <div className="text-xs font-medium text-amber-700 mt-0.5">Busiest: Zone B</div>
      </div>

      {/* Flow Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Crowd Flow & Trend
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
          <span className="text-blue-600 font-normal text-3xl">{COMPASS_ARROWS[flow?.direction] || '↗'}</span>
          <span>{flow?.direction || 'NE'}</span>
        </div>
        <div className="text-xs text-slate-500 mt-0.5 font-medium">
          {trend ? `↑ ${trend.trend || 'INCREASING'} (${trend.growth_pct || 18}%)` : '↑ INCREASING (+18%)'}
        </div>
      </div>

      {/* Risk Card */}
      <div className={`rounded-xl border p-3.5 shadow-sm transition-all ${riskCardStyle}`}>
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-1 opacity-80">
          Predictive Risk
        </div>
        <div className="text-3xl font-bold tracking-tight">
          {riskScore} <span className="text-sm font-normal opacity-80">/ 100</span>
        </div>
        <div className="text-xs font-bold mt-0.5 tracking-wide">
          LEVEL: {riskLevel}
        </div>
      </div>
    </div>
  )
}
