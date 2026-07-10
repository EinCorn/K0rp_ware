import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import digitSheetUrl from './assets/digits/digit-sheet-q30.jpg?url'
import liquidAnimation from './assets/liquid/liquid-water-36f-clean.json'
import './styles.css'
import './frameless.css'
import './visual-test.css'
import './layout-fix.css'
import './control-tune.css'
import './digit-card-pixel.css'
import './digit-card-clean.css'
import './source-report.js'

const appWindow = getCurrentWindow()
const app = document.querySelector('#app')

// Vývojové ladění. Produkce se může vrátit blíž k 1_000_000.
const PROGRESS_TARGET_CLICKS = 2_500
const COLOR_TARGET_CLICKS = PROGRESS_TARGET_CLICKS
const CONFETTI_CHANCE = 0.5
const CONFETTI_COLORS = ['#ff4f5e', '#ffb84d', '#f7ff5c', '#64ff8f', '#56d9ff', '#9f7bff', '#ff62d2']
const DEV_MILLION_TEST_VALUE = 1_000_000
const {
  frameCount: LIQUID_FRAME_COUNT,
  columns: LIQUID_FRAME_COLUMNS,
  frameDurationMs: LIQUID_FRAME_DURATION_MS,
} = liquidAnimation
const LIQUID_FRAME_POSITION_STEP = 100 / (LIQUID_FRAME_COLUMNS - 1)
const SOURCE_LABELS = {
  clickAudit: 'ClickAudit',
  fidget: 'Fidget',
  bloom: 'Bloom',
  workQuestion: 'Práce?',
}
const EMPTY_SOURCES = {
  clickAudit: 0,
  fidget: 0,
  bloom: 0,
  workQuestion: 0,
}

let snapshot = normalizeSnapshot()
let displayedClicks = null
let activeSource = 'clickAudit'
let liquidFrameIndex = -1
let liquidAnimationId = null

app.innerHTML = `
  <section class="shell">
    <div id="drag" class="drag-region" data-tauri-drag-region aria-hidden="true"></div>
    <div id="liquid" class="progress-liquid korp-app-window-content" aria-hidden="true">
      <div class="liquid-fill">
        <div class="liquid-sprite" aria-hidden="true"></div>
      </div>
    </div>
    <button id="pin" class="corner-button pin-button" type="button" aria-label="Připíchnout okno" title="Připíchnout okno">📌</button>
    <button id="reset" class="corner-button reset-button" type="button" aria-label="Resetovat počítadlo" title="Resetovat počítadlo">↺</button>
    <button id="close" class="close-button" type="button" aria-label="Zavřít ClickAudit" title="Zavřít ClickAudit">×</button>
    <div id="counter" class="digit-deck" aria-label="Počet kliků"></div>
    <div id="confetti-layer" class="confetti-layer" aria-hidden="true"></div>
  </section>
`

const elements = {
  drag: document.querySelector('#drag'),
  counter: document.querySelector('#counter'),
  liquid: document.querySelector('#liquid'),
  liquidSprite: document.querySelector('.liquid-sprite'),
  pin: document.querySelector('#pin'),
  reset: document.querySelector('#reset'),
  close: document.querySelector('#close'),
  confettiLayer: document.querySelector('#confetti-layer'),
}

function renderLiquidFrame(frameIndex) {
  const normalizedIndex = frameIndex % LIQUID_FRAME_COUNT
  const column = normalizedIndex % LIQUID_FRAME_COLUMNS
  const row = Math.floor(normalizedIndex / LIQUID_FRAME_COLUMNS)

  elements.liquidSprite.style.setProperty('--liquid-frame-x', `${column * LIQUID_FRAME_POSITION_STEP}%`)
  elements.liquidSprite.style.setProperty('--liquid-frame-y', `${row * LIQUID_FRAME_POSITION_STEP}%`)
  elements.liquidSprite.dataset.frame = String(normalizedIndex + 1)
  liquidFrameIndex = normalizedIndex
}

function startLiquidAnimation() {
  if (!elements.liquidSprite || liquidAnimationId !== null) return

  renderLiquidFrame(0)

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  let startedAt = null

  const tick = (timestamp) => {
    if (startedAt === null) startedAt = timestamp

    const nextFrame = Math.floor((timestamp - startedAt) / LIQUID_FRAME_DURATION_MS) % LIQUID_FRAME_COUNT

    if (nextFrame !== liquidFrameIndex) {
      renderLiquidFrame(nextFrame)
    }

    liquidAnimationId = window.requestAnimationFrame(tick)
  }

  liquidAnimationId = window.requestAnimationFrame(tick)
}

function safeNumber(value) {
  return Number.isFinite(value) && value >= 0 ? value : 0
}

