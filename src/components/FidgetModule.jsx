import { useEffect, useRef } from 'react'
import {
  FIDGET_MODES,
  FIDGET_MOTION,
  calculateFidgetDragVelocity,
  calculateFidgetReleaseVelocity,
  clampFidgetVelocity,
  classifyFidgetGesture,
  getFidgetClickDirection,
  getFidgetPointerAngle,
  getFidgetRainbowSpeed,
  getNormalizedFidgetSpeed,
  normalizeFidgetDegreeDelta,
} from '../runtime/fidgetMotion'
import {
  FIDGET_SESSION_INPUT_KINDS,
  FIDGET_SESSION_FRAME_MS,
  FIDGET_SESSION_MEANINGFUL_VELOCITY_EPSILON,
  FIDGET_SESSION_POINTER_OUTCOMES,
  advanceFidgetSessionTracker,
  cancelFidgetSessionTracker,
  createFidgetSessionTracker,
  getFidgetSessionClampedDeltaFrames,
  getFidgetSessionPointerOutcome,
  registerFidgetSessionInput,
  stopActiveFidgetSessionMotion,
} from '../runtime/fidgetSession'
import './FidgetModule.css'

const CONFETTI_COLORS = [
  '#ff2d55',
  '#ff453a',
  '#ff9500',
  '#ffd60a',
  '#30d158',
  '#00c7be',
  '#64d2ff',
  '#0a84ff',
  '#bf5af2',
]

const createDragState = () => ({
  active: false,
  pointerId: null,
  angle: 0,
  time: 0,
  startX: 0,
  startY: 0,
  moved: false,
})

