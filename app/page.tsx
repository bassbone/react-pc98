'use client';

import React, { useState } from 'react';
import { Desktop }     from '../lib/components/Desktop';
import { Window }      from '../lib/components/Window';
import { Button }      from '../lib/components/Button';
import { TextInput }   from '../lib/components/TextInput';
import { MenuBar }     from '../lib/components/MenuBar';
import { Dialog }      from '../lib/components/Dialog';
import { ProgressBar } from '../lib/components/ProgressBar';
import { Terminal }    from '../lib/components/Terminal';
import { Select }      from '../lib/components/Select';
import { StatusBar }   from '../lib/components/StatusBar';
import { Checkbox }    from '../lib/components/Checkbox';
import type { TerminalLine } from '../lib/components/Terminal';

export default function Page() {
  const [dialog, setDialog]     = useState<'none' | 'info' | 'confirm'>('none');
  const [progress, setProgress] = useState(42);
  const [termLines, setTermLines] = useState<TerminalLine[]>([
    { text: 'PC-9801 BASIC V3.3' },
    { text: 'Copyright (C) NEC Corporation 1984', color: 'var(--pc98-light-gray)' },
    { text: '' },
    { text: 'Ok', color: 'var(--pc98-cyan)' },
  ]);
  const [termInput, setTermInput] = useState('');
  const [inputVal, setInputVal]   = useState('');
  const [checked, setChecked]     = useState(false);
  const [selectVal, setSelectVal] = useState('option1');
  const [wallpaper, setWallpaper] = useState<'dots' | 'grid' | 'solid' | 'scanlines'>('dots');
  const now = new Date().toLocaleTimeString('ja-JP');

  const handleTermSubmit = (v: string) => {
    const trimmed = v.trim();
    setTermLines((prev) => [
      ...prev,
      { text: `A>${trimmed}` },
      trimmed
        ? { text: `'${trimmed}' は認識されていません。`, color: 'var(--pc98-red)' }
        : { text: 'Ok', color: 'var(--pc98-cyan)' },
    ]);
    setTermInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <MenuBar
        menus={[
          {
            label: 'ファイル(F)',
            items: [
              { label: '新規作成', shortcut: 'Ctrl+N', onClick: () => alert('新規作成') },
              { label: '開く...',  shortcut: 'Ctrl+O', onClick: () => alert('開く') },
              { label: '保存',     shortcut: 'Ctrl+S', onClick: () => alert('保存') },
              { separator: true },
              { label: '終了', onClick: () => alert('終了') },
            ],
          },
          {
            label: '表示(V)',
            items: [
              { label: 'ドット',   onClick: () => setWallpaper('dots') },
              { label: 'グリッド', onClick: () => setWallpaper('grid') },
              { label: 'スキャン', onClick: () => setWallpaper('scanlines') },
              { label: 'ソリッド', onClick: () => setWallpaper('solid') },
            ],
          },
          {
            label: 'ヘルプ(H)',
            items: [
              { label: 'react-pc98 について', onClick: () => setDialog('info') },
            ],
          },
        ]}
      />

      <Desktop wallpaper={wallpaper} style={{ flex: 1 }}>
        {/* コンポーネントデモウィンドウ */}
        <Window title="コンポーネント一覧" x={20} y={10} width={360} height={400} onClose={() => {}}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section>
              <div style={{ color: 'var(--pc98-cyan)', marginBottom: 6 }}>■ ボタン</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button onClick={() => setDialog('confirm')}>通常</Button>
                <Button variant="primary">プライマリ</Button>
                <Button variant="danger">危険</Button>
                <Button disabled>無効</Button>
              </div>
            </section>

            <section>
              <div style={{ color: 'var(--pc98-cyan)', marginBottom: 6 }}>■ テキスト入力</div>
              <TextInput
                label="ユーザー名"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="入力してください..."
              />
            </section>

            <section>
              <Select
                label="選択肢"
                value={selectVal}
                onChange={setSelectVal}
                options={[
                  { value: 'option1', label: 'オプション 1' },
                  { value: 'option2', label: 'オプション 2' },
                  { value: 'option3', label: 'オプション 3' },
                ]}
              />
            </section>

            <section>
              <Checkbox
                label="自動保存を有効にする"
                checked={checked}
                onChange={setChecked}
              />
            </section>

            <section>
              <div style={{ color: 'var(--pc98-cyan)', marginBottom: 6 }}>■ プログレスバー</div>
              <ProgressBar value={progress} label="ロード中..." />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Button onClick={() => setProgress((p) => Math.max(0, p - 10))}>-10</Button>
                <Button onClick={() => setProgress((p) => Math.min(100, p + 10))}>+10</Button>
              </div>
            </section>
          </div>
        </Window>

        {/* ターミナルウィンドウ */}
        <Window title="MS-DOS プロンプト" x={400} y={10} width={380} height={260} onClose={() => {}}>
          <Terminal
            lines={termLines}
            prompt="A>"
            inputValue={termInput}
            onInputChange={setTermInput}
            onSubmit={handleTermSubmit}
            height="100%"
          />
        </Window>

        {/* カラーパレット */}
        <Window title="PC-98 カラーパレット" x={400} y={290} width={380} height={140} onClose={() => {}}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {([
              ['#000000','黒'],['#0000AA','暗青'],['#00AA00','暗緑'],['#00AAAA','暗シアン'],
              ['#AA0000','暗赤'],['#AA00AA','暗マゼンタ'],['#AA5500','茶'],['#AAAAAA','明灰'],
              ['#555555','暗灰'],['#5555FF','青'],['#55FF55','緑'],['#55FFFF','シアン'],
              ['#FF5555','赤'],['#FF55FF','マゼンタ'],['#FFFF55','黄'],['#FFFFFF','白'],
            ] as [string, string][]).map(([color, name]) => (
              <div
                key={color}
                title={`${name} ${color}`}
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: color,
                  border: '1px solid var(--pc98-dark-gray)',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </Window>
      </Desktop>

      <StatusBar
        items={[
          { text: 'react-pc98 デモ', flex: 2 },
          { text: `入力: ${inputVal || '(なし)'}`, flex: 2 },
          { text: `進捗: ${progress}%`, flex: 1, align: 'center' },
          { text: now, flex: 1, align: 'right' },
        ]}
      />

      {dialog === 'info' && (
        <Dialog
          title="react-pc98 について"
          icon="info"
          message={
            <div>
              <div>react-pc98 v0.1.0</div>
              <div style={{ color: 'var(--pc98-dark-gray)', marginTop: 8 }}>
                PC-98風UIコンポーネントライブラリ<br />
                Next.js / React 対応
              </div>
            </div>
          }
          buttons={[{ label: 'OK', onClick: () => setDialog('none'), variant: 'primary' }]}
          onClose={() => setDialog('none')}
        />
      )}
      {dialog === 'confirm' && (
        <Dialog
          title="確認"
          icon="question"
          message="この操作を実行しますか？"
          buttons={[
            { label: 'はい',   onClick: () => { alert('実行しました'); setDialog('none'); }, variant: 'primary' },
            { label: 'いいえ', onClick: () => setDialog('none') },
          ]}
          onClose={() => setDialog('none')}
        />
      )}
    </div>
  );
}