function normalizeSources(sourceClicks = {}) {
  return {
    clickAudit: safeNumber(sourceClicks.clickAudit),
    fidget: safeNumber(sourceClicks.fidget),
    bloom: safeNumber(sourceClicks.bloom),
    workQuestion: safeNumber(sourceClicks.workQuestion),
  }
}

function normalizeSnapshot(nextSnapshot = {}) {
  return {
    app: nextSnapshot.app || 'click-audit',
    running: nextSnapshot.running !== false,
    globalClicks: safeNumber(nextSnapshot.globalClicks),
    sourceClicks: normalizeSources(nextSnapshot.sourceClicks || EMPTY_SOURCES),
    startedAtUnixMs: nextSnapshot.startedAtUnixMs || null,
    alwaysOnTop: Boolean(nextSnapshot.alwaysOnTop),
    privacyMode: nextSnapshot.privacyMode || 'aggregate-and-local-app-source',
  }
}

function renderSnapshot(nextSnapshot = snapshot) {
  const previousClicks = snapshot.globalClicks
  snapshot = normalizeSnapshot(nextSnapshot)

  const progress = getProgress(snapshot.globalClicks)

  renderDigits(String(snapshot.globalClicks))
  elements.counter.style.setProperty('--progress-color', getCounterColor(snapshot.globalClicks))
  elements.liquid.style.setProperty('--liquid-progress', `${(progress * 100).toFixed(2)}%`)
  elements.pin.setAttribute('aria-pressed', snapshot.alwaysOnTop ? 'true' : 'false')
  elements.pin.setAttribute('aria-label', snapshot.alwaysOnTop ? 'Odepnout okno' : 'Připíchnout okno')
  elements.pin.setAttribute('title', snapshot.alwaysOnTop ? 'Odepnout okno' : 'Připíchnout okno')

  if (snapshot.globalClicks > previousClicks && Math.random() < CONFETTI_CHANCE) {
    burstConfetti()
  }

  displayedClicks = snapshot.globalClicks
}

function renderDigits(currentValue) {
  const currentDigits = currentValue.split('')
  const fragment = document.createDocumentFragment()

  elements.counter.dataset.digits = String(currentDigits.length)
  elements.counter.dataset.size = getDigitDeckSize(currentDigits.length)
  elements.counter.setAttribute('aria-label', `${currentValue} kliků`)

  currentDigits.forEach((digit) => {
    const card = document.createElement('span')
    const numericDigit = Number.parseInt(digit, 10)
    const sheet = document.createElement('img')

    card.className = 'digit-card digit-card-asset'
    card.dataset.digit = digit
    card.style.setProperty('--digit-col', String(numericDigit % 5))
    card.style.setProperty('--digit-row', String(Math.floor(numericDigit / 5)))
    card.setAttribute('aria-hidden', 'true')

    sheet.className = 'digit-card-sheet'
    sheet.src = digitSheetUrl
    sheet.alt = ''
    sheet.draggable = false
    sheet.decoding = 'sync'

    card.appendChild(sheet)
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

async function refreshState() {
  const nextSnapshot = await invoke('get_state')
  renderSnapshot(nextSnapshot)
  return snapshot
}

async function reset() {
  displayedClicks = null
  const nextSnapshot = await invoke('reset_counting')
  renderSnapshot(nextSnapshot)
}

async function setAlwaysOnTop(enabled) {
  const nextSnapshot = await invoke('set_always_on_top', { enabled })
  renderSnapshot(nextSnapshot)
}

async function reportAppClick(source = 'click-audit') {
  activeSource = source
  const nextSnapshot = await invoke('report_app_click', { source })
  renderSnapshot(nextSnapshot)
  return snapshot
}

function startWindowMove(event) {
  event.preventDefault()
  invoke('begin_window_move').catch(() => {})
}

elements.drag.addEventListener('mousedown', startWindowMove)
elements.pin.addEventListener('click', () => setAlwaysOnTop(!snapshot.alwaysOnTop))
elements.reset.addEventListener('click', reset)
elements.close.addEventListener('click', () => appWindow.close())
startLiquidAnimation()

window.addEventListener('keydown', async (event) => {
  if (event.key.toLowerCase() === 'm') {
    renderSnapshot(await invoke('set_count_for_dev', { count: DEV_MILLION_TEST_VALUE }))
  }
})

listen('click-audit:update', (event) => renderSnapshot(event.payload))
listen('click-audit:notice', (event) => {
  console.warn('[K0rp ClickAudit]', event.payload)
})
window.addEventListener('k0rp-click-audit:snapshot', (event) => renderSnapshot(event.detail))

window.__K0RP_CLICK_AUDIT__ = {
  appClick: reportAppClick,
  getState() {
    return {
      ...snapshot,
      activeSource,
      labels: SOURCE_LABELS,
      target: PROGRESS_TARGET_CLICKS,
    }
  },
  refresh: refreshState,
  reset,
}

refreshState().catch(() => renderSnapshot())
