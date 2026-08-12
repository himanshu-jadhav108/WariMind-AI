import { useState } from 'react'

const AMENITIES = [
  { icon: '💧', label: 'Water Point', distance: '120 m', status: 'Available' },
  { icon: '🏥', label: 'Medical Camp 1', distance: '350 m', status: 'Active' },
  { icon: '🚻', label: 'Sanitation Point', distance: '80 m', status: 'Available' },
]

export default function PilgrimView() {
  const [sosSent, setSosSent] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-md mx-auto font-sans">
      <div className="flex items-center justify-between mt-2 mb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">WARIMIND PILGRIM ASSISTANT</h1>
          <p className="text-xs text-slate-500">Live Route Guidance & Help</p>
        </div>
        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
          PROTOTYPE
        </span>
      </div>

      {/* Route Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Current Pilgrim Path</span>
        <p className="text-slate-900 text-sm font-semibold">Wari Route • Zone B Approaching</p>
        <p className="text-xs text-slate-500 mt-0.5">Next Halt: Pandharpur Sector 2 (2.4 km)</p>
        
        <div className="mt-3 aspect-3/1 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-500 text-xs font-medium">
          <span>📍 Route Map — Clear Movement Flow</span>
          <span className="text-[10px] text-slate-400">Zone A → Zone B → Zone C</span>
        </div>
      </div>

      {/* Nearby Amenities */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Nearby Support Points</span>
        <div className="space-y-2.5">
          {AMENITIES.map((a) => (
            <div key={a.label} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="font-medium text-slate-800 flex items-center gap-1.5">
                <span>{a.icon}</span> {a.label}
              </span>
              <span className="text-slate-500 font-mono">{a.distance}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency SOS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
        <button
          onClick={() => setSosSent(true)}
          className={`w-full text-white font-bold rounded-xl py-3.5 text-base shadow-md transition active:scale-98 ${
            sosSent ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {sosSent ? '✓ SOS SIGNAL SENT (Prototype)' : '🚨 EMERGENCY SOS'}
        </button>
        <p className="text-[11px] text-slate-400 mt-2">
          Prototype SOS — feigned emergency alert mechanism for Stage 2 pitch demonstration.
        </p>
      </div>
    </div>
  )
}
