export default function DecisionPanel({ recommendation }) {
  const triggered = recommendation?.triggered

  const actions = triggered && recommendation?.actions?.length ? recommendation.actions : [
    'Deploy additional volunteers to Zone B',
    'Monitor incoming flow moving North-East',
    'Prepare alternate route activation if Zone B density continues to rise',
    'Position medical support within response range',
  ]

  return (
    <div className={`rounded-xl border p-4 shadow-sm transition-all ${
      triggered ? 'bg-orange-50/80 border-orange-300' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-2">
          <span>AI DECISION ENGINE</span>
          <span className="text-xs font-normal text-slate-400">• Rule-based Response System</span>
        </h2>
        {triggered ? (
          <span className="text-xs font-bold text-red-700 bg-red-100 border border-red-300 px-2.5 py-1 rounded-md animate-pulse">
            ⚠ {recommendation.risk_level} CROWD RISK — {recommendation.zone || 'ZONE B'}
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
            MONITORING ACTIVE
          </span>
        )}
      </div>

      {!triggered ? (
        <p className="text-xs text-slate-500">
          No critical intervention required. {recommendation?.reason || 'Monitoring all zones continuously.'}
        </p>
      ) : (
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-2">
            {recommendation.reason || 'High crowd density & directional convergence detected in Zone B.'}
          </p>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Recommended Operational Actions:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {actions.map((act, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/90 p-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 text-[11px] text-slate-400">
        Deterministic decision rules mapping vision analytics to field response protocols.
      </p>
    </div>
  )
}
