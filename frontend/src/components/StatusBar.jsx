export default function StatusBar({ status, zoneDensity }) {
  const isActive = status?.status === 'RUNNING'
  const mode = status?.mode || 'SCENARIO'

  const zones = zoneDensity || {
    'ZONE A': { count: 14, level: 'LOW' },
    'ZONE B': { count: 68, level: 'HIGH' },
    'ZONE C': { count: 32, level: 'MEDIUM' },
    'ZONE D': { count: 12, level: 'LOW' },
  }

  const levelPill = {
    LOW: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-400 font-bold',
    CRITICAL: 'bg-red-200 text-red-900 border-red-500 font-bold animate-pulse',
  }

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & Platform Header */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              WARIMIND AI
            </h1>
            <span className="text-slate-400 font-normal text-sm">|</span>
            <span className="text-xs font-semibold text-slate-600">AI-Powered Wari Intelligence Platform</span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              MONITORING ACTIVE
            </span>
          </div>
        </div>

        {/* Top Route Status Bar */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">ROUTE STATUS:</span>
          {Object.entries(zones).map(([name, info]) => (
            <div key={name} className={`px-2 py-0.5 rounded border text-[11px] flex items-center gap-1 ${levelPill[info.level] || levelPill.LOW}`}>
              <span>{name}:</span>
              <span>{info.level}</span>
            </div>
          ))}
        </div>

        {/* Compute & System Badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
            COMPUTE: {status?.compute_device || 'CPU'}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
            DETECTOR: {status?.detector_backend?.toUpperCase() || 'YOLO11'}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono">
            {status?.fps ? `${status.fps} FPS` : '20 FPS'}
          </span>
        </div>
      </div>
    </div>
  )
}
