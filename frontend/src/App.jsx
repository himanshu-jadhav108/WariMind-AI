import { useState } from 'react'
import { LayoutDashboard, UserCheck, HeartHandshake } from 'lucide-react'
import Dashboard from './pages/Dashboard.jsx'
import VolunteerControlView from './pages/VolunteerControlView.jsx'
import PilgrimView from './pages/PilgrimView.jsx'
import MobileFrame from './components/MobileFrame.jsx'
import Logo from './components/Logo.jsx'

export default function App() {
  const [view, setView] = useState('organizer')

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900 selection:bg-blue-100">
      {/* Top Presentation Role Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-6 py-2.5 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Logo size="sm" showSubtitle={false} variant="dark" />
          <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-widest text-slate-400 border-l border-slate-800 pl-3">
            Varithon 2026 Stage 2 Pitch Demo
          </span>
        </div>

        {/* Role Switcher Tabs */}
        <nav className="bg-slate-800 p-1 rounded-xl flex text-xs font-semibold border border-slate-700">
          <button
            onClick={() => setView('organizer')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
              view === 'organizer' ? 'bg-blue-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>COMMAND CENTER</span>
          </button>
          <button
            onClick={() => setView('volunteer')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
              view === 'volunteer' ? 'bg-blue-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>VOLUNTEER MOBILE</span>
          </button>
          <button
            onClick={() => setView('pilgrim')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
              view === 'pilgrim' ? 'bg-blue-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>PILGRIM MOBILE</span>
          </button>
        </nav>
      </header>

      {/* Main Presentation View Router */}
      <main>
        {view === 'organizer' && <Dashboard />}
        {view === 'volunteer' && (
          <MobileFrame title="Volunteer Mobile App" subtitle="Field Operations Dispatch">
            <VolunteerControlView />
          </MobileFrame>
        )}
        {view === 'pilgrim' && (
          <MobileFrame title="Pilgrim Mobile App" subtitle="Pilgrim Safety Companion">
            <PilgrimView />
          </MobileFrame>
        )}
      </main>
    </div>
  )
}

