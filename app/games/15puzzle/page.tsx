'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Desktop }   from '../../../lib/components/Desktop';
import { Window }    from '../../../lib/components/Window';
import { Button }    from '../../../lib/components/Button';
import { MenuBar }   from '../../../lib/components/MenuBar';
import { StatusBar } from '../../../lib/components/StatusBar';

// Tiles: 0 = empty space, 1–15 = numbered tiles
// Solved state: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0]

function isSolvable(tiles: number[]): boolean {
  // Count inversions (ignoring empty tile)
  const nums = tiles.filter(t => t !== 0);
  let inversions = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > nums[j]) inversions++;
    }
  }
  // For 4x4 grid:
  // Empty tile row from bottom (1-indexed)
  const emptyIdx = tiles.indexOf(0);
  const emptyRowFromBottom = 4 - Math.floor(emptyIdx / 4);
  // Solvable if (inversions + emptyRowFromBottom) is even
  return (inversions + emptyRowFromBottom) % 2 === 0;
}

function createShuffledBoard(): number[] {
  const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
  // Fisher-Yates shuffle
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  // Ensure not already solved
  const solved = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
  if (tiles.every((v, i) => v === solved[i])) {
    // Swap first two tiles to make it unsolved (and keep solvable)
    [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
  }
  // Fix solvability: if not solvable, swap tiles at positions 0 and 1
  if (!isSolvable(tiles)) {
    // Find two non-empty tiles to swap (avoid empty tile)
    const idx0 = tiles.indexOf(1);
    const idx1 = tiles.indexOf(2);
    [tiles[idx0], tiles[idx1]] = [tiles[idx1], tiles[idx0]];
  }
  return tiles;
}

function checkWin(tiles: number[]): boolean {
  const solved = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
  return tiles.every((v, i) => v === solved[i]);
}

export default function FifteenPuzzlePage() {
  const router = useRouter();
  const [tiles, setTiles] = useState<number[]>(() => createShuffledBoard());
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const resetGame = useCallback(() => {
    setTiles(createShuffledBoard());
    setMoves(0);
    setWon(false);
  }, []);

  const tryMove = useCallback((tileIdx: number) => {
    if (won) return;
    const emptyIdx = tiles.indexOf(0);
    const tileRow = Math.floor(tileIdx / 4);
    const tileCol = tileIdx % 4;
    const emptyRow = Math.floor(emptyIdx / 4);
    const emptyCol = emptyIdx % 4;

    // Tile must be adjacent (same row/col, distance 1)
    const adjacent =
      (tileRow === emptyRow && Math.abs(tileCol - emptyCol) === 1) ||
      (tileCol === emptyCol && Math.abs(tileRow - emptyRow) === 1);

    if (!adjacent) return;

    const newTiles = [...tiles];
    newTiles[emptyIdx] = newTiles[tileIdx];
    newTiles[tileIdx] = 0;
    const newMoves = moves + 1;
    setTiles(newTiles);
    setMoves(newMoves);
    if (checkWin(newTiles)) {
      setWon(true);
    }
  }, [tiles, moves, won]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (won) return;
      const emptyIdx = tiles.indexOf(0);
      const emptyRow = Math.floor(emptyIdx / 4);
      const emptyCol = emptyIdx % 4;

      // Arrow key moves the empty space in that direction (tile slides opposite)
      let targetRow = emptyRow;
      let targetCol = emptyCol;

      switch (e.key) {
        case 'ArrowUp':    targetRow = emptyRow + 1; break; // tile above empty moves up → tile is below empty
        case 'ArrowDown':  targetRow = emptyRow - 1; break;
        case 'ArrowLeft':  targetCol = emptyCol + 1; break;
        case 'ArrowRight': targetCol = emptyCol - 1; break;
        default: return;
      }

      e.preventDefault();
      if (targetRow < 0 || targetRow >= 4 || targetCol < 0 || targetCol >= 4) return;
      const tileIdx = targetRow * 4 + targetCol;
      tryMove(tileIdx);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tiles, won, tryMove]);

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

      <Desktop wallpaper="grid" style={{ flex: 1 }}>
        <Window
          title="15パズル"
          x={100}
          y={30}
          width={360}
          height={420}
          onClose={() => router.push('/')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {/* Move counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--pc98-white)', fontSize: 14 }}>
                手数: <span style={{ color: 'var(--pc98-yellow)' }}>{moves}</span>
              </span>
              <Button onClick={resetGame}>
                リセット
              </Button>
            </div>

            {/* Board */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 72px)',
                gridTemplateRows: 'repeat(4, 72px)',
                gap: 3,
                padding: 6,
                backgroundColor: 'var(--pc98-dark-gray)',
                border: '3px solid',
                borderColor: 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)',
              }}
            >
              {tiles.map((tile, idx) => {
                const isEmpty = tile === 0;
                return (
                  <button
                    key={idx}
                    onClick={() => tryMove(idx)}
                    disabled={isEmpty || won}
                    style={{
                      width: 72,
                      height: 72,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      fontWeight: 'bold',
                      fontFamily: 'var(--pc98-font)',
                      cursor: isEmpty || won ? 'default' : 'pointer',
                      userSelect: 'none',
                      backgroundColor: isEmpty
                        ? 'var(--pc98-black)'
                        : 'var(--pc98-light-gray)',
                      color: isEmpty ? 'transparent' : 'var(--pc98-black)',
                      border: isEmpty
                        ? '2px inset var(--pc98-dark-gray)'
                        : '3px solid',
                      borderColor: isEmpty
                        ? undefined
                        : 'var(--pc98-white) var(--pc98-dark-gray) var(--pc98-dark-gray) var(--pc98-white)',
                      outline: 'none',
                      padding: 0,
                      boxSizing: 'border-box',
                      transition: 'none',
                    }}
                  >
                    {isEmpty ? '' : tile}
                  </button>
                );
              })}
            </div>

            {/* Win message */}
            {won && (
              <div
                style={{
                  color: 'var(--pc98-yellow)',
                  fontSize: 16,
                  fontFamily: 'var(--pc98-font)',
                  textAlign: 'center',
                  padding: '8px 16px',
                  border: '2px solid var(--pc98-yellow)',
                  backgroundColor: 'var(--pc98-dark-blue)',
                }}
              >
                クリア！ {moves}手で完成！
              </div>
            )}
          </div>
        </Window>
      </Desktop>

      <StatusBar
        items={[
          { text: '15パズル', flex: 2 },
          { text: won ? `${moves}手でクリア！` : `手数: ${moves}`, flex: 2 },
          { text: 'クリックまたは矢印キーで操作', flex: 2, align: 'right' },
        ]}
      />
    </div>
  );
}
