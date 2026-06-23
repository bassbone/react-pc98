'use client';

import React from 'react';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  color = 'var(--pc98-blue)',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div style={{ fontFamily: 'var(--pc98-font)' }}>
      {(label || showPercent) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 4,
            color: 'var(--pc98-white)',
          }}
        >
          {label && <span>{label}</span>}
          {showPercent && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        style={{
          height: 20,
          border: '2px solid',
          borderColor: 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)',
          backgroundColor: 'var(--pc98-black)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: color,
            transition: 'width 0.2s',
          }}
        />
      </div>
    </div>
  );
}
