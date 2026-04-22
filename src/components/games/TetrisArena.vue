<template>
  <div class="tetris-shell">
    <div class="tetris-hero">
      <div class="tetris-copy">
        <span class="tetris-kicker">{{ $i18n.t('games.tetris') }}</span>
        <h2 class="tetris-title">{{ $i18n.t('games.tetris') }}</h2>
        <p class="tetris-description">{{ $i18n.t('games.tetrisDescription') }}</p>
        <p class="tetris-source">{{ $i18n.t('games.inspiredBy') }}</p>
      </div>
      <div class="tetris-actions">
        <button type="button" class="button is-primary is-cta tetris-action-button" @click="togglePrimaryAction">
          {{ primaryActionLabel }}
        </button>
        <button type="button" class="button is-light tetris-action-button" @click="restartGame">
          {{ $i18n.t('games.restart') }}
        </button>
      </div>
    </div>

    <div class="tetris-grid">
      <div class="tetris-board-panel">
        <div class="tetris-board-frame">
          <div class="tetris-board" :class="{ 'is-dimmed': gameState !== 'playing' }">
            <div v-for="(row, rowIndex) in renderedBoard" :key="`row-${rowIndex}`" class="tetris-board-row">
              <div
                v-for="(cell, columnIndex) in row"
                :key="`cell-${rowIndex}-${columnIndex}`"
                :class="cellClass(cell)"
              />
            </div>
            <div v-if="gameState !== 'playing'" class="tetris-overlay">
              <span class="tetris-overlay-kicker">{{ $i18n.t('games.status') }}</span>
              <strong class="tetris-overlay-title">{{ statusLabel }}</strong>
              <span class="tetris-overlay-copy">{{ overlayMessage }}</span>
            </div>
          </div>
        </div>

        <div class="tetris-touch-controls">
          <button type="button" class="button is-light tetris-control-button" @click="moveLeft">
            {{ $i18n.t('games.moveLeft') }}
          </button>
          <button type="button" class="button is-light tetris-control-button" @click="rotatePiece">
            {{ $i18n.t('games.rotate') }}
          </button>
          <button type="button" class="button is-light tetris-control-button" @click="moveRight">
            {{ $i18n.t('games.moveRight') }}
          </button>
          <button type="button" class="button is-light tetris-control-button" @click="softDrop">
            {{ $i18n.t('games.softDrop') }}
          </button>
          <button type="button" class="button is-primary is-cta tetris-control-button tetris-control-button-wide" @click="hardDrop">
            {{ $i18n.t('games.hardDrop') }}
          </button>
        </div>
      </div>

      <aside class="tetris-sidebar">
        <div class="tetris-stats-card">
          <div class="tetris-stat">
            <span>{{ $i18n.t('games.best') }}</span>
            <strong>{{ bestScore }}</strong>
          </div>
          <div class="tetris-stat">
            <span>{{ $i18n.t('games.score') }}</span>
            <strong>{{ score }}</strong>
          </div>
          <div class="tetris-stat">
            <span>{{ $i18n.t('games.lines') }}</span>
            <strong>{{ lines }}</strong>
          </div>
          <div class="tetris-stat">
            <span>{{ $i18n.t('games.level') }}</span>
            <strong>{{ level }}</strong>
          </div>
        </div>

        <div class="tetris-preview-card">
          <span class="tetris-panel-kicker">{{ $i18n.t('games.next') }}</span>
          <div class="tetris-preview-grid">
            <div
              v-for="(row, rowIndex) in nextPreviewBoard"
              :key="`preview-row-${rowIndex}`"
              class="tetris-preview-row"
            >
              <div
                v-for="(cell, columnIndex) in row"
                :key="`preview-cell-${rowIndex}-${columnIndex}`"
                :class="previewCellClass(cell)"
              />
            </div>
          </div>
        </div>

        <div class="tetris-controls-card">
          <span class="tetris-panel-kicker">{{ $i18n.t('games.controls') }}</span>
          <p class="tetris-controls-copy">{{ $i18n.t('games.controlsHint') }}</p>
          <p class="tetris-controls-copy">{{ $i18n.t('games.mobileControls') }}</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const PREVIEW_SIZE = 4
