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
const STORAGE_KEY = 'k0rp-click-audit-state-v1'
const LIQUID_COLORS = ['#9d3b36', '#b35f2e', '#b69b2e', '#4f8a4f', '#2f7f7a', '#365b9f', '#5a3a91']
const SOURCE_LABELS = {
  clickAudit: 'ClickAudit',
  fidget: 'Fidget',
  bloom: 'Bloom',
  workQuestion: 'Práce?',
}

let state = loadState()
let alwaysOnTop = false
let activeSource = 'clickAudit'
let displayedClicks = state.globalClicks

app.innerHTML = `
  <section class="shell">
    <div id="drag" class="drag-region" data-tauri-drag-region aria-hidden="true"></div>
    <button id="pin" class="corner-button pin-button" type="button" aria-label="Připíchnout okno" title="Připíchnout okno">📌</button>
    <button id="reset" class="corner-button reset-button" type="button" aria-label="Resetovat počítadlo" title="Resetovat počítadlo">↻</button>
    <button id="close" class="close-button" type="button" aria-label="Zavřít ClickAudit" title="Zavřít ClickAudit">×</button>
    <div class="progress-liquid" aria-hidden="true"><span id="liquid-fill" class="liquid-fill"></span></div>
    <div id="digits" class="digit-deck" aria-label="Počet kliků"></div>
    <div id="celebration" class="celebration" aria-hidden="true"></div>
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

function normalizeSources(sourceClicks) {
  const stored = sourceClicks && typeof sourceClicks === 'object' ? sourceClicks : {}
  return {
    clickAudit: Number.isFinite(stored.clickAudit) ? stored.clickAudit : 0,
    fidget: Number.isFinite(stored.fidget) ? stored.fidget : 0,
    bloom: Number.isFinite(stored.bloom) ? stored.bloom : 0,
    workQuestion: Number.isFinite(stored.workQuestion) ? stored.workQuestion : 0,
  }
}

function calculateGlobalClicks(sourceClicks) {
  return Object.values(sourceClicks).reduce((sum, value) => sum + value, 0)
}

function loadState() {
  try {
    const rawState = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    const sourceClicks = normalizeSources(rawState.sourceClicks)
    const globalClicks = Number.isFinite(rawState.globalClicks)
      ? Math.max(rawState.globalClicks, calculateGlobalClicks(sourceClicks))
      : calculateGlobalClicks(sourceClicks)
    return { globalClicks, sourceClicks }
  } catch {
    return { globalClicks: 0, sourceClicks: normalizeSources() }
  }
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function syncGlobalClicks() {
  state.globalClicks = calculateGlobalClicks(state.sourceClicks)
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

function renderDigits(value) {
  const currentValue = String(value)
  const currentDigits = currentValue.split('')
  const previousDigits = String(displayedClicks).padStart(currentDigits.length, ' ').split('')
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

function renderProgress() {
  const progress = Math.min(1, state.globalClicks / PROGRESS_TARGET_CLICKS)
  const percent = progress * 100
  elements.liquidFill.style.setProperty('--liquid-progress', `${percent}%`)
  elements.liquidFill.style.setProperty('--liquid-color', liquidColor(progress))
  elements.liquidFill.style.setProperty('--liquid-gradient', `linear-gradient(to bottom, ${liquidColor(progress)}, ${liquidColor(progress)})`)
}

function render() {
  syncGlobalClicks()
  renderDigits(state.globalClicks)
  renderProgress()
}

function celebrate() {
  elements.celebration.replaceChildren()
  const fragment = document.createDocumentFragment()

  for (let index = 0; index < 24; index += 1) {
    const star = document.createElement('span')
    const angle = (Math.PI * 2 * index) / 24
    const distance = 62 + (index % 5) * 8
    star.className = 'star'
    star.style.setProperty('--x', `${Math.cos(angle) * distance}px`)
    star.style.setProperty('--y', `${Math.sin(angle) * distance}px`)
    star.style.setProperty('--delay', `${index * 16}ms`)
    fragment.appendChild(star)
  }

  elements.celebration.appendChild(fragment)
  window.setTimeout(() => elements.celebration.replaceChildren(), 1100)
}

function registerClick(source = activeSource) {
  const normalizedSource = Object.prototype.hasOwnProperty.call(state.sourceClicks, source) ? source : 'workQuestion'
  const before = state.globalClicks
  state.sourceClicks[normalizedSource] += 1
  syncGlobalClicks()
  saveState()
  render()

  if (Math.floor(before / 1000) !== Math.floor(state.globalClicks / 1000)) {
    celebrate()
  }
}

function reset() {
  state = { globalClicks: 0, sourceClicks: normalizeSources() }
  displayedClicks = 0
  saveState()
  render()
}

async function setAlwaysOnTop(enabled) {
  alwaysOnTop = await invoke('set_always_on_top', { enabled })
  elements.pin.setAttribute('aria-pressed', alwaysOnTop ? 'true' : 'false')
  elements.pin.setAttribute('aria-label', alwaysOnTop ? 'Odepnout okno' : 'Připíchnout okno')
  elements.pin.setAttribute('title', alwaysOnTop ? 'Odepnout okno' : 'Připíchnout okno')
}

function handleGlobalClick(event) {
  if (event.payload?.inside_app) return
  activeSource = 'workQuestion'
  registerClick('workQuestion')
}

function startWindowMove(event) {
  event.preventDefault()
  invoke('begin_window_move').catch(() => {})
}

elements.drag.addEventListener('mousedown', startWindowMove)
elements.pin.addEventListener('click', () => setAlwaysOnTop(!alwaysOnTop))
elements.reset.addEventListener('click', reset)
elements.close.addEventListener('click', () => appWindow.close())
window.addEventListener('click', (event) => {
  if (event.target.closest('button')) return
  activeSource = 'clickAudit'
  registerClick('clickAudit')
})

listen('global-click', handleGlobalClick)

window.__K0RP_CLICK_AUDIT__ = {
  appClick(source = 'clickAudit') {
    activeSource = source
    registerClick(source)
  },
  getState() {
    syncGlobalClicks()
    return {
      ...state,
      activeSource,
      labels: SOURCE_LABELS,
      target: PROGRESS_TARGET_CLICKS,
    }
  },
  reset,
}

render()
