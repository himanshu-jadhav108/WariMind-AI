import { useEffect, useState } from 'react'
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header & Route Status Bar */}
      <StatusBar status={data.status} zoneDensity={data.analytics?.zone_density} />

      {/* Main Container */}
      <div className="p-5 max-w-7xl mx-auto w-full space-y-4 flex-1">
        {/* Scenario Controls Toolbar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartScenario}
              disabled={loadingAction}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-98 transition shadow-sm flex items-center gap-1.5"
            >
              <span>🎬 START SCENARIO</span>
            </button>
            <button
              onClick={handleStop}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition"
            >
              ⏸ PAUSE
            </button>
            <button
              onClick={handleReset}
              disabled={loadingAction}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition flex items-center gap-1"
            >
              <span>🔄 RESET</span>
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200 font-mono">
              🎬 PRESENTATION MODE
            </span>
          </div>
        </div>

        {/* Analytics KPI Row */}
        <AnalyticsPanel analytics={data.analytics} risk={data.risk} />

        {/* Video & Digital Twin Twin-Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LiveVideoPanel status={data.status} analytics={data.analytics} />
          <DigitalTwin zoneDensity={data.analytics?.zone_density} recommendation={data.recommendations?.recommendation} />
        </div>

        {/* Risk Explainability & AI Decision Engine Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RiskExplainabilityPanel risk={data.risk} />
          <DecisionPanel recommendation={data.recommendations?.recommendation} />
        </div>

        {/* Event Stream */}
        <EventLog events={data.events} />

        {data.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 font-mono">
            Backend Connection Warning: {data.error}
          </div>
        )}
      </div>

      {/* Volunteer Alert Dispatch Modal */}
      <VolunteerAlert alert={data.recommendations?.volunteer_alert} />
    </div>
  )
}
