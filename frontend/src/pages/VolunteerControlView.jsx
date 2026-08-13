import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2, Send, ShieldCheck, MapPin, Radio } from 'lucide-react'
import { api, startPolling } from '../services/api'
import Logo from '../components/Logo'

export default function VolunteerControlView() {
  const [data, setData] = useState({})
  const [acknowledged, setAcknowledged] = useState(false)
  const [loading, setLoading] = useState(false)

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
    } catch (e) {
      console.error('Acknowledgement failed:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-md mx-auto font-sans flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs mb-4">
          <Logo size="sm" showSubtitle={false} />
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">VOLUNTEER CONTROL</span>
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              STATUS: AVAILABLE
            </span>
          </div>
        </div>

        {/* Assigned Zone Box */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs mb-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">ASSIGNED POST</span>
            <span className="font-mono text-slate-400">ID: VOL-ALPHA-01</span>
          </div>
          <div className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600" /> ZONE C • HALT SECTOR 1
          </div>
          <p className="text-xs text-slate-500 mt-1">Primary Duty: Corridor Traffic Management</p>
        </div>

        {/* Task Dispatch Alert Card */}
        {isTriggered ? (
          <div className="bg-white rounded-2xl p-5 border-2 border-red-500 shadow-xl animate-in zoom-in-95 duration-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-red-700 bg-red-100 border border-red-300 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                HIGH CROWD RISK — ZONE B
              </span>
              <span className="text-[10px] font-mono text-red-600 font-bold">PRIORITY 1</span>
            </div>

            <h2 className="text-lg font-black text-slate-900">{alert.title || 'MOVE TO ZONE B IMMEDIATELY'}</h2>

            <div className="bg-red-50/80 rounded-xl p-3.5 border border-red-200 space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Field Task:</span>
                <span className="text-slate-900 font-bold text-sm">{alert.task || 'Move to Zone B immediately'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Vision Analytics Trigger:</span>
                <span className="text-slate-800">{alert.reason || 'Increasing crowd density detected.'}</span>
              </div>
            </div>

            <button
              onClick={handleAcknowledge}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3.5 font-bold text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-2"
            >
              {loading ? (
                'SENDING ACKNOWLEDGEMENT...'
              ) : (
                <>
                  <Send className="w-4 h-4" /> ACKNOWLEDGE DISPATCH RESPONSE
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">SECTOR STABLE & CLEAR</h3>
            <p className="text-xs text-slate-500">No pending high-risk dispatch alerts in your assigned zone.</p>
            {acknowledged && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> RESPONSE ACKNOWLEDGED BY VOLUNTEER
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-[10px] text-slate-400 font-medium">
        WariMind AI • Field Operations Control Interface
      </div>
    </div>
  )
}
