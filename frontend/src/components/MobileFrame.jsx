import { useState } from 'react'
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react'

export default function MobileFrame({ children, title = 'Mobile Experience', subtitle }) {
  const [useFrame, setUseFrame] = useState(true)

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-65px)] py-6 bg-[#F1F5F9] font-sans">
      {/* Presentation Mode Toggle Controls */}
      <div className="mb-5 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3 text-xs font-semibold text-slate-700">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">PRESENTATION VIEW:</span>
        <button
          onClick={() => setUseFrame(true)}
          className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
            useFrame ? 'bg-blue-600 text-white shadow-sm font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>390×844 Phone Bezel</span>
        </button>
        <button
          onClick={() => setUseFrame(false)}
          className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
            !useFrame ? 'bg-blue-600 text-white shadow-sm font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Width Mobile View</span>
        </button>
      </div>

      {useFrame ? (
        /* Realistic Smartphone Frame (390px x 844px iPhone proportions) */
        <div className="relative w-[390px] h-[844px] bg-slate-900 rounded-[50px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-900/10 flex flex-col justify-between">
          {/* Phone Top Dynamic Island / Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-full z-50 flex items-center justify-end px-2.5 gap-1.5 border border-slate-800">
            <div className="w-2.5 h-2.5 bg-slate-800 rounded-full" />
            <div className="w-2.5 h-2.5 bg-blue-900/80 rounded-full ring-1 ring-blue-500/50" />
          </div>

          {/* Phone Inner Screen Container */}
          <div className="w-full h-full bg-slate-50 rounded-[38px] overflow-hidden flex flex-col pt-7 relative">
            {/* Status Bar */}
            <div className="px-6 pt-1 pb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-900 bg-white border-b border-slate-100 shrink-0 z-40">
              <span className="font-mono">09:41</span>
              <div className="flex items-center gap-1.5 text-slate-800">
                <Signal className="w-3 h-3" />
                <span className="text-[10px] font-mono font-bold text-slate-600">5G</span>
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5 text-slate-900 fill-current" />
              </div>
            </div>

            {/* Scrollable Mobile App Screen */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
              {children}
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="w-full py-2 bg-white flex justify-center items-center shrink-0 border-t border-slate-100">
              <div className="w-32 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        /* Standard Viewport Container */
        <div className="w-full max-w-md mx-auto bg-slate-50 rounded-2xl border border-slate-200 shadow-md p-4">
          {children}
        </div>
      )}
    </div>
  )
}
