'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Desktop }   from '../../../lib/components/Desktop';
import { Window }    from '../../../lib/components/Window';
import { MenuBar }   from '../../../lib/components/MenuBar';
import { StatusBar } from '../../../lib/components/StatusBar';

const ROWS = 9;
const COLS = 9;
const MINES = 10;

type CellState = 'unrevealed' | 'revealed' | 'flagged' | 'question';

interface Cell {
  mine: boolean;
  adjacent: number;
  state: CellState;
}

type Board = Cell[][];
type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      adjacent: 0,
      state: 'unrevealed' as CellState,
    }))
  );
}

function placeMines(board: Board, safeRow: number, safeCol: number): Board {
  const newBoard: Board = board.map(row => row.map(cell => ({ ...cell })));
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!newBoard[r][c].mine && !(r === safeRow && c === safeCol)) {
      newBoard[r][c].mine = true;
      placed++;
    }
  }
  // Calculate adjacency counts
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (newBoard[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc].mine) {
            count++;
          }
        }
      }
      newBoard[r][c].adjacent = count;
    }
  }
  return newBoard;
}

function floodReveal(board: Board, row: number, col: number): Board {
  const newBoard: Board = board.map(r => r.map(c => ({ ...c })));
  const stack: [number, number][] = [[row, col]];
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
    const cell = newBoard[r][c];
    if (cell.state === 'revealed' || cell.state === 'flagged') continue;
    if (cell.mine) continue;
    cell.state = 'revealed';
    if (cell.adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          stack.push([r + dr, c + dc]);
        }
      }
    }
  }
  return newBoard;
}

function checkWin(board: Board): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (!cell.mine && cell.state !== 'revealed') return false;
    }
  }
  return true;
}

function revealAllMines(board: Board): Board {
  return board.map(row =>
    row.map(cell => ({
      ...cell,
      state: cell.mine ? 'revealed' : cell.state,
    }))
  );
}

const NUMBER_COLORS: Record<number, string> = {
  1: 'var(--pc98-blue)',
  2: 'var(--pc98-dark-green)',
  3: 'var(--pc98-red)',
  4: 'var(--pc98-dark-blue)',
  5: 'var(--pc98-dark-red)',
  6: 'var(--pc98-dark-cyan)',
  7: 'var(--pc98-black)',
  8: 'var(--pc98-dark-gray)',
};

