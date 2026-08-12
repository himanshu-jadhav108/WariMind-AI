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
}

/**
 * Polls all dashboard endpoints on an interval and delivers a merged
 * snapshot via onUpdate. Falls back to plain polling (no websocket) so it
 * works identically on any network setup during the live demo.
 */
export function startPolling(onUpdate, intervalMs = 1000) {
  let cancelled = false

  async function tick() {
    if (cancelled) return
    try {
      const [status, analytics, risk, recommendations, events] = await Promise.all([
        api.status(), api.analytics(), api.risk(), api.recommendations(), api.events(),
      ])
      onUpdate({ status, analytics, risk, recommendations, events: events.events })
    } catch (e) {
      onUpdate({ error: e.message })
    }
    if (!cancelled) setTimeout(tick, intervalMs)
  }
  tick()

  return () => { cancelled = true }
}
