'use client';

import React from 'react';
import { Button } from './Button';

export type DialogButton = {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
};

export interface DialogProps {
  title: string;
  message: React.ReactNode;
  buttons?: DialogButton[];
  icon?: 'info' | 'warn' | 'error' | 'question';
  onClose?: () => void;
}

const ICONS: Record<string, string> = {
  info:     '(i)',
  warn:     '/!\\',
  error:    '[X]',
  question: '(?)',
};

export function Dialog({ title, message, buttons = [], icon, onClose }: DialogProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        style={{
          minWidth: 300,
          maxWidth: 480,
          border: '2px solid',
          borderColor: 'var(--pc98-white) var(--pc98-dark-gray) var(--pc98-dark-gray) var(--pc98-white)',
          backgroundColor: 'var(--pc98-light-gray)',
          color: 'var(--pc98-black)',
          fontFamily: 'var(--pc98-font)',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            backgroundColor: 'var(--pc98-blue)',
            color: 'var(--pc98-white)',
            padding: '2px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{title}</span>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'var(--pc98-light-gray)',
                color: 'var(--pc98-black)',
                border: '1px solid var(--pc98-dark-gray)',
                width: 18,
                height: 18,
                cursor: 'pointer',
                fontFamily: 'var(--pc98-font)',
                fontSize: 12,
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {icon && (
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 14,
                color: icon === 'error' ? 'var(--pc98-dark-red)' :
                       icon === 'warn'  ? 'var(--pc98-brown)'     :
                       'var(--pc98-dark-blue)',
                whiteSpace: 'nowrap',
                paddingTop: 2,
              }}
            >
              {ICONS[icon]}
            </div>
          )}
          <div style={{ flex: 1 }}>{message}</div>
        </div>

        {/* Buttons */}
        {buttons.length > 0 && (
          <div
            style={{
              padding: '8px 16px 12px',
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            {buttons.map((btn, i) => (
              <Button key={i} variant={btn.variant} onClick={btn.onClick}>
                {btn.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
