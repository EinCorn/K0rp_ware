import { useEffect, useMemo, useState } from 'react'
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
        setError('Waiting for the local ClickAudit companion on 127.0.0.1:47891.')
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

  const apiResponse = useMemo(() => {
    if (!state) {
      return '{\n  "status": "waiting-for-local-companion"\n}'
    }

    return JSON.stringify(state, null, 2)
  }, [state])

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
      setError('Pin command failed. Check whether the desktop companion is running locally.')
    } finally {
      setIsCommandPending(false)
    }
  }

  const clicks = state?.globalClicks ?? 0
  const sourceClicks = state?.sourceClicks ?? {}
  const sourceRows = [
    ['ClickAudit', sourceClicks.clickAudit ?? 0],
    ['Fidget', sourceClicks.fidget ?? 0],
    ['Bloom', sourceClicks.bloom ?? 0],
    ['Work?', sourceClicks.workQuestion ?? clicks],
  ]
  const isConnected = connection === 'connected'
  const alwaysOnTop = Boolean(state?.alwaysOnTop)

  return (
    <section className="local-bridge-panel minimal" aria-label="ClickAudit local counter">
      <div className="bridge-counter-row">
        <div>
          <p className="system-label">API mirror / 127.0.0.1:47891</p>
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

      <div className="bridge-source-grid" aria-label="Click source breakdown">
        {sourceRows.map(([label, value]) => (
          <div className="bridge-source-card" key={label}>
            <span>{label}</span>
            <strong>{Number(value).toLocaleString('en-US')}</strong>
          </div>
        ))}
      </div>

      <pre className="api-response"><code>{apiResponse}</code></pre>
      {error && <p className="bridge-error">{error}</p>}
    </section>
  )
}

export default ClickAuditBridge
