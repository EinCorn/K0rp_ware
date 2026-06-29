import { useMemo, useState } from 'react'
import { openDetachedWindow } from '../../core/detachedWindow'

const phrases = [
  'Impuls vzat na vědomí.',
  'Drobná úleva zaznamenána.',
  'Výstup není vyžadován.',
  'Mikro-komfort schválen.',
  'Kamínek zůstává v compliance.',
  'Tlak převeden do nejednoznačnosti.',
  'Neškodný klik byl založen.',
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
        <nav className="top-nav" aria-label="Navigace pultu">
          <a href="/">Pult</a>
          <button type="button" onClick={() => openDetachedWindow('dopamine-fidget')}>
            Oddělit
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
          <p className="system-label">Neproduktivní hmatové ujištění</p>
          <h1>Compliance Pebble</h1>
          <p className="status-description">
            Zmáčkni schválený objekt. Nic se nezlepší. To není závada.
          </p>

          <button className="pebble-button" type="button" onClick={pressPebble} aria-label="Zmáčknout compliance kamínek">
            <span className="pebble-glow" key={pulseKey}></span>
            <span className="pebble-core"></span>
            <span className="pebble-label">STISK</span>
          </button>

          <div className="readout-grid">
            <div className="readout-card">
              <span>Schválené stisky</span>
              <strong>{pressCount}</strong>
            </div>
            <div className="readout-card">
              <span>Efekt</span>
              <strong>Žádný</strong>
            </div>
          </div>

          <blockquote className="message-feed fidget-message">{phrase}</blockquote>
        </div>
      </section>
    </main>
  )
}

export default DopamineFidget