const BEST_SCORE_STORAGE_KEY = 'myvergies.games.tetris.bestScore'
const LINE_CLEAR_SCORES = {
  1: 100,
  2: 300,
  3: 500,
  4: 800
}

const TETROMINOES = {
  I: {
    rotations: [
      [[1, 1, 1, 1]],
      [[1], [1], [1], [1]]
    ]
  },
  O: {
    rotations: [
      [[1, 1], [1, 1]]
    ]
  },
  T: {
    rotations: [
      [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
      [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
    ]
  },
  J: {
    rotations: [
      [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
      [[0, 1, 0], [0, 1, 0], [1, 1, 0]]
    ]
  },
  L: {
    rotations: [
      [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
      [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
      [[1, 1, 0], [0, 1, 0], [0, 1, 0]]
    ]
  },
  S: {
    rotations: [
      [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 0, 1]]
    ]
  },
  Z: {
    rotations: [
      [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
      [[0, 0, 1], [0, 1, 1], [0, 1, 0]]
    ]
  }
}

const TETROMINO_KEYS = Object.keys(TETROMINOES)

const createEmptyBoard = () => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null))
const createEmptyPreview = () => Array.from({ length: PREVIEW_SIZE }, () => Array(PREVIEW_SIZE).fill(null))

export default {
  name: 'TetrisArena',
  data () {
    return {
      board: createEmptyBoard(),
      activePiece: null,
      nextPieceKey: null,
      bestScore: 0,
      score: 0,
      lines: 0,
      level: 1,
      gameState: 'ready',
      dropTimer: null
    }
  },
  computed: {
    renderedBoard () {
      const board = this.board.map(row => row.map(type => ({
        type,
        active: false
      })))

      if (!this.activePiece) {
        return board
      }

      const matrix = this.getPieceMatrix(this.activePiece)

      matrix.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
          if (!cell) {
            return
          }

          const boardRow = this.activePiece.row + rowIndex
          const boardColumn = this.activePiece.col + columnIndex

          if (boardRow < 0 || boardRow >= BOARD_HEIGHT || boardColumn < 0 || boardColumn >= BOARD_WIDTH) {
            return
          }

          board[boardRow][boardColumn] = {
            type: this.activePiece.key,
            active: true
          }
        })
      })

      return board
    },

    nextPreviewBoard () {
      const preview = createEmptyPreview()

      if (!this.nextPieceKey) {
        return preview
      }

      const matrix = TETROMINOES[this.nextPieceKey].rotations[0]
      const rowOffset = Math.floor((PREVIEW_SIZE - matrix.length) / 2)
      const columnOffset = Math.floor((PREVIEW_SIZE - matrix[0].length) / 2)

      matrix.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
          if (cell) {
            preview[rowOffset + rowIndex][columnOffset + columnIndex] = this.nextPieceKey
          }
        })
      })

      return preview
    },

    primaryActionLabel () {
      if (this.gameState === 'playing') {
        return this.$i18n.t('games.pause')
      }

      if (this.gameState === 'paused') {
        return this.$i18n.t('games.resume')
      }

      return this.$i18n.t('games.start')
    },

    statusLabel () {
      if (this.gameState === 'playing') {
        return this.$i18n.t('games.playing')
      }

      if (this.gameState === 'paused') {
        return this.$i18n.t('games.paused')
      }

      if (this.gameState === 'gameOver') {
        return this.$i18n.t('games.gameOver')
      }

      return this.$i18n.t('games.ready')
    },

    overlayMessage () {
      if (this.gameState === 'paused') {
        return this.$i18n.t('games.controlsHint')
      }

      if (this.gameState === 'gameOver') {
        return this.$i18n.t('games.tetrisDescription')
      }

      return this.$i18n.t('games.controlsHint')
    },

    dropDelay () {
      return Math.max(120, 760 - (this.level - 1) * 55)
    }
  },
  watch: {
    level () {
      if (this.gameState === 'playing') {
        this.syncDropTimer()
      }
    }
  },
  mounted () {
    this.loadBestScore()
    this.queueNextPiece()
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeDestroy () {
    this.clearDropTimer()
    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    cellClass (cell) {
      return [
        'tetris-cell',
        cell.type ? `is-${cell.type.toLowerCase()}` : 'is-empty',
        cell.active ? 'is-active' : ''
      ]
    },

    previewCellClass (cellType) {
      return [
        'tetris-preview-cell',
        cellType ? `is-${cellType.toLowerCase()}` : 'is-empty'
      ]
    },

    getRandomPieceKey () {
      return TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)]
    },

    queueNextPiece () {
      this.nextPieceKey = this.getRandomPieceKey()
    },

    getPieceMatrix (piece, rotation = piece.rotation) {
      return TETROMINOES[piece.key].rotations[rotation]
    },

    buildPiece (key) {
      const matrix = TETROMINOES[key].rotations[0]

      return {
        key,
        rotation: 0,
        row: -1,
        col: Math.floor((BOARD_WIDTH - matrix[0].length) / 2)
      }
    },

    loadBestScore () {
      try {
        const storedValue = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY)
        this.bestScore = storedValue ? parseInt(storedValue, 10) || 0 : 0
      } catch (_error) {
        this.bestScore = 0
      }
    },

    persistBestScore () {
      try {
        window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(this.bestScore))
      } catch (_error) {
        // Ignore storage errors in restricted environments.
      }
    },

    updateBestScore () {
      if (this.score <= this.bestScore) {
        return
      }

      this.bestScore = this.score
      this.persistBestScore()
    },

    addScore (amount) {
      if (amount <= 0) {
        return
      }

      this.score += amount
      this.updateBestScore()
    },

    resetState () {
      this.board = createEmptyBoard()
      this.activePiece = null
      this.score = 0
      this.lines = 0
      this.level = 1
      this.gameState = 'ready'
      this.clearDropTimer()
      this.queueNextPiece()
    },

    startGame () {
      this.resetState()
      this.gameState = 'playing'
      this.spawnNextPiece()
      this.syncDropTimer()
    },

    restartGame () {
      this.startGame()
    },

    togglePrimaryAction () {
      if (this.gameState === 'playing') {
        this.pauseGame()
        return
      }

      if (this.gameState === 'paused') {
        this.resumeGame()
        return
      }

      this.startGame()
    },

    pauseGame () {
      if (this.gameState !== 'playing') {
        return
      }

      this.gameState = 'paused'
      this.clearDropTimer()
    },

    resumeGame () {
      if (this.gameState !== 'paused') {
        return
      }

      this.gameState = 'playing'
      this.syncDropTimer()
    },

    clearDropTimer () {
      if (this.dropTimer) {
        clearInterval(this.dropTimer)
        this.dropTimer = null
      }
    },

    syncDropTimer () {
      this.clearDropTimer()

      if (this.gameState !== 'playing') {
        return
      }

      this.dropTimer = setInterval(() => {
        this.tick()
      }, this.dropDelay)
    },

    spawnNextPiece () {
      const pieceKey = this.nextPieceKey || this.getRandomPieceKey()
      this.queueNextPiece()

      const piece = this.buildPiece(pieceKey)

      if (!this.canPlace(piece, piece.row, piece.col, piece.rotation)) {
        this.activePiece = null
        this.gameState = 'gameOver'
        this.clearDropTimer()
        this.updateBestScore()
        return
      }

      this.activePiece = piece
    },

    canPlace (piece, targetRow = piece.row, targetCol = piece.col, targetRotation = piece.rotation) {
      const matrix = this.getPieceMatrix(piece, targetRotation)

      for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < matrix[rowIndex].length; columnIndex++) {
          if (!matrix[rowIndex][columnIndex]) {
            continue
          }

          const boardRow = targetRow + rowIndex
          const boardColumn = targetCol + columnIndex

          if (boardColumn < 0 || boardColumn >= BOARD_WIDTH || boardRow >= BOARD_HEIGHT) {
            return false
          }

          if (boardRow >= 0 && this.board[boardRow][boardColumn]) {
            return false
          }
        }
      }

      return true
    },

    movePiece (dx, dy, awardSoftDrop = false) {
      if (!this.activePiece || this.gameState !== 'playing') {
        return false
      }

      const nextRow = this.activePiece.row + dy
      const nextColumn = this.activePiece.col + dx

      if (this.canPlace(this.activePiece, nextRow, nextColumn, this.activePiece.rotation)) {
        this.activePiece = {
          ...this.activePiece,
          row: nextRow,
          col: nextColumn
        }

        if (awardSoftDrop && dy > 0) {
          this.addScore(1)
        }

        return true
      }

      if (dy > 0) {
        this.lockPiece()
      }

      return false
    },

    moveLeft () {
      this.movePiece(-1, 0)
    },

    moveRight () {
      this.movePiece(1, 0)
    },

    softDrop () {
      this.movePiece(0, 1, true)
    },

    hardDrop () {
      if (!this.activePiece || this.gameState !== 'playing') {
        return
      }

      let dropDistance = 0

      while (this.canPlace(this.activePiece, this.activePiece.row + 1, this.activePiece.col, this.activePiece.rotation)) {
        this.activePiece = {
          ...this.activePiece,
          row: this.activePiece.row + 1
        }
        dropDistance++
      }

      this.addScore(dropDistance * 2)
      this.lockPiece()
    },

    rotatePiece () {
      if (!this.activePiece || this.gameState !== 'playing') {
        return
      }

      const totalRotations = TETROMINOES[this.activePiece.key].rotations.length
      const nextRotation = (this.activePiece.rotation + 1) % totalRotations
      const kickOffsets = [0, -1, 1, -2, 2]

      for (const offset of kickOffsets) {
        const targetColumn = this.activePiece.col + offset

        if (this.canPlace(this.activePiece, this.activePiece.row, targetColumn, nextRotation)) {
          this.activePiece = {
            ...this.activePiece,
            rotation: nextRotation,
            col: targetColumn
          }
          return
        }
      }
    },

    lockPiece () {
      if (!this.activePiece) {
        return
      }

      const nextBoard = this.board.map(row => row.slice())
      const matrix = this.getPieceMatrix(this.activePiece)

      matrix.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
          if (!cell) {
            return
          }

          const boardRow = this.activePiece.row + rowIndex
          const boardColumn = this.activePiece.col + columnIndex

          if (boardRow >= 0 && boardRow < BOARD_HEIGHT && boardColumn >= 0 && boardColumn < BOARD_WIDTH) {
            nextBoard[boardRow][boardColumn] = this.activePiece.key
          }
        })
      })

      this.board = nextBoard
      this.activePiece = null

      const clearedLines = this.clearCompletedLines()

      if (clearedLines > 0) {
        this.lines += clearedLines
        this.level = 1 + Math.floor(this.lines / 10)
        this.addScore((LINE_CLEAR_SCORES[clearedLines] || 0) * this.level)
      }

      this.spawnNextPiece()
      this.syncDropTimer()
    },

    clearCompletedLines () {
      const remainingRows = this.board.filter(row => row.some(cell => !cell))
      const clearedLines = BOARD_HEIGHT - remainingRows.length

      if (clearedLines === 0) {
        return 0
      }

      this.board = [
        ...Array.from({ length: clearedLines }, () => Array(BOARD_WIDTH).fill(null)),
        ...remainingRows
      ]

      return clearedLines
    },

    tick () {
      if (this.gameState !== 'playing') {
        return
      }

      this.movePiece(0, 1)
    },

    handleKeydown (event) {
      const target = event.target
      const tagName = target && target.tagName ? target.tagName.toUpperCase() : ''

      if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
        return
      }

      if (event.code === 'KeyP') {
        event.preventDefault()
        this.togglePrimaryAction()
        return
      }

      if (this.gameState !== 'playing') {
        if (event.code === 'Space' || event.code === 'Enter') {
          event.preventDefault()
          this.togglePrimaryAction()
        }

        return
      }

      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault()
          this.moveLeft()
          break
        case 'ArrowRight':
          event.preventDefault()
          this.moveRight()
          break
        case 'ArrowDown':
          event.preventDefault()
          this.softDrop()
          break
        case 'ArrowUp':
        case 'KeyX':
          event.preventDefault()
          this.rotatePiece()
          break
        case 'Space':
          event.preventDefault()
          this.hardDrop()
          break
      }
    }
  }
}
</script>

