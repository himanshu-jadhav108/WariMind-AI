import { useState } from 'react'
import { Bot, AlertTriangle, CheckCircle2, Send, ShieldCheck, ArrowRight } from 'lucide-react'
import { api } from '../services/api'

export default function DecisionPanel({ recommendation }) {
  const [dispatching, setDispatching] = useState(false)
  const [dispatched, setDispatched] = useState(false)

  const isTriggered = recommendation?.triggered ?? true
  const zone = recommendation?.zone || 'ZONE B'

  const actions = recommendation?.actions || [
    'Deploy additional field volunteers to Zone B corridor',
    'Monitor incoming crowd rate from Sector 1 entry',
    'Prepare alternate diversion route via Sector 2 bypass',
    'Position medical response team nearby at Standby Post 1',
  ]

  const handleDispatch = async () => {
    setDispatching(true)
    try {
      await api.acknowledgeVolunteer()
      setDispatched(true)
    } catch (e) {
      console.error(e)
    } finally {
      setDispatching(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-slate-900 text-sm tracking-tight">AI DECISION ENGINE</h2>
        </div>
        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 uppercase tracking-wider">
          AUTOMATED DECISION SUPPORT
        </span>
      </div>

      {isTriggered ? (
        <div className="bg-red-50/60 rounded-xl p-4 border border-red-200 space-y-3">
          {/* Risk Header Badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 bg-red-100 border border-red-300 px-2.5 py-1 rounded-md flex items-center gap-1.5 animate-pulse uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              HIGH CROWD RISK — {zone}
            </span>
            <span className="text-[10px] font-mono text-red-600 font-bold uppercase">PRIORITY 1 ACTION</span>
          </div>

          <p className="text-xs text-slate-700 font-medium">
            The decision engine has generated 4 strategic intervention recommendations based on live vision analytics:
          </p>

          {/* Action Checklist */}
          <div className="space-y-2 bg-white p-3 rounded-lg border border-red-200 text-xs">
            {actions.map((act, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{act}</span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="pt-1 flex items-center justify-between">
            <button
              onClick={handleDispatch}
              disabled={dispatching || dispatched}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 ${
                dispatched
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white hover:bg-red-700 active:scale-98'
              }`}
            >
              {dispatched ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> DISPATCH ACKNOWLEDGED BY VOLUNTEER TEAM
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> DISPATCH RESPONSE TO FIELD VOLUNTEERS
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center space-y-2">
          <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">SYSTEM NORMAL</h3>
          <p className="text-xs text-slate-500">
            No immediate intervention required. All monitored zones are currently within safe operational thresholds.
          </p>
        </div>
      )}
    </div>
  )
}
