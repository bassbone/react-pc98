'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Desktop }   from '../../../lib/components/Desktop';
import { Window }    from '../../../lib/components/Window';
import { Button }    from '../../../lib/components/Button';
import { TextInput } from '../../../lib/components/TextInput';
import { MenuBar }   from '../../../lib/components/MenuBar';
import { StatusBar } from '../../../lib/components/StatusBar';

const MAX_ATTEMPTS = 10;

interface GuessResult {
  guess: string;
  bulls: number;
  cows: number;
}

function generateSecret(): string {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  // First digit must not be 0
  const firstIdx = Math.floor(Math.random() * 9) + 1;
  const result = [digits[firstIdx]];
  digits.splice(firstIdx, 1);
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * digits.length);
    result.push(digits[idx]);
    digits.splice(idx, 1);
  }
  return result.join('');
}

function evaluate(secret: string, guess: string): { bulls: number; cows: number } {
  let bulls = 0;
  let cows = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      bulls++;
    } else if (secret.includes(guess[i])) {
      cows++;
    }
  }
  return { bulls, cows };
}

function validateGuess(input: string): string | null {
  if (!/^\d{4}$/.test(input)) return '4桁の数字を入力してください';
  if (new Set(input).size !== 4) return '重複しない数字を入力してください';
  return null;
}

export default function BullsAndCowsPage() {
  const router = useRouter();
  const [secret, setSecret] = useState(() => generateSecret());
  const [history, setHistory] = useState<GuessResult[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  const resetGame = useCallback(() => {
    setSecret(generateSecret());
    setHistory([]);
    setInput('');
    setError('');
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = useCallback(() => {
    if (gameOver) return;
    const trimmed = input.trim();
    const validationError = validateGuess(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');

    const { bulls, cows } = evaluate(secret, trimmed);
    const newHistory = [...history, { guess: trimmed, bulls, cows }];
    setHistory(newHistory);
    setInput('');

    if (bulls === 4) {
      setWon(true);
      setGameOver(true);
    } else if (newHistory.length >= MAX_ATTEMPTS) {
      setGameOver(true);
    }
  }, [input, secret, history, gameOver]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  }, [handleSubmit]);

  const attempts = history.length;

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

      <Desktop wallpaper="scanlines" style={{ flex: 1 }}>
        <Window
          title="数字当て (Bulls & Cows)"
          x={60}
          y={20}
          width={480}
          height={460}
          onClose={() => router.push('/')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 8 }}>
            {/* Instructions */}
            <div
              style={{
                color: 'var(--pc98-cyan)',
                fontSize: 13,
                fontFamily: 'var(--pc98-font)',
                borderBottom: '1px solid var(--pc98-dark-gray)',
                paddingBottom: 6,
              }}
            >
              4桁の数字（重複なし）を当ててください。
              <span style={{ color: 'var(--pc98-dark-gray)', marginLeft: 8 }}>
                残り {MAX_ATTEMPTS - attempts} 回
              </span>
            </div>

            {/* History */}
            <div
              ref={historyRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                backgroundColor: 'var(--pc98-black)',
                border: '2px solid',
                borderColor: 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)',
                padding: 8,
                fontFamily: 'var(--pc98-font)',
                fontSize: 14,
              }}
            >
              {history.length === 0 && (
                <div style={{ color: 'var(--pc98-dark-gray)' }}>
                  まだ推測がありません...
                </div>
              )}
              {history.map((h, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <span style={{ color: 'var(--pc98-dark-gray)' }}>{i + 1}回目: </span>
                  <span style={{ color: 'var(--pc98-yellow)' }}>{h.guess}</span>
                  <span style={{ color: 'var(--pc98-white)' }}> → </span>
                  <span style={{ color: h.bulls > 0 ? 'var(--pc98-cyan)' : 'var(--pc98-white)' }}>
                    {h.bulls} bull{h.bulls !== 1 ? 's' : ''}
                  </span>
                  <span style={{ color: 'var(--pc98-white)' }}>, </span>
                  <span style={{ color: h.cows > 0 ? 'var(--pc98-green)' : 'var(--pc98-white)' }}>
                    {h.cows} cow{h.cows !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}

              {gameOver && won && (
                <div style={{ marginTop: 8, color: 'var(--pc98-yellow)', fontWeight: 'bold' }}>
                  正解！ {attempts}回で当てました！
                </div>
              )}
              {gameOver && !won && (
                <div style={{ marginTop: 8, color: 'var(--pc98-red)', fontWeight: 'bold' }}>
                  残念！答えは {secret} でした
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ color: 'var(--pc98-red)', fontSize: 13, fontFamily: 'var(--pc98-font)' }}>
                {error}
              </div>
            )}

            {/* Input row */}
            {!gameOver ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <TextInput
                    placeholder="例: 1234"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    maxLength={4}
                    disabled={gameOver}
                    autoFocus
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={gameOver}
                >
                  送信
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant="primary" onClick={resetGame}>
                  新しいゲーム
                </Button>
              </div>
            )}
          </div>
        </Window>
      </Desktop>

      <StatusBar
        items={[
          { text: '数字当て (Bulls & Cows)', flex: 2 },
          { text: gameOver ? (won ? `${attempts}回でクリア！` : 'ゲームオーバー') : `${attempts} / ${MAX_ATTEMPTS} 回`, flex: 2 },
          { text: gameOver && !won ? `答え: ${secret}` : '', flex: 1, align: 'right' },
        ]}
      />
    </div>
  );
}
