import { useState } from 'react'
import './BloomPage.css'

const BOARD_SIZE = 25
const RED_BASE_COUNT = 7

function createBoard(wave = 1) {
  const redCount = Math.min(RED_BASE_COUNT + Math.floor(wave / 2), BOARD_SIZE - 3)
  const redIndexes = new Set()

  while (redIndexes.size < redCount) {
    redIndexes.add(Math.floor(Math.random() * BOARD_SIZE))
  }

  return Array.from({ length: BOARD_SIZE }, (_, index) => ({
    id: `${wave}-${index}`,
    isGreen: !redIndexes.has(index),
  }))
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

      if (!currentStone || currentStone.isGreen) {
        return currentBoard
      }

      const nextBoard = currentBoard.map((stone, stoneIndex) => (
        stoneIndex === index ? { ...stone, isGreen: true, bloomed: true } : stone
      ))
      const cleared = nextBoard.every((stone) => stone.isGreen)

      setScore((currentScore) => currentScore + (cleared ? 10 : 1))

      if (cleared) {
        setIsClearing(true)
        window.setTimeout(() => {
          setWave((currentWave) => {
            const nextWave = currentWave + 1
            setBoard(createBoard(nextWave))
            return nextWave
          })
          setIsClearing(false)
        }, 520)
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
              className={`bloom-stone ${stone.isGreen ? 'is-green' : 'is-red'} ${stone.bloomed ? 'has-bloomed' : ''}`}
              type="button"
              aria-label={stone.isGreen ? 'Green status stone' : 'Red status stone'}
              onClick={() => hitStone(index)}
            />
          ))}
        </div>
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
