'use client';

import React, { useState } from 'react';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function TextInput({ label, style, ...props }: TextInputProps) {
  const [focused, setFocused] = useState(false);

  const input = (
    <input
      {...props}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
      style={{
        fontFamily: 'var(--pc98-font)',
        fontSize: 'var(--pc98-font-size)',
        backgroundColor: 'var(--pc98-black)',
        color: 'var(--pc98-white)',
        border: '2px solid',
        borderColor: focused
          ? 'var(--pc98-cyan)'
          : 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)',
        padding: '2px 6px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        caretColor: 'var(--pc98-white)',
        ...style,
      }}
    />
  );

  if (!label) return input;

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ color: 'var(--pc98-white)' }}>{label}</span>
      {input}
    </label>
  );
}
