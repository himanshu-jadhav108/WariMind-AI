import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2, Send, ShieldCheck, MapPin, Navigation, Clock } from 'lucide-react'
import { api, startPolling } from '../services/api'
import Logo from '../components/Logo'
import RouteMap from '../components/RouteMap'

export default function VolunteerControlView() {
  const [data, setData] = useState({})
  const [acknowledged, setAcknowledged] = useState(false)
  const [ackTime, setAckTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    const stop = startPolling(setData, 1000)
    return stop
  }, [])

  const alert = data.recommendations?.volunteer_alert
  const isTriggered = alert && !alert.acknowledged && !acknowledged

  const handleAcknowledge = async () => {
    setLoading(true)
    try {
      await api.acknowledgeVolunteer()
      setAcknowledged(true)
      const now = new Date()
      setAckTime(now.toTimeString().split(' ')[0])
    } catch (e) {
      console.error('Acknowledgement failed:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-3.5 font-sans flex flex-col justify-between min-h-full bg-slate-50 space-y-3">
      {/* App Top Header Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <Logo size="sm" showSubtitle={false} />
            <span className="text-[9.5px] font-extrabold text-blue-600 uppercase tracking-widest block mt-0.5">
              FIELD RESPONSE APP
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-[10px] font-extrabold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            AVAILABLE
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-100 text-[9.5px] font-bold text-slate-500">
          <span>OFFICER: VOL-ALPHA-01</span>
          <span>PROTOTYPE ROUTE</span>
        </div>
      </div>

      {/* Dynamic Route & Spatial Navigation Map */}
      <RouteMap
        mode="volunteer"
        zoneDensity={data.analytics?.zone_density}
        isHighRisk={isTriggered}
        flowDir={data.analytics?.flow?.direction || 'NE'}
      />

      {/* Incident Alert / Duty Status Card */}
      {isTriggered ? (
        <div className="bg-white rounded-2xl p-3.5 border-2 border-red-500 shadow-lg space-y-2.5 animate-in zoom-in-95 duration-200">
          {/* Header Alert Badge */}
          <div className="flex items-center justify-between">
            <span className="text-red-700 bg-red-100 border border-red-300 text-[9.5px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-red-600" />
              🚨 HIGH PRIORITY
            </span>
            <span className="text-[9.5px] font-mono font-bold text-red-600">DISPATCH TASK</span>
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">GO TO ZONE B</h2>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Incident Location: Zone B Bottleneck Corridor</p>
          </div>

          {/* Distance & ETA Strip */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900 text-white p-2.5 rounded-xl text-center">
            <div>
              <span className="text-[8.5px] text-slate-400 block uppercase font-bold">DISTANCE</span>
              <span className="text-sm font-black font-mono text-amber-400">420 m</span>
            </div>
            <div>
              <span className="text-[8.5px] text-slate-400 block uppercase font-bold">ETA</span>
              <span className="text-sm font-black font-mono text-emerald-400">~5 min</span>
            </div>
          </div>

          {/* Reason Explanation */}
          <div className="bg-red-50/80 rounded-xl p-2.5 border border-red-200 space-y-0.5 text-xs">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase block">REASON:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-900 font-semibold text-[10.5px]">
              <li>Crowd density increasing rapidly in Zone B</li>
              <li>Flow concentration increasing towards bottleneck</li>
            </ul>
          </div>

          {/* Action Buttons: Acknowledge & Navigate */}
          <div className="space-y-1.5 pt-0.5">
            <button
              onClick={handleAcknowledge}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 font-bold text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-1.5 uppercase tracking-wide"
            >
              {loading ? (
                'SENDING ACKNOWLEDGEMENT...'
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> [ ACKNOWLEDGE DISPATCH ]
                </>
              )}
            </button>

            <button
              onClick={() => setIsNavigating(!isNavigating)}
              className={`w-full py-2 rounded-xl font-bold text-[11px] border transition flex items-center justify-center gap-1.5 ${
                isNavigating
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <Navigation className="w-3 h-3" />
              {isNavigating ? 'NAVIGATING TO ZONE B ACTIVE...' : '[ NAVIGATE TO ZONE B ]'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs text-center space-y-2">
          <ShieldCheck className="w-9 h-9 text-emerald-600 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">SECTOR CLEAR & MONITORED</h3>
          <p className="text-[11px] text-slate-500">Post C standing by. No active high-risk alerts assigned.</p>

          {(acknowledged || alert?.acknowledged) && (
            <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 mt-2 text-left space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ✓ RESPONSE ACKNOWLEDGED
              </span>
              <span className="text-[9.5px] text-emerald-700 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> Task received & logged: {ackTime || '14:32:45'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer Network Label */}
      <div className="text-center text-[9px] text-slate-400 font-semibold tracking-wider uppercase pt-1">
        WARIMIND AI • FIELD RESPONSE NETWORK
      </div>
    </div>
  )
}
