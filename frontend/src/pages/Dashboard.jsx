import { useEffect, useState } from 'react'
import { Play, Pause, RotateCcw, Monitor } from 'lucide-react'
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
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 flex flex-col font-sans">
      {/* Top Main Operations Status Header */}
      <StatusBar status={data.status} zoneDensity={data.analytics?.zone_density} />

      {/* Main 16:9 Presentation Workspace */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-5 flex-1">
        {/* Scenario Controls Toolbar */}
        <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartScenario}
              disabled={loadingAction}
              className="px-4 py-2 text-xs font-black rounded-xl bg-blue-600 hover:bg-blue-700 text-white active:scale-98 transition shadow-sm flex items-center gap-1.5 uppercase tracking-wider"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START SCENARIO</span>
            </button>
            <button
              onClick={handleStop}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5 text-slate-600" />
              <span>PAUSE</span>
            </button>
            <button
              onClick={handleReset}
              disabled={loadingAction}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>RESET DEMO</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 font-mono text-[11px] flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-blue-600" />
              PRESENTATION MODE (16:9 SCREEN RECORDING)
            </span>
          </div>
        </div>

        {/* 1. HERO OPERATIONS AREA: Video Monitor (~65% Left) & Digital Twin (~35% Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <LiveVideoPanel status={data.status} analytics={data.analytics} />
          </div>
          <div className="lg:col-span-5 flex flex-col">
            <DigitalTwin zoneDensity={data.analytics?.zone_density} recommendation={data.recommendations?.recommendation} />
          </div>
        </div>

        {/* 2. HERO KPIs: Total People, Density Score, Flow Direction, Risk Level */}
        <AnalyticsPanel analytics={data.analytics} risk={data.risk} />

        {/* 3. DECISION & EXPLAINABILITY: Risk Engine (Why) & AI Decision Engine (What) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RiskExplainabilityPanel risk={data.risk} />
          <DecisionPanel recommendation={data.recommendations?.recommendation} />
        </div>

        {/* 4. AUDIT TRAIL: Live Event Stream */}
        <EventLog events={data.events} />

        {data.error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl p-3 font-mono">
            Notice: {data.error}
          </div>
        )}
      </div>

      {/* Dispatch Modal Alert */}
      <VolunteerAlert alert={data.recommendations?.volunteer_alert} status={data.status?.status || data.status} />
    </div>
  )
}
