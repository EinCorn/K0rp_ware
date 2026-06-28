import { useEffect, useRef, useState } from 'react'
import './FidgetPage.css'
import './FidgetMode.css'

const FRICTION = 0.992
const MAX_VELOCITY = 42
const IDLE_NUDGE = 0.0008
const TAP_MOVE_THRESHOLD = 6
const RAINBOW_START_SPEED = 0.34
const CONFETTI_START_SPEED = 0.6
const MODE_CLICK = 'click'
const MODE_MANUAL = 'manual'
const CONFETTI_COLORS = ['#ff2d55', '#ff453a', '#ff9500', '#ffd60a', '#30d158', '#00c7be', '#64d2ff', '#0a84ff', '#bf5af2']

function normalizeDelta(degrees) {
  let delta = degrees

  while (delta > 180) delta -= 360
  while (delta < -180) delta += 360

  return delta
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getPointerAngle(event, element) {
  const rect = element.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  return Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI)
}

function FidgetPage() {
  const [spinMode, setSpinMode] = useState(MODE_MANUAL)
  const spinnerRef = useRef(null)
  const confettiLayerRef = useRef(null)
  const angleRef = useRef(0)
  const velocityRef = useRef(0)
  const lastFrameTimeRef = useRef(0)
  const lastConfettiAtRef = useRef(0)
  const dragRef = useRef({ active: false, angle: 0, time: 0, startX: 0, startY: 0, moved: false })
  const isClickMode = spinMode === MODE_CLICK

  useEffect(() => {
    let animationFrame = 0

    function tick(timestamp) {
      const spinner = spinnerRef.current
      const lastFrameTime = lastFrameTimeRef.current || timestamp
      const deltaFrames = clamp((timestamp - lastFrameTime) / 16.6667, 0.25, 2.2)
      lastFrameTimeRef.current = timestamp

      if (spinner) {
        if (!dragRef.current.active) {
          angleRef.current += velocityRef.current * deltaFrames
          velocityRef.current *= Math.pow(FRICTION, deltaFrames)

          if (Math.abs(velocityRef.current) < 0.012) {
            velocityRef.current = 0
          } else {
            velocityRef.current += Math.sign(velocityRef.current) * IDLE_NUDGE
          }
        }

        const speed = Math.abs(velocityRef.current)
        const normalizedSpeed = clamp(speed / MAX_VELOCITY, 0, 1)
        const rainbowSpeed = clamp((normalizedSpeed - RAINBOW_START_SPEED) / (1 - RAINBOW_START_SPEED), 0, 1)

        spinner.style.transform = `rotate(${angleRef.current.toFixed(2)}deg)`
        spinner.style.setProperty('--spin-speed', normalizedSpeed.toFixed(3))
        spinner.style.setProperty('--rainbow-speed', rainbowSpeed.toFixed(3))
        spinner.style.setProperty('--spin-wobble', `${(normalizedSpeed * 1.4).toFixed(3)}deg`)

        if (normalizedSpeed >= CONFETTI_START_SPEED && timestamp - lastConfettiAtRef.current > 72) {
          emitRainbowConfetti(normalizedSpeed)
          lastConfettiAtRef.current = timestamp
        }
      }

      animationFrame = window.requestAnimationFrame(tick)
    }

    animationFrame = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(animationFrame)
  }, [])

  function toggleSpinMode() {
    dragRef.current.active = false
    spinnerRef.current?.classList.remove('is-dragging')
    setSpinMode((currentMode) => (currentMode === MODE_CLICK ? MODE_MANUAL : MODE_CLICK))
  }

  function emitRainbowConfetti(speed) {
    const layer = confettiLayerRef.current
    if (!layer) return

    const particleCount = speed > 0.97 ? 4 : 2
    const fragment = document.createDocumentFragment()

    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement('span')
      const angle = Math.random() * Math.PI * 2
      const distance = 48 + Math.random() * 72
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance
      const size = 2.5 + Math.random() * 3.5

      particle.className = 'rainbow-confetti'
      particle.style.setProperty('--x', `${x.toFixed(1)}px`)
      particle.style.setProperty('--y', `${y.toFixed(1)}px`)
      particle.style.setProperty('--s', `${size.toFixed(1)}px`)
      particle.style.setProperty('--r', `${Math.round(Math.random() * 520 - 260)}deg`)
      particle.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
      fragment.appendChild(particle)

      window.setTimeout(() => particle.remove(), 900)
    }

    layer.appendChild(fragment)
  }

  function pulseSpinner() {
    const spinner = spinnerRef.current
    if (!spinner) return

    spinner.classList.remove('is-flicked')
    void spinner.offsetWidth
    spinner.classList.add('is-flicked')

    window.setTimeout(() => spinner.classList.remove('is-flicked'), 520)
  }

  function flick(direction = Math.random() > 0.5 ? 1 : -1, strength = 1) {
    velocityRef.current = clamp(
      velocityRef.current + direction * (14 + Math.random() * 12) * strength,
      -MAX_VELOCITY,
      MAX_VELOCITY,
    )
    pulseSpinner()
  }

  function onClick(event) {
    if (!isClickMode) return

    const spinner = spinnerRef.current
    if (!spinner) return

    const rect = spinner.getBoundingClientRect()
    const direction = event.clientX >= rect.left + rect.width / 2 ? 1 : -1
    flick(direction, 0.95)
  }

  function onPointerDown(event) {
    const spinner = spinnerRef.current
    if (!spinner || isClickMode) return

    spinner.setPointerCapture(event.pointerId)
    dragRef.current = {
      active: true,
      angle: getPointerAngle(event, spinner),
      time: performance.now(),
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    }
    spinner.classList.add('is-dragging')
    velocityRef.current = 0
  }

  function onPointerMove(event) {
    const spinner = spinnerRef.current
    if (!spinner || !dragRef.current.active || isClickMode) return

    const moveX = event.clientX - dragRef.current.startX
    const moveY = event.clientY - dragRef.current.startY

    if (Math.hypot(moveX, moveY) > TAP_MOVE_THRESHOLD) {
      dragRef.current.moved = true
    }

    const now = performance.now()
    const nextAngle = getPointerAngle(event, spinner)
    const delta = normalizeDelta(nextAngle - dragRef.current.angle)
    const deltaTime = Math.max(now - dragRef.current.time, 8)
    const sampledVelocity = (delta / deltaTime) * 16.6667

    angleRef.current += delta
    velocityRef.current = clamp(velocityRef.current * 0.25 + sampledVelocity * 0.95, -MAX_VELOCITY, MAX_VELOCITY)
    dragRef.current.angle = nextAngle
    dragRef.current.time = now
  }

  function onPointerUp(event) {
    const spinner = spinnerRef.current
    if (!spinner || !dragRef.current.active || isClickMode) return

    if (spinner.hasPointerCapture(event.pointerId)) {
      spinner.releasePointerCapture(event.pointerId)
    }

    const wasTap = !dragRef.current.moved

    dragRef.current.active = false
    spinner.classList.remove('is-dragging')

    if (wasTap) {
      velocityRef.current = 0
      return
    }

    velocityRef.current = clamp(velocityRef.current * 1.22, -MAX_VELOCITY, MAX_VELOCITY)
  }

  function onWheel(event) {
    if (isClickMode) return

    event.preventDefault()
    velocityRef.current = clamp(velocityRef.current + event.deltaY * -0.06, -MAX_VELOCITY, MAX_VELOCITY)
  }

  return (
    <main className="fidget-page-shell">
      <a className="fidget-back" href="/">Back</a>
      <section className="fidget-panel" aria-label="K0rp Fidget prototype">
        <header className="fidget-titlebar">
          <span className="fidget-dot" />
          <span className="fidget-dot" />
          <span className="fidget-dot" />
          <strong>K0rp Fidget</strong>
        </header>
        <button
          className={`fidget-mode-toggle ${isClickMode ? 'is-click-mode' : 'is-manual-mode'}`}
          type="button"
          aria-label={isClickMode ? 'Click spin mode' : 'Manual spin mode'}
          title={isClickMode ? 'Click mode: click to spin, no grabbing' : 'Manual mode: drag to spin, hold to stop'}
          onClick={toggleSpinMode}
        >
          {isClickMode ? '↻' : '✋'}
        </button>
        <button className="fidget-pin" type="button" aria-label="Pin window" title="Pin window">📌</button>
        <div className="fidget-stage">
          <div ref={confettiLayerRef} className="fidget-confetti-layer" aria-hidden="true" />
          <div
            ref={spinnerRef}
            className="fidget-spinner"
            role="button"
            tabIndex="0"
            aria-label="Fidget spinner. Toggle mode, then click or drag."
            onClick={onClick}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            onKeyDown={(event) => {
              if (isClickMode && (event.code === 'Space' || event.key === 'Enter')) {
                event.preventDefault()
                flick()
              }
            }}
          >
            <span className="spinner-rainbow spinner-rainbow-outer" aria-hidden="true" />
            <span className="spinner-rainbow spinner-rainbow-inner" aria-hidden="true" />
            <span className="spinner-blur" aria-hidden="true" />
            <span className="spinner-arm spinner-arm-a">
              <span className="spinner-lobe"><span /></span>
            </span>
            <span className="spinner-arm spinner-arm-b">
              <span className="spinner-lobe"><span /></span>
            </span>
            <span className="spinner-arm spinner-arm-c">
              <span className="spinner-lobe"><span /></span>
            </span>
            <span className="spinner-core"><span /></span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default FidgetPage
