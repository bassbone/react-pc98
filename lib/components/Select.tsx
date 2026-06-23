'use client';

import React, { useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function Select({ options, value, onChange, label, disabled, style }: SelectProps) {
  const [focused, setFocused] = useState(false);

  const select = (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        fontFamily: 'var(--pc98-font)',
        fontSize: 'var(--pc98-font-size)',
        backgroundColor: 'var(--pc98-black)',
        color: 'var(--pc98-white)',
        border: '2px solid',
        borderColor: focused
          ? 'var(--pc98-cyan)'
          : 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)',
        padding: '2px 4px',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: '100%',
        ...style,
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  if (!label) return select;

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--pc98-font)', color: 'var(--pc98-white)' }}>
      <span>{label}</span>
      {select}
    </label>
  );
}
