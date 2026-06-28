import { useEffect, useRef } from 'react'
import './FidgetPage.css'

const FRICTION = 0.992
const MAX_VELOCITY = 42
const IDLE_NUDGE = 0.0008

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
  const spinnerRef = useRef(null)
  const angleRef = useRef(0)
  const velocityRef = useRef(0)
  const lastFrameTimeRef = useRef(0)
  const dragRef = useRef({ active: false, angle: 0, time: 0 })

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

        spinner.style.transform = `rotate(${angleRef.current.toFixed(2)}deg)`
        spinner.style.setProperty('--spin-speed', normalizedSpeed.toFixed(3))
        spinner.style.setProperty('--spin-wobble', `${(normalizedSpeed * 1.4).toFixed(3)}deg`)
      }

      animationFrame = window.requestAnimationFrame(tick)
    }

    animationFrame = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(animationFrame)
  }, [])

  function flick(direction = Math.random() > 0.5 ? 1 : -1) {
    velocityRef.current = clamp(
      velocityRef.current + direction * (18 + Math.random() * 14),
      -MAX_VELOCITY,
      MAX_VELOCITY,
    )
  }

  function onPointerDown(event) {
    const spinner = spinnerRef.current
    if (!spinner) return

    spinner.setPointerCapture(event.pointerId)
    dragRef.current = {
      active: true,
      angle: getPointerAngle(event, spinner),
      time: performance.now(),
    }
    spinner.classList.add('is-dragging')
    velocityRef.current *= 0.35
  }

  function onPointerMove(event) {
    const spinner = spinnerRef.current
    if (!spinner || !dragRef.current.active) return

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
    if (!spinner) return

    if (spinner.hasPointerCapture(event.pointerId)) {
      spinner.releasePointerCapture(event.pointerId)
    }

    dragRef.current.active = false
    spinner.classList.remove('is-dragging')
    velocityRef.current = clamp(velocityRef.current * 1.22, -MAX_VELOCITY, MAX_VELOCITY)
  }

  function onWheel(event) {
    event.preventDefault()
    velocityRef.current = clamp(velocityRef.current + event.deltaY * -0.06, -MAX_VELOCITY, MAX_VELOCITY)
  }

  return (
    <main className="fidget-page-shell">
      <a className="fidget-back" href="/">Back</a>
      <section className="fidget-panel" aria-label="K0rp Fidget prototype">
        <p className="fidget-label">K0rp_ware / fidget / prototype</p>
        <div className="fidget-stage">
          <div
            ref={spinnerRef}
            className="fidget-spinner"
            role="button"
            tabIndex="0"
            aria-label="Fidget spinner. Drag, flick, scroll, or press Space."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            onKeyDown={(event) => {
              if (event.code === 'Space' || event.key === 'Enter') {
                event.preventDefault()
                flick()
              }
            }}
            onDoubleClick={() => flick()}
          >
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
        <button className="fidget-flick-button" type="button" onClick={() => flick()}>
          Flick
        </button>
      </section>
    </main>
  )
}

export default FidgetPage
