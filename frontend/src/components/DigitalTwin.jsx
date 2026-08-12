const LEVEL_COLOR = {
  LOW: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  MEDIUM: 'bg-amber-50 text-amber-800 border-amber-300',
  HIGH: 'bg-orange-50 text-orange-800 border-orange-400',
  CRITICAL: 'bg-red-100 text-red-900 border-red-500',
}

const LEVEL_BADGE = {
  LOW: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-400',
  CRITICAL: 'bg-red-200 text-red-900 border-red-500 animate-pulse',
}

export default function DigitalTwin({ zoneDensity, recommendation }) {
  const zones = zoneDensity || {
    'ZONE A': { count: 14, level: 'LOW' },
    'ZONE B': { count: 68, level: 'HIGH' },
    'ZONE C': { count: 32, level: 'MEDIUM' },
    'ZONE D': { count: 12, level: 'LOW' },
  }

  const flaggedZone = recommendation?.triggered ? recommendation.zone : null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-semibold text-slate-900 text-sm tracking-tight">DIGITAL TWIN OPERATIONAL MAP</h2>
          <p className="text-xs text-slate-500">2D Wari Pilgrimage Route • Real-time Zone Analytics</p>
        </div>
        <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
          PROTOTYPE MAP
        </span>
      </div>

      {/* Operational 2D Map Canvas */}
      <div className="relative aspect-video bg-slate-50 rounded-lg overflow-hidden border border-slate-200 p-3">
        {/* SVG Route Line & Direction */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M 10 75 Q 35 25 50 50 T 90 25"
            stroke="#60a5fa"
            strokeWidth="3"
            fill="none"
            strokeDasharray="4 2"
          />
          <polygon points="90,25 84,21 85,29" fill="#3b82f6" />
        </svg>

        {/* Route Direction Label */}
        <div className="absolute top-2 left-3 text-[10px] font-bold text-blue-600 tracking-wider flex items-center gap-1">
          <span>WARI ROUTE FLOW</span>
          <span>──────────────→</span>
        </div>

        {/* 4 Route Zones Grid */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2.5 p-4 top-5">
          {Object.entries(zones).map(([name, info]) => {
            const isFlagged = flaggedZone === name || (name === 'ZONE B' && info.level === 'HIGH' || info.level === 'CRITICAL')
            const style = LEVEL_COLOR[info.level] || LEVEL_COLOR.LOW
            const badgeStyle = LEVEL_BADGE[info.level] || LEVEL_BADGE.LOW

            return (
              <div
                key={name}
                className={`relative rounded-lg p-3 border-2 transition-all flex flex-col justify-between ${style} ${
                  isFlagged ? 'ring-4 ring-red-400/40 border-red-500 shadow-md animate-pulse' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold tracking-tight">{name}</span>
                    <div className="text-lg font-bold leading-none mt-0.5">{info.count} <span className="text-[10px] font-normal text-slate-600">people</span></div>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                    {info.level}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] mt-2 font-medium">
                  <span className="text-slate-600">FLOW: ↗ CONVERGING</span>
                  {isFlagged && (
                    <span className="text-red-700 font-bold bg-white/90 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 border border-red-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
                      HIGH-RISK ZONE
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Static Operational Point Markers */}
        <div className="absolute bottom-2 left-6 text-[10px] font-semibold bg-white/95 text-slate-700 px-2 py-0.5 rounded border border-slate-300 shadow-sm flex items-center gap-1">
          <span>🏥 Medical Point 1</span>
        </div>
        <div className="absolute top-8 right-6 text-[10px] font-semibold bg-white/95 text-slate-700 px-2 py-0.5 rounded border border-slate-300 shadow-sm flex items-center gap-1">
          <span>👤 Field Volunteer Alpha</span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <span>Route geometry & markers are prototype representations</span>
        <span className="font-mono text-slate-500">Zone Grid: 2×2 (A, B, C, D)</span>
      </div>
    </div>
  )
}
