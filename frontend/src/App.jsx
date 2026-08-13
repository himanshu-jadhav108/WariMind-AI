import { useState } from 'react'
import { LayoutDashboard, UserCheck, HeartHandshake } from 'lucide-react'
import Dashboard from './pages/Dashboard.jsx'
import VolunteerControlView from './pages/VolunteerControlView.jsx'
import PilgrimView from './pages/PilgrimView.jsx'
import Logo from './components/Logo.jsx'

export default function App() {
  const [view, setView] = useState('organizer')

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans antialiased text-slate-900">
      {/* Top Role Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-6 py-2.5 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Logo size="sm" showSubtitle={false} variant="dark" />
        </div>

        {/* Role Switcher Tabs */}
        <nav className="bg-slate-800 p-1 rounded-xl flex text-xs font-semibold border border-slate-700">
          <button
            onClick={() => setView('organizer')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 ${
              view === 'organizer' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Organizer Command Center</span>
          </button>
          <button
            onClick={() => setView('volunteer')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 ${
              view === 'volunteer' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Volunteer Control</span>
          </button>
          <button
            onClick={() => setView('pilgrim')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-2 ${
              view === 'pilgrim' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Pilgrim Companion</span>
          </button>
        </nav>
      </header>

      {/* Main View Router */}
      <main>
        {view === 'organizer' && <Dashboard />}
        {view === 'volunteer' && <VolunteerControlView />}
        {view === 'pilgrim' && <PilgrimView />}
      </main>
    </div>
  )
}
