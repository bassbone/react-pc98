'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Desktop } from '../lib/components/Desktop';
import { Window } from '../lib/components/Window';
import { MenuBar } from '../lib/components/MenuBar';
import { StatusBar } from '../lib/components/StatusBar';
import { Dialog } from '../lib/components/Dialog';

interface AppEntry {
  label: string;
  path: string;
  icon: string;
}

const APPS: AppEntry[] = [
  { label: 'ファイルマネージャー', path: '/apps/file-manager',  icon: '[DIR]' },
  { label: 'テキストエディタ',     path: '/apps/text-editor',   icon: '[TXT]' },
  { label: '電卓',                 path: '/apps/calculator',    icon: '[CAL]' },
  { label: 'BBS チャット',         path: '/apps/bbs',           icon: '[BBS]' },
  { label: 'システム情報',         path: '/apps/sysinfo',       icon: '[SYS]' },
];

const GAMES: AppEntry[] = [
  { label: 'テトリス',     path: '/games/tetris',         icon: '[TET]' },
  { label: 'マインスweeper', path: '/games/minesweeper',  icon: '[MSW]' },
  { label: 'スネーク',     path: '/games/snake',          icon: '[SNK]' },
  { label: '数字当て',     path: '/games/bulls-and-cows', icon: '[B&C]' },
  { label: '15パズル',     path: '/games/15puzzle',       icon: '[15P]' },
];

export default function Page() {
  const [showAbout, setShowAbout] = useState(false);
  const now = new Date().toLocaleString('ja-JP');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'var(--pc98-font)' }}>
      <MenuBar
        menus={[
          {
            label: 'メニュー(M)',
            items: [
              { label: 'react-pc98 について', onClick: () => setShowAbout(true) },
              { separator: true },
              { label: '終了', onClick: () => {} },
            ],
          },
        ]}
      />

      <Desktop wallpaper="dots" style={{ flex: 1 }}>
        <Window title="react-pc98 ランチャー" x={60} y={30} width={560} height={440} onClose={() => {}}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>

            {/* アプリセクション */}
            <div>
              <div style={{
                color: 'var(--pc98-cyan)',
                marginBottom: 8,
                borderBottom: '1px solid var(--pc98-dark-gray)',
                paddingBottom: 4,
              }}>
                ■ アプリ
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {APPS.map((app) => (
                  <AppIcon key={app.path} {...app} />
                ))}
              </div>
            </div>

            {/* ゲームセクション */}
            <div>
              <div style={{
                color: 'var(--pc98-yellow)',
                marginBottom: 8,
                borderBottom: '1px solid var(--pc98-dark-gray)',
                paddingBottom: 4,
              }}>
                ■ ゲーム
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {GAMES.map((game) => (
                  <AppIcon key={game.path} {...game} />
                ))}
              </div>
            </div>

            {/* フッター */}
            <div style={{
              marginTop: 'auto',
              padding: '8px 0 0',
              borderTop: '1px solid var(--pc98-dark-gray)',
              color: 'var(--pc98-light-gray)',
              fontSize: 12,
              textAlign: 'center',
            }}>
              react-pc98 v0.1.0 — PC-98風UIコンポーネントライブラリ
            </div>
          </div>
        </Window>
      </Desktop>

      <StatusBar
        items={[
          { text: 'react-pc98 ランチャー', flex: 2 },
          { text: 'アプリを選択してください', flex: 2 },
          { text: now, flex: 2, align: 'right' },
        ]}
      />

      {showAbout && (
        <Dialog
          title="react-pc98 について"
          icon="info"
          message={
            <div>
              <div>react-pc98 v0.1.0</div>
              <div style={{ color: 'var(--pc98-light-gray)', marginTop: 8 }}>
                PC-98風UIコンポーネントライブラリ<br />
                Next.js / React 対応
              </div>
            </div>
          }
          buttons={[{ label: 'OK', onClick: () => setShowAbout(false), variant: 'primary' }]}
          onClose={() => setShowAbout(false)}
        />
      )}
    </div>
  );
}

function AppIcon({ label, path, icon }: AppEntry) {
  return (
    <Link
      href={path}
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          padding: '10px 4px',
          border: '1px solid var(--pc98-dark-gray)',
          backgroundColor: 'var(--pc98-black)',
          color: 'var(--pc98-white)',
          cursor: 'pointer',
          fontFamily: 'var(--pc98-font)',
          fontSize: 12,
          textAlign: 'center',
          transition: 'none',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--pc98-blue)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--pc98-white)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--pc98-black)';
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--pc98-dark-gray)';
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--pc98-cyan)', letterSpacing: -1 }}>{icon}</span>
        <span style={{ lineHeight: 1.3, wordBreak: 'break-all' }}>{label}</span>
      </div>
    </Link>
  );
}
