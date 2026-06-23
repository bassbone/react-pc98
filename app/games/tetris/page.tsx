'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MenuBar } from '../../../lib/components/MenuBar';
import { StatusBar } from '../../../lib/components/StatusBar';
import { Desktop } from '../../../lib/components/Desktop';
import { Button } from '../../../lib/components/Button';
import { Window } from '../../../lib/components/Window';

const BOARD_COLS = 10;
const BOARD_ROWS = 20;
const CELL_SIZE = 24;

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

const TETROMINOES: Record<TetrominoType, number[][]> = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};

const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: 'var(--pc98-cyan)',
  O: 'var(--pc98-yellow)',
  T: 'var(--pc98-magenta)',
  S: 'var(--pc98-green)',
  Z: 'var(--pc98-red)',
  J: 'var(--pc98-blue)',
  L: 'var(--pc98-brown)',
};

const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

type Board = (string | null)[][];

interface Piece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
}

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(null));
}

function randomPiece(): Piece {
  const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  const shape = TETROMINOES[type];
  return {
    type,
    shape,
    x: Math.floor((BOARD_COLS - shape[0].length) / 2),
    y: 0,
  };
}

function rotateCW(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const result: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = shape[r][c];
    }
  }
  return result;
}

function isValid(board: Board, shape: number[][], x: number, y: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = x + c;
      const ny = y + r;
      if (nx < 0 || nx >= BOARD_COLS || ny >= BOARD_ROWS) return false;
      if (ny >= 0 && board[ny][nx] !== null) return false;
    }
  }
  return true;
}

function placePiece(board: Board, piece: Piece): Board {
  const newBoard = board.map((row) => [...row]);
  const color = TETROMINO_COLORS[piece.type];
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const ny = piece.y + r;
      const nx = piece.x + c;
      if (ny >= 0 && ny < BOARD_ROWS && nx >= 0 && nx < BOARD_COLS) {
        newBoard[ny][nx] = color;
      }
    }
  }
  return newBoard;
}

function clearLines(board: Board): { board: Board; linesCleared: number } {
  const newBoard = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = BOARD_ROWS - newBoard.length;
  const emptyRows = Array.from({ length: linesCleared }, () => Array(BOARD_COLS).fill(null));
  return { board: [...emptyRows, ...newBoard], linesCleared };
}

function calcScore(lines: number, level: number): number {
  const base = [0, 100, 300, 500, 800];
  return (base[lines] ?? 0) * level;
}

function ghostY(board: Board, piece: Piece): number {
  let y = piece.y;
  while (isValid(board, piece.shape, piece.x, y + 1)) {
    y++;
  }
  return y;
}

interface GameState {
  board: Board;
  current: Piece;
  next: Piece;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  paused: boolean;
}

function initGame(): GameState {
  return {
    board: createEmptyBoard(),
    current: randomPiece(),
    next: randomPiece(),
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    paused: false,
  };
}

