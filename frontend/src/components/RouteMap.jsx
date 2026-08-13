import { MapPin, Compass, Navigation, HeartPulse, UserCheck, Droplets, Bath, AlertTriangle } from 'lucide-react'

/**
 * RouteMap — Connected 2D Route & Spatial Map component for WariMind AI.
 * 
 * Supports 3 role-differentiated presentation modes:
 * - 'command': Comprehensive 4-zone operational route map for organizers.
 * - 'volunteer': Field-response navigation map from Volunteer Post to Zone B incident & Medical Point.
 * - 'pilgrim': Journey progress map showing current position, completed path, next halt, facilities & crowd bypass.
 */
export default function RouteMap({ mode = 'command', zoneDensity = {}, isHighRisk = false, flowDir = 'NE' }) {
  const zones = zoneDensity || {
    'ZONE A': { count: 14, level: 'LOW' },
    'ZONE B': { count: 68, level: 'HIGH' },
    'ZONE C': { count: 32, level: 'MEDIUM' },
    'ZONE D': { count: 12, level: 'LOW' },
  }

  const zoneBLevel = zones['ZONE B']?.level || (isHighRisk ? 'HIGH' : 'LOW')
  const isZoneBHigh = zoneBLevel === 'HIGH' || zoneBLevel === 'CRITICAL' || isHighRisk

  if (mode === 'volunteer') {
    return (
      <div className="relative h-44 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-2.5 flex flex-col justify-between text-white shadow-inner">
        {/* Map Header HUD */}
        <div className="relative z-10 flex items-center justify-between text-[10px] font-mono font-bold bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-white/10">
          <span className="flex items-center gap-1 text-blue-400">
            <Navigation className="w-3 h-3" /> DISPATCH NAVIGATION
          </span>
          <span className="text-amber-400 font-bold">420m • ~5 min ETA</span>
        </div>

        {/* SVG Navigation Map Canvas */}
        <div className="relative w-full h-full my-1 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
            {/* Background Corridor Grid Line */}
            <path d="M 30,100 Q 100,20 200,80 T 320,40" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

            {/* Active Navigation Path (Blue Glow) */}
            <path d="M 40,95 Q 100,25 180,75" stroke="#2563eb" strokeWidth="4" strokeDasharray="5 3" strokeLinecap="round" className="animate-pulse" />

            {/* Alternate Medical Path */}
            <path d="M 180,75 Q 240,90 300,50" stroke="#10b981" strokeWidth="2.5" strokeDasharray="4 3" opacity="0.8" />
          </svg>

          {/* Volunteer Current Position Pin */}
          <div className="absolute left-4 bottom-2 z-20 flex flex-col items-center">
            <div className="bg-blue-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md shadow-md border border-blue-400 flex items-center gap-0.5 whitespace-nowrap">
              <UserCheck className="w-2.5 h-2.5" /> YOU (Post C)
            </div>
            <div className="w-3 h-3 bg-blue-500 rounded-full ring-2 ring-blue-900/80 animate-ping mt-0.5" />
          </div>

          {/* Incident Destination Pin (Zone B) */}
          <div className="absolute left-[52%] top-[38%] z-20 flex flex-col items-center -translate-x-1/2">
            <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-md border flex items-center gap-1 whitespace-nowrap ${
              isZoneBHigh ? 'bg-red-600 text-white border-red-400 animate-bounce' : 'bg-amber-500 text-slate-950 border-amber-300'
            }`}>
              <AlertTriangle className="w-2 h-2" /> ZONE B INCIDENT
            </div>
            <div className="w-3.5 h-3.5 bg-red-600 rounded-full ring-2 ring-red-950/90 flex items-center justify-center text-[8px] font-black text-white mt-0.5">
              📍
            </div>
          </div>

          {/* Nearby Medical Standby Point Pin */}
          <div className="absolute right-4 top-2 z-20 flex flex-col items-center">
            <div className="bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-md border border-emerald-400 flex items-center gap-0.5 whitespace-nowrap">
              <HeartPulse className="w-2.5 h-2.5" /> Medical 1
            </div>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-emerald-950 mt-0.5" />
          </div>
        </div>

        {/* Map Footer Disclaimer */}
        <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-slate-400 bg-slate-950/90 px-2 py-0.5 rounded-lg border border-white/10">
          <span>PROTOTYPE ROUTE</span>
          <span className="text-emerald-400 font-bold">DISPATCH TARGET: ZONE B</span>
        </div>
      </div>
    )
  }

  if (mode === 'pilgrim') {
    return (
      <div className="relative h-44 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-2.5 flex flex-col justify-between text-white shadow-inner">
        {/* Pilgrim Header Bar */}
        <div className="relative z-10 flex items-center justify-between text-[10px] font-mono font-bold bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-white/10">
          <span className="flex items-center gap-1 text-emerald-400">
            <MapPin className="w-3 h-3" /> WARI JOURNEY MAP
          </span>
          <span className="text-slate-300 font-normal">PROTOTYPE ROUTE</span>
        </div>

        {/* SVG Pilgrim Route Canvas */}
        <div className="relative w-full h-full my-1 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
            {/* Main Wari Path - Completed (Green) */}
            <path d="M 20,90 Q 70,50 120,70" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />

            {/* Main Wari Path - Remaining (Light Gray / Red if congested) */}
            <path
              d="M 120,70 Q 180,95 240,50 T 320,30"
              stroke={isZoneBHigh ? "#ef4444" : "#64748b"}
              strokeWidth="4"
              strokeDasharray={isZoneBHigh ? "5 3" : "none"}
              strokeLinecap="round"
            />

            {/* Recommended Alternate Bypass Route (Amber Dashed) */}
            {isZoneBHigh && (
              <path d="M 120,70 C 150,25 210,20 240,50" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 2" strokeLinecap="round" className="animate-pulse" />
            )}
          </svg>

          {/* Current Pilgrim Position Marker (Zone A Corridor) */}
          <div className="absolute left-[26%] bottom-[14%] z-20 flex flex-col items-center">
            <div className="bg-emerald-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md shadow-md border border-emerald-400 flex items-center gap-0.5 whitespace-nowrap">
              📍 YOU (Zone A)
            </div>
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-emerald-950 animate-ping mt-0.5" />
          </div>

          {/* Zone B Corridor Marker (Crowded Warning if High Risk) */}
          <div className="absolute left-[50%] top-[38%] z-20 flex flex-col items-center -translate-x-1/2">
            {isZoneBHigh ? (
              <div className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-md border border-red-400 flex items-center gap-1 whitespace-nowrap animate-bounce">
                <AlertTriangle className="w-2 h-2" /> ZONE B (CROWDED)
              </div>
            ) : (
              <div className="bg-slate-800 text-slate-300 text-[8px] font-semibold px-1.5 py-0.5 rounded border border-slate-700">
                Zone B
              </div>
            )}
          </div>

          {/* Facility Pin 1: Water Point */}
          <div className="absolute left-[14%] top-[18%] z-20">
            <span className="bg-blue-900/90 text-blue-200 text-[7.5px] font-bold px-1 py-0.5 rounded-full border border-blue-500 flex items-center gap-0.5">
              <Droplets className="w-2 h-2 text-blue-400" /> Water 350m
            </span>
          </div>

          {/* Facility Pin 2: Medical Camp */}
          <div className="absolute right-[14%] bottom-[12%] z-20">
            <span className="bg-emerald-900/90 text-emerald-200 text-[7.5px] font-bold px-1 py-0.5 rounded-full border border-emerald-500 flex items-center gap-0.5">
              <HeartPulse className="w-2 h-2 text-emerald-400" /> Medical 620m
            </span>
          </div>

          {/* Facility Pin 3: Sanitation */}
          <div className="absolute right-[28%] top-[12%] z-20">
            <span className="bg-slate-800/90 text-slate-200 text-[7.5px] font-bold px-1 py-0.5 rounded-full border border-slate-600 flex items-center gap-0.5">
              <Bath className="w-2 h-2 text-emerald-400" /> Toilet 400m
            </span>
          </div>

          {/* Next Halt Destination Pin */}
          <div className="absolute right-2 top-2 z-20 flex flex-col items-center">
            <div className="bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-md border border-blue-400 whitespace-nowrap">
              🏁 Sector 2 (2.4 km)
            </div>
          </div>
        </div>

        {/* Map Legend Footer */}
        <div className="relative z-10 flex items-center justify-between text-[8.5px] font-mono text-slate-300 bg-slate-950/90 px-2 py-0.5 rounded-lg border border-white/10">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Passed
          </span>
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isZoneBHigh ? 'bg-red-500' : 'bg-slate-400'} inline-block`} /> Ahead
          </span>
          {isZoneBHigh && (
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Bypass
            </span>
          )}
        </div>
      </div>
    )
  }

  // Default Command Center Mode Map
  return null
}
