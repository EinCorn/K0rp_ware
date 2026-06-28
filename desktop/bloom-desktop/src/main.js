import { getCurrentWindow } from '@tauri-apps/api/window'
import './styles.css'

const appWindow = getCurrentWindow()
const app = document.querySelector('#app')
const TOTAL = 25
const BASE_RED = 7
const state = { score: 0, wave: 1, board: makeBoard(1), locked: false, pinned: false }

app.innerHTML = `
  <section class="game-shell">
    <button id="reset" class="corner reset" type="button" title="Reset">×</button>
    <button id="pin" class="corner pin" type="button" title="Pin window">📌</button>
    <div id="board" class="board"></div>
    <footer class="score"><span>score</span><strong id="score">0</strong><span id="wave">wave 1</span></footer>
  </section>
`

const els = {
  shell: document.querySelector('.game-shell'),
  board: document.querySelector('#board'),
  score: document.querySelector('#score'),
  wave: document.querySelector('#wave'),
  pin: document.querySelector('#pin'),
  reset: document.querySelector('#reset'),
}

function makeBoard(wave) {
  const count = Math.min(BASE_RED + Math.floor(wave / 2), TOTAL - 3)
  const red = new Set()
  while (red.size < count) red.add(Math.floor(Math.random() * TOTAL))
  return Array.from({ length: TOTAL }, (_, index) => ({ green: !red.has(index), fresh: false }))
}

function render() {
  els.board.replaceChildren()
  state.board.forEach((item, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `stone ${item.green ? 'green' : 'red'} ${item.fresh ? 'fresh' : ''}`
    button.addEventListener('click', () => play(index))
    els.board.appendChild(button)
  })
  els.score.textContent = String(state.score)
  els.wave.textContent = `wave ${state.wave}`
  els.shell.classList.toggle('clear', state.locked)
}

function play(index) {
  if (state.locked || state.board[index].green) return
  state.board = state.board.map((item, itemIndex) => itemIndex === index ? { green: true, fresh: true } : item)

  if (state.board.every((item) => item.green)) {
    state.score += 10
    state.locked = true
    render()
    window.setTimeout(() => {
      state.wave += 1
      state.board = makeBoard(state.wave)
      state.locked = false
      render()
    }, 520)
    return
  }

  state.score += 1
  render()
}

function reset() {
  state.score = 0
  state.wave = 1
  state.board = makeBoard(1)
  state.locked = false
  render()
}

async function setPinned(enabled) {
  await appWindow.setAlwaysOnTop(enabled)
  state.pinned = enabled
  els.pin.setAttribute('aria-pressed', state.pinned ? 'true' : 'false')
}

els.reset.addEventListener('click', reset)
els.pin.addEventListener('click', () => setPinned(!state.pinned))
render()