export default function TetrisPage() {
  const router = useRouter();
  const [game, setGame] = useState<GameState>(initGame);
  const gameRef = useRef(game);
  gameRef.current = game;

  const dropInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const softDropRef = useRef(false);

  const lockAndAdvance = useCallback((state: GameState): GameState => {
    const placed = placePiece(state.board, state.current);
    const { board: cleared, linesCleared } = clearLines(placed);
    const newLines = state.lines + linesCleared;
    const newLevel = Math.floor(newLines / 10) + 1;
    const newScore = state.score + calcScore(linesCleared, state.level);
    const next = state.next;
    const nextNext = randomPiece();
    const newCurrent = { ...next };
    if (!isValid(cleared, newCurrent.shape, newCurrent.x, newCurrent.y)) {
      return { ...state, board: cleared, score: newScore, lines: newLines, level: newLevel, gameOver: true };
    }
    return {
      board: cleared,
      current: newCurrent,
      next: nextNext,
      score: newScore,
      level: newLevel,
      lines: newLines,
      gameOver: false,
      paused: state.paused,
    };
  }, []);

  const tick = useCallback(() => {
    setGame((prev) => {
      if (prev.gameOver || prev.paused) return prev;
      const { current, board } = prev;
      if (isValid(board, current.shape, current.x, current.y + 1)) {
        return { ...prev, current: { ...current, y: current.y + 1 } };
      }
      return lockAndAdvance(prev);
    });
  }, [lockAndAdvance]);

  // Game loop
  useEffect(() => {
    const interval = softDropRef.current
      ? Math.max(50, 800 - (gameRef.current.level - 1) * 50) / 4
      : Math.max(100, 800 - (gameRef.current.level - 1) * 50);

    dropInterval.current = setInterval(tick, interval);
    return () => {
      if (dropInterval.current) clearInterval(dropInterval.current);
    };
  }, [tick, game.level, game.paused, game.gameOver]);

  // Keyboard handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const state = gameRef.current;
      if (state.gameOver) return;

      if (e.key === 'p' || e.key === 'P') {
        setGame((prev) => ({ ...prev, paused: !prev.paused }));
        return;
      }
      if (state.paused) return;

      setGame((prev) => {
        const { current, board } = prev;
        switch (e.key) {
          case 'ArrowLeft': {
            e.preventDefault();
            if (isValid(board, current.shape, current.x - 1, current.y)) {
              return { ...prev, current: { ...current, x: current.x - 1 } };
            }
            return prev;
          }
          case 'ArrowRight': {
            e.preventDefault();
            if (isValid(board, current.shape, current.x + 1, current.y)) {
              return { ...prev, current: { ...current, x: current.x + 1 } };
            }
            return prev;
          }
          case 'ArrowDown': {
            e.preventDefault();
            if (isValid(board, current.shape, current.x, current.y + 1)) {
              return { ...prev, current: { ...current, y: current.y + 1 } };
            }
            return lockAndAdvance(prev);
          }
          case 'ArrowUp':
          case 'z':
          case 'Z': {
            e.preventDefault();
            const rotated = rotateCW(current.shape);
            // Wall kick attempts
            const kicks = [0, -1, 1, -2, 2];
            for (const kick of kicks) {
              if (isValid(board, rotated, current.x + kick, current.y)) {
                return { ...prev, current: { ...current, shape: rotated, x: current.x + kick } };
              }
            }
            return prev;
          }
          case ' ': {
            e.preventDefault();
            const dy = ghostY(board, current);
            const dropped = { ...current, y: dy };
            return lockAndAdvance({ ...prev, current: dropped });
          }
          default:
            return prev;
        }
      });
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lockAndAdvance]);

  const renderBoard = () => {
    const { board, current } = game;
    const ghost = game.gameOver ? null : { ...current, y: ghostY(board, current) };

    // Build display grid
    const display: (string | null)[][] = board.map((row) => [...row]);

    // Draw ghost
    if (ghost && !game.gameOver) {
      for (let r = 0; r < ghost.shape.length; r++) {
        for (let c = 0; c < ghost.shape[r].length; c++) {
          if (!ghost.shape[r][c]) continue;
          const ny = ghost.y + r;
          const nx = ghost.x + c;
          if (ny >= 0 && ny < BOARD_ROWS && nx >= 0 && nx < BOARD_COLS && display[ny][nx] === null) {
            display[ny][nx] = 'ghost';
          }
        }
      }
    }

    // Draw current piece
    if (!game.gameOver) {
      const color = TETROMINO_COLORS[current.type];
      for (let r = 0; r < current.shape.length; r++) {
        for (let c = 0; c < current.shape[r].length; c++) {
          if (!current.shape[r][c]) continue;
          const ny = current.y + r;
          const nx = current.x + c;
          if (ny >= 0 && ny < BOARD_ROWS && nx >= 0 && nx < BOARD_COLS) {
            display[ny][nx] = color;
          }
        }
      }
    }

    return display;
  };

  const renderNextPiece = () => {
    const { next } = game;
    const color = TETROMINO_COLORS[next.type];
    const previewSize = 4;
    const grid: (string | null)[][] = Array.from({ length: previewSize }, () =>
      Array(previewSize).fill(null)
    );
    const offsetR = Math.floor((previewSize - next.shape.length) / 2);
    const offsetC = Math.floor((previewSize - next.shape[0].length) / 2);
    for (let r = 0; r < next.shape.length; r++) {
      for (let c = 0; c < next.shape[r].length; c++) {
        if (next.shape[r][c]) {
          grid[r + offsetR][c + offsetC] = color;
        }
      }
    }
    return grid;
  };

  const display = renderBoard();
  const nextGrid = renderNextPiece();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'var(--pc98-font)' }}>
      <MenuBar
        menus={[
          {
            label: 'ゲーム(G)',
            items: [
              { label: '新規ゲーム', onClick: () => setGame(initGame()) },
              { separator: true },
              { label: '終了', onClick: () => router.push('/') },
            ],
          },
        ]}
      />

      <Desktop wallpaper="dots" style={{ flex: 1 }}>
        <Window
          title="TETRIS — PC-98"
          x={40}
          y={10}
          width={420}
          height={560}
          onClose={() => router.push('/')}
        >
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {/* Board */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${BOARD_COLS}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(${BOARD_ROWS}, ${CELL_SIZE}px)`,
                  border: '2px solid var(--pc98-light-gray)',
                  backgroundColor: 'var(--pc98-black)',
                }}
              >
                {display.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor:
                          cell === 'ghost'
                            ? 'transparent'
                            : cell ?? 'var(--pc98-black)',
                        border:
                          cell === 'ghost'
                            ? '1px solid var(--pc98-dark-gray)'
                            : cell
                            ? '1px solid rgba(255,255,255,0.3)'
                            : '1px solid rgba(85,85,85,0.3)',
                        boxSizing: 'border-box',
                        boxShadow: cell && cell !== 'ghost'
                          ? 'inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.4)'
                          : undefined,
                      }}
                    />
                  ))
                )}
              </div>

              {/* Game Over overlay */}
              {game.gameOver && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                    border: '2px solid var(--pc98-light-gray)',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--pc98-red)',
                      fontSize: 24,
                      fontFamily: 'var(--pc98-font)',
                      letterSpacing: 4,
                    }}
                  >
                    GAME OVER
                  </div>
                  <div style={{ color: 'var(--pc98-yellow)', fontFamily: 'var(--pc98-font)' }}>
                    スコア: {game.score}
                  </div>
                  <Button variant="primary" onClick={() => setGame(initGame())}>
                    Play Again
                  </Button>
                </div>
              )}

              {/* Pause overlay */}
              {game.paused && !game.gameOver && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--pc98-light-gray)',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--pc98-cyan)',
                      fontSize: 20,
                      fontFamily: 'var(--pc98-font)',
                      letterSpacing: 4,
                    }}
                  >
                    PAUSE
                  </div>
                </div>
              )}
            </div>

            {/* Side panel */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                fontFamily: 'var(--pc98-font)',
                color: 'var(--pc98-white)',
                minWidth: 100,
              }}
            >
              {/* Next piece */}
              <div>
                <div style={{ color: 'var(--pc98-cyan)', marginBottom: 4, fontSize: 13 }}>NEXT</div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 18px)',
                    gridTemplateRows: 'repeat(4, 18px)',
                    border: '1px solid var(--pc98-dark-gray)',
                    backgroundColor: 'var(--pc98-black)',
                    padding: 4,
                  }}
                >
                  {nextGrid.map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`n${r}-${c}`}
                        style={{
                          width: 18,
                          height: 18,
                          backgroundColor: cell ?? 'var(--pc98-black)',
                          border: cell ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                          boxSizing: 'border-box',
                          boxShadow: cell
                            ? 'inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(0,0,0,0.4)'
                            : undefined,
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Stats */}
              <div
                style={{
                  border: '1px solid var(--pc98-dark-gray)',
                  padding: '8px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <div>
                  <div style={{ color: 'var(--pc98-cyan)' }}>SCORE</div>
                  <div style={{ color: 'var(--pc98-yellow)' }}>{game.score}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--pc98-cyan)' }}>LEVEL</div>
                  <div style={{ color: 'var(--pc98-yellow)' }}>{game.level}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--pc98-cyan)' }}>LINES</div>
                  <div style={{ color: 'var(--pc98-yellow)' }}>{game.lines}</div>
                </div>
              </div>

              {/* Controls */}
              <div
                style={{
                  border: '1px solid var(--pc98-dark-gray)',
                  padding: '8px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  fontSize: 11,
                  color: 'var(--pc98-light-gray)',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ color: 'var(--pc98-cyan)', marginBottom: 4 }}>KEYS</div>
                <div>← → 移動</div>
                <div>↑ / Z 回転</div>
                <div>↓ 落下</div>
                <div>SPACE 即落</div>
                <div>P ポーズ</div>
              </div>

              <Button onClick={() => setGame(initGame())} variant="primary">
                NEW
              </Button>
            </div>
          </div>
        </Window>
      </Desktop>

      <StatusBar
        items={[
          { text: 'TETRIS', flex: 1 },
          { text: `スコア: ${game.score}`, flex: 1, align: 'center' },
          { text: `レベル: ${game.level}  ライン: ${game.lines}`, flex: 1, align: 'right' },
        ]}
      />
    </div>
  );
}
