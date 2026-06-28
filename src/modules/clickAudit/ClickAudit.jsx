import { useEffect, useMemo, useState } from 'react'
import { getClickState, resetClickState } from '../../core/clickStore'
import { openDetachedWindow } from '../../core/detachedWindow'
import { subscribeToEvents } from '../../core/eventBus'

function ClickAudit({ isDetached }) {
  const [clickState, setClickState] = useState(getClickState)
  const [openedAt] = useState(Date.now())
  const [sessionClicks, setSessionClicks] = useState(0)

  useEffect(() => {
    return subscribeToEvents((event) => {
      if (event.type === 'input:click-recorded') {
        setClickState(event.payload.state)
        setSessionClicks((count) => count + 1)
      }

      if (event.type === 'input:click-reset') {
        setClickState(event.payload.state)
        setSessionClicks(0)
      }
    })
  }, [])

  const clicksPerMinute = useMemo(() => {
    const oneMinuteAgo = Date.now() - 60_000
    const recentCount = clickState.recentClicks.filter((click) => Date.parse(click.createdAt) > oneMinuteAgo).length

    return recentCount
  }, [clickState.recentClicks])

  const topSources = Object.entries(clickState.bySource).sort((a, b) => b[1] - a[1])
  const auditedMinutes = Math.max(1, Math.round((Date.now() - openedAt) / 60000))

  function handleReset() {
    setClickState(resetClickState())
    setSessionClicks(0)
  }

  return (
    <main className={isDetached ? 'status-shell detached' : 'status-shell'}>
      {!isDetached && (
        <nav className="top-nav" aria-label="Dashboard navigation">
          <a href="/">Dashboard</a>
          <button type="button" onClick={() => openDetachedWindow('click-audit')}>
            Detach
          </button>
        </nav>
      )}

      <section className="utility-window click-audit-window">
        <div className="window-header">
          <div className="window-dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>K0rp_ware / ClickAudit</p>
        </div>

        <div className="utility-body">
          <p className="system-label">Input telemetry inside approved reality</p>
          <h1>ClickAudit</h1>
          <p className="status-description">
            Counts clicks inside K0rp_ware windows. External activity remains unaudited and therefore formally suspicious.
          </p>

          <div className="readout-grid three-up">
            <div className="readout-card">
              <span>Lifetime clicks</span>
              <strong>{clickState.total}</strong>
            </div>
            <div className="readout-card">
              <span>This audit view</span>
              <strong>{sessionClicks}</strong>
            </div>
            <div className="readout-card">
              <span>Clicks / min</span>
              <strong>{clicksPerMinute}</strong>
            </div>
          </div>

          <div className="audit-grid">
            <article className="audit-panel">
              <h2>Sources</h2>
              {topSources.length === 0 ? (
                <p>No approved clicks registered.</p>
              ) : (
                <ol className="source-list">
                  {topSources.map(([source, count]) => (
                    <li key={source}>
                      <span>{source}</span>
                      <strong>{count}</strong>
                    </li>
                  ))}
                </ol>
              )}
            </article>

            <article className="audit-panel">
              <h2>Recent evidence</h2>
              {clickState.recentClicks.length === 0 ? (
                <p>Evidence buffer empty.</p>
              ) : (
                <ol className="evidence-list">
                  {clickState.recentClicks.slice(0, 8).map((click) => (
                    <li key={click.id}>
                      <span>{click.source}</span>
                      <small>{new Date(click.createdAt).toLocaleTimeString()}</small>
                    </li>
                  ))}
                </ol>
              )}
            </article>
          </div>

          <div className="module-card-footer audit-actions">
            <span className="module-status">Audited for {auditedMinutes} min</span>
            <button type="button" onClick={handleReset}>Reset audit</button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default ClickAudit
