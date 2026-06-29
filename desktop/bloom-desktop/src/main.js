import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import './styles.css'
import './frameless.css'
import './drag-corner.css'
import './visual-test.css'
import './layout-fix.css'
import './source-report.js'

const appWindow = getCurrentWindow()
const app = document.querySelector('#app')
const TOTAL = 25
const STORAGE_KEY = 'k0rp-bloom-state-v1'
const GREEN = 'green'
const YELLOW = 'yellow'
const RED = 'red'
const VALID_STATUSES = new Set([GREEN, YELLOW, RED])
const CLEAR_PARTICLES = [
  [-82, -44, 0], [-58, -74, 18], [-22, -86, 34], [19, -82, 8], [56, -66, 28], [84, -34, 12],
  [92, 2, 40], [72, 42, 22], [42, 76, 0], [6, 88, 30], [-32, 82, 14], [-68, 54, 36],
  [-94, 18, 6], [-76, -8, 24], [-40, -38, 44], [36, -30, 16], [60, 12, 46], [-10, 42, 10],
]

const savedGame = loadGame()
const state = { score: savedGame.score, wave: savedGame.wave, board: savedGame.board, locked: false, pinned: false }

app.innerHTML = `
  <section class="game-shell">
    <div id="drag" class="drag-region" data-tauri-drag-region aria-hidden="true"></div>
    <button id="pin" class="corner pin" type="button" aria-label="Připíchnout okno" title="Připíchnout okno">📌</button>
    <button id="reset" class="corner reset" type="button" aria-label="Resetovat Bloom" title="Resetovat Bloom">↺</button>
    <button id="close" class="corner close" type="button" aria-label="Zavřít Bloom" title="Zavřít Bloom">×</button>
    <div id="board" class="board" aria-label="Stavový board Bloomu"></div>
    <div id="burst" class="clear-burst" aria-hidden="true"></div>
    <footer class="score"><span>skóre</span><strong id="score">0</strong><span id="wave">vlna 1</span></footer>
  </section>
`

const els = {
  shell: document.querySelector('.game-shell'),
  drag: document.querySelector('#drag'),
  board: document.querySelector('#board'),
  burst: document.querySelector('#burst'),
  score: document.querySelector('#score'),
  wave: document.querySelector('#wave'),
  pin: document.querySelector('#pin'),
  reset: document.querySelector('#reset'),
  close: document.querySelector('#close'),
}

function getCounts(wave) {
  const red = wave >= 15 ? Math.min(1 + Math.floor((wave - 15) / 4), 6) : 0
  const yellow = Math.min(5 + Math.floor((wave - 1) / 3), TOTAL - red - 5)
  return { red, yellow }
}

function makeBoard(wave) {
  const { red, yellow } = getCounts(wave)
  const indexes = Array.from({ length: TOTAL }, (_, index) => index)

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[indexes[index], indexes[swap]] = [indexes[swap], indexes[index]]
  }

  const reds = new Set(indexes.slice(0, red))
  const yellows = new Set(indexes.slice(red, red + yellow))

  return Array.from({ length: TOTAL }, (_, index) => {
    const status = reds.has(index) ? RED : yellows.has(index) ? YELLOW : GREEN
    return { status, fresh: '' }
  })
}

function normalizeBoard(board, wave) {
  if (!Array.isArray(board) || board.length !== TOTAL) {
    return makeBoard(wave)
  }

  return board.map((item) => ({
    status: VALID_STATUSES.has(item?.status) ? item.status : GREEN,
    fresh: '',
  }))
}

function loadGame() {
  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY)
    if (!rawState) throw new Error('Bloom nemá uložený stav')

    const storedState = JSON.parse(rawState)
    const wave = Number.isInteger(storedState.wave) && storedState.wave > 0 ? storedState.wave : 1
    const score = Number.isInteger(storedState.score) && storedState.score >= 0 ? storedState.score : 0

    return {
      score,
      wave,
      board: normalizeBoard(storedState.board, wave),
    }
  } catch {
    return {
      score: 0,
      wave: 1,
      board: makeBoard(1),
    }
  }
}

function saveGame() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        score: state.score,
        wave: state.wave,
        board: state.board.map(({ status }) => ({ status })),
      }),
    )
  } catch {
    // Lokální uložení je pomocná vrstva; Bloom zůstává hratelný i bez ní.
  }
}

function nextStatus(status) {
  if (status === RED) return YELLOW
  if (status === YELLOW) return GREEN
  return GREEN
}

function render() {
  els.board.replaceChildren()
  state.board.forEach((item, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `stone ${item.status} ${item.fresh}`
    button.setAttribute('aria-label', `Stavový kámen: ${item.status}`)
    button.addEventListener('click', () => play(index))
    els.board.appendChild(button)
  })
  els.score.textContent = String(state.score)
  els.wave.textContent = `vlna ${state.wave}`
  els.shell.classList.toggle('clear', state.locked)
}

function play(index) {
  if (state.locked || state.board[index].status === GREEN) return

  state.board = state.board.map((item, itemIndex) => {
    if (itemIndex !== index) return { ...item, fresh: '' }
    const status = nextStatus(item.status)
    return { status, fresh: status === GREEN ? 'bloom' : 'step' }
  })

  if (state.board.every((item) => item.status === GREEN)) {
    state.score += 11
    state.locked = true
    render()
    explode()
    window.setTimeout(() => {
      state.wave += 1
      state.board = makeBoard(state.wave)
      state.locked = false
      saveGame()
      render()
    }, 760)
    return
  }

  state.score += 1
  saveGame()
  render()
}

function explode() {
  els.burst.replaceChildren()
  const fragment = document.createDocumentFragment()

  CLEAR_PARTICLES.forEach(([x, y, delay], index) => {
    const particle = document.createElement('span')
    particle.style.setProperty('--x', `${x}px`)
    particle.style.setProperty('--y', `${y}px`)
    particle.style.setProperty('--delay', `${delay}ms`)
    if (index % 3 === 0) particle.classList.add('yellow')
    fragment.appendChild(particle)
  })

  els.burst.appendChild(fragment)
  window.setTimeout(() => els.burst.replaceChildren(), 900)
}

function reset() {
  state.score = 0
  state.wave = 1
  state.board = makeBoard(1)
  state.locked = false
  els.burst.replaceChildren()
  saveGame()
  render()
}

function startWindowMove(event) {
  event.preventDefault()
  invoke('begin_window_move').catch(() => {})
}

async function setPinned(enabled) {
  await appWindow.setAlwaysOnTop(enabled)
  state.pinned = enabled
  els.pin.setAttribute('aria-pressed', state.pinned ? 'true' : 'false')
  els.pin.setAttribute('aria-label', state.pinned ? 'Odepnout okno' : 'Připíchnout okno')
  els.pin.setAttribute('title', state.pinned ? 'Odepnout okno' : 'Připíchnout okno')
}

els.drag.addEventListener('mousedown', startWindowMove)
els.reset.addEventListener('click', reset)
els.pin.addEventListener('click', () => setPinned(!state.pinned))
els.close.addEventListener('click', () => appWindow.close())
render()
