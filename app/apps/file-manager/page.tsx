'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Desktop } from '../../../lib/components/Desktop';
import { Window } from '../../../lib/components/Window';
import { MenuBar } from '../../../lib/components/MenuBar';
import { StatusBar } from '../../../lib/components/StatusBar';

interface FileEntry {
  name: string;
  size: number;
  date: string;
  type: 'file';
}

interface FolderEntry {
  name: string;
  type: 'folder';
  children: FileSystemEntry;
}

type FileSystemEntry = {
  [key: string]: FileEntry | FolderEntry;
};

const FILE_SYSTEM: FileSystemEntry = {
  GAMES: {
    name: 'GAMES',
    type: 'folder',
    children: {
      'XEVIOUS.EXE': { name: 'XEVIOUS.EXE', size: 48640,  date: '1988-03-15', type: 'file' },
      'TETRIS.EXE':  { name: 'TETRIS.EXE',  size: 32768,  date: '1990-06-01', type: 'file' },
      'DRAGON.EXE':  { name: 'DRAGON.EXE',  size: 124928, date: '1992-11-20', type: 'file' },
    },
  },
  DOCS: {
    name: 'DOCS',
    type: 'folder',
    children: {
      'README.TXT': { name: 'README.TXT', size: 2048,  date: '1993-01-10', type: 'file' },
      'MANUAL.TXT': { name: 'MANUAL.TXT', size: 45056, date: '1993-01-10', type: 'file' },
    },
  },
  SYSTEM: {
    name: 'SYSTEM',
    type: 'folder',
    children: {
      'CONFIG.SYS':   { name: 'CONFIG.SYS',   size: 512,   date: '1993-04-01', type: 'file' },
      'AUTOEXEC.BAT': { name: 'AUTOEXEC.BAT', size: 256,   date: '1993-04-01', type: 'file' },
      'IO.SYS':       { name: 'IO.SYS',       size: 32256, date: '1991-08-15', type: 'file' },
    },
  },
  BIN: {
    name: 'BIN',
    type: 'folder',
    children: {
      'COMMAND.COM': { name: 'COMMAND.COM', size: 47845, date: '1991-08-15', type: 'file' },
      'FORMAT.EXE':  { name: 'FORMAT.EXE',  size: 22528, date: '1991-08-15', type: 'file' },
      'CHKDSK.EXE':  { name: 'CHKDSK.EXE', size: 16384, date: '1991-08-15', type: 'file' },
    },
  },
};

function formatSize(bytes: number): string {
  return bytes.toLocaleString('en-US') + ' bytes';
}

