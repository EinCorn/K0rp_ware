import { useEffect, useMemo, useRef, useState } from 'react'
import digitSheetUrl from '../../desktop/click-audit/src/assets/digits/digit-sheet-q30.jpg?url'
import liquidSheetUrl from '../../desktop/click-audit/src/assets/liquid/liquid-water-36f-clean.png?url'
import liquidAnimation from '../../desktop/click-audit/src/assets/liquid/liquid-water-36f-clean.json'
import {
  CLICK_AUDIT_PROGRESS_TARGET,
  getClickAuditDeckSize,
  getClickAuditDigits,
  getClickAuditProgress,
  getClickAuditProgressColor,
} from '../runtime/clickAuditPresentation'
import './ClickAuditModule.css'

const CONFETTI_COLORS = ['#ff4f5e', '#ffb84d', '#f7ff5c', '#64ff8f', '#56d9ff', '#9f7bff', '#ff62d2']

function createConfettiBurst(id) {
  return {
    id,
    particles: Array.from({ length: 42 }, (_, index) => {
      const angle = Math.random() * Math.PI * 2
      const distance = 58 + Math.random() * 96

      return {
        id: `${id}-${index}`,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        rotation: Math.round(Math.random() * 540 - 270),
        size: 2 + Math.random() * 4,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      }
    }),
  }
}

function DigitCard({ digit }) {
  return (
    <span
      className="clickaudit-digit-card"
      data-digit={digit}
      aria-hidden="true"
    >
      <img
        src={digitSheetUrl}
        alt=""
        draggable="false"
        decoding="sync"
        style={{
          '--clickaudit-digit-column': digit % 5,
          '--clickaudit-digit-row': Math.floor(digit / 5),
        }}
      />
    </span>
  )
}

export default function ClickAuditModule({
  clickCount,
  onRecord,
  progressTarget = CLICK_AUDIT_PROGRESS_TARGET,
  interactive = true,
}) {
  const [liquidFrame, setLiquidFrame] = useState(0)
  const [burst, setBurst] = useState(null)
  const burstTimeoutRef = useRef(null)
  const digits = useMemo(() => getClickAuditDigits(clickCount), [clickCount])
  const deckSize = getClickAuditDeckSize(digits.length)
  const progress = getClickAuditProgress(clickCount, progressTarget)
  const progressColor = getClickAuditProgressColor(clickCount, progressTarget)
  const frameColumn = liquidFrame % liquidAnimation.columns
  const frameRow = Math.floor(liquidFrame / liquidAnimation.columns)
  const framePositionStep = 100 / (liquidAnimation.columns - 1)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined

    let animationFrame = null
    let startedAt = null

    const tick = (timestamp) => {
      if (startedAt === null) startedAt = timestamp
      const nextFrame = Math.floor(
        (timestamp - startedAt) / liquidAnimation.frameDurationMs,
      ) % liquidAnimation.frameCount

      setLiquidFrame(nextFrame)
      animationFrame = window.requestAnimationFrame(tick)
    }

    animationFrame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [])

  useEffect(() => () => {
    if (burstTimeoutRef.current !== null) window.clearTimeout(burstTimeoutRef.current)
  }, [])

  const recordClick = () => {
    if (!interactive || typeof onRecord !== 'function') return

    const nextCount = onRecord()
    if (!Number.isInteger(nextCount) || nextCount <= 0 || nextCount % 10 !== 0) return

    const nextBurst = createConfettiBurst(`${Date.now()}-${nextCount}`)
    setBurst(nextBurst)
    if (burstTimeoutRef.current !== null) window.clearTimeout(burstTimeoutRef.current)
    burstTimeoutRef.current = window.setTimeout(() => setBurst(null), 1_350)
  }

  return (
    <section
      className="clickaudit-module"
      aria-label="ClickAudit modul"
      style={{
        '--clickaudit-progress': `${(progress * 100).toFixed(2)}%`,
        '--clickaudit-progress-color': progressColor,
      }}
    >
      <button
        type="button"
        className="clickaudit-record-surface"
        aria-label="Zaznamenat auditovaný klik"
        onClick={recordClick}
        disabled={!interactive}
      >
        <span className="clickaudit-liquid" aria-hidden="true">
          <span className="clickaudit-liquid-fill">
            <span
              className="clickaudit-liquid-sprite"
              style={{
                backgroundImage: `url(${liquidSheetUrl})`,
                '--clickaudit-liquid-frame-x': `${frameColumn * framePositionStep}%`,
                '--clickaudit-liquid-frame-y': `${frameRow * framePositionStep}%`,
              }}
            />
          </span>
        </span>

        <span
          className="clickaudit-digit-deck"
          data-size={deckSize}
          data-digits={digits.length}
          aria-label={`${clickCount} evidovaných kliků`}
          role="img"
        >
          {digits.map((digit, index) => (
            <DigitCard key={`${index}-${digit}`} digit={digit} />
          ))}
        </span>

        <span className="clickaudit-surface-copy" aria-hidden="true">
          CLICK TO AUDIT
        </span>
      </button>

      <span className="clickaudit-progress-readout" aria-live="polite">
        {String(Math.round(progress * 100)).padStart(3, '0')}% AUDITNÍ KAPACITY
      </span>

      {burst && (
        <span className="clickaudit-confetti-layer" aria-hidden="true">
          {burst.particles.map((particle) => (
            <span
              key={particle.id}
              className="clickaudit-confetti-pixel"
              style={{
                '--clickaudit-confetti-x': `${particle.x.toFixed(1)}px`,
                '--clickaudit-confetti-y': `${particle.y.toFixed(1)}px`,
                '--clickaudit-confetti-r': `${particle.rotation}deg`,
                '--clickaudit-confetti-size': `${particle.size.toFixed(1)}px`,
                backgroundColor: particle.color,
              }}
            />
          ))}
        </span>
      )}
    </section>
  )
}
