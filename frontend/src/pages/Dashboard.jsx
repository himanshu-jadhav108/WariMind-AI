import { useEffect, useState } from 'react'
import { Play, Pause, RotateCcw, Monitor, CheckCircle2, ShieldAlert } from 'lucide-react'
import { startPolling, api } from '../services/api'
import StatusBar from '../components/StatusBar'
import LiveVideoPanel from '../components/LiveVideoPanel'
import DigitalTwin from '../components/DigitalTwin'
import AnalyticsPanel from '../components/AnalyticsPanel'
import RiskExplainabilityPanel from '../components/RiskExplainabilityPanel'
import DecisionPanel from '../components/DecisionPanel'
import EventLog from '../components/EventLog'
import VolunteerAlert from '../components/VolunteerAlert'

export default function Dashboard() {
  const [data, setData] = useState({})
  const [loadingAction, setLoadingAction] = useState(false)

  useEffect(() => {
    const stop = startPolling(setData, 1000)
    return stop
  }, [])

  const handleStartScenario = async () => {
    setLoadingAction(true)
    try {
      await api.startScenario()
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleReset = async () => {
    setLoadingAction(true)
    try {
      await api.resetDemo()
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingAction(false)
    }
  }

  const handleStop = async () => {
    try {
      await api.stopDemo()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 flex flex-col font-sans">
      {/* Top Header & Status Strip */}
      <StatusBar status={data.status} zoneDensity={data.analytics?.zone_density} />

      {/* Main Container */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-4 flex-1">
        {/* Scenario Controls Toolbar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartScenario}
              disabled={loadingAction}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-98 transition shadow-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START SCENARIO</span>
            </button>
            <button
              onClick={handleStop}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5 text-slate-600" />
              <span>PAUSE</span>
            </button>
            <button
              onClick={handleReset}
              disabled={loadingAction}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>RESET</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-blue-600" /> PRESENTATION MODE (16:9 RECORDING LAYOUT)
            </span>
          </div>
        </div>

        {/* 2-Column Main Hero Grid (Video + Map equal weight) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LiveVideoPanel status={data.status} analytics={data.analytics} />
          <DigitalTwin zoneDensity={data.analytics?.zone_density} recommendation={data.recommendations?.recommendation} />
        </div>

        {/* Live Intelligence KPI Cards */}
        <AnalyticsPanel analytics={data.analytics} risk={data.risk} />

        {/* Risk Explainability & AI Decision Engine Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RiskExplainabilityPanel risk={data.risk} />
          <DecisionPanel recommendation={data.recommendations?.recommendation} />
        </div>

        {/* Live Event Stream Timeline */}
        <EventLog events={data.events} />

        {data.error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3 font-mono">
            Notice: {data.error}
          </div>
        )}
      </div>

      {/* Volunteer Alert Dispatch Modal */}
      <VolunteerAlert alert={data.recommendations?.volunteer_alert} />
    </div>
  )
}
