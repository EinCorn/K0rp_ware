import { useEffect, useState } from 'react'
import './BloomPage.css'

const BOARD_SIZE = 25
const STORAGE_KEY = 'k0rp-bloom-state-v1'
const STATUS_GREEN = 'green'
const STATUS_YELLOW = 'yellow'
const STATUS_RED = 'red'
const VALID_STATUSES = new Set([STATUS_GREEN, STATUS_YELLOW, STATUS_RED])
const CLEAR_PARTICLES = [
  [-82, -44, 0],
  [-58, -74, 18],
  [-22, -86, 34],
  [19, -82, 8],
  [56, -66, 28],
  [84, -34, 12],
  [92, 2, 40],
  [72, 42, 22],
  [42, 76, 0],
  [6, 88, 30],
  [-32, 82, 14],
  [-68, 54, 36],
  [-94, 18, 6],
  [-76, -8, 24],
  [-40, -38, 44],
  [36, -30, 16],
  [60, 12, 46],
  [-10, 42, 10],
]

function getStatusCounts(wave = 1) {
  const redCount = wave >= 15 ? Math.min(1 + Math.floor((wave - 15) / 4), 6) : 0
  const yellowCount = Math.min(5 + Math.floor((wave - 1) / 3), BOARD_SIZE - redCount - 5)

  return { redCount, yellowCount }
}

function createBoard(wave = 1) {
  const { redCount, yellowCount } = getStatusCounts(wave)
  const indexes = Array.from({ length: BOARD_SIZE }, (_, index) => index)

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]]
  }

  const redIndexes = new Set(indexes.slice(0, redCount))
  const yellowIndexes = new Set(indexes.slice(redCount, redCount + yellowCount))

  return Array.from({ length: BOARD_SIZE }, (_, index) => {
    let status = STATUS_GREEN

    if (redIndexes.has(index)) {
      status = STATUS_RED
    } else if (yellowIndexes.has(index)) {
      status = STATUS_YELLOW
    }

    return {
      id: `${wave}-${index}`,
      status,
      bloomPhase: '',
    }
  })
}

function getNextStatus(status) {
  if (status === STATUS_RED) return STATUS_YELLOW
  if (status === STATUS_YELLOW) return STATUS_GREEN
  return STATUS_GREEN
}

function normalizeBoard(wave, board) {
  if (!Array.isArray(board) || board.length !== BOARD_SIZE) {
    return createBoard(wave)
  }

  return board.map((stone, index) => {
    const status = VALID_STATUSES.has(stone?.status) ? stone.status : STATUS_GREEN

    return {
      id: `${wave}-${index}`,
      status,
      bloomPhase: '',
    }
  })
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
      board: normalizeBoard(wave, storedState.board),
    }
  } catch {
    return {
      score: 0,
      wave: 1,
      board: createBoard(1),
    }
  }
}

function saveGame({ score, wave, board }) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        score,
        wave,
        board: board.map(({ status }) => ({ status })),
      }),
    )
  } catch {
    // Lokální uložení je pohodlnostní vrstva; hraní na něm nesmí stát.
  }
}

function BloomPage() {
  const [initialState] = useState(() => loadGame())
  const [score, setScore] = useState(initialState.score)
  const [wave, setWave] = useState(initialState.wave)
  const [board, setBoard] = useState(initialState.board)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    if (!isClearing) {
      saveGame({ score, wave, board })
    }
  }, [score, wave, board, isClearing])

  function resetGame() {
    const nextBoard = createBoard(1)

    setScore(0)
    setWave(1)
    setIsClearing(false)
    setBoard(nextBoard)
    saveGame({ score: 0, wave: 1, board: nextBoard })
  }

  function hitStone(index) {
    if (isClearing) return

    setBoard((currentBoard) => {
      const currentStone = currentBoard[index]

      if (!currentStone || currentStone.status === STATUS_GREEN) {
        return currentBoard
      }

      const nextBoard = currentBoard.map((stone, stoneIndex) => {
        if (stoneIndex !== index) return { ...stone, bloomPhase: '' }

        const nextStatus = getNextStatus(stone.status)

        return {
          ...stone,
          status: nextStatus,
          bloomPhase: nextStatus === STATUS_GREEN ? 'bloom-green' : 'step-yellow',
        }
      })
      const cleared = nextBoard.every((stone) => stone.status === STATUS_GREEN)

      setScore((currentScore) => currentScore + (cleared ? 11 : 1))

      if (cleared) {
        setIsClearing(true)
        window.setTimeout(() => {
          setWave((currentWave) => {
            const nextWave = currentWave + 1
            const nextWaveBoard = createBoard(nextWave)

            setBoard(nextWaveBoard)
            saveGame({ score: score + 11, wave: nextWave, board: nextWaveBoard })

            return nextWave
          })
          setIsClearing(false)
        }, 760)
      }

      return nextBoard
    })
  }

  return (
    <main className="bloom-page-shell">
      <a className="bloom-back" href="/">Zpět</a>
      <section className={`bloom-panel ${isClearing ? 'is-clearing' : ''}`} aria-label="Prototyp K0rp Bloom">
        <header className="bloom-titlebar">
          <span className="bloom-dot" />
          <span className="bloom-dot" />
          <span className="bloom-dot" />
          <strong>Bloom</strong>
        </header>
        <button className="bloom-reset" type="button" aria-label="Resetovat Bloom" title="Resetovat Bloom" onClick={resetGame}>×</button>
        <button className="bloom-pin" type="button" aria-label="Připíchnout okno" title="Připíchnout okno">📌</button>
        <div className="bloom-board" aria-label="Stavový board Bloomu">
          {board.map((stone, index) => (
            <button
              key={stone.id}
              className={`bloom-stone is-${stone.status} ${stone.bloomPhase}`}
              type="button"
              aria-label={`Stavový kámen: ${stone.status}`}
              onClick={() => hitStone(index)}
            />
          ))}
        </div>
        {isClearing && (
          <div className="bloom-clear-burst" aria-hidden="true">
            {CLEAR_PARTICLES.map(([x, y, delay], index) => (
              <span
                key={`${x}-${y}-${index}`}
                style={{ '--x': `${x}px`, '--y': `${y}px`, '--delay': `${delay}ms` }}
              />
            ))}
          </div>
        )}
        <footer className="bloom-scorebar">
          <span>skóre</span>
          <strong>{score}</strong>
          <span>vlna {wave}</span>
        </footer>
      </section>
    </main>
  )
}

export default BloomPage
