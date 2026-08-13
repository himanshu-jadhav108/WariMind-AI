import { Users, BarChart3, Compass, ShieldAlert, TrendingUp, ArrowUpRight } from 'lucide-react'

export default function AnalyticsPanel({ analytics, risk }) {
  const peopleCount = analytics?.people_count ?? 127
  const densityScore = analytics?.density_score ?? 68
  const densityLevel = analytics?.zone_density?.['ZONE B']?.level || 'HIGH'
  const flowDir = analytics?.flow?.direction || 'NE'
  const flowConcentration = (analytics?.flow?.concentration ? Math.round(analytics.flow.concentration * 100) : 78)
  const riskScore = risk?.score ?? 82
  const riskLevel = risk?.level ?? 'HIGH'

  const riskBadgeStyle = {
    LOW: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-800 border-amber-200',
    HIGH: 'bg-red-50 text-red-800 border-red-300 font-bold',
    CRITICAL: 'bg-red-100 text-red-900 border-red-400 font-bold animate-pulse',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. People Detected */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">PEOPLE DETECTED</span>
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">{peopleCount}</div>
        <div className="mt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-emerald-600" />
          <span>↑ 12% in last interval</span>
        </div>
      </div>

      {/* 2. Crowd Density */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">CROWD DENSITY</span>
          <BarChart3 className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-3xl font-black text-amber-600 tracking-tight">{densityLevel}</div>
        <div className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
          <span>Density Index: {densityScore}/100</span>
          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">Zone B Peak</span>
        </div>
      </div>

      {/* 3. Flow Direction */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">FLOW DIRECTION</span>
          <Compass className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-1">
          <ArrowUpRight className="w-7 h-7 text-blue-600 stroke-[3]" /> ↗ {flowDir}
        </div>
        <div className="mt-2 text-[11px] font-semibold text-slate-500">
          Concentration: <strong className="text-slate-800">{flowConcentration}% directional convergence</strong>
        </div>
      </div>

      {/* 4. Risk Score */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">PREDICTIVE RISK</span>
          <ShieldAlert className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">{riskScore} <span className="text-sm font-normal text-slate-400">/ 100</span></div>
          <span className={`text-xs px-2 py-0.5 rounded-md border ${riskBadgeStyle[riskLevel] || riskBadgeStyle.HIGH}`}>
            {riskLevel}
          </span>
        </div>
        <div className="mt-2 text-[11px] font-semibold text-red-700 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-red-600" />
          <span>↑ 14% escalation in last 30s</span>
        </div>
      </div>
    </div>
  )
}
