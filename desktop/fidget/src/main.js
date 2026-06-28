import { invoke } from '@tauri-apps/api/core'
import './styles.css'
import './mode.css'

const app = document.querySelector('#app')

const FRICTION = 0.992
const MAX_VELOCITY = 42
const IDLE_NUDGE = 0.0008
const TAP_MOVE_THRESHOLD = 6
const RAINBOW_START_SPEED = 0.34
const CONFETTI_START_SPEED = 0.6
const MODE_CLICK = 'click'
const MODE_MANUAL = 'manual'
const CONFETTI_COLORS = ['#ff2d55', '#ff453a', '#ff9500', '#ffd60a', '#30d158', '#00c7be', '#64d2ff', '#0a84ff', '#bf5af2']

const state = {
  alwaysOnTop: false,
  spinMode: MODE_MANUAL,
}

const motion = {
  angle: 0,
  velocity: 0,
  lastFrameTime: 0,
  lastConfettiAt: 0,
}

const drag = {
  active: false,
  angle: 0,
  time: 0,
  startX: 0,
  startY: 0,
  moved: false,
}

app.innerHTML = `
  <section class="fidget-shell" aria-label="K0rp Fidget">
    <button id="mode" class="mode-button" type="button" aria-label="Manual spin mode" title="Manual mode: drag to spin, hold to stop">✋</button>
    <button id="pin" class="pin-button" type="button" aria-label="Pin window" title="Pin window">📌</button>
    <div class="fidget-stage">
      <div id="confetti-layer" class="fidget-confetti-layer" aria-hidden="true"></div>
      <div id="spinner" class="fidget-spinner" role="button" tabindex="0" aria-label="Fidget spinner. Toggle mode, then click or drag.">
        <span class="spinner-rainbow spinner-rainbow-outer" aria-hidden="true"></span>
        <span class="spinner-rainbow spinner-rainbow-inner" aria-hidden="true"></span>
        <span class="spinner-blur" aria-hidden="true"></span>
        <span class="spinner-arm spinner-arm-a"><span class="spinner-lobe"><span></span></span></span>
        <span class="spinner-arm spinner-arm-b"><span class="spinner-lobe"><span></span></span></span>
        <span class="spinner-arm spinner-arm-c"><span class="spinner-lobe"><span></span></span></span>
        <span class="spinner-core"><span></span></span>
      </div>
    </div>
  </section>
`

const elements = {
  mode: document.querySelector('#mode'),
  pin: document.querySelector('#pin'),
  spinner: document.querySelector('#spinner'),
  confettiLayer: document.querySelector('#confetti-layer'),
}

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

function isClickMode() {
  return state.spinMode === MODE_CLICK
}

function tick(timestamp) {
  const lastFrameTime = motion.lastFrameTime || timestamp
  const deltaFrames = clamp((timestamp - lastFrameTime) / 16.6667, 0.25, 2.2)
  motion.lastFrameTime = timestamp

  if (!drag.active) {
    motion.angle += motion.velocity * deltaFrames
    motion.velocity *= Math.pow(FRICTION, deltaFrames)

    if (Math.abs(motion.velocity) < 0.012) {
      motion.velocity = 0
    } else {
      motion.velocity += Math.sign(motion.velocity) * IDLE_NUDGE
    }
  }

  const speed = Math.abs(motion.velocity)
  const normalizedSpeed = clamp(speed / MAX_VELOCITY, 0, 1)
  const rainbowSpeed = clamp((normalizedSpeed - RAINBOW_START_SPEED) / (1 - RAINBOW_START_SPEED), 0, 1)

  elements.spinner.style.transform = `rotate(${motion.angle.toFixed(2)}deg)`
  elements.spinner.style.setProperty('--spin-speed', normalizedSpeed.toFixed(3))
  elements.spinner.style.setProperty('--rainbow-speed', rainbowSpeed.toFixed(3))
  elements.spinner.style.setProperty('--spin-wobble', `${(normalizedSpeed * 1.4).toFixed(3)}deg`)

  if (normalizedSpeed >= CONFETTI_START_SPEED && timestamp - motion.lastConfettiAt > 72) {
    emitRainbowConfetti(normalizedSpeed)
    motion.lastConfettiAt = timestamp
  }

  window.requestAnimationFrame(tick)
}

function emitRainbowConfetti(speed) {
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

  elements.confettiLayer.appendChild(fragment)
}

function pulseSpinner() {
  elements.spinner.classList.remove('is-flicked')
  void elements.spinner.offsetWidth
  elements.spinner.classList.add('is-flicked')

  window.setTimeout(() => elements.spinner.classList.remove('is-flicked'), 520)
}