export default function MinesweeperPage() {
  const router = useRouter();
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [status, setStatus] = useState<GameStatus>('idle');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flagCount = board.flat().filter(c => c.state === 'flagged').length;
  const mineCounter = MINES - flagCount;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const resetGame = useCallback(() => {
    stopTimer();
    setBoard(createEmptyBoard());
    setStatus('idle');
    setTimer(0);
  }, [stopTimer]);

  const handleLeftClick = useCallback((row: number, col: number) => {
    if (status === 'won' || status === 'lost') return;
    const cell = board[row][col];
    if (cell.state === 'flagged' || cell.state === 'question') return;
    if (cell.state === 'revealed') return;

    let workingBoard = board;
    if (status === 'idle') {
      workingBoard = placeMines(board, row, col);
      setStatus('playing');
      startTimer();
    }

    if (workingBoard[row][col].mine) {
      const lost = revealAllMines(workingBoard);
      setBoard(lost);
      setStatus('lost');
      stopTimer();
      return;
    }

    const revealed = floodReveal(workingBoard, row, col);
    if (checkWin(revealed)) {
      setBoard(revealed);
      setStatus('won');
      stopTimer();
    } else {
      setBoard(revealed);
    }
  }, [board, status, startTimer, stopTimer]);

  const handleRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (status === 'won' || status === 'lost') return;
    const cell = board[row][col];
    if (cell.state === 'revealed') return;

    const newBoard: Board = board.map(r => r.map(c => ({ ...c })));
    const cycle: Record<CellState, CellState> = {
      unrevealed: 'flagged',
      flagged: 'question',
      question: 'unrevealed',
      revealed: 'revealed',
    };
    newBoard[row][col].state = cycle[cell.state];
    setBoard(newBoard);
  }, [board, status]);

  const smiley = status === 'won' ? '😎' : status === 'lost' ? '😵' : '😊';

  const timerDisplay = String(Math.min(timer, 999)).padStart(3, '0');
  const mineDisplay = String(Math.max(mineCounter, -99)).padStart(3, ' ');

  const displayStyle: React.CSSProperties = {
    backgroundColor: 'var(--pc98-black)',
    color: 'var(--pc98-red)',
    fontFamily: 'var(--pc98-font)',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    padding: '2px 6px',
    border: '2px solid',
    borderColor: 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)',
    minWidth: 48,
    textAlign: 'center',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'var(--pc98-font)' }}>
      <MenuBar
        menus={[
          {
            label: 'ゲーム(G)',
            items: [
              { label: '新しいゲーム', onClick: resetGame },
              { separator: true },
              { label: '終了', onClick: () => router.push('/') },
            ],
          },
        ]}
      />

      <Desktop wallpaper="dots" style={{ flex: 1 }}>
        <Window
          title="マインスイーパー"
          x={80}
          y={30}
          width={340}
          height={400}
          onClose={() => router.push('/')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '6px 8px',
                backgroundColor: 'var(--pc98-light-gray)',
                border: '2px solid',
                borderColor: 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)',
              }}
            >
              <div style={displayStyle}>{mineDisplay}</div>
              <button
                onClick={resetGame}
                style={{
                  fontSize: 20,
                  background: 'var(--pc98-light-gray)',
                  border: '2px solid',
                  borderColor: 'var(--pc98-white) var(--pc98-dark-gray) var(--pc98-dark-gray) var(--pc98-white)',
                  cursor: 'pointer',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                {smiley}
              </button>
              <div style={displayStyle}>{timerDisplay}</div>
            </div>

            {/* Board */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${COLS}, 32px)`,
                gap: 1,
                border: '2px solid',
                borderColor: 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)',
                padding: 2,
                backgroundColor: 'var(--pc98-dark-gray)',
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const isUnrevealed = cell.state === 'unrevealed' || cell.state === 'flagged' || cell.state === 'question';
                  let content: React.ReactNode = null;
                  let textColor = 'var(--pc98-white)';

                  if (cell.state === 'flagged') {
                    content = '🚩';
                  } else if (cell.state === 'question') {
                    content = '?';
                    textColor = 'var(--pc98-yellow)';
                  } else if (cell.state === 'revealed') {
                    if (cell.mine) {
                      content = '💣';
                    } else if (cell.adjacent > 0) {
                      content = String(cell.adjacent);
                      textColor = NUMBER_COLORS[cell.adjacent] || 'var(--pc98-white)';
                    }
                  }

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleLeftClick(r, c)}
                      onContextMenu={(e) => handleRightClick(e, r, c)}
                      style={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: cell.state === 'revealed' && cell.adjacent > 0 ? 14 : 16,
                        fontWeight: 'bold',
                        fontFamily: 'var(--pc98-font)',
                        color: textColor,
                        cursor: isUnrevealed ? 'pointer' : 'default',
                        userSelect: 'none',
                        backgroundColor: cell.state === 'revealed'
                          ? 'var(--pc98-dark-gray)'
                          : 'var(--pc98-light-gray)',
                        border: isUnrevealed
                          ? '2px solid'
                          : '1px solid var(--pc98-dark-gray)',
                        borderColor: isUnrevealed
                          ? 'var(--pc98-white) var(--pc98-dark-gray) var(--pc98-dark-gray) var(--pc98-white)'
                          : undefined,
                        boxSizing: 'border-box',
                      }}
                    >
                      {content}
                    </div>
                  );
                })
              )}
            </div>

            {(status === 'won' || status === 'lost') && (
              <div
                style={{
                  color: status === 'won' ? 'var(--pc98-yellow)' : 'var(--pc98-red)',
                  fontSize: 14,
                  fontFamily: 'var(--pc98-font)',
                  textAlign: 'center',
                }}
              >
                {status === 'won' ? `クリア！ ${timer}秒で達成！` : 'ゲームオーバー！'}
              </div>
            )}
          </div>
        </Window>
      </Desktop>

      <StatusBar
        items={[
          { text: 'マインスイーパー', flex: 2 },
          { text: `地雷: ${MINES}  残り: ${mineCounter}`, flex: 2 },
          { text: `${timerDisplay}秒`, flex: 1, align: 'right' },
        ]}
      />
    </div>
  );
}
