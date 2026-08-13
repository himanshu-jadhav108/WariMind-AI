import { Map, Compass, Activity, ShieldAlert, Crosshair, HeartPulse, UserCheck } from 'lucide-react'

export default function DigitalTwin({ zoneDensity, recommendation }) {
  const zones = zoneDensity || {
    'ZONE A': { count: 14, level: 'LOW' },
    'ZONE B': { count: 68, level: 'HIGH' },
    'ZONE C': { count: 32, level: 'MEDIUM' },
    'ZONE D': { count: 12, level: 'LOW' },
  }

  const isZoneBHigh = zones['ZONE B']?.level === 'HIGH' || zones['ZONE B']?.level === 'CRITICAL'

  const zoneColorMap = {
    LOW: { fill: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800' },
    MEDIUM: { fill: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800' },
    HIGH: { fill: 'bg-red-50', border: 'border-red-400', text: 'text-red-900', badge: 'bg-red-200 text-red-900 font-bold' },
    CRITICAL: { fill: 'bg-red-100', border: 'border-red-500', text: 'text-red-900', badge: 'bg-red-300 text-red-950 font-bold' },
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-slate-900 text-sm tracking-tight">DIGITAL TWIN OPERATIONAL ROUTE MAP</h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1">
          <Compass className="w-3 h-3 text-blue-600" /> WARI ROUTE PATH
        </span>
      </div>

      {/* Stylized Operational Route Canvas */}
      <div className="relative aspect-video bg-slate-50 rounded-xl overflow-hidden border border-slate-200 p-4 flex flex-col justify-between shadow-inner">
        {/* SVG Route Line Geometry */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300" strokeWidth="3" strokeDasharray="6 4" fill="none">
          <path d="M 40,60 C 200,60 250,140 450,140 C 650,140 750,80 900,80" />
        </svg>

        {/* Top Header info */}
        <div className="relative z-10 flex justify-between items-start text-xs font-semibold text-slate-600">
          <span className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-600" /> Live Density Grid
          </span>
          <span className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs font-mono">
            SECTOR 1 - 4 CORRIDOR
          </span>
        </div>

        {/* 4 Route Zones Layout */}
        <div className="relative z-10 grid grid-cols-4 gap-3 my-auto">
          {Object.entries(zones).map(([name, data]) => {
            const style = zoneColorMap[data.level] || zoneColorMap.LOW
            const isHigh = name === 'ZONE B' && isZoneBHigh

            return (
              <div
                key={name}
                className={`p-3 rounded-xl border transition-all duration-300 relative ${style.fill} ${style.border} ${
                  isHigh ? 'ring-2 ring-red-400 shadow-md animate-pulse' : 'shadow-2xs'
                }`}
              >
                {/* Zone Label & Status */}
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">{name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${style.badge}`}>
                    {data.level}
                  </span>
                </div>

                <div className="text-xl font-black text-slate-900 font-mono tracking-tight">
                  {data.count} <span className="text-xs font-normal text-slate-500">ppl</span>
                </div>

                {/* Flow direction indicator */}
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span className="flex items-center gap-0.5 text-blue-700">
                    <Compass className="w-3 h-3" /> ↗ NE Flow
                  </span>
                </div>

                {/* High Risk Overlay Label */}
                {isHigh && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 animate-bounce">
                    <ShieldAlert className="w-2.5 h-2.5" /> HIGH-RISK ZONE
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Support Markers Strip (Medical, Volunteer, Incident) */}
        <div className="relative z-10 flex items-center justify-between text-xs bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-700">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-600" /> 🏥 Medical Camp 1
            </span>
            <span className="flex items-center gap-1 text-blue-700 font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" /> 👤 Volunteer Post C
            </span>
          </div>

          {isZoneBHigh && (
            <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-red-600 animate-spin" /> 🔴 Incident Focus: Zone B
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 text-[11px] text-slate-400 text-center font-medium">
        Prototype Digital Twin • 2D Spatial Route Representation
      </div>
    </div>
  )
}
