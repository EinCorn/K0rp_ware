import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import './styles.css'
import './frameless.css'
import './visual-test.css'
import './layout-fix.css'
import './control-tune.css'
import './digit-card-pixel.css'
import './source-report.js'

const appWindow = getCurrentWindow()
const app = document.querySelector('#app')

// Vývojové ladění. Produkce se může vrátit blíž k 1_000_000.
const PROGRESS_TARGET_CLICKS = 2_500
const COLOR_TARGET_CLICKS = PROGRESS_TARGET_CLICKS
const CONFETTI_CHANCE = 0.5
const CONFETTI_COLORS = ['#ff4f5e', '#ffb84d', '#f7ff5c', '#64ff8f', '#56d9ff', '#9f7bff', '#ff62d2']
const LIQUID_PALETTE = ['#ff3b30', '#ff9f0a', '#ffd60a', '#34c759', '#00c7be', '#0a84ff', '#bf5af2']
const DEV_MILLION_TEST_VALUE = 1_000_000
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
const DIGIT_PATHS = {
  0: 'M18 4H52L64 16V94L52 106H18L6 94V16L18 4ZM25 24L22 27V83L25 86H45L48 83V27L45 24H25Z',
  1: 'M33 4H49V86H62V106H13V86H29V25H17V14L33 4Z',
  2: 'M13 4H54L64 14V43L55 54L28 82V86H64V106H8V84L42 50L48 42V27L44 23H13V4Z',
  3: 'M10 4H54L64 14V43L55 54L64 64V96L54 106H10V86H43L48 81V68L43 63H23V44H43L48 39V28L43 23H10V4Z',
  4: 'M42 4H62V106H42V72H6V52L39 4H42ZM42 52V28L26 52H42Z',
  5: 'M8 4H62V24H28V41H51L62 52V95L51 106H9V86H43L48 81V67L43 62H8V4Z',
  6: 'M18 4H59V24H25L20 29V43H51L62 54V94L50 106H19L6 93V17L18 4ZM25 62L21 66V82L25 86H44L48 82V66L44 62H25Z',
  7: 'M7 4H64V24L32 106H10L42 25V24H7V4Z',
  8: 'M19 4H51L63 16V42L54 53L64 64V94L52 106H18L6 94V64L16 53L7 42V16L19 4ZM26 24L23 27V40L26 43H44L47 40V27L44 24H26ZM25 63L22 66V83L25 86H45L48 83V66L45 63H25Z',
  9: 'M20 4H51L64 17V94L52 106H12V86H45L50 81V67H19L7 55V16L20 4ZM26 24L23 27V44L26 47H45L49 43V28L45 24H26Z',
}

let snapshot = normalizeSnapshot()
let displayedClicks = null
let activeSource = 'clickAudit'

app.innerHTML = `
  <section class="shell">
    <div id="drag" class="drag-region" data-tauri-drag-region aria-hidden="true"></div>
    <div id="liquid" class="progress-liquid" aria-hidden="true">
      <div class="liquid-fill">
        <span class="liquid-wave liquid-wave-a"></span>
        <span class="liquid-wave liquid-wave-b"></span>
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
  pin: document.querySelector('#pin'),
  reset: document.querySelector('#reset'),
  close: document.querySelector('#close'),
  confettiLayer: document.querySelector('#confetti-layer'),
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

  renderDigits(String(snapshot.globalClicks), String(displayedClicks === null ? previousClicks : displayedClicks))
  elements.counter.style.setProperty('--progress-color', getCounterColor(snapshot.globalClicks))
  elements.liquid.style.setProperty('--liquid-progress', `${(progress * 100).toFixed(2)}%`)
  elements.liquid.style.setProperty('--liquid-gradient', getLiquidGradient(progress))
  elements.pin.setAttribute('aria-pressed', snapshot.alwaysOnTop ? 'true' : 'false')
  elements.pin.setAttribute('aria-label', snapshot.alwaysOnTop ? 'Odepnout okno' : 'Připíchnout okno')
  elements.pin.setAttribute('title', snapshot.alwaysOnTop ? 'Odepnout okno' : 'Připíchnout okno')

  if (snapshot.globalClicks > previousClicks && Math.random() < CONFETTI_CHANCE) {
    burstConfetti()
  }

  displayedClicks = snapshot.globalClicks
}

function renderDigits(currentValue, previousValue) {
  const currentDigits = currentValue.split('')
  const previousDigits = previousValue.padStart(currentDigits.length, ' ').split('')
  const fragment = document.createDocumentFragment()

  elements.counter.dataset.digits = String(currentDigits.length)
  elements.counter.dataset.size = getDigitDeckSize(currentDigits.length)
  elements.counter.setAttribute('aria-label', `${currentValue} kliků`)

  currentDigits.forEach((digit, index) => {
    const previousDigit = previousDigits[index]
    const changed = previousDigit !== digit
    const oldDigit = previousDigit === ' ' ? digit : previousDigit
    const currentGlyph = renderDigitGlyph(digit)
    const oldGlyph = renderDigitGlyph(oldDigit)
    const card = document.createElement('span')

    card.className = changed ? 'digit-card is-changing' : 'digit-card'
    card.style.setProperty('--flip-delay', `${Math.min(index * 26, 130)}ms`)
    card.innerHTML = `
      <span class="digit-face digit-top">${currentGlyph}</span>
      <span class="digit-face digit-bottom">${currentGlyph}</span>
      ${
        changed
          ? `<span class="digit-flap digit-flap-top">${oldGlyph}</span>
             <span class="digit-flap digit-hold-bottom">${oldGlyph}</span>
             <span class="digit-flap digit-flap-bottom">${currentGlyph}</span>`
          : ''
      }
      <span class="digit-hinge"></span>
    `
    fragment.appendChild(card)
  })

  elements.counter.replaceChildren(fragment)
}

function renderDigitGlyph(digit) {
  const safeDigit = Object.hasOwn(DIGIT_PATHS, digit) ? digit : '0'
  const path = DIGIT_PATHS[safeDigit]

  return `
    <span class="digit-glyph digit-glyph-${safeDigit}" aria-hidden="true">
      <svg class="digit-svg" viewBox="0 0 70 110" focusable="false" aria-hidden="true">
        <path class="digit-svg-fill" d="${path}" />
        <path class="digit-svg-grime" d="M21 18H24V21H21ZM47 19H50V22H47ZM29 37H32V40H29ZM53 51H56V54H53ZM17 66H20V69H17ZM40 83H43V86H40ZM26 96H29V99H26Z" />
      </svg>
    </span>
  `
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
