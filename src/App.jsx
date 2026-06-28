import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'k0rp-ware.status-lamp.state'

const statuses = [
  {
    id: 'available',
    label: 'Available',
    severity: 'green',
    description: 'The user is technically present. This condition may be temporary.',
  },
  {
    id: 'thinking',
    label: 'Thinking',
    severity: 'blue',
    description: 'Visible output is not currently recommended.',
  },
  {
    id: 'deep-work-lying',
    label: 'Deep Work, but lying',
    severity: 'amber',
    description: 'A protected state for professionally framed internal drift.',
  },
  {
    id: 'strategically-unavailable',
    label: 'Strategically Unavailable',
    severity: 'red',
    description: 'Presence has been moved to a later phase of alignment.',
  },
  {
    id: 'waiting-for-context',
    label: 'Waiting for Context',
    severity: 'violet',
    description: 'No action can be performed until the surrounding fog is approved.',
  },
  {
    id: 'buffering',
    label: 'Buffering',
    severity: 'gray',
    description: 'The organism is processing silence.',
  },
  {
    id: 'mentally-in-standup',
    label: 'Mentally in Standup',
    severity: 'amber',
    description: 'The body remains seated. The mind is reporting blockers.',
  },
]

const messages = [
  'Passive intent detected. Please remain professionally unavailable.',
  'Context acquisition pending. Productivity is not recommended at this time.',
  'Micro-delay classified as alignment-adjacent.',
  'Task visibility has been reduced for associate wellbeing.',
  'No critical output detected. This is within expected parameters.',
  'A thought has entered pre-processing and may not survive review.',
  'Current inactivity level supports long-term ambiguity.',
  'The dashboard has acknowledged your implied effort.',
  'Please do not mistake motion for progress. That is management\'s job.',
]

const modules = [
  {
    id: 'status-lamp',
    title: 'StatusLamp',
    eyebrow: 'Desk Parasite Prototype',
    description:
      'A compact status module for professionally structured absence, thinking, and other work-adjacent phenomena.',
    status: 'v0.1 live',
  },
]

function getInitialStatus() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    const isKnownStatus = statuses.some((status) => status.id === saved?.statusId)

    if (isKnownStatus) {
      return saved
    }
  } catch {
    // Invalid localStorage content is non-critical office fog.
  }

  return {
    statusId: 'buffering',
    startedAt: Date.now(),
  }
}

function formatElapsed(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
  }

  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

function App() {
  const searchParams = new URLSearchParams(window.location.search)
  const activeApp = searchParams.get('app')
  const mode = searchParams.get('mode')
  const isDetached = mode === 'detached'

  if (activeApp === 'status-lamp') {
    return <StatusLamp isDetached={isDetached} />
  }

  return <Dashboard />
}

function Dashboard() {
  return (
    <main className="dashboard-shell">
      <section className="hero-panel">
        <p className="system-label">K0rp_ware / internal tools</p>
        <h1>Dashboard</h1>
        <p className="hero-copy">
          Small web-based desk parasites for controlled procrastination, ritualized delay, and
          professionally framed non-output.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="/?app=status-lamp">
            Launch StatusLamp
          </a>
          <button className="ghost-button" type="button" onClick={() => openDetachedWindow('status-lamp')}>
            Enable Desk Parasite Mode
          </button>
        </div>
      </section>

      <section className="module-grid" aria-label="Available modules">
        {modules.map((module) => (
          <article className="module-card" key={module.id}>
            <div>
              <p className="system-label">{module.eyebrow}</p>
              <h2>{module.title}</h2>
              <p>{module.description}</p>
            </div>
            <div className="module-card-footer">
              <span className="module-status">{module.status}</span>
              <a href={`/?app=${module.id}`}>Open</a>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

function StatusLamp({ isDetached }) {
  const [state, setState] = useState(getInitialStatus)
  const [now, setNow] = useState(Date.now())
  const [messageIndex, setMessageIndex] = useState(0)

  const currentStatus = useMemo(
    () => statuses.find((status) => status.id === state.statusId) ?? statuses[0],
    [state.statusId],
  )

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % messages.length)
    }, 9000)

    return () => window.clearInterval(intervalId)
  }, [])

  function setStatus(statusId) {
    setState({
      statusId,
      startedAt: Date.now(),
    })
  }

  return (
    <main className={isDetached ? 'status-shell detached' : 'status-shell'}>
      {!isDetached && (
        <nav className="top-nav" aria-label="Dashboard navigation">
          <a href="/">← Dashboard</a>
          <button type="button" onClick={() => openDetachedWindow('status-lamp')}>
            Detach
          </button>
        </nav>
      )}

      <section className="lamp-window" data-severity={currentStatus.severity}>
        <div className="window-header">
          <div className="window-dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>K0rp_ware / StatusLamp</p>
        </div>

        <div className="lamp-body">
          <p className="system-label">Current work-adjacent condition</p>
          <div className="lamp-status-row">
            <span className="status-light" aria-hidden="true"></span>
            <h1>{currentStatus.label}</h1>
          </div>
          <p className="status-description">{currentStatus.description}</p>

          <div className="readout-grid">
            <div className="readout-card">
              <span>Elapsed</span>
              <strong>{formatElapsed(now - state.startedAt)}</strong>
            </div>
            <div className="readout-card">
              <span>Compliance</span>
              <strong>Unverified</strong>
            </div>
          </div>

          <blockquote className="message-feed">{messages[messageIndex]}</blockquote>

          <div className="status-buttons" aria-label="Status options">
            {statuses.map((status) => (
              <button
                className={status.id === currentStatus.id ? 'active' : ''}
                key={status.id}
                type="button"
                onClick={() => setStatus(status.id)}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function openDetachedWindow(appId) {
  const detachedUrl = `${window.location.origin}/?app=${appId}&mode=detached`
  const features = 'popup=yes,width=420,height=680,menubar=no,toolbar=no,location=no,status=no'
  window.open(detachedUrl, 'k0rp-ware-desk-parasite', features)
}

export default App
