export default function EventLog({ events }) {
  const list = events && events.length ? events.slice().reverse() : [
    { time: '14:32:11', message: '✓ Crowd monitoring started' },
    { time: '14:32:24', message: '↑ Density increasing — Zone B' },
    { time: '14:32:31', message: '⚠ High-risk threshold approaching' },
    { time: '14:32:36', message: '🔴 HIGH CROWD RISK — Zone B' },
    { time: '14:32:36', message: '🤖 AI Decision Engine recommendation generated' },
    { time: '14:32:37', message: '👤 Volunteer alert dispatched' },
    { time: '14:32:45', message: '✓ Response acknowledged by volunteer' },
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-2">
          <span>LIVE EVENT STREAM</span>
          <span className="text-xs font-normal text-slate-400">• Operational Audit Trail</span>
        </h2>
        <span className="text-[10px] font-mono text-slate-400">EVENTS: {list.length}</span>
      </div>

      <div className="space-y-1.5 max-h-44 overflow-y-auto font-mono text-xs p-1">
        {list.map((e, i) => (
          <div key={i} className="flex items-start gap-2 text-slate-700 hover:bg-slate-50 p-1 rounded transition">
            <span className="text-slate-400 shrink-0 font-sans">{e.time}</span>
            <span className="font-sans font-medium">{e.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
