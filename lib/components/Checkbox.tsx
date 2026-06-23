'use client';

import React from 'react';

export interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ label, checked = false, onChange, disabled }: CheckboxProps) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--pc98-font)',
        color: disabled ? 'var(--pc98-dark-gray)' : 'var(--pc98-white)',
        userSelect: 'none',
      }}
    >
      <div
        onClick={() => !disabled && onChange?.(!checked)}
        style={{
          width: 14,
          height: 14,
          border: '2px solid',
          borderColor: 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)',
          backgroundColor: 'var(--pc98-black)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 12,
          color: 'var(--pc98-white)',
        }}
      >
        {checked && '✓'}
      </div>
      <span>{label}</span>
    </label>
  );
}