<style scoped lang="scss">
.tetris-shell {
  position: relative;
  padding: 1.25rem;
  border-radius: 26px;
  border: 1px solid rgba(83, 243, 255, 0.16);
  background:
    radial-gradient(circle at top left, rgba(83, 243, 255, 0.12), transparent 26%),
    radial-gradient(circle at top right, rgba(255, 87, 210, 0.16), transparent 22%),
    linear-gradient(180deg, rgba(8, 12, 28, 0.96), rgba(4, 6, 16, 0.94));
  box-shadow: 0 28px 54px rgba(1, 4, 18, 0.34), 0 0 40px rgba(83, 243, 255, 0.06);
  overflow: hidden;
}

.tetris-shell::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 24%),
    repeating-linear-gradient(90deg, rgba(83, 243, 255, 0.08) 0 1px, transparent 1px 40px);
  opacity: 0.3;
}

.tetris-hero,
.tetris-grid {
  position: relative;
  z-index: 1;
}

.tetris-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.35rem;
}

.tetris-kicker,
.tetris-panel-kicker,
.tetris-overlay-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(83, 243, 255, 0.82);
}

.tetris-kicker::before,
.tetris-panel-kicker::before,
.tetris-overlay-kicker::before {
  content: "";
  width: 14px;
  height: 1px;
  background: currentColor;
  box-shadow: 0 0 12px currentColor;
}

