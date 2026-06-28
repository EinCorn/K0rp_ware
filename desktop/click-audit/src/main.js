import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import './styles.css'

const app = document.querySelector('#app')

// Development tuning. Production can move this back toward 1_000_000.
const COLOR_TARGET_CLICKS = 5_000
const CONFETTI_CHANCE = 0.1
const CONFETTI_COLORS = ['#ff4f5e', '#ffb84d', '#f7ff5c', '#64ff8f', '#56d9ff', '#9f7bff', '#ff62d2']
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
    <button id="reset" class="corner-button reset-button" type="button" aria-label="Reset counter" title="Reset counter">×</button>
    <button id="pin" class="corner-button pin-button" type="button" aria-label="Pin window" title="Pin window">📌</button>
    <div id="counter" class="digit-deck" aria-label="Click count"></div>
    <div id="confetti-layer" class="confetti-layer" aria-hidden="true"></div>
  </section>
`

const elements = {
  counter: document.querySelector('#counter'),
  pin: document.querySelector('#pin'),
  reset: document.querySelector('#reset'),
  confettiLayer: document.querySelector('#confetti-layer'),
}

function render(nextState) {
  const previousClicks = state.globalClicks
  Object.assign(state, nextState)

  renderDigits(String(state.globalClicks), String(previousClicks))
  elements.counter.style.setProperty('--progress-color', getCounterColor(state.globalClicks))
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

function getCounterColor(clicks) {
  const progress = Math.min(Math.max(clicks / COLOR_TARGET_CLICKS, 0), 1)
  const hue = progress * 280
  const saturation = Math.min(progress * 130, 100)
  const lightness = 94 - progress * 28

  return `hsl(${hue.toFixed(2)} ${saturation.toFixed(2)}% ${lightness.toFixed(2)}%)`
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

window.addEventListener('keydown', async (event) => {
  if (event.key.toLowerCase() === 'm') {
    render(await invoke('set_count_for_dev', { count: DEV_MILLION_TEST_VALUE }))
  }
})

listen('click-audit:update', (event) => render(event.payload))
refresh()
