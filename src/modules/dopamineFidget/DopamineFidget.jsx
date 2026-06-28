import { useMemo, useState } from 'react'
import { openDetachedWindow } from '../../core/detachedWindow'

const phrases = [
  'Impulse acknowledged.',
  'Tiny relief recorded.',
  'No output required.',
  'Micro-comfort approved.',
  'The pebble remains compliant.',
  'Pressure converted into ambiguity.',
  'A harmless click has been filed.',
]

function DopamineFidget({ isDetached }) {
  const [pressCount, setPressCount] = useState(0)
  const [pulseKey, setPulseKey] = useState(0)

  const phrase = useMemo(() => phrases[pressCount % phrases.length], [pressCount])

  function pressPebble() {
    setPressCount((count) => count + 1)
    setPulseKey((key) => key + 1)
  }

  return (
    <main className={isDetached ? 'status-shell detached' : 'status-shell'}>
      {!isDetached && (
        <nav className="top-nav" aria-label="Dashboard navigation">
          <a href="/">Dashboard</a>
          <button type="button" onClick={() => openDetachedWindow('dopamine-fidget')}>
            Detach
          </button>
        </nav>
      )}

      <section className="utility-window fidget-window">
        <div className="window-header">
          <div className="window-dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>K0rp_ware / Compliance Pebble</p>
        </div>

        <div className="utility-body fidget-body">
          <p className="system-label">Non-productive tactile reassurance</p>
          <h1>Compliance Pebble</h1>
          <p className="status-description">
            Press the approved object. Nothing improves. That is not a defect.
          </p>

          <button className="pebble-button" type="button" onClick={pressPebble} aria-label="Press compliance pebble">
            <span className="pebble-glow" key={pulseKey}></span>
            <span className="pebble-core"></span>
            <span className="pebble-label">PRESS</span>
          </button>

          <div className="readout-grid">
            <div className="readout-card">
              <span>Approved presses</span>
              <strong>{pressCount}</strong>
            </div>
            <div className="readout-card">
              <span>Effect</span>
              <strong>None</strong>
            </div>
          </div>

          <blockquote className="message-feed fidget-message">{phrase}</blockquote>
        </div>
      </section>
    </main>
  )
}

export default DopamineFidget
