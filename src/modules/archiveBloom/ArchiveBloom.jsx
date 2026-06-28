import { useEffect, useState } from 'react'
import { openDetachedWindow } from '../../core/detachedWindow'
import { applyMove, chooseProcedureMove, createInitialGame } from './archiveBloomLogic'

function ArchiveBloom({ isDetached }) {
  const [game, setGame] = useState(createInitialGame)

  useEffect(() => {
    if (game.turn !== 'procedure' || game.status !== 'running') {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setGame((currentGame) => {
        const move = chooseProcedureMove(currentGame)
        return applyMove(currentGame, move, 'procedure')
      })
    }, 650)

    return () => window.clearTimeout(timeoutId)
  }, [game.turn, game.status])

  function handleIntentMove(index) {
    setGame((currentGame) => applyMove(currentGame, index, 'intent'))
  }

  return (
    <main className={isDetached ? 'status-shell detached' : 'status-shell'}>
      {!isDetached && (
        <nav className="top-nav" aria-label="Dashboard navigation">
          <a href="/">Dashboard</a>
          <button type="button" onClick={() => openDetachedWindow('archive-bloom')}>
            Detach
          </button>
        </nav>
      )}

      <section className="utility-window archive-window">
        <div className="window-header">
          <div className="window-dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>K0rp_ware / Archive Bloom</p>
        </div>

        <div className="utility-body">
          <p className="system-label">Single-player filing conflict</p>
          <h1>Archive Bloom</h1>
          <p className="status-description">
            Place Intent. Procedure answers. Any cluster of three connected cells is archived for one point.
          </p>

          <div className="archive-scoreboard">
            <div>
              <span>Intent</span>
              <strong>{game.intentScore}</strong>
            </div>
            <div>
              <span>Procedure</span>
              <strong>{game.procedureScore}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{getStatusLabel(game)}</strong>
            </div>
          </div>

          <div className="archive-board" aria-label="Archive Bloom board">
            {game.board.map((cell, index) => (
              <button
                className={cell ? `archive-cell ${cell}` : 'archive-cell'}
                disabled={Boolean(cell) || game.turn !== 'intent' || game.status !== 'running'}
                key={index}
                type="button"
                onClick={() => handleIntentMove(index)}
              >
                <span>{cell === 'intent' ? 'I' : cell === 'procedure' ? 'P' : ''}</span>
              </button>
            ))}
          </div>

          <div className="audit-grid archive-panels">
            <article className="audit-panel">
              <h2>Procedure log</h2>
              <ol className="evidence-list">
                {game.log.map((entry, index) => (
                  <li key={`${entry}-${index}`}>
                    <span>{entry}</span>
                  </li>
                ))}
              </ol>
            </article>
            <article className="audit-panel">
              <h2>Controls</h2>
              <p>First side to 5 archived clusters resolves the procedure.</p>
              <button type="button" onClick={() => setGame(createInitialGame())}>Reset procedure</button>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}

function getStatusLabel(game) {
  if (game.status === 'intent-won') return 'Intent resolved'
  if (game.status === 'procedure-won') return 'Procedure resolved'
  if (game.turn === 'procedure') return 'Procedure thinking'
  return 'Awaiting Intent'
}

export default ArchiveBloom