export default function FileManagerPage() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const currentFolder = selectedFolder
    ? (FILE_SYSTEM[selectedFolder] as FolderEntry)
    : null;

  const currentContents = currentFolder ? currentFolder.children : null;

  const fileCount = currentContents
    ? Object.values(currentContents).filter((e) => e.type === 'file').length
    : 0;

  const selectedEntry = selectedItem && currentContents
    ? currentContents[selectedItem]
    : null;

  const windowTitle = selectedFolder
    ? `ファイルマネージャー — C:\\${selectedFolder}`
    : 'ファイルマネージャー — C:\\';

  const statusText = selectedEntry
    ? selectedEntry.type === 'file'
      ? `${selectedEntry.name}  ${formatSize((selectedEntry as FileEntry).size)}  ${(selectedEntry as FileEntry).date}`
      : `[${(selectedEntry as FolderEntry).name}]`
    : selectedFolder
    ? `${fileCount} 件のファイル`
    : `${Object.keys(FILE_SYSTEM).length} 個のフォルダー`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'var(--pc98-font)' }}>
      <MenuBar
        menus={[
          {
            label: 'ファイル(F)',
            items: [
              { label: '← ランチャーへ戻る', onClick: () => { window.location.href = '/'; } },
              { separator: true },
              { label: '終了', onClick: () => { window.location.href = '/'; } },
            ],
          },
          {
            label: '表示(V)',
            items: [
              { label: '更新', onClick: () => { setSelectedFolder(null); setSelectedItem(null); } },
            ],
          },
        ]}
      />

      <Desktop wallpaper="dots" style={{ flex: 1 }}>
        <Window title={windowTitle} x={20} y={10} width={680} height={440} onClose={() => { window.location.href = '/'; }}>
          <div style={{ display: 'flex', height: '100%', gap: 0 }}>

            {/* 左ペイン: フォルダーツリー */}
            <div style={{
              width: 180,
              borderRight: '2px solid',
              borderColor: 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)',
              overflowY: 'auto',
              flexShrink: 0,
              paddingRight: 4,
            }}>
              <div style={{ color: 'var(--pc98-yellow)', marginBottom: 6, padding: '2px 4px' }}>
                C:\
              </div>

              {/* ルートエントリ */}
              <div
                onClick={() => { setSelectedFolder(null); setSelectedItem(null); }}
                style={{
                  padding: '2px 4px 2px 12px',
                  cursor: 'pointer',
                  color: selectedFolder === null ? 'var(--pc98-black)' : 'var(--pc98-white)',
                  backgroundColor: selectedFolder === null ? 'var(--pc98-cyan)' : 'transparent',
                  userSelect: 'none',
                }}
              >
                [C:\]
              </div>

              {Object.entries(FILE_SYSTEM).map(([key, entry]) => (
                <div
                  key={key}
                  onClick={() => { setSelectedFolder(key); setSelectedItem(null); }}
                  style={{
                    padding: '2px 4px 2px 24px',
                    cursor: 'pointer',
                    color: selectedFolder === key ? 'var(--pc98-black)' : 'var(--pc98-white)',
                    backgroundColor: selectedFolder === key ? 'var(--pc98-cyan)' : 'transparent',
                    userSelect: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedFolder !== key) {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--pc98-dark-gray)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedFolder !== key) {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  [{entry.name}]
                </div>
              ))}
            </div>

            {/* 右ペイン: ファイル一覧 */}
            <div style={{ flex: 1, overflowY: 'auto', paddingLeft: 8 }}>
              {/* ヘッダー */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 100px',
                color: 'var(--pc98-cyan)',
                borderBottom: '1px solid var(--pc98-dark-gray)',
                padding: '2px 4px',
                marginBottom: 4,
                fontSize: 12,
                userSelect: 'none',
              }}>
                <span>名前</span>
                <span style={{ textAlign: 'right' }}>サイズ</span>
                <span style={{ textAlign: 'right' }}>更新日</span>
              </div>

              {!currentContents && (
                <div style={{ color: 'var(--pc98-light-gray)', padding: '4px', fontSize: 12 }}>
                  左のツリーからフォルダーを選択してください
                </div>
              )}

              {currentContents && Object.entries(currentContents).map(([key, entry]) => {
                const isSelected = selectedItem === key;
                const isFile = entry.type === 'file';
                const file = isFile ? (entry as FileEntry) : null;

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedItem(key)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 120px 100px',
                      padding: '2px 4px',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: isSelected ? 'var(--pc98-black)' : (isFile ? 'var(--pc98-white)' : 'var(--pc98-yellow)'),
                      backgroundColor: isSelected ? 'var(--pc98-cyan)' : 'transparent',
                      userSelect: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--pc98-dark-gray)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span>{isFile ? entry.name : `[${entry.name}]`}</span>
                    <span style={{ textAlign: 'right' }}>
                      {file ? file.size.toLocaleString('en-US') : ''}
                    </span>
                    <span style={{ textAlign: 'right', fontSize: 11 }}>
                      {file ? file.date : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Window>
      </Desktop>

      <StatusBar
        items={[
          { text: 'ファイルマネージャー', flex: 1 },
          { text: statusText, flex: 3 },
          { text: selectedFolder ? `C:\\${selectedFolder}` : 'C:\\', flex: 2, align: 'right' },
        ]}
      />
    </div>
  );
}
