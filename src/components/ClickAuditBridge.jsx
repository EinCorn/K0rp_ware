import { useEffect, useState } from 'react'
import { fetchClickAuditState, setClickAuditAlwaysOnTop } from '../core/clickAuditClient'

const POLL_MS = 500

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
        setError('Local ClickAudit endpoint is not reachable from this browser.')
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

  async function togglePin() {
    const nextPinnedState = !Boolean(state?.alwaysOnTop)
    setIsCommandPending(true)
    setError('')

    try {
      const nextState = await setClickAuditAlwaysOnTop(nextPinnedState)
      setState(nextState)
      setConnection('connected')
    } catch {
      setConnection('disconnected')
      setError('Pin command failed. Check whether ClickAudit is running locally.')
    } finally {
      setIsCommandPending(false)
    }
  }

  const clicks = state?.globalClicks ?? 0
  const isConnected = connection === 'connected'
  const alwaysOnTop = Boolean(state?.alwaysOnTop)

  return (
    <section className="local-bridge-panel minimal" aria-label="ClickAudit local counter">
      <div className="bridge-counter-row">
        <div>
          <p className="system-label">ClickAudit / local</p>
          <strong className="bridge-counter">{clicks.toLocaleString('en-US')}</strong>
        </div>

        <div className="bridge-side-actions">
          <span className={`bridge-pill ${connection}`}>
            {isConnected ? 'Connected' : connection === 'probing' ? 'Searching' : 'Disconnected'}
          </span>
          <button disabled={!isConnected || isCommandPending} type="button" onClick={togglePin}>
            {alwaysOnTop ? 'Unpin' : 'Pin'}
          </button>
        </div>
      </div>

      {error && <p className="bridge-error">{error}</p>}
    </section>
  )
}

export default ClickAuditBridge