export default function FidgetModule({
  mode = FIDGET_MODES.manual,
  onSessionSettled,
}) {
  const spinnerRef = useRef(null)
  const confettiLayerRef = useRef(null)
  const angleRef = useRef(0)
  const velocityRef = useRef(0)
  const lastFrameTimeRef = useRef(0)
  const lastConfettiAtRef = useRef(0)
  const dragRef = useRef(createDragState())
  const timeoutIdsRef = useRef(new Set())
  const sessionTrackerRef = useRef(createFidgetSessionTracker())
  const sessionClockRef = useRef(0)
  const onSessionSettledRef = useRef(onSessionSettled)
  const isClickMode = mode === FIDGET_MODES.click

  useEffect(() => {
    onSessionSettledRef.current = onSessionSettled
  }, [onSessionSettled])

  useEffect(() => {
    let animationFrame = 0
    const timeoutIds = timeoutIdsRef.current
    const confettiLayer = confettiLayerRef.current

    const emitRainbowConfetti = (speed) => {
      const layer = confettiLayerRef.current
      if (!layer) return

      const particleCount = speed > 0.97 ? 4 : 2
      const fragment = document.createDocumentFragment()

      for (let index = 0; index < particleCount; index += 1) {
        const particle = document.createElement('span')
        const particleAngle = Math.random() * Math.PI * 2
        const distance = 48 + Math.random() * 72
        const x = Math.cos(particleAngle) * distance
        const y = Math.sin(particleAngle) * distance
        const size = 2.5 + Math.random() * 3.5

        particle.className = 'fidget-rainbow-confetti'
        particle.style.setProperty('--fidget-confetti-x', `${x.toFixed(1)}px`)
        particle.style.setProperty('--fidget-confetti-y', `${y.toFixed(1)}px`)
        particle.style.setProperty('--fidget-confetti-size', `${size.toFixed(1)}px`)
        particle.style.setProperty(
          '--fidget-confetti-rotation',
          `${Math.round(Math.random() * 520 - 260)}deg`,
        )
        particle.style.backgroundColor = CONFETTI_COLORS[
          Math.floor(Math.random() * CONFETTI_COLORS.length)
        ]
        fragment.appendChild(particle)

        const timeoutId = window.setTimeout(() => {
          particle.remove()
          timeoutIds.delete(timeoutId)
        }, 900)
        timeoutIds.add(timeoutId)
      }

      layer.appendChild(fragment)
    }

    const tick = (timestamp) => {
      const spinner = spinnerRef.current
      const lastFrameTime = lastFrameTimeRef.current || timestamp
      const deltaFrames = getFidgetSessionClampedDeltaFrames(timestamp - lastFrameTime)
      lastFrameTimeRef.current = timestamp
      sessionClockRef.current += deltaFrames * FIDGET_SESSION_FRAME_MS

      if (spinner) {
        if (!dragRef.current.active) {
          angleRef.current += velocityRef.current * deltaFrames
          velocityRef.current *= Math.pow(FIDGET_MOTION.friction, deltaFrames)

          if (Math.abs(velocityRef.current) < 0.012) {
            velocityRef.current = 0
          } else {
            velocityRef.current += Math.sign(velocityRef.current) * FIDGET_MOTION.idleNudge
          }
        }

        const normalizedSpeed = getNormalizedFidgetSpeed(velocityRef.current)
        const rainbowSpeed = getFidgetRainbowSpeed(velocityRef.current)

        spinner.style.transform = `rotate(${angleRef.current.toFixed(2)}deg)`
        spinner.style.setProperty('--fidget-spin-speed', normalizedSpeed.toFixed(3))
        spinner.style.setProperty('--fidget-rainbow-speed', rainbowSpeed.toFixed(3))
        spinner.style.setProperty(
          '--fidget-spin-wobble',
          `${(normalizedSpeed * 1.4).toFixed(3)}deg`,
        )

        if (
          normalizedSpeed >= FIDGET_MOTION.confettiStartSpeed
          && timestamp - lastConfettiAtRef.current > 72
        ) {
          emitRainbowConfetti(normalizedSpeed)
          lastConfettiAtRef.current = timestamp
        }

        const sessionUpdate = advanceFidgetSessionTracker(sessionTrackerRef.current, {
          timestamp: sessionClockRef.current,
          isDragging: dragRef.current.active,
        })
        sessionTrackerRef.current = sessionUpdate.tracker
        if (sessionUpdate.settledSession) {
          onSessionSettledRef.current?.(sessionUpdate.settledSession)
        }
      }

      animationFrame = window.requestAnimationFrame(tick)
    }

    animationFrame = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
      timeoutIds.clear()
      confettiLayer?.replaceChildren()
      sessionTrackerRef.current = cancelFidgetSessionTracker(sessionTrackerRef.current)
    }
  }, [])

  useEffect(() => {
    const spinner = spinnerRef.current
    const pointerId = dragRef.current.pointerId

    if (spinner && pointerId !== null && spinner.hasPointerCapture(pointerId)) {
      spinner.releasePointerCapture(pointerId)
    }

    dragRef.current = createDragState()
    spinner?.classList.remove('is-dragging')
  }, [mode])

  const pulseSpinner = () => {
    const spinner = spinnerRef.current
    if (!spinner) return

    spinner.classList.remove('is-flicked')
    void spinner.offsetWidth
    spinner.classList.add('is-flicked')

    const timeoutId = window.setTimeout(() => {
      spinner.classList.remove('is-flicked')
      timeoutIdsRef.current.delete(timeoutId)
    }, 520)
    timeoutIdsRef.current.add(timeoutId)
  }

  const flick = (direction = Math.random() > 0.5 ? 1 : -1, strength = 1) => {
    velocityRef.current = clampFidgetVelocity(
      velocityRef.current + direction * (14 + Math.random() * 12) * strength,
    )
    pulseSpinner()
    return velocityRef.current
  }

  const registerSessionInput = (inputKind, velocity, timestamp = sessionClockRef.current) => {
    sessionTrackerRef.current = registerFidgetSessionInput(sessionTrackerRef.current, {
      timestamp,
      mode,
      inputKind,
      velocity,
      isQualifiedInput: true,
    })
  }

  const handleClick = (event) => {
    if (!isClickMode) return

    const spinner = spinnerRef.current
    if (!spinner) return

    const bounds = spinner.getBoundingClientRect()
    const velocity = flick(
      getFidgetClickDirection(event.clientX, bounds.left, bounds.width),
      0.95,
    )
    registerSessionInput(FIDGET_SESSION_INPUT_KINDS.click, velocity)
  }

  const handlePointerDown = (event) => {
    const spinner = spinnerRef.current
    if (!spinner || isClickMode) return

    spinner.setPointerCapture(event.pointerId)
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      angle: getFidgetPointerAngle(
        { x: event.clientX, y: event.clientY },
        spinner.getBoundingClientRect(),
      ),
      time: performance.now(),
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    }
    spinner.classList.add('is-dragging')
    velocityRef.current = 0
    const sessionUpdate = advanceFidgetSessionTracker(sessionTrackerRef.current, {
      timestamp: sessionClockRef.current,
      isDragging: true,
    })
    sessionTrackerRef.current = sessionUpdate.tracker
  }

  const handlePointerMove = (event) => {
    const spinner = spinnerRef.current
    const drag = dragRef.current
    if (!spinner || !drag.active || drag.pointerId !== event.pointerId || isClickMode) return

    const moveX = event.clientX - drag.startX
    const moveY = event.clientY - drag.startY
    if (classifyFidgetGesture(moveX, moveY) === 'drag') drag.moved = true

    const now = performance.now()
    const nextAngle = getFidgetPointerAngle(
      { x: event.clientX, y: event.clientY },
      spinner.getBoundingClientRect(),
    )
    const delta = normalizeFidgetDegreeDelta(nextAngle - drag.angle)

    angleRef.current += delta
    velocityRef.current = calculateFidgetDragVelocity({
      deltaDegrees: delta,
      elapsedMs: now - drag.time,
      previousVelocity: velocityRef.current,
    })
    drag.angle = nextAngle
    drag.time = now
  }

  const completePointerGesture = (event, { cancelled = false } = {}) => {
    const spinner = spinnerRef.current
    const drag = dragRef.current
    if (!spinner || !drag.active || drag.pointerId !== event.pointerId || isClickMode) return

    const pointerOutcome = getFidgetSessionPointerOutcome({
      moved: drag.moved,
      cancelled,
    })
    drag.active = false
    drag.pointerId = null

    if (spinner.hasPointerCapture(event.pointerId)) {
      spinner.releasePointerCapture(event.pointerId)
    }

    dragRef.current = createDragState()
    spinner.classList.remove('is-dragging')
    const finishedAt = sessionClockRef.current
    if (!drag.moved) {
      velocityRef.current = 0
    } else {
      velocityRef.current = calculateFidgetReleaseVelocity(velocityRef.current)
    }

    if (pointerOutcome === FIDGET_SESSION_POINTER_OUTCOMES.tap) {
      sessionTrackerRef.current = stopActiveFidgetSessionMotion(
        sessionTrackerRef.current,
        finishedAt,
      )
    } else if (pointerOutcome === FIDGET_SESSION_POINTER_OUTCOMES.dragRelease) {
      registerSessionInput(
        FIDGET_SESSION_INPUT_KINDS.dragRelease,
        velocityRef.current,
        finishedAt,
      )
    }
  }

  const finishPointerGesture = (event) => completePointerGesture(event)
  const cancelPointerGesture = (event) => completePointerGesture(event, { cancelled: true })

  const handleWheel = (event) => {
    if (isClickMode) return

    event.preventDefault()
    velocityRef.current = clampFidgetVelocity(
      velocityRef.current + event.deltaY * -0.06,
    )
    const wheelImpulse = Math.abs(event.deltaY * -0.06)
    if (wheelImpulse > FIDGET_SESSION_MEANINGFUL_VELOCITY_EPSILON) {
      registerSessionInput(FIDGET_SESSION_INPUT_KINDS.wheel, velocityRef.current)
    }
  }

  return (
    <section
      className="fidget-module"
      aria-label="K0rp Fidget"
      data-clickaudit-profile="fidget-module"
    >
      <div className="fidget-module-stage">
        <div
          ref={confettiLayerRef}
          className="fidget-module-confetti-layer"
          aria-hidden="true"
        />
        <div
          ref={spinnerRef}
          className="fidget-module-spinner"
          role="button"
          tabIndex="0"
          aria-label="Fidget spinner. Přepni režim a potom klikej nebo táhni."
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointerGesture}
          onPointerCancel={cancelPointerGesture}
          onLostPointerCapture={cancelPointerGesture}
          onWheel={handleWheel}
          onKeyDown={(event) => {
            if (isClickMode && (event.code === 'Space' || event.key === 'Enter')) {
              event.preventDefault()
              const velocity = flick()
              registerSessionInput(FIDGET_SESSION_INPUT_KINDS.keyboard, velocity)
            }
          }}
        >
          <span className="fidget-spinner-rainbow fidget-spinner-rainbow-outer" aria-hidden="true" />
          <span className="fidget-spinner-rainbow fidget-spinner-rainbow-inner" aria-hidden="true" />
          <span className="fidget-spinner-blur" aria-hidden="true" />
          <span className="fidget-spinner-arm fidget-spinner-arm-a">
            <span className="fidget-spinner-lobe"><span /></span>
          </span>
          <span className="fidget-spinner-arm fidget-spinner-arm-b">
            <span className="fidget-spinner-lobe"><span /></span>
          </span>
          <span className="fidget-spinner-arm fidget-spinner-arm-c">
            <span className="fidget-spinner-lobe"><span /></span>
          </span>
          <span className="fidget-spinner-core"><span /></span>
        </div>
      </div>
    </section>
  )
}