function flick(direction = Math.random() > 0.5 ? 1 : -1, strength = 1) {
  motion.velocity = clamp(
    motion.velocity + direction * (14 + Math.random() * 12) * strength,
    -MAX_VELOCITY,
    MAX_VELOCITY,
  )
  pulseSpinner()
}

function updateModeButton() {
  const clickMode = isClickMode()

  elements.mode.textContent = clickMode ? '↻' : '✋'
  elements.mode.classList.toggle('is-click-mode', clickMode)
  elements.mode.classList.toggle('is-manual-mode', !clickMode)
  elements.mode.setAttribute('aria-pressed', clickMode ? 'true' : 'false')
  elements.mode.setAttribute('aria-label', clickMode ? 'Click spin mode' : 'Manual spin mode')
  elements.mode.setAttribute('title', clickMode ? 'Click mode: click to spin, no grabbing' : 'Manual mode: drag to spin, hold to stop')
}

function toggleSpinMode() {
  drag.active = false
  elements.spinner.classList.remove('is-dragging')
  state.spinMode = isClickMode() ? MODE_MANUAL : MODE_CLICK
  updateModeButton()
}

function onClick(event) {
  if (!isClickMode()) return

  const rect = elements.spinner.getBoundingClientRect()
  const direction = event.clientX >= rect.left + rect.width / 2 ? 1 : -1
  flick(direction, 0.95)
}

function onPointerDown(event) {
  if (isClickMode()) return

  elements.spinner.setPointerCapture(event.pointerId)
  drag.active = true
  drag.angle = getPointerAngle(event, elements.spinner)
  drag.time = performance.now()
  drag.startX = event.clientX
  drag.startY = event.clientY
  drag.moved = false
  elements.spinner.classList.add('is-dragging')
  motion.velocity = 0
}

function onPointerMove(event) {
  if (!drag.active || isClickMode()) return

  const moveX = event.clientX - drag.startX
  const moveY = event.clientY - drag.startY

  if (Math.hypot(moveX, moveY) > TAP_MOVE_THRESHOLD) {
    drag.moved = true
  }

  const now = performance.now()
  const nextAngle = getPointerAngle(event, elements.spinner)
  const delta = normalizeDelta(nextAngle - drag.angle)
  const deltaTime = Math.max(now - drag.time, 8)
  const sampledVelocity = (delta / deltaTime) * 16.6667

  motion.angle += delta
  motion.velocity = clamp(motion.velocity * 0.25 + sampledVelocity * 0.95, -MAX_VELOCITY, MAX_VELOCITY)
  drag.angle = nextAngle
  drag.time = now
}

function onPointerUp(event) {
  if (!drag.active || isClickMode()) return

  if (elements.spinner.hasPointerCapture(event.pointerId)) {
    elements.spinner.releasePointerCapture(event.pointerId)
  }

  const wasTap = !drag.moved

  drag.active = false
  elements.spinner.classList.remove('is-dragging')

  if (wasTap) {
    motion.velocity = 0
    return
  }

  motion.velocity = clamp(motion.velocity * 1.22, -MAX_VELOCITY, MAX_VELOCITY)
}

function onWheel(event) {
  if (isClickMode()) return

  event.preventDefault()
  motion.velocity = clamp(motion.velocity + event.deltaY * -0.06, -MAX_VELOCITY, MAX_VELOCITY)
}

async function setAlwaysOnTop(enabled) {
  state.alwaysOnTop = await invoke('set_always_on_top', { enabled })
  elements.pin.setAttribute('aria-pressed', state.alwaysOnTop ? 'true' : 'false')
  elements.pin.setAttribute('aria-label', state.alwaysOnTop ? 'Unpin window' : 'Pin window')
  elements.pin.setAttribute('title', state.alwaysOnTop ? 'Unpin window' : 'Pin window')
}

elements.mode.addEventListener('click', toggleSpinMode)
elements.spinner.addEventListener('click', onClick)
elements.spinner.addEventListener('pointerdown', onPointerDown)
elements.spinner.addEventListener('pointermove', onPointerMove)
elements.spinner.addEventListener('pointerup', onPointerUp)
elements.spinner.addEventListener('pointercancel', onPointerUp)
elements.spinner.addEventListener('wheel', onWheel, { passive: false })
elements.spinner.addEventListener('keydown', (event) => {
  if (isClickMode() && (event.code === 'Space' || event.key === 'Enter')) {
    event.preventDefault()
    flick()
  }
})
elements.pin.addEventListener('click', () => setAlwaysOnTop(!state.alwaysOnTop))

updateModeButton()
window.requestAnimationFrame(tick)
