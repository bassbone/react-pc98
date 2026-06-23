'use client';

import React, { useState, useRef, useCallback } from 'react';

export interface WindowProps {
  title: string;
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  x?: number;
  y?: number;
  draggable?: boolean;
  resizable?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
  active?: boolean;
}

export function Window({
  title,
  children,
  width = 400,
  height = 300,
  x = 20,
  y = 20,
  draggable = true,
  onClose,
  onMinimize,
  className = '',
  active = true,
}: WindowProps) {
  const [pos, setPos] = useState({ x, y });
  const [size, setSize] = useState({ width, height });
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });
  const resizing = useRef(false);
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });

  const onTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!draggable) return;
      e.preventDefault();
      dragging.current = true;
      dragStart.current = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y };

      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        setPos({
          x: dragStart.current.wx + ev.clientX - dragStart.current.mx,
          y: dragStart.current.wy + ev.clientY - dragStart.current.my,
        });
      };
      const onUp = () => {
        dragging.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [draggable, pos],
  );

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizing.current = true;
      resizeStart.current = {
        mx: e.clientX,
        my: e.clientY,
        w: typeof size.width === 'number' ? size.width : parseInt(size.width as string),
        h: typeof size.height === 'number' ? size.height : parseInt(size.height as string),
      };

      const onMove = (ev: MouseEvent) => {
        if (!resizing.current) return;
        setSize({
          width: Math.max(180, resizeStart.current.w + ev.clientX - resizeStart.current.mx),
          height: Math.max(120, resizeStart.current.h + ev.clientY - resizeStart.current.my),
        });
      };
      const onUp = () => {
        resizing.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [size],
  );

  const titleBg = active ? 'var(--pc98-blue)' : 'var(--pc98-dark-gray)';

  return (
    <div
      className={`pc98-window ${className}`}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: size.height,
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid',
        borderColor: 'var(--pc98-white) var(--pc98-dark-gray) var(--pc98-dark-gray) var(--pc98-white)',
        backgroundColor: 'var(--pc98-window-bg)',
        boxSizing: 'border-box',
      }}
    >
      {/* Title bar */}
      <div
        onMouseDown={onTitleMouseDown}
        style={{
          backgroundColor: titleBg,
          color: 'var(--pc98-white)',
          display: 'flex',
          alignItems: 'center',
          padding: '2px 4px',
          cursor: draggable ? 'move' : 'default',
          flexShrink: 0,
          userSelect: 'none',
          gap: 4,
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </span>
        {onMinimize && (
          <button
            onClick={onMinimize}
            style={titleButtonStyle}
            title="最小化"
          >
            ▼
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            style={titleButtonStyle}
            title="閉じる"
          >
            ×
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 8, position: 'relative' }}>
        {children}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={onResizeMouseDown}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 12,
          height: 12,
          cursor: 'se-resize',
          background: 'linear-gradient(135deg, transparent 40%, var(--pc98-light-gray) 40%)',
        }}
      />
    </div>
  );
}

const titleButtonStyle: React.CSSProperties = {
  background: 'var(--pc98-light-gray)',
  color: 'var(--pc98-black)',
  border: '1px solid',
  borderColor: 'var(--pc98-white) var(--pc98-dark-gray) var(--pc98-dark-gray) var(--pc98-white)',
  width: 18,
  height: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontFamily: 'var(--pc98-font)',
  fontSize: 12,
  padding: 0,
  flexShrink: 0,
};
