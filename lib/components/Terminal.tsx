'use client';

import React, { useEffect, useRef } from 'react';

export interface TerminalLine {
  text: string;
  color?: string;
}

export interface TerminalProps {
  lines: TerminalLine[];
  prompt?: string;
  inputValue?: string;
  onInputChange?: (v: string) => void;
  onSubmit?: (v: string) => void;
  height?: number | string;
}

export function Terminal({
  lines,
  prompt = 'A>',
  inputValue = '',
  onInputChange,
  onSubmit,
  height = 240,
}: TerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        backgroundColor: 'var(--pc98-black)',
        color: 'var(--pc98-white)',
        fontFamily: 'var(--pc98-font)',
        fontSize: 'var(--pc98-font-size)',
        padding: 8,
        height,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'text',
        border: '2px solid',
        borderColor: 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)',
      }}
    >
      <div style={{ flex: 1 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ color: line.color ?? 'var(--pc98-white)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {onInputChange && (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
          <span style={{ marginRight: 4, color: 'var(--pc98-white)' }}>{prompt}</span>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSubmit?.(inputValue);
              }
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--pc98-white)',
              fontFamily: 'var(--pc98-font)',
              fontSize: 'var(--pc98-font-size)',
              caretColor: 'var(--pc98-white)',
            }}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
