import { useState, useEffect } from 'react'
import { Camera, Flame, RefreshCw, Radio, Compass, Users, Crosshair, Bug } from 'lucide-react'
import { api } from '../services/api'
import ZoneCalibrator from './ZoneCalibrator'

export default function LiveVideoPanel({ status, analytics }) {
  const [feedMode, setFeedMode] = useState('vision') // 'vision' | 'heatmap'
  const [imgKey, setImgKey] = useState(Date.now())
  const [videoError, setVideoError] = useState(false)
  const [isCalibratorOpen, setIsCalibratorOpen] = useState(false)
  const [debugActive, setDebugActive] = useState(false)

  const peopleCount = analytics?.people_count ?? status?.people_count ?? 0
  const zoneBLevel = analytics?.zone_density?.['ZONE B']?.level || 'LOW'
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

  const handleToggleDebug = async () => {
    try {
      const res = await api.toggleDebug()
      const data = await res.json()
      setDebugActive(data.debug_mode)
      setImgKey(Date.now())
    } catch (e) {
      console.error('Debug toggle failed:', e)
    }
  }

  const feedUrl = feedMode === 'heatmap' ? `/api/video/heatmap?t=${imgKey}` : `/api/video/feed?t=${imgKey}`

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <h2 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 uppercase">
            <Camera className="w-4 h-4 text-blue-600" />
            AI CROWD MONITOR
          </h2>
        </div>

        {/* Top-Right Tools & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCalibratorOpen(true)}
            className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition flex items-center gap-1 shadow-2xs"
          >
            <Crosshair className="w-3.5 h-3.5 text-blue-600" />
            <span>CALIBRATE ZONES</span>
          </button>

          <button
            onClick={handleToggleDebug}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition flex items-center gap-1 ${
              debugActive
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            <Bug className="w-3.5 h-3.5 text-amber-600" />
            <span>{debugActive ? 'DEBUG ON' : 'DEBUG OVERLAY'}</span>
          </button>

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
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                feedMode === 'heatmap' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Heatmap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Stream Container */}
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

        {/* Vision Analytics HUD Overlay */}
        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-white/15 text-xs font-mono space-y-1 shadow-lg">
          <div className="text-emerald-400 font-bold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> ACTIVE DETECTED: {peopleCount}
          </div>
          <div className="text-blue-300 font-bold flex items-center gap-1.5 text-[11px]">
            <span>ESTIMATED CROWD: ~{analytics?.estimated_crowd || 327}</span>
          </div>
          <div className="text-slate-200 text-[11px] flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400" /> TRACKING: ACTIVE
          </div>
          <div className="text-amber-300 text-[11px] flex items-center gap-1.5">
            <span>DENSITY: <strong>{zoneBLevel}</strong></span>
          </div>
          <div className="text-blue-300 text-[11px] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-400" /> FLOW: ↗ {flowDir}
          </div>
        </div>

        {/* Required Pitch Video Disclaimer Label */}
        <div className="absolute bottom-2.5 left-3 right-3 bg-slate-950/90 backdrop-blur-md text-slate-300 text-[11px] font-bold px-3 py-1 rounded-lg border border-white/15 text-center tracking-widest uppercase font-mono shadow-md">
          RECORDED VIDEO • LIVE FEED SIMULATION
        </div>
      </div>

      {/* Model & Compute Engine Footer */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Detector</span>
          <span className="font-bold text-slate-900">{status?.detector_backend?.toUpperCase() || 'YOLO11'} (1280px)</span>
        </div>
        <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Compute Engine</span>
          <span className="font-bold text-slate-900">{status?.compute_device || 'CPU'}</span>
        </div>
        <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Detection State</span>
          <span className="font-bold text-emerald-700">ACTIVE (conf 0.20)</span>
        </div>
      </div>

      {/* Zone Calibration Modal */}
      <ZoneCalibrator isOpen={isCalibratorOpen} onClose={() => setIsCalibratorOpen(false)} />
    </div>
  )
}
