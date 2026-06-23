'use client';

import React from 'react';

export interface DesktopProps {
  children: React.ReactNode;
  wallpaper?: 'dots' | 'grid' | 'solid' | 'scanlines';
  style?: React.CSSProperties;
}

const WALLPAPERS: Record<string, React.CSSProperties> = {
  solid: {
    backgroundColor: 'var(--pc98-dark-blue)',
  },
  dots: {
    backgroundColor: 'var(--pc98-dark-blue)',
    backgroundImage:
      'radial-gradient(circle, var(--pc98-blue) 1px, transparent 1px)',
    backgroundSize: '16px 16px',
  },
  grid: {
    backgroundColor: 'var(--pc98-dark-blue)',
    backgroundImage:
      'linear-gradient(var(--pc98-blue) 1px, transparent 1px), linear-gradient(90deg, var(--pc98-blue) 1px, transparent 1px)',
    backgroundSize: '32px 32px',
  },
  scanlines: {
    backgroundColor: 'var(--pc98-dark-blue)',
    backgroundImage:
      'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
  },
};

export function Desktop({ children, wallpaper = 'dots', style }: DesktopProps) {
  return (
    <div
      className="pc98-root"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...WALLPAPERS[wallpaper],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
