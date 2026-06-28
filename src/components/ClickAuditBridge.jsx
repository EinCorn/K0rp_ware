import { useEffect, useMemo, useState } from 'react'
import { fetchClickAuditState, sendClickAuditCommand } from '../core/clickAuditClient'

const POLL_MS = 750

function ClickAuditBridge() {
  const [state, setState] = useState(null)
  const [connection, setConnection] = useState('probing')
  const [error, setError] = useState('')
  const [isCommandPending, setIsCommandPending] = useState(false)

  useEffect(() => {
    let isMounted = true
    let timeoutId
    let controller

    async function poll() {
      controller?.abort()
      controller = new AbortController()

      try {
        const nextState = await fetchClickAuditState({ signal: controller.signal })

        if (!isMounted) {
          return
        }

        setState(nextState)
        setConnection('connected')
        setError('')
      } catch (requestError) {
        if (!isMounted || requestError.name === 'AbortError') {
          return
        }

        setConnection('disconnected')
        setError('ClickAudit desktop app is not reachable on 127.0.0.1:47891.')
      } finally {
        if (isMounted) {
          timeoutId = window.setTimeout(poll, POLL_MS)
        }
      }
    }

    poll()

    return () => {
      isMounted = false
      window.clearTimeout(timeoutId)
      controller?.abort()
    }
  }, [])

  const connectionLabel = useMemo(() => {
    if (connection === 'connected') {
      return state?.running ? 'Connected / Counting' : 'Connected / Paused'
    }

    if (connection === 'probing') {
      return 'Searching localhost'
    }

    return 'Disconnected'
  }, [connection, state?.running])

  async function runCommand(command, payload) {
    setIsCommandPending(true)
    setError('')

    try {
      const nextState = await sendClickAuditCommand(command, payload)
      setState(nextState)
      setConnection('connected')
    } catch {
      setConnection('disconnected')
      setError('Command failed. Check whether ClickAudit is running locally.')
    } finally {
      setIsCommandPending(false)
    }
  }

  const clicks = state?.globalClicks ?? 0
  const alwaysOnTop = Boolean(state?.alwaysOnTop)
  const running = Boolean(state?.running)

  return (
    <section className="local-bridge-panel" aria-label="Local desktop modules">
      <div className="local-bridge-header">
        <div>
          <p className="system-label">Local bridge / desktop organisms</p>
          <h2>ClickAudit</h2>
          <p>
            Mirrors aggregate click progress from the local desktop app. Data stays on this machine;
            the web dashboard only reads <code>127.0.0.1</code>.
          </p>
        </div>
        <span className={`bridge-pill ${connection}`}>{connectionLabel}</span>
      </div>

      <div className="bridge-readout-grid">
        <div className="bridge-readout-card hero-count">
          <span>Global clicks</span>
          <strong>{clicks.toLocaleString('en-US')}</strong>
        </div>
        <div className="bridge-readout-card">
          <span>Status</span>
          <strong>{running ? 'Counting' : 'Paused'}</strong>
        </div>
        <div className="bridge-readout-card">
          <span>Always on top</span>
          <strong>{alwaysOnTop ? 'On' : 'Off'}</strong>
        </div>
        <div className="bridge-readout-card">
          <span>Privacy</span>
          <strong>{state?.privacyMode ?? 'aggregate-only'}</strong>
        </div>
      </div>

      <div className="bridge-actions">
        <button disabled={isCommandPending} type="button" onClick={() => runCommand('start')}>
          Start
        </button>
        <button disabled={isCommandPending} type="button" onClick={() => runCommand('pause')}>
          Pause
        </button>
        <button disabled={isCommandPending} type="button" onClick={() => runCommand('reset')}>
          Reset
        </button>
        <button
          disabled={isCommandPending}
          type="button"
          onClick={() => runCommand('always-on-top', { enabled: !alwaysOnTop })}
        >
          {alwaysOnTop ? 'Unpin' : 'Pin'}
        </button>
      </div>

      {error && <p className="bridge-error">{error}</p>}
    </section>
  )
}

export default ClickAuditBridge
