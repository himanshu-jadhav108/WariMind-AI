import { Activity, CheckCircle2, TrendingUp, AlertTriangle, ShieldAlert, Bot, UserCheck, Clock } from 'lucide-react'

export default function EventLog({ events }) {
  const evList = events && events.length > 0 ? events : [
    { timestamp: '14:32:11', message: '✓ Crowd monitoring started' },
    { timestamp: '14:32:24', message: '↑ Density increasing — Zone B' },
    { timestamp: '14:32:31', message: '⚠ High-risk threshold approaching' },
    { timestamp: '14:32:36', message: '🔴 HIGH CROWD RISK — Zone B' },
    { timestamp: '14:32:36', message: '🤖 Decision recommendation generated' },
    { timestamp: '14:32:37', message: '👤 Volunteer alert dispatched' },
    { timestamp: '14:32:45', message: '✓ Response acknowledged by field team' },
  ]

  const extractText = (ev) => {
    if (!ev) return ''
    if (typeof ev === 'string') return ev
    if (typeof ev === 'object') return ev.text || ev.message || ev.event || ''
    return String(ev)
  }

  const extractTime = (ev) => {
    if (ev && typeof ev === 'object' && ev.timestamp) return ev.timestamp
    return ''
  }

  const getIcon = (raw) => {
    const text = extractText(raw)
    if (text.includes('HIGH CROWD RISK') || text.includes('🔴')) return <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
    if (text.includes('increasing') || text.includes('↑')) return <TrendingUp className="w-3.5 h-3.5 text-amber-600 shrink-0" />
    if (text.includes('approaching') || text.includes('⚠')) return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
    if (text.includes('Decision') || text.includes('🤖')) return <Bot className="w-3.5 h-3.5 text-blue-600 shrink-0" />
    if (text.includes('Volunteer') || text.includes('👤')) return <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
    return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-slate-900 text-sm tracking-tight">LIVE EVENT STREAM</h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" /> Real-time Audit Trail
        </span>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {evList.map((ev, idx) => {
          const textStr = extractText(ev)
          const timeStr = extractTime(ev)

          return (
            <div
              key={idx}
              className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition"
            >
              <div className="flex items-center gap-2 font-medium text-slate-800">
                {getIcon(ev)}
                <span className="truncate">{textStr}</span>
              </div>
              {timeStr && <span className="font-mono text-[10px] text-slate-400 shrink-0">{timeStr}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
