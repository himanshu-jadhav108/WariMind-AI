import { useState, useEffect } from 'react'
import { Camera, Flame, RefreshCw, Radio, Compass, Users, Cpu } from 'lucide-react'

export default function LiveVideoPanel({ status, analytics }) {
  const [feedMode, setFeedMode] = useState('vision') // 'vision' | 'heatmap'
  const [imgKey, setImgKey] = useState(Date.now())
  const [videoError, setVideoError] = useState(false)

  const peopleCount = analytics?.people_count ?? status?.people_count ?? 0
  const busiestLevel = analytics?.zone_density?.['ZONE B']?.level || 'LOW'
  const flowDir = analytics?.flow?.direction || 'NE'

  useEffect(() => {
    setVideoError(false)
    setImgKey(Date.now())
  }, [feedMode])

  const handleImgError = () => {
    setVideoError(true)
    setTimeout(() => {
      setImgKey(Date.now())
      setVideoError(false)
    }, 2500)
  }

  const feedUrl = feedMode === 'heatmap' ? `/api/video/heatmap?t=${imgKey}` : `/api/video/feed?t=${imgKey}`

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <h2 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-blue-600" />
            AI CROWD MONITOR
          </h2>
        </div>

        {/* Top-Right Feed Status & Mode Switcher */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
            AI VISION ACTIVE
          </span>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
            <button
              onClick={() => setFeedMode('vision')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                feedMode === 'vision' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>YOLO11</span>
            </button>
            <button
              onClick={() => setFeedMode('heatmap')}
              className={`px-2.5 py-0.5 rounded-md transition flex items-center gap-1 ${
                feedMode === 'heatmap' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Heatmap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Feed Canvas */}
      <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-300 shadow-inner group">
        {!videoError ? (
          <img
            key={imgKey}
            src={feedUrl}
            alt="AI annotated crowd video feed"
            className="w-full h-full object-contain"
            onError={handleImgError}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-900">
            <RefreshCw className="w-8 h-8 mb-2 animate-spin text-blue-500" />
            <p className="text-sm font-medium text-slate-200">Reconnecting Live Feed...</p>
            <button
              onClick={() => {
                setVideoError(false)
                setImgKey(Date.now())
              }}
              className="mt-3 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow hover:bg-blue-700 transition flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reload Feed
            </button>
          </div>
        )}

        {/* Minimal Professional Overlay HUD */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white px-3 py-2 rounded-lg border border-white/10 text-xs font-mono space-y-1 shadow-md">
          <div className="text-emerald-400 font-bold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> PEOPLE: {peopleCount}
          </div>
          <div className="text-slate-300 text-[11px] flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400" /> TRACKING: ACTIVE
          </div>
          <div className="text-blue-300 text-[11px] flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-blue-400" /> FLOW: ↗ {flowDir}
          </div>
        </div>

        {/* Required Disclaimer */}
        <div className="absolute bottom-2.5 left-3 right-3 bg-slate-950/85 backdrop-blur-md text-slate-300 text-[11px] font-medium px-3 py-1 rounded-md border border-white/10 text-center tracking-wider uppercase font-mono">
          RECORDED VIDEO • LIVE FEED SIMULATION
        </div>
      </div>

      {/* Model & Compute Metadata Footer */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Detector Model</span>
          <span className="font-bold text-slate-900">{status?.detector_backend?.toUpperCase() || 'YOLO11'}</span>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Compute Engine</span>
          <span className="font-bold text-slate-900">{status?.compute_device || 'CPU'}</span>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Processing Speed</span>
          <span className="font-bold text-slate-900">{status?.fps ? `${status.fps} FPS` : '20 FPS'}</span>
        </div>
      </div>
    </div>
  )
}
