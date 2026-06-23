'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Desktop } from '../../../lib/components/Desktop';
import { Window } from '../../../lib/components/Window';
import { MenuBar } from '../../../lib/components/MenuBar';
import { StatusBar } from '../../../lib/components/StatusBar';
import { Dialog } from '../../../lib/components/Dialog';

const STORAGE_KEY = 'pc98-editor-content';
const DEFAULT_FILENAME = '無題.TXT';

type DialogType = 'none' | 'new-confirm' | 'save-notice';

export default function TextEditorPage() {
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [filename, setFilename] = useState(DEFAULT_FILENAME);
  const [dialog, setDialog] = useState<DialogType>('none');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setContent(stored);
      setSavedContent(stored);
      setFilename('保存済み.TXT');
    }
  }, []);

  const isDirty = content !== savedContent;

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, content);
    setSavedContent(content);
    setFilename((prev) => prev === DEFAULT_FILENAME ? '無題.TXT' : prev.replace(/^\*/, ''));
    setDialog('save-notice');
  };

  const handleLoad = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setContent(stored);
      setSavedContent(stored);
      setFilename('保存済み.TXT');
    }
  };

  const handleNew = () => {
    if (isDirty) {
      setDialog('new-confirm');
    } else {
      clearEditor();
    }
  };

  const clearEditor = () => {
    setContent('');
    setSavedContent('');
    setFilename(DEFAULT_FILENAME);
  };

  const handleSelectAll = () => {
    textareaRef.current?.select();
  };

  const handleCopy = () => {
    const selected = textareaRef.current;
    if (selected) {
      const text = selected.value.substring(selected.selectionStart, selected.selectionEnd);
      if (text) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      setContent(newContent);
    } catch {
      // clipboard access denied
    }
  };

  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
  const charCount = content.length;

  const titleDisplay = `テキストエディタ — ${isDirty ? '*' : ''}${filename}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'var(--pc98-font)' }}>
      <MenuBar
        menus={[
          {
            label: 'ファイル(F)',
            items: [
              { label: '新規(N)', shortcut: 'Ctrl+N', onClick: handleNew },
              { label: '開く(O)...', shortcut: 'Ctrl+O', onClick: handleLoad },
              { label: '保存(S)', shortcut: 'Ctrl+S', onClick: handleSave },
              { separator: true },
              { label: '← ランチャーへ戻る', onClick: () => { window.location.href = '/'; } },
              { separator: true },
              { label: '終了', onClick: () => { window.location.href = '/'; } },
            ],
          },
          {
            label: '編集(E)',
            items: [
              { label: '全選択(A)', shortcut: 'Ctrl+A', onClick: handleSelectAll },
              { label: 'コピー(C)', shortcut: 'Ctrl+C', onClick: handleCopy },
              { label: '貼り付け(V)', shortcut: 'Ctrl+V', onClick: handlePaste },
            ],
          },
          {
            label: 'ヘルプ(H)',
            items: [
              { label: 'テキストエディタ について', onClick: () => {} },
            ],
          },
        ]}
      />

      <Desktop wallpaper="dots" style={{ flex: 1 }}>
        <Window
          title={titleDisplay}
          x={20}
          y={10}
          width={680}
          height={430}
          onClose={() => { window.location.href = '/'; }}
        >
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--pc98-black)',
              color: 'var(--pc98-white)',
              fontFamily: 'var(--pc98-font)',
              fontSize: 14,
              lineHeight: 1.6,
              border: '1px solid var(--pc98-dark-gray)',
              resize: 'none',
              outline: 'none',
              padding: 8,
              boxSizing: 'border-box',
              caretColor: 'var(--pc98-white)',
            }}
            placeholder="ここに入力してください..."
            spellCheck={false}
          />
        </Window>
      </Desktop>

      <StatusBar
        items={[
          { text: 'テキストエディタ', flex: 1 },
          { text: `${charCount} 文字`, flex: 1, align: 'center' },
          { text: `${wordCount} 単語`, flex: 1, align: 'center' },
          { text: isDirty ? '未保存' : '保存済み', flex: 1, align: 'center' },
          { text: filename, flex: 2, align: 'right' },
        ]}
      />

      {dialog === 'new-confirm' && (
        <Dialog
          title="確認"
          icon="question"
          message="変更が保存されていません。破棄して新規作成しますか？"
          buttons={[
            {
              label: '保存して新規',
              variant: 'primary',
              onClick: () => {
                handleSave();
                setDialog('none');
                clearEditor();
              },
            },
            {
              label: '破棄して新規',
              variant: 'danger',
              onClick: () => {
                setDialog('none');
                clearEditor();
              },
            },
            {
              label: 'キャンセル',
              onClick: () => setDialog('none'),
            },
          ]}
          onClose={() => setDialog('none')}
        />
      )}

      {dialog === 'save-notice' && (
        <Dialog
          title="保存完了"
          icon="info"
          message="ファイルを保存しました。"
          buttons={[{ label: 'OK', variant: 'primary', onClick: () => setDialog('none') }]}
          onClose={() => setDialog('none')}
        />
      )}
    </div>
  );
}
