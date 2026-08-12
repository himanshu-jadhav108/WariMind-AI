import { useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import PilgrimView from './pages/PilgrimView.jsx'

export default function App() {
  const [view, setView] = useState('organizer')

  return (
    <div>
      <div className="fixed bottom-4 right-4 z-40 bg-white rounded-full shadow-md border border-neutral-200 flex text-sm overflow-hidden">
        <button
          onClick={() => setView('organizer')}
          className={`px-4 py-2 font-medium ${view === 'organizer' ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
        >
          Organizer
        </button>
        <button
          onClick={() => setView('pilgrim')}
          className={`px-4 py-2 font-medium ${view === 'pilgrim' ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
        >
          Pilgrim
        </button>
      </div>

      {view === 'organizer' ? <Dashboard /> : <PilgrimView />}
    </div>
  )
}
