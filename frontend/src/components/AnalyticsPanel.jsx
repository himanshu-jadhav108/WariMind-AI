import { Users, BarChart3, Compass, ShieldAlert, ArrowUpRight } from 'lucide-react'

export default function AnalyticsPanel({ analytics, risk }) {
  const activeDetected = analytics?.active_detected ?? analytics?.people_count ?? 42
  const estimatedCrowd = analytics?.estimated_crowd ?? 327
  const zoneBLevel = analytics?.zone_density?.['ZONE B']?.level || 'HIGH'
  const flowDir = analytics?.flow?.direction || 'NORTH-EAST'
  const displayFlowDir = flowDir === 'NE' ? 'NORTH-EAST' : flowDir
  const riskScore = risk?.score ?? 82
  const riskLevel = risk?.level ?? 'HIGH'

  const densityColor = {
    LOW: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    MEDIUM: 'text-amber-700 bg-amber-50 border-amber-200',
    HIGH: 'text-red-700 bg-red-50 border-red-200 font-bold',
    CRITICAL: 'text-red-800 bg-red-100 border-red-300 font-bold',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. PEOPLE (Active Detected & Estimated Crowd) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">ACTIVE PEOPLE</span>
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">{activeDetected}</div>
          <div className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            ~{estimatedCrowd} EST
          </div>
        </div>
        <div className="mt-2 text-[11px] font-semibold text-slate-500">
          Detected: <strong className="text-emerald-700 font-bold">YOLO11 1280px</strong>
        </div>
      </div>

      {/* 2. DENSITY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">DENSITY</span>
          <BarChart3 className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-3xl font-black text-amber-600 tracking-tight">{zoneBLevel}</div>
        <div className="mt-2 text-[11px] font-semibold text-slate-500">
          Peak Corridor: <strong className="text-slate-800">Zone B</strong>
        </div>
      </div>

      {/* 3. FLOW */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">FLOW</span>
          <Compass className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1">
          <ArrowUpRight className="w-6 h-6 text-blue-600 stroke-[3]" /> ↗ {displayFlowDir}
        </div>
        <div className="mt-2 text-[11px] font-semibold text-slate-500">
          Vector: <strong className="text-slate-800">Corridor Convergence</strong>
        </div>
      </div>

      {/* 4. RISK */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">CROWD RISK</span>
          <ShieldAlert className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
            {riskScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-md border ${densityColor[riskLevel] || densityColor.HIGH}`}>
            {riskLevel}
          </span>
        </div>
        <div className="mt-2 text-[11px] font-semibold text-red-700">
          Engine: <strong className="text-red-700">Heuristic Risk Matrix</strong>
        </div>
      </div>
    </div>
  )
}
