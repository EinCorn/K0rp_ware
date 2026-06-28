export const BOARD_SIZE = 4
export const WIN_SCORE = 5
export const EMPTY_BOARD = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () => null)

export function createInitialGame() {
  return {
    board: [...EMPTY_BOARD],
    intentScore: 0,
    procedureScore: 0,
    turn: 'intent',
    status: 'running',
    log: ['Procedure opened. Intent may now be filed.'],
  }
}

export function getNeighbors(index) {
  const row = Math.floor(index / BOARD_SIZE)
  const col = index % BOARD_SIZE
  const neighbors = []

  if (row > 0) neighbors.push(index - BOARD_SIZE)
  if (row < BOARD_SIZE - 1) neighbors.push(index + BOARD_SIZE)
  if (col > 0) neighbors.push(index - 1)
  if (col < BOARD_SIZE - 1) neighbors.push(index + 1)

  return neighbors
}

export function findCluster(board, owner) {
  const visited = new Set()

  for (let index = 0; index < board.length; index += 1) {
    if (board[index] !== owner || visited.has(index)) {
      continue
    }

    const cluster = []
    const queue = [index]
    visited.add(index)

    while (queue.length > 0) {
      const current = queue.shift()
      cluster.push(current)

      getNeighbors(current).forEach((neighbor) => {
        if (board[neighbor] === owner && !visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push(neighbor)
        }
      })
    }

    if (cluster.length >= 3) {
      return cluster.slice(0, 3)
    }
  }

  return null
}

export function clearCells(board, cells) {
  const nextBoard = [...board]
  cells.forEach((index) => {
    nextBoard[index] = null
  })
  return nextBoard
}

export function applyMove(game, index, owner) {
  if (game.status !== 'running' || game.board[index] || game.turn !== owner) {
    return game
  }

  let board = [...game.board]
  board[index] = owner
  const log = [`${labelOwner(owner)} filed into cell ${index + 1}.`, ...game.log].slice(0, 8)
  const cluster = findCluster(board, owner)
  let intentScore = game.intentScore
  let procedureScore = game.procedureScore

  if (cluster) {
    board = clearCells(board, cluster)
    if (owner === 'intent') intentScore += 1
    if (owner === 'procedure') procedureScore += 1
    log.unshift(`${labelOwner(owner)} cluster archived.`)
  }

  if (intentScore >= WIN_SCORE || procedureScore >= WIN_SCORE) {
    return {
      ...game,
      board,
      intentScore,
      procedureScore,
      status: intentScore >= WIN_SCORE ? 'intent-won' : 'procedure-won',
      log: ['Procedure resolved.', ...log].slice(0, 8),
    }
  }

  if (board.every(Boolean)) {
    return {
      ...game,
      board: [...EMPTY_BOARD],
      intentScore,
      procedureScore,
      turn: owner === 'intent' ? 'procedure' : 'intent',
      log: ['Filing Collapse completed. Board cleared.', ...log].slice(0, 8),
    }
  }

  return {
    ...game,
    board,
    intentScore,
    procedureScore,
    turn: owner === 'intent' ? 'procedure' : 'intent',
    log,
  }
}

export function chooseProcedureMove(game) {
  const emptyCells = game.board.map((cell, index) => (cell ? null : index)).filter((index) => index !== null)

  return (
    findUsefulMove(game.board, emptyCells, 'procedure') ??
    findUsefulMove(game.board, emptyCells, 'intent') ??
    findAdjacentMove(game.board, emptyCells, 'procedure') ??
    emptyCells[Math.floor(Math.random() * emptyCells.length)]
  )
}

function findUsefulMove(board, emptyCells, owner) {
  return emptyCells.find((index) => {
    const testBoard = [...board]
    testBoard[index] = owner
    return Boolean(findCluster(testBoard, owner))
  })
}

function findAdjacentMove(board, emptyCells, owner) {
  return emptyCells.find((index) => getNeighbors(index).some((neighbor) => board[neighbor] === owner))
}

function labelOwner(owner) {
  return owner === 'intent' ? 'Intent' : 'Procedure'
}