.tetris-title {
  margin: 0.35rem 0 0.5rem;
  font-size: 2.3rem;
  line-height: 1;
  color: var(--rv-text);
  text-transform: uppercase;
  text-shadow: 0 0 20px rgba(83, 243, 255, 0.14), 0 0 28px rgba(255, 87, 210, 0.12);
}

.tetris-description,
.tetris-source,
.tetris-controls-copy {
  margin: 0;
  color: var(--rv-text-soft);
  line-height: 1.7;
}

.tetris-source {
  margin-top: 0.45rem;
  font-size: 0.88rem;
}

.tetris-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tetris-action-button {
  min-width: 10.5rem;
}

.tetris-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) 280px;
  gap: 1rem;
}

.tetris-board-panel,
.tetris-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tetris-board-frame,
.tetris-stats-card,
.tetris-preview-card,
.tetris-controls-card {
  padding: 1rem;
  border-radius: 22px;
  border: 1px solid rgba(83, 243, 255, 0.14);
  background:
    linear-gradient(180deg, rgba(13, 19, 46, 0.88), rgba(7, 11, 28, 0.94));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 18px 34px rgba(1, 4, 18, 0.24);
}

.tetris-board {
  --cell-size: 28px;
  position: relative;
  display: inline-flex;
  flex-direction: column;
  padding: 0.6rem;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(6, 9, 22, 0.96), rgba(3, 4, 12, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 0 0 1px rgba(83, 243, 255, 0.04), 0 0 28px rgba(83, 243, 255, 0.08);
}

.tetris-board::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 18%),
    linear-gradient(0deg, rgba(255, 87, 210, 0.08), transparent 30%);
}

