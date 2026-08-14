import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Send, X } from 'lucide-react'
import { api } from '../services/api'

export default function VolunteerAlert({ alert, status }) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (!alert || alert.acknowledged || acknowledged || dismissed || status === 'IDLE' || status === 'STOPPED') return null

  const handleAcknowledge = async () => {
    setLoading(true)
    try {
      await api.acknowledgeVolunteer()
      setAcknowledged(true)
    } catch (e) {
      console.error('Failed to acknowledge volunteer alert:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border-2 border-red-500 max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-red-700 bg-red-100 border border-red-300 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            FIELD DISPATCH ALERT
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-xl font-black text-slate-900">{alert.title || 'HIGH CROWD RISK — ZONE B'}</h2>

        <div className="mt-4 bg-red-50/80 rounded-xl p-3.5 border border-red-200 space-y-2 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Required Field Action:</span>
            <span className="text-slate-900 font-bold text-sm">{alert.task || 'Move to Zone B immediately'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Triggering Vision Analytics:</span>
            <span className="text-slate-800">{alert.reason || 'Increasing crowd density & directional convergence detected.'}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleAcknowledge}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-bold text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2"
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
      </div>
    </div>
  )
}
