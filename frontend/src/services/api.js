const BASE = '/api'

async function getJSON(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`)
  return res.json()
}

export const api = {
  status: () => getJSON('/status'),
  analytics: () => getJSON('/analytics'),
  risk: () => getJSON('/risk'),
  recommendations: () => getJSON('/recommendations'),
  events: () => getJSON('/events'),
  startScenario: () => fetch(`${BASE}/scenario/start`, { method: 'POST' }),
  startDemo: () => fetch(`${BASE}/demo/start`, { method: 'POST' }),
  stopDemo: () => fetch(`${BASE}/demo/stop`, { method: 'POST' }),
  startNormal: () => fetch(`${BASE}/normal/start`, { method: 'POST' }),
  acknowledgeVolunteer: () => fetch(`${BASE}/volunteer/acknowledge`, { method: 'POST' }),
  resetDemo: () => fetch(`${BASE}/demo/reset`, { method: 'POST' }),
  getZones: () => getJSON('/zones'),
  updateZones: (zones) => fetch(`${BASE}/zones/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zones }),
  }),
  toggleDebug: () => fetch(`${BASE}/debug/toggle`, { method: 'POST' }),
  benchmark: () => getJSON('/benchmark'),
}

/**
 * Polls all dashboard endpoints on an interval and delivers a merged
 * snapshot via onUpdate. Uses Promise.allSettled for maximum reliability.
 */
export function startPolling(onUpdate, intervalMs = 1000) {
  let cancelled = false

  async function tick() {
    if (cancelled) return
    try {
      const results = await Promise.allSettled([
        api.status(), api.analytics(), api.risk(), api.recommendations(), api.events(),
      ])

      const snapshot = {
        status: results[0].status === 'fulfilled' ? results[0].value : null,
        analytics: results[1].status === 'fulfilled' ? results[1].value : null,
        risk: results[2].status === 'fulfilled' ? results[2].value : null,
        recommendations: results[3].status === 'fulfilled' ? results[3].value : null,
        events: results[4].status === 'fulfilled' ? results[4].value?.events : [],
        error: results.some(r => r.status === 'rejected') ? 'Backend reconnecting...' : null
      }

      onUpdate(snapshot)
    } catch (e) {
      onUpdate({ error: e.message })
    }
    if (!cancelled) setTimeout(tick, intervalMs)
  }
  tick()

  return () => { cancelled = true }
}
