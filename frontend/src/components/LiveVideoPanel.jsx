import { useState } from 'react'

export default function LiveVideoPanel({ status, analytics }) {
  const [videoError, setVideoError] = useState(false)

  const peopleCount = analytics?.people_count ?? status?.people_count ?? 0
  const busiestLevel = analytics?.zone_density?.['ZONE B']?.level || 'LOW'
  const flowDir = analytics?.flow?.direction || 'NE'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <h2 className="font-semibold text-slate-900 text-sm tracking-tight">AI CROWD MONITOR</h2>
        </div>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
          AI VISION ACTIVE • {status?.detector_backend?.toUpperCase() || 'YOLO11'}
        </span>
      </div>

      {/* Video Feed Canvas */}
      <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-300 group">
        {!videoError ? (
          <img
            src="/api/video/feed"
            alt="AI annotated crowd video feed"
            className="w-full h-full object-contain"
            onError={() => setVideoError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <span className="text-3xl mb-2">📹</span>
            <p className="text-sm font-medium text-slate-200">Video Feed Standby / Connecting</p>
            <p className="text-xs text-slate-400 mt-1">Start Scenario or place demo video at data/demo/demo_crowd.mp4</p>
          </div>
        )}

        {/* Live HUD Stats Overlay */}
        <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-white px-3 py-1.5 rounded border border-white/20 text-xs font-mono space-y-0.5">
          <div className="text-emerald-400 font-bold">PEOPLE: {peopleCount}</div>
          <div className="text-slate-300">TRACKING: ACTIVE</div>
          <div className="text-amber-300">DENSITY: {busiestLevel}</div>
          <div className="text-blue-300">FLOW: ↗ {flowDir}</div>
        </div>

        {/* Required Pitch Disclaimer Badge */}
        <div className="absolute bottom-2 left-2 right-2 bg-black/80 text-slate-200 text-[11px] font-medium px-2.5 py-1 rounded border border-white/10 text-center tracking-wide">
          RECORDED VIDEO • LIVE FEED SIMULATION
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-medium">Model</span>
          <span className="font-bold text-slate-900">{status?.detector_backend || 'YOLO11'}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-medium">Compute</span>
          <span className="font-bold text-slate-900">{status?.compute_device || 'CPU'}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-medium">Performance</span>
          <span className="font-bold text-slate-900">{status?.fps ? `${status.fps} FPS` : '20 FPS'}</span>
        </div>
      </div>
    </div>
  )
}
