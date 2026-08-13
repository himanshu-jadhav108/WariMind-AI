import { useState } from 'react'
import { MapPin, Droplets, HeartPulse, Bath, AlertCircle, WifiOff, CheckCircle2, Navigation } from 'lucide-react'
import Logo from '../components/Logo'

const AMENITIES = [
  { icon: <Droplets className="w-5 h-5 text-blue-600" />, label: 'Water Supply Station 3', distance: '350 m', status: 'Available' },
  { icon: <HeartPulse className="w-5 h-5 text-red-600" />, label: 'Medical Camp 1 (Sector 2)', distance: '620 m', status: 'Active' },
  { icon: <Bath className="w-5 h-5 text-emerald-600" />, label: 'Sanitation Facility 4', distance: '400 m', status: 'Available' },
]

export default function PilgrimView() {
  const [sosSent, setSosSent] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-md mx-auto font-sans flex flex-col justify-between">
      <div>
        {/* Header with Logo & Subtitle */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs mb-4">
          <Logo size="sm" showSubtitle={false} />
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">PILGRIM COMPANION</span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              <WifiOff className="w-3 h-3 text-blue-600" />
              <span>OFFLINE READY</span>
            </span>
          </div>
        </div>

        {/* Offline Story Box */}
        <div className="bg-emerald-50/80 rounded-2xl p-3.5 border border-emerald-200 mb-4 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <span className="font-bold text-emerald-900 block">PRE-CACHED OFFLINE MODE</span>
              <span className="text-[10px] text-emerald-700">Cached route map • Cached facilities • Pending sync</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
            SYNCED
          </span>
        </div>

        {/* Today's Journey Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-2xs space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TODAY'S JOURNEY</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ROUTE CLEAR
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Current Position
            </span>
            <p className="text-slate-900 text-base font-bold mt-0.5">📍 Zone A Corridor (Sector 1)</p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Next Planned Halt:</span>
            <span className="font-bold text-slate-900">Pandharpur Sector 2 (2.4 km)</span>
          </div>

          <div className="aspect-3/1 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-600 text-xs font-medium p-2 text-center">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-blue-600" /> Wari Pilgrim Route Geometry
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Zone A (Clear) → Zone B (Monitored) → Zone C</span>
          </div>
        </div>

        {/* Nearby Services Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">NEARBY SERVICES</span>
          <div className="space-y-2.5">
            {AMENITIES.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2.5 font-semibold text-slate-800">
                  {a.icon}
                  <span>{a.label}</span>
                </div>
                <span className="text-slate-600 font-mono text-xs font-bold bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                  {a.distance}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Safety Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs text-center space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NEED IMMEDIATE ASSISTANCE?</span>
          <p className="text-xs text-slate-500">Share your pre-cached location with the nearby response network</p>

          <button
            onClick={() => setSosSent(true)}
            className={`w-full text-white font-bold rounded-xl py-3.5 text-base shadow-md transition active:scale-98 flex items-center justify-center gap-2 ${
              sosSent ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {sosSent ? (
              <>
                <CheckCircle2 className="w-5 h-5" /> LOCATION BROADCAST SENT
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" /> 🚨 EMERGENCY SOS
              </>
            )}
          </button>
          <p className="text-[10px] text-slate-400">
            PROTOTYPE SOS — Feigned alert mechanism for Stage 2 pitch demonstration.
          </p>
        </div>
      </div>

      <div className="mt-6 text-center text-[10px] text-slate-400 font-medium">
        WariMind AI • Pilgrim Safety & Guidance System
      </div>
    </div>
  )
}
