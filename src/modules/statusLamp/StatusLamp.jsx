import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { openDetachedWindow } from '../../core/detachedWindow'
import { publishEvent } from '../../core/eventBus'
import { requestPinnedWindow, supportsPinnedWindow } from '../../core/pinnedWindow'
import { writeStorage } from '../../core/storage'
import { formatElapsed } from '../../core/time'
import { STATUS_LAMP_STORAGE_KEY, messages, statuses } from './statusLampData'
import { getInitialStatus } from './statusLampState'
import './statusLamp.css'

function StatusLamp({ isDetached }) {
  const [state, setState] = useState(getInitialStatus)
  const [now, setNow] = useState(Date.now())
  const [messageIndex, setMessageIndex] = useState(0)
  const [pinWindow, setPinWindow] = useState(null)
  const [notice, setNotice] = useState('')

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

  useEffect(() => {
    if (!pinWindow) {
      return undefined
    }

    const handleClose = () => setPinWindow(null)
    pinWindow.addEventListener('pagehide', handleClose)

    return () => pinWindow.removeEventListener('pagehide', handleClose)
  }, [pinWindow])

  function setStatus(statusId) {
    const nextState = {
      statusId,
      startedAt: Date.now(),
    }

    setState(nextState)
    publishEvent('status-lamp:status-changed', nextState)
  }

  async function pinStatusLamp() {
    setNotice('')

    if (!supportsPinnedWindow()) {
      setNotice('Pin režim není v tomhle prohlížeči podporovaný. Otevírám běžné oddělené okno.')
      openDetachedWindow('status-lamp')
      return
    }

    try {
      const nextPinWindow = await requestPinnedWindow({ width: 420, height: 680 })
      setPinWindow(nextPinWindow)
      setNotice('Pin režim aktivní. Stolní modul by měl držet nad ostatními okny v podporovaných prohlížečích.')
    } catch {
      setNotice('Pin režim byl blokován nebo zavřen. Otevírám běžné oddělené okno.')
      openDetachedWindow('status-lamp')
    }
  }

  const lampPanel = (
    <StatusLampPanel
      currentStatus={currentStatus}
      elapsed={formatElapsed(now - state.startedAt)}
      isPinned={false}
      message={messages[messageIndex]}
      onChangeStatus={setStatus}
      onPin={pinStatusLamp}
      showActions={!isDetached}
    />
  )

  const pinnedRoot = pinWindow?.document.getElementById('k0rp-pinned-root')

  return (
    <main className={isDetached ? 'status-shell detached' : 'status-shell'}>
      {!isDetached && (
        <nav className="top-nav" aria-label="Navigace pultu">
          <a href="/">Pult</a>
          <div className="top-nav-actions">
            <button type="button" onClick={() => openDetachedWindow('status-lamp')}>
              Oddělit
            </button>
            <button type="button" onClick={pinStatusLamp}>
              Pin
            </button>
          </div>
        </nav>
      )}

      {notice && <p className="mode-notice">{notice}</p>}
      {lampPanel}

      {pinnedRoot &&
        createPortal(
          <main className="status-shell detached pinned">
            <StatusLampPanel
              currentStatus={currentStatus}
              elapsed={formatElapsed(now - state.startedAt)}
              isPinned
              message={messages[messageIndex]}
              onChangeStatus={setStatus}
              onPin={pinStatusLamp}
              showActions={false}
            />
          </main>,
          pinnedRoot,
        )}
    </main>
  )
}

function StatusLampPanel({ currentStatus, elapsed, isPinned, message, onChangeStatus, onPin, showActions }) {
  return (
    <section className="lamp-window" data-severity={currentStatus.severity}>
      <div className="window-header">
        <div className="window-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>K0rp_ware / Stavová lampa{isPinned ? ' / pin' : ''}</p>
      </div>

      <div className="lamp-body">
        <p className="system-label">Aktuální pracovní mezistav</p>
        <div className="lamp-status-row">
          <span className="status-light" aria-hidden="true"></span>
          <h1>{currentStatus.label}</h1>
        </div>
        <p className="status-description">{currentStatus.description}</p>

        <div className="readout-grid">
          <div className="readout-card">
            <span>Čas</span>
            <strong>{elapsed}</strong>
          </div>
          <div className="readout-card">
            <span>Compliance</span>
            <strong>Neověřeno</strong>
          </div>
        </div>

        <blockquote className="message-feed">{message}</blockquote>

        <div className="status-buttons" aria-label="Možnosti stavu">
          {statuses.map((status) => (
            <button
              className={status.id === currentStatus.id ? 'active' : ''}
              key={status.id}
              type="button"
              onClick={() => onChangeStatus(status.id)}
            >
              {status.label}
            </button>
          ))}
        </div>

        {showActions && (
          <div className="lamp-actions">
            <button type="button" onClick={onPin}>
              Připíchnout nahoru
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default StatusLamp
