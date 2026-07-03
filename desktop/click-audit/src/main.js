import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import './styles.css'
import './frameless.css'
import './visual-test.css'
import './layout-fix.css'
import './control-tune.css'
import './source-report.js'

const appWindow = getCurrentWindow()
const app = document.querySelector('#app')

// Vývojové ladění. Produkce se může vrátit blíž k 1_000_000.
const PROGRESS_TARGET_CLICKS = 2_500
const CELEBRATE_EVERY_CLICKS = 100
const LIQUID_COLORS = ['#9d3b36', '#b35f2e', '#b69b2e', '#4f8a4f', '#2f7f7a', '#365b9f', '#5a3a91']
const LIQUID_SPECTRUM = `linear-gradient(
  to top,
  #5a3a91 0%,
  #365b9f 16%,
  #2f7f7a 32%,
  #4f8a4f 48%,
  #b69b2e 64%,
  #b35f2e 80%,
  #9d3b36 100%
)`
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

app.innerHTML = `
  <section class="shell">
    <div id="drag" class="drag-region" data-tauri-drag-region aria-hidden="true"></div>
    <button id="pin" class="corner-button pin-button" type="button" aria-label="Připíchnout okno" title="Připíchnout okno">📌</button>
    <button id="reset" class="corner-button reset-button" type="button" aria-label="Resetovat počítadlo" title="Resetovat počítadlo">↻</button>
    <button id="close" class="close-button" type="button" aria-label="Zavřít ClickAudit" title="Zavřít ClickAudit">×</button>
    <div class="progress-liquid" aria-hidden="true">
      <span id="liquid-fill" class="liquid-fill"><span class="liquid-wave"></span><span class="liquid-wave liquid-wave-b"></span></span>
    </div>
    <div id="digits" class="digit-deck" aria-label="Počet kliků"></div>
    <div id="celebration" class="confetti-layer" aria-hidden="true"></div>
  </section>
`

const elements = {
  drag: document.querySelector('#drag'),
  pin: document.querySelector('#pin'),
  reset: document.querySelector('#reset'),
  close: document.querySelector('#close'),
  digits: document.querySelector('#digits'),
  liquidFill: document.querySelector('#liquid-fill'),
  celebration: document.querySelector('#celebration'),
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

function liquidColor(progress) {
  const index = Math.min(LIQUID_COLORS.length - 1, Math.floor(progress * LIQUID_COLORS.length))
  return LIQUID_COLORS[index]
}

function getDigitDeckSize(digitCount) {
  if (digitCount <= 3) return 'standard'
  if (digitCount <= 6) return 'compact'
  if (digitCount <= 9) return 'dense'
  return 'micro'
}

function crossedMilestone(previousValue, nextValue, milestoneSize) {
  return Math.floor(previousValue / milestoneSize) !== Math.floor(nextValue / milestoneSize)
}

function renderDigits(value) {
  const currentValue = String(value)
  const currentDigits = currentValue.split('')
  const previousValue = displayedClicks === null ? value : displayedClicks
  const previousDigits = String(previousValue).padStart(currentDigits.length, ' ').split('')
  const fragment = document.createDocumentFragment()

  elements.digits.dataset.digits = String(currentDigits.length)
  elements.digits.dataset.size = getDigitDeckSize(currentDigits.length)
  elements.digits.setAttribute('aria-label', `${currentValue} kliků`)

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

  elements.digits.replaceChildren(fragment)
  displayedClicks = value
}

function renderProgress(value) {
  const progress = Math.min(1, value / PROGRESS_TARGET_CLICKS)
  const percent = progress * 100
  const color = liquidColor(progress)
  elements.liquidFill.style.setProperty('--liquid-progress', `${percent}%`)
  elements.liquidFill.style.setProperty('--liquid-color', color)
  elements.liquidFill.style.setProperty('--liquid-gradient', LIQUID_SPECTRUM)
}

function renderSnapshot(nextSnapshot = snapshot) {
  const previousClicks = snapshot.globalClicks
  snapshot = normalizeSnapshot(nextSnapshot)
  renderDigits(snapshot.globalClicks)
  renderProgress(snapshot.globalClicks)
  elements.pin.setAttribute('aria-pressed', snapshot.alwaysOnTop ? 'true' : 'false')
  elements.pin.setAttribute('aria-label', snapshot.alwaysOnTop ? 'Odepnout okno' : 'Připíchnout okno')
  elements.pin.setAttribute('title', snapshot.alwaysOnTop ? 'Odepnout okno' : 'Připíchnout okno')

  if (crossedMilestone(previousClicks, snapshot.globalClicks, CELEBRATE_EVERY_CLICKS)) {
    celebrate()
  }
}

function celebrate() {
  elements.celebration.replaceChildren()
  const burst = document.createElement('div')
  const fragment = document.createDocumentFragment()

  burst.className = 'confetti-burst'

  for (let index = 0; index < 28; index += 1) {
    const particle = document.createElement('span')
    const angle = (Math.PI * 2 * index) / 28
    const distance = 54 + (index % 7) * 9
    particle.className = 'confetti-pixel'
    particle.style.setProperty('--x', `${Math.cos(angle) * distance}px`)
    particle.style.setProperty('--y', `${Math.sin(angle) * distance}px`)
    particle.style.setProperty('--r', `${index * 31}deg`)
    particle.style.setProperty('--s', `${3 + (index % 4)}px`)
    fragment.appendChild(particle)
  }

  burst.appendChild(fragment)
  elements.celebration.appendChild(burst)
  window.setTimeout(() => elements.celebration.replaceChildren(), 1250)
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
