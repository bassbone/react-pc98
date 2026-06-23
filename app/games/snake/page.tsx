'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MenuBar } from '../../../lib/components/MenuBar';
import { StatusBar } from '../../../lib/components/StatusBar';
import { Desktop } from '../../../lib/components/Desktop';
import { Button } from '../../../lib/components/Button';
import { Window } from '../../../lib/components/Window';

const COLS = 25;
const ROWS = 20;
const CELL = 20;

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Point = { x: number; y: number };

function pointEq(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function randomApple(snake: Point[]): Point {
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some((s) => pointEq(s, p)));
  return p;
}

function oppositeDir(d: Dir): Dir {
  if (d === 'UP') return 'DOWN';
  if (d === 'DOWN') return 'UP';
  if (d === 'LEFT') return 'RIGHT';
  return 'LEFT';
}

function nextHead(head: Point, dir: Dir): Point {
  switch (dir) {
    case 'UP':    return { x: head.x, y: head.y - 1 };
    case 'DOWN':  return { x: head.x, y: head.y + 1 };
    case 'LEFT':  return { x: head.x - 1, y: head.y };
    case 'RIGHT': return { x: head.x + 1, y: head.y };
  }
}

interface GameState {
  snake: Point[];
  dir: Dir;
  pendingDir: Dir;
  apple: Point;
  score: number;
  applesEaten: number;
  gameOver: boolean;
  paused: boolean;
}

function createInitialState(): GameState {
  const cx = Math.floor(COLS / 2);
  const cy = Math.floor(ROWS / 2);
  const snake: Point[] = [
    { x: cx,     y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy },
  ];
  return {
    snake,
    dir: 'RIGHT',
    pendingDir: 'RIGHT',
    apple: randomApple(snake),
    score: 0,
    applesEaten: 0,
    gameOver: false,
    paused: false,
  };
}

