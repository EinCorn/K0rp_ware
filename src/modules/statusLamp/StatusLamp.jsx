import { useEffect, useMemo, useState } from 'react'
import { openDetachedWindow } from '../../core/detachedWindow'
import { publishEvent } from '../../core/eventBus'
import { writeStorage } from '../../core/storage'
import { formatElapsed } from '../../core/time'
import { STATUS_LAMP_STORAGE_KEY, messages, statuses } from './statusLampData'
import { getInitialStatus } from './statusLampState'

function StatusLamp({ isDetached }) {
  const [state, setState] = useState(getInitialStatus)
  const [now, setNow] = useState(Date.now())
  const [messageIndex, setMessageIndex] = useState(0)

  const currentStatus = useMemo(
    () => statuses.find((status) => status.id === state.statusId) ?? statuses[0],
    [state.statusId],
  )

  useEffect(() => {
    writeStorage(STATUS_LAMP_STORAGE_KEY, state)
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
    const nextState = {
      statusId,
      startedAt: Date.now(),
    }

    setState(nextState)
    publishEvent('status-lamp:status-changed', nextState)
  }

  return (
    <main className={isDetached ? 'status-shell detached' : 'status-shell'}>
      {!isDetached && (
        <nav className="top-nav" aria-label="Dashboard navigation">
          <a href="/">Dashboard</a>
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

export default StatusLamp
