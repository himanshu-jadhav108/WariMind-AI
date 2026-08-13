import { useState, useEffect } from 'react'
import { Activity, Clock, MapPin, Cpu, TrendingUp, Minus, ShieldCheck } from 'lucide-react'
import Logo from './Logo'

export default function StatusBar({ status, zoneDensity }) {
  const [timeStr, setTimeStr] = useState('')

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setTimeStr(now.toTimeString().split(' ')[0])
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  const zones = zoneDensity || {
    'ZONE A': { count: 8, level: 'LOW' },
    'ZONE B': { count: 68, level: 'HIGH' },
    'ZONE C': { count: 22, level: 'LOW' },
    'ZONE D': { count: 78, level: 'HIGH' },
  }

  const levelStyles = {
    LOW: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-800 border-amber-200',
    HIGH: 'bg-red-50 text-red-900 border-red-300 font-bold shadow-2xs ring-1 ring-red-200 animate-pulse',
    CRITICAL: 'bg-red-100 text-red-950 border-red-400 font-bold ring-2 ring-red-300 animate-pulse',
  }

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs font-sans">
      {/* Top Main Command Center Header */}
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
        {/* Left: Brand Logo & Command Center Title */}
        <div className="flex items-center gap-3">
          <Logo size="md" showSubtitle={true} />
        </div>

        {/* Right: Live System Metadata & Clock */}
        <div className="flex items-center gap-3 text-xs">
          {/* Active Monitoring Status */}
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 font-bold text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span>MONITORING ACTIVE</span>
          </div>

          {/* Model / Engine Metadata */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-medium">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Detector: <strong className="text-slate-900">{status?.detector_backend?.toUpperCase() || 'YOLO11'}</strong></span>
          </div>

          {/* Live System Clock */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800 font-mono font-bold text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{timeStr || '14:32:41'}</span>
          </div>
        </div>
      </div>

      {/* Wari Route Status Bar */}
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>WARI ROUTE STATUS:</span>
        </div>

        <div className="grid grid-cols-4 gap-3 flex-1 min-w-[500px]">
          {['ZONE A', 'ZONE B', 'ZONE C', 'ZONE D'].map((name) => {
            const info = zones[name] || { count: 0, level: 'LOW' }
            const isHigh = info.level === 'HIGH' || info.level === 'CRITICAL'
            const style = levelStyles[info.level] || levelStyles.LOW

            return (
              <div
                key={name}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center justify-between ${style}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-tight">{name}</span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-white/80 rounded border border-black/10">
                    {info.level}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono font-bold">
                  <span>{info.count}</span>
                  <span className="text-[10px] text-slate-500 font-normal">ppl</span>
                  {isHigh ? (
                    <TrendingUp className="w-3 h-3 text-red-600 ml-1" />
                  ) : (
                    <Minus className="w-3 h-3 opacity-40 ml-1" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

