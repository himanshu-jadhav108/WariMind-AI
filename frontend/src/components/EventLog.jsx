import { Activity, CheckCircle2, TrendingUp, AlertTriangle, ShieldAlert, Bot, UserCheck, Clock } from 'lucide-react'

export default function EventLog({ events }) {
  const evList = events && events.length > 0 ? events : [
    { time: '14:32:11', message: '✓ Crowd monitoring started' },
    { time: '14:32:24', message: '↑ Density increasing — Zone B' },
    { time: '14:32:31', message: '⚠ High-risk threshold approaching' },
    { time: '14:32:36', message: '🔴 HIGH CROWD RISK — Zone B' },
    { time: '14:32:36', message: '🤖 Decision recommendation generated' },
    { time: '14:32:37', message: '👤 Volunteer alert dispatched' },
    { time: '14:32:45', message: '✓ Response acknowledged by field team' },
  ]

  const extractText = (ev) => {
    if (!ev) return ''
    if (typeof ev === 'string') return ev
    if (typeof ev === 'object') return ev.message || ev.text || ev.event || ''
    return String(ev)
  }

  const extractTime = (ev) => {
    if (ev && typeof ev === 'object' && ev.time) return ev.time
    if (ev && typeof ev === 'object' && ev.timestamp) return ev.timestamp
    return ''
  }

  const getStyle = (rawText) => {
    if (rawText.includes('HIGH CROWD RISK') || rawText.includes('🔴')) {
      return { dot: 'bg-red-500 ring-4 ring-red-100', badge: 'bg-red-50 text-red-900 border-red-200 font-bold' }
    }
    if (rawText.includes('increasing') || rawText.includes('approaching') || rawText.includes('⚠') || rawText.includes('↑')) {
      return { dot: 'bg-amber-500 ring-4 ring-amber-100', badge: 'bg-amber-50 text-amber-900 border-amber-200' }
    }
    if (rawText.includes('acknowledged') || rawText.includes('✓')) {
      return { dot: 'bg-emerald-500 ring-4 ring-emerald-100', badge: 'bg-emerald-50 text-emerald-900 border-emerald-200 font-semibold' }
    }
    return { dot: 'bg-blue-500 ring-4 ring-blue-100', badge: 'bg-slate-50 text-slate-800 border-slate-200' }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h2 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">
            LIVE EVENT STREAM
          </h2>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" /> Real-time Audit Trail
        </span>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {evList.slice().reverse().map((ev, idx) => {
          const textStr = extractText(ev)
          const timeStr = extractTime(ev)
          const style = getStyle(textStr)

          return (
            <div
              key={idx}
              className={`flex items-center justify-between text-xs p-2.5 rounded-xl border transition-all ${style.badge}`}
            >
              <div className="flex items-center gap-2.5 font-medium">
                <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                <span className="truncate">{textStr}</span>
              </div>
              {timeStr && <span className="font-mono text-[10px] text-slate-500 shrink-0 font-bold ml-2">{timeStr}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
