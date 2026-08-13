import { Activity } from 'lucide-react'

export default function Logo({ size = 'md', showSubtitle = true, variant = 'light', className = '' }) {
  const sizeMap = {
    sm: { img: 'h-8 w-auto', title: 'text-base', sub: 'text-[10px]' },
    md: { img: 'h-10 w-auto', title: 'text-lg', sub: 'text-xs' },
    lg: { img: 'h-14 w-auto', title: 'text-2xl', sub: 'text-xs' },
  }

  const { img, title, sub } = sizeMap[size] || sizeMap.md
  const isDark = variant === 'dark'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="p-1 rounded-lg bg-white/10 border border-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
        <img
          src="/WariMind_AI_Logo.svg"
          alt="WariMind AI Logo"
          className={`${img} object-contain`}
          onError={(e) => {
            if (!e.target.src.includes('logo.svg')) {
              e.target.src = '/logo.svg'
            }
          }}
        />
      </div>
      <div>
        <div className="flex items-center gap-2 leading-none">
          <h1 className={`${title} font-black tracking-tight font-sans ${isDark ? 'text-white' : 'text-slate-900'}`}>
            WARIMIND<span className="text-blue-500">.AI</span>
          </h1>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 ${
            isDark
              ? 'bg-blue-900/60 text-blue-300 border border-blue-700/60'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <Activity className="w-2.5 h-2.5 text-blue-500" />
            SEE • PREDICT • ACT
          </span>
        </div>
        {showSubtitle && (
          <p className={`${sub} font-medium mt-1 tracking-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            AI-Powered Wari Intelligence Platform
          </p>
        )}
      </div>
    </div>
  )
}
