import { HelpCircle, Info, Sliders, ShieldAlert } from 'lucide-react'

export default function RiskExplainabilityPanel({ risk }) {
  const components = risk?.components || risk?.breakdown || {
    density: 82,
    density_growth: 70,
    flow_concentration: 78,
    capacity_utilization: 88,
  }

  const score = risk?.score ?? 82
  const level = risk?.level ?? 'HIGH'

  const items = [
    { label: 'Density', value: components.density ?? 82, desc: 'Zone D & Zone B crowd count relative to threshold' },
    { label: 'Density Growth', value: components.density_growth ?? components.growth ?? 70, desc: 'Rate of crowd accumulation over 60s window' },
    { label: 'Flow Concentration', value: components.flow_concentration ?? components.flow ?? 78, desc: 'Directional vector convergence towards Zone D & Zone B' },
    { label: 'Zone Capacity', value: components.capacity_utilization ?? components.capacity ?? 88, desc: 'Percentage of physical corridor area occupied' },
  ]

  const levelBadge = {
    LOW: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
    HIGH: 'bg-red-100 text-red-900 border-red-300 font-bold',
    CRITICAL: 'bg-red-200 text-red-950 border-red-400 font-bold animate-pulse',
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">
            PREDICTIVE RISK ENGINE
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-0.5 rounded-lg border ${levelBadge[level] || levelBadge.HIGH}`}>
            {level} ({score} / 100)
          </span>
        </div>
      </div>

      {/* WHY IS THIS HIGH RISK? Section */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-3">
        <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-2">
          WHY IS THIS HIGH RISK?
        </span>

        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800">{item.label}</span>
                <span className="font-mono font-bold text-slate-900">{Math.round(item.value)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    item.value > 80 ? 'bg-red-500' : item.value > 60 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, item.value))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Required Wording Label */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span className="flex items-center gap-1.5 text-slate-600">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <strong className="text-slate-900">PROTOTYPE RISK ESTIMATION</strong> — Transparent heuristic score derived from live analytics
        </span>
      </div>
    </div>
  )
}