.tetris-board.is-dimmed {
  filter: saturate(0.82);
}

.tetris-board-row,
.tetris-preview-row {
  display: grid;
  grid-template-columns: repeat(10, var(--cell-size));
  gap: 4px;
}

.tetris-preview-row {
  grid-template-columns: repeat(4, 22px);
}

.tetris-cell,
.tetris-preview-cell {
  position: relative;
  width: var(--cell-size);
  height: var(--cell-size);
  border-radius: 8px;
  background: rgba(8, 12, 28, 0.92);
  border: 1px solid rgba(83, 243, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.tetris-preview-cell {
  width: 22px;
  height: 22px;
  border-radius: 7px;
}

.tetris-cell::before,
.tetris-preview-cell::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
}

.tetris-cell.is-empty,
.tetris-preview-cell.is-empty {
  background:
    linear-gradient(180deg, rgba(17, 22, 46, 0.86), rgba(7, 10, 24, 0.96));
}

.tetris-cell.is-i,
.tetris-preview-cell.is-i {
  background: linear-gradient(180deg, #7ef7ff, #0bc4ff);
  box-shadow: 0 0 16px rgba(83, 243, 255, 0.26);
}

.tetris-cell.is-o,
.tetris-preview-cell.is-o {
  background: linear-gradient(180deg, #fff18c, #ffb057);
  box-shadow: 0 0 16px rgba(255, 176, 87, 0.24);
}

.tetris-cell.is-t,
.tetris-preview-cell.is-t {
  background: linear-gradient(180deg, #ff89ef, #a566ff);
  box-shadow: 0 0 16px rgba(165, 102, 255, 0.24);
}

.tetris-cell.is-j,
.tetris-preview-cell.is-j {
  background: linear-gradient(180deg, #8cb9ff, #315dff);
  box-shadow: 0 0 16px rgba(49, 93, 255, 0.24);
}

.tetris-cell.is-l,
.tetris-preview-cell.is-l {
  background: linear-gradient(180deg, #ffc47b, #ff7b43);
  box-shadow: 0 0 16px rgba(255, 123, 67, 0.24);
}

.tetris-cell.is-s,
.tetris-preview-cell.is-s {
  background: linear-gradient(180deg, #8fffaf, #18d36a);
  box-shadow: 0 0 16px rgba(24, 211, 106, 0.24);
}

.tetris-cell.is-z,
.tetris-preview-cell.is-z {
  background: linear-gradient(180deg, #ff8ba7, #ff4769);
  box-shadow: 0 0 16px rgba(255, 71, 105, 0.24);
}

.tetris-cell.is-active::before,
.tetris-preview-cell:not(.is-empty)::before {
  opacity: 1;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.42), transparent 50%);
}

.tetris-cell.is-active {
  animation: tetris-pulse 1.4s ease-in-out infinite;
}

.tetris-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  background: rgba(5, 7, 18, 0.74);
  backdrop-filter: blur(10px);
}

.tetris-overlay-title {
  color: #ffffff;
  font-size: 1.9rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.tetris-overlay-copy {
  max-width: 18rem;
  color: var(--rv-text-soft);
  line-height: 1.7;
}

.tetris-touch-controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.tetris-control-button {
  min-height: 52px;
  font-size: 0.86rem;
}

.tetris-control-button-wide {
  grid-column: span 2;
}

.tetris-stats-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.tetris-stat {
  padding: 0.85rem 0.9rem;
  border-radius: 16px;
  background: rgba(12, 17, 40, 0.88);
  border: 1px solid rgba(83, 243, 255, 0.12);
}

.tetris-stat span {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--rv-text-soft);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tetris-stat strong {
  color: #ffffff;
  font-size: 1.55rem;
  line-height: 1;
}

.tetris-preview-grid {
  margin-top: 0.85rem;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
}

.tetris-controls-card {
  gap: 0.7rem;
}

@keyframes tetris-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.14);
  }

  50% {
    transform: scale(0.98);
    box-shadow: 0 0 22px rgba(255, 255, 255, 0.22);
  }
}

@media (max-width: 1023px) {
  .tetris-hero,
  .tetris-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .tetris-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .tetris-shell {
    padding: 1rem;
  }

  .tetris-board {
    --cell-size: 22px;
    width: 100%;
  }

  .tetris-board-row {
    grid-template-columns: repeat(10, minmax(0, 1fr));
  }

  .tetris-cell {
    width: auto;
    aspect-ratio: 1;
    height: auto;
  }

  .tetris-stats-card {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tetris-touch-controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tetris-control-button-wide {
    grid-column: span 2;
  }
}
</style>
