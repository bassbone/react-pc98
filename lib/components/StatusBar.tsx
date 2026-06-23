import React from 'react';

export interface StatusBarItem {
  text: string;
  flex?: number;
  align?: 'left' | 'center' | 'right';
}

export interface StatusBarProps {
  items: StatusBarItem[];
}

export function StatusBar({ items }: StatusBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: 'var(--pc98-light-gray)',
        color: 'var(--pc98-black)',
        borderTop: '2px solid',
        borderColor: 'var(--pc98-white) transparent transparent var(--pc98-white)',
        fontFamily: 'var(--pc98-font)',
        fontSize: 14,
        userSelect: 'none',
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            flex: item.flex ?? 1,
            padding: '2px 8px',
            textAlign: item.align ?? 'left',
            borderRight: i < items.length - 1 ? '1px solid var(--pc98-dark-gray)' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
