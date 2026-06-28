import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import './styles.css'

const appWindow = getCurrentWindow()
const app = document.querySelector('#app')

// Development tuning. Production can move this back toward 1_000_000.
const PROGRESS_TARGET_CLICKS = 2_500
const COLOR_TARGET_CLICKS = PROGRESS_TARGET_CLICKS
const CONFETTI_CHANCE = 0.1
const CONFETTI_COLORS = ['#ff4f5e', '#ffb84d', '#f7ff5c', '#64ff8f', '#56d9ff', '#9f7bff', '#ff62d2']
const LIQUID_PALETTE = ['#ff3b30', '#ff9f0a', '#ffd60a', '#34c759', '#00c7be', '#0a84ff', '#bf5af2']
const DEV_MILLION_TEST_VALUE = 1_000_000

const state = {
  app: 'click-audit',
  running: true,
  globalClicks: 0,
  startedAtUnixMs: null,
  alwaysOnTop: false,
  privacyMode: 'aggregate-only',
}

app.innerHTML = `
  <section class="shell">
    <div class="drag-region" data-tauri-drag-region aria-hidden="true"></div>
    <div id="liquid" class="progress-liquid" aria-hidden="true">
      <div class="liquid-fill">
        <span class="liquid-wave liquid-wave-a"></span>
        <span class="liquid-wave liquid-wave-b"></span>
      </div>
    </div>
    <button id="pin" class="corner-button pin-button" type="button" aria-label="Pin window" title="Pin window">📌</button>
    <button id="reset" class="corner-button reset-button" type="button" aria-label="Reset counter" title="Reset counter">↺</button>
    <button id="close" class="corner-button close-button" type="button" aria-label="Close ClickAudit" title="Close ClickAudit">×</button>
    <div id="counter" class="digit-deck" aria-label="Click count"></div>
    <div id="confetti-layer" class="confetti-layer" aria-hidden="true"></div>
  </section>
`

const elements = {
  counter: document.querySelector('#counter'),
  liquid: document.querySelector('#liquid'),
  pin: document.querySelector('#pin'),
  reset: document.querySelector('#reset'),
  close: document.querySelector('#close'),
  confettiLayer: document.querySelector('#confetti-layer'),
}

function render(nextState) {
  const previousClicks = state.globalClicks
  Object.assign(state, nextState)

  const progress = getProgress(state.globalClicks)

  renderDigits(String(state.globalClicks), String(previousClicks))
  elements.counter.style.setProperty('--progress-color', getCounterColor(state.globalClicks))
  elements.liquid.style.setProperty('--liquid-progress', `${(progress * 100).toFixed(2)}%`)
  elements.liquid.style.setProperty('--liquid-gradient', getLiquidGradient(progress))
  elements.pin.setAttribute('aria-pressed', state.alwaysOnTop ? 'true' : 'false')
  elements.pin.setAttribute('aria-label', state.alwaysOnTop ? 'Unpin window' : 'Pin window')
  elements.pin.setAttribute('title', state.alwaysOnTop ? 'Unpin window' : 'Pin window')

  if (state.globalClicks > previousClicks && Math.random() < CONFETTI_CHANCE) {
    burstConfetti()
  }
}

function renderDigits(currentValue, previousValue) {
  const currentDigits = currentValue.split('')
  const previousDigits = previousValue.padStart(currentDigits.length, ' ').split('')
  const fragment = document.createDocumentFragment()

  elements.counter.dataset.digits = String(currentDigits.length)
  elements.counter.dataset.size = getDigitDeckSize(currentDigits.length)
  elements.counter.setAttribute('aria-label', `${currentValue} clicks`)

  currentDigits.forEach((digit, index) => {
    const previousDigit = previousDigits[index]
    const changed = previousDigit !== digit
    const oldDigit = previousDigit === ' ' ? digit : previousDigit
    const card = document.createElement('span')

    card.className = changed ? 'digit-card is-changing' : 'digit-card'
    card.style.animationDelay = `${Math.min(index * 12, 72)}ms`
    card.innerHTML = `
      <span class="digit-face digit-top"><span>${digit}</span></span>
      <span class="digit-face digit-bottom"><span>${digit}</span></span>
      ${
        changed
          ? `<span class="digit-flap digit-flap-top"><span>${oldDigit}</span></span>
             <span class="digit-flap digit-hold-bottom"><span>${oldDigit}</span></span>
             <span class="digit-flap digit-flap-bottom"><span>${digit}</span></span>`
          : ''
      }
      <span class="digit-hinge"></span>
    `
    fragment.appendChild(card)
  })

  elements.counter.replaceChildren(fragment)
}

