import { useState, useEffect } from 'react'
import { MapPin, Droplets, HeartPulse, Bath, AlertCircle, WifiOff, CheckCircle2, AlertTriangle } from 'lucide-react'
import { startPolling } from '../services/api'
import Logo from '../components/Logo'
import RouteMap from '../components/RouteMap'

const NEARBY_FACILITIES = [
  { icon: <Droplets className="w-3.5 h-3.5 text-blue-600" />, label: 'Water Station 3', distance: '350 m', status: 'Available' },
  { icon: <HeartPulse className="w-3.5 h-3.5 text-red-600" />, label: 'Medical Camp 1', distance: '620 m', status: 'Active' },
  { icon: <Bath className="w-3.5 h-3.5 text-emerald-600" />, label: 'Sanitation Point 4', distance: '400 m', status: 'Available' },
]

export default function PilgrimView() {
  const [data, setData] = useState({})
  const [sosSent, setSosSent] = useState(false)

  useEffect(() => {
    const stop = startPolling(setData, 1000)
    return stop
  }, [])

  const riskLevel = data.risk?.level || 'LOW'
  const isHighRiskAhead = riskLevel === 'HIGH' || riskLevel === 'CRITICAL' || data.analytics?.zone_density?.['ZONE B']?.level === 'HIGH'

  return (
    <div className="p-3.5 font-sans flex flex-col justify-between min-h-full bg-slate-50 space-y-3">
      {/* Mobile App Header */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <Logo size="sm" showSubtitle={false} />
            <span className="text-[9.5px] font-extrabold text-blue-600 uppercase tracking-widest block mt-0.5">
              PILGRIM COMPANION
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-[9.5px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            ROUTE AVAILABLE
          </span>
        </div>
      </div>

      {/* Offline Status Banner */}
      <div className="bg-emerald-50/90 rounded-2xl p-2.5 border border-emerald-200 text-xs flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <WifiOff className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <div>
            <span className="font-extrabold text-emerald-950 block text-[10.5px]">OFFLINE READY</span>
            <span className="text-[8.5px] text-emerald-800">Cached route • Cached facilities • Pending sync</span>
          </div>
        </div>
        <span className="text-[7.5px] font-mono font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-300">
          PROTOTYPE OFFLINE MODE
        </span>
      </div>

      {/* Visual Wari Route Map */}
      <RouteMap
        mode="pilgrim"
        zoneDensity={data.analytics?.zone_density}
        isHighRisk={isHighRiskAhead}
      />

      {/* High Crowd Warning Banner for Pilgrim */}
      {isHighRiskAhead && (
        <div className="bg-amber-50 rounded-2xl p-3 border-2 border-amber-400 shadow-md space-y-1 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-1.5 text-amber-900 font-black text-[11px] uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>⚠️ CROWDED AREA AHEAD</span>
          </div>
          <p className="text-[10.5px] font-bold text-amber-800 leading-snug">
            Heavy crowd density detected in Zone B corridor. Consider taking the recommended alternate bypass route via Sector 2.
          </p>
        </div>
      )}

      {/* TODAY'S JOURNEY Progress Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[9.5px] font-extrabold text-slate-500 uppercase tracking-wider">TODAY'S JOURNEY</span>
          <span className="font-mono text-xs font-black text-slate-900">12.4 / 18.0 km</span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '68.8%' }} />
        </div>

        {/* Next Halt & Destination */}
        <div className="pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[8.5px] font-bold text-slate-400 uppercase block">NEXT HALT</span>
            <span className="font-extrabold text-slate-900 block text-[11px]">Pandharpur Sector 2</span>
            <span className="text-[9.5px] text-blue-600 font-bold font-mono">2.4 km away</span>
          </div>
          <div>
            <span className="text-[8.5px] font-bold text-slate-400 uppercase block">FINAL DESTINATION</span>
            <span className="font-extrabold text-slate-900 block text-[11px]">Pandharpur Temple</span>
            <span className="text-[9.5px] text-slate-500 font-mono">5.6 km total</span>
          </div>
        </div>
      </div>

      {/* NEARBY SERVICES */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
        <span className="text-[9.5px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">NEARBY SERVICES</span>
        <div className="space-y-1">
          {NEARBY_FACILITIES.map((f, i) => (
            <div key={i} className="flex items-center justify-between text-xs bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[10.5px]">
                {f.icon}
                <span>{f.label}</span>
              </div>
              <span className="text-slate-800 font-mono text-[9.5px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300 shadow-2xs">
                {f.distance}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Safety SOS Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs text-center space-y-1.5">
        <button
          onClick={() => setSosSent(true)}
          className={`w-full text-white font-black rounded-xl py-2.5 text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-1.5 uppercase tracking-wide ${
            sosSent ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {sosSent ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> LOCATION BROADCAST SENT
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" /> [ 🚨 EMERGENCY SOS ]
            </>
          )}
        </button>
        <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
          PROTOTYPE SOS
        </span>
      </div>

      {/* Footer Companion Label */}
      <div className="text-center text-[9px] text-slate-400 font-semibold tracking-wider uppercase pt-1">
        WARIMIND AI • PILGRIM COMPANION NETWORK
      </div>
    </div>
  )
}
