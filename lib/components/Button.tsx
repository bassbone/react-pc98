'use client';

import React, { useState } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger';
  children: React.ReactNode;
}

export function Button({ variant = 'default', children, style, ...props }: ButtonProps) {
  const [pressed, setPressed] = useState(false);

  const bg =
    variant === 'primary' ? 'var(--pc98-dark-blue)' :
    variant === 'danger'  ? 'var(--pc98-dark-red)'  :
    'var(--pc98-light-gray)';

  const fg =
    variant === 'default' ? 'var(--pc98-black)' : 'var(--pc98-white)';

  return (
    <button
      {...props}
      onMouseDown={(e) => { setPressed(true); props.onMouseDown?.(e); }}
      onMouseUp={(e) => { setPressed(false); props.onMouseUp?.(e); }}
      onMouseLeave={(e) => { setPressed(false); props.onMouseLeave?.(e); }}
      style={{
        fontFamily: 'var(--pc98-font)',
        fontSize: 'var(--pc98-font-size)',
        backgroundColor: bg,
        color: fg,
        border: '2px solid',
        borderColor: pressed
          ? 'var(--pc98-dark-gray) var(--pc98-white) var(--pc98-white) var(--pc98-dark-gray)'
          : 'var(--pc98-white) var(--pc98-dark-gray) var(--pc98-dark-gray) var(--pc98-white)',
        padding: '4px 16px',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        outline: 'none',
        opacity: props.disabled ? 0.5 : 1,
        transform: pressed ? 'translate(1px, 1px)' : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