function getDigitDeckSize(digitCount) {
  if (digitCount <= 3) return 'standard'
  if (digitCount <= 6) return 'compact'
  if (digitCount <= 9) return 'dense'
  return 'micro'
}

function getProgress(clicks) {
  return Math.min(Math.max(clicks / PROGRESS_TARGET_CLICKS, 0), 1)
}

function getCounterColor(clicks) {
  const progress = getProgress(clicks)
  const hue = progress * 280
  const saturation = Math.min(progress * 130, 100)
  const lightness = 94 - progress * 28

  return `hsl(${hue.toFixed(2)} ${saturation.toFixed(2)}% ${lightness.toFixed(2)}%)`
}

function getLiquidGradient(progress) {
  const safeProgress = Math.max(progress, 0.001)
  const stops = []
  const maxIndex = LIQUID_PALETTE.length - 1

  LIQUID_PALETTE.forEach((color, index) => {
    const colorProgress = index / maxIndex

    if (colorProgress <= progress) {
      stops.push(`${color} ${((colorProgress / safeProgress) * 100).toFixed(2)}%`)
    }
  })

  const bottomColor = getPaletteColorAt(progress)
  stops.push(`${bottomColor} 100%`)

  return `linear-gradient(to bottom, ${stops.join(', ')})`
}

function getPaletteColorAt(progress) {
  const scaledProgress = Math.min(Math.max(progress, 0), 1) * (LIQUID_PALETTE.length - 1)
  const leftIndex = Math.floor(scaledProgress)
  const rightIndex = Math.min(leftIndex + 1, LIQUID_PALETTE.length - 1)
  const amount = scaledProgress - leftIndex

  return mixHexColors(LIQUID_PALETTE[leftIndex], LIQUID_PALETTE[rightIndex], amount)
}

function mixHexColors(left, right, amount) {
  const leftRgb = hexToRgb(left)
  const rightRgb = hexToRgb(right)
  const mixed = leftRgb.map((channel, index) => Math.round(channel + (rightRgb[index] - channel) * amount))

  return `rgb(${mixed[0]} ${mixed[1]} ${mixed[2]})`
}

function hexToRgb(hex) {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ]
}

function burstConfetti() {
  const burst = document.createElement('div')
  const fragment = document.createDocumentFragment()
  const particleCount = 34 + Math.floor(Math.random() * 18)

  burst.className = 'confetti-burst'

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement('span')
    const angle = Math.random() * Math.PI * 2
    const distance = 80 + Math.random() * 150
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance
    const size = 3 + Math.random() * 4

    particle.className = 'confetti-pixel'
    particle.style.setProperty('--x', `${x.toFixed(1)}px`)
    particle.style.setProperty('--y', `${y.toFixed(1)}px`)
    particle.style.setProperty('--r', `${Math.round(Math.random() * 540 - 270)}deg`)
    particle.style.setProperty('--s', `${size.toFixed(1)}px`)
    particle.style.backgroundColor = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
    fragment.appendChild(particle)
  }

  burst.appendChild(fragment)
  elements.confettiLayer.appendChild(burst)
  window.setTimeout(() => burst.remove(), 1400)
}

async function refresh() {
  render(await invoke('get_state'))
}

elements.pin.addEventListener('click', async () => {
  render(await invoke('set_always_on_top', { enabled: !state.alwaysOnTop }))
})

elements.reset.addEventListener('click', async () => {
  render(await invoke('reset_counting'))
})

elements.close.addEventListener('click', () => appWindow.close())

window.addEventListener('keydown', async (event) => {
  if (event.key.toLowerCase() === 'm') {
    render(await invoke('set_count_for_dev', { count: DEV_MILLION_TEST_VALUE }))
  }
})

listen('click-audit:update', (event) => render(event.payload))
refresh()
