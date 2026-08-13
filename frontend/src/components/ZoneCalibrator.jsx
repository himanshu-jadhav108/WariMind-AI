import { useState, useEffect, useRef } from 'react'
import { Crosshair, Save, RotateCcw, X, Check, Layers, Info } from 'lucide-react'
import { api } from '../services/api'

export default function ZoneCalibrator({ isOpen, onClose }) {
  const [zones, setZones] = useState([])
  const [activeZoneId, setActiveZoneId] = useState('ZONE B')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, normX: 0, normY: 0 })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      loadZoneConfig()
    }
  }, [isOpen])

  const loadZoneConfig = async () => {
    try {
      const data = await api.getZones()
      if (data && data.zones) {
        setZones(data.zones)
      }
    } catch (e) {
      console.error('Failed to load zone config:', e)
    }
  }

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top))
    const normX = parseFloat((x / rect.width).toFixed(4))
    const normY = parseFloat((y / rect.height).toFixed(4))

    setMousePos({
      x: Math.round(x),
      y: Math.round(y),
      normX,
      normY,
    })
  }

  const handleCanvasClick = () => {
    if (!activeZoneId) return
    const newPt = [mousePos.normX, mousePos.normY]

    setZones((prev) =>
      prev.map((z) => {
        if (z.id === activeZoneId) {
          return {
            ...z,
            polygon: [...z.polygon, newPt],
          }
        }
        return z
      })
    )
  }

  const handleClearZone = (zId) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zId ? { ...z, polygon: [] } : z))
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await api.updateZones(zones)
      setMessage('✓ Zone configuration saved to backend!')
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      console.error('Failed to save zones:', e)
      setMessage('Error saving zone configuration.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const activeZone = zones.find((z) => z.id === activeZoneId)

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="font-extrabold text-sm tracking-wide uppercase">ZONE CALIBRATION MODE</h2>
              <p className="text-[10px] text-slate-400 font-mono">
                Click video canvas to define normalized polygon boundaries (0.00 – 1.00)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-bold bg-slate-800 text-emerald-400 px-3 py-1 rounded-lg border border-slate-700">
              MOUSE: {mousePos.x},{mousePos.y} | NORM: ({mousePos.normX}, {mousePos.normY})
            </span>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-4 flex-1 overflow-hidden">
          {/* Left Canvas Preview Area */}
          <div className="lg:col-span-3 p-4 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onClick={handleCanvasClick}
              className="relative aspect-video w-full max-w-3xl bg-slate-900 rounded-xl overflow-hidden border border-slate-700 cursor-crosshair shadow-2xl"
            >
              {/* Live Calibration Video Frame */}
              <img
                src="/api/zones/frame"
                alt="Calibration Frame"
                className="w-full h-full object-contain pointer-events-none select-none"
              />

              {/* Polygon SVG Overlay Canvas */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {zones.map((z) => {
                  if (!z.polygon || z.polygon.length === 0) return null
                  const pointsStr = z.polygon.map((pt) => `${pt[0] * 100}% ${pt[1] * 100}%`).join(', ')
                  const isSelected = z.id === activeZoneId

                  return (
                    <g key={z.id}>
                      <polygon
                        points={z.polygon.map((pt) => `${pt[0] * 100}%,${pt[1] * 100}%`).join(' ')}
                        fill={z.color || '#2563eb'}
                        fillOpacity={isSelected ? '0.3' : '0.15'}
                        stroke={z.color || '#2563eb'}
                        strokeWidth={isSelected ? '3' : '1.5'}
                        strokeDasharray={isSelected ? 'none' : '4 2'}
                      />
                      {z.polygon.map((pt, i) => (
                        <circle
                          key={i}
                          cx={`${pt[0] * 100}%`}
                          cy={`${pt[1] * 100}%`}
                          r={isSelected ? '5' : '3'}
                          fill={z.color || '#2563eb'}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      ))}
                    </g>
                  )
                })}
              </svg>

              {/* Crosshair Cursor Tracking Guide */}
              <div
                className="absolute w-4 h-4 border-2 border-amber-400 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-sm"
                style={{ left: `${mousePos.normX * 100}%`, top: `${mousePos.normY * 100}%` }}
              />
            </div>

            <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Select a zone on the right panel, then click points on the frame to draw polygon vertices.</span>
            </div>
          </div>

          {/* Right Sidebar: Zone List & Controls */}
          <div className="p-4 bg-slate-50 border-l border-slate-200 flex flex-col justify-between space-y-4 overflow-y-auto">
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                SELECT ZONE TO CALIBRATE
              </span>

              <div className="space-y-2">
                {zones.map((z) => {
                  const isSelected = z.id === activeZoneId
                  const countPts = z.polygon?.length || 0

                  return (
                    <div
                      key={z.id}
                      onClick={() => setActiveZoneId(z.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                          : 'bg-white/80 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: z.color || '#2563eb' }}
                          />
                          {z.name || z.id}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {countPts} vertices
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-tight">{z.description}</p>

                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-blue-600 font-bold">● EDITING ACTIVE</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleClearZone(z.id)
                            }}
                            className="text-red-600 hover:text-red-800 font-bold hover:underline"
                          >
                            Clear Vertices
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              {message && (
                <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-center font-mono">
                  {message}
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition active:scale-98 flex items-center justify-center gap-1.5 uppercase"
              >
                <Save className="w-4 h-4" />
                {saving ? 'SAVING...' : 'SAVE ZONE CONFIGURATION'}
              </button>

              <button
                onClick={onClose}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-2 rounded-xl border border-slate-300 transition"
              >
                CLOSE CALIBRATOR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
