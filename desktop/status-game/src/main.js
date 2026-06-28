import { invoke } from '@tauri-apps/api/core'
import './styles.css'

const app = document.querySelector('#app')
const BOARD_SIZE = 25
const RED_BASE_COUNT = 7

const state = {
  score: 0,
  wave: 1,
  board: createBoard(1),
  clearing: false,
  alwaysOnTop: false,
}

app.innerHTML = `
  <section class="bloom-shell" aria-label="Bloom status game">
    <button id="reset" class="corner-button reset-button" type="button" aria-label="Reset" title="Reset">×</button>
    <button id="pin" class="corner-button pin-button" type="button" aria-label="Pin window" title="Pin window">📌</button>
    <div id="board" class="bloom-board" aria-label="Status board"></div>
    <footer class="scorebar">
      <span>score</span>
      <strong id="score">0</strong>
      <span id="wave">wave 1</span>
    </footer>
  </section>
`

const elements = {
  board: document.querySelector('#board'),
  score: document.querySelector('#score'),
  wave: document.querySelector('#wave'),
  pin: document.querySelector('#pin'),
  reset: document.querySelector('#reset'),
}

function createBoard(wave = 1) {
  const redCount = Math.min(RED_BASE_COUNT + Math.floor(wave / 2), BOARD_SIZE - 3)
  const redIndexes = new Set()

  while (redIndexes.size < redCount) {
    redIndexes.add(Math.floor(Math.random() * BOARD_SIZE))
  }

  return Array.from({ length: BOARD_SIZE }, (_, index) => ({
    isGreen: !redIndexes.has(index),
    bloomed: false,
  }))
}

function render() {
  const fragment = document.createDocumentFragment()

  elements.board.innerHTML = ''
  state.board.forEach((stone, index) => {
    const button = document.createElement('button')
    button.className = `bloom-stone ${stone.isGreen ? 'is-green' : 'is-red'} ${stone.bloomed ? 'has-bloomed' : ''}`
    button.type = 'button'
    button.setAttribute('aria-label', stone.isGreen ? 'Green status stone' : 'Red status stone')
    button.addEventListener('click', () => hitStone(index))
    fragment.appendChild(button)
  })

  elements.board.appendChild(fragment)
  elements.score.textContent = String(state.score)
  elements.wave.textContent = `wave ${state.wave}`
  document.querySelector('.bloom-shell').classList.toggle('is-clearing', state.clearing)
}

function hitStone(index) {
  if (state.clearing || state.board[index].isGreen) return

  state.board = state.board.map((stone, stoneIndex) => (
    stoneIndex === index ? { ...stone, isGreen: true, bloomed: true } : stone
  ))

  if (state.board.every((stone) => stone.isGreen)) {
    state.score += 10
    state.clearing = true
    render()

    window.setTimeout(() => {
      state.wave += 1
      state.board = createBoard(state.wave)
      state.clearing = false
      render()
    }, 520)

    return
  }

  state.score += 1
  render()
}

function resetGame() {
  state.score = 0
  state.wave = 1
  state.board = createBoard(1)
  state.clearing = false
  render()
}

async function setAlwaysOnTop(enabled) {
  state.alwaysOnTop = await invoke('set_always_on_top', { enabled })
  elements.pin.setAttribute('aria-pressed', state.alwaysOnTop ? 'true' : 'false')
  elements.pin.setAttribute('aria-label', state.alwaysOnTop ? 'Unpin window' : 'Pin window')
  elements.pin.setAttribute('title', state.alwaysOnTop ? 'Unpin window' : 'Pin window')
}

elements.reset.addEventListener('click', resetGame)
elements.pin.addEventListener('click', () => setAlwaysOnTop(!state.alwaysOnTop))
render()
