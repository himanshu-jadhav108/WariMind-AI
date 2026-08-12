import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function VolunteerAlert({ alert }) {
  const [closed, setClosed] = useState(false)
  const [lastZone, setLastZone] = useState(null)

  useEffect(() => {
    if (alert && alert.zone !== lastZone) {
      setClosed(false)
      setLastZone(alert.zone)
    }
  }, [alert, lastZone])

  if (!alert || closed || alert.acknowledged) return null

  const handleAcknowledge = async () => {
    setClosed(true)
    try {
      await api.acknowledgeVolunteer()
    } catch (e) {
      console.error('Failed to acknowledge alert:', e)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-t-8 border-red-600 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between">
          <span className="text-red-600 font-bold text-xs tracking-widest uppercase bg-red-50 px-2 py-0.5 rounded border border-red-200">
            🚨 VOLUNTEER ALERT DISPATCHED
          </span>
          <span className="text-xs text-slate-400 font-mono">PRIORITY: HIGH</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
          {alert.title || 'HIGH CROWD RISK'}
        </h2>
        <p className="text-slate-600 text-sm font-medium">Target Zone: <span className="font-bold text-red-600">{alert.zone || 'ZONE B'}</span></p>

        <div className="mt-4 bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
          <div>
            <span className="font-semibold text-slate-500 uppercase block text-[10px]">Assigned Task:</span>
            <span className="text-slate-900 font-medium text-sm">{alert.task || 'Move to Zone B immediately'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 uppercase block text-[10px]">Trigger Reason:</span>
            <span className="text-slate-800">{alert.reason || 'Increasing crowd density detected by vision pipeline.'}</span>
          </div>
        </div>

        <button
          onClick={handleAcknowledge}
          className="mt-5 w-full bg-slate-900 text-white rounded-xl py-3 font-semibold text-sm hover:bg-slate-800 transition active:scale-98 shadow-md"
        >
          ✓ ACKNOWLEDGE RESPONSE
        </button>

        <p className="text-center text-[10px] text-slate-400 mt-2">
          Demonstrates AI Decision Engine → Human Field Intervention workflow.
        </p>
      </div>
    </div>
  )
}
