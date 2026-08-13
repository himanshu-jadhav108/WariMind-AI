import { Map, Compass, Activity, ShieldAlert, Crosshair, HeartPulse, UserCheck, MapPin } from 'lucide-react'

export default function DigitalTwin({ zoneDensity, recommendation }) {
  const zones = zoneDensity || {
    'ZONE A': { count: 8, level: 'LOW' },
    'ZONE B': { count: 68, level: 'HIGH' },
    'ZONE C': { count: 22, level: 'LOW' },
    'ZONE D': { count: 78, level: 'HIGH' },
  }

  const isZoneBHigh = zones['ZONE B']?.level === 'HIGH' || zones['ZONE B']?.level === 'CRITICAL'
  const isZoneDHigh = zones['ZONE D']?.level === 'HIGH' || zones['ZONE D']?.level === 'CRITICAL'

  const zoneColorMap = {
    LOW: { fill: 'bg-emerald-50/90', border: 'border-emerald-300', text: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-800' },
    MEDIUM: { fill: 'bg-amber-50/90', border: 'border-amber-300', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-800' },
    HIGH: { fill: 'bg-red-50', border: 'border-red-500', text: 'text-red-950', badge: 'bg-red-200 text-red-900 font-bold' },
    CRITICAL: { fill: 'bg-red-100', border: 'border-red-600', text: 'text-red-950', badge: 'bg-red-300 text-red-950 font-bold' },
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-blue-600" />
          <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">
            DIGITAL TWIN ROUTE MAP
          </h2>
        </div>
        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5 font-mono">
          <Compass className="w-3.5 h-3.5 text-blue-600" /> WARI ROUTE CORRIDOR
        </span>
      </div>

      {/* 2D Operational Route Map Canvas */}
      <div className="relative aspect-video bg-slate-50 rounded-xl overflow-hidden border border-slate-200 p-4 flex flex-col justify-between shadow-inner">
        {/* Visual Wari Pilgrimage Route Path Geometry */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-blue-300/60" strokeWidth="4" strokeDasharray="8 4" fill="none">
          <path d="M 60,70 C 200,70 250,150 480,150 C 700,150 780,90 920,90" />
        </svg>

        {/* Spatial Map Header */}
        <div className="relative z-10 flex justify-between items-center text-xs font-semibold">
          <span className="bg-white/95 backdrop-blur-xs px-3 py-1 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1.5 text-slate-700">
            <Activity className="w-3.5 h-3.5 text-emerald-600" /> 2D Spatial Route Geometry
          </span>
          <span className="bg-white/95 backdrop-blur-xs px-3 py-1 rounded-lg border border-slate-200 shadow-2xs font-mono text-[11px] text-slate-600">
            PANDHARPUR CORRIDOR • SECTORS 1-4
          </span>
        </div>

        {/* 4 Connected Wari Route Zones */}
        <div className="relative z-10 grid grid-cols-4 gap-3 my-auto">
          {['ZONE A', 'ZONE B', 'ZONE C', 'ZONE D'].map((name) => {
            const data = zones[name] || { count: 0, level: 'LOW' }
            const style = zoneColorMap[data.level] || zoneColorMap.LOW
            const isHigh = name === 'ZONE B' && isZoneBHigh

            return (
              <div
                key={name}
                className={`p-3 rounded-xl border transition-all duration-300 relative flex flex-col justify-between ${style.fill} ${style.border} ${
                  isHigh ? 'ring-2 ring-red-500 shadow-md animate-pulse' : 'shadow-2xs'
                }`}
              >
                {/* High Risk Pulsing Badge */}
                {isHigh && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 whitespace-nowrap">
                    <ShieldAlert className="w-2.5 h-2.5" /> HIGH-RISK ZONE
                  </div>
                )}

                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800">{name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${style.badge}`}>
                    {data.level}
                  </span>
                </div>

                <div className="text-xl font-black text-slate-900 font-mono tracking-tight my-1">
                  {data.count} <span className="text-xs font-normal text-slate-500">people</span>
                </div>

                {/* Zone Flow Vector */}
                <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1 text-blue-700 text-[10px]">
                    <Compass className="w-3 h-3 text-blue-600" /> ↗ NE Flow
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Support Markers Bar (Medical, Volunteer, Incident Marker) */}
        <div className="relative z-10 flex flex-wrap items-center justify-between text-xs bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-2xs gap-2">
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-700">
            <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-600" /> 🏥 Medical Point
            </span>
            <span className="flex items-center gap-1 text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" /> 👤 Volunteer Point
            </span>
          </div>

          {isZoneBHigh ? (
            <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-300 flex items-center gap-1.5 animate-pulse">
              <MapPin className="w-3.5 h-3.5 text-red-600" /> 📍 INCIDENT MARKER: ZONE B
            </span>
          ) : (
            <span className="text-[10px] font-medium text-slate-400">
              Operational Status: Route Clear
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 text-[11px] text-slate-500 text-center font-medium">
        DIGITAL TWIN • Real-time Spatial Route & Crowd Location Visualizer
      </div>
    </div>
  )
}

