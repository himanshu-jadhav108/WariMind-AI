# WariMind AI — Frontend

React + Vite + Tailwind organizer dashboard, digital twin, and pilgrim view.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`. The dev server proxies `/api` and `/ws`
to `http://localhost:8000` (the backend) — see `vite.config.js`. Start the
backend first (or in parallel), otherwise the dashboard will show "—" for
all values and an error banner from the polling client.

## Structure

```
src/
├── App.jsx                  # view switcher: Organizer / Pilgrim
├── pages/
│   ├── Dashboard.jsx         # main organizer command-center layout
│   └── PilgrimView.jsx       # simple pilgrim-facing screen
├── components/
│   ├── StatusBar.jsx
│   ├── LiveVideoPanel.jsx    # MJPEG feed from /api/video/feed
│   ├── DigitalTwin.jsx       # 2D zone map
│   ├── AnalyticsPanel.jsx    # people/density/flow/risk cards
│   ├── DecisionPanel.jsx     # AI recommendations
│   ├── EventLog.jsx
│   └── VolunteerAlert.jsx    # modal, driven by decision engine output
└── services/api.js           # polling client (1s interval, no websocket dependency)
```

## Notes

- The dashboard polls REST endpoints every second rather than relying only
  on the websocket — this keeps the demo resilient regardless of the venue's
  network setup during the pitch video recording.
- `VolunteerAlert` re-arms automatically whenever the flagged zone changes,
  so a new HIGH/CRITICAL event in a different zone will surface again even
  after a prior alert was acknowledged.
