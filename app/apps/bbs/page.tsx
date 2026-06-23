'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Desktop }   from '../../../lib/components/Desktop';
import { Window }    from '../../../lib/components/Window';
import { Button }    from '../../../lib/components/Button';
import { TextInput } from '../../../lib/components/TextInput';
import { MenuBar }   from '../../../lib/components/MenuBar';
import { StatusBar } from '../../../lib/components/StatusBar';

interface Message {
  id: number;
  user: string;
  text: string;
  timestamp: string;
  color: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, user: 'SYSOP',     text: 'PC-98 BBS へようこそ！',          timestamp: '1993/04/01 09:00', color: 'var(--pc98-yellow)'     },
  { id: 2, user: 'PC-88USER', text: 'こんにちは！',                     timestamp: '1993/04/01 09:01', color: 'var(--pc98-green)'      },
  { id: 3, user: 'SYSOP',     text: '本日のトピック：PC-9801 vs PC-8801', timestamp: '1993/04/01 09:02', color: 'var(--pc98-yellow)'     },
];

const BOT_USERS = [
  { name: 'SYSOP',     color: 'var(--pc98-yellow)'     },
  { name: 'PC-88USER', color: 'var(--pc98-green)'      },
  { name: 'ゲスト',    color: 'var(--pc98-light-gray)' },
];

const BOT_RESPONSES = [
  '了解です！',
  'PC-9801 最高！',
  'VRAM 直接アクセスするの難しいですよね',
  '98BASIC でゲーム作ってます',
  'FM音源最高ですよね',
  'VECTORからダウンロードしました',
];

let nextId = 4;

function nowTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BBSPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput]       = useState('');
  const [online, setOnline]     = useState(3);
  const logEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const postBotReply = useCallback(() => {
    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      const bot = BOT_USERS[Math.floor(Math.random() * BOT_USERS.length)];
      const text = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
      setMessages(prev => [
        ...prev,
        { id: nextId++, user: bot.name, text, timestamp: nowTimestamp(), color: bot.color },
      ]);
    }, delay);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages(prev => [
      ...prev,
      {
        id: nextId++,
        user: 'あなた',
        text: trimmed,
        timestamp: nowTimestamp(),
        color: 'var(--pc98-cyan)',
      },
    ]);
    setInput('');
    postBotReply();
  }, [input, postBotReply]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <MenuBar
        menus={[
          {
            label: 'BBS(B)',
            items: [
              { label: '接続', onClick: () => setOnline(o => o + 1) },
              { separator: true },
              { label: '終了', onClick: () => router.push('/') },
            ],
          },
          {
            label: '表示(V)',
            items: [
              { label: '更新', onClick: () => {} },
            ],
          },
        ]}
      />

      <Desktop wallpaper="scanlines" style={{ flex: 1 }}>
        <Window title="PC-98 BBS ターミナル" x={30} y={20} width={620} height={460} onClose={() => router.push('/')}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 8 }}>
            {/* Header */}
            <div style={{
              fontFamily: 'var(--pc98-font)',
              fontSize: 12,
              color: 'var(--pc98-cyan)',
              borderBottom: '1px solid var(--pc98-dark-gray)',
              paddingBottom: 4,
              flexShrink: 0,
            }}>
              ═══ PC-98 BULLETIN BOARD SYSTEM ═══ オンライン: {online}名
            </div>

            {/* Message log */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              backgroundColor: 'var(--pc98-black)',
              border: '2px solid',
              borderColor: 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)',
              padding: '4px 8px',
              fontFamily: 'var(--pc98-font)',
              fontSize: 13,
            }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ marginBottom: 4, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--pc98-dark-gray)', fontSize: 11 }}>
                    [{msg.timestamp}]
                  </span>
                  {' '}
                  <span style={{ color: msg.color, fontWeight: 'bold' }}>
                    [{msg.user}]
                  </span>
                  {' '}
                  <span style={{ color: 'var(--pc98-white)' }}>
                    {msg.text}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            {/* Input area */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
              <div style={{ flex: 1 }}>
                <TextInput
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="メッセージを入力..."
                />
              </div>
              <Button variant="primary" onClick={handleSend}>送信</Button>
            </div>

            {/* User legend */}
            <div style={{
              display: 'flex',
              gap: 16,
              fontFamily: 'var(--pc98-font)',
              fontSize: 11,
              color: 'var(--pc98-dark-gray)',
              flexShrink: 0,
            }}>
              {[
                { name: 'あなた',    color: 'var(--pc98-cyan)'       },
                { name: 'SYSOP',     color: 'var(--pc98-yellow)'     },
                { name: 'PC-88USER', color: 'var(--pc98-green)'      },
                { name: 'ゲスト',    color: 'var(--pc98-light-gray)' },
              ].map(u => (
                <span key={u.name}>
                  <span style={{ color: u.color }}>■</span> {u.name}
                </span>
              ))}
            </div>
          </div>
        </Window>
      </Desktop>

      <StatusBar
        items={[
          { text: 'PC-98 BBS', flex: 2 },
          { text: `メッセージ数: ${messages.length}`, flex: 2 },
          { text: `オンライン: ${online}名`, flex: 1, align: 'right' },
        ]}
      />
    </div>
  );
}
