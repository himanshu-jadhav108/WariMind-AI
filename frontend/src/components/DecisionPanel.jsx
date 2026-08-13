import { useState } from 'react'
import { Bot, AlertTriangle, CheckCircle2, Send, ShieldCheck } from 'lucide-react'
import { api } from '../services/api'

export default function DecisionPanel({ recommendation }) {
  const [dispatching, setDispatching] = useState(false)
  const [dispatched, setDispatched] = useState(false)

  const isTriggered = recommendation?.triggered ?? true
  const zone = recommendation?.zone || 'ZONE B'

  const actions = recommendation?.actions && recommendation.actions.length > 0
    ? recommendation.actions
    : [
        'Deploy volunteers to Zone D & Zone B',
        'Monitor incoming flow into Zone D',
        'Redirect flow via Sector 2 bypass',
        'Position medical support at Zone D & Zone B',
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
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-600" />
          <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">
            AI DECISION ENGINE
          </h2>
        </div>
        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 uppercase tracking-wider">
          RECOMMENDED ACTIONS
        </span>
      </div>

      {isTriggered ? (
        <div className="bg-red-50/70 rounded-xl p-4 border border-red-200 space-y-3 flex-1 flex flex-col justify-between">
          {/* Risk Trigger Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-red-700 bg-red-100 border border-red-300 px-3 py-1 rounded-lg flex items-center gap-1.5 animate-pulse uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              ⚠ CROWD RISK DETECTED — {zone}
            </span>
            <span className="text-[10px] font-mono text-red-700 font-bold uppercase">AUTOMATED INTERVENTION</span>
          </div>

          {/* Action Checklist */}
          <div className="space-y-2 bg-white p-3.5 rounded-xl border border-red-200 text-xs my-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
              RECOMMENDED ACTIONS:
            </span>
            {actions.map((act, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-900 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{act}</span>
              </div>
            ))}
          </div>

          {/* Dispatch Action Button */}
          <button
            onClick={handleDispatch}
            disabled={dispatching || dispatched}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
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
                <Send className="w-4 h-4" /> DISPATCH TASK TO VOLUNTEER MOBILE APP
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center space-y-2 flex-1 flex flex-col justify-center items-center">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">NO INTERVENTION NEEDED</h3>
          <p className="text-xs text-slate-500">
            Monitored zones are within safe density limits. AI decision engine monitoring active.
          </p>
        </div>
      )}
    </div>
  )
}

