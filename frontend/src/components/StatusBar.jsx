import { useState, useEffect } from 'react'
import { Activity, ShieldCheck, Clock, User, TrendingUp, TrendingDown, Minus, MapPin, Cpu, Layers } from 'lucide-react'
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

  const isActive = status?.status === 'RUNNING'

  const zones = zoneDensity || {
    'ZONE A': { count: 14, level: 'LOW', trend: 'stable' },
    'ZONE B': { count: 68, level: 'HIGH', trend: 'up' },
    'ZONE C': { count: 32, level: 'MEDIUM', trend: 'stable' },
    'ZONE D': { count: 12, level: 'LOW', trend: 'down' },
  }

  const levelStyles = {
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HIGH: 'bg-red-50 text-red-700 border-red-300 font-bold shadow-2xs ring-1 ring-red-200 animate-pulse',
    CRITICAL: 'bg-red-100 text-red-900 border-red-400 font-bold ring-2 ring-red-300 animate-pulse',
  }

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs font-sans">
      {/* Top Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
        {/* Left: Brand Logo */}
        <Logo size="md" showSubtitle={true} />

        {/* Center / Right: System Metadata & User Info */}
        <div className="flex items-center gap-4 text-xs">
          {/* Route Identifier */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Route: <strong className="text-slate-900">Prototype Route (Wari Corridor)</strong></span>
          </div>

          {/* System Status */}
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-800 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>MONITORING ACTIVE</span>
          </div>

          {/* Live Clock */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-mono font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{timeStr || '14:32:41'}</span>
          </div>

          {/* Compute & Model Info */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 font-semibold flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {status?.detector_backend?.toUpperCase() || 'YOLO11'}
            </span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 text-slate-700">
            <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              <User className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-800 text-xs">Organizer Command</span>
          </div>
        </div>
      </div>

      {/* Top Status Strip: Four Route Status Cards */}
      <div className="max-w-7xl mx-auto px-6 py-2.5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(zones).map(([name, info]) => {
          const isHigh = info.level === 'HIGH' || info.level === 'CRITICAL'
          return (
            <div
              key={name}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                levelStyles[info.level] || levelStyles.LOW
              }`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">{name}</span>
                <span className="text-base font-extrabold tracking-tight">{info.level} DENSITY</span>
              </div>
              <div className="flex flex-col items-end text-xs font-semibold">
                <span className="text-xs font-mono">{info.count} people</span>
                <span className="flex items-center gap-0.5 text-[10px] mt-0.5">
                  {isHigh ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-red-600" />
                      <span>↑ Increasing</span>
                    </>
                  ) : (
                    <>
                      <Minus className="w-3 h-3 opacity-60" />
                      <span>Stable</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
