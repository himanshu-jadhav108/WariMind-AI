import { HelpCircle, Info, Sliders } from 'lucide-react'

export default function RiskExplainabilityPanel({ risk }) {
  const breakdown = risk?.breakdown || {
    density: 82,
    growth: 70,
    flow: 78,
    capacity: 88,
  }

  const score = risk?.score ?? 82
  const level = risk?.level ?? 'HIGH'

  const items = [
    { label: 'Density Load', value: breakdown.density || 82, desc: 'Zone B crowd density index vs threshold' },
    { label: 'Density Growth Rate', value: breakdown.growth || 70, desc: 'Rate of crowd accumulation over 60s window' },
    { label: 'Flow Concentration', value: breakdown.flow || 78, desc: 'Directional vector convergence towards bottleneck' },
    { label: 'Zone Capacity Usage', value: breakdown.capacity || 88, desc: 'Percentage of physical corridor area occupied' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-slate-900 text-sm tracking-tight">WHY IS THIS RISKY?</h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
          <Sliders className="w-3 h-3 text-slate-500" /> EXPLAINABLE AI MODEL
        </span>
      </div>

      <div className="space-y-3 my-2">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">{item.label}</span>
              <span className="font-mono font-bold text-slate-900">{item.value}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  item.value > 80 ? 'bg-red-500' : item.value > 60 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, item.value))}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-blue-600" />
          Prototype Risk Estimation — Transparent heuristic score derived from live vision analytics.
        </span>
        <span className="font-mono font-bold text-slate-800">Score: {score}/100</span>
      </div>
    </div>
  )
}
