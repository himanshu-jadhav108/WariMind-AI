export default function RiskExplainabilityPanel({ risk }) {
  const components = risk?.components || {}
  const score = risk?.score ?? 0
  const level = risk?.level || 'LOW'

  const levelColor = {
    LOW: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    MEDIUM: 'text-amber-700 bg-amber-50 border-amber-200',
    HIGH: 'text-orange-700 bg-orange-50 border-orange-200',
    CRITICAL: 'text-red-700 bg-red-50 border-red-200',
  }[level] || 'text-emerald-700 bg-emerald-50 border-emerald-200'

  const barColor = {
    LOW: 'bg-emerald-500',
    MEDIUM: 'bg-amber-500',
    HIGH: 'bg-orange-500',
    CRITICAL: 'bg-red-500',
  }[level] || 'bg-blue-500'

  const items = [
    { label: 'Density (40%)', val: components.density ?? 20 },
    { label: 'Density Growth (25%)', val: components.density_growth ?? 30 },
    { label: 'Flow Concentration (20%)', val: components.flow_concentration ?? 25 },
    { label: 'Zone Capacity (15%)', val: components.capacity_utilization ?? 15 },
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-2">
          <span>PREDICTIVE RISK ENGINE</span>
          <span className="text-xs font-normal text-slate-400">• Explainability Breakdown</span>
        </h2>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${levelColor}`}>
          RISK SCORE: {score} / 100 ({level})
        </span>
      </div>

      <div className="space-y-2.5 mb-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span>{item.label}</span>
              <span className="font-mono">{Math.round(item.val)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.min(100, Math.max(0, item.val))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 leading-tight">
        Prototype Risk Estimation — Heuristic score derived from live vision analytics (weighted formula over density, growth rate, directional flow, and capacity).
      </p>
    </div>
  )
}
