import { useState } from 'react'
import './BloomPage.css'

const BOARD_SIZE = 25
const STATUS_GREEN = 'green'
const STATUS_YELLOW = 'yellow'
const STATUS_RED = 'red'
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

function BloomPage() {
  const [score, setScore] = useState(0)
  const [wave, setWave] = useState(1)
  const [board, setBoard] = useState(() => createBoard(1))
  const [isClearing, setIsClearing] = useState(false)

  function resetGame() {
    setScore(0)
    setWave(1)
    setIsClearing(false)
    setBoard(createBoard(1))
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
            setBoard(createBoard(nextWave))
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
      <a className="bloom-back" href="/">Back</a>
      <section className={`bloom-panel ${isClearing ? 'is-clearing' : ''}`} aria-label="K0rp Bloom prototype">
        <header className="bloom-titlebar">
          <span className="bloom-dot" />
          <span className="bloom-dot" />
          <span className="bloom-dot" />
          <strong>Bloom</strong>
        </header>
        <button className="bloom-reset" type="button" aria-label="Reset Bloom" title="Reset Bloom" onClick={resetGame}>×</button>
        <button className="bloom-pin" type="button" aria-label="Pin window" title="Pin window">📌</button>
        <div className="bloom-board" aria-label="Bloom status board">
          {board.map((stone, index) => (
            <button
              key={stone.id}
              className={`bloom-stone is-${stone.status} ${stone.bloomPhase}`}
              type="button"
              aria-label={`${stone.status} status stone`}
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
          <span>score</span>
          <strong>{score}</strong>
          <span>wave {wave}</span>
        </footer>
      </section>
    </main>
  )
}

export default BloomPage
