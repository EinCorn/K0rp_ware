import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import './styles.css'

const app = document.querySelector('#app')
const COLOR_TARGET_CLICKS = 1_000_000
const CONFETTI_CHANCE = 0.002
const CONFETTI_COLORS = ['#ff4f5e', '#ffb84d', '#f7ff5c', '#64ff8f', '#56d9ff', '#9f7bff', '#ff62d2']

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
    <button id="pin" class="pin-button" type="button" aria-label="Pin window" title="Pin window">📌</button>
    <h1 id="counter">0</h1>
    <div id="confetti-layer" class="confetti-layer" aria-hidden="true"></div>
  </section>
`

const elements = {
  counter: document.querySelector('#counter'),
  pin: document.querySelector('#pin'),
  confettiLayer: document.querySelector('#confetti-layer'),
}

function render(nextState) {
  const previousClicks = state.globalClicks
  Object.assign(state, nextState)

  elements.counter.textContent = state.globalClicks.toLocaleString('en-US')
  elements.counter.style.color = getCounterColor(state.globalClicks)
  elements.pin.setAttribute('aria-pressed', state.alwaysOnTop ? 'true' : 'false')
  elements.pin.setAttribute('aria-label', state.alwaysOnTop ? 'Unpin window' : 'Pin window')
  elements.pin.setAttribute('title', state.alwaysOnTop ? 'Unpin window' : 'Pin window')

  if (state.globalClicks > previousClicks && Math.random() < CONFETTI_CHANCE) {
    burstConfetti()
  }
}

function getCounterColor(clicks) {
  const progress = Math.min(Math.max(clicks / COLOR_TARGET_CLICKS, 0), 1)
  const saturation = Math.min(progress * 125, 100)
  const lightness = 94 - progress * 30
  const hueProgress = progress < 0.08 ? 0 : (progress - 0.08) / 0.92
  const hue = hueProgress * 280

  return `hsl(${hue.toFixed(2)} ${saturation.toFixed(2)}% ${lightness.toFixed(2)}%)`
}

function burstConfetti() {
  const fragment = document.createDocumentFragment()
  const particleCount = 34 + Math.floor(Math.random() * 18)

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

  elements.confettiLayer.appendChild(fragment)
  window.setTimeout(() => elements.confettiLayer.replaceChildren(), 900)
}

async function refresh() {
  render(await invoke('get_state'))
}

elements.pin.addEventListener('click', async () => {
  render(await invoke('set_always_on_top', { enabled: !state.alwaysOnTop }))
})

listen('click-audit:update', (event) => render(event.payload))
refresh()