export default function SnakePage() {
  const router = useRouter();
  const [game, setGame] = useState<GameState>(createInitialState);
  const gameRef = useRef(game);
  gameRef.current = game;

  const speedMs = useCallback((applesEaten: number): number => {
    return Math.max(80, 150 - Math.floor(applesEaten / 5) * 10);
  }, []);

  const tick = useCallback(() => {
    setGame((prev) => {
      if (prev.gameOver || prev.paused) return prev;

      const dir = prev.pendingDir;
      const head = prev.snake[0];
      const newHead = nextHead(head, dir);

      // Wall collision
      if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
        return { ...prev, dir, gameOver: true };
      }

      // Self collision (skip tail since it will move away)
      const bodyWithoutTail = prev.snake.slice(0, prev.snake.length - 1);
      if (bodyWithoutTail.some((s) => pointEq(s, newHead))) {
        return { ...prev, dir, gameOver: true };
      }

      const ateApple = pointEq(newHead, prev.apple);
      let newSnake: Point[];
      if (ateApple) {
        newSnake = [newHead, ...prev.snake];
      } else {
        newSnake = [newHead, ...prev.snake.slice(0, prev.snake.length - 1)];
      }

      const newApplesEaten = ateApple ? prev.applesEaten + 1 : prev.applesEaten;
      const newScore = ateApple ? prev.score + 10 : prev.score;
      const newApple = ateApple ? randomApple(newSnake) : prev.apple;

      return {
        ...prev,
        snake: newSnake,
        dir,
        apple: newApple,
        score: newScore,
        applesEaten: newApplesEaten,
        gameOver: false,
      };
    });
  }, []);

  // Game loop — restart when speed changes or game resets
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (game.gameOver || game.paused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    const ms = speedMs(game.applesEaten);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, ms);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // Re-run when speed tier changes (every 5 apples) or pause/gameover changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, game.paused, game.gameOver, Math.floor(game.applesEaten / 5)]);

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

      let newDir: Dir | null = null;
      switch (e.key) {
        case 'ArrowUp':    case 'w': case 'W': newDir = 'UP';    break;
        case 'ArrowDown':  case 's': case 'S': newDir = 'DOWN';  break;
        case 'ArrowLeft':  case 'a': case 'A': newDir = 'LEFT';  break;
        case 'ArrowRight': case 'd': case 'D': newDir = 'RIGHT'; break;
      }

      if (newDir && newDir !== oppositeDir(state.dir)) {
        e.preventDefault();
        setGame((prev) => ({ ...prev, pendingDir: newDir! }));
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleRestart = () => {
    setGame(createInitialState());
  };

  // Build cell lookup for rendering
  const snakeSet = new Map<string, 'head' | 'body'>();
  game.snake.forEach((s, i) => {
    snakeSet.set(`${s.x},${s.y}`, i === 0 ? 'head' : 'body');
  });
  const appleKey = `${game.apple.x},${game.apple.y}`;

  const currentSpeed = speedMs(game.applesEaten);
  const level = Math.floor(game.applesEaten / 5) + 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'var(--pc98-font)' }}>
      <MenuBar
        menus={[
          {
            label: 'ゲーム(G)',
            items: [
              { label: '新規ゲーム', onClick: handleRestart },
              { separator: true },
              { label: '終了', onClick: () => router.push('/') },
            ],
          },
        ]}
      />

      <Desktop wallpaper="dots" style={{ flex: 1 }}>
        <Window
          title="SNAKE — PC-98"
          x={30}
          y={10}
          width={580}
          height={510}
          onClose={() => router.push('/')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Info bar above board */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                fontFamily: 'var(--pc98-font)',
                fontSize: 13,
                color: 'var(--pc98-white)',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span>
                スコア:{' '}
                <span style={{ color: 'var(--pc98-yellow)' }}>{game.score}</span>
              </span>
              <span>
                リンゴ:{' '}
                <span style={{ color: 'var(--pc98-red)' }}>{game.applesEaten}</span>
              </span>
              <span>
                レベル:{' '}
                <span style={{ color: 'var(--pc98-cyan)' }}>{level}</span>
              </span>
              <span style={{ color: 'var(--pc98-dark-gray)', fontSize: 11 }}>
                速度: {currentSpeed}ms
              </span>
              <span style={{ marginLeft: 'auto', color: 'var(--pc98-light-gray)', fontSize: 11 }}>
                矢印/WASD: 移動 | P: ポーズ
              </span>
            </div>

            {/* Board */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
                  gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
                  border: '2px solid var(--pc98-light-gray)',
                  backgroundColor: 'var(--pc98-black)',
                  width: COLS * CELL,
                  height: ROWS * CELL,
                }}
              >
                {Array.from({ length: ROWS }, (_, r) =>
                  Array.from({ length: COLS }, (_, c) => {
                    const key = `${c},${r}`;
                    const cellType = snakeSet.get(key);
                    const isApple = key === appleKey;

                    let bg = 'var(--pc98-black)';
                    let borderColor = `rgba(85,85,85,0.2)`;
                    let boxShadow: string | undefined;

                    if (cellType === 'head') {
                      bg = 'var(--pc98-green)';
                      borderColor = 'rgba(255,255,255,0.4)';
                      boxShadow = 'inset 2px 2px 0 rgba(255,255,255,0.4), inset -2px -2px 0 rgba(0,0,0,0.4)';
                    } else if (cellType === 'body') {
                      bg = 'var(--pc98-dark-green)';
                      borderColor = 'rgba(255,255,255,0.2)';
                      boxShadow = 'inset 1px 1px 0 rgba(255,255,255,0.2), inset -1px -1px 0 rgba(0,0,0,0.3)';
                    } else if (isApple) {
                      bg = 'var(--pc98-red)';
                      borderColor = 'rgba(255,255,255,0.3)';
                      boxShadow = 'inset 2px 2px 0 rgba(255,200,200,0.4), inset -2px -2px 0 rgba(100,0,0,0.4)';
                    }

                    return (
                      <div
                        key={key}
                        style={{
                          width: CELL,
                          height: CELL,
                          backgroundColor: bg,
                          border: `1px solid ${borderColor}`,
                          boxSizing: 'border-box',
                          boxShadow,
                        }}
                      />
                    );
                  })
                )}
              </div>

              {/* Game Over overlay */}
              {game.gameOver && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.82)',
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
                      fontSize: 28,
                      fontFamily: 'var(--pc98-font)',
                      letterSpacing: 4,
                    }}
                  >
                    GAME OVER
                  </div>
                  <div style={{ color: 'var(--pc98-yellow)', fontFamily: 'var(--pc98-font)', fontSize: 16 }}>
                    スコア: {game.score}
                  </div>
                  <div style={{ color: 'var(--pc98-light-gray)', fontFamily: 'var(--pc98-font)', fontSize: 13 }}>
                    リンゴ: {game.applesEaten}個
                  </div>
                  <Button variant="primary" onClick={handleRestart}>
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
                      fontSize: 24,
                      fontFamily: 'var(--pc98-font)',
                      letterSpacing: 4,
                    }}
                  >
                    PAUSE
                  </div>
                </div>
              )}
            </div>
          </div>
        </Window>
      </Desktop>

      <StatusBar
        items={[
          { text: 'SNAKE', flex: 1 },
          { text: `スコア: ${game.score}`, flex: 1, align: 'center' },
          { text: `レベル: ${level}  リンゴ: ${game.applesEaten}`, flex: 1, align: 'right' },
        ]}
      />
    </div>
  );
}
